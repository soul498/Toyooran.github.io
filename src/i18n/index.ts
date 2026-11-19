/**
 * Languages: fa = default at the existing URLs, en under /en, tr under /tr, ru under /ru, ar under /ar.
 * Arabic is right-to-left, like Persian. English, Turkish and Russian are left-to-right.
 *
 * Translation model: every foreign string is keyed by the EXACT Persian source text it translates
 * (src/i18n/<lang>/*.json; magazine articles in magazine.json as {articleId: {fa: translation}}).
 * When the Persian text changes, its old key no longer matches, so the translation is reported as
 * missing/stale by `npm run check:i18n` and the page keeps working (Persian fallback for a UI
 * string; content pages drop out of /en, /tr, /ru or /ar until complete). See docs/i18n.md.
 *
 * Persian pages never load a foreign dictionary. The client imports one dictionary lazily for
 * that language's URLs (src/main.tsx); the server imports them directly.
 */
import type UI_EN from './en/ui.json';

export type Lang = 'fa' | 'en' | 'tr' | 'ru' | 'ar';
export type ForeignLang = Exclude<Lang, 'fa'>;
/** Typed UI keys: a Persian UI literal without an entry in en/ui.json fails `npm run lint`. */
export type UiKey = keyof typeof UI_EN;

export const EN_PREFIX = '/en';
export const TR_PREFIX = '/tr';
export const RU_PREFIX = '/ru';
export const AR_PREFIX = '/ar';
export const LANG_PREFIX: Record<ForeignLang, string> = { en: EN_PREFIX, tr: TR_PREFIX, ru: RU_PREFIX, ar: AR_PREFIX };

const FOREIGN_PREFIXES: { lang: ForeignLang; prefix: string }[] = [
  { lang: 'en', prefix: EN_PREFIX },
  { lang: 'tr', prefix: TR_PREFIX },
  { lang: 'ru', prefix: RU_PREFIX },
  { lang: 'ar', prefix: AR_PREFIX },
];

let current: Lang = 'fa';
const dictionaries: Record<ForeignLang, Record<string, string>> = { en: {}, tr: {}, ru: {}, ar: {} };
let dict: Record<string, string> = {};
/** Per-document overlay (server: one magazine article's own entries), checked before `dict`. */
let overlay: Record<string, string> | null = null;

/** Language of a pathname: /en, /tr, /ru and /ar (and their children) are foreign, everything else Persian. */
export function pathLang(pathname: string | undefined | null): Lang {
  const p = String(pathname || '/');
  for (const { lang, prefix } of FOREIGN_PREFIXES) {
    if (p === prefix || p.startsWith(`${prefix}/`)) return lang;
  }
  return 'fa';
}

/** "/en/products/x", "/tr/products/x", "/ru/products/x" or "/ar/products/x" → "/products/x"; a bare prefix → "/". Persian paths are unchanged. */
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
export const isRu = (): boolean => current === 'ru';
export const isAr = (): boolean => current === 'ar';
/** English, Turkish and Russian are left-to-right. Persian and Arabic are right-to-left. */
export const isLtr = (): boolean => current === 'en' || current === 'tr' || current === 'ru';

/** Letters used in Persian but not in Arabic, so an Arabic field can hold Arabic script. */
const PERSIAN_ONLY_CHARS = /[\u067E\u0686\u0698\u06AF\u06A9\u06CC]/;
export const hasPersianOnly = (s: string): boolean => PERSIAN_ONLY_CHARS.test(s);

/** BCP 47 tag for number and date display. */
export function intlLocale(): string {
  if (current === 'tr') return 'tr-TR';
  if (current === 'ru') return 'ru-RU';
  if (current === 'ar') return 'ar';
  if (current === 'en') return 'en-US';
  return 'fa-IR';
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
export function setRuDictionary(entries: Record<string, string>): void {
  dictionaries.ru = entries;
  if (current === 'ru') dict = entries;
}
export function setArDictionary(entries: Record<string, string>): void {
  dictionaries.ar = entries;
  if (current === 'ar') dict = entries;
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
  const raw = current === 'fa' ? (fa as string) : (lookupEn(fa as string) ?? (fa as string));
  return current === 'ar' ? displayDigits(raw) : raw;
}

/** Content string (data, CMS): same as t() but untyped. */
export function tr(fa: string): string {
  if (!fa) return fa;
  if (current === 'fa') return fa;
  const raw = hasPersian(fa) ? (lookupEn(fa) ?? fa) : fa;
  return current === 'ar' ? displayDigits(raw) : raw;
}

/** Template: tf('{n} محصول', { n: 3 }) — the template itself is the dictionary key. */
export function tf(template: UiKey, vars: Record<string, string | number>): string {
  const base = t(template);
  const out = base.replace(/\{(\w+)\}/g, (_m, k: string) => (k in vars ? String(vars[k]) : `{${k}}`));
  return current === 'ar' ? displayDigits(out) : out;
}

/** Marks a Persian literal that intentionally stays Persian in every language (e.g. a lead value sent to the sales team). check:i18n skips it. */
export const keepFa = (fa: string): string => fa;

/** Pick between a Persian and an English value at render time. Turkish uses the Persian value; prefer t()/tr() for Turkish. */
export const pick = <T,>(fa: T, en: T): T => (current === 'en' ? en : fa);

/** Persian slugs inside links are kept on purpose and are not untranslated copy. */
function withoutKeptPaths(s: string): string {
  return s
    .replace(/\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[IMG\|[^|]+\|/g, '')
    .replace(/\[CTA\|[^|]*\|[^\]]*\]/g, '')
    .replace(/\/(?:products|magazine|services|contact)\/[^\s)\]|]+/g, '');
}

/** A string still needs a dictionary hit. Arabic copy is Arabic script; only leftover Persian letters count. */
function unresolvedForeign(s: string): boolean {
  if (current === 'ar') return hasPersianOnly(withoutKeptPaths(s));
  return hasPersian(s) && lookupEn(s) === undefined;
}

/** True when every Persian string inside `value` has an entry in the active dictionary. */
export function isFullyTranslated(value: unknown): boolean {
  if (typeof value === 'string') return !unresolvedForeign(value);
  if (Array.isArray(value)) return value.every(isFullyTranslated);
  if (value && typeof value === 'object') return Object.values(value as Record<string, unknown>).every(isFullyTranslated);
  return true;
}

/** Collect the Persian strings in `value` that have no entry in the active dictionary. */
export function missingIn(value: unknown, out: string[] = []): string[] {
  if (typeof value === 'string') {
    if (unresolvedForeign(value)) out.push(value);
  } else if (Array.isArray(value)) value.forEach((v) => missingIn(v, out));
  else if (value && typeof value === 'object') Object.values(value as Record<string, unknown>).forEach((v) => missingIn(v, out));
  return out;
}

type ManualTranslations<T> = { translations?: Partial<Record<ForeignLang, Partial<T>>> };

/** Foreign copy of a product. `slugName` stays the Persian name so the old Persian URL still resolves;
 * the public slug itself is translated in productSeoSlug (magazine article URLs are not). */
export function translateProduct<T extends { name?: string; slugName?: string }>(product: T): T {
  if (current === 'fa') return product;
  const manual = (product as T & ManualTranslations<T>).translations?.[current];
  return { ...deep(product), ...(manual || {}), slugName: product.slugName ?? product.name };
}

/** True when the product's visible copy is fully translated. The Persian URL slug is not copy. */
export function isProductFullyTranslated<T extends { slugName?: string }>(product: T): boolean {
  const translated = translateProduct(product) as T & { slugName?: string };
  const { slugName: _slugName, ...visible } = translated;
  return isFullyTranslated(visible);
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

/** Ids of magazine articles / products with a complete translation (set by the data layer), per language.
 * `productPaths` maps any slug (Persian, id, code, translated) to that language's canonical product path.
 * Magazine article URLs are not in this map. */
type Availability = { articles: Set<string>; products: Set<string>; topics: Set<string>; productPaths: Map<string, string>; known: boolean };
const emptyAvailability = (): Availability => ({ articles: new Set(), products: new Set(), topics: new Set(), productPaths: new Map(), known: false });
const available: Record<ForeignLang, Availability> = {
  en: emptyAvailability(),
  tr: emptyAvailability(),
  ru: emptyAvailability(),
  ar: emptyAvailability(),
};
export function setLangAvailability(lang: ForeignLang, a: { articles?: Iterable<string>; products?: Iterable<string>; topics?: Iterable<string>; productPaths?: Map<string, string> }): void {
  const slot = available[lang];
  if (a.articles) slot.articles = new Set(a.articles);
  if (a.products) slot.products = new Set(a.products);
  if (a.topics) slot.topics = new Set(a.topics);
  if (a.productPaths) slot.productPaths = a.productPaths;
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
 * - Product links are rewritten to that language's slug. Magazine article URLs are not translated.
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
  // Article URLs themselves are not translated.
  if (seg[0] === 'magazine' && seg.length === 2 && seg[1] !== 'topic' && slot.known && !slot.articles.has(decodeURIComponentSafe(seg[1]))) return `${origin}${prefix}/magazine`;
  if (seg[0] === 'magazine' && seg[1] === 'topic' && seg[2] && slot.known && !slot.topics.has(seg[2])) return `${origin}${prefix}/magazine${suffix}`;
  let localizedPath = pathOnly;
  if (seg[0] === 'products' && seg.length === 2) {
    const translated = foreignProductPath(seg[1]);
    if (translated) localizedPath = translated;
  }
  const localized = localizedPath === '/' ? prefix : `${prefix}${localizedPath}`;
  return `${origin}${localized}${suffix}`;
}

/** Canonical product path in the active language, if this slug belongs to a translated product. */
function foreignProductPath(slug: string): string | undefined {
  if (current === 'fa') return undefined;
  const map = available[current].productPaths;
  if (!map || map.size === 0) return undefined;
  const decoded = decodeURIComponentSafe(slug);
  const direct = map.get(decoded) || map.get(decoded.toLowerCase());
  if (direct) return direct;
  const code = decoded.toLowerCase().match(/-(ts-\d{3})$/);
  return code ? map.get(code[1]) : undefined;
}

function decodeURIComponentSafe(s: string): string {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
}

/** Number display: Persian digits stay as authored on fa; en, tr and ru show Latin digits. */
export function latinDigits(s: string): string {
  return String(s).replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d))).replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)));
}

const FA_DIGIT = '۰۱۲۳۴۵۶۷۸۹';
const AR_DIGIT = '٠١٢٣٤٥٦٧٨٩';
// Letters glued to a following digit (NH3, NTAC9/150D, FTP4E-350, A2) or an uppercase code
// followed by "-" / space and digits (GH 0625, BCF-85, DSA 15, TS-100).
const CODE_RE = /(?<![A-Za-z0-9])(?:[A-Za-z]+\d[A-Za-z0-9]*(?:[-/.][A-Za-z0-9]+)*|[A-Z]{1,}[A-Z]*[- ]\d[A-Za-z0-9]*(?:[-/][A-Za-z0-9]+)*)(?![A-Za-z0-9])/g;

function toDigitScript(s: string, digits: string, fromAnyScript: boolean): string {
  const base = fromAnyScript ? latinDigits(s) : s;
  return base
    .replace(/(\d),(?=\d{3}(?!\d))/g, '$1٬')
    .replace(/(\d)\.(?=\d)/g, '$1٫')
    .replace(/(\d)%/g, '$1٪')
    .replace(/\d/g, (d) => digits[Number(d)]);
}

/**
 * Visible number display for the active language: Persian digits on fa (Latin digits converted,
 * model codes left as-is), Arabic-Indic (٠١٢٣٤٥٦٧٨٩) on ar, Latin on en/tr/ru.
 * tel: hrefs, URLs and slugs should not go through this helper.
 */
export function displayDigits(text: string | number | null | undefined): string {
  const s = text == null ? '' : String(text);
  if (current === 'en' || current === 'tr' || current === 'ru') return latinDigits(s);
  const arabic = current === 'ar';
  const digits = arabic ? AR_DIGIT : FA_DIGIT;
  if (!(arabic ? /[0-9۰-۹]/.test(s) : /[0-9]/.test(s))) return s;
  let out = '';
  let last = 0;
  for (const m of s.matchAll(CODE_RE)) {
    const i = m.index ?? 0;
    out += toDigitScript(s.slice(last, i), digits, arabic) + m[0];
    last = i + m[0].length;
  }
  return out + toDigitScript(s.slice(last), digits, arabic);
}
