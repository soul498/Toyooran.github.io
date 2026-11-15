import type { Product } from '../types';

/**
 * Products hidden from the public site (Kolak Gostar / کولاک گستر, hidden 2026-10-27;
 * Chicken / Chicken Plus / Konavi — چیکن، چیکن پلاس، کوناوی — hidden 2026-11-15).
 * The records stay in hiddenProducts.ts with `hidden: true` (admin panel only). Public lists, search,
 * sitemap, prerender and structured data skip them, and their old URLs 301 to the category page.
 * The server also drops these ids if a stored admin copy lacks the flag.
 * To publish one again: move it from hiddenProducts.ts into productsData.ts (without `hidden`) AND remove its row below.
 */
export const REMOVED_PRODUCTS: ReadonlyArray<{ id: string; category: string }> = [
  { id: 'ts-002', category: 'ventilation' },
  { id: 'ts-003', category: 'heating' },
  { id: 'ts-004', category: 'heating' },
  { id: 'ts-005', category: 'heating' },
  { id: 'ts-006', category: 'heating' },
  { id: 'ts-007', category: 'heating' },
  { id: 'ts-008', category: 'heating' },
  { id: 'ts-009', category: 'ventilation' },
  { id: 'ts-010', category: 'ventilation' },
  { id: 'ts-011', category: 'heating' },
  { id: 'ts-014', category: 'ventilation' },
  { id: 'ts-015', category: 'ventilation' },
  { id: 'ts-013', category: 'feeding' },
  { id: 'ts-090', category: 'feeding' },
  { id: 'ts-091', category: 'feeding' },
];

const REMOVED_BY_ID = new Map(REMOVED_PRODUCTS.map((item) => [item.id, item]));

export function isRemovedProductId(id: unknown): boolean {
  return typeof id === 'string' && REMOVED_BY_ID.has(id.toLowerCase());
}

/** Category path for an old product slug (`…-ts-002`, `ts-002` or `TS-002`), or null. */
export function removedProductRedirect(slug: string): string | null {
  const m = slug.toLowerCase().match(/(?:^|-)(ts-\d{3})$/);
  const hit = m ? REMOVED_BY_ID.get(m[1]) : undefined;
  return hit ? `/products/${hit.category}` : null;
}

/** True when a product may appear anywhere public (not flagged hidden and not on the hidden list). */
export function isPublicProduct(product: Pick<Product, 'id' | 'status'> & { hidden?: boolean }): boolean {
  return !product.hidden && product.status !== 'draft' && product.status !== 'review' && !isRemovedProductId(product.id);
}

/** Magazine and page links to a hidden product go to the Pouya butterfly feeder, not the old URL. */
export const REMOVED_PRODUCT_LINK_FALLBACK = "/products/pouya-butterfly-feeder";

/**
 * If href is a public product URL of a hidden product, return the Pouya feeder path.
 * Absolute toyooran.com URLs keep their origin. Language prefixes are left to localizeHref / lp().
 * Other hrefs are unchanged.
 */
export function rewriteRemovedProductHref(pathOrHref: string): string {
  if (!pathOrHref) return pathOrHref;
  const raw = String(pathOrHref).trim();
  const pathOnly = raw.split(/[?#]/)[0];
  const suffix = raw.slice(pathOnly.length);
  let origin = "";
  let path = pathOnly;
  const abs = /^(?:https?:)?\/\/([^/]+)(\/.*)?$/i.exec(path);
  if (abs) {
    if (!/(^|\.)toyooran\.com(:\d+)?$/i.test(abs[1])) return pathOrHref;
    origin = path.slice(0, path.length - (abs[2] ? abs[2].length : 0));
    path = abs[2] || "/";
  }
  let decoded = path;
  try {
    decoded = decodeURIComponent(path);
  } catch {
    /* keep raw */
  }
  const parts = decoded.split("/").filter(Boolean);
  if (parts[0] === "en" || parts[0] === "tr" || parts[0] === "ru") parts.shift();
  if (parts[0] !== "products" || parts.length < 2) return pathOrHref;
  const categoryPath = removedProductRedirect(parts[1]);
  // Only the hidden feeding-line products (Chicken / Chicken Plus / Konavi) are retargeted
  // to the Pouya feeder; other hidden products keep their href (the URL itself 301s to its category).
  if (categoryPath !== "/products/feeding") return pathOrHref;
  return origin ? `${origin}${REMOVED_PRODUCT_LINK_FALLBACK}${suffix}` : `${REMOVED_PRODUCT_LINK_FALLBACK}${suffix}`;
}

