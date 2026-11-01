import React from 'react';
import { useLocation } from 'react-router-dom';
import { EN_PREFIX, getLang, keepFa } from '../i18n';

/**
 * FA ⇄ EN switch. A full-page link (each language boots its own bundle/dictionary).
 * The router runs with basename "/en" on English pages, so useLocation() is always the
 * language-neutral path. Pages without an English version are redirected by the server
 * (e.g. an untranslated article → /en/magazine), so the link never lands on a 404.
 */
export const LangToggle: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { pathname, search } = useLocation();
  const en = getLang() === 'en';
  const neutral = pathname || '/';
  const href = en ? `${neutral}${search}` : `${neutral === '/' ? EN_PREFIX : `${EN_PREFIX}${neutral}`}${search}`;
  return (
    <a
      href={href}
      hrefLang={en ? 'fa' : 'en'}
      lang={en ? 'fa' : 'en'}
      aria-label={en ? keepFa('نسخهٔ فارسی') : 'English version'}
      title={en ? keepFa('فارسی') : 'English'}
      className={`flex items-center justify-center min-w-11 min-h-11 h-11 px-3 bg-white/50 hover:bg-white border border-slate-200/50 hover:border-blue-200 transition-all duration-300 rounded-full text-[13px] font-black text-slate-600 hover:text-[#003F86] shadow-sm hover:shadow-md ${className}`}
    >
      {en ? keepFa('فا') : 'EN'}
    </a>
  );
};
