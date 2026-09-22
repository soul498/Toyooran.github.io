import { loadSeoCatalog } from "./catalog";
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
} from "../src/seo/resolveSeo";

export { CANONICAL_ORIGIN, stripQuery, canonicalPath, resolveSeo, seoRedirectFor, llmsTxt };

export function isKnownPublicPath(pathname: string): boolean {
  return isKnownWithCatalog(pathname, loadSeoCatalog());
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

export function injectSeoTags(html: string, reqPath: string): string {
  const path = stripQuery(reqPath);
  const doc = resolveSeo(path, loadSeoCatalog());
  let out = ensureViewport(html);
  out = deferRenderBlockingCss(out);
  out = out.replace(/<html\b[^>]*>/i, '<html lang="fa-IR" dir="rtl">');
  out = out.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(doc.title)}</title>`);
  if (out.includes('name="description"')) {
    out = out.replace(
      /<meta[^>]*name="description"[^>]*>/i,
      `<meta name="description" content="${escapeHtml(doc.description)}" />`
    );
  } else {
    out = out.replace("</head>", `  <meta name="description" content="${escapeHtml(doc.description)}" />\n  </head>`);
  }
  const robots = `    <meta name="robots" content="${doc.robots}" />\n`;
  const canonical = doc.canonicalHref
    ? `    <link rel="canonical" href="${doc.canonicalHref}" />\n`
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
    <meta property="og:site_name" content="طیوران صنعت پویا" />
    <meta property="og:image" content="${CANONICAL_ORIGIN}/images/hero-final-1.jpg" />
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

export function robotsTxt(): string {
  return `User-agent: *
Allow: /
Disallow: /admin
Disallow: /login
Disallow: /dashboard
Disallow: /crm
Disallow: /api/

User-agent: GPTBot
Allow: /

User-agent: OAI-SearchBot
Allow: /

User-agent: Claude-SearchBot
Allow: /

User-agent: PerplexityBot
Allow: /

Sitemap: ${CANONICAL_ORIGIN}/sitemap.xml
# AI/citation: ${CANONICAL_ORIGIN}/llms.txt
`;
}

export function sitemapXml(): string {
  const urls = sitemapEntries(loadSeoCatalog());
  const body = urls
    .map((u) => {
      const last = u.lastmod ? `\n    <lastmod>${u.lastmod}</lastmod>` : "";
      return `  <url>
    <loc>${canonicalPath(u.loc)}</loc>${last}
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
