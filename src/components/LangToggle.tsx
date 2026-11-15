import React from 'react';
import { useLocation } from 'react-router-dom';
import { EN_PREFIX, TR_PREFIX, getLang, keepFa } from '../i18n';

/**
 * FA / EN / TR switch. A full-page link (each language boots its own dictionary).
 * The router runs with basename "/en" or "/tr" on those pages, so useLocation() is always the
 * language-neutral path. Pages without a translation are redirected by the server
 * (e.g. an untranslated article → /en/magazine or /tr/magazine).
 */
const OPTIONS = [
  { id: 'fa' as const, label: keepFa('فا'), hrefLang: 'fa', title: keepFa('فارسی'), prefix: '' },
  { id: 'en' as const, label: 'EN', hrefLang: 'en', title: 'English', prefix: EN_PREFIX },
  { id: 'tr' as const, label: 'TR', hrefLang: 'tr', title: 'Türkçe', prefix: TR_PREFIX },
];

export const LangToggle: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { pathname, search } = useLocation();
  const lang = getLang();
  const neutral = pathname || '/';
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {OPTIONS.map((item) => {
        const active = lang === item.id;
        const href = item.prefix
          ? `${neutral === '/' ? item.prefix : `${item.prefix}${neutral}`}${search}`
          : `${neutral}${search}`;
        const cls = `flex items-center justify-center min-w-11 min-h-11 h-11 px-3 border transition-all duration-300 rounded-full text-[13px] font-black shadow-sm ${active ? 'bg-[#003F86] text-white border-[#003F86]' : 'bg-white/50 hover:bg-white border-slate-200/50 hover:border-blue-200 text-slate-600 hover:text-[#003F86] hover:shadow-md'}`;
        const style = item.id === 'fa' ? { fontFamily: '"Estedad", sans-serif' } : undefined;
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
