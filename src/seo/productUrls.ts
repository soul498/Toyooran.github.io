
import { keepFa } from "../i18n";

/**
 * Public URL slugs for the products whose previous slugs contained
 * کارنو / کارنوتک. Forced in code so a stored admin snapshot with the old
 * name cannot put those words back in the URL. Display names are unchanged.
 * Old name-based slugs still 301 via the …-ts-0xx suffix in findProduct().
 * keepFa: these are URL paths, not copy, so they are not translated.
 */
export const PRODUCT_SLUG_BY_ID: Readonly<Record<string, string>> = {
  "ts-012": keepFa("دوزاترون-سیستم-تزریق-دارو-مرغداری-ts-012"),
  "ts-019": keepFa("سیستم-اتوماسیون-مرغداری-ts-019"),
  "ts-057": keepFa("جت-هیتر-ts-057"),
  "ts-071": keepFa("سیستم-تهویه-تونلی-مرغداری-ts-071"),
  "ts-072": keepFa("ایر-میکسر-ts-072"),
  "ts-108": keepFa("سیستم-مه-پاش-ts-108"),
  "ts-110": keepFa("آبخوری-نیپل-تمام-استیل-ts-110"),
  "ts-111": keepFa("دریچه-اینلت-دوجداره-فوم‌دار-30-در-60-ts-111"),
};


/**
 * Previous public slugs that included کارنو / کارنوتک. Persian URLs still 301
 * to the current canonical slug; the same paths under /en 301 in one hop to
 * /en/products (those product pages are not in the English catalog).
 */
export const LEGACY_COMPETITOR_PRODUCT_SLUGS: Readonly<Record<string, string>> = {
  "ts-012": keepFa("دوزاترون-سیستم-تزریق-دارو-مرغداری-کارنوتک-ts-012"),
  "ts-019": keepFa("سیستم-اتوماسیون-مرغداری-کارنو-ts-019"),
  "ts-057": keepFa("جت-هیتر-کارنو-ts-057"),
  "ts-071": keepFa("سیستم-تهویه-کارنو-ts-071"),
  "ts-072": keepFa("ایر-میکسر-کارنوتک-ts-072"),
  "ts-090": keepFa("بشقاب-دانخوری-چیکن-کارنوتک-–-قابل-استفاده-از-یکروزگی-ts-090"),
  "ts-108": keepFa("سیستم-مه-پاش-کارنو-ts-108"),
  "ts-110": keepFa("آبخوری-نیپل-کارنو-–-نیپل-های-تمام-استیل-ts-110"),
  "ts-111": keepFa("دریچه-اینلت-کارنو-ts-111"),
};

const COMPETITOR_IN_SLUG_RE = /کارنوتک|کارنو|carnotech|karnotech|(?:^|[^a-z0-9])(?:carno|karno)(?:[^a-z0-9]|$)/i;

export function isLegacyCompetitorProductSlug(slug: string): boolean {
  let decoded = slug;
  for (let i = 0; i < 3; i++) {
    try {
      const next = decodeURIComponent(decoded);
      if (next === decoded) break;
      decoded = next;
    } catch {
      break;
    }
  }
  if (Object.values(LEGACY_COMPETITOR_PRODUCT_SLUGS).includes(decoded)) return true;
  return COMPETITOR_IN_SLUG_RE.test(decoded);
}

/**
 * Pretty (and short-id) product paths. If the product is in the public catalog,
 * the request 200s on the canonical slug or 301s to it; otherwise 301 to the
 * category hub. Used for /products/jet-heater, /products/pouya-butterfly-feeder,
 * /products/ts-114 and /products/ts-115 (fa and /en).
 */
export const PRODUCT_PATH_ALIASES: Readonly<Record<string, { productId: string; fallback: string }>> = {
  "jet-heater": { productId: "ts-115", fallback: "/products/heating" },
  "pouya-butterfly-feeder": { productId: "ts-114", fallback: "/products/feeding" },
  "ts-115": { productId: "ts-115", fallback: "/products/heating" },
  "ts-114": { productId: "ts-114", fallback: "/products/feeding" },
};

/** Seed products that must stay publicly routable even if a stored admin snapshot omitted them. */
export const SEED_FALLBACK_PRODUCT_IDS = ["ts-114", "ts-115"] as const;

export function productAliasTarget(slug: string): { productId: string; fallback: string } | undefined {
  return PRODUCT_PATH_ALIASES[slug] || PRODUCT_PATH_ALIASES[slug.toLowerCase()];
}
