/**
 * Russian dictionary for UI + site data + products (Persian source text → Russian).
 * Loaded only on /ru pages (lazy chunk on the client; directly on the server).
 * Magazine articles are translated on the server only (src/i18n/ru/magazine.json).
 */
import ui from './ru/ui.json';
import site from './ru/site.json';
import products from './ru/products.json';

export const RU_DICT: Record<string, string> = { ...(products as Record<string, string>), ...(site as Record<string, string>), ...(ui as Record<string, string>) };
