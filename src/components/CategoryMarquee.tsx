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

/** Static category tiles. The old marquee scrolled itself empty in RTL, so every tile stays on screen. */
export const CategoryMarquee: React.FC<CategoryMarqueeProps> = ({ selectedCategory, onSelectCategory }) => {
  const allItem = { id: 'all', title: t("همه محصولات"), icon: 'LayoutGrid' };
  const items = [allItem, ...CATEGORIES_DATA];

  return (
    <div className="w-full mb-6" role="tablist" aria-label={t("دسته‌بندی محصولات")}>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-5">
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
              className={`group relative aspect-square p-4 sm:p-6 rounded-[2rem] border transition-colors duration-300 flex flex-col items-center justify-center gap-3 sm:gap-5 overflow-hidden ${
                isSelected
                  ? 'bg-gradient-to-br from-[#003F86] via-[#002a5c] to-slate-900 border-[#003F86]/50 shadow-[0_10px_30px_rgba(0,63,134,0.4)]'
                  : 'bg-white border-slate-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:border-[#003F86]/30'
              }`}
            >
              <span className={`relative z-20 w-12 h-12 sm:w-16 sm:h-16 rounded-[1rem] sm:rounded-2xl flex items-center justify-center shadow-sm ${
                isSelected
                  ? 'bg-white/10 text-amber-400 border border-white/10'
                  : 'bg-slate-50 text-slate-500 border border-slate-100'
              }`}>
                <IconComponent className="w-6 h-6 sm:w-8 sm:h-8" aria-hidden="true" />
              </span>
              <span className={`relative z-20 text-base sm:text-xl font-black text-center leading-snug ${isSelected ? 'text-white' : 'text-slate-800'}`}>
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
