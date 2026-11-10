import { isEn, localizeHref, pathLang, stripLangPrefix, withLang } from "../i18n";
import { CANONICAL_ORIGIN, resolveSeo, type SeoCatalog, type SeoDoc } from "./resolveSeo";

export function localizeBodyHrefs(html: string): string {
  return html.replace(/href="([^"]*)"/g, (_m, href: string) => `href="${localizeHref(href)}"`);
}

/**
 * Localise canonical / page URLs inside JSON-LD for an English page.
 * Shared entity ids (#org, #website) and the bare origin stay; page @id values
 * (e.g. mainEntityOfPage.@id) are rewritten to the /en URL.
 */
export function localizeJsonLd(value: unknown, key = ""): unknown {
  if (typeof value === "string") {
    if (!value.startsWith(CANONICAL_ORIGIN)) return value;
    const rest = value.slice(CANONICAL_ORIGIN.length);
    if (key === "@id" && /^\/?#/.test(rest)) return value;
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

/** Language-aware SEO doc for a request path, including /en/... on the client. */
export function resolveSeoForPath(pathname: string, catalog: SeoCatalog): SeoDoc {
  const path = (pathname.split(/[?#]/)[0] || "/") || "/";
  // Client English router uses basename /en, so useLocation() is already unprefixed.
  const lang = pathLang(path) === "en" || isEn() ? "en" : "fa";
  const neutral = stripLangPrefix(path);
  if (lang !== "en") return resolveSeo(path, catalog);
  return withLang("en", () => {
    const d = resolveSeo(neutral, catalog);
    return {
      ...d,
      canonicalHref: d.canonicalHref ? localizeHref(d.canonicalHref) : null,
      body: localizeBodyHrefs(d.body),
      jsonLd: d.jsonLd.map((item) => localizeJsonLd(item)),
    };
  });
}
