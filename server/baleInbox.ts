import fs from "fs";
import path from "path";

/** The Bale monitor (bale-mon) reads this file and sends each line to the verified owner. */
const INBOX_FILE = process.env.BALE_INBOX_FILE || "/opt/toyooran-data/bale-inbox/leads.jsonl";

function clip(value: unknown, max: number): string {
  return String(value ?? "").replace(/\s+/g, " ").trim().slice(0, max);
}

export function baleInboxFile(): string {
  return INBOX_FILE;
}

/** Queue one consultation for the server monitor. Returns false when there is no name and no phone. */
export function enqueueConsultationNotice(row: {
  id?: string;
  createdAt?: string;
  fullName?: string;
  phoneNumber?: string;
  companyName?: string;
  subject?: string;
  productName?: string;
  location?: string;
  country?: string;
  province?: string;
  city?: string;
  email?: string;
  lang?: string;
  capacity?: string;
  timing?: string;
  isDecisionMaker?: boolean;
  message?: string;
  source?: string;
  pagePath?: string;
}): boolean {
  const fullName = clip(row.fullName, 120);
  const phoneNumber = clip(row.phoneNumber, 40);
  if (!fullName && !phoneNumber) return false;
  const notice = {
    kind: "consultation",
    id: clip(row.id, 80),
    at: clip(row.createdAt, 40) || new Date().toISOString(),
    fullName,
    phoneNumber,
    companyName: clip(row.companyName, 160),
    subject: clip(row.subject, 200),
    productName: clip(row.productName, 200),
    location: clip(row.location, 120),
    capacity: clip(row.capacity, 80),
    timing: clip(row.timing, 80),
    isDecisionMaker: Boolean(row.isDecisionMaker),
    country: clip(row.country, 80),
    province: clip(row.province, 80),
    city: clip(row.city, 80),
    email: clip(row.email, 160),
    lang: clip(row.lang, 8),
    // The monitor prints the message as-is, so the foreign-form extras are also written into it.
    message: [
      String(row.message ?? "").trim().slice(0, 700),
      row.country ? `کشور: ${clip(row.country, 80)}` : "",
      row.province ? `استان/ایالت: ${clip(row.province, 80)}` : "",
      row.city ? `شهر: ${clip(row.city, 80)}` : "",
      row.email ? `ایمیل: ${clip(row.email, 160)}` : "",
      row.lang && row.lang !== "fa" ? `زبان سایت: ${clip(row.lang, 8)}` : "",
    ].filter(Boolean).join("\n"),
    source: clip(row.source, 80),
    pagePath: clip(row.pagePath, 200),
  };
  const dir = path.dirname(INBOX_FILE);
  fs.mkdirSync(dir, { recursive: true });
  fs.appendFileSync(INBOX_FILE, JSON.stringify(notice) + "\n", { encoding: "utf8", mode: 0o640 });
  try {
    const dirStat = fs.statSync(dir);
    fs.chmodSync(dir, 0o2750);
    fs.chownSync(dir, 0, dirStat.gid);
    fs.chmodSync(INBOX_FILE, 0o640);
    fs.chownSync(INBOX_FILE, 0, dirStat.gid);
  } catch (error) {
    console.error("bale inbox permissions:", error instanceof Error ? error.message : "failed");
  }
  return true;
}

export function baleInboxWritable(): boolean {
  try {
    fs.accessSync(path.dirname(INBOX_FILE), fs.constants.W_OK);
    return true;
  } catch {
    return false;
  }
}
