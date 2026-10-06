/**
 * Tiny, trusted rich-text format for code-authored SEO copy (category intros, product details).
 * Inline syntax: **bold** and [label](/internal-path). Only internal paths ("/...") become links.
 * Shared by the server prerender (blocksToHtml) and the client (components/RichBlocks.tsx).
 */
export type RichBlock = { h2: string } | { p: string } | { ul: string[] };

export type InlinePart = { text: string; bold?: boolean; href?: string };

const INLINE_RE = /\*\*(.+?)\*\*|\[([^\]]+)\]\((\/[^)\s]*)\)/g;

export function parseInline(text: string): InlinePart[] {
  const parts: InlinePart[] = [];
  let last = 0;
  for (const m of text.matchAll(INLINE_RE)) {
    const idx = m.index ?? 0;
    if (idx > last) parts.push({ text: text.slice(last, idx) });
    if (m[1] !== undefined) parts.push({ text: m[1], bold: true });
    else parts.push({ text: m[2], href: m[3] });
    last = idx + m[0].length;
  }
  if (last < text.length) parts.push({ text: text.slice(last) });
  return parts;
}

/** Plain text (markup stripped) for meta/snippets. */
export function inlinePlain(text: string): string {
  return parseInline(text).map((p) => p.text).join("");
}

function esc(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function inlineToHtml(text: string): string {
  return parseInline(text)
    .map((p) => {
      const t = esc(p.text);
      if (p.href) return `<a href="${esc(p.href)}">${t}</a>`;
      if (p.bold) return `<strong>${t}</strong>`;
      return t;
    })
    .join("");
}

export function blocksToHtml(blocks: RichBlock[] | undefined): string {
  if (!blocks?.length) return "";
  return blocks
    .map((b) => {
      if ("h2" in b) return `<h2>${inlineToHtml(b.h2)}</h2>`;
      if ("p" in b) return `<p>${inlineToHtml(b.p)}</p>`;
      return `<ul>${b.ul.map((li) => `<li>${inlineToHtml(li)}</li>`).join("")}</ul>`;
    })
    .join("\n");
}
