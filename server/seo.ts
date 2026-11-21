import { loadSeoCatalog } from "./catalog";
import { HOME_HERO_MOBILE_PHOTO, HOME_HERO_PHOTO, sitePhotoSrc, sitePhotoSrcSet } from "../src/data/sitePhotos";
import { localizedCatalog } from "./i18n";
import { LANG_PREFIX, type ForeignLang, localizeHref, pathLang, stripLangPrefix, withLang } from "../src/i18n";
import {
  CANONICAL_ORIGIN,
  canonicalPath,
  escapeHtml,
  equivalentPublicPath,
  isKnownPublicPath as isKnownWithCatalog,
  llmsTxt,
  resolveSeo,
  seoRedirectFor,
  sitemapEntries,
  stripQuery,
  isPrivateAppPath,
} from "../src/seo/resolveSeo";
import { localizeBodyHrefs, localizeJsonLd } from "../src/seo/localizeSeo";
import { isLegacyCompetitorProductSlug } from "../src/seo/productUrls";
import { removedProductRedirect } from "../src/data/removedProducts";

export { CANONICAL_ORIGIN, stripQuery, canonicalPath, resolveSeo, seoRedirectFor, llmsTxt, isPrivateAppPath };

const KEEP_QUERY_PARAMS = /^(utm_[a-z]+|gclid|gbraid|wbraid|fbclid|msclkid|_gl|cta|product)$/i;

/**
 * Returns a normalized path+query for public HTML URLs, or null when nothing changes.
 * - /index.html -> /
 * - trailing slash -> no slash (except root)
 * - drops query params that are not analytics/lead-tracking (e.g. ?s=, ?p=, ?page=, ?sort=)
 * One hop only: the combined result is returned so callers issue a single 301.
 */
export function normalizePublicUrl(originalUrl: string): string | null {
  const [rawPath, rawQuery = ""] = originalUrl.split("#")[0].split("?");
  let pathname = rawPath || "/";
  if (pathname === "/index.html") pathname = "/";
  if (pathname.length > 1 && pathname.endsWith("/")) pathname = pathname.replace(/\/+$/, "") || "/";
  if (isPrivateAppPath(pathname)) return null;
  const params = new URLSearchParams(rawQuery);
  const kept = new URLSearchParams();
  params.forEach((value, key) => {
    if (KEEP_QUERY_PARAMS.test(key)) kept.append(key, value);
  });
  const query = kept.toString();
  const next = query ? `${pathname}?${query}` : pathname;
  const current = rawQuery ? `${rawPath}?${rawQuery}` : rawPath;
  return next !== current ? next : null;
}

export function isKnownPublicPath(pathname: string): boolean {
  const path = stripQuery(pathname);
  const lang = pathLang(path);
  if (lang !== "fa") {
    const neutral = stripLangPrefix(path);
    if (isPrivateAppPath(neutral)) return false;
    const localized = localizedCatalog(loadSeoCatalog(), lang);
    return withLang(lang, () => isKnownWithCatalog(neutral, localized) && !(neutral.startsWith("/magazine/topic/") && !topicHasLang(neutral, localized)));
  }
  return isKnownWithCatalog(pathname, loadSeoCatalog());
}

function topicHasLang(neutralPath: string, localized: ReturnType<typeof localizedCatalog>): boolean {
  const slug = neutralPath.split("/").filter(Boolean)[2];
  return localized.articles.some((a) => a.topic === slug);
}

/** "/x" → the same page in `lang`, with that language's product slug. Article URLs stay as they are. */
export function foreignEquivalent(neutralPath: string, lang: ForeignLang): string | null {
  const localized = localizedCatalog(loadSeoCatalog(), lang);
  const prefix = LANG_PREFIX[lang];
  const mapped = withLang(lang, () => equivalentPublicPath(neutralPath, localized));
  if (!mapped || isPrivateAppPath(mapped)) return null;
  if (mapped.startsWith("/magazine/topic/") && !topicHasLang(mapped, localized)) return null;
  return mapped === "/" ? prefix : `${prefix}${mapped}`;
}

/** "/x" → "/en/x" for a page that exists in English, else null. */
export function englishEquivalent(neutralPath: string): string | null {
  return foreignEquivalent(neutralPath, "en");
}

/**
 * Foreign URL of a Persian page that has no translation yet: send visitors (e.g. from the
 * language switch) to the closest listing instead of a 404. Temporary (302).
 */
export function foreignFallbackRedirect(pathname: string): string | null {
  const path = stripQuery(pathname);
  const lang = pathLang(path);
  if (lang === "fa") return null;
  const prefix = LANG_PREFIX[lang];
  const neutral = stripLangPrefix(path);
  if (isKnownPublicPath(path)) return null;
  if (!isKnownWithCatalog(neutral, loadSeoCatalog())) return null;
  const seg = neutral.split("/").filter(Boolean);
  if (seg[0] === "magazine") return `${prefix}/magazine`;
  if (seg[0] === "products") return `${prefix}/products`;
  return prefix;
}

/** /en URL of a Persian page that has no English version yet. Temporary (302). */
export function englishFallbackRedirect(pathname: string): string | null {
  return pathLang(stripQuery(pathname)) === "en" ? foreignFallbackRedirect(pathname) : null;
}

/** Persian paths of the seo redirects, mapped for /en and /tr too. */
export function seoRedirectForAnyLang(pathname: string, catalog: ReturnType<typeof loadSeoCatalog>): string | null {
  const lang = pathLang(pathname);
  if (lang === "fa") return seoRedirectFor(pathname, catalog);
  const prefix = LANG_PREFIX[lang];
  const neutral = stripLangPrefix(pathname);
  const productSlug = neutral.split("/").filter(Boolean);
  // Hidden products 301 to their category in every language (including old competitor-name slugs).
  if (productSlug[0] === "products" && productSlug[1]) {
    const removed = removedProductRedirect(productSlug[1]);
    if (removed) return `${prefix}${removed}`;
    // Old competitor-name slugs under /en or /tr must 301 in a single hop to the listing,
    // not 301 to the new Persian slug and then 302 because there is no translated page.
    if (isLegacyCompetitorProductSlug(productSlug[1])) {
      return `${prefix}/products`;
    }
  }
  const localizedCatalogForLang = localizedCatalog(catalog, lang);
  const translated = withLang(lang, () => seoRedirectFor(neutral, localizedCatalogForLang));
  if (translated) {
    const localized = withLang(lang, () => localizeHref(translated));
    return foreignFallbackRedirect(localized) || localized;
  }
  // Already the canonical URL in this language: do not rewrite it back to Persian.
  if (withLang(lang, () => isKnownWithCatalog(neutral, localizedCatalogForLang))) return null;
  // No page in this language. An old Persian slug still resolves on the Persian catalog
  // and then falls back to this language's listing, instead of a 404.
  const faRedirect = seoRedirectFor(neutral, catalog);
  if (!faRedirect) return null;
  const localized = withLang(lang, () => localizeHref(faRedirect));
  return foreignFallbackRedirect(localized) || localized;
}

function deferRenderBlockingCss(html: string): string {
  return html.replace(/<link rel="stylesheet"([^>]*href="[^"]+\.css"[^>]*)\/?>/gi, (_full, attrs: string) => {
    return `<link rel="preload" as="style"${attrs} onload="this.onload=null;this.rel='stylesheet'" />
    <noscript><link rel="stylesheet"${attrs} /></noscript>`;
  });
}

function ensureViewport(html: string): string {
  if (/name="viewport"/i.test(html)) return html;
  return html.replace("<head>", `<head>\n    <meta name="viewport" content="width=device-width, initial-scale=1.0" />`);
}

function stripSocialMeta(html: string): string {
  return html
    .replace(/<meta[^>]*(?:property|name)="(?:og|twitter):[^"]*"[^>]*>\s*/gi, "")
    .replace(/<link[^>]*rel="canonical"[^>]*>\s*/gi, "");
}

/**
 * Home hero (src/components/LazyHeroImage.tsx, site photo 05): preload the same AVIF the <picture> picks,
 * the 4:5 mobile crop up to 767px and the landscape photo above. Only on the home page, where it is the LCP.
 */
const HOME_HERO_PRELOAD = `    <link rel="preload" as="image" type="image/avif" media="(max-width: 767px)" href="${sitePhotoSrc(HOME_HERO_MOBILE_PHOTO).replace(/\.webp$/, ".avif")}" imagesrcset="${sitePhotoSrcSet(HOME_HERO_MOBILE_PHOTO, "avif")}" imagesizes="100vw" fetchpriority="high" />
    <link rel="preload" as="image" type="image/avif" media="(min-width: 768px)" href="${sitePhotoSrc(HOME_HERO_PHOTO).replace(/\.webp$/, ".avif")}" imagesrcset="${sitePhotoSrcSet(HOME_HERO_PHOTO, "avif")}" imagesizes="100vw" fetchpriority="high" />
`;

export function injectSeoTags(html: string, reqPath: string): string {
  const path = stripQuery(reqPath);
  const lang = pathLang(path);
  const neutral = stripLangPrefix(path);
  const catalog = loadSeoCatalog();
  const foreignCatalog = lang === "fa" ? null : localizedCatalog(catalog, lang);
  const doc =
    lang === "fa" || !foreignCatalog
      ? resolveSeo(path, catalog)
      : withLang(lang, () => {
          const d = resolveSeo(neutral, foreignCatalog);
          return {
            ...d,
            canonicalHref: d.canonicalHref ? localizeHref(d.canonicalHref) : null,
            body: localizeBodyHrefs(d.body),
            jsonLd: d.jsonLd.map((item) => localizeJsonLd(item)),
          };
        });
  let out = ensureViewport(html);
  out = deferRenderBlockingCss(out);
  const ltr = lang === "en" || lang === "tr" || lang === "ru";
  if (ltr) {
    out = out.replace(/<html\b[^>]*>/i, `<html lang="${lang}" dir="ltr">`);
    // Latin-script pages use the Latin cut of the brand font. Arabic stays on the Arabic/Persian cut.
    out = out.replace(/\/fonts\/estedad-(400|700)\.woff2/g, "/fonts/estedad-latin-$1.woff2");
  } else if (lang === "ar") {
    out = out.replace(/<html\b[^>]*>/i, '<html lang="ar" dir="rtl">');
  } else {
    out = out.replace(/<html\b[^>]*>/i, '<html lang="fa-IR" dir="rtl">');
  }
  out = out.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(doc.title)}</title>`);
  if (out.includes('name="description"')) {
    out = out.replace(
      /<meta[^>]*name="description"[^>]*>/i,
      `<meta name="description" content="${escapeHtml(doc.description)}" />`
    );
  } else {
    out = out.replace("</head>", `  <meta name="description" content="${escapeHtml(doc.description)}" />\n  </head>`);
  }

  if (isPrivateAppPath(path)) {
    out = stripSocialMeta(out);
    const privateMeta = `    <meta name="robots" content="noindex, nofollow, noarchive" />
    <meta name="googlebot" content="noindex, nofollow, noarchive" />
`;
    out = out.replace("</head>", `${privateMeta}  </head>`);
    return out;
  }

  // index.html ships homepage og:title/og:description; drop them so each page has one set.
  out = stripSocialMeta(out);
  const robots = `    <meta name="robots" content="${doc.robots}" />\n`;
  const canonical = doc.canonicalHref
    ? `    <link rel="canonical" href="${doc.canonicalHref}" />\n${hreflangLinks(neutral, doc)}`
    : "";
  const jsonLd = doc.jsonLd.length
    ? `    <script type="application/ld+json">${JSON.stringify({ "@context": "https://schema.org", "@graph": doc.jsonLd }).replace(/</g, "\\u003c")}</script>\n`
    : "";
  const extra = `
${canonical}${neutral === "/" ? HOME_HERO_PRELOAD : ""}    <meta property="og:title" content="${escapeHtml(doc.title)}" />
    <meta property="og:description" content="${escapeHtml(doc.description)}" />
    <meta property="og:url" content="${doc.canonicalHref || CANONICAL_ORIGIN}" />
    <meta property="og:type" content="${doc.ogType}" />
    <meta property="og:site_name" content="${escapeHtml(lang === "ar" ? "طيوران صنعت بويا" : lang === "ru" ? "Тайуран Санат Пуя" : lang === "fa" ? "طیوران صنعت پویا" : "Toyooran Sanat Pouya")}" />
    <meta property="og:locale" content="${lang === "ar" ? "ar_AR" : lang === "ru" ? "ru_RU" : lang === "tr" ? "tr_TR" : lang === "en" ? "en_US" : "fa_IR"}" />
    <meta property="og:image" content="${escapeHtml(doc.ogImage || `${CANONICAL_ORIGIN}/images/hero-final-1.jpg`)}" />
    <meta name="twitter:image" content="${escapeHtml(doc.ogImage || `${CANONICAL_ORIGIN}/images/hero-final-1.jpg`)}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(doc.title)}" />
    <meta name="twitter:description" content="${escapeHtml(doc.description)}" />
${robots}${jsonLd}`;
  out = out.replace("</head>", `${extra}  </head>`);
  const prerender = `
    <div id="seo-prerender" aria-hidden="true">
      <h1>${escapeHtml(doc.h1)}</h1>
      ${doc.body}
    </div>`;
  if (out.includes('<div id="root"></div>')) {
    out = out.replace('<div id="root"></div>', `<div id="root"></div>${prerender}`);
  }
  return out;
}

type HreflangAlt = { hreflang: string; href: string };

/** Equivalent URLs (fa, en, tr, ru, ar, x-default = Persian) for a Persian neutral path, or [] when it has no translation. */
function hreflangAlternates(faNeutral: string): HreflangAlt[] {
  const en = foreignEquivalent(faNeutral, "en");
  const tr = foreignEquivalent(faNeutral, "tr");
  const ru = foreignEquivalent(faNeutral, "ru");
  const ar = foreignEquivalent(faNeutral, "ar");
  if (!en && !tr && !ru && !ar) return [];
  const fa = canonicalPath(faNeutral);
  const out: HreflangAlt[] = [{ hreflang: "fa", href: fa }];
  if (en) out.push({ hreflang: "en", href: canonicalPath(en) });
  if (tr) out.push({ hreflang: "tr", href: canonicalPath(tr) });
  if (ru) out.push({ hreflang: "ru", href: canonicalPath(ru) });
  if (ar) out.push({ hreflang: "ar", href: canonicalPath(ar) });
  out.push({ hreflang: "x-default", href: fa });
  return out;
}

/** hreflang fa / en / tr / ru / ar / x-default (= Persian) for each language the page exists in. */
function hreflangLinks(neutralPath: string, doc: { robots: string; notFound?: boolean }): string {
  if (doc.notFound || /noindex/.test(doc.robots)) return "";
  const faNeutral = withLang("fa", () => equivalentPublicPath(neutralPath, loadSeoCatalog()));
  if (!faNeutral) return "";
  const alts = hreflangAlternates(faNeutral);
  if (!alts.length) return "";
  return `${alts.map((a) => `    <link rel="alternate" hreflang="${a.hreflang}" href="${a.href}" />`).join("\n")}\n`;
}

function robotsPrivateDisallows(): string {
  // /api/magazine is public JSON the SPA needs while Google renders magazine pages;
  // if it is blocked, the renderer falls back to bundled seed articles and CMS-only posts render as 404.
  return `Allow: /api/magazine
Disallow: /admin
Disallow: /login
Disallow: /dashboard
Disallow: /crm
Disallow: /api/`;
}

export function robotsTxt(): string {
  const disallows = robotsPrivateDisallows();
  return `User-agent: *
Allow: /
${disallows}

User-agent: GPTBot
Allow: /
${disallows}

User-agent: OAI-SearchBot
Allow: /
${disallows}

User-agent: Claude-SearchBot
Allow: /
${disallows}

User-agent: PerplexityBot
Allow: /
${disallows}

Sitemap: ${CANONICAL_ORIGIN}/sitemap.xml
# AI/citation: ${CANONICAL_ORIGIN}/llms.txt
`;
}

function xmlEscape(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/'/g, "&apos;").replace(/"/g, "&quot;");
}

/** llms.txt: Persian, then English, then Turkish. */
export function llmsTxtAll(): string {
  const catalog = loadSeoCatalog();
  const en = localizedCatalog(catalog, "en");
  const tr = localizedCatalog(catalog, "tr");
  const ru = localizedCatalog(catalog, "ru");
  const ar = localizedCatalog(catalog, "ar");
  return `${llmsTxt(catalog)}\n${withLang("en", () => llmsTxt(en))}\n${withLang("tr", () => llmsTxt(tr))}\n${withLang("ru", () => llmsTxt(ru))}\n${withLang("ar", () => llmsTxt(ar))}`;
}

function localizedSitemapUrls(catalog: ReturnType<typeof loadSeoCatalog>, lang: ForeignLang) {
  const localized = localizedCatalog(catalog, lang);
  const prefix = LANG_PREFIX[lang];
  return withLang(lang, () => sitemapEntries(localized))
    .filter((u) => !(u.loc.startsWith("/magazine/topic/") && !topicHasLang(u.loc, localized)))
    .map((u) => ({ ...u, loc: u.loc === "/" ? prefix : `${prefix}${u.loc}` }));
}

export function sitemapXml(): string {
  const catalog = loadSeoCatalog();
  // Persian URLs first (unchanged), then /en, /tr, /ru, /ar (only pages that exist in that language).
  const fa = sitemapEntries(catalog);
  const urls = [
    ...fa.map((u) => ({ ...u, faNeutral: u.loc })),
    ...(["en", "tr", "ru", "ar"] as const).flatMap((lang) =>
      localizedSitemapUrls(catalog, lang).map((u) => ({ ...u, faNeutral: withLang("fa", () => equivalentPublicPath(u.loc.slice(LANG_PREFIX[lang].length) || "/", catalog)) })),
    ),
  ];
  // Same alternate set as the page's <link rel="alternate"> tags, repeated on every member of the group.
  const altCache = new Map<string, HreflangAlt[]>();
  const altsFor = (faNeutral: string | null | undefined): HreflangAlt[] => {
    if (!faNeutral) return [];
    if (!altCache.has(faNeutral)) altCache.set(faNeutral, hreflangAlternates(faNeutral));
    return altCache.get(faNeutral)!;
  };
  const body = urls
    .map((u) => {
      const last = u.lastmod ? `\n    <lastmod>${u.lastmod}</lastmod>` : "";
      const loc = canonicalPath(u.loc);
      const alts = altsFor(u.faNeutral);
      const links = alts.some((a) => a.href === loc)
        ? alts.map((a) => `\n    <xhtml:link rel="alternate" hreflang="${a.hreflang}" href="${xmlEscape(encodeURI(a.href))}" />`).join("")
        : "";
      return `  <url>
    <loc>${xmlEscape(encodeURI(loc))}</loc>${last}${links}
    <changefreq>weekly</changefreq>
    <priority>${u.priority}</priority>
  </url>`;
    })
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${body}
</urlset>`;
}
