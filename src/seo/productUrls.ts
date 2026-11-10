
/**
 * Public URL slugs for the nine products whose previous slugs contained
 * کارنو / کارنوتک. Forced in code so a stored admin snapshot with the old
 * name cannot put those words back in the URL. Display names are unchanged.
 * Old name-based slugs still 301 via the …-ts-0xx suffix in findProduct().
 */
export const PRODUCT_SLUG_BY_ID: Readonly<Record<string, string>> = {
  "ts-012": "دوزاترون-سیستم-تزریق-دارو-مرغداری-ts-012",
  "ts-019": "سیستم-اتوماسیون-مرغداری-ts-019",
  "ts-057": "جت-هیتر-ts-057",
  "ts-071": "سیستم-تهویه-تونلی-مرغداری-ts-071",
  "ts-072": "ایر-میکسر-ts-072",
  "ts-090": "بشقاب-دانخوری-چیکن-–-قابل-استفاده-از-یکروزگی-ts-090",
  "ts-108": "سیستم-مه-پاش-ts-108",
  "ts-110": "آبخوری-نیپل-تمام-استیل-ts-110",
  "ts-111": "دریچه-اینلت-دوجداره-فوم‌دار-30-در-60-ts-111",
};

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
