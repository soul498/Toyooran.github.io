import type { Article, CategoryItem, CompanyInfo, Product, Project, Service } from "../types";

export const CANONICAL_ORIGIN = "https://www.toyooran.com";
export const FITOUT_SERVICE_ID = "srv-turnkey-shed";
export const FITOUT_SLUG = "poultry-hall-fitout";

export const SEO_REDIRECTS: Record<string, string> = {
  [`/services/${FITOUT_SERVICE_ID}`]: `/services/${FITOUT_SLUG}`,
};

const CATEGORY_SEO: Record<string, { title: string; h1: string; description: string }> = {
  ventilation: {
    title: "هواکش و تهویه سالن مرغداری | طیوران صنعت پویا",
    h1: "هواکش و سیستم تهویه سالن مرغداری",
    description: "فن ۱۰۰ و ۱۴۰، اینلت و محاسبه تعداد هواکش بر اساس سطح مقطع سالن. استعلام فنی از طیوران صنعت پویا.",
  },
  heating: {
    title: "جت هیتر و گرمایش مرغداری | طیوران صنعت پویا",
    h1: "سیستم گرمایش سالن مرغداری",
    description: "هیتر گازی و دوگانه‌سوز برای سالن گوشتی؛ مقایسه با تابشی در مشاوره فنی طیوران صنعت پویا.",
  },
  feeding: {
    title: "دانخوری پروانه‌ای و بشقابی | طیوران صنعت پویا",
    h1: "دانخوری اتومات مرغداری",
    description: "دانخوری پروانه‌ای پویا و بشقابی؛ ظرفیت خط و کاهش پرت دان. استعلام از طیوران صنعت پویا.",
  },
  drinking: {
    title: "آبخوری نیپل مرغداری | طیوران صنعت پویا",
    h1: "سیستم آبخوری سالن مرغداری",
    description: "آبخوری نیپل و تجهیزات آب سالن مرغداری. درخواست مشاوره فنی از طیوران صنعت پویا.",
  },
  cooling: {
    title: "سرمایش و پد سلولزی مرغداری | طیوران صنعت پویا",
    h1: "سیستم سرمایش سالن مرغداری",
    description: "پد سلولزی و سرمایش سالن مرغداری. استعلام فنی از طیوران صنعت پویا.",
  },
  inlet: {
    title: "اینلت سالن مرغداری | طیوران صنعت پویا",
    h1: "دریچه اینلت سالن مرغداری",
    description: "اینلت و ورودی هوای سالن مرغداری. مشاوره انتخاب از طیوران صنعت پویا.",
  },
};

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
};

export function stripQuery(rawPath: string): string {
  const pathOnly = (rawPath || "/").split("?")[0].split("#")[0];
  if (pathOnly.length > 1 && pathOnly.endsWith("/")) return pathOnly.slice(0, -1);
  return pathOnly || "/";
}

export function canonicalPath(pathname: string): string {
  return `${CANONICAL_ORIGIN}${pathname === "/" ? "/" : pathname}`;
}

export function publicServicePath(service: Service): string {
  if (service.id === FITOUT_SERVICE_ID) return `/services/${FITOUT_SLUG}`;
  return `/services/${service.id}`;
}

export function publicProductPath(product: Product): string {
  return `/products/${encodeURIComponent(product.code || product.id)}`;
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
      streetAddress: company.address,
    },
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

function categoryMeta(slug: string, catalog: SeoCatalog) {
  if (CATEGORY_SEO[slug]) return CATEGORY_SEO[slug];
  const cat = catalog.categories.find((c) => c.id === slug);
  if (!cat) return null;
  return {
    title: `${cat.title} | طیوران صنعت پویا`,
    h1: cat.title,
    description: cat.description,
  };
}

function isCategorySlug(slug: string, catalog: SeoCatalog) {
  return Boolean(CATEGORY_SEO[slug] || catalog.categories.some((c) => c.id === slug));
}

function articleHtml(article: Article): string {
  const parts: string[] = [];
  for (const raw of article.content) {
    const text = raw.trim();
    if (!text) continue;
    const img = text.match(/^\[IMG\|([^|]+)\|([^\]]+)\]$/);
    if (img) {
      parts.push(`<figure><img src="${escapeHtml(img[1])}" alt="${escapeHtml(img[2])}" /><figcaption>${escapeHtml(img[2])}</figcaption></figure>`);
      continue;
    }
    const cta = text.match(/^\[CTA\|([^|]+)\|([^\]]+)\]$/);
    if (cta) {
      parts.push(`<p><a href="${escapeHtml(cta[2])}">${escapeHtml(cta[1])}</a></p>`);
      continue;
    }
    if (text.startsWith("## ")) {
      parts.push(`<h2>${escapeHtml(text.slice(3))}</h2>`);
      continue;
    }
    if (text.startsWith("### ")) {
      parts.push(`<h3>${escapeHtml(text.slice(4))}</h3>`);
      continue;
    }
    if (text.startsWith("- ")) {
      parts.push(`<ul><li>${escapeHtml(text.slice(2))}</li></ul>`);
      continue;
    }
    parts.push(`<p>${escapeHtml(text)}</p>`);
  }
  return parts.join("\n");
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
  return `<p>${escapeHtml(product.fullDescription || product.shortDescription)}</p>
<p>دسته: <a href="/products/${escapeHtml(product.category)}">${escapeHtml(product.categoryTitle)}</a></p>
${specs ? `<h2>مشخصات</h2><ul>${specs}</ul>` : ""}
${advantages ? `<h2>ویژگی‌ها</h2><ul>${advantages}</ul>` : ""}
<p><a href="/contact?cta=product-quote&amp;product=${encodeURIComponent(product.code || product.id)}">استعلام قیمت و مشخصات فنی</a></p>`;
}

function serviceBody(service: Service, h1: string): string {
  const provide = service.whatWeProvide.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
  const steps = (service.workflow || [])
    .map((step) => `<li>${escapeHtml(step.title)}: ${escapeHtml(step.description)} — خروجی: ${escapeHtml(step.deliverable)}</li>`)
    .join("");
  return `<p>${escapeHtml(service.tagline)}</p>
<p>${escapeHtml(service.problemSolved)}</p>
<h2>دامنه کار ${escapeHtml(h1)}</h2>
<ul>${provide}</ul>
${steps ? `<h2>فرایند اجرا</h2><ol>${steps}</ol>` : ""}
<p><a href="/contact?cta=service-visit">درخواست بازدید و پیشنهاد فنی</a> · <a href="/products">مشاهده تجهیزات</a></p>`;
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
  const path = stripQuery(pathname);
  const company = catalog.company;
  const privatePrefixes = ["/admin", "/login", "/dashboard", "/crm"];
  if (privatePrefixes.some((p) => path === p || path.startsWith(`${p}/`))) {
    return {
      title: "ورود مدیریت | طیوران صنعت پویا",
      description: "بخش خصوصی سامانه طیوران صنعت پویا.",
      h1: "ورود مدیریت",
      ogType: "website",
      body: "<p>این مسیر عمومی نیست.</p>",
      jsonLd: [],
      robots: "noindex, nofollow",
      canonicalHref: null,
    };
  }

  if (path === "/") {
    const serviceLinks = catalog.services
      .slice(0, 6)
      .map((s) => `<li><a href="${publicServicePath(s)}">${escapeHtml(s.title)}</a></li>`)
      .join("");
    return okDoc({
      path,
      title: "تجهیز و نوسازی سالن مرغداری | طیوران صنعت پویا",
      description:
        "طراحی، تأمین تجهیزات و اجرای نوسازی سالن مرغداری: تهویه، گرمایش، دانخوری و آبخوری. استعلام فنی از طیوران صنعت پویا.",
      h1: "تجهیز و نوسازی سالن مرغداری",
      ogType: "website",
      lastmod: collectionDay(catalog, "companyInfo"),
      body: `<p>طیوران صنعت پویا طراحی، تأمین تجهیزات و اجرای نوسازی سالن مرغداری را انجام می‌دهد. اعتبار دفاتر مشهد و واحد تحقیق و توسعه گرگان پشتوانه پروژه‌های اجرایی است.</p>
<p><a href="/services/${FITOUT_SLUG}">نوسازی و تجهیز کامل سالن</a> · <a href="/products">تجهیزات مرغداری</a> · <a href="/contact?cta=home-consult">درخواست مشاوره</a></p>
<ul>${serviceLinks}</ul>`,
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
    const links = catalog.services.map((s) => `<li><a href="${publicServicePath(s)}">${escapeHtml(s.title)}</a></li>`).join("");
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

  if (path.startsWith("/services/")) {
    const slug = path.split("/")[2];
    const service = findService(slug, catalog);
    if (service) {
      const isFitout = slug === FITOUT_SLUG || service.id === FITOUT_SERVICE_ID;
      const canonicalServicePath = publicServicePath(service);
      const title = isFitout
        ? "نوسازی و تجهیز کامل سالن مرغداری | طیوران صنعت پویا"
        : `${service.title} | طیوران صنعت پویا`;
      const h1 = isFitout ? "نوسازی و تجهیز کامل سالن مرغداری" : service.title;
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
        body: serviceBody(service, h1),
        jsonLd: [
          orgSchema(company),
          {
            "@type": "Service",
            name: h1,
            description,
            provider: { "@id": `${CANONICAL_ORIGIN}/#org` },
            areaServed: "IR",
            url: canonicalPath(canonicalServicePath),
          },
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
      body: `<p>کاتالوگ تجهیزات سالن مرغداری طیوران صنعت پویا.</p><ul>${cats}</ul><p><a href="/contact?cta=catalog-quote">استعلام قیمت</a></p>`,
      jsonLd: [orgSchema(company), breadcrumb([{ name: "خانه", path: "/" }, { name: "محصولات", path: "/products" }])],
    });
  }

  if (path.startsWith("/products/")) {
    const slug = decodeURIComponent(path.split("/")[2] || "");
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
        body: `<p>${escapeHtml(category.description)}</p><ul>${items}</ul><p><a href="/contact?cta=category-quote">استعلام فنی</a></p>`,
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
    const product = catalog.products.find((p) => p.id === slug || p.code === slug);
    if (product) {
      return okDoc({
        path: `/products/${product.code || product.id}`,
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
            brand: { "@type": "Brand", name: company.nameFa },
            manufacturer: { "@id": `${CANONICAL_ORIGIN}/#org` },
          },
          breadcrumb([
            { name: "خانه", path: "/" },
            { name: "محصولات", path: "/products" },
            { name: product.categoryTitle, path: `/products/${product.category}` },
            { name: product.name, path },
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

  if (path.startsWith("/projects/")) {
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
    const links = catalog.articles.map((a) => `<li><a href="/magazine/${a.id}">${escapeHtml(a.title)}</a></li>`).join("");
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

  if (path.startsWith("/magazine/")) {
    const article = catalog.articles.find((a) => a.id === path.split("/")[2]);
    if (article) {
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
      return okDoc({
        path,
        title: `${article.title} | مجله طیوران صنعت پویا`,
        description: article.summary,
        h1: article.title,
        ogType: "article",
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
            description: article.summary,
            datePublished: article.datePublishedIso || undefined,
            dateModified: article.dateModifiedIso || article.datePublishedIso || undefined,
            author: authorNode,
            ...(reviewerNode ? { reviewer: reviewerNode } : {}),
            publisher: { "@id": `${CANONICAL_ORIGIN}/#org` },
            mainEntityOfPage: canonicalPath(path),
          },
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
      body: `<p>${escapeHtml(company.tagline || "")}</p><p>${escapeHtml(company.address)}</p><p>واحد تحقیق و توسعه: ${escapeHtml(company.rdAddress || "")}</p>`,
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
      body: `<p>تلفن: ${escapeHtml(company.phone)}</p>
<p>فروش: ${escapeHtml(company.directSalesPhone || company.phone)}</p>
<ul>${locHtml}</ul>
<p><a href="#free-consultation-form">فرم درخواست مشاوره</a></p>`,
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
    robots: "noindex, nofollow",
    canonicalHref: null,
    notFound: true,
  };
}

export function isKnownPublicPath(pathname: string, catalog: SeoCatalog): boolean {
  const path = stripQuery(pathname);
  if (["/", "/products", "/services", "/projects", "/magazine", "/about", "/contact", "/rnd", "/admin", "/login", "/dashboard"].includes(path)) {
    return true;
  }
  if (path.startsWith("/admin") || path.startsWith("/login") || path.startsWith("/dashboard") || path.startsWith("/crm")) {
    return true;
  }
  if (path.startsWith("/magazine/") && catalog.articles.some((a) => a.id === path.split("/")[2])) return true;
  if (path.startsWith("/products/")) {
    const slug = decodeURIComponent(path.split("/")[2] || "");
    if (isCategorySlug(slug, catalog)) return true;
    if (catalog.products.some((p) => p.id === slug || p.code === slug)) return true;
  }
  if (path.startsWith("/services/")) {
    const slug = path.split("/")[2];
    if (findService(slug, catalog)) return true;
  }
  if (path.startsWith("/projects/") && catalog.projects.some((p) => p.id === path.split("/")[2])) return true;
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
    if (seen.has(loc)) return;
    seen.add(loc);
    urls.push({ loc, priority, lastmod });
  };
  for (const cat of catalog.categories) add(`/products/${cat.id}`, "0.8", collectionDay(catalog, "products"));
  for (const service of catalog.services) add(publicServicePath(service), "0.8", collectionDay(catalog, "services"));
  for (const product of catalog.products) add(`/products/${product.code || product.id}`, "0.7", collectionDay(catalog, "products"));
  for (const project of catalog.projects) add(`/projects/${project.id}`, "0.7", collectionDay(catalog, "projects"));
  for (const article of catalog.articles) {
    add(`/magazine/${article.id}`, "0.6", isoDay(article.dateModifiedIso || article.datePublishedIso) || collectionDay(catalog, "articles"));
  }
  return urls;
}
