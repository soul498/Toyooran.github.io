import fs from "fs";
import path from "path";

const LEADS_FILE = process.env.LEADS_FILE || "/opt/toyooran-data/qualified-leads.jsonl";

export type LeadInput = {
  fullName?: string;
  phoneNumber?: string;
  companyName?: string;
  subject?: string;
  productName?: string;
  capacity?: string;
  location?: string;
  message?: string;
  source?: string;
  isDecisionMaker?: boolean;
  timing?: string;
  pagePath?: string;
  conversionEvent?: string;
};

function qualify(lead: LeadInput) {
  const need = Boolean(lead.subject || lead.message || lead.productName);
  const region = Boolean(lead.location);
  const timing = Boolean(lead.timing);
  const decisionMaker = Boolean(lead.isDecisionMaker);
  const budgetScale = Boolean(lead.capacity);
  const score = [need, region, timing, decisionMaker, budgetScale].filter(Boolean).length;
  return { need, region, timing, decisionMaker, budgetScale, score, qualified: score >= 3 };
}

export function appendLead(lead: LeadInput) {
  const qualification = qualify(lead);
  const row = {
    id: `lead-${Date.now()}`,
    createdAt: new Date().toISOString(),
    ...lead,
    qualification,
  };
  fs.mkdirSync(path.dirname(LEADS_FILE), { recursive: true });
  fs.appendFileSync(LEADS_FILE, JSON.stringify(row) + "\n", "utf8");
  return row;
}

export function leadsToCsv(): string {
  if (!fs.existsSync(LEADS_FILE)) {
    return "id,createdAt,fullName,phone,location,capacity,subject,qualified,score\n";
  }
  const lines = fs.readFileSync(LEADS_FILE, "utf8").trim().split("\n").filter(Boolean);
  const header = "id,createdAt,fullName,phone,location,capacity,subject,qualified,score,source,pagePath,conversionEvent";
  const rows = lines.map((line) => {
    const item = JSON.parse(line);
    const cells = [
      item.id,
      item.createdAt,
      item.fullName,
      item.phoneNumber,
      item.location,
      item.capacity,
      item.subject,
      item.qualification?.qualified,
      item.qualification?.score,
      item.source,
      item.pagePath,
      item.conversionEvent,
    ].map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`);
    return cells.join(",");
  });
  return [header, ...rows].join("\n") + "\n";
}
