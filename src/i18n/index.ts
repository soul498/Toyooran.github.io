/**
 * Languages: fa = default at the existing URLs, en under /en, tr under /tr.
 *
 * Translation model: every foreign string is keyed by the EXACT Persian source text it translates
 * (src/i18n/<lang>/*.json; magazine articles in magazine.json as {articleId: {fa: translation}}).
 * When the Persian text changes, its old key no longer matches, so the translation is reported as
 * missing/stale by `npm run check:i18n` and the page keeps working (Persian fallback for a UI
 * string; content pages drop out of /en or /tr until complete). See docs/i18n.md.
 *
 * Persian pages never load a foreign dictionary. The client imports enDict or trDict lazily only
 * for that language's URLs (src/main.tsx); the server imports both directly.
 */
import type UI_EN from './en/ui.json';

export type Lang = 'fa' | 'en' | 'tr';
export type ForeignLang = Exclude<Lang, 'fa'>;
/** Typed UI keys: a Persian UI literal without an entry in en/ui.json fails `npm run lint`. */
export type UiKey = keyof typeof UI_EN;

export const EN_PREFIX = '/en';
export const TR_PREFIX = '/tr';
export const RU_PREFIX = '/ru';
export const LANG_PREFIX: Record<ForeignLang, string> = { en: EN_PREFIX, tr: TR_PREFIX };

const FOREIGN_PREFIXES: { lang: ForeignLang; prefix: string }[] = [
  { lang: 'en', prefix: EN_PREFIX },
  { lang: 'tr', prefix: TR_PREFIX },
];

let current: Lang = 'fa';
const dictionaries: Record<ForeignLang, Record<string, string>> = { en: {}, tr: {} };
let dict: Record<string, string> = {};
/** Per-document overlay (server: one magazine article's own entries), checked before `dict`. */
let overlay: Record<string, string> | null = null;

/** Language of a pathname: /en and /tr (and their children) are foreign, everything else Persian. */
export function pathLang(pathname: string | undefined | null): Lang {
  const p = String(pathname || '/');
  for (const { lang, prefix } of FOREIGN_PREFIXES) {
    if (p === prefix || p.startsWith(`${prefix}/`)) return lang;
  }
  return 'fa';
}

/** "/en/products/x" or "/tr/products/x" → "/products/x"; a bare prefix → "/". Persian paths are unchanged. */
export function stripLangPrefix(pathname: string): string {
  const lang = pathLang(pathname);
  if (lang === 'fa') return pathname || '/';
  const rest = pathname.slice(LANG_PREFIX[lang].length);
  return rest && rest !== '/' ? rest : '/';
}

export function getLang(): Lang {
  return current;
}
export const isEn = (): boolean => current === 'en';
export const isTr = (): boolean => current === 'tr';
/** English and Turkish pages are left-to-right. */
export const isLtr = (): boolean => current !== 'fa';

/** BCP 47 tag for number and date display. */
export function intlLocale(): string {
  if (current === 'tr') return 'tr-TR';
  return current === 'en' ? 'en-US' : 'fa-IR';
}

/** Install one foreign dictionary (server: both at startup; client: the page language, before first render). */
export function setEnDictionary(entries: Record<string, string>): void {
  dictionaries.en = entries;
  if (current === 'en') dict = entries;
}
export function setTrDictionary(entries: Record<string, string>): void {
  dictionaries.tr = entries;
  if (current === 'tr') dict = entries;
}
export function setLang(lang: Lang): void {
  current = lang;
  dict = lang === 'fa' ? {} : dictionaries[lang];
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
  const prevLang = current;
  const prevDict = dict;
  current = lang;
  dict = lang === 'fa' ? {} : dictionaries[lang];
  try {
    return fn();
  } finally {
    current = prevLang;
    dict = prevDict;
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

/** Active foreign dictionary entry for an exact Persian string, or undefined. Always undefined-safe. */
export function lookupEn(fa: string): string | undefined {
  if (!fa) return undefined;
  const hit = overlay?.[fa] ?? overlay?.[keyOf(fa)] ?? dict[fa] ?? dict[keyOf(fa)];
  if (hit === undefined || hit === '') return autoEnglish(fa);
  return hit;
}

/** UI string: Persian as-is on Persian pages; the active language (falls back to Persian) otherwise. */
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

/** Pick between a Persian and an English value at render time. Turkish uses the Persian value; prefer t()/tr() for Turkish. */
export const pick = <T,>(fa: T, en: T): T => (current === 'en' ? en : fa);

/** True when every Persian string inside `value` has an entry in the active dictionary. */
export function isFullyTranslated(value: unknown): boolean {
  if (typeof value === 'string') return !hasPersian(value) || lookupEn(value) !== undefined;
  if (Array.isArray(value)) return value.every(isFullyTranslated);
  if (value && typeof value === 'object') return Object.values(value as Record<string, unknown>).every(isFullyTranslated);
  return true;
}

/** Collect the Persian strings in `value` that have no entry in the active dictionary. */
export function missingIn(value: unknown, out: string[] = []): string[] {
  if (typeof value === 'string') {
    if (hasPersian(value) && lookupEn(value) === undefined) out.push(value);
  } else if (Array.isArray(value)) value.forEach((v) => missingIn(v, out));
  else if (value && typeof value === 'object') Object.values(value as Record<string, unknown>).forEach((v) => missingIn(v, out));
  return out;
}

type ManualTranslations<T> = { translations?: Partial<Record<ForeignLang, Partial<T>>> };

/** Foreign copy of a product; keeps its Persian name for the URL slug (/en/products/<same slug>, /tr/products/<same slug>). */
export function translateProduct<T extends { name?: string; slugName?: string }>(product: T): T {
  if (current === 'fa') return product;
  const manual = (product as T & ManualTranslations<T>).translations?.[current];
  return { ...deep(product), ...(manual || {}), slugName: product.slugName ?? product.name };
}

/** CMS records may carry an explicitly authored overlay for the active language. It wins over the
 * legacy Persian-key dictionary and lets new content be translated from /admin. */
export function translateCmsRecord<T extends ManualTranslations<T>>(value: T): T {
  if (current === 'fa') return value;
  return { ...deep(value), ...(value.translations?.[current] || {}) };
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

/** Ids of magazine articles / products with a complete translation (set by the data layer), per language. */
type Availability = { articles: Set<string>; products: Set<string>; topics: Set<string>; known: boolean };
const available: Record<ForeignLang, Availability> = {
  en: { articles: new Set(), products: new Set(), topics: new Set(), known: false },
  tr: { articles: new Set(), products: new Set(), topics: new Set(), known: false },
};
export function setLangAvailability(lang: ForeignLang, a: { articles?: Iterable<string>; products?: Iterable<string>; topics?: Iterable<string> }): void {
  const slot = available[lang];
  if (a.articles) slot.articles = new Set(a.articles);
  if (a.products) slot.products = new Set(a.products);
  if (a.topics) slot.topics = new Set(a.topics);
  slot.known = true;
}
export function setEnAvailability(a: { articles?: Iterable<string>; products?: Iterable<string>; topics?: Iterable<string> }): void {
  setLangAvailability('en', a);
}
export function enArticleAvailable(id: string): boolean {
  return available.en.articles.has(id);
}

/**
 * Localise an internal href for the active language.
 * - Persian pages: unchanged.
 * - Foreign pages: "/x" → "/en/x" or "/tr/x", except files, API/admin paths and magazine
 *   articles that have no translation yet (those keep the language's magazine index rather than a 404).
 * Absolute toyooran.com URLs are treated the same way.
 */
export function lp(href: string): string {
  if (current === 'fa' || !href) return href;
  return localizeHref(href);
}

/**
 * Router target for an internal href (a foreign router has basename /en or /tr, so it takes the unprefixed
 * path): applies the same fallbacks as lp() and strips the language prefix again. Non-path hrefs are unchanged.
 */
export function routerTo(href: string): string {
  if (current === 'fa' || !href || !href.startsWith('/') || href.startsWith('//')) return href;
  const l = localizeHref(href);
  return pathLang(l) === current ? stripLangPrefix(l) : href;
}

export function localizeHref(href: string): string {
  if (current === 'fa') return href;
  const prefix = LANG_PREFIX[current];
  const slot = available[current];
  const abs = /^(https?:\/\/(?:www\.)?toyooran\.com)(\/.*)?$/i.exec(href);
  const origin = abs ? abs[1] : '';
  const rest = abs ? abs[2] || '/' : href;
  if (!rest.startsWith('/') || rest.startsWith('//')) return href;
  if (pathLang(rest) !== 'fa') return href;
  const [pathOnly] = rest.split(/[?#]/);
  const suffix = rest.slice(pathOnly.length);
  if (/\.[a-z0-9]{2,5}$/i.test(pathOnly)) return href;
  const seg = pathOnly.split('/').filter(Boolean);
  if (seg[0] && ['api', 'admin', 'crm', 'login', 'dashboard', 'images', 'assets', 'fonts'].includes(seg[0])) return href;
  // An article without a complete translation has no foreign URL: fall back to that language's magazine index.
  if (seg[0] === 'magazine' && seg.length === 2 && seg[1] !== 'topic' && slot.known && !slot.articles.has(decodeURIComponentSafe(seg[1]))) return `${origin}${prefix}/magazine`;
  if (seg[0] === 'magazine' && seg[1] === 'topic' && seg[2] && slot.known && !slot.topics.has(seg[2])) return `${origin}${prefix}/magazine${suffix}`;
  const localized = pathOnly === '/' ? prefix : `${prefix}${pathOnly}`;
  return `${origin}${localized}${suffix}`;
}

function decodeURIComponentSafe(s: string): string {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
}

/** Number display: Persian digits stay as authored on fa; en and tr show Latin digits. */
export function latinDigits(s: string): string {
  return String(s).replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d))).replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)));
}
