import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { Router, type NextFunction, type Request, type Response } from "express";
import { DatabaseSync } from "node:sqlite";

const ALLOWED_KEYS = new Set([
  "articles",
  "products",
  "categories",
  "services",
  "projects",
  "companyInfo",
  "heroCms",
]);
const MAX_BYTES = 2_000_000;
const WRITE_LIMIT = 30;
const WRITE_WINDOW_MS = 10 * 60 * 1000;

const writeHits: { ip: string; at: number }[] = [];
let writeTail: Promise<void> = Promise.resolve();

function dataDir(): string {
  return path.resolve(process.env.DATA_DIR || "/opt/toyooran-data");
}

function dbPath(): string {
  return path.join(dataDir(), "toyooran.sqlite");
}

function expectedHash(): string | null {
  const fromEnv = (process.env.CMS_API_TOKEN_SHA256 || "").trim().toLowerCase();
  if (/^[a-f0-9]{64}$/.test(fromEnv)) return fromEnv;
  const file = (process.env.CMS_API_TOKEN_SHA256_FILE || path.join(dataDir(), "cms-api.sha256")).trim();
  try {
    const text = fs.readFileSync(file, "utf8").trim().toLowerCase().split(/\s+/)[0] || "";
    if (/^[a-f0-9]{64}$/.test(text)) return text;
  } catch {
    /* token hash is not configured */
  }
  return null;
}

function bearerToken(req: Request): string | null {
  const header = req.headers.authorization;
  if (typeof header !== "string") return null;
  const match = /^Bearer (.+)$/i.exec(header);
  if (!match) return null;
  const token = match[1];
  if (!token || token.length > 512 || /\s/.test(token)) return null;
  return token;
}

function tokenMatches(presented: string): boolean {
  const hex = expectedHash();
  if (!hex) return false;
  const actual = crypto.createHash("sha256").update(presented, "utf8").digest();
  const expected = Buffer.from(hex, "hex");
  if (expected.length !== actual.length) return false;
  return crypto.timingSafeEqual(actual, expected);
}

function requireCmsAuth(req: Request, res: Response, next: NextFunction) {
  const token = bearerToken(req);
  if (!token || !tokenMatches(token)) {
    res.status(401).end();
    return;
  }
  next();
}

function jsonKind(value: unknown): "array" | "object" | "other" {
  if (Array.isArray(value)) return "array";
  if (value !== null && typeof value === "object") return "object";
  return "other";
}

function openDb(): DatabaseSync {
  const db = new DatabaseSync(dbPath());
  db.exec("PRAGMA busy_timeout = 5000");
  return db;
}

function readState(key: string): unknown | undefined {
  const db = openDb();
  try {
    const row = db.prepare("SELECT state_json FROM admin_state WHERE state_key = ?").get(key) as
      | { state_json?: string }
      | undefined;
    if (!row?.state_json) return undefined;
    return JSON.parse(row.state_json) as unknown;
  } finally {
    db.close();
  }
}

function writeState(key: string, serialized: string): string {
  const updatedAt = new Date().toISOString();
  const db = openDb();
  try {
    db.exec("BEGIN IMMEDIATE");
    db.prepare(
      "INSERT INTO admin_state(state_key, state_json, updated_at) VALUES(?, ?, ?) ON CONFLICT(state_key) DO UPDATE SET state_json = excluded.state_json, updated_at = excluded.updated_at"
    ).run(key, serialized, updatedAt);
    db.exec("COMMIT");
  } catch (error) {
    try {
      db.exec("ROLLBACK");
    } catch {
      /* transaction already closed */
    }
    throw error;
  } finally {
    db.close();
  }
  return updatedAt;
}

function backupDatabase(key: string): string {
  const dir = path.join(dataDir(), "backups");
  fs.mkdirSync(dir, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const dest = path.join(dir, `cms-api-${key}-${stamp}.sqlite`);
  if (dest.includes("'")) throw new Error("backup path");
  const db = openDb();
  try {
    db.exec(`VACUUM INTO '${dest}'`);
  } finally {
    db.close();
  }
  return dest;
}

function oneLine(value: string): string {
  return value.replace(/[\r\n\t]/g, " ").slice(0, 300);
}

function appendAudit(entry: { key: string; id: string; ip: string; size: number; backup: string }) {
  const line = [
    new Date().toISOString(),
    `key=${oneLine(entry.key)}`,
    `id=${oneLine(entry.id)}`,
    `ip=${oneLine(entry.ip)}`,
    `size=${entry.size}`,
    `backup=${oneLine(entry.backup)}`,
  ].join(" ");
  fs.appendFileSync(path.join(dataDir(), "cms-api-audit.log"), `${line}\n`, { encoding: "utf8", mode: 0o600 });
}

function takeWriteSlot(ip: string): boolean {
  const now = Date.now();
  while (writeHits.length > 0 && writeHits[0].at <= now - WRITE_WINDOW_MS) writeHits.shift();
  const used = writeHits.reduce((count, hit) => count + (hit.ip === ip ? 1 : 0), 0);
  if (used >= WRITE_LIMIT) return false;
  writeHits.push({ ip, at: now });
  return true;
}

function withWriteLock<T>(fn: () => T): Promise<T> {
  const run = writeTail.then(() => fn());
  writeTail = run.then(
    () => undefined,
    () => undefined
  );
  return run;
}

function clientIp(req: Request): string {
  return req.ip || "unknown";
}

function safeId(raw: unknown): string | null {
  const id = String(raw ?? "").trim();
  if (!id || id.length > 200 || /[\u0000\r\n]/.test(id)) return null;
  return id;
}

function articleRecord(body: unknown, id: string): Record<string, unknown> | null {
  if (body === null || typeof body !== "object" || Array.isArray(body)) return null;
  const record = body as Record<string, unknown>;
  if (record.id !== undefined && String(record.id) !== id) return null;
  return { ...record, id };
}

function findArticle(list: unknown[], id: string): number {
  return list.findIndex((item) => {
    if (item === null || typeof item !== "object" || Array.isArray(item)) return false;
    return String((item as { id?: unknown }).id) === id;
  });
}

async function runWrite(res: Response, fn: () => void) {
  try {
    await withWriteLock(fn);
  } catch {
    if (!res.headersSent) res.status(500).json({ ok: false });
  }
}

export const cmsApiRouter = Router();

cmsApiRouter.use(requireCmsAuth);

cmsApiRouter.get("/state/:key", (req, res) => {
  const key = String(req.params.key);
  if (!ALLOWED_KEYS.has(key)) {
    res.status(403).json({ ok: false });
    return;
  }
  const value = readState(key);
  if (value === undefined) {
    res.status(404).json({ ok: false });
    return;
  }
  res.setHeader("Cache-Control", "no-store");
  res.json(value);
});

cmsApiRouter.put("/state/:key", (req, res) => {
  const key = String(req.params.key);
  if (!ALLOWED_KEYS.has(key)) {
    res.status(403).json({ ok: false });
    return;
  }
  void runWrite(res, () => {
    const current = readState(key);
    const nextKind = jsonKind(req.body);
    if (current === undefined) {
      res.status(404).json({ ok: false });
      return;
    }
    if (nextKind === "other" || nextKind !== jsonKind(current)) {
      res.status(400).json({ ok: false });
      return;
    }
    const serialized = JSON.stringify(req.body);
    if (Buffer.byteLength(serialized) > MAX_BYTES) {
      res.status(413).json({ ok: false });
      return;
    }
    if (!takeWriteSlot(clientIp(req))) {
      res.status(429).json({ ok: false });
      return;
    }
    const backup = backupDatabase(key);
    const updatedAt = writeState(key, serialized);
    appendAudit({ key, id: "-", ip: clientIp(req), size: Buffer.byteLength(serialized), backup });
    res.setHeader("Cache-Control", "no-store");
    res.json({ ok: true, backup, updated_at: updatedAt });
  });
});

cmsApiRouter.put("/articles/:id", (req, res) => {
  const id = safeId(req.params.id);
  const article = id ? articleRecord(req.body, id) : null;
  if (!id || !article) {
    res.status(400).json({ ok: false });
    return;
  }
  void runWrite(res, () => {
    if (!Array.isArray(readState("articles"))) {
      res.status(409).json({ ok: false });
      return;
    }
    if (!takeWriteSlot(clientIp(req))) {
      res.status(429).json({ ok: false });
      return;
    }
    const backup = backupDatabase("articles");
    const latest = readState("articles");
    if (!Array.isArray(latest)) {
      res.status(409).json({ ok: false });
      return;
    }
    const next = latest.slice();
    const index = findArticle(next, id);
    if (index === -1) next.push(article);
    else next[index] = article;
    const serialized = JSON.stringify(next);
    if (Buffer.byteLength(serialized) > MAX_BYTES) {
      res.status(413).json({ ok: false });
      return;
    }
    const updatedAt = writeState("articles", serialized);
    appendAudit({ key: "articles", id, ip: clientIp(req), size: Buffer.byteLength(serialized), backup });
    res.setHeader("Cache-Control", "no-store");
    res.json({ ok: true, backup, updated_at: updatedAt });
  });
});

cmsApiRouter.delete("/articles/:id", (req, res) => {
  const id = safeId(req.params.id);
  if (!id) {
    res.status(400).json({ ok: false });
    return;
  }
  if (String(req.query.confirm || "") !== "1") {
    res.status(400).json({ ok: false });
    return;
  }
  void runWrite(res, () => {
    if (!Array.isArray(readState("articles"))) {
      res.status(409).json({ ok: false });
      return;
    }
    if (!takeWriteSlot(clientIp(req))) {
      res.status(429).json({ ok: false });
      return;
    }
    const backup = backupDatabase("articles");
    const latest = readState("articles");
    if (!Array.isArray(latest)) {
      res.status(409).json({ ok: false });
      return;
    }
    const next = latest.slice();
    const index = findArticle(next, id);
    if (index === -1) {
      res.status(404).json({ ok: false });
      return;
    }
    next.splice(index, 1);
    const serialized = JSON.stringify(next);
    const updatedAt = writeState("articles", serialized);
    appendAudit({ key: "articles", id, ip: clientIp(req), size: Buffer.byteLength(serialized), backup });
    res.setHeader("Cache-Control", "no-store");
    res.json({ ok: true, backup, updated_at: updatedAt });
  });
});

cmsApiRouter.use((_req, res) => {
  res.status(404).json({ ok: false });
});
