/**
 * Turkish dictionary for UI + site data + products (Persian source text → Turkish).
 * Loaded only on /tr pages (lazy chunk on the client; directly on the server).
 * Magazine articles are translated on the server only (src/i18n/tr/magazine.json).
 */
import ui from './tr/ui.json';
import site from './tr/site.json';
import products from './tr/products.json';

export const TR_DICT: Record<string, string> = { ...(products as Record<string, string>), ...(site as Record<string, string>), ...(ui as Record<string, string>) };
