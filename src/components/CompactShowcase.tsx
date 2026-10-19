import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { LazyImage } from './LazyImage';
import {
  Newspaper,
  Clock,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Zap,
  LayoutGrid,
  Box,
  Thermometer,
  Fan,
  Droplets,
  Snowflake,
  Wind,
  Wheat,
  Database,
  MoreHorizontal,
} from '../icons';
import { Product, Article, CategoryItem } from '../types';
import { publicProductPath, homeH2, HOME_LINKS_PRODUCTS_HEADING } from '../seo/resolveSeo';
import { homePriorityProducts } from '../seo/internalLinks';
import { useData } from '../context/DataContext';
import { withViewTransition } from '../lib/motion';

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  LayoutGrid,
  Box,
  Thermometer,
  Fan,
  Droplets,
  Snowflake,
  Wind,
  Wheat,
  Database,
  MoreHorizontal,
};

interface CompactShowcaseProps {
  products: Product[];
  articles: Article[];
  onNavigate: (path: string) => void;
  onSelectProduct: (productId: string) => void;
  onSelectArticle: (articleId: string) => void;
}

/** Bestsellers stay first. Priority products that are not already featured are appended. */
export function showcaseSlides(products: Product[]): Product[] {
  const featured = products.filter((product) => product.isFeatured);
  const popular = homePriorityProducts(products);
  const seen = new Set<string>();
  const slides: Product[] = [];
  for (const product of [...featured, ...popular]) {
    if (seen.has(product.id)) continue;
    seen.add(product.id);
    slides.push(product);
  }
  if (slides.length > 0) return slides;
  return products.slice(0, 4);
}

const faNum = (value: number) => value.toLocaleString('fa-IR');

export const CompactShowcase: React.FC<CompactShowcaseProps> = ({
  products,
  articles,
  onNavigate,
  onSelectArticle,
}) => {
  const { categories } = useData();
  const slides = useMemo(() => showcaseSlides(products), [products]);
  const featuredArticles = articles.slice(0, 3);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [paused, setPaused] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (currentSlide >= slides.length) setCurrentSlide(0);
  }, [currentSlide, slides.length]);

  useEffect(() => {
    if (slides.length < 2 || paused) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const timer = setInterval(() => {
      // Autoplay only while the slider is on screen and the tab is visible.
      if (document.hidden || sliderRef.current?.classList.contains('is-visible') === false) return;
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 7000);
    return () => clearInterval(timer);
  }, [paused, slides.length]);

  const go = (delta: number) => {
    if (slides.length === 0) return;
    withViewTransition(() => setCurrentSlide((prev) => (prev + delta + slides.length) % slides.length));
  };

  return (
    <section className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 mb-16 sm:mb-24 mt-12 space-y-6 lg:space-y-8">
      {categories.length > 0 && (
        <CategoryBand categories={categories} onNavigate={onNavigate} />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        <div
          ref={sliderRef}
          data-anim
          className="lg:col-span-7 relative rounded-[2.5rem] p-1 overflow-hidden shadow-2xl shadow-blue-900/20"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocus={() => setPaused(true)}
          onBlur={() => setPaused(false)}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-950 via-[#003F86] to-indigo-900" />
          <div className="tsp-aurora" aria-hidden="true">
            <span className="tsp-loop" />
            <span className="tsp-loop" />
            <span className="tsp-loop" />
          </div>

          <div className="relative z-10 bg-slate-900/30 rounded-[2.2rem] h-full border border-white/10 flex flex-col p-6 sm:p-10 overflow-hidden">
            <div className="flex items-center justify-between mb-6 sm:mb-8 gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-12 h-12 shrink-0 rounded-2xl bg-white/10 text-amber-400 flex items-center justify-center border border-white/20">
                  <Zap className="w-6 h-6" fill="currentColor" />
                </div>
                <div className="min-w-0">
                  <h2 className="font-black text-xl sm:text-2xl text-white tracking-tight">{homeH2('bestsellers')}</h2>
                  <p className="text-[11px] sm:text-xs font-bold text-amber-300/90 mt-1">
                    {HOME_LINKS_PRODUCTS_HEADING} در همین اسلاید
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('products')}
                aria-label="مشاهده همه محصولات"
                className="min-h-11 shrink-0 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full text-xs font-bold text-white bg-white/10 hover:bg-white hover:text-[#003F86] flex items-center gap-2 transition-colors border border-white/20 hover:border-transparent"
              >
                <span className="hidden sm:inline">مشاهده همه</span>
                <span className="sm:hidden">همه</span>
                <ArrowLeft className="w-4 h-4" />
              </button>
            </div>

            <div className="tsp-slide-stage flex-1 relative min-h-[250px] sm:min-h-[300px]">
              {slides.map((product, idx) => {
                const active = idx === currentSlide;
                const showImage = active || idx === (currentSlide + 1) % slides.length;
                return (
                  <Link
                    key={product.id}
                    to={publicProductPath(product)}
                    className={`tsp-slide group w-full flex flex-col md:flex-row items-center gap-6 sm:gap-10 text-inherit no-underline ${
                      active ? 'relative' : 'absolute inset-0 opacity-0 pointer-events-none'
                    }`}
                    aria-label={`مشاهده محصول ${product.name}`}
                    aria-hidden={active ? undefined : true}
                    tabIndex={active ? undefined : -1}
                  >
                    <div className="tsp-zoom w-48 sm:w-56 md:w-64 shrink-0 relative aspect-[4/3] rounded-3xl overflow-hidden bg-slate-50 border border-white/10">
                      {showImage && (
                        <LazyImage
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full relative z-10"
                          imgClassName="w-full h-full object-cover"
                          width={400}
                          height={300}
                        />
                      )}
                    </div>
                    <div className="flex-1 text-center md:text-right flex flex-col items-center md:items-start">
                      <span className="inline-flex items-center gap-2 mb-3 sm:mb-4">
                        <span className="px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full text-[10px] font-black">
                          {product.categoryTitle}
                        </span>
                        <span className="px-3 py-1 rounded-full text-[10px] font-black bg-white/10 text-white border border-white/15">
                          {product.isFeatured ? 'پرفروش' : 'پرکاربرد'}
                        </span>
                      </span>
                      <p className="text-xl sm:text-3xl lg:text-4xl font-black text-white leading-tight mb-4 sm:mb-6">
                        {product.name}
                      </p>
                      <div className="flex items-center gap-2 text-slate-200 text-xs sm:text-sm font-medium">
                        مشاهده جزئیات و مشخصات فنی <ChevronLeft className="w-4 h-4" aria-hidden="true" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            {slides.length > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6 sm:mt-8 z-20">
                <button
                  type="button"
                  onClick={() => go(-1)}
                  aria-label="اسلاید قبلی"
                  className="min-w-11 min-h-11 rounded-full bg-white/10 text-white border border-white/15 flex items-center justify-center hover:bg-white hover:text-[#003F86]"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-1.5 overflow-x-auto max-w-[16rem] sm:max-w-xs px-1" role="tablist" aria-label="اسلاید محصولات">
                  {slides.map((product, idx) => (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() => withViewTransition(() => setCurrentSlide(idx))}
                      aria-label={`اسلاید ${faNum(idx + 1)}: ${product.name}`}
                      aria-current={currentSlide === idx ? 'true' : undefined}
                      className="min-w-8 min-h-11 flex items-center justify-center shrink-0"
                    >
                      <span className={`block h-1.5 rounded-full transition-all ${currentSlide === idx ? 'w-6 bg-amber-400' : 'w-1.5 bg-white/40'}`} />
                    </button>
                  ))}
                </div>
                <span className="text-xs font-bold text-white/80 tabular-nums min-w-[3.5rem] text-center">
                  {faNum(currentSlide + 1)}/{faNum(slides.length)}
                </span>
                <button
                  type="button"
                  onClick={() => go(1)}
                  aria-label="اسلاید بعدی"
                  className="min-w-11 min-h-11 rounded-full bg-white/10 text-white border border-white/15 flex items-center justify-center hover:bg-white hover:text-[#003F86]"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-5 flex flex-col gap-4 h-full">
          <Link
            to="/magazine"
            onClick={() => onNavigate('magazine')}
            data-reveal
            className="bg-white rounded-[2rem] p-4 sm:p-5 flex items-center justify-between shadow-xl shadow-slate-200/40 border border-slate-100 shrink-0 no-underline text-inherit"
            aria-label="ورود به مجله تخصصی"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-amber-400 rounded-[1.25rem] flex items-center justify-center text-white">
                <Newspaper className="w-6 h-6" />
              </div>
              <div>
                <p className="font-black text-xl text-slate-800 tracking-tight">مجله تخصصی</p>
                <span className="text-[10px] sm:text-[11px] text-slate-600 font-bold block mt-0.5">هفت راهنمای سالن مرغداری</span>
              </div>
            </div>
            <span className="min-w-11 min-h-11 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-slate-50 text-slate-600 flex items-center justify-center border border-slate-100">
              <ArrowLeft className="w-5 h-5" aria-hidden="true" />
            </span>
          </Link>

          <div className="flex flex-col gap-3 sm:gap-4 flex-1">
            {featuredArticles.map((article, idx) => (
              <button
                key={article.id}
                data-reveal
                style={{ '--ri': idx + 1 } as React.CSSProperties}
                type="button"
                onClick={() => onSelectArticle(article.id)}
                aria-label={`مشاهده مقاله ${article.title}`}
                className="flex items-center gap-4 bg-white rounded-[1.5rem] p-3 sm:p-4 cursor-pointer border border-slate-100 hover:border-slate-200 transition-colors group w-full text-right"
              >
                <div className="tsp-zoom w-20 h-20 sm:w-24 sm:h-24 shrink-0 rounded-xl overflow-hidden relative">
                  <LazyImage src={article.image} alt={article.title} className="w-full h-full" imgClassName="w-full h-full object-cover" width={192} height={192} />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] sm:text-xs font-black text-amber-500 mb-1 sm:mb-1.5 block">
                    {article.categoryLabel}
                  </span>
                  <p className="text-slate-800 font-bold text-sm sm:text-[15px] leading-snug line-clamp-2 group-hover:text-amber-500 transition-colors">
                    {article.title}
                  </p>
                  <div className="flex items-center gap-2 mt-2 sm:mt-2.5 text-[10px] sm:text-xs text-slate-600 font-medium">
                    <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                    {article.readTime}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

const CategoryBand: React.FC<{ categories: CategoryItem[]; onNavigate: (path: string) => void }> = ({ categories, onNavigate }) => (
  <div className="rounded-[2rem] bg-white border border-slate-100 shadow-xl shadow-slate-200/40 p-5 sm:p-7">
    <div className="flex items-end justify-between gap-4 mb-5">
      <div>
        <h2 id="home-popular-links" className="font-black text-xl sm:text-2xl text-slate-900 tracking-tight">
          {homeH2('categories')}
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 font-bold mt-1">دسته‌بندی محصولات تجهیزات دام و طیور</p>
      </div>
      <Link
        to="/products"
        onClick={() => onNavigate('products')}
        className="shrink-0 min-h-11 inline-flex items-center gap-1.5 text-xs sm:text-sm font-black text-[#003F86] no-underline"
      >
        کاتالوگ
        <ArrowLeft className="w-4 h-4" />
      </Link>
    </div>
    <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {categories.map((category, idx) => {
        const Icon = CATEGORY_ICONS[category.icon] || LayoutGrid;
        return (
          <li key={category.id} data-reveal style={{ '--ri': idx % 5 } as React.CSSProperties}>
            <Link
              to={`/products/${category.id}`}
              className="tsp-lift group flex items-center gap-3 h-full rounded-2xl border border-slate-100 bg-slate-50/80 px-3 py-3 no-underline text-inherit hover:border-[#003F86]/25 hover:bg-white"
            >
              <span className="w-11 h-11 shrink-0 rounded-xl bg-white text-[#003F86] border border-slate-100 flex items-center justify-center group-hover:bg-[#003F86] group-hover:text-white group-hover:border-[#003F86]">
                <Icon className="w-5 h-5" aria-hidden="true" />
              </span>
              <span className="min-w-0">
                <span className="block text-[13px] sm:text-sm font-black text-slate-800 leading-snug">{category.title}</span>
                {category.productCount ? (
                  <span className="block text-[10px] font-bold text-slate-500 mt-0.5">{faNum(category.productCount)} محصول</span>
                ) : null}
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  </div>
);
