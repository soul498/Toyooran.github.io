import type { ProductCategory } from '../types';

export const CATALOG_CATEGORY_IDS: ProductCategory[] = ['heating', 'ventilation', 'drinking', 'cooling', 'inlet', 'feeding', 'cage', 'silo', 'automation'];

/**
 * Catalog listing selected by the URL: 'all' on /products, the category on /products/<category>,
 * null on any other path (including product pages). The URL is the single source of truth, so
 * back/forward and the «همه محصولات» chip can never show a stale category.
 */
export function catalogCategoryFromPath(pathname: string): ProductCategory | 'all' | null {
  const path = pathname.replace(/\/+$/, '');
  if (path === '/products') return 'all';
  const m = path.match(/^\/products\/([^/]+)$/);
  if (!m) return null;
  let slug = m[1];
  try {
    slug = decodeURIComponent(slug);
  } catch {
    /* keep raw */
  }
  return CATALOG_CATEGORY_IDS.includes(slug as ProductCategory) ? (slug as ProductCategory) : null;
}
