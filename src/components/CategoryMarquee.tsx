import React, { useRef, useState, useEffect } from 'react';
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
  Cpu,
} from '../icons';
import { isLiteDevice } from '../lib/device';

import { isLtr, t, tr } from '../i18n';
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
  Cpu,
};

interface CategoryMarqueeProps {
  selectedCategory: ProductCategory | 'all';
  onSelectCategory: (cat: ProductCategory | 'all') => void;
}

/** Foreign tile label: drop a leading "Poultry" / "Kanatlı" the way the Persian tile drops « مرغداری». */
function shortForeign(title: string): string {
  const text = tr(title).replace(/^(?:Poultry|Kanatlı)\s+/i, '');
  return text.charAt(0).toLocaleUpperCase('tr') + text.slice(1);
}

export const CategoryMarquee: React.FC<CategoryMarqueeProps> = ({ selectedCategory, onSelectCategory }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);
  const lite = isLiteDevice();

  const allItem = { id: 'all', title: t("همه محصولات"), icon: 'LayoutGrid', productCount: 101 };
  const items = [allItem, ...CATEGORIES_DATA];
  const repeatedItems = lite ? [...items, ...items] : [...items, ...items, ...items, ...items];

  useEffect(() => {
    if (lite) return;
    let animationFrameId: number;
    let lastTime = performance.now();

    const scroll = (time: number) => {
      const container = containerRef.current;
      if (container && !isPaused && !isDragging.current) {
        const deltaTime = time - lastTime;
        lastTime = time;
        container.scrollBy({ left: -0.04 * deltaTime });
        const setWidth = container.scrollWidth / 4;
        if (Math.abs(container.scrollLeft) >= setWidth * 2) {
          container.scrollLeft += setWidth;
        }
      } else {
        lastTime = time;
      }
      animationFrameId = requestAnimationFrame(scroll);
    };

    animationFrameId = requestAnimationFrame(scroll);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isPaused, lite]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || selectedCategory == null) return;
    const target = container.querySelector(`[data-cat="${selectedCategory}"][data-copy="0"]`) as HTMLElement | null;
    if (!target) return;
    setIsPaused(true);
    // Center the chip horizontally inside the marquee only; scrollIntoView would also scroll the
    // page vertically when the marquee sits below the fold (it now follows a full-height hero).
    const c = container.getBoundingClientRect();
    const t = target.getBoundingClientRect();
    container.scrollBy({ left: t.left + t.width / 2 - (c.left + c.width / 2), behavior: 'smooth' });
  }, [selectedCategory]);

  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    setIsPaused(true);
    if (!containerRef.current) return;
    startX.current = e.pageX - containerRef.current.offsetLeft;
    scrollLeft.current = containerRef.current.scrollLeft;
  };

  const handleMouseLeave = () => {
    isDragging.current = false;
    setIsPaused(false);
  };

  const handleMouseUp = () => {
    isDragging.current = false;
    setIsPaused(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !containerRef.current) return;
    e.preventDefault();
    const x = e.pageX - containerRef.current.offsetLeft;
    const walk = (x - startX.current) * 2;
    containerRef.current.scrollLeft = scrollLeft.current - walk;
  };

  return (
    <div className="w-full relative mb-6 group/marquee">
      <div className="absolute inset-y-0 left-0 w-8 sm:w-16 lg:w-24 bg-gradient-to-r from-slate-50 via-slate-50/90 to-transparent z-20 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-8 sm:w-16 lg:w-24 bg-gradient-to-l from-slate-50 via-slate-50/90 to-transparent z-20 pointer-events-none" />

      <div
        ref={containerRef}
        className="flex overflow-x-auto hide-scroll-bar gap-3 sm:gap-5 px-4 cursor-grab active:cursor-grabbing select-none touch-pan-x py-6 sm:py-12"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={handleMouseLeave}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >
        {repeatedItems.map((cat, idx) => {
          const IconComponent = ICONS[cat.icon] || Box;
          const isSelected = selectedCategory === cat.id;

          return (
            <div
              key={`${cat.id}-${idx}`}
              data-cat={cat.id}
              data-copy={idx < items.length ? '0' : '1'}
              onClick={() => onSelectCategory(cat.id as ProductCategory | 'all')}
              className={`group relative flex-shrink-0 w-[150px] sm:w-[200px] md:w-[220px] aspect-square p-4 sm:p-6 rounded-[2rem] border transition-colors duration-300 flex flex-col items-center justify-center gap-3 sm:gap-5 overflow-hidden ${
                isSelected
                  ? 'bg-gradient-to-br from-[#003F86] via-[#002a5c] to-slate-900 border-[#003F86]/50 shadow-[0_10px_30px_rgba(0,63,134,0.4)] z-10'
                  : 'bg-white border-slate-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)]'
              }`}
            >
              <div className={`relative z-20 w-12 h-12 sm:w-16 sm:h-16 rounded-[1rem] sm:rounded-2xl flex items-center justify-center shadow-sm ${
                isSelected
                  ? 'bg-white/10 text-amber-400 border border-white/10'
                  : 'bg-slate-50 text-slate-500 border border-slate-100'
              }`}>
                <IconComponent className="w-6 h-6 sm:w-8 sm:h-8" />
              </div>

              <div className="relative z-20 flex flex-col items-center justify-center gap-1.5 w-full pb-2">
                <h3 className={`text-lg sm:text-2xl font-black text-center ${isSelected ? 'text-white' : 'text-slate-800'}`}>
                  {isLtr() ? shortForeign(cat.title) : cat.title.replace(/ مرغداری$/, '')}
                </h3>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
