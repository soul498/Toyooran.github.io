import React from 'react';

interface PageBannerProps {
  title: string;
  subtitle: string;
  children?: React.ReactNode;
}

/** Compact page header for nav routes (not a full-viewport hero). */
export const PageBanner: React.FC<PageBannerProps> = ({ title, subtitle, children }) => (
  <div className="relative z-10 pt-28 pb-6 px-4 sm:px-6 lg:px-8">
    <div className="max-w-[1400px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 rounded-3xl border border-slate-200 bg-white/95 shadow-sm px-5 py-4 sm:px-7 sm:py-5">
        <div className="text-right min-w-0">
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">{title}</h1>
          <p className="text-sm text-slate-600 font-medium mt-1 leading-relaxed">{subtitle}</p>
        </div>
        {children}
      </div>
    </div>
  </div>
);
