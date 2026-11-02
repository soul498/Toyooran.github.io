/**
 * Server side of the bilingual site: English catalog, article translation and page helpers.
 * Persian (default) is untouched; English pages live under /en (see src/i18n/index.ts, docs/i18n.md).
 */
import { EN_DICT } from "../src/i18n/enDict";
import MAGAZINE_EN from "../src/i18n/en/magazine.json";
import {
  isFullyTranslated,
  missingIn,
  setEnAvailability,
  setEnDictionary,
  translateDeep,
  translateCmsRecord,
  translateProduct,
  withLang,
  withOverlay,
} from "../src/i18n";
import type { Article, Product } from "../src/types";
import type { SeoCatalog } from "../src/seo/resolveSeo";

setEnDictionary(EN_DICT);

const MAG = MAGAZINE_EN as Record<string, Record<string, string>>;

/** Article fields that are shown to readers / search engines (Persian → must have English). */
export function articleVisibleText(article: Article): unknown {
  return {
    title: article.title,
    categoryLabel: article.categoryLabel,
    readTime: article.readTime,
    summary: article.summary,
    content: article.content,
    imageAlt: article.imageAlt,
    tags: article.tags,
    sources: (article.sources || []).map((s) => s.name),
    seoTitle: article.seoTitle,
    seoDescription: article.seoDescription,
    focusKeyword: article.focusKeyword,
    authorName: article.authorName,
    authorRole: article.authorRole,
    reviewerName: article.reviewerName,
    reviewerRole: article.reviewerRole,
  };
}

/** English date for an article (Gregorian, from the ISO dates). */
export function englishArticleDate(article: Article): string {
  const iso = article.datePublishedIso || article.dateModifiedIso;
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Tehran" });
}

/** Missing English strings of one article (empty = complete). */
export function articleMissing(article: Article): string[] {
  return withLang("en", () => withOverlay(MAG[article.id], () => missingIn(articleVisibleText(article))));
}

/** English version of an article, or null when its translation is incomplete (then it has no /en URL). */
export function englishArticle(article: Article): Article | null {
  return withLang("en", () =>
    withOverlay(MAG[article.id], () => {
      const manual = article.translations?.en;
      const out = manual ? { ...translateDeep(article), ...manual } : translateDeep(article);
      if (!isFullyTranslated(articleVisibleText(out))) return null;
      return { ...out, date: englishArticleDate(article) || out.date };
    }),
  );
}

export function productIsTranslated(product: Product): boolean {
  return withLang("en", () => isFullyTranslated(translateProduct(product)));
}

const enCache = new WeakMap<SeoCatalog, SeoCatalog>();

/** The English catalog: only fully translated products/articles, everything translated. */
export function englishCatalog(catalog: SeoCatalog): SeoCatalog {
  const hit = enCache.get(catalog);
  if (hit) {
    publishAvailability(hit);
    return hit;
  }
  const value = withLang("en", () => ({
    ...catalog,
    products: catalog.products.filter(productIsTranslated).map((p) => translateProduct(p)),
    services: catalog.services.map((service) => translateCmsRecord(service)),
    projects: [],
    articles: catalog.articles.map((a) => englishArticle(a)).filter((a): a is Article => Boolean(a)),
    categories: translateDeep(catalog.categories),
    company: translateCmsRecord(catalog.company),
  }));
  enCache.set(catalog, value);
  publishAvailability(value);
  return value;
}

function publishAvailability(en: SeoCatalog): void {
  setEnAvailability({
    articles: en.articles.map((a) => a.id),
    products: en.products.map((p) => p.id),
    topics: [...new Set(en.articles.map((a) => a.topic).filter((t): t is string => Boolean(t)))],
  });
}
