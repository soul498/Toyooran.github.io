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

/**
 * The consulting service page (/services/srv-consulting-efficiency), switched off too (user answer, 31 Oct 2026).
 * Set to true to bring only this page back, with the same effects as above.
 */
export const CONSULTING_PAGE_ENABLED = false;

/** Service ids behind the four landing cards (src/data/landingServiceCards.ts). */
export const CARD_SERVICE_IDS = [
  'srv-machinery-manufacturing',
  'srv-poultry-equipment-supply',
  'srv-turnkey-shed',
  'srv-feed-formulation-pharma',
] as const;

/** Other service pages that are switched off by their own flag. */
const OTHER_DISABLED_SERVICE_IDS: readonly string[] = CONSULTING_PAGE_ENABLED ? [] : ['srv-consulting-efficiency'];

/** Public slugs that resolve to a card service id (keep in sync with FITOUT_SLUG in seo/resolveSeo.ts). */
const SERVICE_SLUG_ALIASES: Record<string, string> = { 'poultry-hall-fitout': 'srv-turnkey-shed' };

/** Where visitors who hit a disabled page are sent (301). English requests are served as /en/services. */
export const DISABLED_PAGE_REDIRECT = '/services';

export function isServiceDisabled(idOrSlug: string | undefined | null): boolean {
  if (!idOrSlug) return false;
  const raw = String(idOrSlug).trim().toLowerCase();
  const id = SERVICE_SLUG_ALIASES[raw] || raw;
  if (!CARD_SERVICE_PAGES_ENABLED && (CARD_SERVICE_IDS as readonly string[]).includes(id)) return true;
  return OTHER_DISABLED_SERVICE_IDS.includes(id);
}

/** True for /services/<card service> and anything below it (query/hash ignored), as a relative path or an absolute toyooran.com URL. */
export function isDisabledPagePath(pathOrHref: string | undefined | null): boolean {
  if (!pathOrHref) return false;
  let path = String(pathOrHref).trim().split(/[?#]/)[0];
  const abs = /^(?:https?:)?\/\/([^/]+)(\/.*)?$/i.exec(path);
  if (abs) {
    if (!/(^|\.)toyooran\.com(:\d+)?$/i.test(abs[1])) return false;
    path = abs[2] || '/';
  }
  try {
    path = decodeURIComponent(path);
  } catch {
    /* keep raw */
  }
  const parts = path.split('/').filter(Boolean);
  // English pages live under /en: the same page stays disabled there.
  if (parts[0] === 'en') parts.shift();
  return parts[0] === 'services' && parts.length >= 2 && isServiceDisabled(parts[1]);
}

/**
 * If href is a switched-off service page, return the hub path (/services).
 * Absolute toyooran.com URLs keep their origin. Other hrefs are unchanged.
 * English localisation (/en/services) is applied later by localizeHref / the server.
 */
export function rewriteDisabledHref(pathOrHref: string): string {
  if (!isDisabledPagePath(pathOrHref)) return pathOrHref;
  const raw = String(pathOrHref).trim();
  const pathOnly = raw.split(/[?#]/)[0];
  const abs = /^(https?:\/\/[^/]+)/i.exec(pathOnly);
  if (abs && /(^|\.)toyooran\.com(:\d+)?$/i.test(abs[1].replace(/^https?:\/\//i, ''))) {
    return `${abs[1]}${DISABLED_PAGE_REDIRECT}`;
  }
  if (/^\/\/([^/]+)/.test(pathOnly)) {
    const host = pathOnly.slice(2).split('/')[0];
    if (/(^|\.)toyooran\.com(:\d+)?$/i.test(host)) return `//${host}${DISABLED_PAGE_REDIRECT}`;
  }
  return DISABLED_PAGE_REDIRECT;
}
