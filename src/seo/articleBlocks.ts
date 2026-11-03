export type ArticleBlock =
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "p"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "img"; src: string; alt: string; caption?: string }
  | { type: "cta"; label: string; href: string }
  | { type: "products"; ids: string[] }
  | { type: "table"; headers: string[]; rows: string[][] };

function splitCells(line: string): string[] {
  return line
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());
}

function isSeparatorRow(cells: string[]): boolean {
  return cells.every((cell) => /^:?-{2,}:?$/.test(cell.replace(/\s/g, "")));
}

export function articleBlocks(content: string[]): ArticleBlock[] {
  const blocks: ArticleBlock[] = [];
  const lines = content.map((item) => item.trim()).filter(Boolean);
  let i = 0;
  while (i < lines.length) {
    const text = lines[i];

    if (text.startsWith("|")) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].startsWith("|")) {
        tableLines.push(lines[i]);
        i += 1;
      }
      const rows = tableLines.map(splitCells).filter((row) => row.length > 0 && !isSeparatorRow(row));
      if (rows.length > 0) {
        blocks.push({ type: "table", headers: rows[0], rows: rows.slice(1) });
      }
      continue;
    }

    if (text.startsWith("- ")) {
      const items: string[] = [];
      while (i < lines.length && lines[i].startsWith("- ")) {
        items.push(lines[i].slice(2));
        i += 1;
      }
      blocks.push({ type: "ul", items });
      continue;
    }

    const img = text.match(/^\[IMG\|([^|]+)\|([^|\]]+)(?:\|([^\]]*))?\]$/);
    if (img) {
      blocks.push({ type: "img", src: img[1], alt: img[2], caption: img[3] });
      i += 1;
      continue;
    }

    const cta = text.match(/^\[CTA\|([^|]+)\|([^\]]+)\]$/);
    if (cta) {
      blocks.push({ type: "cta", label: cta[1], href: cta[2] });
      i += 1;
      continue;
    }

    const products = text.match(/^\[PRODUCTS\|([^\]|]+)\]$/);
    if (products) {
      const ids = products[1].split(",").map((id) => id.trim()).filter(Boolean);
      if (ids.length) blocks.push({ type: "products", ids });
      i += 1;
      continue;
    }

    if (text.startsWith("### ")) {
      blocks.push({ type: "h3", text: text.slice(4) });
      i += 1;
      continue;
    }

    if (text.startsWith("## ")) {
      blocks.push({ type: "h2", text: text.slice(3) });
      i += 1;
      continue;
    }

    blocks.push({ type: "p", text });
    i += 1;
  }
  return blocks;
}
