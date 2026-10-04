import type { Article, CategoryItem, CompanyInfo, Product, Project, Service } from "../types";
import { withMediaVersion } from "../lib/mediaUrl";
import { articleBlocks } from "./articleBlocks";
import { effectiveSeoDescription, effectiveSeoTitle, isPublicArticle } from "./articleMeta";
import { PUBLIC_SERVICE_IDS } from "../data/mockData";

export const CANONICAL_ORIGIN = "https://www.toyooran.com";
export const FITOUT_SERVICE_ID = "srv-turnkey-shed";
export const FITOUT_SLUG = "poultry-hall-fitout";

export const SEO_REDIRECTS: Record<string, string> = {
  [`/services/${FITOUT_SERVICE_ID}`]: `/services/${FITOUT_SLUG}`,
  "/magazine/poultry-hall-audit-checklist": "/magazine/before-and-after-renovation",
};

const CATEGORY_SEO: Record<string, { title: string; h1: string; description: string; body: string }> = {
  ventilation: {
    title: "هواکش و تهویه سالن مرغداری | طیوران صنعت پویا",
    h1: "هواکش و سیستم تهویه سالن مرغداری",
    description: "فن ۱۰۰ و ۱۴۰، اینلت و محاسبه تعداد هواکش بر اساس سطح مقطع سالن. استعلام فنی از طیوران صنعت پویا.",
    body: "انتخاب فن بر اساس سطح مقطع سالن، سرعت هوای تونلی و ظرفیت در فشار استاتیک واقعی است نه ظرفیت اسمی کاتالوگ. اینلت، پد و کنترلر باید با همان محاسبه هماهنگ شوند.",
  },
  heating: {
    title: "جت هیتر و گرمایش مرغداری | طیوران صنعت پویا",
    h1: "سیستم گرمایش سالن مرغداری",
    description: "هیتر گازی و دوگانه‌سوز برای سالن گوشتی؛ مقایسه با تابشی در مشاوره فنی طیوران صنعت پویا.",
    body: "جت‌هیتر، کابینتی یا تابشی بر اساس عایق سازه، نوع سوخت، تهویه حداقل و توزیع دما انتخاب می‌شود. رقم مصرف سوخت واحد برای همه سالن‌ها ادعا نمی‌شود.",
  },
  feeding: {
    title: "دانخوری پروانه‌ای و بشقابی | طیوران صنعت پویا",
    h1: "دانخوری اتومات مرغداری",
    description: "دانخوری پروانه‌ای پویا و بشقابی؛ ظرفیت خط، تنظیم دان، شست‌وشو و استعلام از طیوران صنعت پویا.",
    body: "برای دانخوری اتومات باید تعداد خط، فاصله بشقاب، ارتفاع لبه، قابلیت تغذیه از یک‌روزگی و شست‌وشو مشخص شود. دانخوری پروانه‌ای پویا برای کاهش پرت دان و حذف سینی هفته اول طراحی شده؛ ظرفیت خط پس از ابعاد سالن محاسبه می‌شود. استعلام شامل نقشه چیدمان است نه فقط قیمت بشقاب.",
  },
  drinking: {
    title: "آبخوری نیپل مرغداری | طیوران صنعت پویا",
    h1: "سیستم آبخوری سالن مرغداری",
    description: "آبخوری نیپل و تجهیزات آب سالن مرغداری. درخواست مشاوره فنی از طیوران صنعت پویا.",
    body: "نیپل، فشارشکن و شیب خط باید با ظرفیت گله و کیفیت آب هماهنگ شود تا بستر خشک بماند.",
  },
  cooling: {
    title: "سرمایش و پد سلولزی مرغداری | طیوران صنعت پویا",
    h1: "سیستم سرمایش سالن مرغداری",
    description: "پد سلولزی و سرمایش سالن مرغداری. استعلام فنی از طیوران صنعت پویا.",
    body: "پد و مهپاش فقط وقتی مؤثرند که دبی فن و آب‌رسانی پد با اقلیم و سطح مقطع سالن جور باشد.",
  },
  inlet: {
    title: "اینلت سالن مرغداری | طیوران صنعت پویا",
    h1: "دریچه اینلت سالن مرغداری",
    description: "اینلت و ورودی هوای سالن مرغداری؛ فشار منفی، یکنواختی هوا و مشاوره انتخاب از طیوران صنعت پویا.",
    body: "اینلت باید با ظرفیت فن، فشار منفی هدف و فصل پرورش انتخاب شود. جانمایی نادرست نقطه کور و باد سرد روی بستر می‌سازد. در استعلام، عرض سالن، ارتفاع و نوع تهویه (حداقل/تونلی) لازم است تا تعداد و زاویه دریچه مشخص شود.",
  },
};

export const FITOUT_CHECKLIST = [
  "عایق سقف و دیوار و هوابندی سازه",
  "برق، دیزل و تابلو متناسب با فن و هیتر",
  "آب، فشارشکن و شیب خط آبخوری",
  "تهویه: فن، اینلت، پد و کنترل اقلیم",
  "گرمایش متناسب با اقلیم و عایق",
  "خطوط دان و آب و دسترسی شست‌وشو",
  "ایمنی گاز، اگزوز و خروج اضطراری",
];

export const FITOUT_LEAD =
  "نوسازی و تجهیز کامل سالن مرغداری یعنی سازه، دان، آب، تهویه و گرمایش در یک فرایند تحویل می‌شود تا ناهماهنگی سازنده سوله و نصاب تجهیزات تکرار نشود. کار از مشاوره و طراحی سازه شروع می‌شود، با اسکلت و پوشش عایق ادامه می‌یابد و با نصب خطوط و تحویل آماده جوجه‌ریزی تمام می‌شود.";

export type SeoCatalog = {
  products: Product[];
  services: Service[];
  projects: Project[];
  articles: Article[];
  categories: CategoryItem[];
  company: CompanyInfo;
  collectionUpdatedAt?: Partial<Record<"products" | "services" | "projects" | "articles" | "companyInfo", string | null>>;
};

export type SeoDoc = {
  title: string;
  description: string;
  h1: string;
  ogType: string;
  body: string;
  jsonLd: unknown[];
  robots: string;
  canonicalHref: string | null;
  notFound?: boolean;
  lastmod?: string;
  ogImage?: string;
};

export function stripQuery(rawPath: string): string {
  const pathOnly = (rawPath || "/").split("?")[0].split("#")[0];
  if (pathOnly.length > 1 && pathOnly.endsWith("/")) return pathOnly.slice(0, -1);
  return pathOnly || "/";
}

/** Decode percent-encoded path once. Express/nginx may pass either form; never throw on bad %. */
export function decodePathname(pathname: string): string {
  try {
    return decodeURIComponent(pathname);
  } catch {
    return pathname;
  }
}

export function publicSegments(pathname: string): string[] {
  return decodePathname(stripQuery(pathname)).split("/").filter(Boolean);
}

export function canonicalPath(pathname: string): string {
  return `${CANONICAL_ORIGIN}${pathname === "/" ? "/" : pathname}`;
}

export const PRIVATE_APP_PREFIXES = ["/admin", "/login", "/dashboard", "/crm", "/api"] as const;

export function isPrivateAppPath(pathname: string): boolean {
  const path = decodePathname(stripQuery(pathname));
  return PRIVATE_APP_PREFIXES.some((prefix) => path === prefix || path.startsWith(`${prefix}/`));
}

function listedServices(catalog: SeoCatalog): Service[] {
  const byId = new Map(catalog.services.map((s) => [s.id, s]));
  return PUBLIC_SERVICE_IDS.map((id) => byId.get(id)).filter((s): s is Service => Boolean(s));
}

export function publicServicePath(service: Service): string {
  if (service.id === FITOUT_SERVICE_ID) return `/services/${FITOUT_SLUG}`;
  return `/services/${service.id}`;
}

export function publicProductPath(product: Product): string {
  return `/products/${productSeoSlug(product)}`;
}

export function productSeoSlug(product: Product): string {
  const code = String(product.code || product.id || "").toLowerCase();
  const name = String(product.name || "")
    .trim()
    .replace(/[()[\].,،/\\+#]+/g, " ")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return name ? `${name}-${code}` : code;
}

export function findProduct(slug: string, source: SeoCatalog | Product[]): Product | undefined {
  const decoded = decodePathname(slug);
  const products = Array.isArray(source) ? source : source.products;
  return products.find(
    (p) => p.id === decoded || p.code === decoded || productSeoSlug(p) === decoded || productSeoSlug(p) === slug
  );
}

export function seoRedirectFor(pathname: string, catalog: SeoCatalog): string | null {
  const path = decodePathname(stripQuery(pathname));
  if (SEO_REDIRECTS[path]) return SEO_REDIRECTS[path];
  const parts = publicSegments(path);

  if (parts[0] === "products" && parts.length >= 2) {
    const slug = parts[1];
    if (isCategorySlug(slug, catalog)) {
      const leaf = `/products/${slug}`;
      return leaf !== path ? leaf : null;
    }
    const product = findProduct(slug, catalog);
    if (!product) return null;
    const canonical = publicProductPath(product);
    return canonical !== path ? canonical : null;
  }

  if (parts[0] === "services" && parts.length >= 2) {
    const service = findService(parts[1], catalog);
    if (!service) return null;
    const leaf = publicServicePath(service);
    return leaf !== path ? leaf : null;
  }

  if (parts[0] === "magazine" && parts.length >= 2) {
    const slug = parts[1];
    const aliasHit = catalog.articles.find((article) => article.id !== slug && isPublicArticle(article) && article.aliases?.includes(slug));
    if (aliasHit && parts.length === 2) return `/magazine/${aliasHit.id}`;
    if (parts.length > 2 && catalog.articles.some((article) => article.id === slug && isPublicArticle(article))) return `/magazine/${slug}`;
  }

  if (parts[0] === "projects" && parts.length > 2) {
    if (catalog.projects.some((p) => p.id === parts[1])) return `/projects/${parts[1]}`;
  }

  return null;
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function isoDay(value?: string | null): string | undefined {
  if (!value) return undefined;
  const m = value.match(/^(\d{4}-\d{2}-\d{2})/);
  return m ? m[1] : undefined;
}

function collectionDay(catalog: SeoCatalog, key: keyof NonNullable<SeoCatalog["collectionUpdatedAt"]>): string | undefined {
  return isoDay(catalog.collectionUpdatedAt?.[key] || undefined);
}

function orgSchema(company: CompanyInfo) {
  const sameAs = Object.values(company.socialLinks || {}).filter((url) => Boolean(url && url.startsWith("http")));
  return {
    "@type": "Organization",
    "@id": `${CANONICAL_ORIGIN}/#org`,
    name: company.nameFa,
    alternateName: company.nameEn,
    url: CANONICAL_ORIGIN,
    telephone: company.phone,
    email: company.email || undefined,
    address: {
      "@type": "PostalAddress",
      addressCountry: "IR",
      addressLocality: "مشهد",
      streetAddress: company.address,
    },
    sameAs,
  };
}

function breadcrumb(items: { name: string; path: string }[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: canonicalPath(item.path),
    })),
  };
}

export function categoryIntro(slug: string): string | undefined {
  return CATEGORY_SEO[slug]?.body;
}

function categoryMeta(slug: string, catalog: SeoCatalog) {
  if (CATEGORY_SEO[slug]) return CATEGORY_SEO[slug];
  const cat = catalog.categories.find((c) => c.id === slug);
  if (!cat) return null;
  return {
    title: `${cat.title} | طیوران صنعت پویا`,
    h1: cat.title,
    description: cat.description,
    body: cat.description,
  };
}

function isCategorySlug(slug: string, catalog: SeoCatalog) {
  return Boolean(CATEGORY_SEO[slug] || catalog.categories.some((c) => c.id === slug));
}

function articleShareImage(image?: string): string | undefined {
  if (!image || image.startsWith("data:") || image.startsWith("blob:")) return undefined;
  if (image.startsWith("http://") || image.startsWith("https://")) return image;
  const path = image.startsWith("/") ? image : `/${image}`;
  return `${CANONICAL_ORIGIN}${withMediaVersion(path)}`;
}

function faqEntities(article: Article): { q: string; a: string }[] {
  if (article.category !== "faq") return [];
  const blocks = articleBlocks(article.content || []);
  const pairs: { q: string; a: string }[] = [];
  let index = 0;
  while (index < blocks.length) {
    const question = blocks[index];
    const answer = blocks[index + 1];
    if (question?.type === "h3" && answer?.type === "p" && question.text.trim() && answer.text.trim()) {
      pairs.push({ q: question.text.trim(), a: answer.text.trim() });
      index += 2;
      continue;
    }
    index += 1;
  }
  return pairs;
}

function articleHtml(article: Article): string {
  return articleBlocks(article.content)
    .map((block) => {
      if (block.type === "h2") return `<h2>${escapeHtml(block.text)}</h2>`;
      if (block.type === "h3") return `<h3>${escapeHtml(block.text)}</h3>`;
      if (block.type === "p") return `<p>${escapeHtml(block.text)}</p>`;
      if (block.type === "ul") return `<ul>${block.items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
      if (block.type === "img") {
        return `<figure><img src="${escapeHtml(block.src)}" alt="${escapeHtml(block.alt)}" /><figcaption>${escapeHtml(block.alt)}</figcaption></figure>`;
      }
      if (block.type === "cta") return `<p><a href="${escapeHtml(block.href)}">${escapeHtml(block.label)}</a></p>`;
      const head = `<tr>${block.headers.map((cell) => `<th>${escapeHtml(cell)}</th>`).join("")}</tr>`;
      const body = block.rows.map((row) => `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join("")}</tr>`).join("");
      return `<table>${head}${body}</table>`;
    })
    .join("\n");
}

function productBody(product: Product): string {
  const specs = (product.specs || [])
    .slice(0, 12)
    .map((s) => `<li>${escapeHtml(s.label)}: ${escapeHtml(s.value)}</li>`)
    .join("");
  const advantages = (product.advantages || [])
    .slice(0, 8)
    .map((item) => `<li>${escapeHtml(item)}</li>`)
    .join("");
  const applications = (product.applications || [])
    .slice(0, 8)
    .map((item) => `<li>${escapeHtml(item)}</li>`)
    .join("");
  const feedingCta =
    product.category === "feeding"
      ? `<p><a href="/contact?cta=feeder-line-count&amp;product=${encodeURIComponent(product.code || product.id)}">محاسبه تعداد خطوط دانخوری</a></p>`
      : "";
  return `<p>${escapeHtml(product.fullDescription || product.shortDescription)}</p>
<p>دسته: <a href="/products/${escapeHtml(product.category)}">${escapeHtml(product.categoryTitle)}</a></p>
${specs ? `<h2>مشخصات</h2><ul>${specs}</ul>` : ""}
${advantages ? `<h2>ویژگی‌ها</h2><ul>${advantages}</ul>` : ""}
${applications ? `<h2>کاربردها</h2><ul>${applications}</ul>` : ""}
${feedingCta}
<p><a href="/contact?cta=product-quote&amp;product=${encodeURIComponent(product.code || product.id)}">استعلام قیمت و مشخصات فنی</a></p>`;
}

function serviceBody(service: Service, h1: string, catalog: SeoCatalog): string {
  const provide = service.whatWeProvide.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
  const steps = (service.workflow || [])
    .map((step) => `<li>${escapeHtml(step.title)}: ${escapeHtml(step.description)} — خروجی: ${escapeHtml(step.deliverable)}</li>`)
    .join("");
  const isFitout = service.id === FITOUT_SERVICE_ID;
  const checklist = isFitout ? `<h2>چک‌لیست ممیزی قبل از نوسازی</h2><ul>${FITOUT_CHECKLIST.map((i) => `<li>${escapeHtml(i)}</li>`).join("")}</ul>` : "";
  const faqs = (service.faqs || []).map((f) => `<h3>${escapeHtml(f.q)}</h3><p>${escapeHtml(f.a)}</p>`).join("");
  const related = catalog.projects
    .filter((p) => service.sampleProjectIds?.includes(p.id))
    .map((p) => `<li><a href="/projects/${p.id}">${escapeHtml(p.title)}</a> — ${escapeHtml(p.location)}</li>`)
    .join("");
  const lead = isFitout ? `<p>${escapeHtml(FITOUT_LEAD)}</p>` : `<p>${escapeHtml(service.tagline)}</p>`;
  const auditLink = isFitout
    ? ` · <a href="/magazine/before-and-after-renovation">قبل و بعد از نوسازی</a> · <a href="/contact?cta=hall-audit">درخواست ممیزی</a>`
    : "";
  return `${lead}
<p>${escapeHtml(service.problemSolved)}</p>
<h2>دامنه کار ${escapeHtml(h1)}</h2>
<ul>${provide}</ul>
${steps ? `<h2>فرایند اجرا</h2><ol>${steps}</ol>` : ""}
${checklist}
${related ? `<h2>پروژه‌های مرتبط</h2><ul>${related}</ul>` : ""}
${faqs ? `<h2>پرسش‌های متداول</h2>${faqs}` : ""}
<p><a href="/contact?cta=service-visit">درخواست بازدید و پیشنهاد فنی</a> · <a href="/products">مشاهده تجهیزات</a>${auditLink}</p>`;
}

function projectBody(project: Project): string {
  const cs = project.caseStudy;
  const steps = cs?.processSteps?.map((s) => `<li>${escapeHtml(s.title)}: ${escapeHtml(s.desc)}</li>`).join("") || "";
  const results = cs?.results?.map((r) => `<li>${escapeHtml(r.label)}: ${escapeHtml(r.value)} — ${escapeHtml(r.detail)}</li>`).join("") || "";
  return `<p>${escapeHtml(project.location)} — ${escapeHtml(project.year)} — ظرفیت: ${escapeHtml(project.capacity)}</p>
<p>${escapeHtml(project.keyOutcome)}</p>
${cs ? `<p>${escapeHtml(cs.problem)}</p><p>${escapeHtml(cs.solution)}</p>` : ""}
${steps ? `<h2>مراحل</h2><ol>${steps}</ol>` : ""}
${results ? `<h2>نتیجه اعلام‌شده</h2><ul>${results}</ul>` : `<ul>${project.servicesProvided.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`}
<p><a href="/contact?cta=project-consult">مشاوره پروژه مشابه</a></p>`;
}

function localBusinessNodes(company: CompanyInfo) {
  const locations = company.locations || [];
  return locations.map((loc) => ({
    "@type": loc.type === "factory" ? "LocalBusiness" : loc.type === "rd" ? "LocalBusiness" : "LocalBusiness",
    name: `${company.nameFa} — ${loc.title}`,
    parentOrganization: { "@id": `${CANONICAL_ORIGIN}/#org` },
    telephone: company.phone,
    address: {
      "@type": "PostalAddress",
      addressCountry: "IR",
      streetAddress: loc.address,
    },
  }));
}

function findService(slug: string, catalog: SeoCatalog): Service | undefined {
  const id = slug === FITOUT_SLUG ? FITOUT_SERVICE_ID : slug;
  return catalog.services.find((s) => s.id === id);
}

function okDoc(partial: Omit<SeoDoc, "robots" | "canonicalHref"> & { path: string; robots?: string; lastmod?: string }): SeoDoc {
  return {
    ...partial,
    robots: partial.robots || "index, follow",
    canonicalHref: canonicalPath(partial.path),
  };
}

export function resolveSeo(pathname: string, catalog: SeoCatalog): SeoDoc {
  const path = decodePathname(stripQuery(pathname));
  const company = catalog.company;
  if (isPrivateAppPath(path)) {
    return {
      title: "ورود مدیریت | طیوران صنعت پویا",
      description: "بخش خصوصی سامانه طیوران صنعت پویا.",
      h1: "ورود مدیریت",
      ogType: "website",
      body: "",
      jsonLd: [],
      robots: "noindex, nofollow, noarchive",
      canonicalHref: null,
    };
  }

  if (path === "/") {
    const serviceLinks = listedServices(catalog)
      .map((s) => `<li><a href="${publicServicePath(s)}">${escapeHtml(s.title)}</a></li>`)
      .join("");
    return okDoc({
      path,
      title: "طیوران صنعت پویا | تجهیز و نوسازی سالن مرغداری",
      description:
        "طراحی، تأمین تجهیزات و اجرای نوسازی سالن مرغداری: تهویه، گرمایش، دانخوری و آبخوری. استعلام فنی از طیوران صنعت پویا.",
      h1: "طیوران صنعت پویا",
      ogType: "website",
      lastmod: collectionDay(catalog, "companyInfo"),
      body: `<p>طیوران صنعت پویا طراحی، تأمین تجهیزات و اجرای نوسازی سالن مرغداری را انجام می‌دهد. اعتبار دفاتر مشهد و واحد تحقیق و توسعه گرگان پشتوانه پروژه‌های اجرایی است.</p>
<p>تلفن دفتر مشهد: ${escapeHtml(company.phone)} · فروش: ${escapeHtml(company.directSalesPhone || company.phone)}</p>
<p>${escapeHtml(company.address)}</p>
<p>واحد تحقیق و توسعه: ${escapeHtml(company.rdAddress || "")}</p>
<p><a href="/services/${FITOUT_SLUG}">نوسازی و تجهیز کامل سالن</a> · <a href="/products">تجهیزات مرغداری</a> · <a href="/contact?cta=home-consult">درخواست مشاوره</a></p>
<h2>خدمات</h2>
<ul>${serviceLinks}</ul>
<h2>دسته‌های تجهیزات</h2>
<ul>${catalog.categories.map((c) => `<li><a href="/products/${c.id}">${escapeHtml(c.title)}</a></li>`).join("")}</ul>`,
      jsonLd: [
        orgSchema(company),
        {
          "@type": "WebSite",
          "@id": `${CANONICAL_ORIGIN}/#website`,
          url: CANONICAL_ORIGIN,
          name: company.nameFa,
          publisher: { "@id": `${CANONICAL_ORIGIN}/#org` },
        },
      ],
    });
  }

  if (path === "/services") {
    const links = listedServices(catalog).map((s) => `<li><a href="${publicServicePath(s)}">${escapeHtml(s.title)}</a></li>`).join("");
    return okDoc({
      path,
      title: "خدمات طراحی و تجهیز مرغداری | طیوران صنعت پویا",
      description: "از طراحی سالن تا نصب تهویه، گرمایش و سیستم دان. درخواست مشاوره فنی.",
      h1: "خدمات طراحی، تجهیز و نوسازی مرغداری",
      ogType: "website",
      lastmod: collectionDay(catalog, "services"),
      body: `<p>خدمات مهندسی و اجرایی طیوران صنعت پویا برای سالن مرغداری و کارخانه خوراک.</p><ul>${links}</ul><p><a href="/services/${FITOUT_SLUG}">تجهیز و نوسازی سالن مرغداری</a></p>`,
      jsonLd: [orgSchema(company), breadcrumb([{ name: "خانه", path: "/" }, { name: "خدمات", path: "/services" }])],
    });
  }

  if (path.startsWith("/services/") && publicSegments(path).length === 2) {
    const slug = path.split("/")[2];
    const service = findService(slug, catalog);
    if (service) {
      const isFitout = slug === FITOUT_SLUG || service.id === FITOUT_SERVICE_ID;
      const canonicalServicePath = publicServicePath(service);
      const title = isFitout
        ? "تجهیز و نوسازی سالن مرغداری | طیوران صنعت پویا"
        : `${service.title} | طیوران صنعت پویا`;
      const h1 = isFitout ? "تجهیز و نوسازی سالن مرغداری" : service.title;
      const description = isFitout
        ? "محاسبه ظرفیت، انتخاب تجهیزات و اجرای نوسازی سالن گوشتی/تخم‌گذار. بازدید و پیشنهاد فنی."
        : service.tagline;
      return okDoc({
        path: canonicalServicePath,
        title,
        description,
        h1,
        ogType: "website",
        lastmod: collectionDay(catalog, "services"),
        body: serviceBody(service, h1, catalog),
        jsonLd: [
          orgSchema(company),
          {
            "@type": "Service",
            name: h1,
            description,
            provider: { "@id": `${CANONICAL_ORIGIN}/#org` },
            areaServed: ["IR", "مشهد", "گرگان"],
            url: canonicalPath(canonicalServicePath),
          },
          ...(service.faqs?.length
            ? [
                {
                  "@type": "FAQPage",
                  mainEntity: service.faqs.map((f) => ({
                    "@type": "Question",
                    name: f.q,
                    acceptedAnswer: { "@type": "Answer", text: f.a },
                  })),
                },
              ]
            : []),
          breadcrumb([
            { name: "خانه", path: "/" },
            { name: "خدمات", path: "/services" },
            { name: h1, path: canonicalServicePath },
          ]),
        ],
      });
    }
  }

  if (path === "/products") {
    const cats = catalog.categories.map((c) => `<li><a href="/products/${c.id}">${escapeHtml(c.title)}</a></li>`).join("");
    return okDoc({
      path,
      title: "تجهیزات مرغداری: تهویه، هیتر، دانخوری، آبخوری | طیوران صنعت پویا",
      description: "کاتالوگ هواکش، جت‌هیتر، دانخوری پروانه‌ای و آبخوری نیپل. استعلام قیمت.",
      h1: "تجهیزات مرغداری",
      ogType: "website",
      lastmod: collectionDay(catalog, "products"),
      body: `<p>کاتالوگ تجهیزات سالن مرغداری طیوران صنعت پویا.</p><ul>${cats}</ul><p><a href="/TSPK_catalog.pdf">دانلود کاتالوگ PDF</a> · <a href="/contact?cta=catalog-quote">استعلام قیمت</a></p>`,
      jsonLd: [orgSchema(company), breadcrumb([{ name: "خانه", path: "/" }, { name: "محصولات", path: "/products" }])],
    });
  }

  if (path.startsWith("/products/") && publicSegments(path).length === 2) {
    const slug = decodePathname(path.split("/")[2] || "");
    const category = categoryMeta(slug, catalog);
    if (category && isCategorySlug(slug, catalog)) {
      const items = catalog.products
        .filter((p) => p.category === slug)
        .slice(0, 20)
        .map((p) => `<li><a href="${publicProductPath(p)}">${escapeHtml(p.name)}</a></li>`)
        .join("");
      return okDoc({
        path,
        title: category.title,
        description: category.description,
        h1: category.h1,
        ogType: "website",
        lastmod: collectionDay(catalog, "products"),
        body: `<p>${escapeHtml(category.body || category.description)}</p><ul>${items}</ul><p><a href="/contact?cta=category-quote">استعلام فنی</a> · <a href="/services/${FITOUT_SLUG}">تجهیز و نوسازی سالن</a></p>`,
        jsonLd: [
          orgSchema(company),
          breadcrumb([
            { name: "خانه", path: "/" },
            { name: "محصولات", path: "/products" },
            { name: category.h1, path },
          ]),
        ],
      });
    }
    const product = findProduct(slug, catalog);
    if (product) {
      const imagePath = withMediaVersion(product.image || "/images/hero-final-1.jpg");
      const imageAbs = imagePath.startsWith("http") ? imagePath : `${CANONICAL_ORIGIN}${imagePath}`;
      return okDoc({
        path: publicProductPath(product),
        title: `${product.name} | طیوران صنعت پویا`,
        description: product.shortDescription || product.fullDescription,
        h1: product.name,
        ogType: "product",
        lastmod: collectionDay(catalog, "products"),
        body: productBody(product),
        jsonLd: [
          {
            "@type": "Product",
            name: product.name,
            description: product.shortDescription || product.fullDescription,
            sku: product.code,
            image: imageAbs,
            brand: { "@type": "Brand", name: company.nameFa },
            manufacturer: { "@id": `${CANONICAL_ORIGIN}/#org` },
            offers: {
              "@type": "Offer",
              url: canonicalPath(publicProductPath(product)),
              availability: "https://schema.org/InStock",
              businessFunction: "https://schema.org/Sell",
              priceSpecification: {
                "@type": "PriceSpecification",
                description: "قیمت پس از استعلام فنی و ظرفیت سالن اعلام می‌شود؛ قیمت ثابت در اسکیما درج نشده است.",
              },
            },
          },
          breadcrumb([
            { name: "خانه", path: "/" },
            { name: "محصولات", path: "/products" },
            { name: product.categoryTitle, path: `/products/${product.category}` },
            { name: product.name, path: publicProductPath(product) },
          ]),
        ],
      });
    }
  }

  if (path === "/projects") {
    const links = catalog.projects.map((p) => `<li><a href="/projects/${p.id}">${escapeHtml(p.title)}</a></li>`).join("");
    return okDoc({
      path,
      title: "پروژه‌های تجهیز مرغداری | طیوران صنعت پویا",
      description: "نمونه کارهای اجرایی طیوران صنعت پویا در سالن مرغداری و کارخانه خوراک.",
      h1: "پروژه‌های اجراشده",
      ogType: "website",
      lastmod: collectionDay(catalog, "projects"),
      body: `<p>پروژه‌های شاخص طیوران صنعت پویا. جزئیات عددی فقط در صورت داده تأییدشده شرکت در صفحه پروژه آمده است.</p><ul>${links}</ul>`,
      jsonLd: [orgSchema(company), breadcrumb([{ name: "خانه", path: "/" }, { name: "پروژه‌ها", path: "/projects" }])],
    });
  }

  if (path.startsWith("/projects/") && publicSegments(path).length === 2) {
    const project = catalog.projects.find((p) => p.id === path.split("/")[2]);
    if (project) {
      return okDoc({
        path,
        title: `${project.title} | طیوران صنعت پویا`,
        description: project.keyOutcome,
        h1: project.title,
        ogType: "article",
        lastmod: collectionDay(catalog, "projects"),
        body: projectBody(project),
        jsonLd: [
          {
            "@type": "CreativeWork",
            headline: project.title,
            description: project.keyOutcome,
            about: project.typeTitle,
            author: { "@id": `${CANONICAL_ORIGIN}/#org` },
          },
          breadcrumb([
            { name: "خانه", path: "/" },
            { name: "پروژه‌ها", path: "/projects" },
            { name: project.title, path },
          ]),
        ],
      });
    }
  }

  if (path === "/magazine") {
    const links = catalog.articles.filter((article) => isPublicArticle(article)).map((a) => `<li><a href="/magazine/${a.id}">${escapeHtml(a.title)}</a></li>`).join("");
    return okDoc({
      path,
      title: "مجله تخصصی مرغداری | طیوران صنعت پویا",
      description: "راهنماهای فنی تهویه، گرمایش و تجهیز سالن مرغداری.",
      h1: "مجله تخصصی مرغداری",
      ogType: "website",
      lastmod: collectionDay(catalog, "articles"),
      body: `<ul>${links}</ul>`,
      jsonLd: [orgSchema(company), breadcrumb([{ name: "خانه", path: "/" }, { name: "مجله", path: "/magazine" }])],
    });
  }

  if (path.startsWith("/magazine/") && publicSegments(path).length === 2) {
    const article = catalog.articles.find((a) => a.id === path.split("/")[2]);
    if (article && isPublicArticle(article)) {
      const relatedService = article.relatedServiceId
        ? catalog.services.find((s) => s.id === article.relatedServiceId)
        : undefined;
      const relatedProducts = catalog.products.filter((p) => article.relatedProductIds?.includes(p.id)).slice(0, 4);
      const authorNode = article.authorName
        ? { "@type": "Person", name: article.authorName, jobTitle: article.authorRole }
        : { "@type": "Organization", name: company.nameFa };
      const reviewerNode = article.reviewerName
        ? { "@type": "Person", name: article.reviewerName, jobTitle: article.reviewerRole }
        : undefined;
      const sourceHtml = (article.sources || [])
        .map((s) => (s.url ? `<li><a href="${escapeHtml(s.url)}">${escapeHtml(s.name)}</a></li>` : `<li>${escapeHtml(s.name)}</li>`))
        .join("");
      const relatedHtml = [
        relatedService ? `<a href="${publicServicePath(relatedService)}">${escapeHtml(relatedService.title)}</a>` : `<a href="/services/${FITOUT_SLUG}">تجهیز سالن</a>`,
        ...relatedProducts.map((p) => `<a href="${publicProductPath(p)}">${escapeHtml(p.name)}</a>`),
        `<a href="/contact?cta=article-consult">مشاوره</a>`,
      ].join(" · ");
      const seoTitle = effectiveSeoTitle(article);
      const seoDescription = effectiveSeoDescription(article);
      const shareImage = articleShareImage(article.image);
      const faqs = faqEntities(article);
      return okDoc({
        path,
        title: seoTitle || `${article.title} | مجله طیوران صنعت پویا`,
        description: seoDescription || article.summary,
        h1: article.title,
        ogType: "article",
        robots: article.noindex ? "noindex, follow" : undefined,
        ogImage: shareImage,
        lastmod: isoDay(article.dateModifiedIso || article.datePublishedIso) || collectionDay(catalog, "articles"),
        body: `${articleHtml(article)}
<p>نویسنده: ${escapeHtml(article.authorName || "نام نویسنده پس از Brief فنی تکمیل می‌شود")} ${article.authorRole ? `(${escapeHtml(article.authorRole)})` : ""}</p>
<p>بازبین فنی: ${escapeHtml(article.reviewerName || "در انتظار بازبین نام‌دار واحد مهندسی")}</p>
<p>تاریخ انتشار: ${escapeHtml(article.datePublishedIso || article.date)}</p>
${sourceHtml ? `<h2>منابع</h2><ul>${sourceHtml}</ul>` : ""}
<p>${relatedHtml}</p>`,
        jsonLd: [
          {
            "@type": "Article",
            headline: article.title,
            description: seoDescription || article.summary,
            inLanguage: "fa",
            image: shareImage,
            datePublished: article.datePublishedIso || undefined,
            dateModified: article.dateModifiedIso || article.datePublishedIso || undefined,
            author: authorNode,
            ...(reviewerNode ? { reviewer: reviewerNode } : {}),
            publisher: { "@id": `${CANONICAL_ORIGIN}/#org` },
            mainEntityOfPage: canonicalPath(path),
          },
          ...(faqs.length
            ? [
                {
                  "@type": "FAQPage",
                  mainEntity: faqs.map((item) => ({
                    "@type": "Question",
                    name: item.q,
                    acceptedAnswer: { "@type": "Answer", text: item.a },
                  })),
                },
              ]
            : []),
          ...(article.id === "how-to-calculate-ventilation-capacity"
            ? [
                {
                  "@type": "HowTo",
                  name: article.title,
                  description: article.summary,
                  step: [
                    { "@type": "HowToStep", name: "محاسبه حجم و سطح مقطع سالن", text: "طول، عرض و ارتفاع میانگین سالن را برای حجم و سطح مقطع تهویه تونلی ثبت کنید." },
                    { "@type": "HowToStep", name: "تعیین وزن زنده پایان دوره", text: "تعداد پرنده × وزن هدف؛ مبنای دبی باید منبع سویه باشد نه رقم بازار بدون شرط." },
                    { "@type": "HowToStep", name: "انتخاب فن روی منحنی فشار استاتیک", text: "ظرفیت کاتالوگ را در فشار استاتیک پد/اینلت اصلاح کنید و با مهندس تأیید کنید." },
                  ],
                },
              ]
            : []),
          breadcrumb([
            { name: "خانه", path: "/" },
            { name: "مجله", path: "/magazine" },
            { name: article.title, path },
          ]),
        ],
      });
    }
  }

  if (path === "/about") {
    return okDoc({
      path,
      title: "درباره ما | طیوران صنعت پویا",
      description: "معرفی شرکت طیوران صنعت پویا، دفاتر مشهد و گرگان و حوزه فعالیت تجهیزات مرغداری.",
      h1: "درباره طیوران صنعت پویا",
      ogType: "website",
      lastmod: collectionDay(catalog, "companyInfo"),
      body: `<p>${escapeHtml(company.tagline || "")}</p>
<p>${escapeHtml(company.subTagline || "")}</p>
<p>تلفن: ${escapeHtml(company.phone)} · فروش: ${escapeHtml(company.directSalesPhone || "")} · پشتیبانی فنی: ${escapeHtml(company.technicalSupportPhone || "")}</p>
<p>ساعات کار: ${escapeHtml(company.workingHours)}</p>
<p>دفتر مشهد: ${escapeHtml(company.address)}</p>
<p>کارخانه: ${escapeHtml(company.factoryAddress)}</p>
<p>واحد تحقیق و توسعه گرگان: ${escapeHtml(company.rdAddress || "")}</p>
<p><a href="/contact?cta=about">درخواست مشاوره تجهیز سالن</a></p>`,
      jsonLd: [orgSchema(company)],
    });
  }

  if (path === "/contact") {
    const locHtml = (company.locations || [])
      .map((loc) => `<li>${escapeHtml(loc.title)}: ${escapeHtml(loc.address)}</li>`)
      .join("");
    return okDoc({
      path,
      title: "تماس و مشاوره تجهیز مرغداری | طیوران صنعت پویا",
      description: "درخواست مشاوره فنی برای تجهیز و نوسازی سالن مرغداری.",
      h1: "تماس و درخواست مشاوره",
      ogType: "website",
      lastmod: collectionDay(catalog, "companyInfo"),
      body: `<p>تلفن دفتر مشهد: ${escapeHtml(company.phone)}</p>
<p>فروش: ${escapeHtml(company.directSalesPhone || company.phone)}</p>
<p>پشتیبانی فنی: ${escapeHtml(company.technicalSupportPhone || "")}</p>
<p>ساعات کار: ${escapeHtml(company.workingHours)}</p>
<ul>${locHtml}</ul>
<p><a href="#free-consultation-form">فرم درخواست بازدید و پیشنهاد فنی</a></p>`,
      jsonLd: [orgSchema(company), ...localBusinessNodes(company)],
    });
  }

  if (path === "/rnd") {
    return okDoc({
      path,
      title: "تحقیق و توسعه | طیوران صنعت پویا",
      description: "واحد تحقیق و توسعه طیوران صنعت پویا در گرگان.",
      h1: "تحقیق و توسعه",
      ogType: "website",
      lastmod: collectionDay(catalog, "companyInfo"),
      body: `<p>${escapeHtml(company.rdAddress || "")}</p><p><a href="/contact?cta=rnd">ارتباط با واحد فنی</a></p>`,
      jsonLd: [orgSchema(company)],
    });
  }

  return {
    title: "صفحه پیدا نشد | طیوران صنعت پویا",
    description: "صفحه مورد نظر یافت نشد.",
    h1: "صفحه پیدا نشد",
    ogType: "website",
    body: `<p>این مسیر در سایت وجود ندارد. <a href="/">بازگشت به خانه</a></p>`,
    jsonLd: [],
    robots: "noindex, follow",
    canonicalHref: null,
    notFound: true,
  };
}

export function isKnownPublicPath(pathname: string, catalog: SeoCatalog): boolean {
  const path = decodePathname(stripQuery(pathname));
  const parts = publicSegments(path);
  if (["/", "/products", "/services", "/projects", "/magazine", "/about", "/contact", "/rnd", "/admin", "/login", "/dashboard"].includes(path)) {
    return true;
  }
  if (path.startsWith("/admin") || path.startsWith("/login") || path.startsWith("/dashboard") || path.startsWith("/crm")) {
    return true;
  }
  if (parts.length !== 2) return false;
  if (parts[0] === "magazine") return catalog.articles.some((a) => a.id === parts[1]);
  if (parts[0] === "products") {
    const slug = parts[1];
    if (isCategorySlug(slug, catalog)) return true;
    return catalog.products.some((p) => p.id === slug || p.code === slug || productSeoSlug(p) === slug);
  }
  if (parts[0] === "services") return Boolean(findService(parts[1], catalog));
  if (parts[0] === "projects") return catalog.projects.some((p) => p.id === parts[1]);
  return false;
}

export function sitemapEntries(catalog: SeoCatalog): { loc: string; lastmod?: string; priority: string }[] {
  const urls: { loc: string; lastmod?: string; priority: string }[] = [
    { loc: "/", priority: "1.0", lastmod: collectionDay(catalog, "companyInfo") },
    { loc: "/services", priority: "0.9", lastmod: collectionDay(catalog, "services") },
    { loc: `/services/${FITOUT_SLUG}`, priority: "0.9", lastmod: collectionDay(catalog, "services") },
    { loc: "/products", priority: "0.9", lastmod: collectionDay(catalog, "products") },
    { loc: "/projects", priority: "0.8", lastmod: collectionDay(catalog, "projects") },
    { loc: "/magazine", priority: "0.6", lastmod: collectionDay(catalog, "articles") },
    { loc: "/about", priority: "0.5", lastmod: collectionDay(catalog, "companyInfo") },
    { loc: "/contact", priority: "0.8", lastmod: collectionDay(catalog, "companyInfo") },
    { loc: "/rnd", priority: "0.4", lastmod: collectionDay(catalog, "companyInfo") },
  ];
  const seen = new Set(urls.map((u) => u.loc));
  const add = (loc: string, priority: string, lastmod?: string) => {
    if (isPrivateAppPath(loc) || seen.has(loc)) return;
    seen.add(loc);
    urls.push({ loc, priority, lastmod });
  };
  for (const cat of catalog.categories) add(`/products/${cat.id}`, "0.8", collectionDay(catalog, "products"));
  for (const service of catalog.services) add(publicServicePath(service), "0.8", collectionDay(catalog, "services"));
  for (const product of catalog.products) add(publicProductPath(product), "0.7", collectionDay(catalog, "products"));
  for (const project of catalog.projects) add(`/projects/${project.id}`, "0.7", collectionDay(catalog, "projects"));
  for (const article of catalog.articles) {
    if (!isPublicArticle(article) || article.noindex) continue;
    add(`/magazine/${article.id}`, "0.6", isoDay(article.dateModifiedIso || article.datePublishedIso) || collectionDay(catalog, "articles"));
  }
  return urls;
}

export function llmsTxt(catalog: SeoCatalog): string {
  const services = catalog.services.map((s) => `- ${publicServicePath(s)} — ${s.title}`).join("\n");
  const cats = catalog.categories.map((c) => `- /products/${c.id} — ${c.title}`).join("\n");
  const posts = catalog.articles
    .filter((article) => isPublicArticle(article) && !article.noindex)
    .map((article) => `- /magazine/${article.id} — ${article.title}`)
    .join("\n");
  return `# طیوران صنعت پویا
> تجهیز و نوسازی سالن مرغداری؛ تهویه، گرمایش، دانخوری و آبخوری. دفاتر مشهد و گرگان.

- سایت: ${CANONICAL_ORIGIN}
- تماس: ${CANONICAL_ORIGIN}/contact
- خدمت محوری: ${CANONICAL_ORIGIN}/services/${FITOUT_SLUG}

## خدمات
${services}

## دسته‌های محصول
${cats}

## مجله
${posts}

## قواعد استناد
- اعداد ظرفیت فن و مصرف سوخت را بدون فشار استاتیک، اقلیم و تأیید مهندس نقل نکنید.
- قیمت محصول در صفحات عمومی استعلام است نه رقم ثابت.
- نقشه و مشخصات را از HTML اولیه یا صفحه محصول/خدمت بخوانید نه از حدس مدل.
`;
}
