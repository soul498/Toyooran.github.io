import { createBlockId, type EditorBlock } from './contentBlocks';
import { isSafeImageSrc } from '../../seo/safeUrl';

export interface ImportedArticle {
  title: string;
  summary: string;
  blocks: EditorBlock[];
  warnings: string[];
}

const clean = (value: string) => value.replace(/\u00a0/g, ' ').replace(/[ \t]+/g, ' ').trim();
const paragraph = (text: string): EditorBlock => ({ id: createBlockId(), type: 'p', text: clean(text) });
const heading = (type: 'h2' | 'h3', text: string): EditorBlock => ({ id: createBlockId(), type, text: clean(text) });
const image = (src: string, alt: string, caption = ''): EditorBlock => ({ id: createBlockId(), type: 'img', src: src.trim(), alt: clean(alt), caption: clean(caption) });
const summaryFrom = (blocks: EditorBlock[]) => {
  const first = blocks.find((block) => block.type === 'p' && block.text.length > 15);
  if (!first || first.type !== 'p') return '';
  const plain = first.text.replace(/\*\*/g, '').replace(/\[([^\]]+)\]\([^)]*\)/g, '$1');
  return plain.length > 320 ? plain.slice(0, 320).replace(/\s+\S*$/, '') + '…' : plain;
};
const finish = (title: string, blocks: EditorBlock[], warnings: string[]): ImportedArticle => ({ title: clean(title), summary: summaryFrom(blocks), blocks, warnings });

export function importPlainArticle(source: string): ImportedArticle {
  const lines = source.replace(/\r\n?/g, '\n').replace(/\u00a0/g, ' ').split('\n');
  const blocks: EditorBlock[] = [];
  const warnings: string[] = [];
  let title = '';
  let paragraphLines: string[] = [];
  let listItems: string[] = [];
  let tableLines: string[] = [];
  const flushParagraph = () => {
    if (paragraphLines.length) blocks.push(paragraph(paragraphLines.join(' ')));
    paragraphLines = [];
  };
  const flushList = () => {
    if (listItems.length) blocks.push({ id: createBlockId(), type: 'ul', items: listItems });
    listItems = [];
  };
  const flushTable = () => {
    const rows = tableLines.filter((line) => !/^\|?\s*:?-{2,}/.test(line));
    if (rows.length >= 2) blocks.push({ id: createBlockId(), type: 'table', source: rows.map((line) => line.replace(/^\||\|$/g, '').trim()).join('\n') });
    else rows.forEach((line) => blocks.push(paragraph(line)));
    tableLines = [];
  };
  for (let index = 0; index < lines.length; index += 1) {
    const line = clean(lines[index]);
    if (!line) { flushParagraph(); flushList(); flushTable(); continue; }
    if (line.startsWith('|') && line.includes('|', 1)) { flushParagraph(); flushList(); tableLines.push(line); continue; }
    flushTable();
    const markdownImage = line.match(/^!\[([^\]]*)\]\((\S+?)(?:\s+["']([^"']+)["'])?\)$/);
    if (markdownImage) {
      flushParagraph(); flushList();
      const src = markdownImage[2];
      if (isSafeImageSrc(src)) {
        let caption = markdownImage[3] || '';
        const next = clean(lines[index + 1] || '');
        const namedCaption = next.match(/^(?:کپشن|caption|تصویر\s*[\d۰-۹]+|شکل\s*[\d۰-۹]+)\s*[:：-]\s*(.+)$/i);
        if (!caption && namedCaption) { caption = namedCaption[1]; index += 1; }
        blocks.push(image(src, markdownImage[1] || caption, caption));
      } else warnings.push(`نشانی تصویر «${markdownImage[1] || src}» معتبر نیست؛ تصویر وارد نشد.`);
      continue;
    }
    const h = line.match(/^(#{1,3})\s+(.+)$/);
    if (h) {
      flushParagraph(); flushList();
      if (h[1].length === 1 && !title) title = h[2];
      else blocks.push(heading(h[1].length >= 3 ? 'h3' : 'h2', h[2]));
      continue;
    }
    const list = line.match(/^(?:[-*•]|\d+[.)]|[۰-۹]+[.)])\s+(.+)$/);
    if (list) { flushParagraph(); listItems.push(clean(list[1])); continue; }
    flushList();
    const separated = !paragraphLines.length && (index === 0 || !clean(lines[index - 1])) && !clean(lines[index + 1] || '');
    const following = lines.slice(index + 2).map(clean).find(Boolean) || '';
    if (!title && !blocks.length && separated && line.length <= 110 && following) { title = line; continue; }
    const standaloneHeading = !paragraphLines.length && line.length <= 90 && !/[.!؟?؛،,]$/.test(line) && (
      /^(?:[\d۰-۹]+[.ـ-]\s*|(?:مقدمه|نتیجه‌گیری|جمع‌بندی|پرسش‌های متداول|سؤالات متداول)\s*$)/.test(line)
      || (separated && following.length > line.length * 1.5)
    );
    if (standaloneHeading) { flushParagraph(); blocks.push(heading('h2', line)); continue; }
    paragraphLines.push(line);
  }
  flushParagraph(); flushList(); flushTable();
  if (!title && blocks[0]?.type === 'p' && blocks[0].text.length <= 110 && blocks.length > 1) {
    title = blocks[0].text;
    blocks.shift();
  }
  return finish(title, blocks, warnings);
}

function inlineText(node: Node): string {
  if (node.nodeType === Node.TEXT_NODE) return node.textContent || '';
  if (node.nodeType !== Node.ELEMENT_NODE) return '';
  const element = node as Element;
  const tag = element.tagName.toLowerCase();
  if (tag === 'br') return '\n';
  if (tag === 'img') return '';
  const text = Array.from(element.childNodes).map(inlineText).join('');
  if (['b', 'strong'].includes(tag) && clean(text)) return `**${clean(text)}**`;
  if (tag === 'a') {
    const href = element.getAttribute('href') || '';
    if (href.startsWith('/') && !href.startsWith('//')) return `[${clean(text)}](${href})`;
  }
  return text;
}

export function importHtmlArticle(html: string): ImportedArticle {
  const document = new DOMParser().parseFromString(html, 'text/html');
  const blocks: EditorBlock[] = [];
  const warnings: string[] = [];
  let title = '';
  const addImage = (element: Element, caption = '') => {
    const src = element.getAttribute('src') || '';
    const alt = element.getAttribute('alt') || caption;
    if (isSafeImageSrc(src) || src.startsWith('blob:')) blocks.push(image(src, alt, caption));
    else { blocks.push(image('', alt, caption)); warnings.push('یک تصویرِ چسبانده‌شده نشانی قابل استفاده ندارد؛ آن را در بلوک تصویر انتخاب کنید.'); }
  };
  const walk = (node: Node) => {
    if (node.nodeType !== Node.ELEMENT_NODE) return;
    const element = node as Element;
    const tag = element.tagName.toLowerCase();
    if (['script', 'style', 'iframe', 'form', 'svg', 'noscript', 'head'].includes(tag)) return;
    const text = clean(inlineText(element));
    if (tag === 'h1') { const label = clean(element.textContent || ''); if (!title) title = label; else if (label) blocks.push(heading('h2', label)); return; }
    if (tag === 'h2' || tag === 'h3') { const label = clean(element.textContent || ''); if (label) blocks.push(heading(tag, label)); return; }
    if (tag === 'figure') {
      const img = element.querySelector('img');
      const caption = clean(element.querySelector('figcaption')?.textContent || '');
      if (img) addImage(img, caption);
      return;
    }
    if (tag === 'img') { addImage(element); return; }
    if (tag === 'ul' || tag === 'ol') {
      const items = Array.from(element.children).filter((child) => child.tagName.toLowerCase() === 'li').map((child) => clean(inlineText(child))).filter(Boolean);
      if (items.length) blocks.push({ id: createBlockId(), type: 'ul', items });
      return;
    }
    if (tag === 'table') {
      const rows = Array.from(element.querySelectorAll('tr')).map((row) => Array.from(row.children).map((cell) => clean(cell.textContent || '').replace(/\|/g, ' '))).filter((row) => row.some(Boolean));
      if (rows.length >= 2) blocks.push({ id: createBlockId(), type: 'table', source: rows.map((row) => row.join(' | ')).join('\n') });
      return;
    }
    if (tag === 'p' || tag === 'blockquote' || tag === 'pre') {
      const className = element.getAttribute('class') || '';
      const headingClass = className.match(/(?:heading|عنوان|title)[-_ ]?([123])?/i);
      if (headingClass && text) {
        const label = clean(element.textContent || '');
        if ((headingClass[1] === '1' || /title/i.test(className)) && !title) title = label;
        else blocks.push(heading(headingClass[1] === '3' ? 'h3' : 'h2', label));
        return;
      }
      const caption = text.match(/^(?:کپشن|caption|تصویر\s*[\d۰-۹]+|شکل\s*[\d۰-۹]+)\s*[:：-]\s*(.+)$/i);
      const previous = blocks[blocks.length - 1];
      if (previous?.type === 'img' && (caption || /caption/i.test(className))) { previous.caption = caption?.[1] || clean(element.textContent || ''); return; }
      const imgs = Array.from(element.querySelectorAll('img'));
      if (text) blocks.push(paragraph(text));
      imgs.forEach((img) => addImage(img));
      return;
    }
    Array.from(element.childNodes).forEach(walk);
  };
  Array.from(document.body.childNodes).forEach(walk);
  if (!title && blocks[0]?.type === 'p' && blocks[0].text.length <= 110 && blocks.length > 1) {
    title = blocks[0].text; blocks.shift();
  }
  return finish(title, blocks, warnings);
}
