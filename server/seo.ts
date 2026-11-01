import { loadSeoCatalog } from "./catalog";
import { englishCatalog } from "./i18n";
import { EN_PREFIX, localizeHref, pathLang, stripLangPrefix, withLang } from "../src/i18n";
import {
  CANONICAL_ORIGIN,
  canonicalPath,
  escapeHtml,
  isKnownPublicPath as isKnownWithCatalog,
  llmsTxt,
  resolveSeo,
  seoRedirectFor,
  sitemapEntries,
  stripQuery,
  isPrivateAppPath,
} from "../src/seo/resolveSeo";

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
  if (pathLang(path) === "en") {
    const neutral = stripLangPrefix(path);
    if (isPrivateAppPath(neutral)) return false;
    const en = englishCatalog(loadSeoCatalog());
    return withLang("en", () => isKnownWithCatalog(neutral, en) && !(neutral.startsWith("/magazine/topic/") && !topicHasEnglish(neutral, en)));
  }
  return isKnownWithCatalog(pathname, loadSeoCatalog());
}

function topicHasEnglish(neutralPath: string, en: ReturnType<typeof englishCatalog>): boolean {
  const slug = neutralPath.split("/").filter(Boolean)[2];
  return en.articles.some((a) => a.topic === slug);
}

/** "/x" → "/en/x" for a page that exists in English, else null. */
export function englishEquivalent(neutralPath: string): string | null {
  const en = englishCatalog(loadSeoCatalog());
  const ok = withLang("en", () => isKnownWithCatalog(neutralPath, en)) && !(neutralPath.startsWith("/magazine/topic/") && !topicHasEnglish(neutralPath, en));
  if (!ok || isPrivateAppPath(neutralPath)) return null;
  return neutralPath === "/" ? EN_PREFIX : `${EN_PREFIX}${neutralPath}`;
}

/**
 * /en URL of a Persian page that has no English version yet: send visitors (e.g. from the
 * language switch) to the closest English listing instead of a 404. Temporary (302).
 */
export function englishFallbackRedirect(pathname: string): string | null {
  const path = stripQuery(pathname);
  if (pathLang(path) !== "en") return null;
  const neutral = stripLangPrefix(path);
  if (isKnownPublicPath(path)) return null;
  if (!isKnownWithCatalog(neutral, loadSeoCatalog())) return null;
  const seg = neutral.split("/").filter(Boolean);
  if (seg[0] === "magazine") return `${EN_PREFIX}/magazine`;
  if (seg[0] === "products") return `${EN_PREFIX}/products`;
  return EN_PREFIX;
}

/** Persian paths of the seo redirects, mapped for /en too. */
export function seoRedirectForAnyLang(pathname: string, catalog: ReturnType<typeof loadSeoCatalog>): string | null {
  if (pathLang(pathname) !== "en") return seoRedirectFor(pathname, catalog);
  const r = seoRedirectFor(stripLangPrefix(pathname), catalog);
  return r ? withLang("en", () => localizeHref(r)) : null;
}

/** Localise canonical / page URLs inside JSON-LD for an English page (ids, images and the bare origin stay). */
function localizeJsonLd(value: unknown, key = ""): unknown {
  if (typeof value === "string") {
    if (key === "@id" || !value.startsWith(CANONICAL_ORIGIN)) return value;
    const rest = value.slice(CANONICAL_ORIGIN.length);
    if ((rest === "" || rest === "/") && key !== "item") return value;
    return localizeHref(value);
  }
  if (Array.isArray(value)) return value.map((v) => localizeJsonLd(v, key));
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if (k === "inLanguage" && typeof v === "string") out[k] = "en";
      else out[k] = localizeJsonLd(v, k);
    }
    return out;
  }
  return value;
}

function localizeBodyHrefs(html: string): string {
  return html.replace(/href="([^"]*)"/g, (_m, href: string) => `href="${localizeHref(href)}"`);
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

export function injectSeoTags(html: string, reqPath: string): string {
  const path = stripQuery(reqPath);
  const lang = pathLang(path);
  const neutral = stripLangPrefix(path);
  const catalog = loadSeoCatalog();
  const enCatalog = englishCatalog(catalog);
  const doc =
    lang === "en"
      ? withLang("en", () => {
          const d = resolveSeo(neutral, enCatalog);
          return {
            ...d,
            canonicalHref: d.canonicalHref ? localizeHref(d.canonicalHref) : null,
            body: localizeBodyHrefs(d.body),
            jsonLd: d.jsonLd.map((item) => localizeJsonLd(item)),
          };
        })
      : resolveSeo(path, catalog);
  let out = ensureViewport(html);
  out = deferRenderBlockingCss(out);
  if (lang === "en") {
    out = out.replace(/<html\b[^>]*>/i, '<html lang="en" dir="ltr">');
    // English pages use the Latin cut of the brand font.
    out = out.replace(/\/fonts\/estedad-(400|700)\.woff2/g, "/fonts/estedad-latin-$1.woff2");
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
${canonical}    <link rel="preload" as="image" type="image/webp" href="/images/hero-final-1-480.webp" imagesrcset="/images/hero-final-1-480.webp 480w, /images/hero-final-1-800.webp 800w, /images/hero-final-1.webp 1400w" imagesizes="100vw" />
    <meta property="og:title" content="${escapeHtml(doc.title)}" />
    <meta property="og:description" content="${escapeHtml(doc.description)}" />
    <meta property="og:url" content="${doc.canonicalHref || CANONICAL_ORIGIN}" />
    <meta property="og:type" content="${doc.ogType}" />
    <meta property="og:site_name" content="${lang === "en" ? "Toyooran Sanat Pouya" : "طیوران صنعت پویا"}" />
    <meta property="og:locale" content="${lang === "en" ? "en_US" : "fa_IR"}" />
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

/** hreflang fa / en / x-default (= Persian) when the page exists in both languages. */
function hreflangLinks(neutralPath: string, doc: { robots: string; notFound?: boolean }): string {
  if (doc.notFound || /noindex/.test(doc.robots)) return "";
  const en = englishEquivalent(neutralPath);
  if (!en) return "";
  const fa = canonicalPath(neutralPath);
  const enHref = canonicalPath(en);
  return `    <link rel="alternate" hreflang="fa" href="${fa}" />
    <link rel="alternate" hreflang="en" href="${enHref}" />
    <link rel="alternate" hreflang="x-default" href="${fa}" />
`;
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

/** llms.txt: the Persian section (unchanged) followed by the English section. */
export function llmsTxtAll(): string {
  const catalog = loadSeoCatalog();
  const en = englishCatalog(catalog);
  return `${llmsTxt(catalog)}\n${withLang("en", () => llmsTxt(en))}`;
}

export function sitemapXml(): string {
  const catalog = loadSeoCatalog();
  const enCatalog = englishCatalog(catalog);
  // Persian URLs first (unchanged), then the English pages under /en (only what exists in English).
  const enUrls = withLang("en", () => sitemapEntries(enCatalog))
    .filter((u) => !(u.loc.startsWith("/magazine/topic/") && !topicHasEnglish(u.loc, enCatalog)))
    .map((u) => ({ ...u, loc: u.loc === "/" ? EN_PREFIX : `${EN_PREFIX}${u.loc}` }));
  const urls = [...sitemapEntries(catalog), ...enUrls];
  const body = urls
    .map((u) => {
      const last = u.lastmod ? `\n    <lastmod>${u.lastmod}</lastmod>` : "";
      return `  <url>
    <loc>${xmlEscape(encodeURI(canonicalPath(u.loc)))}</loc>${last}
    <changefreq>weekly</changefreq>
    <priority>${u.priority}</priority>
  </url>`;
    })
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>`;
}
