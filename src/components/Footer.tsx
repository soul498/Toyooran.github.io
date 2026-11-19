import React from "react";
import { BaleIcon } from "./BaleIcon";
import { Link } from 'react-router-dom';
import { SocialIconLink } from './SocialIconLink';
import { baladPlaceFor } from '../lib/baladMaps';
import { neshanMapsUrl } from '../lib/phone';
import { ContactPhones } from './ContactPhones';
import { BALE_CHANNEL_URL } from '../data/contact';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Instagram, 
  Send, 
  ArrowLeft,
  ChevronLeft
} from '../icons';
import { rewriteDisabledHref } from '../data/disabledPages';
import { SERVICE_PAGES, servicePagePath } from '../data/servicePages';

import { getLang, hasPersian, hasPersianOnly, intlLocale, t, tr, translateDeep } from '../i18n';
// The six service pages (src/data/servicePages.ts), same order as the cards.
const FOOTER_SERVICE_LINKS = SERVICE_PAGES.map((page) => ({ to: servicePagePath(page), title: page.title }));

interface FooterProps {
  onNavigate: (id: string) => void;
  onSelectCategory: (id: string) => void;
  onOpenConsultation: () => void;
  onOpenQuote: () => void;
  companyInfo: any;
  categories: any[];
  layout?: { logoUrl?: string; aboutFa?: string; aboutEn?: string; aboutTr?: string; aboutRu?: string; aboutAr?: string };
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onSelectCategory, onOpenConsultation, onOpenQuote, companyInfo, categories, layout }) => {
  const navigation = [
    { title: t("صفحه اصلی"), path: '/' },
    { title: t("درباره ما"), path: '/about' },
    { title: t("محصولات"), path: '/products' },
    { title: t("خدمات"), path: '/services' },
    { title: t("تماس"), path: '/contact' },
  ];

  

  const hq = companyInfo?.locations?.find(loc => loc.type === 'headquarter');
  const lang = getLang();
  const companyName = lang === 'fa' ? (companyInfo?.nameFa || companyInfo?.nameEn) : lang === 'ar' ? t("طیوران صنعت پویا") : (companyInfo?.nameEn || companyInfo?.nameFa);
  const currentYear = new Date().getFullYear().toLocaleString(intlLocale(), { useGrouping: false });
  const aboutFallback = t("شرکت طیوران صنعت پویا با بیش از ۵۰ سال سابقه و ۲۰۰ پروژهٔ ملی و بین‌المللی، در طراحی، تولید و اجرای تجهیزات پرورشی و کارخانه‌های خوراک دام و طیور فعالیت می‌کند.");
  const aboutForeign = lang === 'en' ? layout?.aboutEn : lang === 'tr' ? layout?.aboutTr : lang === 'ru' ? layout?.aboutRu : lang === 'ar' ? layout?.aboutAr : undefined;
  const aboutOk = aboutForeign && (lang === 'ar' ? !hasPersianOnly(aboutForeign) : !hasPersian(aboutForeign));
  const aboutText = lang === 'fa' ? (layout?.aboutFa || aboutFallback) : (aboutOk ? aboutForeign : aboutFallback);

  return (
    <footer className="relative w-full bg-[#020b18] pt-20 pb-6 overflow-hidden border-t border-white/5 z-20">
      
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-[700px] h-[700px] bg-[radial-gradient(circle_at_center,_rgba(59,130,246,0.05)_0%,_transparent_70%)] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[800px] h-[800px] bg-[radial-gradient(circle_at_center,_rgba(245,158,11,0.05)_0%,_transparent_70%)] translate-x-1/3 translate-y-1/3 pointer-events-none" />
      <div className="absolute inset-0 bg-[url('/images/cubes.png')] opacity-[0.02] mix-blend-overlay pointer-events-none" />

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 mb-16">
          
          {/* Column 1: Brand & About (Span 4) */}
          <div className="lg:col-span-4 flex flex-col">
            <div className="flex items-center gap-3 mb-6">
               <div className="h-14 flex items-center justify-center">
                  <img src={layout?.logoUrl || "/images/logo-mark.png"} alt={t("طیوران صنعت پویا")} width={70} height={56} className="h-full w-auto object-contain" />
               </div>
               <div>
                  <p className="text-xl font-black text-white tracking-tight">{companyName}</p>
                  {lang === 'fa' && <span className="text-xs text-amber-400 font-bold tracking-widest uppercase">{companyInfo?.nameEn}</span>}
               </div>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed font-medium mb-8 max-w-sm">
              
              {aboutText}
            </p>
            
            {/* Social Links */}
            <div className="flex flex-nowrap items-center gap-2 overflow-x-auto pb-1">
              <SocialIconLink
                href={companyInfo?.socialLinks?.instagram}
                label={t("اینستاگرام")}
                comingSoon={t("صفحهٔ اینستاگرام طیوران صنعت پویا به‌زودی راه‌اندازی می‌شود")}
                className="rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white hover:bg-gradient-to-tr hover:from-yellow-400 hover:via-pink-500 hover:to-purple-500 hover:border-transparent transition-all duration-300 group"
              >
                <Instagram className="w-4 h-4 group-hover:scale-110 transition-transform" aria-hidden="true" />
              </SocialIconLink>
              <SocialIconLink
                href={companyInfo?.socialLinks?.telegram}
                label={t("تلگرام")}
                comingSoon={t("کانال تلگرام طیوران صنعت پویا به‌زودی راه‌اندازی می‌شود")}
                className="rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white hover:bg-[#0088cc] hover:border-transparent transition-all duration-300 group"
              >
                <Send className="w-4 h-4 ml-0.5 group-hover:scale-110 transition-transform" aria-hidden="true" />
              </SocialIconLink>
              <SocialIconLink
                href={companyInfo?.socialLinks?.bale || BALE_CHANNEL_URL}
                label={t("بله")}
                comingSoon={t("کانال بله طیوران صنعت پویا به‌زودی راه‌اندازی می‌شود")}
                className="rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white hover:bg-[#0ACA9B] hover:border-transparent transition-all duration-300 group"
              >
                <BaleIcon className="w-4 h-4 group-hover:scale-110 transition-transform" />
              </SocialIconLink>
            </div>
          </div>

          {/* Column 2: Quick Links (Span 2) */}
          <div className="lg:col-span-2 flex flex-col">
            <p className="text-white font-bold text-lg mb-6 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              
              {t("دسترسی سریع")}
            </p>
            <ul className="space-y-3">
              {navigation.map((nav, idx) => (
                <li key={idx}>
                  <Link to={nav.path} className="text-slate-300 hover:text-amber-400 text-sm font-medium transition-colors flex items-center gap-1.5 group">
                    <ChevronLeft className="w-3.5 h-3.5 ltr:-scale-x-100 text-slate-600 group-hover:text-amber-400 transition-colors" />
                    {nav.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Services (Span 3) */}
          <div className="lg:col-span-3 flex flex-col">
            <p className="text-white font-bold text-lg mb-6 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              
              {t("خدمات و محصولات")}
            </p>
            <ul className="space-y-3">
              {translateDeep(FOOTER_SERVICE_LINKS).map((item) => (
                <li key={item.to}>
                    <Link to={rewriteDisabledHref(item.to)} className="text-slate-300 hover:text-blue-400 text-sm font-medium transition-colors flex items-center gap-1.5 group">
                      <ChevronLeft className="w-3.5 h-3.5 ltr:-scale-x-100 text-slate-600 group-hover:text-blue-400 transition-colors" />
                      {item.title}
                    </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Contact Info (Span 3) */}
          <div className="lg:col-span-3 flex flex-col">
            <p className="text-white font-bold text-lg mb-6 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              
              {t("اطلاعات تماس")}
            </p>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0 mt-1">
                  <Phone className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-slate-300">
                  <ContactPhones tone="dark" size="sm" />
                </div>
              </div>
              
              {hq && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0 mt-1">
                    <MapPin className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-300 font-bold mb-1">{t("دفتر مرکزی")}</span>
                    <a
                      href={baladPlaceFor(hq) || neshanMapsUrl(hq.address, hq.lat, hq.lng)}
                      target="_blank"
                      rel="noreferrer"
                      className="text-slate-300 hover:text-amber-400 font-medium text-sm leading-relaxed"
                    >
                      {hq.address}
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
          
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-6" />

        {/* Copyright & Credits */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-medium text-slate-300">
          <p>
            © {currentYear} {" "}{tr("طراحی، توسعه و تمامی حقوق این وبسایت متعلق به شرکت فناوری و نوآوری شناخت هزارتو است")}{" "}
          </p>
          <div className="flex items-center gap-4">
             <span>{t("قوانین و مقررات")}</span>
             <div className="w-1 h-1 rounded-full bg-slate-700" />
             <span>{t("حریم خصوصی")}</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
