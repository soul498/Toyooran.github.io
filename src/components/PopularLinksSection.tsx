import React from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { homePriorityProducts } from '../seo/internalLinks';
import { publicProductPath, HOME_LINKS_CATEGORIES_HEADING, HOME_LINKS_PRODUCTS_HEADING } from '../seo/resolveSeo';

/** Compact crawlable links: all equipment categories + priority products (mirrors the homepage prerender). */
export const PopularLinksSection: React.FC = () => {
  const { categories, products } = useData();
  const popular = homePriorityProducts(products);
  if (!categories.length && !popular.length) return null;
  return (
    <section aria-labelledby="home-popular-links" className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 mb-16 sm:mb-24">
      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-6 sm:p-8 grid gap-8 lg:grid-cols-2">
        <div>
          <h2 id="home-popular-links" className="text-lg sm:text-xl font-black text-slate-900 mb-4">{HOME_LINKS_CATEGORIES_HEADING}</h2>
          <ul className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <li key={c.id}>
                <Link to={`/products/${c.id}`} className="inline-block bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-[#003F86]/30 text-slate-700 hover:text-[#003F86] text-sm font-bold px-3.5 py-2 rounded-xl transition-colors">
                  {c.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="text-lg sm:text-xl font-black text-slate-900 mb-4">{HOME_LINKS_PRODUCTS_HEADING}</h2>
          <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-2">
            {popular.map((p) => (
              <li key={p.id} className="text-sm leading-7">
                <Link to={publicProductPath(p)} className="text-[#003F86] hover:underline font-bold">
                  {p.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};
