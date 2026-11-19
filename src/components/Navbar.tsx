import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Home,
  User,
  Package,
  Wrench,
  BookOpen,
  Compass,
  Menu,
  X,
  Search,
  ChevronLeft
} from '../icons';
import { PageSection } from '../types';

import { getLang, hasPersian, hasPersianOnly, isLtr, t } from '../i18n';
import { LangToggle } from './LangToggle';
interface NavbarProps {
  currentSection: PageSection;
  onNavigate: (section: PageSection) => void;
  onOpenConsultation: () => void;
  onOpenQuote: () => void;
  onOpenSearch: () => void;
  onOpenAiAssistant?: () => void;
  logoUrl?: string;
  brandFa?: string;
  brandEn?: string;
  navLabelsFa?: import('../types').SiteLayoutConfig['header']['navLabelsFa'];
  navLabelsEn?: import('../types').SiteLayoutConfig['header']['navLabelsEn'];
  navLabelsTr?: import('../types').SiteLayoutConfig['header']['navLabelsTr'];
  navLabelsRu?: import('../types').SiteLayoutConfig['header']['navLabelsRu'];
  navLabelsAr?: import('../types').SiteLayoutConfig['header']['navLabelsAr'];
}

export const Navbar: React.FC<NavbarProps> = ({
  currentSection,
  onNavigate,
  onOpenConsultation,
  onOpenQuote,
  onOpenSearch,
  onOpenAiAssistant,
  logoUrl,
  brandFa,
  brandEn,
  navLabelsFa,
  navLabelsEn,
  navLabelsTr,
  navLabelsRu,
  navLabelsAr,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const englishBrand = brandEn && !hasPersian(brandEn) ? brandEn : 'TSPK';
  const displayBrand = isLtr() ? englishBrand : (getLang() === 'ar' ? t("طیوران صنعت پویا") : (brandFa || t("طیوران صنعت پویا")));

  // Prevent scrolling when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  // Nav items ordered right to left: خانه، خدمات، فروشگاه، درباره ما، تماس
  const navItems: { id: PageSection; path: string; label: string; icon: React.ElementType }[] = [
    { id: 'home', path: '/', label: t("خانه"), icon: Home },
    { id: 'services', path: '/services', label: t("خدمات"), icon: Wrench },
    { id: 'products', path: '/products', label: t("فروشگاه"), icon: Package },
    { id: 'about', path: '/about', label: t("درباره ما"), icon: User },
    { id: 'contact', path: '/contact', label: t("تماس"), icon: Compass },
  ];
  const navLabel = (item: typeof navItems[number]) => {
    const lang = getLang();
    const labels = lang === 'en' ? navLabelsEn : lang === 'tr' ? navLabelsTr : lang === 'ru' ? navLabelsRu : lang === 'ar' ? navLabelsAr : navLabelsFa;
    const custom = labels?.[item.id as keyof typeof labels];
    const scriptOk = lang === 'fa' || (lang === 'ar' ? !hasPersianOnly(custom) : !hasPersian(custom));
    return custom?.trim() && scriptOk ? custom : item.label;
  };

  const handleNavClick = (section: PageSection) => {
    onNavigate(section);
    setMobileMenuOpen(false);
  };

  return (
    <>
    <header className="fixed top-0 left-0 z-50 lg:top-4 lg:left-1/2 lg:-translate-x-1/2 bg-white/70 backdrop-blur-xl border-b lg:border border-white/60 lg:rounded-3xl px-4 sm:px-6 lg:px-4 py-3 lg:py-2.5 transition-all duration-300 lg:max-w-7xl lg:mx-auto shadow-[0_8px_32px_rgba(0,0,0,0.04)] w-full lg:w-[calc(100%-2rem)]">
      <div className="flex items-center justify-between w-full">
        
        {/* Left Side: Brand Logo */}
        <Link 
          to="/"
          onClick={() => handleNavClick('home')}
          className="flex items-center gap-2 sm:gap-3 cursor-pointer select-none group relative z-[60] min-w-0"
          id="brand-logo-btn"
        >
          {/* Logo Mark: Full Image */}
          <div className="h-10 sm:h-12 shrink-0 flex items-center justify-center relative group-hover:-translate-y-0.5 transition-transform duration-300">
             <img 
               src={logoUrl || "/images/logo-mark.png"}
               alt={displayBrand}
               width={62}
               height={50}
               className="h-full w-auto object-contain"
             />
          </div>
          <div className="flex flex-col justify-center min-w-0">
            <span className="text-lg sm:text-xl font-black text-[#003F86] tracking-tight group-hover:opacity-90 transition-opacity truncate">
              {englishBrand}
            </span>
            <span className="text-[10px] sm:text-[11px] font-extrabold text-slate-600 tracking-wider -mt-1 truncate">
              
              {displayBrand}
            </span>
          </div>
          
        </Link>

        {/* Center / Right Nav Items (Premium Glass without Icons) */}
        <nav className="hidden lg:flex items-center gap-1.5">
          {navItems.map((item) => {
            const isActive = currentSection === item.id;
            return (
              <Link
                key={item.id}
                to={item.path}
                id={`nav-link-${item.id}`}
                onClick={() => handleNavClick(item.id)}
                className={`relative px-5 py-2.5 text-[13px] font-bold rounded-xl transition-all duration-300 cursor-pointer flex items-center group ${
                  isActive
                    ? 'bg-[#003F86] text-white shadow-lg shadow-blue-900/25'
                    : 'text-slate-600 hover:bg-white/80 hover:text-[#003F86] hover:shadow-md border border-transparent hover:border-white/50'
                }`}
              >
                <span className="relative z-10 tracking-wide">{navLabel(item)}</span>
              </Link>
            );
          })}
        </nav>

        {/* Action Controls */}
        <div className="hidden lg:flex items-center gap-2">
          <LangToggle />
          
          {/* Minimal Search Trigger */}
          <button 
            onClick={onOpenSearch}
            className="flex items-center justify-center min-w-11 min-h-11 w-11 h-11 bg-white/50 hover:bg-white border border-slate-200/50 hover:border-blue-200 transition-all duration-300 rounded-full group cursor-pointer shadow-sm hover:shadow-md"
            aria-label={t("جستجو")}
            type="button"
            title={t("جستجو")}
          >
            <Search className="w-5 h-5 text-slate-500 group-hover:text-[#003F86] transition-colors" />
          </button>
        </div>

        {/* Mobile Menu & Action Buttons */}
        <div className="flex items-center gap-1.5 lg:hidden relative z-[60] shrink-0">
          <button
            onClick={onOpenSearch}
            className="min-w-11 min-h-11 p-2.5 text-slate-500 hover:text-[#003F86] hover:bg-white rounded-full transition-colors bg-white/50 backdrop-blur-md border border-white/60 shadow-sm"
            aria-label={t("جستجو")}
          >
            <Search className="w-5 h-5" />
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            id="mobile-menu-toggle-btn"
            className="min-w-11 min-h-11 p-2.5 rounded-full text-slate-700 hover:bg-white transition-all duration-300 bg-white/50 backdrop-blur-md shadow-sm border border-white/60 hover:scale-105 active:scale-95 flex items-center justify-center relative overflow-hidden"
            aria-label={mobileMenuOpen ? t("بستن منو") : t("باز کردن منو")}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Perfect Fit Minimalist Mobile Menu */}
      {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-[100] bg-slate-50 flex flex-col w-full h-[100dvh] overflow-hidden">
            {/* Top Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-200 bg-white shadow-sm z-10">
              <div className="flex items-center gap-3">
                <div className="h-10 w-auto min-w-[2.5rem] bg-slate-100 rounded-lg flex items-center justify-center px-2 py-1 shadow-inner border border-slate-200/50">
                  <img src={logoUrl || "/images/logo-mark.png"} alt={displayBrand} className="h-10 w-auto object-contain" width={50} height={40} />
                </div>
                <div className="flex flex-col">
                  <span className="text-lg font-black text-[#003F86]">{englishBrand}</span>
                  <span className="text-[10px] font-extrabold text-slate-500 -mt-1">{displayBrand}</span>
                </div>
              </div>
              
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                aria-label={t("بستن منو")}
                className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors active:scale-95 border border-slate-200/50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Menu Items Area - Exactly fits available height */}
            <div 
              className="flex-1 flex flex-col justify-between px-5 pt-4 w-full h-[calc(100dvh-80px)] overflow-hidden"
              style={{ paddingBottom: 'calc(3rem + env(safe-area-inset-bottom))' }}
            >
              <div className="flex flex-col justify-evenly flex-1">
                {navItems.map((item) => {
                  const isActive = currentSection === item.id;
                  const Icon = item.icon;
                  return (
                    <div key={item.id} className="w-full">
                      <Link
                        to={item.path}
                        onClick={() => handleNavClick(item.id)}
                        className={`relative flex items-center justify-between w-full py-2.5 px-3 sm:p-4 rounded-2xl transition-all duration-300 ${isActive ? 'scale-[1.02]' : 'active:scale-95'}`}
                      >
                        {isActive && (
                          <div className="absolute inset-0 bg-blue-50/80 rounded-2xl border border-blue-100/60" />
                        )}
                        
                        <div className="relative z-10 flex items-center gap-3 sm:gap-4">
                          <div className={`flex items-center justify-center w-9 h-9 sm:w-12 sm:h-12 rounded-xl transition-all duration-400 ${isActive ? 'bg-[#003F86] shadow-md shadow-blue-900/20 rotate-3 scale-110' : 'bg-slate-100 text-slate-400'}`}>
                            <Icon className={`w-4 h-4 sm:w-6 sm:h-6 ${isActive ? 'text-amber-400' : ''}`} />
                          </div>
                          <span className={`text-[15px] sm:text-lg font-bold tracking-wide ${isActive ? 'text-[#003F86] font-black' : 'text-slate-600'}`}>
                            {navLabel(item)}
                          </span>
                        </div>
                        
                        {isActive && (
                          <ChevronLeft className="relative z-10 w-4 h-4 sm:w-5 sm:h-5 text-[#003F86]/50 ltr:-scale-x-100" />
                        )}
                      </Link>
                    </div>
                  );
                })}
              </div>

              {/* Search Action at Bottom */}
              <div className="mt-4 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenSearch();
                  }}
                  className="w-full flex items-center justify-center gap-3 bg-[#003F86] text-white p-3.5 sm:p-4 rounded-2xl font-bold"
                >
                  <Search className="w-5 h-5 text-amber-400" />
                  <span>{t("جستجوی هوشمند")}</span>
                </button>
              </div>
            </div>
          </div>
      )}
    </header>
    {/* Outside the header: its backdrop-filter would trap a fixed child inside the bar. */}
    <div className={`lang-dock fixed right-4 z-[45] lg:hidden ${mobileMenuOpen ? 'hidden' : ''}`}>
      <LangToggle className="rounded-full border border-white/60 bg-white/70 px-1 shadow-[0_8px_32px_rgba(0,0,0,0.08)] backdrop-blur-xl" />
    </div>
    </>
  );
};
