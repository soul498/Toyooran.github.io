import type { Product } from '../types';

/**
 * Products hidden from the public site (Kolak Gostar / کولاک گستر line, hidden 2026-10-27).
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
export function isPublicProduct(product: Pick<Product, 'id'> & { hidden?: boolean }): boolean {
  return !product.hidden && !isRemovedProductId(product.id);
}
