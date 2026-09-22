import { getAdminState, getAdminStateUpdatedAt } from "./auth";
import { ARTICLES, CATEGORIES_DATA, COMPANY_INFO, PRODUCTS, PROJECTS, SERVICES } from "../src/data/mockData";
import type { SeoCatalog } from "../src/seo/resolveSeo";
import type { Article, CategoryItem, CompanyInfo, Product, Project, Service } from "../src/types";

function asArray<T>(key: string, fallback: T[]): T[] {
  try {
    const value = getAdminState(key);
    return Array.isArray(value) && value.length > 0 ? (value as T[]) : fallback;
  } catch {
    return fallback;
  }
}

function mergeSeedById<T extends { id: string }>(key: string, seed: T[]): T[] {
  const overlay = asArray<T>(key, []);
  if (!overlay.length) return seed;
  const seedIds = new Set(seed.map((item) => item.id));
  const extras = overlay.filter((item) => item?.id && !seedIds.has(item.id));
  return extras.length ? [...seed, ...extras] : seed;
}

/** CMS may edit the 7 magazine seeds; extra articles are dropped from SEO catalog. */
function overlaySeedOnly<T extends { id: string }>(key: string, seed: T[]): T[] {
  const overlay = asArray<T>(key, []);
  if (!overlay.length) return seed;
  const overlayById = new Map(overlay.filter((item) => item?.id).map((item) => [item.id, item]));
  return seed.map((item) => overlayById.get(item.id) ?? item);
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

export function loadSeoCatalog(): SeoCatalog {
  return {
    products: mergeSeedById<Product>("products", PRODUCTS),
    services: mergeSeedById<Service>("services", SERVICES),
    projects: mergeSeedById<Project>("projects", PROJECTS),
    articles: overlaySeedOnly<Article>("articles", ARTICLES),
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
