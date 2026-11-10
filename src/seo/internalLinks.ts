import type { Product } from "../types";

/** Priority products linked from the homepage (prerender + browser) to raise their crawl priority. */
export const HOME_PRIORITY_PRODUCT_IDS = [
  "ts-114", // دانخوری پروانه‌ای پویا
  "ts-115", // جت هیتر مرغداری ۱۰۰ هزار کیلوکالری
  "ts-062", // هواکش ۱۴۰ سانت شش پره تمام استیل
  "ts-037", // جت هیتر برقی ۱۵ کیلووات
  "ts-038", // جت هیتر برقی ۳ کیلووات
  "ts-024", // هیتر کابینتی KHG-300
  "ts-066", // دریچه اینلت ۳۰×۶۰
  "ts-111", // دریچه اینلت دوجداره فوم‌دار ۳۰×۶۰
  "ts-013", // بشقاب دانخوری چیکن پلاس (پروانه‌ای پویا)
  "ts-110", // آبخوری نیپل تمام استیل
  "ts-109", // سیلو و انتقال دان
];

export function homePriorityProducts(products: Product[]): Product[] {
  return HOME_PRIORITY_PRODUCT_IDS.map((id) => products.find((p) => p.id === id)).filter((p): p is Product => Boolean(p));
}

/**
 * Same-category neighbours in catalog order (circular), so every product receives links from
 * nearby products instead of all pages pointing at the first few items of the category.
 */
export function relatedInCategory(product: Product, products: Product[], count = 6): Product[] {
  const exclude = new Set(product.relatedExclude || []);
  const list = products.filter((p) => p.category === product.category && !exclude.has(p.id));
  const index = list.findIndex((p) => p.id === product.id);
  if (index === -1 || list.length < 2) return list.filter((p) => p.id !== product.id).slice(0, count);
  const out: Product[] = [];
  const max = Math.min(count, list.length - 1);
  for (let step = 1; out.length < max; step += 1) {
    const after = list[(index + step) % list.length];
    if (after.id !== product.id && !out.includes(after)) out.push(after);
    if (out.length >= max) break;
    const before = list[(index - step + list.length * 4) % list.length];
    if (before.id !== product.id && !out.includes(before)) out.push(before);
  }
  return out;
}
