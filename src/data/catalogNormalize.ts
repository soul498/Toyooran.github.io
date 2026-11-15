import type { CategoryItem, Product } from '../types';

/** Public category that replaced the leftover «سایر» dump. */
export const AUTOMATION_CATEGORY: CategoryItem = {
  id: 'automation',
  title: 'اتوماسیون مرغداری',
  icon: 'Cpu',
  productCount: 1,
  image: '/images/equipment-1.jpg',
  badge: '',
  titleEn: 'Automation',
  description: 'سامانه پایش و کنترل هوشمند دما، رطوبت، گازها، اینلت و روشنایی سالن',
};

const VENTILATION_TITLE = 'تهویه مرغداری';
const AUTOMATION_TITLE = 'اتوماسیون مرغداری';

/** Seed and CMS snapshots both used «سایر» as a dump. Map those products onto real categories. */
export function recategorizeProduct<T extends { id?: string; name?: string; category?: string; categoryTitle?: string }>(product: T): T {
  const id = String(product.id || '').toLowerCase();
  if (id === 'ts-071') {
    if (product.category === 'ventilation' && product.categoryTitle === VENTILATION_TITLE) return product;
    return { ...product, category: 'ventilation', categoryTitle: VENTILATION_TITLE };
  }
  if (id === 'ts-019' || product.category === 'other') {
    if (product.category === 'automation' && product.categoryTitle === AUTOMATION_TITLE) return product;
    return { ...product, category: 'automation', categoryTitle: AUTOMATION_TITLE };
  }
  return product;
}

/** Drop the empty «سایر» hub and keep automation even if the CMS snapshot is stale. */
export function normalizePublicCategories(categories: CategoryItem[], products: Product[]): CategoryItem[] {
  const filtered = categories.filter((category) => category?.id && category.id !== 'other');
  const next = filtered.some((category) => category.id === 'automation') ? filtered : [...filtered, AUTOMATION_CATEGORY];
  return next.map((category) => ({
    ...category,
    productCount: products.filter((item) => item.category === category.id).length,
  }));
}
