import assert from "node:assert/strict";
import { isLegacySpamUrl } from "../server/legacySpam";

const spam = [
  "/?goods/252000762", "/?goods/201028075", "/?goods%2F122004524", "/?jp/246020541_html", "/?jp%2F246020541_html",
  "/?detail/2520007620846", "/?sitemapindex.xml", "/?sitemapindex", "/0x04b8ffa9/", "/0x04b8ffa9", "/0XABCDEF/", "/index.html?goods/1",
];
const legit = [
  "/", "/?utm_source=google&utm_medium=cpc", "/?gclid=abc", "/?q=goods/1", "/?fbclid=x", "/products", "/products/feeding",
  "/products/feeding?goods/1", "/magazine/feeder-types-comparison", "/sitemap.xml", "/?goods=1", "/?ref=goods/1", "/0x", "/0xzz/",
  "/0x04b8ffa9/extra", "/services/srv-turnkey-shed", "/contact?cta=article-consult", "/?jp", "/?detailed=1",
];
for (const url of spam) assert.equal(isLegacySpamUrl(url), true, `should be spam: ${url}`);
for (const url of legit) assert.equal(isLegacySpamUrl(url), false, `should be legit: ${url}`);
console.log(`legacy spam matcher OK: ${spam.length} spam, ${legit.length} legit`);
