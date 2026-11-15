import assert from "node:assert/strict";
import { PRODUCTS } from "../src/data/productsData";
import { SERVICES, CATEGORIES_DATA, COMPANY_INFO } from "../src/data/mockData";
import { SEED_ARTICLES } from "../src/data/seedArticles";
import { isPublicProduct, rewriteRemovedProductHref, REMOVED_PRODUCT_LINK_FALLBACK, removedProductRedirect } from "../src/data/removedProducts";
import { isPublicArticle } from "../src/seo/articleMeta";
import { productSeoSlug, publicProductPath, seoRedirectFor, type SeoCatalog } from "../src/seo/resolveSeo";
import { PRODUCT_SLUG_BY_ID, LEGACY_COMPETITOR_PRODUCT_SLUGS, isLegacyCompetitorProductSlug } from "../src/seo/productUrls";
import { DISABLED_PAGE_REDIRECT, isDisabledPagePath, rewriteDisabledHref } from "../src/data/disabledPages";
import { parseInline } from "../src/seo/richText";
import { SERVICE_PAGE_SLUGS } from "../src/data/servicePages";
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

const oldSlugs = LEGACY_COMPETITOR_PRODUCT_SLUGS;
for (const [id, old] of Object.entries(oldSlugs)) {
  const dest = seoRedirectFor(`/products/${old}`, catalog);
  const current = PRODUCT_SLUG_BY_ID[id];
  if (current) {
    assert.equal(dest, `/products/${current}`, `${id} old slug 301`);
  } else {
    assert.equal(dest, "/products/feeding", `${id} hidden product old slug 301 to category`);
  }
  assert.ok(dest && !dest.includes("کارنو"), `${id} destination must not contain کارنو`);
  assert.equal(isLegacyCompetitorProductSlug(old), true, `${id} marked as legacy competitor slug`);
}

const hiddenFeedingSlugs = [
  "بشقاب-دانخوری-چیکن-پلاس-ts-013",
  "بشقاب-دانخوری-چیکن-–-قابل-استفاده-از-یکروزگی-ts-090",
  "بشقاب-دانخوری-چیکن-کارنوتک-–-قابل-استفاده-از-یکروزگی-ts-090",
  "بشقاب-دانخوری-توری-منحنی-ts-091",
  "بشقاب-دانخوری-کوناوی-konavi-ts-091",
];
for (const slug of hiddenFeedingSlugs) {
  assert.equal(seoRedirectFor(`/products/${slug}`, catalog), "/products/feeding", `fa ${slug}`);
  assert.equal(removedProductRedirect(slug), "/products/feeding", `category ${slug}`);
}
assert.equal(catalog.products.some((p) => ["ts-013", "ts-090", "ts-091"].includes(p.id)), false, "hidden feeding products are not public");

assert.equal(rewriteRemovedProductHref("/products/بشقاب-دانخوری-چیکن-پلاس-ts-013"), REMOVED_PRODUCT_LINK_FALLBACK);
assert.equal(rewriteRemovedProductHref("https://www.toyooran.com/en/products/بشقاب-دانخوری-چیکن-پلاس-ts-013"), "https://www.toyooran.com/products/pouya-butterfly-feeder");
assert.equal(rewriteRemovedProductHref("/products/feeding"), "/products/feeding");
assert.equal(rewriteRemovedProductHref("/products/فن-سیرکوله-صنعتی-کولاک-گستر-ts-002"), "/products/فن-سیرکوله-صنعتی-کولاک-گستر-ts-002");
const inline = parseInline("بشقاب‌هایی مثل [پروانه‌ای](/products/بشقاب-دانخوری-چیکن-پلاس-ts-013) را بررسی کنید.");
assert.equal(inline.find((part) => part.href)?.href, REMOVED_PRODUCT_LINK_FALLBACK);

// The server composes this: /en/<legacy-slug> → 301 /en/products (one hop).
for (const old of Object.values(LEGACY_COMPETITOR_PRODUCT_SLUGS)) {
  assert.equal(isLegacyCompetitorProductSlug(old), true);
  assert.equal(isLegacyCompetitorProductSlug(encodeURIComponent(old)), true);
}
assert.equal(isLegacyCompetitorProductSlug("جت-هیتر-ts-057"), false);
assert.equal(isLegacyCompetitorProductSlug("jet-heater"), false);
assert.equal(isLegacyCompetitorProductSlug(encodeURIComponent(encodeURIComponent("جت-هیتر-کارنو-ts-057"))), true);


assert.equal(DISABLED_PAGE_REDIRECT, "/services");
// Retired service pages point at the closest of the six new service pages (src/data/disabledPages.ts).
for (const [path, target] of [
  ["/services/poultry-hall-fitout", "/services/modernization"],
  ["/services/srv-turnkey-shed", "/services/industrial-buildings"],
  ["/services/srv-poultry-equipment-supply", "/services/farm-equipment-installation"],
  ["/services/srv-machinery-manufacturing", "/services/feed-machinery"],
  ["/services/srv-feed-formulation-pharma", "/services/feed-products"],
  ["/services/srv-consulting-efficiency", "/services/modernization"],
  ["/en/services/poultry-hall-fitout", "/services/modernization"],
]) {
  assert.equal(isDisabledPagePath(path), true, path);
  assert.equal(rewriteDisabledHref(path), target, path);
}
for (const slug of SERVICE_PAGE_SLUGS) assert.equal(isDisabledPagePath(`/services/${slug}`), false, slug);
assert.equal(rewriteDisabledHref("https://www.toyooran.com/services/poultry-hall-fitout"), "https://www.toyooran.com/services/modernization");
assert.equal(rewriteDisabledHref("/products/heating"), "/products/heating");

assert.equal(seoRedirectFor("/products/other", catalog), "/products/ventilation");
const tunnel = catalog.products.find((p) => p.id === "ts-071");
const automation = catalog.products.find((p) => p.id === "ts-019");
assert.equal(tunnel?.category, "ventilation");
assert.equal(automation?.category, "automation");
assert.equal(catalog.categories.some((c) => c.id === "other"), false);
assert.ok(catalog.categories.some((c) => c.id === "automation"));

setLang("en");
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
