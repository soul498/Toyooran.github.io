import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import {
  Search,
  PhoneCall,
  ArrowLeft,
  Filter
} from '../icons';
import { Link } from 'react-router-dom';
import { Product, ProductCategory } from '../types';
import { catalogHeading, publicProductPath } from '../seo/resolveSeo';
import { useData } from '../context/DataContext';
import { ProductThumb } from './ProductThumb';
import { ProductName } from './ProductName';
import { CategoryMarquee } from './CategoryMarquee';

import { t, tf } from '../i18n';
export { CATALOG_PDF_HREF } from '../data/pageHeroes';

interface ProductCatalogSectionProps {
  products: Product[];
  selectedCategory?: ProductCategory | 'all';
  onSelectCategory?: (cat: ProductCategory | 'all') => void;
  onSelectProduct: (product: Product) => void;
  onRequestQuoteForProduct: (product: Product) => void;
}

export const ProductCatalogSection: React.FC<ProductCatalogSectionProps> = ({ 
  products, 
  selectedCategory: propSelectedCategory,
  onSelectCategory: propOnSelectCategory,
  onSelectProduct,
  onRequestQuoteForProduct
}) => {
  const [localCategory, setLocalCategory] = useState<ProductCategory | 'all'>('all');
  const selectedCategory = propSelectedCategory !== undefined ? propSelectedCategory : localCategory;
  
  // Category switch: remember where the filter bar sits in the viewport and how tall the grid is,
  // so the next commit can pin the filter bar in place (content above it changes height between
  // the hub and a category) and keep the grid from collapsing while the new cards fade in.
  const filterRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const anchorTop = useRef<number | null>(null);
  const [reservedHeight, setReservedHeight] = useState<number | undefined>(undefined);
  const [switchCount, setSwitchCount] = useState(0);

  const handleSelectCategory = (cat: ProductCategory | 'all') => {
    if (cat === selectedCategory) return;
    if (filterRef.current) anchorTop.current = filterRef.current.getBoundingClientRect().top;
    if (gridRef.current) setReservedHeight(gridRef.current.offsetHeight);
    setSwitchCount((n) => n + 1);
    if (propOnSelectCategory) {
      propOnSelectCategory(cat);
    } else {
      setLocalCategory(cat);
    }
  };
  const { categories, catalogReady } = useData();
  const heading = catalogHeading(selectedCategory, categories as { id: string; title: string }[]);
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(() =>
    typeof window !== 'undefined' && window.innerWidth < 768 ? 4 : 6
  );
  
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Runs before paint: put the filter bar back exactly where the user clicked it.
  useLayoutEffect(() => {
    const top = anchorTop.current;
    anchorTop.current = null;
    if (top == null || !filterRef.current) return;
    const delta = filterRef.current.getBoundingClientRect().top - top;
    if (Math.abs(delta) > 1) window.scrollTo({ top: window.scrollY + delta, behavior: 'instant' as ScrollBehavior });
  }, [selectedCategory]);

  // Release the reserved grid height once the fade-in is over.
  useEffect(() => {
    if (reservedHeight === undefined) return;
    const t = window.setTimeout(() => setReservedHeight(undefined), 320);
    return () => window.clearTimeout(t);
  }, [reservedHeight, selectedCategory]);

  useEffect(() => {
    setVisibleCount(typeof window !== 'undefined' && window.innerWidth < 768 ? 4 : 6);
  }, [selectedCategory, searchQuery]);

  const filteredProducts = products.filter((p) => {
    const matchesCat = selectedCategory === 'all' || p.category === selectedCategory;
    // Name only: product codes (ts-xxx) are never shown to visitors, so they must not be searchable either.
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.trim().toLowerCase());
    const matchesIndustrial = true;
    return matchesCat && matchesSearch && matchesIndustrial;
  });

  const displayedProducts = filteredProducts.slice(0, visibleCount);
  const hasMore = visibleCount < filteredProducts.length;

  // Progressive grid: observe the sentinel again after every batch, so loading continues while it
  // stays in view (a one-shot observer stopped at the second batch and left the spinner forever).
  useEffect(() => {
    if (!hasMore) return;
    const node = loadMoreRef.current;
    if (!node || typeof IntersectionObserver === 'undefined') {
      setVisibleCount(filteredProducts.length);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) setVisibleCount((prev) => prev + 6);
      },
      { rootMargin: '400px 0px' }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, visibleCount, filteredProducts.length]);

  return (
    <section
      id="products"
      className="min-h-screen relative overflow-hidden z-0"
      // Mesh glow as section backgrounds (not absolutely positioned boxes) so a category switch that
      // changes the section height never registers as a layout shift.
      style={{
        backgroundImage:
          'radial-gradient(circle at 15% 15%, rgba(96,165,250,0.15) 0, transparent 35%), radial-gradient(circle at 85% 90%, rgba(251,191,36,0.15) 0, transparent 35%), radial-gradient(circle at 60% 50%, rgba(52,211,153,0.12) 0, transparent 30%)',
      }}
    >
      {/* Section hero (H1 + catalog download) is rendered by App (ShopHero) above this section.
          The long category copy (CATEGORY_SEO.intro) stays in #seo-prerender only; visitors asked
          not to see it above the grid. */}

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-0 pb-16 lg:pb-24 relative z-10">

        {/* 
          ========================================================
          FILTERS & SEARCH
          ========================================================
        */}
        <div ref={filterRef} className="w-full flex flex-col justify-start mb-4 relative z-20 pt-8 sm:pt-12 md:pt-16">
          <div className="flex items-center justify-center gap-4 mb-10 w-full opacity-60">
            <div className="h-px bg-slate-400 flex-1 max-w-[40px] sm:max-w-[60px]" />
            <h3 className="text-[11px] sm:text-xs font-bold text-slate-500 tracking-widest whitespace-nowrap">
              
              {t("دسته‌بندی محصولات")}
            </h3>
            <div className="h-px bg-slate-400 flex-1 max-w-[40px] sm:max-w-[60px]" />
          </div>
          {/* Infinite Draggable Category Marquee */}
          <CategoryMarquee 
            selectedCategory={selectedCategory} 
            onSelectCategory={handleSelectCategory} 
          />

          {/* Search & Toggles */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-3xl mx-auto">
            <div className="relative w-full sm:w-[400px]">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t("جستجوی نام محصول...")}
                className="w-full bg-white border border-slate-200 focus:border-[#003F86] rounded-2xl py-3.5 pr-12 pl-4 text-sm font-bold text-slate-800 transition-all outline-none placeholder:text-slate-400 placeholder:font-normal shadow-sm"
              />
              <Search className="w-5 h-5 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2" />
            </div>
        </div>
          </div>

        {/* 
          ========================================================
          PRODUCT GRID (DRIBBBLE STYLE / MINIMALIST)
          ========================================================
        */}
        <div
          ref={gridRef}
          key={switchCount > 0 ? `swap-${selectedCategory}` : 'initial'}
          className={`mt-2 sm:mt-4${switchCount > 0 ? ' catalog-swap' : ''}`}
          style={reservedHeight !== undefined ? { minHeight: reservedHeight } : undefined}
        >
            {!catalogReady && filteredProducts.length === 0 ? (
              <div className="min-h-[60vh]" aria-busy="true" />
            ) : filteredProducts.length === 0 ? (
              <div className="py-24 flex flex-col items-center justify-center text-center bg-white rounded-[3rem] border border-slate-200 shadow-sm">
                <div className="w-24 h-24 rounded-full bg-slate-50 flex items-center justify-center mb-6">
                  <Filter className="w-10 h-10 text-slate-400" />
                </div>
                <h3 className="text-2xl font-black text-slate-800 mb-3">{t("محصولی یافت نشد")}</h3>
                <p className="text-slate-500 mb-8 max-w-md">{t("هیچ محصولی با این فیلترها وجود ندارد. لطفاً کلمات کلیدی یا دسته‌بندی را تغییر دهید.")}</p>
                <button 
                  onClick={() => { handleSelectCategory('all'); setSearchQuery('');  }}
                  className="px-8 py-3 rounded-full bg-[#003F86] text-white font-bold hover:bg-blue-800 transition-colors shadow-lg shadow-blue-900/20"
                >
                  
                  {t("نمایش همه محصولات")}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 xl:gap-10">
                  {displayedProducts.map((product, index) => (
                    <div
                      key={`${product.id}-${selectedCategory}`}
                      className="group bg-white rounded-[2rem] p-4 shadow-sm border border-slate-100 hover:border-slate-200 transition-colors flex flex-col"
                    >
                    {/* Image Area */}
                    <Link
                      to={publicProductPath(product)}
                      className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden bg-slate-50 mb-6 block"
                    >
                      <ProductThumb
                        src={product.image}
                        alt={product.name}
                        sizes="(min-width: 1280px) 380px, (min-width: 1024px) 30vw, (min-width: 768px) 45vw, 92vw"
                        eager={index < 3}
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-500" />

                      {/* Floating Badges */}
                      <div className="absolute top-4 right-4 z-20 bg-white/90  px-4 py-1.5 rounded-full text-[11px] font-bold text-[#003F86] shadow-sm border border-white">
                        {product.categoryTitle.replace(/ مرغداری$/, '')}
                      </div>
                      
                      
                    </Link>
                    <div className="px-2 flex-1 flex flex-col">
                      <Link
                        to={publicProductPath(product)}
                        className="text-xl md:text-2xl font-black text-slate-900 mb-8 group-hover:text-[#003F86] transition-colors line-clamp-2"
                      >
                        <ProductName name={product.name} />
                      </Link>

                      {/* Action Buttons */}
                      <div className="mt-auto flex items-center gap-3">
                        <Link
                          to="/contact"
                          onClick={(e) => {
                            // The handler navigates to /contact itself and then scrolls to the form.
                            e.preventDefault();
                            e.stopPropagation();
                            onRequestQuoteForProduct(product);
                          }}
                          className="flex-1 bg-[#003F86] hover:bg-blue-800 text-white py-3.5 px-4 rounded-2xl font-bold text-sm transition-all shadow-lg shadow-blue-900/20 hover:shadow-blue-900/40 flex justify-center items-center gap-2"
                        >
                          <PhoneCall className="w-4 h-4" />
                          
                          {t("استعلام قیمت")}
                        </Link>
                        <Link
                          to={publicProductPath(product)}
                          className="w-14 h-14 shrink-0 flex justify-center items-center bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 rounded-2xl transition-colors"
                          title={t("مشاهده جزئیات کامل")}
                        >
                          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

          {/* Lazy Load Trigger (directly under the grid, above the full list) */}
          {hasMore && (
            <div ref={loadMoreRef} className="w-full h-20 flex items-center justify-center mt-8" aria-hidden="true">
              <div className="w-8 h-8 border-4 border-amber-400 border-t-transparent rounded-full animate-spin opacity-50" />
            </div>
          )}

          {/* Full crawlable list of this category's products (grid above loads progressively) */}
          {selectedCategory !== 'all' && !searchQuery && filteredProducts.length > 0 && (
            <nav aria-label={tf("فهرست محصولات {heading}", { heading })} className="mt-10 bg-white/80 rounded-3xl border border-slate-200 p-6">
              <h2 className="text-base font-black text-slate-900 mb-3">{t("فهرست کامل محصولات این دسته")}</h2>
              <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-1.5">
                {filteredProducts.map((p) => (
                  <li key={p.id} className="text-sm leading-7">
                    <Link to={publicProductPath(p)} className="text-[#003F86] hover:underline font-bold"><ProductName name={p.name} /></Link>
                  </li>
                ))}
              </ul>
            </nav>
          )}

        </div>

      </div>
    </section>
  );
};
