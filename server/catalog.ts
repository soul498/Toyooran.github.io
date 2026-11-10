import { getAdminState, getAdminStateUpdatedAt } from "./auth";
import { SEED_ARTICLES } from "../src/data/seedArticles";
import { CATEGORIES_DATA, COMPANY_INFO, PRODUCTS, SERVICES } from "../src/data/mockData";
import type { SeoCatalog } from "../src/seo/resolveSeo";
import type { Article, CategoryItem, CompanyInfo, Product, Service } from "../src/types";
import { isPublicArticle, sortArticlesNewestFirst } from "../src/seo/articleMeta";
import { isPublicProduct } from "../src/data/removedProducts";
import { SEED_FALLBACK_PRODUCT_IDS } from "../src/seo/productUrls";
import { withProductPhotos } from "../src/data/productPhotos";
import { withContentCorrections } from "../src/data/contentCorrections";

function asArray<T>(key: string, fallback: T[]): T[] {
  try {
    const value = getAdminState(key);
    return Array.isArray(value) && value.length > 0 ? (value as T[]) : fallback;
  } catch {
    return fallback;
  }
}

/** Collections saved by the admin UI are complete snapshots. Unlike seed overlays,
 * an empty list or a missing record is intentional (for example after deletion). */
function savedCollection<T>(key: string, fallback: T[]): T[] {
  try {
    const value = getAdminState(key);
    return Array.isArray(value) ? (value as T[]) : fallback;
  } catch {
    return fallback;
  }
}

function mergeSeedById<T extends { id: string }>(key: string, seed: T[]): T[] {
  const overlay = asArray<T>(key, []);
  if (!overlay.length) return seed;
  const overlayById = new Map(overlay.filter((item) => item?.id).map((item) => [item.id, item]));
  const seedIds = new Set(seed.map((item) => item.id));
  const merged = seed.map((item) => overlayById.get(item.id) ?? item);
  const extras = overlay.filter((item) => item?.id && !seedIds.has(item.id));
  return extras.length ? [...merged, ...extras] : merged;
}

function overlaySeedOnly<T extends { id: string }>(key: string, seed: T[]): T[] {
  const overlay = asArray<T>(key, []);
  if (!overlay.length) return seed;
  const overlayById = new Map(overlay.filter((item) => item?.id).map((item) => [item.id, item]));
  return seed.map((item) => overlayById.get(item.id) ?? item);
}

/** Stored magazine posts are the source of truth. Drafts stay out of the public catalog. */
export function loadPublicArticles(): Article[] {
  let stored: Article[] | null = null;
  try {
    const value = getAdminState("articles");
    if (Array.isArray(value)) stored = value as Article[];
  } catch {
    stored = null;
  }
  const source = stored ?? SEED_ARTICLES;
  return sortArticlesNewestFirst(source.filter((item) => item?.id && item?.title && isPublicArticle(item))).map((item) => withProductPhotos(withContentCorrections(item)));
}

function asCompany(): CompanyInfo {
  try {
    const value = getAdminState("companyInfo");
    if (value && typeof value === "object") {
      return { ...(COMPANY_INFO as CompanyInfo), ...(value as CompanyInfo) };
    }
  } catch {
    /* seed */
  }
  return COMPANY_INFO as CompanyInfo;
}

let cachedCatalog: { at: number; value: SeoCatalog } | null = null;
const CATALOG_TTL_MS = 5_000;

/**
 * Cached for a few seconds: every HTML request used to parse the full products/articles JSON
 * from SQLite 3+ times (redirect check, SEO render, known-route check), plus once per asset.
 */
export function loadSeoCatalog(): SeoCatalog {
  const now = Date.now();
  if (cachedCatalog && now - cachedCatalog.at < CATALOG_TTL_MS) return cachedCatalog.value;
  const value = buildSeoCatalog();
  cachedCatalog = { at: now, value };
  return value;
}

export function invalidateSeoCatalog(): void {
  cachedCatalog = null;
}

function buildSeoCatalog(): SeoCatalog {
  return {
    products: withSeedFallbackProducts(savedCollection<Product>("products", PRODUCTS)).filter((item) => item && isPublicProduct(item)),
    services: savedCollection<Service>("services", SERVICES)
      .filter((item) => item.status !== 'draft' && item.status !== 'review')
      .map((item) => withContentCorrections(item)),
    // No projects are published yet (user request 2026-10-28): keep admin data, expose none publicly.
    projects: [],
    articles: loadPublicArticles(),
    categories: asArray<CategoryItem>("categories", CATEGORIES_DATA as CategoryItem[]),
    company: asCompany(),
    collectionUpdatedAt: {
      products: getAdminStateUpdatedAt("products"),
      services: getAdminStateUpdatedAt("services"),
      projects: getAdminStateUpdatedAt("projects"),
      articles: getAdminStateUpdatedAt("articles"),
      companyInfo: getAdminStateUpdatedAt("companyInfo"),
    },
  };
}

/** Re-attach seed product pages omitted from a stored admin snapshot (Pouya feeder, jet heater). */
function withSeedFallbackProducts(stored: Product[]): Product[] {
  const ids = new Set(stored.map((item) => item?.id).filter(Boolean));
  const extra = PRODUCTS.filter((item) => (SEED_FALLBACK_PRODUCT_IDS as readonly string[]).includes(item.id) && !ids.has(item.id));
  return extra.length ? [...stored, ...extra] : stored;
}
