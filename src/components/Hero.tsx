import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LazyImage } from "./LazyImage";
import { LazyHeroImage } from './LazyHeroImage';
import {
  ChevronLeft,
  ShieldCheck,
  PhoneCall,
  Package,
  Award,
  ArrowLeft
} from '../icons';
import { PageSection, ProductCategory } from '../types';
import { isLiteDevice } from '../lib/device';
import { LANDING_SERVICE_CARDS } from '../data/landingServiceCards';
import { isDisabledPagePath } from '../data/disabledPages';

import { t, tr, translateDeep } from '../i18n';
interface HeroProps {
  cmsHero?: import('../types').HeroCms;
  onNavigate: (section: PageSection) => void;
  onSelectCategory: (cat: ProductCategory) => void;
  onOpenConsultation: () => void;
  onOpenQuote: () => void;
  onOpenAiAssistant?: () => void;
  /** Rendered at the top of the drawer sheet, above the «خدمات» section (home product bands). */
  beforeServices?: React.ReactNode;
  /** CMS visibility switch: preserves the rest of the home page when the hero is hidden. */
  showHero?: boolean;
  children?: React.ReactNode;
}

export interface CircleCategoryCard {
  id: ProductCategory;
  to: string;
  title: string;
  categoryEn: string;
  icon: React.ElementType;
  desc: string;
  badge: string;
  accentColor: string;
  badgeBg: string;
  badgeText: string;
  specs: string[];
  bgImage?: string;
}



export const ServiceCard: React.FC<{ card: any, idx: number, onClick: () => void }> = ({ card, onClick }) => {
  const Icon = card.icon;
  // While the page behind a card is switched off (data/disabledPages.ts) the card is a display-only tile:
  // same look, but a plain <div> with no click, focus or pointer cursor. It keeps the decorative CSS hover
  // (lift, photo zoom, icon glow; see .service-card-shell in index.css).
  const interactive = !isDisabledPagePath(card.to);
  const Tag = (interactive ? 'button' : 'div') as 'button';
  const tagProps = interactive
    ? { type: 'button' as const, onClick, 'aria-label': card.title }
    : {};
  return (
    <div className="service-card-shell relative">
    <Tag
      {...tagProps}
      className={`service-card relative w-full h-[280px] sm:h-[320px] rounded-[2rem] overflow-hidden bg-[#001c3d] border border-blue-800/60 ${interactive ? 'cursor-pointer' : 'service-card--static cursor-default'}`}
    >
      <div className="absolute inset-[2px] rounded-[calc(2rem-2px)] bg-[#001c3d] z-10 overflow-hidden flex flex-col items-center justify-center p-6">
        {card.bgImage && (
          <div className="absolute inset-0 z-0 pointer-events-none">
            <LazyImage
              src={card.bgImage}
              alt=""
              className="w-full h-full bg-transparent"
              imgClassName="service-card-photo w-full h-full object-cover opacity-50"
              width={800}
              height={800}
            />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-[#001c3d]/40 via-[#001c3d]/70 to-[#001c3d]/95 z-0 pointer-events-none" />
        <div className="service-card-wash absolute inset-0 z-[1] pointer-events-none" />
        <div className="relative z-20 flex flex-col items-center justify-center text-center px-2">
          <div className="service-card-icon w-14 h-14 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center mb-5">
            <Icon className="w-7 h-7 text-amber-400" aria-hidden="true" />
          </div>
          <p className="service-card-title text-xl sm:text-2xl font-black tracking-tight text-white leading-snug">
            {card.title}
          </p>
          <span className="service-card-rule mt-4 h-[2px] w-12 bg-amber-400 rounded-full" aria-hidden="true" />
        </div>
      </div>
    </Tag>
    </div>
  );
};

/** Legacy CMS labels from before the copy update map to the new CTA labels (formal, third person). */
const heroCtaPrimary = (text?: string) =>
  !text || text === 'محصولات و تجهیزات' || text === tr('محصولات و تجهیزات') ? t("درخواست مشاورهٔ رایگان") : text;
const heroCtaSecondary = (text?: string) =>
  !text || ['تماس با ما', 'ارتباط با مهندسین'].some((legacy) => text === legacy || text === tr(legacy)) ? t("مشاهدهٔ محصولات") : text;

const Hero: React.FC<HeroProps> = ({
  cmsHero,
  onNavigate,
  onSelectCategory,
  onOpenConsultation,
  onOpenQuote,
  onOpenAiAssistant,
  beforeServices,
  showHero = true,
  children,
}) => {
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const cardsSectionRef = useRef<HTMLDivElement>(null);

  // Default beautiful images for poultry & feed mill
  const defaultImages = [
    '/images/hero-final-1.jpg',
    '/images/hero-final-2.jpg',
    '/images/hero-final-3.jpg',
  ];

  const validCmsImages = cmsHero?.backgroundImages?.filter(img => img && img.trim() !== '') || [];
  
  const isDefaultBg = cmsHero?.backgroundImage === "/images/hero-1.jpg" || !cmsHero?.backgroundImage;
  const heroImages = validCmsImages.length > 0 
    ? validCmsImages 
    : (isDefaultBg ? defaultImages : [cmsHero.backgroundImage]);

  useEffect(() => {
    if (heroImages.length <= 1 || isLiteDevice()) return;
    
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [heroImages.length]);

  const scrollToCards = () => {
    if (cardsSectionRef.current) {
      cardsSectionRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const categoryCards = translateDeep(LANDING_SERVICE_CARDS);

  return (
    <div className="w-full relative min-h-screen bg-slate-950">
      <style>{`
        .hero-pill {
          animation: heroPillGlow 2.8s ease-in-out infinite;
          backdrop-filter: blur(8px);
        }
        @keyframes heroPillGlow {
          0%, 100% { box-shadow: 0 0 14px rgba(251,191,36,0.35), 0 0 40px rgba(251,191,36,0.12); }
          50% { box-shadow: 0 0 28px rgba(251,191,36,0.7), 0 0 72px rgba(251,191,36,0.28); }
        }
        .hero-fade { animation: heroFadeUp 0.7s ease-out both; }
        @keyframes heroFadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      
      {/* ========================================================================= */}
      {/* 1. 100% FIXED HERO (Redesigned: Clean, Minimalist, Image-Focused) */}
      {/* ========================================================================= */}
      {showHero && <section
        id="hero-fixed-pinned-section"
        className="fixed top-0 left-0 right-0 w-full h-[100dvh] flex flex-col items-center justify-center overflow-hidden bg-slate-950 z-0 pointer-events-auto"
      >
        
        {/* Full-bleed Background Image with Elegant Vignette */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 bg-slate-950">
          <LazyHeroImage
            key={heroImages[currentImageIndex] || heroImages[0]}
            src={heroImages[currentImageIndex] || heroImages[0]}
            alt={t("شرکت طیوران صنعت پویا")}
            isActive
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#003F86]/25 via-[#003F86]/35 to-slate-950/75 z-10" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#003F86]/30 via-transparent to-[#003F86]/30 z-10" />
          <div className="absolute inset-0 z-10 bg-[radial-gradient(ellipse_at_center,_rgba(0,63,134,0.42)_0%,_rgba(0,63,134,0.18)_48%,_transparent_74%)]" />
        </div>

        {/* Minimalist Centered Content */}
        <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 sm:px-6 max-w-5xl mx-auto w-full mt-[-8vh] sm:mt-[-5vh] hero-fade">
          <div className="relative w-full max-w-4xl px-4 py-6 sm:px-8 sm:py-8">
            <div className="absolute inset-0 rounded-[2rem] bg-[#003F86]/45 backdrop-blur-[2px] pointer-events-none" aria-hidden="true" />
            <div className="relative">
          <div className="hero-pill inline-flex items-center gap-2.5 px-5 py-2 rounded-full mb-7 border border-amber-300/50 bg-amber-400/15 font-black">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-300 shadow-[0_0_10px_rgba(251,191,36,0.9)] animate-pulse" />
            <span className="text-sm sm:text-base text-white tracking-wide drop-shadow-[0_0_12px_rgba(251,191,36,0.55)]">
              {cmsHero?.pillText || t("نیم قرن تجربه · بیش از ۲۰۰ پروژهٔ ملی و بین‌المللی")}
            </span>
          </div>

          <h1
            className="text-4xl sm:text-5xl lg:text-7xl font-black text-white leading-[1.15] tracking-tight drop-shadow-2xl mb-6"
          >
            {cmsHero?.title || t("طیوران صنعت پویا")}
          </h1>

          <p className="text-sm sm:text-base lg:text-xl text-slate-100 leading-relaxed max-w-2xl font-light drop-shadow-lg mb-10 mx-auto">
            {cmsHero?.subtitle}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
            <Link
              to="/contact"
              className="w-full sm:w-auto bg-gradient-to-r from-amber-400 to-[#FF9F14] hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold px-8 py-3.5 rounded-full text-sm sm:text-base flex items-center justify-center gap-2 shadow-xl hover:shadow-amber-500/20 hover:-translate-y-1 transition-all"
            >
              <PhoneCall className="w-4 h-4" aria-hidden="true" />
              <span>{heroCtaPrimary(cmsHero?.ctaPrimaryText)}</span>
            </Link>

            <Link
              to="/products"
              className="w-full sm:w-auto bg-slate-950 hover:bg-slate-900 text-white font-bold px-8 py-3.5 rounded-full text-sm sm:text-base flex items-center justify-center gap-2 border-[1.5px] border-white/40  transform-gpu will-change-transform shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all"
            >
              <Package className="w-4 h-4 text-amber-400" aria-hidden="true" />
              <span>{heroCtaSecondary(cmsHero?.ctaSecondaryText)}</span>
            </Link>
          </div>
            </div>
          </div>
        </div>

        <button
          type="button"
          className="absolute bottom-6 sm:bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 cursor-pointer z-10 bg-transparent border-0 min-w-6 min-h-11"
          onClick={scrollToCards}
          aria-label={t("رفتن به بخش بعد")}
        >
          <ChevronLeft className="w-5 h-5 text-amber-400 -rotate-90 animate-bounce" aria-hidden="true" />
        </button>

      </section>}

      {/* ========================================================================= */}
      {/* 2. INVISIBLE SCROLL SPACER (Fits exact viewport height) */}
      {/* ========================================================================= */}
      {showHero && <div className="w-full h-[100dvh] pointer-events-none" />}

      {/* ========================================================================= */}
      {/* 3. SLIDING DRAWER / COVER SHEET */}
      {/* ========================================================================= */}
      <div 
        ref={cardsSectionRef}
        id="categories-drawer-sheet"
        className="relative z-20 w-full bg-[#F8FAFC] shadow-2xl rounded-t-lg sm:rounded-t-lg border-t border-slate-200/90 pt-6 sm:pt-8 pb-12 lg:pb-16"
      >
        
        {/* Subtle Top Pull Handle Bar */}
        <div className="w-14 h-1.5 bg-slate-300 hover:bg-amber-400 rounded-full mx-auto mb-4 transition-colors" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">

          {beforeServices && <div className="mb-8 lg:mb-12">{beforeServices}</div>}

          {/* Section Title Header */}
          <div className="w-full mb-8 lg:mb-12 text-center sm:text-right border-b border-slate-200/80 pb-4">
            <span className="text-[11px] font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-200/60 inline-block mb-1.5">
              
              {t("دسته‌بندی تخصصی طیوران صنعت پویا")}
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-[#003F86]">
              
              {t("خدمات")}
            </h2>
          </div>

          {/* 🎨 Dribbble-Worthy High-Fidelity Magic Cards */}
              <div className="relative z-10 w-full">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6 w-full">
                  
                  {categoryCards.map((card, idx) => (
                    <ServiceCard
                      key={idx}
                      idx={idx}
                      card={card}
                      onClick={() => navigate(card.to)}
                    />
                  ))}
                </div>

                {/* Ultra-Wide Premium Brand Banner */}
                <button
                  type="button"
                  className="mt-8 lg:mt-12 relative group w-full rounded-[2.5rem] overflow-hidden bg-gradient-to-r from-[#001c3d] via-[#002d61] to-[#003F86] border border-blue-800 p-8 sm:p-10 cursor-pointer shadow-xl hover:shadow-2xl transition-all duration-500 text-right"
                  onClick={onOpenConsultation}
                  aria-label={t("ثبت درخواست مشاوره")}
                >
                    {/* Animated geometric background */}
                    <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[radial-gradient(circle_at_center,_rgba(245,158,11,0.08)_0%,_transparent_70%)] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[radial-gradient(circle_at_center,_rgba(96,165,250,0.08)_0%,_transparent_70%)] translate-y-1/2 -translate-x-1/2 pointer-events-none" />

                    <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
                       <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-right gap-6">
                          {/* Glowing Award Badge */}
                          <div className="relative w-20 h-20 shrink-0 rounded-2xl bg-white/10 border-[1.5px] border-white/40 flex items-center justify-center">
                             <Award className="w-10 h-10 text-amber-400 drop-shadow-md" />
                             <div className="absolute -top-2 -right-2 w-4 h-4 bg-amber-300 rounded-full  " />
                             <div className="absolute -top-2 -right-2 w-2 h-2 bg-white rounded-full" />
                          </div>
                          
                          <div>
                             <span className="text-[10px] sm:text-[11px] font-bold text-amber-300 tracking-widest uppercase mb-1.5 block drop-shadow-md">{t("مهندسی و اجرا")}</span>
                             <p className="text-2xl sm:text-3xl lg:text-4xl font-black text-white drop-shadow-lg mb-2">{t("شرکت طیوران صنعت پویا")}</p>
                             <p className="text-sm sm:text-base text-blue-100 max-w-xl leading-relaxed font-medium">{t("از طراحی و ساخت تا تجهیز و بهره‌برداری؛ راهکاری یکپارچه برای پروژه‌های صنعت دام، طیور و آبزیان")}</p>
                          </div>
                       </div>

                       <div className="w-full lg:w-auto shrink-0 mt-4 lg:mt-0">
                         <span className="w-full lg:w-auto bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black px-8 py-4 rounded-2xl inline-flex items-center justify-center gap-3 shadow-[0_10px_30px_rgba(251,191,36,0.3)]">
                            <span className="text-sm">{t("ثبت درخواست مشاوره")}</span>
                            <span className="w-8 h-8 rounded-full bg-slate-950/10 flex items-center justify-center group-hover:translate-x-[-4px] transition-transform">
                               <ArrowLeft className="w-4 h-4" />
                            </span>
                         </span>
                       </div>
                    </div>
                </button>
              </div>

          {/* Bottom Quick Feature Strip */}
          <div className="relative z-10 w-full mt-8 lg:mt-12">
            <div className="bg-white/90  border border-slate-200/90 rounded-3xl p-3 sm:px-5 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600 shadow-2xs">
              
              <div className="flex items-center gap-4">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  
                  {t("مشاوره رایگان")}
                </span>
                <span className="hidden sm:inline text-slate-300">|</span>
                <span className="hidden sm:inline text-slate-500">
                  
                  {t("ارائه خدمات نصب و پشتیبانی فنی، متناسب با نوع پروژه و محصول")}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => onNavigate('contact')}
                  className="text-[#003F86] hover:text-amber-500 font-bold flex items-center gap-1 transition-colors cursor-pointer min-h-11"
                >
                  <span>{t("تماس")}</span>
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          </div>

          {/* Seamless Content Continuation (About & Contact Unified Section) */}
          {children && (
            <div className="relative z-10 w-full mt-8 lg:mt-12 space-y-8 lg:space-y-12">
              {children}
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
export { Hero };
