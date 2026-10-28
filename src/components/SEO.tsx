import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useData } from "../context/DataContext";
import { resolveSeo, type SeoCatalog } from "../seo/resolveSeo";
import type { CategoryItem, CompanyInfo } from "../types";

interface SEOProps {
  title: string;
  description: string;
  ogType?: string;
  robots?: string;
  canonicalHref?: string | null;
}

export const SEO = ({ title, description, ogType = "website", robots, canonicalHref }: SEOProps) => {
  const { pathname } = useLocation();

  useEffect(() => {
    document.title = title;

    const updateOrCreateMeta = (name: string, content: string, isProperty = false) => {
      let meta = document.querySelector(`meta[${isProperty ? "property" : "name"}="${name}"]`);
      if (!meta) {
        meta = document.createElement("meta");
        if (isProperty) meta.setAttribute("property", name);
        else meta.setAttribute("name", name);
        document.head.appendChild(meta);
      }
      meta.setAttribute("content", content);
    };

    updateOrCreateMeta("description", description);
    updateOrCreateMeta("og:title", title, true);
    updateOrCreateMeta("og:description", description, true);
    updateOrCreateMeta("og:type", ogType, true);
    if (canonicalHref) updateOrCreateMeta("og:url", canonicalHref, true);
    updateOrCreateMeta("twitter:card", "summary_large_image");
    updateOrCreateMeta("twitter:title", title);
    updateOrCreateMeta("twitter:description", description);
    if (robots) updateOrCreateMeta("robots", robots);

    let canonical = document.querySelector('link[rel="canonical"]');
    if (canonicalHref) {
      if (!canonical) {
        canonical = document.createElement("link");
        canonical.setAttribute("rel", "canonical");
        document.head.appendChild(canonical);
      }
      canonical.setAttribute("href", canonicalHref);
    } else if (canonical) {
      canonical.remove();
    }
  }, [title, description, ogType, pathname, robots, canonicalHref]);

  return null;
};

export const SeoHead = () => {
  const { pathname } = useLocation();
  const { products, services, articles, categories, companyInfo, magazineReady, catalogReady } = useData();
  const catalog: SeoCatalog = {
    products,
    projects: [], // no projects are published yet
    services,
    articles,
    categories: categories as CategoryItem[],
    company: companyInfo as CompanyInfo,
  };
  const doc = resolveSeo(pathname, catalog);
  // Keep the server-rendered head + #seo-prerender until client data is loaded. Before this,
  // product URLs briefly resolved to the 404 doc (products start as []), which wrote
  // <meta robots="noindex"> + "صفحه پیدا نشد" into the rendered DOM Googlebot snapshots.
  const isMagazinePath = pathname === "/magazine" || pathname.startsWith("/magazine/");
  const holdServerSeo = (!magazineReady && isMagazinePath) || (Boolean(doc.notFound) && !(catalogReady && magazineReady));
  useEffect(() => {
    if (holdServerSeo) return;
    document.getElementById("seo-prerender")?.remove();
  }, [pathname, holdServerSeo]);
  if (holdServerSeo) return null;
  return (
    <SEO
      title={doc.title}
      description={doc.description}
      ogType={doc.ogType}
      robots={doc.robots}
      canonicalHref={doc.canonicalHref}
    />
  );
};
