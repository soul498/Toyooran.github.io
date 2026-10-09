import type { Article } from "../types";

export function isPublicArticle(article: Pick<Article, "status">): boolean {
  return article.status !== "draft";
}

export function effectiveSeoTitle(article: Pick<Article, "title" | "seoTitle">): string {
  const custom = article.seoTitle?.trim();
  if (custom) return custom;
  const title = article.title?.trim();
  return title ? `${title} | مجله طیوران صنعت پویا` : "";
}

export function effectiveSeoDescription(article: Pick<Article, "summary" | "seoDescription">): string {
  return (article.seoDescription || article.summary || "").trim();
}

const FA_DIGITS = "۰۱۲۳۴۵۶۷۸۹";
const AR_DIGITS = "٠١٢٣٤٥٦٧٨٩";

function asciiDigits(value: string): string {
  return value.replace(/[۰-۹٠-٩]/g, (d) => String(FA_DIGITS.indexOf(d) >= 0 ? FA_DIGITS.indexOf(d) : AR_DIGITS.indexOf(d)));
}

/** Jalali (y, m, d) -> Gregorian YYYY-MM-DD. */
function jalaliToIso(jy: number, jm: number, jd: number): string {
  jy += 1595;
  let days = -355668 + 365 * jy + Math.floor(jy / 33) * 8 + Math.floor(((jy % 33) + 3) / 4) + jd + (jm < 7 ? (jm - 1) * 31 : (jm - 7) * 30 + 186);
  let gy = 400 * Math.floor(days / 146097);
  days %= 146097;
  if (days > 36524) {
    gy += 100 * Math.floor(--days / 36524);
    days %= 36524;
    if (days >= 365) days++;
  }
  gy += 4 * Math.floor(days / 1461);
  days %= 1461;
  if (days > 365) {
    gy += Math.floor((days - 1) / 365);
    days = (days - 1) % 365;
  }
  let gd = days + 1;
  const leap = (gy % 4 === 0 && gy % 100 !== 0) || gy % 400 === 0;
  const monthDays = [0, 31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  let gm = 1;
  for (; gm <= 12 && gd > monthDays[gm]; gm++) gd -= monthDays[gm];
  return `${gy}-${String(gm).padStart(2, "0")}-${String(gd).padStart(2, "0")}`;
}

/** Sortable publish day: datePublishedIso, else the display date (Jalali or Gregorian), else "". */
export function articlePublishDay(article: Pick<Article, "datePublishedIso" | "date">): string {
  const iso = article.datePublishedIso?.trim();
  if (iso && /^\d{4}-\d{2}-\d{2}/.test(iso)) return iso.slice(0, 10);
  const match = asciiDigits(String(article.date || "")).match(/(\d{4})[/\-.](\d{1,2})[/\-.](\d{1,2})/);
  if (!match) return "";
  const [y, m, d] = [Number(match[1]), Number(match[2]), Number(match[3])];
  if (y < 1700) return jalaliToIso(y, m, d);
  return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

/** Newest first, independent of storage order (stable for equal dates). */
export function sortArticlesNewestFirst<T extends Pick<Article, "datePublishedIso" | "date">>(articles: T[]): T[] {
  return articles
    .map((article, index) => ({ article, index, day: articlePublishDay(article) }))
    .sort((a, b) => (a.day === b.day ? a.index - b.index : a.day < b.day ? 1 : -1))
    .map((entry) => entry.article);
}
