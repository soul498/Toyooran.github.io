import React, { useState, useEffect } from 'react';
import { LazyImage } from "./LazyImage";
import { Package, Newspaper, Clock, ArrowLeft, ChevronLeft, Sparkles, Zap, ArrowRight } from '../icons';
import { Product, Article } from '../types';

interface CompactShowcaseProps {
  products: Product[];
  articles: Article[];
  onNavigate: (path: string) => void;
  onSelectProduct: (productId: string) => void;
  onSelectArticle: (articleId: string) => void;
}

export const CompactShowcase: React.FC<CompactShowcaseProps> = ({
  products,
  articles,
  onNavigate,
  onSelectProduct,
  onSelectArticle
}) => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (products && products.length > 0) {
      const featured = products.filter(p => p.isFeatured);
      setFeaturedProducts(featured.length > 0 ? featured.slice(0, 4) : products.slice(0, 4));
    }
  }, [products]);

  const featuredArticles = articles.slice(0, 3);
  
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto-slide functionality
  useEffect(() => {
    if (featuredProducts.length === 0) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % featuredProducts.length);
    }, 7000);
    return () => clearInterval(timer);
  }, [featuredProducts.length]);

  return (
    <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 mb-16 sm:mb-24 mt-12">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        
        {/* Dynamic Product Slider (takes 7 cols) */}
        <div className="lg:col-span-7 relative rounded-[2.5rem] p-1 overflow-hidden group shadow-2xl shadow-blue-900/20">
          {/* Animated Background Gradient (Aurora style) */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-950 via-[#003F86] to-indigo-900" />
          
          <div className="relative z-10 bg-slate-900/30 backdrop-blur-2xl rounded-[2.2rem] h-full border border-white/10 flex flex-col p-6 sm:p-10 overflow-hidden">
            
            {/* Header */}
            <div className="flex items-center justify-between mb-6 sm:mb-8">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md text-amber-400 flex items-center justify-center border border-white/20 shadow-inner shadow-white/10">
                  <Zap className="w-6 h-6" fill="currentColor" />
                </div>
                <div>
                  <h3 className="font-black text-xl sm:text-2xl text-white tracking-tight">محصولات پرفروش</h3>
                  <span className="text-[10px] sm:text-[11px] font-bold text-amber-400/90 mt-1 block tracking-wider uppercase">پیشنهادهای ویژه</span>
                </div>
              </div>
              <button 
                onClick={() => onNavigate('products')}
                className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-full text-xs font-bold text-white bg-white/10 hover:bg-white hover:text-[#003F86] flex items-center gap-2 transition-all duration-300 backdrop-blur-md border border-white/20 hover:border-transparent group/btn"
              >
                <span className="hidden sm:inline">مشاهده همه</span>
                <span className="sm:hidden">همه</span>
                <ArrowLeft className="w-4 h-4 group-hover/btn:-translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Slider Content */}
            <div className="flex-1 relative flex items-center justify-center min-h-[250px] sm:min-h-[300px]">
                {featuredProducts.length > 0 && (
                  <div
                    className="w-full flex flex-col md:flex-row items-center gap-6 sm:gap-10 cursor-pointer group/slide"
                    onClick={() => onSelectProduct(featuredProducts[currentSlide].id)}
                  >
                    <div className="w-48 sm:w-56 md:w-64 shrink-0 relative aspect-[4/3] rounded-3xl overflow-hidden bg-slate-50 border border-white/10">
                      <LazyImage 
                         src={featuredProducts[currentSlide].image} 
                         alt={featuredProducts[currentSlide].name} 
                         className="w-full h-full relative z-10" 
                         imgClassName="w-full h-full object-cover" 
                       />
                    </div>
                    
                    <div className="flex-1 text-center md:text-right flex flex-col items-center md:items-start">
                      <span className="inline-block px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full text-[10px] font-black tracking-wider mb-3 sm:mb-4">
                        {featuredProducts[currentSlide].categoryTitle}
                      </span>
                      <h4 className="text-xl sm:text-3xl lg:text-4xl font-black text-white leading-tight mb-4 sm:mb-6">
                        {featuredProducts[currentSlide].name}
                      </h4>
                      <div className="flex items-center gap-2 text-white/60 text-xs sm:text-sm font-medium">
                        مشاهده جزئیات و مشخصات فنی <ChevronLeft className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                )}
            </div>

            {/* Slider Dots */}
            <div className="flex items-center justify-center gap-2 mt-6 sm:mt-8 z-20">
              {featuredProducts.map((_, idx) => (
                <button
                  key={idx}
                  onClick={(e) => { e.stopPropagation(); setCurrentSlide(idx); }}
                  className={`h-1.5 sm:h-2 rounded-full transition-all duration-500 ${currentSlide === idx ? 'w-8 sm:w-10 bg-amber-400' : 'w-2 bg-white/20 hover:bg-white/40'}`}
                />
              ))}
            </div>

          </div>
        </div>

        {/* Dynamic Articles Column (takes 5 cols) - BENTO DESIGN */}
        <div className="lg:col-span-5 flex flex-col gap-4 h-full">
          {/* Floating Modern Header */}
          <div className="bg-white rounded-[2rem] p-4 sm:p-5 flex items-center justify-between shadow-xl shadow-slate-200/40 border border-slate-100 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-amber-400 rounded-[1.25rem] flex items-center justify-center text-white shadow-lg shadow-amber-400/30">
                <Newspaper className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-black text-xl text-slate-800 tracking-tight">مجله تخصصی</h3>
                <span className="text-[10px] sm:text-[11px] text-slate-400 font-bold block mt-0.5 uppercase tracking-wider">مقالات و اخبار صنعت</span>
              </div>
            </div>
            <button
              onClick={() => onNavigate('magazine')}
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-slate-50 hover:bg-slate-900 hover:text-amber-400 text-slate-600 flex items-center justify-center transition-all duration-300 group shadow-sm border border-slate-100"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 group-hover:scale-110 transition-all" />
            </button>
          </div>

          {/* Vertical Articles List */}
          <div className="flex flex-col gap-3 sm:gap-4 flex-1">
            {featuredArticles.slice(0, 3).map((article) => (
              <div
                key={article.id}
                onClick={() => onSelectArticle(article.id)}
                className="flex items-center gap-4 bg-white rounded-[1.5rem] p-3 sm:p-4 cursor-pointer border border-slate-100 hover:border-slate-200 transition-colors group"
              >
                <div className="w-20 h-20 sm:w-24 sm:h-24 shrink-0 rounded-xl overflow-hidden relative">
                  <LazyImage src={article.image} alt={article.title} className="w-full h-full" imgClassName="w-full h-full object-cover" />
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] sm:text-xs font-black text-amber-500 mb-1 sm:mb-1.5 block">
                    {article.categoryLabel}
                  </span>
                  <h4 className="text-slate-800 font-bold text-sm sm:text-[15px] leading-snug line-clamp-2 group-hover:text-amber-500 transition-colors">
                    {article.title}
                  </h4>
                  <div className="flex items-center gap-2 mt-2 sm:mt-2.5 text-[10px] sm:text-xs text-slate-400 font-medium">
                    <Clock className="w-3.5 h-3.5" />
                    {article.readTime}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );};
