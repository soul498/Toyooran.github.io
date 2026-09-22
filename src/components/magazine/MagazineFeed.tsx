import React, { useState, useEffect } from 'react';
import { useInView } from '../../lib/useInView';
import { Clock, Calendar, ArrowLeft, ChevronLeft } from '../../icons';
import { Link } from 'react-router-dom';
import { PageBanner } from '../PageBanner';
import { LazyImage } from '../LazyImage';
import type { Article } from '../../types';

const IMAGES = [
  '/images/poultry-1.jpg',
  '/images/factory-1.jpg',
  '/images/equipment-1.jpg',
  '/images/tech-1.jpg',
  '/images/control-1.jpg',
  '/images/machine-1.jpg',
  '/images/silo-1.jpg',
];

interface MagazineFeedProps {
  articles: Article[];
  onSelectArticle: (article: Article) => void;
}


export const MagazineFeed: React.FC<MagazineFeedProps> = ({ articles, onSelectArticle }) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [visibleCount, setVisibleCount] = useState(6);
  
  const { ref: loadMoreRef, isInView } = useInView<HTMLDivElement>();

  useEffect(() => {
    setVisibleCount(6);
  }, [activeCategory]);

  useEffect(() => {
    if (isInView) {
      setVisibleCount(prev => prev + 6);
    }
  }, [isInView]);
  
  const categories = [
    { id: 'all', label: 'همه مطالب' },
    { id: 'technical-guide', label: 'فنی مهندسی' },
    { id: 'product-guide', label: 'راهنمای محصول' },
    { id: 'article', label: 'مقالات علمی' },
  ];

  const filteredArticles = activeCategory === 'all'
    ? articles
    : articles.filter((a) => a.category === activeCategory);

  const featuredArticle = filteredArticles[0];
  const gridArticles = filteredArticles.slice(1);
  const displayedGridArticles = gridArticles.slice(0, visibleCount);

  const getArticleImage = (article: Article, index: number) => article.image || IMAGES[index % IMAGES.length];

  return (
    <div className="min-h-screen relative z-0" id="magazine-feed">
      <PageBanner
        title="مجله تخصصی طیوران صنعت پویا"
        subtitle="راهنمای تهویه، گرمایش، دانخوری و تجهیز سالن مرغداری"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 lg:pb-24 relative z-10">

        {/* Categories (Glassmorphism Tabs) */}
        <div className="flex flex-wrap justify-center gap-3 mb-16">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-6 py-2.5 rounded-2xl text-sm font-bold transition-all duration-300  border ${
                activeCategory === cat.id
                  ? 'bg-gradient-to-r from-[#003F86] to-blue-700 text-white border-blue-600 shadow-xl shadow-blue-900/20 scale-105'
                  : 'bg-white/95 text-slate-700 border-white/80 hover:bg-white hover:border-white hover:shadow-lg'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Featured Article */}
        {featuredArticle && (
            <div className="mb-12 group relative">
              <Link to={`/magazine/${featuredArticle.id}`} className="block">
              {/* Highlight glow behind featured */}
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 to-amber-500/20 rounded-[2.5rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 -z-10" />
              
              <div className="relative rounded-[2rem] overflow-hidden bg-white transform-gpu will-change-transform shadow-sm hover:shadow-lg border border-slate-100 flex flex-col md:flex-row h-auto md:min-h-[28rem] transition-all duration-300">
                {/* Image Side */}
                <div className="w-full md:w-1/2 h-64 md:h-auto relative overflow-hidden shrink-0">
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent z-10 pointer-events-none" />
                  <LazyImage 
                    src={getArticleImage(featuredArticle, 0)} 
                    alt={featuredArticle.title}
                    className="absolute inset-0 w-full h-full"
                    imgClassName="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="absolute top-6 right-6 z-20">
                     <span className="bg-white/20  text-white border border-white/30 text-xs font-bold px-4 py-1.5 rounded-full shadow-sm">
                       {featuredArticle.categoryLabel}
                     </span>
                  </div>
                </div>
                
                {/* Content Side */}
                <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center relative">
                  <div className="flex items-center gap-5 text-sm text-slate-500 mb-6 font-medium">
                    <span className="flex items-center gap-2"><Calendar className="w-4 h-4 text-[#003F86]" /> {featuredArticle.date}</span>
                    <span className="flex items-center gap-2"><Clock className="w-4 h-4 text-amber-500" /> {featuredArticle.readTime}</span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-black text-slate-900 leading-[1.6] mb-6 group-hover:text-[#003F86] transition-colors">
                    {featuredArticle.title}
                  </h2>
                  <p className="text-slate-600 text-base md:text-lg leading-relaxed mb-8">
                    {featuredArticle.summary}
                  </p>
                  <div className="mt-auto">
                    <span className="inline-flex items-center gap-2 text-[#003F86] font-bold group-hover:gap-4 transition-all bg-blue-50 px-5 py-2.5 rounded-xl border border-blue-100">
                      ادامه مطلب <ArrowLeft className="w-5 h-5" />
                    </span>
                  </div>
                </div>
              </div>
              </Link>
            </div>
        )}

        {/* Grid Articles */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {displayedGridArticles.map((article, index) => (
              <div
                key={article.id}
                className="relative bg-white rounded-[2rem] overflow-hidden border border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200 transition-colors duration-200 group flex flex-col h-full"
              >
                <Link to={`/magazine/${article.id}`} className="flex flex-col h-full">
                {/* Accent Top Border */}
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 to-amber-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-30" />
                
                <div className="relative h-56 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-slate-900/10 to-transparent z-10 pointer-events-none" />
                  <LazyImage 
                    src={getArticleImage(article, index + 1)} 
                    alt={article.title}
                    className="w-full h-full"
                    imgClassName="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-4 right-4 z-20">
                     <span className="bg-white/20  text-white border border-white/30 text-[11px] font-bold px-3 py-1.5 rounded-full shadow-sm">
                       {article.categoryLabel}
                     </span>
                  </div>
                </div>
                
                <div className="p-7 flex-1 flex flex-col">
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-4 font-medium">
                    <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-[#003F86]" /> {article.date}</span>
                    <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-amber-500" /> {article.readTime}</span>
                  </div>
                  <h3 className="text-lg font-black text-slate-900 mb-3 leading-[1.6] group-hover:text-[#003F86] transition-colors line-clamp-2">
                    {article.title}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed mb-6 line-clamp-3 flex-1">
                    {article.summary}
                  </p>
                  
                  <div className="mt-auto pt-5 border-t border-slate-200/60 flex items-center text-sm font-bold text-[#003F86]">
                     <span className="group-hover:-translate-x-2 transition-transform flex items-center gap-1.5">
                        مطالعه مقاله <ChevronLeft className="w-4 h-4" />
                     </span>
                  </div>
                </div>
                </Link>
              </div>
            ))}
        </div>

        {/* Lazy Load Trigger */}
        {visibleCount < gridArticles.length && (
          <div ref={loadMoreRef} className="w-full h-20 flex items-center justify-center mt-8">
            <div className="w-8 h-8 border-4 border-amber-400 border-t-transparent rounded-full animate-spin opacity-50" />
          </div>
        )}

      </div>
    </div>
  );
};
