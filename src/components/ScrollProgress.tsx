import React, { useState, useEffect } from 'react';
import { ArrowUp } from '../icons';
import { isLiteDevice } from '../lib/device';

import { t } from '../i18n';
function ScrollProgressUi() {
  const [percentage, setPercentage] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement;
      const max = el.scrollHeight - el.clientHeight;
      setPercentage(max > 0 ? Math.round((el.scrollTop / max) * 100) : 0);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (percentage <= 1) return null;

  return (
    <button
      type="button"
      className="fixed bottom-6 left-6 sm:bottom-10 sm:left-10 z-[99999] w-12 h-12 rounded-full bg-slate-900 text-amber-400 border border-white/10 shadow-lg flex items-center justify-center"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label={t("بازگشت به بالا")}
    >
      <ArrowUp className="w-5 h-5" />
    </button>
  );
}

export const ScrollProgress: React.FC = () => {
  if (isLiteDevice()) return null;
  return <ScrollProgressUi />;
};
