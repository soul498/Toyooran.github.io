/**
 * English dictionary for UI + site data + products (Persian source text → English).
 * Loaded only on /en pages (lazy chunk on the client; directly on the server).
 * Magazine articles are translated on the server only (src/i18n/en/magazine.json).
 */
import ui from './en/ui.json';
import site from './en/site.json';
import products from './en/products.json';

export const EN_DICT: Record<string, string> = { ...(products as Record<string, string>), ...(site as Record<string, string>), ...(ui as Record<string, string>) };
