/**
 * Products removed from the public catalog (Kolak Gostar / کولاک گستر line, removed 2026-10-27).
 * Old product URLs 301 to their category page, and the server drops these ids even when the
 * admin database still holds them, so they cannot reappear in the catalog or the sitemap.
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
