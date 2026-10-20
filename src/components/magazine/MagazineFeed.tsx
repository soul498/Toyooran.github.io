import React from 'react';
import { Clock, Calendar, ChevronLeft, Sparkles } from '../../icons';
import { Link } from 'react-router-dom';
import { PageBanner } from '../PageBanner';
import { LazyImage } from '../LazyImage';
import type { Article } from '../../types';

interface MagazineFeedProps {
  articles: Article[];
  onSelectArticle: (article: Article) => void;
}

export const MagazineFeed: React.FC<MagazineFeedProps> = ({ articles }) => {
  return (
    <div className="min-h-screen relative z-0" id="magazine-feed">
      <PageBanner
        title="مجله تخصصی دام و طیور"
        highlight="دام و طیور"
        eyebrow="مجله تخصصی طیوران صنعت پویا"
        eyebrowIcon={Sparkles}
        subtitle="راهنماهای تجهیز، تهویه، گرمایش و نوسازی سالن مرغداری"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 lg:pb-24 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles.map((article) => (
            <div
              key={article.id}
              className="relative bg-white rounded-[2rem] overflow-hidden border border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200 transition-colors duration-200 group flex flex-col h-full"
            >
              <Link to={`/magazine/${article.id}`} className="flex flex-col h-full">
                <div className="relative h-56 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-slate-900/10 to-transparent z-10 pointer-events-none" />
                  {article.image ? (
                  <LazyImage
                    src={article.image}
                    alt={article.imageAlt || article.title}
                    className="w-full h-full"
                    imgClassName="w-full h-full object-cover"
                  />
                  ) : <div className="w-full h-full bg-slate-200" />}
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
      </div>
    </div>
  );
};
