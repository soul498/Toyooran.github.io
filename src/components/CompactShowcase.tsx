import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
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
import { CategoryItem } from '../types';
import { HOME_LINKS_CATEGORIES_HEADING } from '../seo/resolveSeo';
import { useData } from '../context/DataContext';

import { isEn, t, tr } from '../i18n';
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
  onNavigate: (path: string) => void;
}

const faNum = (value: number) => value.toLocaleString(isEn() ? 'en-US' : 'fa-IR');

/** Home block under the services cards: product categories only (bestsellers slider + magazine column removed 2026-10-27). */
export const CompactShowcase: React.FC<CompactShowcaseProps> = ({ onNavigate }) => {
  const { categories } = useData();
  if (categories.length === 0) return null;
  return (
    <section className="w-full">
      <CategoryBand categories={categories} onNavigate={onNavigate} />
    </section>
  );
};

const CategoryBand: React.FC<{ categories: CategoryItem[]; onNavigate: (path: string) => void }> = ({ categories, onNavigate }) => (
  <div className="rounded-[2rem] bg-white border border-slate-100 shadow-xl shadow-slate-200/40 p-5 sm:p-7">
    <div className="flex items-end justify-between gap-4 mb-5">
      <div>
        <h2 id="home-popular-links" className="font-black text-xl sm:text-2xl text-slate-900 tracking-tight">
          {tr(HOME_LINKS_CATEGORIES_HEADING)}
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 font-bold mt-1">{t("دسته‌بندی محصولات تجهیزات دام و طیور")}</p>
      </div>
      <Link
        to="/products"
        onClick={() => onNavigate('products')}
        className="shrink-0 min-h-11 inline-flex items-center gap-1.5 text-xs sm:text-sm font-black text-[#003F86] no-underline"
      >
        
        {t("کاتالوگ")}
        <ArrowLeft className="w-4 h-4" />
      </Link>
    </div>
    <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {categories.map((category) => {
        const Icon = CATEGORY_ICONS[category.icon] || LayoutGrid;
        return (
          <li key={category.id}>
            <Link
              to={`/products/${category.id}`}
              className="group flex items-center gap-3 h-full rounded-2xl border border-slate-100 bg-slate-50/80 px-3 py-3 no-underline text-inherit hover:border-[#003F86]/25 hover:bg-white"
            >
              <span className="w-11 h-11 shrink-0 rounded-xl bg-white text-[#003F86] border border-slate-100 flex items-center justify-center group-hover:bg-[#003F86] group-hover:text-white group-hover:border-[#003F86]">
                <Icon className="w-5 h-5" aria-hidden="true" />
              </span>
              <span className="min-w-0">
                <span className="block text-[13px] sm:text-sm font-black text-slate-800 leading-snug">{category.title}</span>
                {category.productCount ? (
                  <span className="block text-[10px] font-bold text-slate-500 mt-0.5">{faNum(category.productCount)} {" "}{t("محصول")}</span>
                ) : null}
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  </div>
);
