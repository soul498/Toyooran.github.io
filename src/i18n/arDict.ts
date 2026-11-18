/**
 * Arabic dictionary for UI + site data + products (Persian source text → Arabic).
 * Loaded only on /ar pages (lazy chunk on the client; directly on the server).
 * Magazine articles are translated on the server only (src/i18n/ar/magazine.json).
 */
import ui from './ar/ui.json';
import site from './ar/site.json';
import products from './ar/products.json';

export const AR_DICT: Record<string, string> = { ...(products as Record<string, string>), ...(site as Record<string, string>), ...(ui as Record<string, string>) };
