import React from 'react';
import { Download } from '../icons';
import { catalogHeading, categoryIntroRich } from '../seo/resolveSeo';
import { CATALOG_PDF_HREF } from '../data/pageHeroes';
import { HeroCta, PageBanner } from './PageBanner';
import { RichInline } from './RichBlocks';

const SHOP_SUBTITLE =
  'تهویه، گرمایش، دانخوری، آبخوری، قفس و سیلو؛ مشخصات فنی هر محصول را ببینید و برای قیمت روز استعلام بگیرید.';

/**
 * Section hero for /products (same look as the other nav routes). Rendered by App outside the
 * route Suspense so the H1 (the LCP) paints before the lazy catalog chunk. The H1 text is
 * catalogHeading() — identical to the prerender H1 — and the catalog download sits above it.
 */
export const ShopHero: React.FC<{
  selectedCategory: string;
  categories: { id: string; title: string }[];
}> = ({ selectedCategory, categories }) => {
  const rich = selectedCategory !== 'all' ? categoryIntroRich(selectedCategory) : undefined;
  return (
<PageBanner
  title={catalogHeading(selectedCategory, categories)}
  highlight="دام و طیور"
  subtitle={rich ? <RichInline text={rich} /> : SHOP_SUBTITLE}
>
  <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
    <a
      href={CATALOG_PDF_HREF}
      download="TSPK_catalog.pdf"
      className="page-hero-cta inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full bg-[#003F86] text-white font-bold text-sm px-6 py-3 shadow-lg shadow-blue-900/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500"
    >
      <Download className="w-4 h-4" aria-hidden="true" />
      دانلود کاتالوگ
    </a>
    <HeroCta label="استعلام قیمت" href="/contact" />
  </div>
</PageBanner>

  );
};
