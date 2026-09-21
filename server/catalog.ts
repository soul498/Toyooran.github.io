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
    products: asArray<Product>("products", PRODUCTS),
    services: asArray<Service>("services", SERVICES),
    projects: asArray<Project>("projects", PROJECTS),
    articles: asArray<Article>("articles", ARTICLES),
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
