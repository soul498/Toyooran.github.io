import React from 'react';
import { Link, useParams } from 'react-router-dom';
import type { Article } from '../../types';
import { findTopic, localTopics, topicPath } from '../../seo/topics';
import { LazyImage } from '../LazyImage';
import { isSafeImageSrc } from '../../seo/safeUrl';

import { t } from '../../i18n';
export const MagazineTopic: React.FC<{ articles: Article[]; notFound: React.ReactNode }> = ({ articles, notFound }) => {
  const { topicSlug } = useParams();
  const topic = findTopic(topicSlug);
  if (!topic) return <>{notFound}</>;
  const list = articles.filter((a) => a.topic === topic.slug && !a.noindex);
  return (
    <div className="min-h-screen bg-[#F8FAFC] pt-32 pb-24">
      <div className="max-w-[1100px] mx-auto px-4 sm:px-6">
        <nav className="text-sm text-slate-500 mb-4" aria-label={t("مسیر")}>
          <Link to="/" className="hover:text-[#003F86]">{t("خانه")}</Link> / <Link to="/magazine" className="hover:text-[#003F86]">{t("مجله")}</Link> / <span className="text-slate-700">{topic.label}</span>
        </nav>
        <h1 className="text-[1.6rem] md:text-[2.1rem] font-black text-slate-900 leading-[1.6] mb-3">{topic.h1}</h1>
        <p className="text-[17px] leading-[1.9] text-slate-700 max-w-3xl mb-8">{topic.intro}</p>
        {list.length ? (
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((a) => (
              <li key={a.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col">
                {a.image && isSafeImageSrc(a.image) ? <LazyImage src={a.image} alt={a.imageAlt || a.title} className="w-full aspect-video" imgClassName="w-full h-full object-cover" /> : null}
                <div className="p-5 flex flex-col gap-2 flex-1">
                  <h2 className="text-lg font-black leading-[1.7] text-slate-900"><Link to={`/magazine/${a.id}`} className="hover:text-[#003F86]">{a.title}</Link></h2>
                  <p className="text-[15px] leading-[1.8] text-slate-600">{a.summary}</p>
                </div>
              </li>
            ))}
          </ul>
        ) : <p className="text-slate-500">{t("هنوز مقاله‌ای در این موضوع منتشر نشده است.")}</p>}
        <div className="mt-12 flex flex-wrap gap-2 items-center">
          <span className="text-sm font-bold text-slate-600">{t("موضوعات دیگر:")}</span>
          {localTopics().filter((t) => t.slug !== topic.slug).map((t) => (
            <Link key={t.slug} to={topicPath(t)} className="bg-amber-400 hover:bg-amber-500 text-blue-950 text-xs font-black px-3.5 py-1.5 rounded-full">{t.label}</Link>
          ))}
          <Link to="/magazine" className="text-sm font-bold text-[#003F86] ms-2">{t("همهٔ مقالات مجله")}</Link>
        </div>
      </div>
    </div>
  );
};
