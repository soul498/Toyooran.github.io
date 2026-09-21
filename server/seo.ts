import { ARTICLES, PRODUCTS, SERVICES, PROJECTS, CATEGORIES_DATA, COMPANY_INFO } from "../src/data/mockData";

export const CANONICAL_ORIGIN = "https://www.toyooran.com";

const CATEGORY_META: Record<string, { title: string; h1: string; description: string }> = {
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

const SERVICE_ALIASES: Record<string, string> = {
  "poultry-hall-fitout": "srv-turnkey-shed",
};

export function stripQuery(rawPath: string): string {
  const pathOnly = (rawPath || "/").split("?")[0].split("#")[0];
  if (pathOnly.length > 1 && pathOnly.endsWith("/")) return pathOnly.slice(0, -1);
  return pathOnly || "/";
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function canonicalPath(pathname: string): string {
  return `${CANONICAL_ORIGIN}${pathname === "/" ? "/" : pathname}`;
}

type SeoDoc = {
  title: string;
  description: string;
  h1: string;
  ogType: string;
  body: string;
  jsonLd: unknown[];
  robots?: string;
  notFound?: boolean;
};

function orgSchema() {
  return {
    "@type": "Organization",
    "@id": `${CANONICAL_ORIGIN}/#org`,
    name: COMPANY_INFO.nameFa,
    alternateName: COMPANY_INFO.nameEn,
    url: CANONICAL_ORIGIN,
    telephone: COMPANY_INFO.phone,
    email: (COMPANY_INFO as { email?: string }).email,
    address: {
      "@type": "PostalAddress",
      addressCountry: "IR",
      streetAddress: COMPANY_INFO.address,
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

export function resolveSeo(pathname: string): SeoDoc {
  const path = stripQuery(pathname);
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
    };
  }

  if (path === "/") {
    return {
      title: "تجهیز و نوسازی سالن مرغداری | طیوران صنعت پویا",
      description:
        "طراحی، تأمین تجهیزات و اجرای نوسازی سالن مرغداری: تهویه، گرمایش، دانخوری و آبخوری. استعلام فنی از طیوران صنعت پویا.",
      h1: "تجهیز و نوسازی سالن مرغداری",
      ogType: "website",
      body: `<p>طیوران صنعت پویا طراحی، تأمین تجهیزات و اجرای نوسازی سالن مرغداری را انجام می‌دهد.</p>
<p><a href="/services/poultry-hall-fitout">نوسازی و تجهیز کامل سالن</a> · <a href="/products">تجهیزات مرغداری</a> · <a href="/contact">درخواست مشاوره</a></p>`,
      jsonLd: [
        orgSchema(),
        { "@type": "WebSite", "@id": `${CANONICAL_ORIGIN}/#website`, url: CANONICAL_ORIGIN, name: COMPANY_INFO.nameFa, publisher: { "@id": `${CANONICAL_ORIGIN}/#org` } },
      ],
    };
  }

  if (path === "/services") {
    const links = SERVICES.map((s) => `<li><a href="/services/${s.id}">${escapeHtml(s.title)}</a></li>`).join("");
    return {
      title: "خدمات طراحی و تجهیز مرغداری | طیوران صنعت پویا",
      description: "از طراحی سالن تا نصب تهویه، گرمایش و سیستم دان. درخواست مشاوره فنی.",
      h1: "خدمات طراحی، تجهیز و نوسازی مرغداری",
      ogType: "website",
      body: `<p>خدمات مهندسی و اجرایی طیوران صنعت پویا برای سالن مرغداری و کارخانه خوراک.</p><ul>${links}</ul><p><a href="/services/poultry-hall-fitout">تجهیز و نوسازی سالن مرغداری</a></p>`,
      jsonLd: [orgSchema(), breadcrumb([{ name: "خانه", path: "/" }, { name: "خدمات", path: "/services" }])],
    };
  }

  if (path.startsWith("/services/")) {
    const slug = path.split("/")[2];
    const serviceId = SERVICE_ALIASES[slug] || slug;
    const service = SERVICES.find((s) => s.id === serviceId);
    if (service) {
      const isFitout = slug === "poultry-hall-fitout" || serviceId === "srv-turnkey-shed";
      const title = isFitout
        ? "نوسازی و تجهیز کامل سالن مرغداری | طیوران صنعت پویا"
        : `${service.title} | طیوران صنعت پویا`;
      const h1 = isFitout ? "نوسازی و تجهیز کامل سالن مرغداری" : service.title;
      const description = isFitout
        ? "محاسبه ظرفیت، انتخاب تجهیزات و اجرای نوسازی سالن گوشتی/تخم‌گذار. بازدید و پیشنهاد فنی."
        : service.tagline;
      return {
        title,
        description,
        h1,
        ogType: "website",
        body: `<p>${escapeHtml(service.tagline)}</p><p>${escapeHtml(service.problemSolved)}</p>
<ul>${service.whatWeProvide.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
<p><a href="/contact">درخواست بازدید و پیشنهاد فنی</a> · <a href="/products">مشاهده تجهیزات</a></p>`,
        jsonLd: [
          orgSchema(),
          { "@type": "Service", name: h1, description, provider: { "@id": `${CANONICAL_ORIGIN}/#org` }, areaServed: "IR" },
          breadcrumb([{ name: "خانه", path: "/" }, { name: "خدمات", path: "/services" }, { name: h1, path }]),
        ],
      };
    }
  }

  if (path === "/products") {
    const cats = CATEGORIES_DATA.map((c) => `<li><a href="/products/${c.id}">${escapeHtml(c.title)}</a></li>`).join("");
    return {
      title: "تجهیزات مرغداری: تهویه، هیتر، دانخوری، آبخوری | طیوران صنعت پویا",
      description: "کاتالوگ هواکش، جت‌هیتر، دانخوری پروانه‌ای و آبخوری نیپل. استعلام قیمت.",
      h1: "تجهیزات مرغداری",
      ogType: "website",
      body: `<p>کاتالوگ تجهیزات سالن مرغداری طیوران صنعت پویا.</p><ul>${cats}</ul><p><a href="/contact">استعلام قیمت</a></p>`,
      jsonLd: [orgSchema(), breadcrumb([{ name: "خانه", path: "/" }, { name: "محصولات", path: "/products" }])],
    };
  }

  if (path.startsWith("/products/")) {
    const slug = decodeURIComponent(path.split("/")[2] || "");
    const category = CATEGORY_META[slug];
    if (category) {
      const items = PRODUCTS.filter((p) => p.category === slug)
        .slice(0, 12)
        .map((p) => `<li><a href="/products/${escapeHtml(p.code || p.id)}">${escapeHtml(p.name)}</a></li>`)
        .join("");
      return {
        title: category.title,
        description: category.description,
        h1: category.h1,
        ogType: "website",
        body: `<p>${escapeHtml(category.description)}</p><ul>${items}</ul><p><a href="/contact">استعلام فنی</a></p>`,
        jsonLd: [orgSchema(), breadcrumb([{ name: "خانه", path: "/" }, { name: "محصولات", path: "/products" }, { name: category.h1, path }])],
      };
    }
    const product = PRODUCTS.find((p) => p.id === slug || p.code === slug);
    if (product) {
      return {
        title: `${product.name} | طیوران صنعت پویا`,
        description: product.shortDescription || product.fullDescription,
        h1: product.name,
        ogType: "product",
        body: `<p>${escapeHtml(product.shortDescription || product.fullDescription)}</p>
<p>دسته: <a href="/products/${product.category}">${escapeHtml(product.categoryTitle)}</a></p>
<p><a href="/contact">استعلام قیمت</a></p>`,
        jsonLd: [
          {
            "@type": "Product",
            name: product.name,
            description: product.shortDescription || product.fullDescription,
            sku: product.code,
            brand: { "@type": "Brand", name: COMPANY_INFO.nameFa },
          },
          breadcrumb([{ name: "خانه", path: "/" }, { name: "محصولات", path: "/products" }, { name: product.name, path }]),
        ],
      };
    }
  }

  if (path === "/projects") {
    const links = PROJECTS.map((p) => `<li><a href="/projects/${p.id}">${escapeHtml(p.title)}</a></li>`).join("");
    return {
      title: "پروژه‌های تجهیز مرغداری | طیوران صنعت پویا",
      description: "نمونه کارهای اجرایی طیوران صنعت پویا در سالن مرغداری و کارخانه خوراک.",
      h1: "پروژه‌های اجراشده",
      ogType: "website",
      body: `<p>پروژه‌های شاخص طیوران صنعت پویا.</p><ul>${links}</ul>`,
      jsonLd: [orgSchema(), breadcrumb([{ name: "خانه", path: "/" }, { name: "پروژه‌ها", path: "/projects" }])],
    };
  }

  if (path.startsWith("/projects/")) {
    const project = PROJECTS.find((p) => p.id === path.split("/")[2]);
    if (project) {
      return {
        title: `${project.title} | طیوران صنعت پویا`,
        description: project.keyOutcome,
        h1: project.title,
        ogType: "article",
        body: `<p>${escapeHtml(project.location)} — ${escapeHtml(project.year)} — ظرفیت: ${escapeHtml(project.capacity)}</p>
<p>${escapeHtml(project.keyOutcome)}</p><p><a href="/contact">مشاوره پروژه مشابه</a></p>`,
        jsonLd: [
          { "@type": "Article", headline: project.title, description: project.keyOutcome, author: { "@id": `${CANONICAL_ORIGIN}/#org` } },
          breadcrumb([{ name: "خانه", path: "/" }, { name: "پروژه‌ها", path: "/projects" }, { name: project.title, path }]),
        ],
      };
    }
  }

  if (path === "/magazine") {
    const links = ARTICLES.map((a) => `<li><a href="/magazine/${a.id}">${escapeHtml(a.title)}</a></li>`).join("");
    return {
      title: "مجله تخصصی مرغداری | طیوران صنعت پویا",
      description: "راهنماهای فنی تهویه، گرمایش و تجهیز سالن مرغداری.",
      h1: "مجله تخصصی مرغداری",
      ogType: "website",
      body: `<ul>${links}</ul>`,
      jsonLd: [orgSchema()],
    };
  }

  if (path.startsWith("/magazine/")) {
    const article = ARTICLES.find((a) => a.id === path.split("/")[2]);
    if (article) {
      const bodyText = article.content.filter((p) => !p.startsWith("[")).slice(0, 3).map((p) => `<p>${escapeHtml(p)}</p>`).join("");
      return {
        title: `${article.title} | مجله طیوران صنعت پویا`,
        description: article.summary,
        h1: article.title,
        ogType: "article",
        body: `${bodyText}<p>بازبین فنی: واحد مهندسی طیوران صنعت پویا · تاریخ: ${escapeHtml(article.date)}</p>
<p><a href="/products/ventilation">تهویه</a> · <a href="/services/poultry-hall-fitout">تجهیز سالن</a> · <a href="/contact">مشاوره</a></p>`,
        jsonLd: [
          {
            "@type": "Article",
            headline: article.title,
            description: article.summary,
            datePublished: article.date,
            author: { "@type": "Organization", name: COMPANY_INFO.nameFa },
          },
          breadcrumb([{ name: "خانه", path: "/" }, { name: "مجله", path: "/magazine" }, { name: article.title, path }]),
        ],
      };
    }
  }

  if (path === "/about") {
    return {
      title: "درباره ما | طیوران صنعت پویا",
      description: "معرفی شرکت طیوران صنعت پویا، دفاتر مشهد و گرگان و حوزه فعالیت تجهیزات مرغداری.",
      h1: "درباره طیوران صنعت پویا",
      ogType: "website",
      body: `<p>${escapeHtml(COMPANY_INFO.tagline)}</p><p>${escapeHtml(COMPANY_INFO.address)}</p>`,
      jsonLd: [orgSchema()],
    };
  }

  if (path === "/contact") {
    return {
      title: "تماس و مشاوره تجهیز مرغداری | طیوران صنعت پویا",
      description: "درخواست مشاوره فنی برای تجهیز و نوسازی سالن مرغداری.",
      h1: "تماس و درخواست مشاوره",
      ogType: "website",
      body: `<p>تلفن: ${escapeHtml(COMPANY_INFO.phone)}</p><p><a href="tel:${escapeHtml(COMPANY_INFO.directSalesPhone || COMPANY_INFO.phone)}">تماس فروش</a></p>`,
      jsonLd: [orgSchema()],
    };
  }

  if (path === "/rnd") {
    return {
      title: "تحقیق و توسعه | طیوران صنعت پویا",
      description: "واحد تحقیق و توسعه طیوران صنعت پویا در گرگان.",
      h1: "تحقیق و توسعه",
      ogType: "website",
      body: `<p>${escapeHtml(COMPANY_INFO.rdAddress || "")}</p>`,
      jsonLd: [orgSchema()],
    };
  }

  return {
    title: "صفحه پیدا نشد | طیوران صنعت پویا",
    description: "صفحه مورد نظر یافت نشد.",
    h1: "صفحه پیدا نشد",
    ogType: "website",
    body: `<p>این مسیر در سایت وجود ندارد. <a href="/">بازگشت به خانه</a></p>`,
    jsonLd: [],
    notFound: true,
  };
}

export function isKnownPublicPath(pathname: string): boolean {
  const path = stripQuery(pathname);
  if (["/", "/products", "/services", "/projects", "/magazine", "/about", "/contact", "/rnd", "/admin", "/login", "/dashboard"].includes(path)) return true;
  if (path.startsWith("/admin") || path.startsWith("/login") || path.startsWith("/dashboard")) return true;
  if (path.startsWith("/magazine/") && ARTICLES.some((a) => a.id === path.split("/")[2])) return true;
  if (path.startsWith("/products/")) {
    const slug = decodeURIComponent(path.split("/")[2] || "");
    if (CATEGORY_META[slug]) return true;
    if (PRODUCTS.some((p) => p.id === slug || p.code === slug)) return true;
  }
  if (path.startsWith("/services/")) {
    const slug = path.split("/")[2];
    const id = SERVICE_ALIASES[slug] || slug;
    if (SERVICES.some((s) => s.id === id)) return true;
  }
  if (path.startsWith("/projects/") && PROJECTS.some((p) => p.id === path.split("/")[2])) return true;
  return false;
}

export function injectSeoTags(html: string, reqPath: string): string {
  const path = stripQuery(reqPath);
  const doc = resolveSeo(path);
  const canonical = canonicalPath(path);
  let out = html.replace(/<html\b[^>]*>/i, '<html lang="fa-IR" dir="rtl">');
  out = out.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(doc.title)}</title>`);
  if (out.includes('name="description"')) {
    out = out.replace(/<meta[^>]*name="description"[^>]*>/i, `<meta name="description" content="${escapeHtml(doc.description)}" />`);
  } else {
    out = out.replace("</head>", `  <meta name="description" content="${escapeHtml(doc.description)}" />\n  </head>`);
  }
  const robots = doc.robots ? `    <meta name="robots" content="${doc.robots}" />\n` : "";
  const jsonLd = doc.jsonLd.length
    ? `    <script type="application/ld+json">${JSON.stringify({ "@context": "https://schema.org", "@graph": doc.jsonLd }).replace(/</g, "\\u003c")}</script>\n`
    : "";
  const extra = `
    <link rel="canonical" href="${canonical}" />
    <meta property="og:title" content="${escapeHtml(doc.title)}" />
    <meta property="og:description" content="${escapeHtml(doc.description)}" />
    <meta property="og:url" content="${canonical}" />
    <meta property="og:type" content="${doc.ogType}" />
    <meta property="og:site_name" content="طیوران صنعت پویا" />
    <meta property="og:image" content="${CANONICAL_ORIGIN}/images/hero-final-1.jpg" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(doc.title)}" />
    <meta name="twitter:description" content="${escapeHtml(doc.description)}" />
${robots}${jsonLd}`;
  out = out.replace("</head>", `${extra}  </head>`);
  const prerender = `
    <div id="seo-prerender">
      <h1>${escapeHtml(doc.h1)}</h1>
      ${doc.body}
    </div>
    <style>#root:not(:empty)~#seo-prerender{display:none!important}</style>`;
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
`;
}

export function sitemapXml(): string {
  const urls: { loc: string; priority: string }[] = [
    { loc: "/", priority: "1.0" },
    { loc: "/services", priority: "0.9" },
    { loc: "/services/poultry-hall-fitout", priority: "0.9" },
    { loc: "/products", priority: "0.9" },
    { loc: "/projects", priority: "0.8" },
    { loc: "/magazine", priority: "0.6" },
    { loc: "/about", priority: "0.5" },
    { loc: "/contact", priority: "0.8" },
  ];
  for (const cat of Object.keys(CATEGORY_META)) urls.push({ loc: `/products/${cat}`, priority: "0.8" });
  for (const service of SERVICES) urls.push({ loc: `/services/${service.id}`, priority: "0.8" });
  for (const product of PRODUCTS) urls.push({ loc: `/products/${product.code || product.id}`, priority: "0.7" });
  for (const project of PROJECTS) urls.push({ loc: `/projects/${project.id}`, priority: "0.7" });
  for (const article of ARTICLES) urls.push({ loc: `/magazine/${article.id}`, priority: "0.6" });
  const body = urls
    .map(
      (u) => `  <url>
    <loc>${canonicalPath(u.loc)}</loc>
    <changefreq>weekly</changefreq>
    <priority>${u.priority}</priority>
  </url>`
    )
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>`;
}
