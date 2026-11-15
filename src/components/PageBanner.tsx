import React from 'react';
import { Link } from 'react-router-dom';
import type { IconProps } from '../icons';

import { t } from '../i18n';
interface PageBannerProps {
  title: string;
  subtitle: React.ReactNode;
  /** Part of `title` drawn with the brand gradient. The H1 text itself never changes. */
  highlight?: string;
  /** Small pill above the title (decorative, not a heading). */
  eyebrow?: string;
  eyebrowIcon?: React.ComponentType<IconProps>;
  /** Replaces the pill above the title (e.g. a CTA). */
  topSlot?: React.ReactNode;
  /** Optional buttons under the subtitle (internal route, tel: link or #anchor). */
  cta?: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  /** Compact card header (detail pages). Default is the full section hero. */
  compact?: boolean;
  children?: React.ReactNode;
}

const renderTitle = (title: string, highlight?: string) => {
  const at = highlight ? title.indexOf(highlight) : -1;
  if (!highlight || at < 0) return title;
  return (
    <>
      {title.slice(0, at)}
      <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-amber-500">{highlight}</span>
      {title.slice(at + highlight.length)}
    </>
  );
};

const CTA_BASE =
  'inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full font-bold text-sm px-6 py-3 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500';
const CTA_PRIMARY = `${CTA_BASE} bg-[#003F86] text-white shadow-lg shadow-blue-900/20 hover:bg-[#002d61]`;
const CTA_SECONDARY = `${CTA_BASE} bg-white/95 text-[#003F86] border border-[#003F86]/25 hover:border-amber-500`;

/** Hero button: internal routes use the router; tel: and #anchor links stay plain anchors. */
export const HeroCta: React.FC<{ label: string; href: string; primary?: boolean }> = ({ label, href, primary }) => {
  const className = primary ? CTA_PRIMARY : CTA_SECONDARY;
  if (href.startsWith('/')) return <Link to={href} className={className}>{label}</Link>;
  return <a href={href} className={className}>{label}</a>;
};

const scrollPastHero = (e: React.MouseEvent<HTMLButtonElement>) => {
  const hero = e.currentTarget.closest('.page-hero') as HTMLElement | null;
  const top = hero ? hero.getBoundingClientRect().bottom + window.scrollY - 72 : window.innerHeight - 80;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  window.scrollTo({ top, behavior: reduce ? 'auto' : 'smooth' });
};

/**
 * Section hero for nav routes (services, projects, magazine, about, contact).
 * Restores the pre-fc5fd24 full-height hero look: mesh gradient, pill, big gradient title,
 * scroll cue. CSS only: fixed min-height (no CLS), H1 never animated, cue motion respects
 * prefers-reduced-motion.
 */
export const PageBanner: React.FC<PageBannerProps> = ({
  title,
  subtitle,
  highlight,
  eyebrow,
  eyebrowIcon: EyebrowIcon,
  topSlot,
  cta,
  secondaryCta,
  compact,
  children,
}) => {
  if (compact) {
    return (
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
  }

  return (
    <div className="page-hero relative z-10 w-full min-h-[100svh] flex flex-col justify-center overflow-hidden pt-24 pb-24 px-4 sm:px-6 lg:px-8">
      {/* Mesh gradient (static, painted by CSS — no image request) */}
      <div className="absolute inset-0 -z-10 pointer-events-none" aria-hidden="true">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-[radial-gradient(circle_at_center,_rgba(96,165,250,0.15)_0%,_transparent_60%)]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-[radial-gradient(circle_at_center,_rgba(251,191,36,0.15)_0%,_transparent_60%)]" />
        <div className="absolute top-[30%] left-[30%] w-[40vw] h-[40vw] bg-[radial-gradient(circle_at_center,_rgba(52,211,153,0.12)_0%,_transparent_60%)]" />
      </div>

      <div className="max-w-4xl mx-auto w-full text-center">
        {topSlot ?? (eyebrow && (
          <div className="page-hero-pill inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/95 border border-white/50 shadow-sm mb-6">
            {EyebrowIcon && <EyebrowIcon className="w-5 h-5 text-amber-500" aria-hidden="true" />}
            <span className="text-sm font-bold text-slate-800">{eyebrow}</span>
          </div>
        ))}
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-tight mb-6">
          {renderTitle(title, highlight)}
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto font-medium leading-relaxed">{subtitle}</p>
        {(cta || secondaryCta) && (
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            {cta && <HeroCta {...cta} primary />}
            {secondaryCta && <HeroCta {...secondaryCta} />}
          </div>
        )}
        {children}
      </div>

      <button
        type="button"
        onClick={scrollPastHero}
        aria-label={t("رفتن به بخش بعد")}
        className="page-hero-cue absolute bottom-6 sm:bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 cursor-pointer group"
      >
        <span className="w-[2px] h-10 sm:h-12 bg-slate-200/60 relative overflow-hidden rounded-full group-hover:bg-amber-100 transition-colors">
          <span className="page-hero-cue-bar w-full h-1/2 bg-[#003F86] group-hover:bg-amber-500 absolute top-0 left-0 rounded-full" />
        </span>
      </button>
    </div>
  );
};
