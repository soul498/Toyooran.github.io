import { articleBlocks } from "../../seo/articleBlocks";
import { isSafeHref, isSafeImageSrc } from "../../seo/safeUrl";

export type EditorBlock =
  | { id: string; type: "p"; text: string }
  | { id: string; type: "h2"; text: string }
  | { id: string; type: "h3"; text: string }
  | { id: string; type: "ul"; items: string[] }
  | { id: string; type: "img"; src: string; alt: string; caption: string }
  | { id: string; type: "cta"; label: string; href: string }
  | { id: string; type: "products"; ids: string }
  | { id: string; type: "table"; source: string };

let sequence = 0;

export function createBlockId(): string {
  sequence += 1;
  return `b${Date.now().toString(36)}${sequence}`;
}

export function createBlock(type: EditorBlock["type"]): EditorBlock {
  const id = createBlockId();
  if (type === "ul") return { id, type, items: [""] };
  if (type === "img") return { id, type, src: "", alt: "", caption: "" };
  if (type === "cta") return { id, type, label: "درخواست مشاوره", href: "/contact" };
  if (type === "table") return { id, type, source: "ستون ۱ | ستون ۲\nمقدار | مقدار" };
  if (type === "h2") return { id, type, text: "" };
  if (type === "h3") return { id, type, text: "" };
  return { id, type: "p", text: "" };
}

export function contentToBlocks(content: string[] | undefined): EditorBlock[] {
  const parsed = articleBlocks(content || []);
  if (!parsed.length) return [createBlock("p")];
  return parsed.map((block) => {
    const id = createBlockId();
    if (block.type === "ul") return { id, type: "ul", items: block.items.length ? [...block.items] : [""] };
    if (block.type === "img") return { id, type: "img", src: block.src, alt: block.alt, caption: block.caption ?? block.alt };
    if (block.type === "cta") return { id, type: "cta", label: block.label, href: block.href };
    if (block.type === "products") return { id, type: "products", ids: block.ids.join(",") };
    if (block.type === "table") {
      const lines = [block.headers.join(" | "), ...block.rows.map((row) => row.join(" | "))];
      return { id, type: "table", source: lines.join("\n") };
    }
    if (block.type === "h2") return { id, type: "h2", text: block.text };
    if (block.type === "h3") return { id, type: "h3", text: block.text };
    return { id, type: "p", text: block.text };
  });
}

function safeCell(value: string): string {
  return value.replace(/\|/g, " ").replace(/\s+/g, " ").trim();
}

function tableLines(source: string): string[] {
  const rows = source
    .split("\n")
    .map((line) => line.split("|").map((cell) => safeCell(cell)))
    .filter((row) => row.some(Boolean));
  if (rows.length < 2) return [];
  const width = rows[0].length;
  const normalized = rows.map((row) => Array.from({ length: width }, (_, index) => row[index] || ""));
  const body = normalized.slice(1).filter((row) => row.some(Boolean));
  if (!body.length || !normalized[0].some(Boolean)) return [];
  return [
    `| ${normalized[0].join(" | ")} |`,
    `| ${normalized[0].map(() => "---").join(" | ")} |`,
    ...body.map((row) => `| ${row.join(" | ")} |`),
  ];
}

function markerSafe(value: string): string {
  return value.replace(/[|\]]/g, " ").replace(/\s+/g, " ").trim();
}

export function blocksToContent(blocks: EditorBlock[]): string[] {
  const lines: string[] = [];
  for (const block of blocks) {
    if (block.type === "p" && block.text.trim()) lines.push(block.text.trim());
    else if (block.type === "h2" && block.text.trim()) lines.push(`## ${block.text.trim()}`);
    else if (block.type === "h3" && block.text.trim()) lines.push(`### ${block.text.trim()}`);
    else if (block.type === "ul") {
      for (const item of block.items) {
        if (item.trim()) lines.push(`- ${item.trim()}`);
      }
    } else if (block.type === "img" && isSafeImageSrc(block.src)) {
      lines.push(`[IMG|${markerSafe(block.src)}|${markerSafe(block.alt) || "تصویر مقاله"}|${markerSafe(block.caption)}]`);
    } else if (block.type === "cta" && block.label.trim() && isSafeHref(block.href)) {
      lines.push(`[CTA|${markerSafe(block.label)}|${markerSafe(block.href)}]`);
    } else if (block.type === "products") {
      const ids = block.ids.split(",").map((x) => x.replace(/[|\]\[]/g, "").trim()).filter(Boolean);
      if (ids.length) lines.push(`[PRODUCTS|${ids.join(",")}]`);
    } else if (block.type === "table") {
      lines.push(...tableLines(block.source));
    }
  }
  return lines;
}

export function blockPlainText(blocks: EditorBlock[]): string {
  return blocks
    .map((block) => {
      if (block.type === "ul") return block.items.join(" ");
      if (block.type === "table") return block.source.replace(/\|/g, " ");
      if (block.type === "img") return block.alt;
      if (block.type === "cta") return block.label;
      if (block.type === "products") return "";
      return block.text;
    })
    .join(" ");
}

export function estimateReadTime(blocks: EditorBlock[]): string {
  const words = blockPlainText(blocks).trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.round(words / 180) || 1);
  return `${minutes.toLocaleString("fa-IR")} دقیقه`;
}

export function normalizeSlug(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}
