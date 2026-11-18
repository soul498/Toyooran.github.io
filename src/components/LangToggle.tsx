import React from 'react';
import { useLocation } from 'react-router-dom';
import { AR_PREFIX, EN_PREFIX, RU_PREFIX, TR_PREFIX, getLang, keepFa } from '../i18n';

/**
 * FA / EN / TR / RU / AR switch. A full-page link (each language boots its own dictionary).
 * The router runs with basename "/en", "/tr", "/ru" or "/ar" on those pages, so useLocation() is always the
 * language-neutral path. Pages without a translation are redirected by the server
 * (e.g. an untranslated article → /en/magazine, /tr/magazine, /ru/magazine or /ar/magazine).
 */
const OPTIONS = [
  { id: 'fa' as const, label: keepFa('فا'), hrefLang: 'fa', title: keepFa('فارسی'), prefix: '' },
  { id: 'en' as const, label: 'EN', hrefLang: 'en', title: 'English', prefix: EN_PREFIX },
  { id: 'tr' as const, label: 'TR', hrefLang: 'tr', title: 'Türkçe', prefix: TR_PREFIX },
  { id: 'ru' as const, label: 'RU', hrefLang: 'ru', title: 'Русский', prefix: RU_PREFIX },
  { id: 'ar' as const, label: 'ع', hrefLang: 'ar', title: 'العربية', prefix: AR_PREFIX },
];

export const LangToggle: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { pathname, search } = useLocation();
  const lang = getLang();
  const neutral = pathname || '/';
  return (
    <div className={`flex items-center gap-0.5 lg:gap-1 ${className}`}>
      {OPTIONS.map((item) => {
        const active = lang === item.id;
        const href = item.prefix
          ? `${neutral === '/' ? item.prefix : `${item.prefix}${neutral}`}${search}`
          : `${neutral}${search}`;
        // Inactive buttons stay transparent so they take the header glass, not a whiter disc.
        // Width stays compact below the desktop bar; four 44px pills push the menu off small phones.
        const cls = `flex items-center justify-center h-11 min-w-8 rounded-full border px-1.5 text-[12px] font-black transition-colors duration-300 lg:min-w-11 lg:px-3 lg:text-[13px] ${active ? 'bg-[#003F86] text-white border-[#003F86]' : 'border-transparent bg-transparent text-slate-600 hover:bg-white/30 hover:text-[#003F86]'}`;
        const style = item.id === 'fa' || item.id === 'ar' ? { fontFamily: '"Estedad", sans-serif' } : undefined;
        if (active) {
          return <span key={item.id} lang={item.hrefLang} aria-current="page" title={item.title} style={style} className={cls}>{item.label}</span>;
        }
        return (
          <a key={item.id} href={href} hrefLang={item.hrefLang} lang={item.hrefLang} aria-label={item.title} title={item.title} style={style} className={cls}>
            {item.label}
          </a>
        );
      })}
    </div>
  );
};
