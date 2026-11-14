import React from 'react';
import { CATEGORIES_DATA } from '../data/mockData';
import { ProductCategory } from '../types';
import {
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
import { isEn, t, tr } from '../i18n';
const ICONS: Record<string, React.ElementType> = {
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

interface CategoryMarqueeProps {
  selectedCategory: ProductCategory | 'all';
  onSelectCategory: (cat: ProductCategory | 'all') => void;
}

/** English tile label: "Poultry heating systems" → "Heating systems" (the Persian tile drops « مرغداری» the same way). */
function shortEn(title: string): string {
  const en = tr(title).replace(/^Poultry\s+/i, '');
  return en.charAt(0).toUpperCase() + en.slice(1);
}

export const CategoryMarquee: React.FC<CategoryMarqueeProps> = ({ selectedCategory, onSelectCategory }) => {
  const allItem = { id: 'all', title: t("همه محصولات"), icon: 'LayoutGrid' };
  const items = [allItem, ...CATEGORIES_DATA];

  return (
    <div className="w-full mb-8" role="tablist" aria-label={t("دسته‌بندی محصولات")}>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {items.map((cat) => {
          const IconComponent = ICONS[cat.icon] || Box;
          const isSelected = selectedCategory === cat.id;
          const label = isEn() ? shortEn(cat.title) : cat.title.replace(/ مرغداری$/, '');
          return (
            <button
              key={cat.id}
              type="button"
              role="tab"
              aria-selected={isSelected}
              onClick={() => onSelectCategory(cat.id as ProductCategory | 'all')}
              className={`flex items-center gap-3 min-h-[4.5rem] rounded-2xl border px-3 py-3 text-start transition-colors ${
                isSelected
                  ? 'bg-[#003F86] border-[#003F86] text-white shadow-lg shadow-blue-900/20'
                  : 'bg-white border-slate-200 text-slate-800 hover:border-[#003F86]/30'
              }`}
            >
              <span className={`w-11 h-11 shrink-0 rounded-xl flex items-center justify-center ${
                isSelected ? 'bg-white/10 text-amber-300' : 'bg-slate-50 text-[#003F86] border border-slate-100'
              }`}>
                <IconComponent className="w-5 h-5" aria-hidden="true" />
              </span>
              <span className="min-w-0 text-sm font-black leading-snug">{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
