/**
 * Bilingual core (fa = default at the existing URLs, en under /en).
 *
 * Translation model: every English string is keyed by the EXACT Persian source text it translates
 * (src/i18n/en/*.json; magazine articles in src/i18n/en/magazine.json as {articleId: {fa: en}}). When the Persian text changes,
 * its old key no longer matches, so the English is reported as missing/stale by `npm run check:i18n`
 * and the page keeps working (Persian fallback for a UI string; content pages drop out of /en until
 * complete). See docs/i18n.md.
 *
 * Persian pages never load the English dictionary: the client imports ./enDict lazily only for /en
 * URLs (src/main.tsx); the server imports it directly.
 */
import type UI_EN from './en/ui.json';

export type Lang = 'fa' | 'en';
/** Typed UI keys: a Persian UI literal without an entry in en/ui.json fails `npm run lint`. */
export type UiKey = keyof typeof UI_EN;

export const EN_PREFIX = '/en';

let current: Lang = 'fa';
let dict: Record<string, string> = {};
/** Per-document overlay (server: one magazine article's own entries), checked before `dict`. */
let overlay: Record<string, string> | null = null;

/** Language of a pathname: /en and /en/... are English, everything else Persian. */
export function pathLang(pathname: string | undefined | null): Lang {
  const p = String(pathname || '/');
  return p === EN_PREFIX || p.startsWith(`${EN_PREFIX}/`) ? 'en' : 'fa';
}

/** "/en/products/x" → "/products/x"; "/en" → "/". Persian paths are returned unchanged. */
export function stripLangPrefix(pathname: string): string {
  if (pathLang(pathname) !== 'en') return pathname || '/';
  const rest = pathname.slice(EN_PREFIX.length);
  return rest && rest !== '/' ? rest : '/';
}

export function getLang(): Lang {
  return current;
}
export const isEn = (): boolean => current === 'en';

/** Install the English dictionary (server: once at startup; client: before the first /en render). */
export function setEnDictionary(entries: Record<string, string>): void {
  dict = entries;
}
export function setLang(lang: Lang): void {
  current = lang;
}
/** Run `fn` with an extra dictionary layered on top (synchronous). */
export function withOverlay<T>(extra: Record<string, string> | undefined, fn: () => T): T {
  const prev = overlay;
  overlay = extra && Object.keys(extra).length ? { ...(prev || {}), ...extra } : prev;
  try {
    return fn();
  } finally {
    overlay = prev;
  }
}
/** Run `fn` with `lang` active (synchronous; used by the server around one render). */
export function withLang<T>(lang: Lang, fn: () => T): T {
  const prev = current;
  current = lang;
  try {
    return fn();
  } finally {
    current = prev;
  }
}

const FA_CHARS = /[\u0600-\u06FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
export const hasPersian = (s: string): boolean => FA_CHARS.test(s);

/** Normalise the lookup key exactly like the extractor does (trim only; inner text is kept verbatim). */
export const keyOf = (s: string): string => s.trim();

/** Persian only in digits/number punctuation (e.g. «۱۰۰٬۰۰۰», «۳۸۰V»): converted automatically, no entry needed. */
const NUMERIC_FA = /^[^\u0600-\u06FF\uFB50-\uFDFF\uFE70-\uFEFF]*$/;
export function autoEnglish(fa: string): string | undefined {
  const plain = fa.replace(/[۰-۹٠-٩٬٫٪]/g, '');
  if (plain === fa || !NUMERIC_FA.test(plain)) return undefined;
  return latinDigits(fa).replace(/٬/g, ',').replace(/٫/g, '.').replace(/٪/g, '%');
}

/** English for an exact Persian string, or undefined. Always undefined-safe. */
export function lookupEn(fa: string): string | undefined {
  if (!fa) return undefined;
  const hit = overlay?.[fa] ?? overlay?.[keyOf(fa)] ?? dict[fa] ?? dict[keyOf(fa)];
  if (hit === undefined || hit === '') return autoEnglish(fa);
  return hit;
}

/** UI string: Persian as-is on Persian pages; English (falls back to Persian) on /en. */
export function t(fa: UiKey): string {
  if (current === 'fa') return fa as string;
  return lookupEn(fa as string) ?? (fa as string);
}

/** Content string (data, CMS): same as t() but untyped. */
export function tr(fa: string): string {
  if (current === 'fa' || !fa || !hasPersian(fa)) return fa;
  return lookupEn(fa) ?? fa;
}

/** Template: tf('{n} محصول', { n: 3 }) — the template itself is the dictionary key. */
export function tf(template: UiKey, vars: Record<string, string | number>): string {
  const base = t(template);
  return base.replace(/\{(\w+)\}/g, (_m, k: string) => (k in vars ? String(vars[k]) : `{${k}}`));
}

/** Marks a Persian literal that intentionally stays Persian in every language (e.g. a lead value sent to the sales team). check:i18n skips it. */
export const keepFa = (fa: string): string => fa;

/** Pick between a Persian and an English value at render time. */
export const pick = <T,>(fa: T, en: T): T => (current === 'en' ? en : fa);

/** True when every Persian string inside `value` has an English entry. */
export function isFullyTranslated(value: unknown): boolean {
  if (typeof value === 'string') return !hasPersian(value) || lookupEn(value) !== undefined;
  if (Array.isArray(value)) return value.every(isFullyTranslated);
  if (value && typeof value === 'object') return Object.values(value as Record<string, unknown>).every(isFullyTranslated);
  return true;
}

/** Collect the Persian strings in `value` that have no English entry. */
export function missingIn(value: unknown, out: string[] = []): string[] {
  if (typeof value === 'string') {
    if (hasPersian(value) && lookupEn(value) === undefined) out.push(value);
  } else if (Array.isArray(value)) value.forEach((v) => missingIn(v, out));
  else if (value && typeof value === 'object') Object.values(value as Record<string, unknown>).forEach((v) => missingIn(v, out));
  return out;
}

/** English copy of a product; keeps its Persian name for the URL slug (/en/products/<same slug>). */
export function translateProduct<T extends { name?: string; slugName?: string }>(product: T): T {
  if (current === 'fa') return product;
  const manual = (product as T & { translations?: { en?: Partial<T> } }).translations?.en;
  return { ...deep(product), ...(manual || {}), slugName: product.slugName ?? product.name };
}

/** CMS records may carry an explicitly authored English overlay. It wins over the
 * legacy Persian-key dictionary and lets new content be translated from /admin. */
export function translateCmsRecord<T extends { translations?: { en?: Partial<T> } }>(value: T): T {
  if (current === 'fa') return value;
  return { ...deep(value), ...(value.translations?.en || {}) };
}

/** Deep copy with every Persian string translated (Persian kept where no entry exists). Identity on fa. */
export function translateDeep<T>(value: T): T {
  if (current === 'fa') return value;
  return deep(value);
}
function deep<T>(value: T): T {
  if (typeof value === 'string') return tr(value) as unknown as T;
  if (Array.isArray(value)) return value.map(deep) as unknown as T;
  if (value && typeof value === 'object') {
    // Only plain data objects (never React elements/components or class instances).
    const proto = Object.getPrototypeOf(value);
    if ((proto !== Object.prototype && proto !== null) || '$$typeof' in (value as object)) return value;
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) out[k] = deep(v);
    return out as T;
  }
  return value;
}

/** Ids of magazine articles / products with a complete English version (set by the data layer). */
const enAvailable = { articles: new Set<string>(), products: new Set<string>(), topics: new Set<string>() };
let availabilityKnown = false;
export function setEnAvailability(a: { articles?: Iterable<string>; products?: Iterable<string>; topics?: Iterable<string> }): void {
  if (a.articles) enAvailable.articles = new Set(a.articles);
  if (a.products) enAvailable.products = new Set(a.products);
  if (a.topics) enAvailable.topics = new Set(a.topics);
  availabilityKnown = true;
}
export function enArticleAvailable(id: string): boolean {
  return enAvailable.articles.has(id);
}

/**
 * Localise an internal href for the active language.
 * - Persian pages: unchanged.
 * - English pages: "/x" → "/en/x", except files (/images/…, *.pdf), API/admin paths and magazine
 *   articles that have no English version yet (those keep the Persian URL rather than a 404).
 * Absolute toyooran.com URLs are treated the same way.
 */
export function lp(href: string): string {
  if (current === 'fa' || !href) return href;
  return localizeHref(href);
}

/**
 * Router target for an internal href (the English router has basename /en, so it takes the unprefixed
 * path): applies the same fallbacks as lp() and strips the /en prefix again. Non-path hrefs are unchanged.
 */
export function routerTo(href: string): string {
  if (current === 'fa' || !href || !href.startsWith('/') || href.startsWith('//')) return href;
  const l = localizeHref(href);
  return pathLang(l) === 'en' ? stripLangPrefix(l) : href;
}

export function localizeHref(href: string): string {
  const abs = /^(https?:\/\/(?:www\.)?toyooran\.com)(\/.*)?$/i.exec(href);
  const origin = abs ? abs[1] : '';
  const rest = abs ? abs[2] || '/' : href;
  if (!rest.startsWith('/') || rest.startsWith('//')) return href;
  if (pathLang(rest) === 'en') return href;
  const [pathOnly] = rest.split(/[?#]/);
  const suffix = rest.slice(pathOnly.length);
  if (/\.[a-z0-9]{2,5}$/i.test(pathOnly)) return href;
  const seg = pathOnly.split('/').filter(Boolean);
  if (seg[0] && ['api', 'admin', 'crm', 'login', 'dashboard', 'images', 'assets', 'fonts'].includes(seg[0])) return href;
  // An article without a complete English version has no /en URL: fall back to the English magazine index.
  if (seg[0] === 'magazine' && seg.length === 2 && seg[1] !== 'topic' && availabilityKnown && !enAvailable.articles.has(decodeURIComponentSafe(seg[1]))) return `${origin}${EN_PREFIX}/magazine`;
  if (seg[0] === 'magazine' && seg[1] === 'topic' && seg[2] && availabilityKnown && !enAvailable.topics.has(seg[2])) return `${origin}${EN_PREFIX}/magazine${suffix}`;
  const localized = pathOnly === '/' ? EN_PREFIX : `${EN_PREFIX}${pathOnly}`;
  return `${origin}${localized}${suffix}`;
}

function decodeURIComponentSafe(s: string): string {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
}

/** Number display: Persian digits stay as authored on fa; en shows Latin digits. */
export function latinDigits(s: string): string {
  return String(s).replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d))).replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)));
}
