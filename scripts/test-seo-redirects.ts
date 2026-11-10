import assert from "node:assert/strict";
import { PRODUCTS } from "../src/data/productsData";
import { SERVICES, CATEGORIES_DATA, COMPANY_INFO } from "../src/data/mockData";
import { SEED_ARTICLES } from "../src/data/seedArticles";
import { isPublicProduct } from "../src/data/removedProducts";
import { isPublicArticle } from "../src/seo/articleMeta";
import { productSeoSlug, publicProductPath, seoRedirectFor, type SeoCatalog } from "../src/seo/resolveSeo";
import { PRODUCT_SLUG_BY_ID } from "../src/seo/productUrls";
import { DISABLED_PAGE_REDIRECT, isDisabledPagePath, rewriteDisabledHref } from "../src/data/disabledPages";
import { localizeJsonLd, resolveSeoForPath } from "../src/seo/localizeSeo";
import { CANONICAL_ORIGIN } from "../src/seo/resolveSeo";
import { setLang } from "../src/i18n";

const catalog: SeoCatalog = {
  products: PRODUCTS.filter((p) => isPublicProduct(p)),
  services: SERVICES.filter((s) => s.status !== "draft" && s.status !== "review"),
  projects: [],
  articles: SEED_ARTICLES.filter((a) => isPublicArticle(a)),
  categories: CATEGORIES_DATA as SeoCatalog["categories"],
  company: COMPANY_INFO as SeoCatalog["company"],
};

const pouya = catalog.products.find((p) => p.id === "ts-114");
const jet = catalog.products.find((p) => p.id === "ts-115");
assert.ok(pouya && jet, "seed fallback products ts-114 and ts-115 must be public");
assert.equal(publicProductPath(pouya), "/products/pouya-butterfly-feeder");
assert.equal(publicProductPath(jet), "/products/jet-heater");
assert.equal(seoRedirectFor("/products/pouya-butterfly-feeder", catalog), null, "pretty pouya slug is canonical (200)");
assert.equal(seoRedirectFor("/products/jet-heater", catalog), null, "pretty jet-heater slug is canonical (200)");
assert.equal(seoRedirectFor("/products/ts-114", catalog), "/products/pouya-butterfly-feeder");
assert.equal(seoRedirectFor("/products/ts-115", catalog), "/products/jet-heater");
assert.equal(seoRedirectFor("/products/ts-114", catalog), "/products/pouya-butterfly-feeder");
assert.equal(seoRedirectFor("/products/jet-heater", catalog), null);

for (const [id, slug] of Object.entries(PRODUCT_SLUG_BY_ID)) {
  const product = catalog.products.find((p) => p.id === id);
  assert.ok(product, `product ${id} should be public`);
  assert.equal(productSeoSlug(product), slug);
  assert.equal(seoRedirectFor(`/products/${slug}`, catalog), null, `${id} new slug is canonical`);
}

const oldSlugs: Record<string, string> = {
  "ts-012": "دوزاترون-سیستم-تزریق-دارو-مرغداری-کارنوتک-ts-012",
  "ts-019": "سیستم-اتوماسیون-مرغداری-کارنو-ts-019",
  "ts-057": "جت-هیتر-کارنو-ts-057",
  "ts-071": "سیستم-تهویه-کارنو-ts-071",
  "ts-072": "ایر-میکسر-کارنوتک-ts-072",
  "ts-090": "بشقاب-دانخوری-چیکن-کارنوتک-–-قابل-استفاده-از-یکروزگی-ts-090",
  "ts-108": "سیستم-مه-پاش-کارنو-ts-108",
  "ts-110": "آبخوری-نیپل-کارنو-–-نیپل-های-تمام-استیل-ts-110",
  "ts-111": "دریچه-اینلت-کارنو-ts-111",
};
for (const [id, old] of Object.entries(oldSlugs)) {
  const dest = seoRedirectFor(`/products/${old}`, catalog);
  assert.equal(dest, `/products/${PRODUCT_SLUG_BY_ID[id]}`, `${id} old slug 301`);
  assert.ok(!dest.includes("کارنو"), `${id} destination must not contain کارنو`);
  assert.equal(seoRedirectFor(`/products/${old}`, catalog), `/products/${PRODUCT_SLUG_BY_ID[id]}`);
}

assert.equal(DISABLED_PAGE_REDIRECT, "/services");
for (const path of ["/services/poultry-hall-fitout", "/services/srv-turnkey-shed", "/services/srv-consulting-efficiency", "/en/services/poultry-hall-fitout"]) {
  assert.equal(isDisabledPagePath(path), true, path);
  assert.equal(rewriteDisabledHref(path), "/services");
}
assert.equal(rewriteDisabledHref("https://www.toyooran.com/services/poultry-hall-fitout"), "https://www.toyooran.com/services");
assert.equal(rewriteDisabledHref("/products/heating"), "/products/heating");

const ld = localizeJsonLd({
  mainEntityOfPage: { "@type": "WebPage", "@id": `${CANONICAL_ORIGIN}/magazine/feeder-types-comparison` },
  publisher: { "@id": `${CANONICAL_ORIGIN}/#org` },
});
assert.equal((ld as { mainEntityOfPage: { "@id": string } }).mainEntityOfPage["@id"], `${CANONICAL_ORIGIN}/en/magazine/feeder-types-comparison`);
assert.equal((ld as { publisher: { "@id": string } }).publisher["@id"], `${CANONICAL_ORIGIN}/#org`);

setLang("en");
const enHome = resolveSeoForPath("/", catalog);
assert.equal(enHome.canonicalHref, `${CANONICAL_ORIGIN}/en`);
const enContact = resolveSeoForPath("/contact", catalog);
assert.equal(enContact.canonicalHref, `${CANONICAL_ORIGIN}/en/contact`);
const enGuide = resolveSeoForPath("/magazine/feeder-types-comparison", catalog);
assert.equal(enGuide.canonicalHref, `${CANONICAL_ORIGIN}/en/magazine/feeder-types-comparison`);
setLang("fa");
const faHome = resolveSeoForPath("/", catalog);
assert.equal(faHome.canonicalHref, `${CANONICAL_ORIGIN}/`);

console.log("seo redirect + canonical tests OK");
