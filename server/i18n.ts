/**
 * Server side of fa / en / tr / ru / ar. Persian (default) is untouched.
 * English pages live under /en, Turkish under /tr, Russian under /ru and Arabic under /ar.
 */
import { EN_DICT } from "../src/i18n/enDict";
import { TR_DICT } from "../src/i18n/trDict";
import { RU_DICT } from "../src/i18n/ruDict";
import { AR_DICT } from "../src/i18n/arDict";
import MAGAZINE_EN from "../src/i18n/en/magazine.json";
import MAGAZINE_TR from "../src/i18n/tr/magazine.json";
import MAGAZINE_RU from "../src/i18n/ru/magazine.json";
import MAGAZINE_AR from "../src/i18n/ar/magazine.json";
import {
  type ForeignLang,
  isFullyTranslated,
  isProductFullyTranslated,
  missingIn,
  setLangAvailability,
  setEnDictionary,
  setTrDictionary,
  setRuDictionary,
  setArDictionary,
  translateDeep,
  translateCmsRecord,
  translateProduct,
  withLang,
  withOverlay,
} from "../src/i18n";
import type { Article, Product } from "../src/types";
import { productPathAliases, type SeoCatalog } from "../src/seo/resolveSeo";

setEnDictionary(EN_DICT);
setTrDictionary(TR_DICT);
setRuDictionary(RU_DICT);
setArDictionary(AR_DICT);

const MAG: Record<ForeignLang, Record<string, Record<string, string>>> = {
  en: MAGAZINE_EN as Record<string, Record<string, string>>,
  tr: MAGAZINE_TR as Record<string, Record<string, string>>,
  ru: MAGAZINE_RU as Record<string, Record<string, string>>,
  ar: MAGAZINE_AR as Record<string, Record<string, string>>,
};

const DATE_LOCALE: Record<ForeignLang, string> = { en: "en-GB", tr: "tr-TR", ru: "ru-RU", ar: "ar" };

/** Article fields that are shown to readers / search engines (Persian → must have a translation). */
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

/** Gregorian date for a foreign article page. */
export function foreignArticleDate(article: Article, lang: ForeignLang): string {
  const iso = article.datePublishedIso || article.dateModifiedIso;
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString(DATE_LOCALE[lang], { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Tehran" });
}

/** English date for an article (Gregorian, from the ISO dates). */
export function englishArticleDate(article: Article): string {
  return foreignArticleDate(article, "en");
}

/** Missing strings of one article in `lang` (empty = complete). */
export function articleMissing(article: Article, lang: ForeignLang = "en"): string[] {
  return withLang(lang, () => withOverlay(MAG[lang][article.id], () => missingIn(articleVisibleText(article))));
}

/** Translated article, or null when its translation is incomplete (then it has no /en or /tr URL). */
export function articleFor(lang: ForeignLang, article: Article): Article | null {
  return withLang(lang, () =>
    withOverlay(MAG[lang][article.id], () => {
      const manual = article.translations?.[lang];
      const out = manual ? { ...translateDeep(article), ...manual } : translateDeep(article);
      if (!isFullyTranslated(articleVisibleText(out))) return null;
      return { ...out, date: foreignArticleDate(article, lang) || out.date };
    }),
  );
}

/** English version of an article, or null when its translation is incomplete (then it has no /en URL). */
export function englishArticle(article: Article): Article | null {
  return articleFor("en", article);
}

export function productIsTranslated(product: Product, lang: ForeignLang = "en"): boolean {
  return withLang(lang, () => isProductFullyTranslated(product));
}

const caches = new Map<ForeignLang, WeakMap<SeoCatalog, SeoCatalog>>();

function cacheFor(lang: ForeignLang): WeakMap<SeoCatalog, SeoCatalog> {
  let map = caches.get(lang);
  if (!map) {
    map = new WeakMap();
    caches.set(lang, map);
  }
  return map;
}

/** A foreign catalog: only fully translated products/articles, everything translated. */
export function localizedCatalog(catalog: SeoCatalog, lang: ForeignLang): SeoCatalog {
  const cache = cacheFor(lang);
  const hit = cache.get(catalog);
  if (hit) {
    withLang(lang, () => publishAvailability(lang, hit));
    return hit;
  }
  const value = withLang(lang, () => {
    const localized: SeoCatalog = {
      ...catalog,
      products: catalog.products.filter((product) => isProductFullyTranslated(product)).map((product) => translateProduct(product)),
      services: catalog.services.map((service) => translateCmsRecord(service)),
      projects: [],
      articles: catalog.articles.map((article) => articleFor(lang, article)).filter((article): article is Article => Boolean(article)),
      categories: translateDeep(catalog.categories),
      company: translateCmsRecord(catalog.company),
    };
    publishAvailability(lang, localized);
    return localized;
  });
  cache.set(catalog, value);
  return value;
}

/** The English catalog: only fully translated products/articles, everything translated. */
export function englishCatalog(catalog: SeoCatalog): SeoCatalog {
  return localizedCatalog(catalog, "en");
}

function publishAvailability(lang: ForeignLang, localized: SeoCatalog): void {
  // Caller must already be inside withLang(lang): product slugs depend on the active language.
  setLangAvailability(lang, {
    articles: localized.articles.map((article) => article.id),
    products: localized.products.map((product) => product.id),
    topics: [...new Set(localized.articles.map((article) => article.topic).filter((topic): topic is string => Boolean(topic)))],
    productPaths: productPathAliases(localized.products),
  });
}
