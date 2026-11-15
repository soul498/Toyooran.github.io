/**
 * npm run check:i18n — is the English site (/en) in sync with the Persian source?
 *
 * Checks (see docs/i18n.md):
 *   1. Code: every Persian literal reachable from the public app (src/main.tsx → … minus admin/CRM)
 *      and server/seo.ts is either t()/tf() with an entry in src/i18n/en/ui.json, has an English
 *      entry in src/i18n/en/*.json, or is marked keepFa() / used only for matching.
 *   2. Site data: company info, categories, enabled services, page heroes, landing cards, topics,
 *      phones, photo alts.
 *   3. Products: every public product (src/data/productsData.ts) — all visible Persian text.
 *   4. Magazine: every published article (live CMS API by default) — src/i18n/en/magazine.json.
 *   5. Stale: English entries whose Persian source no longer exists (the Persian was edited/removed).
 *   6. Policy: English copy rules (no we/our/us, no "farmer", no product codes, no retired phone, …).
 *   7. Optional --base <url>: fetch every /en URL in that server's sitemap and verify the prerendered
 *      HTML has no Persian text and no banned terms.
 *
 * Output: i18n-report.json + a summary. "In sync" = `i18n: in sync` and exit code 0.
 * Flags: --warn (always exit 0, for CI) · --magazine-file <json> · --magazine-url <url> · --no-magazine
 *        --base <url> · --todo <file> (write every missing string as {fa: ""} for translation)
 */
import fs from "node:fs";
import path from "node:path";
import ts from "typescript";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const args = process.argv.slice(2);
const flag = (name: string) => args.includes(name);
const opt = (name: string) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
};

const EN_DIR = path.join(ROOT, "src/i18n/en");
const readJson = <T,>(file: string): T => JSON.parse(fs.readFileSync(path.join(EN_DIR, file), "utf8")) as T;
const UI = readJson<Record<string, string>>("ui.json");
const SITE = readJson<Record<string, string>>("site.json");
const PRODUCTS_EN = readJson<Record<string, string>>("products.json");
const MAGAZINE_EN = readJson<Record<string, Record<string, string>>>("magazine.json");

const i18n = await import("../src/i18n");
const { hasPersian, keyOf, autoEnglish, setEnDictionary, withLang, withOverlay } = i18n;
const DICT: Record<string, string> = { ...PRODUCTS_EN, ...SITE, ...UI };
setEnDictionary(DICT);

type Missing = { fa: string; where: string };
const report = {
  generatedAt: new Date().toISOString(),
  summary: {} as Record<string, number | string | boolean>,
  missing: { ui: [] as Missing[], site: [] as Missing[], unwrapped: [] as Missing[], products: {} as Record<string, string[]>, magazine: {} as Record<string, string[]> },
  stale: { ui: [] as string[], site: [] as string[], products: [] as string[], magazine: {} as Record<string, string[]> },
  policy: [] as { rule: string; en: string; fa?: string; where: string }[],
  render: [] as { url: string; problem: string }[],
  untranslatedArticles: [] as { id: string; title: string; missing: number }[],
  untranslatedProducts: [] as { id: string; name: string; missing: number }[],
  notes: [] as string[],
};

const has = (fa: string) => {
  const k = keyOf(fa);
  return (DICT[k] !== undefined && DICT[k] !== "") || autoEnglish(k) !== undefined;
};
const used = new Set<string>(); // every Persian key some source requires

// ---------------------------------------------------------------- 1. code
const EXCLUDE = [/^src\/admin\//, /^src\/crm\//, /^src\/i18n\//, /^src\/data\//, /^src\/types\.ts$/, /^src\/utils\/sendToBale\.ts$/, /^src\/context\/DataContext\.tsx$/];
function reachable(entry: string): string[] {
  const seen = new Set<string>();
  const stack = [entry];
  while (stack.length) {
    const f = stack.pop()!;
    if (seen.has(f)) continue;
    seen.add(f);
    const src = fs.readFileSync(path.join(ROOT, f), "utf8");
    for (const m of src.matchAll(/(?:from|import)\s*\(?\s*['"](\.[^'"]+)['"]/g)) {
      const base = path.normalize(path.join(path.dirname(f), m[1]));
      for (const ext of ["", ".ts", ".tsx", "/index.ts", "/index.tsx"]) {
        const p = base + ext;
        if (fs.existsSync(path.join(ROOT, p)) && fs.statSync(path.join(ROOT, p)).isFile()) {
          if (/\.(ts|tsx)$/.test(p)) stack.push(p);
          break;
        }
      }
    }
  }
  return [...seen];
}
const codeFiles = [...reachable("src/main.tsx").filter((f) => !EXCLUDE.some((re) => re.test(f))), "server/seo.ts"].sort();
const IGNORE_METHODS = new Set(["includes", "startsWith", "endsWith", "indexOf", "lastIndexOf", "test", "match", "matchAll", "replace", "replaceAll", "split", "search", "localeCompare"]);
const uiNeeded = new Set<string>();

function calleeName(call: ts.CallExpression): string {
  const e = call.expression;
  if (ts.isIdentifier(e)) return e.text;
  if (ts.isPropertyAccessExpression(e)) {
    if (ts.isIdentifier(e.expression) && e.expression.text === "console") return "console";
    return `.${e.name.text}`;
  }
  return "";
}
function literalRole(node: ts.Node): "ui" | "skip" | "site" {
  let child: ts.Node = node;
  let p: ts.Node | undefined = node.parent;
  // Climb through parentheses / `as` / conditional branches / || ?? fallbacks.
  while (p && (ts.isParenthesizedExpression(p) || ts.isAsExpression(p) || ts.isConditionalExpression(p) && child !== p.condition)) {
    child = p;
    p = p.parent;
  }
  if (!p) return "site";
  if (ts.isImportDeclaration(p) || ts.isExportDeclaration(p) || ts.isLiteralTypeNode(p)) return "skip";
  if (ts.isCallExpression(p) && p.arguments.includes(child as ts.Expression)) {
    const name = calleeName(p);
    if (name === "t" || name === "tf") return p.arguments[0] === child ? "ui" : "site";
    if (name === "keepFa" || name === "console") return "skip";
    if (IGNORE_METHODS.has(name.slice(1))) return "skip";
  }
  if (ts.isNewExpression(p) && ts.isIdentifier(p.expression) && p.expression.text === "RegExp") return "skip";
  if (ts.isBinaryExpression(p) && [ts.SyntaxKind.EqualsEqualsEqualsToken, ts.SyntaxKind.ExclamationEqualsEqualsToken, ts.SyntaxKind.EqualsEqualsToken, ts.SyntaxKind.ExclamationEqualsToken].includes(p.operatorToken.kind)) return "skip";
  if ((ts.isPropertyAssignment(p) || ts.isPropertyDeclaration(p) || ts.isMethodDeclaration(p)) && p.name === child) return "skip";
  if (ts.isElementAccessExpression(p) && p.argumentExpression === child) return "skip";
  if (ts.isCaseClause(p) && p.expression === child) return "skip";
  return "site";
}

for (const file of codeFiles) {
  const text = fs.readFileSync(path.join(ROOT, file), "utf8");
  const sf = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, file.endsWith("x") ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  const where = (n: ts.Node) => `${file}:${sf.getLineAndCharacterOfPosition(n.getStart()).line + 1}`;
  const visit = (node: ts.Node) => {
    if ((ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) && hasPersian(node.text)) {
      const role = literalRole(node);
      const key = keyOf(node.text);
      if (role === "ui") {
        uiNeeded.add(key);
        used.add(key);
        if (UI[key] === undefined || UI[key] === "") report.missing.ui.push({ fa: key, where: where(node) });
      } else if (role === "site") {
        used.add(key);
        if (!has(key)) report.missing.site.push({ fa: key, where: where(node) });
      }
    } else if (ts.isTemplateExpression(node)) {
      const parts = [node.head.text, ...node.templateSpans.map((s) => s.literal.text)];
      if (parts.some((s) => hasPersian(s)) && literalRole(node) !== "skip") report.missing.unwrapped.push({ fa: node.getText(sf).slice(0, 200), where: where(node) });
    } else if (ts.isJsxText(node) && hasPersian(node.text)) {
      report.missing.unwrapped.push({ fa: node.text.trim().slice(0, 200), where: where(node) });
    }
    ts.forEachChild(node, visit);
  };
  visit(sf);
}

// ---------------------------------------------------------------- 2. site data
function collectStrings(value: unknown, out: string[] = []): string[] {
  if (typeof value === "string") {
    if (hasPersian(value)) out.push(keyOf(value));
  } else if (Array.isArray(value)) value.forEach((v) => collectStrings(v, out));
  else if (value && typeof value === "object") Object.values(value as Record<string, unknown>).forEach((v) => collectStrings(v, out));
  return out;
}
function requireAll(label: string, value: unknown, bucket: Missing[]) {
  for (const s of collectStrings(value)) {
    used.add(s);
    if (!has(s)) bucket.push({ fa: s, where: label });
  }
}
const mock = await import("../src/data/mockData");
const { withContentCorrections } = await import("../src/data/contentCorrections");
const { isServiceDisabled } = await import("../src/data/disabledPages");
const { isPublicProduct } = await import("../src/data/removedProducts");
const { PAGE_HEROES } = await import("../src/data/pageHeroes");
const { LANDING_SERVICE_CARDS } = await import("../src/data/landingServiceCards");
const { MAGAZINE_TOPICS } = await import("../src/seo/topics");
const contact = await import("../src/data/contact");
const photos = await import("../src/data/productPhotos");
const aboutCopy = await import("../src/data/aboutCopy");
const sitePhotos = await import("../src/data/sitePhotos");
const servicePages = await import("../src/data/servicePages");

requireAll("COMPANY_INFO", mock.COMPANY_INFO, report.missing.site);
requireAll("CATEGORIES_DATA", mock.CATEGORIES_DATA, report.missing.site);
requireAll("DEFAULT_HERO_CMS", mock.DEFAULT_HERO_CMS, report.missing.site);
requireAll("SERVICES", mock.SERVICES.filter((s) => !isServiceDisabled(s.id)).map((s) => withContentCorrections(s)), report.missing.site);
// The fit-out service page is disabled, but its workflow steps are still listed in the home page HTML
// (homeExtras / FITOUT_SERVICE_ID in src/seo/resolveSeo.ts), so they need English too.
requireAll("SERVICES[srv-turnkey-shed].workflow (home)", mock.SERVICES.filter((s) => s.id === "srv-turnkey-shed").map((s) => withContentCorrections(s).workflow), report.missing.site);
requireAll("PAGE_HEROES", PAGE_HEROES, report.missing.site);
requireAll("aboutCopy", Object.fromEntries(Object.entries(aboutCopy)), report.missing.site);
requireAll("sitePhotos (alt)", [sitePhotos.HOME_HERO_PHOTO, ...Object.values(sitePhotos.ABOUT_PHOTOS)].map((p) => p.alt), report.missing.site);
requireAll("LANDING_SERVICE_CARDS", LANDING_SERVICE_CARDS, report.missing.site);
requireAll("SERVICE_PAGES", servicePages.SERVICE_PAGES.map(({ photo, ...rest }) => ({ ...rest, alt: photo?.alt })), report.missing.site);
requireAll("SERVICE_PAGE_LABELS", servicePages.SERVICE_PAGE_LABELS, report.missing.site);
requireAll("MAGAZINE_TOPICS", MAGAZINE_TOPICS, report.missing.site);
requireAll("contact", Object.fromEntries(Object.entries(contact).filter(([, v]) => typeof v === "string")), report.missing.site);
requireAll("productPhotos", Object.values(photos).filter((v) => v && typeof v === "object").map((v) => (v as { alt?: string }).alt), report.missing.site);

// ---------------------------------------------------------------- 3. products
const productKeys = new Set<string>();
for (const product of mock.PRODUCTS.filter((p) => isPublicProduct(p))) {
  const { code: _code, ...visible } = product as unknown as Record<string, unknown>;
  const strings = collectStrings(visible);
  const missing = [...new Set(strings.filter((s) => !has(s)))];
  strings.forEach((s) => (used.add(s), productKeys.add(s)));
  if (missing.length) {
    report.missing.products[product.id] = missing;
    report.untranslatedProducts.push({ id: product.id, name: product.name, missing: missing.length });
  }
}

// ---------------------------------------------------------------- 4. magazine
type LiveArticle = Record<string, unknown> & { id: string; title: string };
let articles: LiveArticle[] | null = null;
if (!flag("--no-magazine")) {
  const file = opt("--magazine-file");
  try {
    if (file) {
      const data = JSON.parse(fs.readFileSync(path.resolve(file), "utf8"));
      articles = Array.isArray(data) ? data : data.articles;
    } else {
      const url = opt("--magazine-url") || "https://www.toyooran.com/api/magazine";
      const res = await fetch(url, { headers: { "user-agent": "toyooran-check-i18n" } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      articles = ((await res.json()) as { articles: LiveArticle[] }).articles;
    }
  } catch (error) {
    report.notes.push(`magazine not checked: ${(error as Error).message}`);
  }
}
const articleVisible = (a: LiveArticle) => withContentCorrections({
  title: a.title, categoryLabel: a.categoryLabel, readTime: a.readTime, summary: a.summary, content: a.content, imageAlt: a.imageAlt, tags: a.tags,
  sources: Array.isArray(a.sources) ? (a.sources as { name?: string }[]).map((s) => s?.name) : [], seoTitle: a.seoTitle, seoDescription: a.seoDescription,
  focusKeyword: a.focusKeyword, authorName: a.authorName, authorRole: a.authorRole, reviewerName: a.reviewerName, reviewerRole: a.reviewerRole,
});
const articleKeys: Record<string, Set<string>> = {};
if (articles) {
  for (const a of articles) {
    const own = MAGAZINE_EN[a.id] || {};
    const strings = collectStrings(articleVisible(a));
    articleKeys[a.id] = new Set(strings);
    const missing = [...new Set(strings.filter((s) => !((own[s] !== undefined && own[s] !== "") || has(s))))];
    strings.forEach((s) => { if (!own[s]) used.add(s); });
    if (missing.length) {
      report.missing.magazine[a.id] = missing;
      report.untranslatedArticles.push({ id: a.id, title: a.title, missing: missing.length });
    }
  }
}

// ---------------------------------------------------------------- 5. stale
for (const k of Object.keys(UI)) if (!uiNeeded.has(k) && !used.has(k)) report.stale.ui.push(k);
for (const k of Object.keys(SITE)) if (!used.has(k)) report.stale.site.push(k);
for (const k of Object.keys(PRODUCTS_EN)) if (!productKeys.has(k) && !used.has(k)) report.stale.products.push(k);
if (articles) {
  for (const [id, entries] of Object.entries(MAGAZINE_EN)) {
    const keys = articleKeys[id];
    const stale = Object.keys(entries).filter((k) => !keys || !keys.has(k));
    if (stale.length) report.stale.magazine[id] = keys ? stale : [`(article "${id}" is not published)`];
  }
}

// ---------------------------------------------------------------- 6. policy (English copy rules)
const RULES: { rule: string; re: RegExp }[] = [
  { rule: "first person (we/our/us) — use third person", re: /\b(we|we're|we've|our|ours|us)\b/i },
  { rule: '"farmer" — use poultry producers / poultry houses / poultry farm', re: /farmer/i },
  { rule: "product code shown", re: /\bts-\d/i },
  { rule: "competitor name", re: /carno|karno|کارنو/i },
  { rule: "banned term (Danfoss/MARAS/IP54/Virgin/food or hygienic grade)", re: /danfoss|maras|ip54|virgin|food[\s-]grade|hygienic[\s-]grade/i },
  { rule: "feeder saving must be 3–5%, never 15%", re: /(?<![\d.,])15\s?%/ },
  { rule: "Persian text left in English", re: /[\u0600-\u06FF]/ },
];
const IMACHINE_ARTICLE = "imachine-jet-heater";
/** Service 3 names its machinery brand IMACHINE in the user's own copy (14 Nov 2026); allowed on that page only. */
const IMACHINE_SERVICE_PAGE = "/services/feed-machinery";
const IMACHINE_ALLOWED_FA = new Set(
  servicePages.SERVICE_PAGES.filter((p) => `/services/${p.slug}` === IMACHINE_SERVICE_PAGE).flatMap((p) => p.intro.filter((t) => /IMACHINE/.test(t)).map((t) => t.trim()))
);
/** Visible text only: markdown link targets, [PRODUCTS|…] directives and [IMG|path|…] paths are not shown. */
function visibleText(en: string): string {
  return en
    .replace(/\]\([^)]*\)/g, "]")
    .replace(/\[PRODUCTS\|[^\]]*\]/g, "")
    .replace(/\[IMG\|[^|\]]*\|/g, "[IMG|")
    .replace(/\[CTA\|([^|\]]*)\|[^\]]*\]/g, "$1");
}

function policy(rawEn: string, where: string, fa?: string, allowImachine = false) {
  const en = visibleText(rawEn);
  for (const { rule, re } of RULES) if (re.test(en)) report.policy.push({ rule, en: en.slice(0, 200), fa: fa?.slice(0, 120), where });
  if (!allowImachine && /imachine/i.test(en)) report.policy.push({ rule: "IMACHINE only in the imachine-jet-heater article", en: en.slice(0, 200), fa: fa?.slice(0, 120), where });
}
for (const [file, dict] of [["ui.json", UI], ["site.json", SITE], ["products.json", PRODUCTS_EN]] as const) {
  for (const [fa, en] of Object.entries(dict)) if (used.has(fa) || uiNeeded.has(fa)) policy(en, file, fa, IMACHINE_ALLOWED_FA.has(fa));
}
for (const [id, dict] of Object.entries(MAGAZINE_EN)) for (const [fa, en] of Object.entries(dict)) policy(en, `magazine.json#${id}`, fa, id === IMACHINE_ARTICLE);
const allowedGlobally = (s: string) => s;
void allowedGlobally;

// ---------------------------------------------------------------- 7. rendered /en pages (optional)
const base = opt("--base");
if (base) {
  const sitemap = await (await fetch(`${base}/sitemap.xml`)).text();
  const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname).filter((p) => p === "/en" || p.startsWith("/en/"));
  if (!urls.length) report.render.push({ url: `${base}/sitemap.xml`, problem: "no /en URLs in sitemap" });
  const queue = [...urls];
  await Promise.all(
    Array.from({ length: 6 }, async () => {
      while (queue.length) {
        const u = queue.shift()!;
        try {
          const res = await fetch(`${base}${u}`, { redirect: "manual" });
          if (res.status !== 200) {
            report.render.push({ url: u, problem: `HTTP ${res.status}` });
            continue;
          }
          const html = await res.text();
          const head = html.slice(0, html.indexOf("</head>"));
          const pre = html.match(/<div id="seo-prerender"[\s\S]*?<\/div>\s*<div id="root"/)?.[0] || html.slice(html.indexOf('id="seo-prerender"'));
          const visible = (head.match(/<title>[\s\S]*?<\/title>|content="(?!https?:)[^"]*"|"(?:name|headline|description|text)":"[^"]*"/g) || []).join("\n") + pre.replace(/<[^>]+>/g, " ");
          const fa = visible.match(/[\u0600-\u06FF][^<"]{0,40}/);
          if (fa) report.render.push({ url: u, problem: `Persian text: «${fa[0]}»` });
          if (!/<html lang="en" dir="ltr">/.test(html)) report.render.push({ url: u, problem: "html lang/dir is not en/ltr" });
          for (const { rule, re } of RULES.slice(0, 7)) {
            const text = pre.replace(/<[^>]+>/g, " ");
            if (re.test(text) && !(rule.startsWith("feeder") && false)) report.render.push({ url: u, problem: rule });
          }
          if (!u.includes(IMACHINE_ARTICLE) && !u.endsWith(IMACHINE_SERVICE_PAGE) && /imachine/i.test(pre.replace(/<[^>]+>/g, " "))) report.render.push({ url: u, problem: "IMACHINE outside its article" });
        } catch (error) {
          report.render.push({ url: u, problem: (error as Error).message });
        }
      }
    }),
  );
  report.notes.push(`rendered ${urls.length} /en URLs from ${base}`);
}

// ---------------------------------------------------------------- 8. Turkish / Russian dictionaries must cover the same used keys as English
const readLangJson = <T,>(lang: string, file: string): T =>
  JSON.parse(fs.readFileSync(path.join(ROOT, "src/i18n", lang, file), "utf8")) as T;
const TR_ALL: Record<string, string> = {
  ...readLangJson("tr", "products.json"),
  ...readLangJson("tr", "site.json"),
  ...readLangJson("tr", "ui.json"),
};
const RU_ALL: Record<string, string> = {
  ...readLangJson("ru", "products.json"),
  ...readLangJson("ru", "site.json"),
  ...readLangJson("ru", "ui.json"),
};
const neededKeys = new Set<string>([...used, ...uiNeeded]);
for (const [lang, dict] of [["tr", TR_ALL], ["ru", RU_ALL]] as const) {
  for (const key of neededKeys) {
    if (DICT[key] === undefined || DICT[key] === "") continue;
    if (dict[key] === undefined || dict[key] === "") {
      report.missing.site.push({ fa: key, where: `${lang} dictionary` });
    }
  }
}

// ---------------------------------------------------------------- summary
const dedupe = (list: Missing[]) => [...new Map(list.map((m) => [m.fa, m])).values()];
report.missing.ui = dedupe(report.missing.ui);
report.missing.site = dedupe(report.missing.site);
const missingCount =
  report.missing.ui.length + report.missing.site.length + report.missing.unwrapped.length +
  Object.values(report.missing.products).reduce((n, l) => n + l.length, 0) +
  Object.values(report.missing.magazine).reduce((n, l) => n + l.length, 0);
const staleCount = report.stale.ui.length + report.stale.site.length + report.stale.products.length + Object.values(report.stale.magazine).reduce((n, l) => n + l.length, 0);
const inSync = missingCount === 0 && staleCount === 0 && report.policy.length === 0 && (!base || report.render.length === 0) && (flag("--no-magazine") || articles !== null);
report.summary = {
  inSync,
  codeFiles: codeFiles.length,
  missing: missingCount,
  missingUi: report.missing.ui.length,
  missingSite: report.missing.site.length,
  unwrapped: report.missing.unwrapped.length,
  productsTranslated: `${mock.PRODUCTS.filter((p) => isPublicProduct(p)).length - report.untranslatedProducts.length}/${mock.PRODUCTS.filter((p) => isPublicProduct(p)).length}`,
  articlesTranslated: articles ? `${articles.length - report.untranslatedArticles.length}/${articles.length}` : "not checked",
  stale: staleCount,
  policy: report.policy.length,
  render: base ? report.render.length : "not run",
};
fs.writeFileSync(path.join(ROOT, "i18n-report.json"), JSON.stringify(report, null, 2) + "\n");

const todo = opt("--todo");
if (todo) {
  const flat = (l: Missing[]) => Object.fromEntries(l.map((m) => [m.fa, ""]));
  const out = {
    ui: flat(report.missing.ui),
    site: flat(report.missing.site),
    products: Object.fromEntries([...new Set(Object.values(report.missing.products).flat())].map((s) => [s, ""])),
    magazine: Object.fromEntries(Object.entries(report.missing.magazine).map(([id, l]) => [id, Object.fromEntries(l.map((s) => [s, ""]))])),
    unwrapped: report.missing.unwrapped,
  };
  fs.writeFileSync(path.resolve(todo), JSON.stringify(out, null, 2) + "\n");
}

console.log(JSON.stringify(report.summary, null, 2));
for (const n of report.notes) console.log(`note: ${n}`);
if (report.untranslatedArticles.length) console.log(`articles without English (no /en URL yet): ${report.untranslatedArticles.map((a) => a.id).join(", ")}`);
if (report.untranslatedProducts.length) console.log(`products without English (hidden on /en): ${report.untranslatedProducts.map((p) => p.id).join(", ")}`);
console.log(inSync ? "i18n: in sync" : "i18n: OUT OF SYNC — see i18n-report.json (missing / stale / policy / render)");
process.exit(inSync || flag("--warn") ? 0 : 1);
