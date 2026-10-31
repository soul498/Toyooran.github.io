/**
 * Temporarily switched-off pages (user request t61u, 31 Oct 2026):
 * the four service cards on the home page and /services stay on screen as display-only tiles,
 * and the service pages behind them are not viewable for now.
 *
 * To bring everything back, set CARD_SERVICE_PAGES_ENABLED = true. Then:
 * - the cards link again;
 * - the routes stop redirecting;
 * - the pages return to the sitemap, llms.txt, footer and prerender links;
 * - in-text links to them are rendered again.
 * No content or data was deleted.
 */
export const CARD_SERVICE_PAGES_ENABLED = false;

/** Service ids behind the four landing cards (src/data/landingServiceCards.ts). */
export const CARD_SERVICE_IDS = [
  'srv-machinery-manufacturing',
  'srv-poultry-equipment-supply',
  'srv-turnkey-shed',
  'srv-feed-formulation-pharma',
] as const;

/** Public slugs that resolve to a card service id (keep in sync with FITOUT_SLUG in seo/resolveSeo.ts). */
const SERVICE_SLUG_ALIASES: Record<string, string> = { 'poultry-hall-fitout': 'srv-turnkey-shed' };

/** Where visitors who hit a disabled page are sent (temporary 302, so it's easy to undo). */
export const DISABLED_PAGE_REDIRECT = '/';

export function isServiceDisabled(idOrSlug: string | undefined | null): boolean {
  if (CARD_SERVICE_PAGES_ENABLED || !idOrSlug) return false;
  const raw = String(idOrSlug).trim().toLowerCase();
  const id = SERVICE_SLUG_ALIASES[raw] || raw;
  return (CARD_SERVICE_IDS as readonly string[]).includes(id);
}

/** True for /services/<card service> and anything below it (query/hash ignored). */
export function isDisabledPagePath(pathOrHref: string | undefined | null): boolean {
  if (CARD_SERVICE_PAGES_ENABLED || !pathOrHref) return false;
  let path = String(pathOrHref).split(/[?#]/)[0];
  try {
    path = decodeURIComponent(path);
  } catch {
    /* keep raw */
  }
  const parts = path.split('/').filter(Boolean);
  return parts[0] === 'services' && parts.length >= 2 && isServiceDisabled(parts[1]);
}
