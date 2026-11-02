import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import bcrypt from 'bcryptjs';
import { DatabaseSync } from 'node:sqlite';
import { generateSecret, generateURI, verify } from 'otplib';
import type { NextFunction, Request, Response } from 'express';
import dotenv from 'dotenv';
import type { AdminRole, AdminSection, ManagedAdminUser } from '../src/types';

dotenv.config();
dotenv.config({ path: '/etc/toyooran.env', override: false });

const dataDir = path.resolve(process.env.DATA_DIR || './data');
fs.mkdirSync(dataDir, { recursive: true });
const db = new DatabaseSync(path.join(dataDir, 'toyooran.sqlite'));
db.exec('PRAGMA journal_mode = WAL');
db.exec('PRAGMA foreign_keys = ON');
db.exec('PRAGMA busy_timeout = 5000');

/** A permission grants every operation in one CMS area. */
export const ADMIN_PERMISSIONS: AdminSection[] = [
  'overview', 'products', 'projects', 'services', 'articles', 'categories',
  'company', 'hero', 'layout', 'pages', 'media', 'quotes', 'consultations', 'customers',
  'ai', 'backup', 'security', 'users',
];
const SUPERADMIN_ROLE_ID = 'superadmin';
const CONTENT_MANAGER_ROLE_ID = 'content-manager';
const now = () => new Date().toISOString();
const allPermissions = () => [...ADMIN_PERMISSIONS];

db.exec(`
  CREATE TABLE IF NOT EXISTS admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'superadmin',
    mfa_secret TEXT,
    mfa_enabled INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS sessions (
    id_hash TEXT PRIMARY KEY,
    admin_id INTEGER NOT NULL REFERENCES admins(id) ON DELETE CASCADE,
    mfa_verified INTEGER NOT NULL DEFAULT 1,
    expires_at INTEGER NOT NULL,
    created_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS admin_state (
    state_key TEXT PRIMARY KEY,
    state_json TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS audit_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    admin_id INTEGER,
    action TEXT NOT NULL,
    target TEXT,
    ip TEXT,
    user_agent TEXT,
    created_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS mfa_recovery_codes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    admin_id INTEGER NOT NULL,
    code_hash TEXT NOT NULL UNIQUE,
    created_at TEXT NOT NULL,
    used_at TEXT
  );
  CREATE TABLE IF NOT EXISTS password_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    admin_id INTEGER NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS rate_limits (
    rate_key TEXT PRIMARY KEY,
    count INTEGER NOT NULL,
    reset_at INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS admin_roles (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    permissions_json TEXT NOT NULL,
    is_superadmin INTEGER NOT NULL DEFAULT 0,
    is_system INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
`);

function addColumn(sql: string) {
  try { db.exec(sql); } catch { /* old installations already migrated */ }
}
addColumn("ALTER TABLE admins ADD COLUMN role_id TEXT");
addColumn("ALTER TABLE admins ADD COLUMN display_name TEXT");
addColumn("ALTER TABLE admins ADD COLUMN is_active INTEGER NOT NULL DEFAULT 1");
addColumn("ALTER TABLE admins ADD COLUMN last_login_at TEXT");
addColumn('ALTER TABLE sessions ADD COLUMN mfa_verified INTEGER NOT NULL DEFAULT 1');

function normalizePermissions(value: unknown): AdminSection[] {
  if (!Array.isArray(value)) return [];
  const allowed = new Set(ADMIN_PERMISSIONS);
  return [...new Set(value.filter((item): item is AdminSection => typeof item === 'string' && allowed.has(item as AdminSection)))];
}
const permissionsJson = (value: unknown) => JSON.stringify(normalizePermissions(value));

function ensureRole(id: string, name: string, permissions: AdminSection[], superadmin = false, system = false) {
  const exists = db.prepare('SELECT id FROM admin_roles WHERE id=?').get(id) as { id?: string } | undefined;
  if (!exists) {
    db.prepare('INSERT INTO admin_roles(id,name,permissions_json,is_superadmin,is_system,created_at,updated_at) VALUES(?,?,?,?,?,?,?)')
      .run(id, name, JSON.stringify(permissions), superadmin ? 1 : 0, system ? 1 : 0, now(), now());
  } else if (id === SUPERADMIN_ROLE_ID) {
    // Never allow a legacy database to weaken the only master role.
    db.prepare('UPDATE admin_roles SET permissions_json=?,is_superadmin=1,is_system=1,updated_at=? WHERE id=?')
      .run(JSON.stringify(allPermissions()), now(), id);
  } else if (id === CONTENT_MANAGER_ROLE_ID) {
    // Keep the shipped editor role in sync with newly added CMS areas. Custom roles
    // are never changed here.
    db.prepare('UPDATE admin_roles SET permissions_json=?,updated_at=? WHERE id=?')
      .run(JSON.stringify(permissions), now(), id);
  }
}
ensureRole(SUPERADMIN_ROLE_ID, 'مدیرکل', allPermissions(), true, true);
ensureRole(CONTENT_MANAGER_ROLE_ID, 'مدیر محتوا', ['overview', 'products', 'projects', 'services', 'articles', 'categories', 'company', 'hero', 'layout', 'pages', 'media']);

db.prepare("UPDATE admins SET role_id=? WHERE (role_id IS NULL OR role_id='') AND role='superadmin'").run(SUPERADMIN_ROLE_ID);
db.prepare("UPDATE admins SET role_id=? WHERE role_id IS NULL OR role_id=''").run(CONTENT_MANAGER_ROLE_ID);
db.prepare("UPDATE admins SET display_name=username WHERE display_name IS NULL OR trim(display_name)=''").run();
db.prepare('UPDATE admins SET is_active=1 WHERE is_active IS NULL').run();
// Password-only sign-in: retire previously enrolled authenticators and pending
// challenges so existing master accounts are not locked behind a phone.
db.prepare('UPDATE admins SET mfa_secret=NULL,mfa_enabled=0 WHERE mfa_enabled<>0 OR mfa_secret IS NOT NULL').run();
db.prepare('DELETE FROM mfa_recovery_codes').run();
db.prepare('UPDATE sessions SET mfa_verified=1 WHERE mfa_verified<>1').run();

const bootstrapPassword = process.env.ADMIN_BOOTSTRAP_PASSWORD;
const bootstrapUser = (process.env.ADMIN_USERNAME || 'admin').trim();
if (!db.prepare('SELECT id FROM admins LIMIT 1').get() && bootstrapPassword) {
  if (bootstrapPassword.length < 16) throw new Error('ADMIN_BOOTSTRAP_PASSWORD must be at least 16 characters');
  db.prepare('INSERT INTO admins(username,password_hash,role,role_id,display_name,is_active,created_at) VALUES(?,?,?,?,?,?,?)')
    .run(bootstrapUser, bcrypt.hashSync(bootstrapPassword, 12), 'superadmin', SUPERADMIN_ROLE_ID, 'مدیرکل سیستم', 1, now());
}

const SESSION_TTL_SECONDS = 8 * 60 * 60;
const hashToken = (token: string) => crypto.createHash('sha256').update(token).digest('hex');
const hashRecoveryCode = (code: string) => crypto.createHash('sha256').update(code.replace(/-/g, '').toUpperCase()).digest('hex');

type DbSessionRow = {
  id: number; username: string; display_name?: string; role_id?: string; legacy_role?: string;
  is_active?: number; mfa_enabled: number; mfa_verified: number; role_name?: string;
  permissions_json?: string; is_superadmin?: number;
};
export type AdminIdentity = {
  id: number; username: string; displayName: string; role: string; roleId: string;
  permissions: AdminSection[]; isSuperadmin: boolean; mfaEnabled: boolean;
};
export type AdminRequest = Request & { admin?: AdminIdentity };

function rowToIdentity(row: DbSessionRow): AdminIdentity {
  const isSuperadmin = Boolean(row.is_superadmin) || row.role_id === SUPERADMIN_ROLE_ID || row.legacy_role === 'superadmin';
  let permissions: AdminSection[] = [];
  try { permissions = normalizePermissions(JSON.parse(row.permissions_json || '[]')); } catch { /* corrupt role gets no permissions */ }
  return {
    id: row.id,
    username: row.username,
    displayName: row.display_name?.trim() || row.username,
    role: row.role_name?.trim() || (isSuperadmin ? 'مدیرکل' : row.legacy_role || 'بدون نقش'),
    roleId: row.role_id || (isSuperadmin ? SUPERADMIN_ROLE_ID : CONTENT_MANAGER_ROLE_ID),
    permissions: isSuperadmin ? allPermissions() : permissions,
    isSuperadmin,
    mfaEnabled: Boolean(row.mfa_enabled),
  };
}
function sessionRow(req: AdminRequest): DbSessionRow | null {
  const token = req.cookies?.toyooran_admin_session;
  if (typeof token !== 'string' || !token) return null;
  return (db.prepare(`
    SELECT a.id,a.username,a.display_name,a.role_id,a.role AS legacy_role,a.is_active,
           a.mfa_enabled,s.mfa_verified,r.name AS role_name,r.permissions_json,r.is_superadmin
      FROM sessions s JOIN admins a ON a.id=s.admin_id
 LEFT JOIN admin_roles r ON r.id=a.role_id
     WHERE s.id_hash=? AND s.expires_at>?
  `).get(hashToken(token), Math.floor(Date.now() / 1000)) as DbSessionRow | undefined) || null;
}
function issueSession(adminId: number, res: Response, mfaVerified: boolean) {
  const token = crypto.randomBytes(32).toString('base64url');
  db.prepare('INSERT INTO sessions(id_hash,admin_id,mfa_verified,expires_at,created_at) VALUES(?,?,?,?,?)')
    .run(hashToken(token), adminId, mfaVerified ? 1 : 0, Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS, now());
  res.cookie('toyooran_admin_session', token, {
    httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict',
    maxAge: SESSION_TTL_SECONDS * 1000, path: '/',
  });
}
const mfaEnrollmentNeeded = (admin: AdminIdentity) => admin.isSuperadmin && !admin.mfaEnabled;

export function hasPermission(admin: AdminIdentity | undefined, permission: AdminSection): boolean {
  return Boolean(admin?.isSuperadmin || admin?.permissions.includes(permission));
}
export function requireAdmin(req: AdminRequest, res: Response, next: NextFunction) {
  const row = sessionRow(req);
  if (!row || !row.is_active) return res.status(401).json({ error: 'نشست منقضی، غیرفعال یا نامعتبر است.' });
  const admin = rowToIdentity(row);
  req.admin = admin;
  next();
}
/** Compatibility helper. New routes use requirePermission. */
export function requireRole(...roles: string[]) {
  return (req: AdminRequest, res: Response, next: NextFunction) => {
    if (!req.admin || (!req.admin.isSuperadmin && !roles.includes(req.admin.role) && !roles.includes(req.admin.roleId))) {
      return res.status(403).json({ error: 'دسترسی کافی نیست.' });
    }
    next();
  };
}
export function requireSuperadmin(req: AdminRequest, res: Response, next: NextFunction) {
  if (!req.admin?.isSuperadmin) return res.status(403).json({ error: 'این عملیات فقط برای مدیرکل مجاز است.' });
  next();
}
export function requirePermission(permission: AdminSection) {
  return (req: AdminRequest, res: Response, next: NextFunction) => {
    if (!hasPermission(req.admin, permission)) return res.status(403).json({ error: 'دسترسی به این بخش ندارید.' });
    next();
  };
}
export function requireMfaPending(req: AdminRequest, res: Response, next: NextFunction) {
  const row = sessionRow(req);
  if (!row || !row.is_active || !row.mfa_enabled || row.mfa_verified) return res.status(401).json({ error: 'چالش MFA نامعتبر است.' });
  req.admin = rowToIdentity(row);
  next();
}
/** A master account must enroll MFA before it can use the CMS. */
export function requireMfaEnrollment(req: AdminRequest, res: Response, next: NextFunction) {
  const row = sessionRow(req);
  if (!row || !row.is_active) return res.status(401).json({ error: 'نشست نامعتبر است.' });
  const admin = rowToIdentity(row);
  if (!mfaEnrollmentNeeded(admin)) return res.status(400).json({ error: 'فعال‌سازی MFA برای این نشست لازم نیست.' });
  req.admin = admin;
  next();
}

function turnstileSecret(): string {
  const secret = (process.env.TURNSTILE_SECRET_KEY || '').trim();
  return !secret || secret === 'AI_STUDIO_PREVIEW_DISABLED' || secret.startsWith('replace-with-') ? '' : secret;
}
export function publicTurnstileSiteKey(): string {
  const key = (process.env.TURNSTILE_SITE_KEY || process.env.VITE_TURNSTILE_SITE_KEY || '').trim();
  return !key || key === 'AI_STUDIO_PREVIEW_DISABLED' || key.startsWith('replace-with-') ? '' : key;
}
async function verifyTurnstile(token: string | undefined, ip: string | undefined) {
  const secret = turnstileSecret();
  if (!secret) return true;
  if (!token) return false;
  try {
    const result = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret, response: token, remoteip: ip }),
    });
    return ((await result.json()) as { success?: boolean }).success === true;
  } catch { return false; }
}
export function audit(req: AdminRequest, action: string, target = '') {
  db.prepare('INSERT INTO audit_log(admin_id,action,target,ip,user_agent,created_at) VALUES(?,?,?,?,?,?)')
    .run(req.admin?.id ?? null, action, target, req.ip, req.get('user-agent')?.slice(0, 300) || '', now());
}
export function consumeRateLimit(rateKey: string, limit: number, windowMs: number) {
  const timestamp = Date.now();
  const row = db.prepare('SELECT count,reset_at FROM rate_limits WHERE rate_key=?').get(rateKey) as { count: number; reset_at: number } | undefined;
  const next = !row || row.reset_at <= timestamp ? { count: 1, resetAt: timestamp + windowMs } : { count: row.count + 1, resetAt: row.reset_at };
  db.prepare('INSERT INTO rate_limits(rate_key,count,reset_at) VALUES(?,?,?) ON CONFLICT(rate_key) DO UPDATE SET count=excluded.count,reset_at=excluded.reset_at')
    .run(rateKey, next.count, next.resetAt);
  return { allowed: next.count <= limit, retryAfterMs: Math.max(0, next.resetAt - timestamp) };
}
export function resetRateLimit(rateKey: string) { db.prepare('DELETE FROM rate_limits WHERE rate_key=?').run(rateKey); }

export async function loginAdmin(username: string, password: string, turnstileToken: string | undefined, ip: string | undefined, res: Response) {
  const row = db.prepare(`
    SELECT a.id,a.username,a.display_name,a.role_id,a.role AS legacy_role,a.is_active,a.mfa_enabled,
           r.name AS role_name,r.permissions_json,r.is_superadmin
      FROM admins a LEFT JOIN admin_roles r ON r.id=a.role_id WHERE a.username=?
  `).get(username.trim()) as DbSessionRow | undefined;
  const credential = row ? db.prepare('SELECT password_hash FROM admins WHERE id=?').get(row.id) as { password_hash?: string } | undefined : undefined;
  if (!row || !row.is_active || !credential?.password_hash || !bcrypt.compareSync(password, credential.password_hash)) {
    return { success: false, error: 'نام کاربری یا رمز عبور نادرست است.' };
  }
  const admin = rowToIdentity({ ...row, mfa_verified: 0 });
  issueSession(admin.id, res, true);
  db.prepare('UPDATE admins SET last_login_at=? WHERE id=?').run(now(), admin.id);
  return { success: true };
}
export async function verifyMfaSession(req: AdminRequest, token: string) {
  const row = sessionRow(req);
  if (!row || !row.mfa_enabled || !req.admin) return false;
  const secret = db.prepare('SELECT mfa_secret FROM admins WHERE id=?').get(req.admin.id) as { mfa_secret?: string } | undefined;
  let valid = false;
  if (/^\d{6}$/.test(token) && secret?.mfa_secret) {
    try {
      const result = await verify({ secret: secret.mfa_secret, token });
      valid = typeof result === 'boolean' ? result : result.valid;
    } catch { valid = false; }
  }
  if (!valid) {
    const recovery = db.prepare('SELECT id FROM mfa_recovery_codes WHERE admin_id=? AND code_hash=? AND used_at IS NULL')
      .get(req.admin.id, hashRecoveryCode(token)) as { id: number } | undefined;
    if (recovery) {
      db.prepare('UPDATE mfa_recovery_codes SET used_at=? WHERE id=?').run(now(), recovery.id);
      valid = true;
      audit(req, 'mfa_recovery_used');
    }
  }
  if (!valid) return false;
  db.prepare('UPDATE sessions SET mfa_verified=1 WHERE id_hash=?').run(hashToken(String(req.cookies?.toyooran_admin_session || '')));
  return true;
}
export function logoutAdmin(req: AdminRequest, res: Response) {
  const token = req.cookies?.toyooran_admin_session;
  if (typeof token === 'string') db.prepare('DELETE FROM sessions WHERE id_hash=?').run(hashToken(token));
  audit(req, 'logout');
  res.clearCookie('toyooran_admin_session', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', path: '/' });
}
export function changePassword(req: AdminRequest, oldPassword: string, newPassword: string) {
  if (newPassword.length < 16 || !req.admin) return false;
  const row = db.prepare('SELECT password_hash FROM admins WHERE id=?').get(req.admin.id) as { password_hash?: string } | undefined;
  if (!row?.password_hash || !bcrypt.compareSync(oldPassword, row.password_hash)) return false;
  const history = db.prepare('SELECT password_hash FROM password_history WHERE admin_id=? ORDER BY id DESC LIMIT 5').all(req.admin.id) as { password_hash: string }[];
  if (history.some((item) => bcrypt.compareSync(newPassword, item.password_hash)) || bcrypt.compareSync(newPassword, row.password_hash)) return false;
  const nextHash = bcrypt.hashSync(newPassword, 12);
  db.prepare('INSERT INTO password_history(admin_id,password_hash,created_at) VALUES(?,?,?)').run(req.admin.id, row.password_hash, now());
  db.prepare('UPDATE admins SET password_hash=? WHERE id=?').run(nextHash, req.admin.id);
  db.prepare('DELETE FROM sessions WHERE admin_id=?').run(req.admin.id);
  audit(req, 'change_password');
  return true;
}
export function listSessions(req: AdminRequest) {
  return db.prepare('SELECT created_at,expires_at FROM sessions WHERE admin_id=? ORDER BY created_at DESC').all(req.admin?.id);
}
export function revokeAllSessions(req: AdminRequest) {
  if (req.admin) db.prepare('DELETE FROM sessions WHERE admin_id=?').run(req.admin.id);
}
export function getAdminState(key: string) {
  const row = db.prepare('SELECT state_json FROM admin_state WHERE state_key=?').get(key) as { state_json?: string } | undefined;
  if (!row?.state_json) return null;
  try { return JSON.parse(row.state_json); } catch { return null; }
}
export function getAdminStateUpdatedAt(key: string): string | null {
  const row = db.prepare('SELECT updated_at FROM admin_state WHERE state_key=?').get(key) as { updated_at?: string } | undefined;
  return row?.updated_at ? row.updated_at.slice(0, 10) : null;
}
export function setAdminState(req: AdminRequest, key: string, value: unknown) {
  db.prepare('INSERT INTO admin_state(state_key,state_json,updated_at) VALUES(?,?,?) ON CONFLICT(state_key) DO UPDATE SET state_json=excluded.state_json,updated_at=excluded.updated_at')
    .run(key, JSON.stringify(value), now());
  audit(req, 'state_update', key);
}
export const ADMIN_STATE_PERMISSIONS: Record<string, AdminSection> = {
  products: 'products', projects: 'projects', services: 'services', articles: 'articles', categories: 'categories',
  companyInfo: 'company', heroCms: 'hero', siteLayout: 'layout', pageContent: 'pages', aiConfig: 'ai', quotes: 'quotes',
  consultations: 'consultations', customers: 'customers', media: 'media',
};
export const permissionForState = (key: string): AdminSection | null => ADMIN_STATE_PERMISSIONS[key] || null;

export function startMfaSetup(adminId: number, label = 'admin') {
  const secret = generateSecret();
  const recoveryCodes = Array.from({ length: 10 }, () => {
    const raw = crypto.randomBytes(10).toString('hex').toUpperCase();
    return `${raw.slice(0, 5)}-${raw.slice(5, 10)}-${raw.slice(10, 15)}-${raw.slice(15)}`;
  });
  db.prepare('UPDATE admins SET mfa_secret=?,mfa_enabled=0 WHERE id=?').run(secret, adminId);
  db.prepare('DELETE FROM mfa_recovery_codes WHERE admin_id=?').run(adminId);
  const insert = db.prepare('INSERT INTO mfa_recovery_codes(admin_id,code_hash,created_at) VALUES(?,?,?)');
  for (const code of recoveryCodes) insert.run(adminId, hashRecoveryCode(code), now());
  return { secret, uri: generateURI({ issuer: 'Toyooran', label, secret }), recoveryCodes };
}
export async function confirmMfa(adminId: number, token: string) {
  const row = db.prepare('SELECT mfa_secret FROM admins WHERE id=?').get(adminId) as { mfa_secret?: string } | undefined;
  if (!row?.mfa_secret || !/^\d{6}$/.test(token)) return false;
  try {
    const result = await verify({ secret: row.mfa_secret, token });
    if (!(typeof result === 'boolean' ? result : result.valid)) return false;
  } catch { return false; }
  db.prepare('UPDATE admins SET mfa_enabled=1 WHERE id=?').run(adminId);
  db.prepare('UPDATE sessions SET mfa_verified=1 WHERE admin_id=?').run(adminId);
  return true;
}
export function createCsrfToken(res: Response) {
  const token = crypto.randomBytes(32).toString('base64url');
  res.cookie('toyooran_csrf', token, { httpOnly: false, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', maxAge: SESSION_TTL_SECONDS * 1000, path: '/' });
  return token;
}
export function verifyCsrf(req: Request) {
  const cookie = req.cookies?.toyooran_csrf;
  const header = req.get('x-csrf-token');
  return typeof cookie === 'string' && typeof header === 'string' && cookie.length === header.length && crypto.timingSafeEqual(Buffer.from(cookie), Buffer.from(header));
}

type RoleRow = { id: string; name: string; permissions_json: string; is_superadmin: number; is_system: number; created_at: string; updated_at: string; };
function roleRowToPublic(row: RoleRow): AdminRole {
  let permissions: AdminSection[] = [];
  try { permissions = normalizePermissions(JSON.parse(row.permissions_json || '[]')); } catch { /* no permissions */ }
  return {
    id: row.id, name: row.name, permissions: row.is_superadmin ? allPermissions() : permissions,
    isSuperadmin: Boolean(row.is_superadmin), isSystem: Boolean(row.is_system), createdAt: row.created_at, updatedAt: row.updated_at,
  };
}
function readRole(id: string): RoleRow | null {
  return (db.prepare('SELECT id,name,permissions_json,is_superadmin,is_system,created_at,updated_at FROM admin_roles WHERE id=?').get(id) as RoleRow | undefined) || null;
}
export function listAdminRoles(): AdminRole[] {
  return (db.prepare('SELECT id,name,permissions_json,is_superadmin,is_system,created_at,updated_at FROM admin_roles ORDER BY is_system DESC,name COLLATE NOCASE').all() as RoleRow[]).map(roleRowToPublic);
}
export function createAdminRole(input: { name: string; permissions: unknown }): AdminRole {
  const name = input.name.trim();
  if (name.length < 2 || name.length > 80) throw new Error('نام نقش باید بین ۲ تا ۸۰ نویسه باشد.');
  const id = `role_${crypto.randomBytes(12).toString('hex')}`;
  try {
    db.prepare('INSERT INTO admin_roles(id,name,permissions_json,is_superadmin,is_system,created_at,updated_at) VALUES(?,?,?,?,?,?,?)')
      .run(id, name, permissionsJson(input.permissions), 0, 0, now(), now());
  } catch (error: any) {
    if (String(error?.message || '').includes('UNIQUE')) throw new Error('نقشی با این نام از قبل وجود دارد.');
    throw error;
  }
  return roleRowToPublic(readRole(id)!);
}
export function updateAdminRole(id: string, input: { name: string; permissions: unknown }): AdminRole {
  const previous = readRole(id);
  if (!previous) throw new Error('نقش پیدا نشد.');
  const name = input.name.trim();
  if (name.length < 2 || name.length > 80) throw new Error('نام نقش باید بین ۲ تا ۸۰ نویسه باشد.');
  const permissions = previous.is_system ? allPermissions() : normalizePermissions(input.permissions);
  try {
    db.prepare('UPDATE admin_roles SET name=?,permissions_json=?,updated_at=? WHERE id=?').run(name, JSON.stringify(permissions), now(), id);
  } catch (error: any) {
    if (String(error?.message || '').includes('UNIQUE')) throw new Error('نقشی با این نام از قبل وجود دارد.');
    throw error;
  }
  return roleRowToPublic(readRole(id)!);
}
export function deleteAdminRole(id: string) {
  const role = readRole(id);
  if (!role) throw new Error('نقش پیدا نشد.');
  if (role.is_system) throw new Error('نقش مدیرکل حذف‌شدنی نیست.');
  const used = db.prepare('SELECT COUNT(*) AS count FROM admins WHERE role_id=?').get(id) as { count: number };
  if (used.count) throw new Error('ابتدا کاربران دارای این نقش را به نقش دیگری منتقل کنید.');
  db.prepare('DELETE FROM admin_roles WHERE id=?').run(id);
}

type ManagedAdminRow = {
  id: number; username: string; display_name?: string; role_id: string; role_name?: string; is_superadmin?: number;
  is_active?: number; mfa_enabled?: number; created_at: string; last_login_at?: string;
};
function managedRowToPublic(row: ManagedAdminRow): ManagedAdminUser {
  return {
    id: row.id, username: row.username, displayName: row.display_name?.trim() || row.username,
    roleId: row.role_id, roleName: row.role_name || 'بدون نقش', isSuperadmin: Boolean(row.is_superadmin),
    isActive: Boolean(row.is_active), mfaEnabled: Boolean(row.mfa_enabled), createdAt: row.created_at, lastLoginAt: row.last_login_at || undefined,
  };
}
function readManagedAdmin(id: number): ManagedAdminRow | null {
  return (db.prepare(`
    SELECT a.id,a.username,a.display_name,a.role_id,r.name AS role_name,r.is_superadmin,a.is_active,a.mfa_enabled,a.created_at,a.last_login_at
      FROM admins a LEFT JOIN admin_roles r ON r.id=a.role_id WHERE a.id=?
  `).get(id) as ManagedAdminRow | undefined) || null;
}
export function listManagedAdmins(): ManagedAdminUser[] {
  return (db.prepare(`
    SELECT a.id,a.username,a.display_name,a.role_id,r.name AS role_name,r.is_superadmin,a.is_active,a.mfa_enabled,a.created_at,a.last_login_at
      FROM admins a LEFT JOIN admin_roles r ON r.id=a.role_id ORDER BY a.created_at ASC
  `).all() as ManagedAdminRow[]).map(managedRowToPublic);
}
const validUsername = (value: string) => /^[a-zA-Z0-9._-]{3,80}$/.test(value);
function activeSuperadminCount(): number {
  return (db.prepare('SELECT COUNT(*) AS count FROM admins a JOIN admin_roles r ON r.id=a.role_id WHERE a.is_active=1 AND r.is_superadmin=1').get() as { count: number }).count;
}
export function createManagedAdmin(input: { username: string; displayName: string; password: string; roleId: string; isActive?: boolean }): ManagedAdminUser {
  const username = input.username.trim();
  const displayName = input.displayName.trim();
  if (!validUsername(username)) throw new Error('نام کاربری فقط می‌تواند شامل حروف انگلیسی، عدد، نقطه، خط تیره و زیرخط باشد.');
  if (displayName.length < 2 || displayName.length > 120) throw new Error('نام نمایشی باید بین ۲ تا ۱۲۰ نویسه باشد.');
  if (input.password.length < 16 || input.password.length > 256) throw new Error('رمز عبور باید حداقل ۱۶ نویسه باشد.');
  const role = readRole(input.roleId);
  if (!role) throw new Error('نقش انتخاب‌شده معتبر نیست.');
  let result: { lastInsertRowid?: number | bigint };
  try {
    result = db.prepare('INSERT INTO admins(username,password_hash,role,role_id,display_name,is_active,created_at) VALUES(?,?,?,?,?,?,?)')
      .run(username, bcrypt.hashSync(input.password, 12), role.is_superadmin ? 'superadmin' : 'custom', role.id, displayName, input.isActive === false ? 0 : 1, now()) as { lastInsertRowid?: number | bigint };
  } catch (error: any) {
    if (String(error?.message || '').includes('UNIQUE')) throw new Error('این نام کاربری قبلاً استفاده شده است.');
    throw error;
  }
  return managedRowToPublic(readManagedAdmin(Number(result.lastInsertRowid))!);
}
export function updateManagedAdmin(id: number, input: { displayName: string; roleId: string; isActive: boolean; password?: string }): ManagedAdminUser {
  const previous = readManagedAdmin(id);
  if (!previous) throw new Error('کاربر پیدا نشد.');
  const role = readRole(input.roleId);
  if (!role) throw new Error('نقش انتخاب‌شده معتبر نیست.');
  const displayName = input.displayName.trim();
  if (displayName.length < 2 || displayName.length > 120) throw new Error('نام نمایشی باید بین ۲ تا ۱۲۰ نویسه باشد.');
  if (previous.is_superadmin && (!role.is_superadmin || !input.isActive) && activeSuperadminCount() <= 1) {
    throw new Error('حداقل یک مدیرکل فعال باید باقی بماند.');
  }
  if (input.password !== undefined && (input.password.length < 16 || input.password.length > 256)) throw new Error('رمز عبور جدید باید حداقل ۱۶ نویسه باشد.');
  db.prepare('UPDATE admins SET display_name=?,role=?,role_id=?,is_active=? WHERE id=?')
    .run(displayName, role.is_superadmin ? 'superadmin' : 'custom', role.id, input.isActive ? 1 : 0, id);
  if (input.password) db.prepare('UPDATE admins SET password_hash=? WHERE id=?').run(bcrypt.hashSync(input.password, 12), id);
  db.prepare('DELETE FROM sessions WHERE admin_id=?').run(id);
  return managedRowToPublic(readManagedAdmin(id)!);
}
export function deleteManagedAdmin(id: number) {
  const previous = readManagedAdmin(id);
  if (!previous) throw new Error('کاربر پیدا نشد.');
  if (previous.is_superadmin && previous.is_active && activeSuperadminCount() <= 1) throw new Error('آخرین مدیرکل فعال حذف‌شدنی نیست.');
  db.prepare('DELETE FROM sessions WHERE admin_id=?').run(id);
  db.prepare('DELETE FROM admins WHERE id=?').run(id);
}
