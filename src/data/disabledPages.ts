/**
 * Retired service pages.
 *
 * 14 Nov 2026: the user replaced the four card services with six services, each with its own page
 * (src/data/servicePages.ts). Every old service URL now 301s to the closest new page
 * (LEGACY_SERVICE_TARGETS), not to /services. The flags below stay false: the old pages are not coming back.
 *
 * History, temporarily switched-off pages (user request t61u, 31 Oct 2026):
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

/** Fallback for a retired service page with no mapped target. English requests are served as /en/services. */
export const DISABLED_PAGE_REDIRECT = '/services';

/** Old service id or slug → new service page (src/data/servicePages.ts). */
export const LEGACY_SERVICE_TARGETS: Record<string, string> = {
  'srv-turnkey-shed': '/services/industrial-buildings',
  'srv-poultry-equipment-supply': '/services/farm-equipment-installation',
  'srv-machinery-manufacturing': '/services/feed-machinery',
  'srv-feed-formulation-pharma': '/services/feed-products',
  'poultry-hall-fitout': '/services/modernization',
  'srv-consulting-efficiency': '/services/modernization',
};

/** New page for a retired service URL (Persian path; /en is added by the caller), else /services. */
export function legacyServiceTarget(pathOrHref: string): string {
  let path = String(pathOrHref || '').trim().split(/[?#]/)[0].replace(/^(?:https?:)?\/\/[^/]+/i, '');
  try {
    path = decodeURIComponent(path);
  } catch {
    /* keep raw */
  }
  const parts = path.split('/').filter(Boolean);
  if (parts[0] === 'en' || parts[0] === 'tr') parts.shift();
  const slug = (parts[1] || '').toLowerCase();
  return LEGACY_SERVICE_TARGETS[slug] || DISABLED_PAGE_REDIRECT;
}

export function isServiceDisabled(idOrSlug: string | undefined | null): boolean {
  if (!idOrSlug) return false;
  const raw = String(idOrSlug).trim().toLowerCase();
  if (raw in LEGACY_SERVICE_TARGETS) return true;
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
  // English and Turkish pages live under /en and /tr: the same page stays disabled there.
  if (parts[0] === 'en' || parts[0] === 'tr') parts.shift();
  return parts[0] === 'services' && parts.length >= 2 && isServiceDisabled(parts[1]);
}

/**
 * If href is a retired service page, return its new service page (LEGACY_SERVICE_TARGETS).
 * Absolute toyooran.com URLs keep their origin. Other hrefs are unchanged.
 * English localisation (/en/services) is applied later by localizeHref / the server.
 */
export function rewriteDisabledHref(pathOrHref: string): string {
  if (!isDisabledPagePath(pathOrHref)) return pathOrHref;
  const target = legacyServiceTarget(pathOrHref);
  const raw = String(pathOrHref).trim();
  const pathOnly = raw.split(/[?#]/)[0];
  const abs = /^(https?:\/\/[^/]+)/i.exec(pathOnly);
  if (abs && /(^|\.)toyooran\.com(:\d+)?$/i.test(abs[1].replace(/^https?:\/\//i, ''))) {
    return `${abs[1]}${target}`;
  }
  if (/^\/\/([^/]+)/.test(pathOnly)) {
    const host = pathOnly.slice(2).split('/')[0];
    if (/(^|\.)toyooran\.com(:\d+)?$/i.test(host)) return `//${host}${target}`;
  }
  return target;
}
