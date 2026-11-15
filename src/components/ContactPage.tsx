import React, { useState } from "react";
import { AparatIcon } from "./AparatIcon";
import { SocialIconLink } from './SocialIconLink';
import { 
  Phone, Mail, MapPin, Clock, Building2, Factory, Map,
  MessageCircle, Instagram, Linkedin, FileText, Send, Youtube, Tv, Grid
} from '../icons';
import { useData } from '../context/DataContext';
import { FreeConsultationForm } from './FreeConsultationForm';
import { OFFICE_PHONE_DISPLAY, OFFICE_PHONE_LABEL, OFFICE_PHONE_TEL, SALES_PHONE_ALT_DISPLAY, SALES_PHONE_ALT_TEL, SALES_PHONE_DISPLAY, SALES_PHONE_TEL } from '../data/contact';
import { LocationDetailPane } from './LocationDetailPane';

import { t, tr } from '../i18n';
interface ContactPageProps {
  initialSubject?: string;
  initialProduct?: string;
  initialMessage?: string;
}

export const ContactPage: React.FC<ContactPageProps> = ({
  initialSubject,
  initialProduct,
  initialMessage
}) => {
  const { companyInfo } = useData();
  const [activeLocationIndex, setActiveLocationIndex] = useState(0);
  
  const locations = companyInfo.locations || [];
  const activeLocation = locations[activeLocationIndex] || null;

  return (
    <div className="w-full min-h-screen relative overflow-hidden z-0" id="contact-page">
      <style>{`
        .dir-scrollbar::-webkit-scrollbar { width: 4px; }
        .dir-scrollbar::-webkit-scrollbar-track { background: rgba(0, 0, 0, 0.1); border-radius: 8px; }
        .dir-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.15); border-radius: 8px; }
        .dir-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(251, 191, 36, 0.4); }
      `}</style>
      
      {/* Section hero is rendered by App (RouteHero) from src/data/pageHeroes.ts. */}

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pb-16 lg:pb-24 relative z-10">

        {/* Central Layout: Unified Free Consultation Form + Contact Direct Info Box */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start mb-16">
          
          {/* Contact Direct Info Box (5 Cols) -> Now with premium dark aesthetic matching the new landing section */}
          <div className="xl:col-span-5 space-y-5">
            <div className="bg-[#001c3d] text-white rounded-[2.5rem] sm:rounded-[3rem] p-6 sm:p-8 lg:p-12 border-none shadow-[0_30px_60px_rgba(0,0,0,0.15)] relative overflow-hidden group">
              {/* Premium Inner Glows */}
              <div className="absolute -top-16 -right-16 w-32 h-32 bg-amber-500/20 blur-3xl rounded-full group-hover:bg-amber-500/30 transition-colors duration-500" />
              <div className="absolute -bottom-16 -left-16 w-40 h-40 bg-blue-500/20 blur-3xl rounded-full group-hover:bg-blue-500/30 transition-colors duration-500" />
              <div className="absolute inset-0 bg-[url('/images/cubes.png')] opacity-[0.03] mix-blend-overlay pointer-events-none" />
              
              <div className="relative z-10">
                <h3 className="font-black text-amber-400 text-lg flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
                  <Phone className="w-5 h-5" />
                  <span>{t("راه‌های ارتباط مستقیم")}</span>
                </h3>
                
                <div className="space-y-4 text-sm">
                  <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-amber-400/30 hover:bg-white/10 transition-all duration-300">
                    <div className="w-10 h-10 rounded-xl bg-amber-400/10 text-amber-400 flex items-center justify-center shrink-0 shadow-inner shadow-amber-400/20">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-slate-300 block text-xs mb-1">{t("مشاوره، فروش و پشتیبانی:")}</span>
                      <a href={SALES_PHONE_TEL} className="font-mono font-bold text-white text-base hover:text-amber-400 transition-colors drop-shadow-md" dir="ltr">
                        {tr(SALES_PHONE_DISPLAY)}
                      </a>
                      <a href={SALES_PHONE_ALT_TEL} className="block font-mono font-bold text-white text-base hover:text-amber-400 transition-colors drop-shadow-md" dir="ltr">
                        {tr(SALES_PHONE_ALT_DISPLAY)}
                      </a>
                      <span className="text-slate-300 block text-xs mt-3 mb-1">{tr(OFFICE_PHONE_LABEL)}:</span>
                      <a href={OFFICE_PHONE_TEL} className="font-mono font-bold text-white text-base hover:text-amber-400 transition-colors drop-shadow-md" dir="ltr">
                        {tr(OFFICE_PHONE_DISPLAY)}
                      </a>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all duration-300">
                    <div className="w-10 h-10 rounded-xl bg-slate-700/50 text-slate-300 flex items-center justify-center shrink-0 shadow-inner shadow-white/5">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-slate-300 block text-xs mb-1">{t("ساعات پاسخگویی مهندسان:")}</span>
                      <span className="text-slate-200 text-sm">{companyInfo.workingHours}</span>
                    </div>
                  </div>
                </div>

                {/* Social Links inside the dark card */}
                {companyInfo.socialLinks && (
                  <div className="mt-8 pt-6 border-t border-white/10">
                    <span className="text-slate-300 text-xs block mb-4">{t("شبکه‌های اجتماعی:")}</span>
                    <div className="flex flex-nowrap items-center gap-2 overflow-x-auto pb-1">
                      <SocialIconLink
                        href={companyInfo.socialLinks.instagram}
                        label={t("اینستاگرام")}
                        comingSoon={t("صفحهٔ اینستاگرام طیوران صنعت پویا به‌زودی راه‌اندازی می‌شود")}
                        className="rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white hover:bg-gradient-to-tr hover:from-yellow-400 hover:via-pink-500 hover:to-purple-500 hover:border-transparent transition-all duration-300 group"
                      >
                        <Instagram className="w-4 h-4 group-hover:scale-110 transition-transform" aria-hidden="true" />
                      </SocialIconLink>
                      <SocialIconLink
                        href={companyInfo.socialLinks.telegram}
                        label={t("تلگرام")}
                        comingSoon={t("کانال تلگرام طیوران صنعت پویا به‌زودی راه‌اندازی می‌شود")}
                        className="rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white hover:bg-[#0088cc] hover:border-transparent transition-all duration-300 group"
                      >
                        <Send className="w-4 h-4 ml-0.5 group-hover:scale-110 transition-transform" aria-hidden="true" />
                      </SocialIconLink>
                      <SocialIconLink
                        href={companyInfo.socialLinks.aparat}
                        label={t("آپارات")}
                        comingSoon={t("کانال آپارات طیوران صنعت پویا به‌زودی راه‌اندازی می‌شود")}
                        className="rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white hover:bg-[#263238] hover:border-transparent transition-all duration-300 group"
                      >
                        <AparatIcon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                      </SocialIconLink>
                      <SocialIconLink
                        href={companyInfo.socialLinks.rubika}
                        label={t("روبیکا")}
                        comingSoon={t("کانال روبیکا طیوران صنعت پویا به‌زودی راه‌اندازی می‌شود")}
                        className="rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white hover:bg-gradient-to-r hover:from-[#ff7300] hover:to-[#7600b5] hover:border-transparent transition-all duration-300 group"
                      >
                        <Grid className="w-4 h-4 group-hover:scale-110 transition-transform" aria-hidden="true" />
                      </SocialIconLink>
                      <SocialIconLink
                        href={companyInfo.socialLinks.youtube}
                        label={t("یوتیوب")}
                        comingSoon={t("کانال یوتیوب طیوران صنعت پویا به‌زودی راه‌اندازی می‌شود")}
                        className="rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white hover:bg-[#ff0000] hover:border-transparent transition-all duration-300 group"
                      >
                        <Youtube className="w-4 h-4 group-hover:scale-110 transition-transform" aria-hidden="true" />
                      </SocialIconLink>
                      <SocialIconLink
                        href={companyInfo.socialLinks.linkedin}
                        label={t("لینکدین")}
                        comingSoon={t("صفحهٔ لینکدین طیوران صنعت پویا به‌زودی راه‌اندازی می‌شود")}
                        className="rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white hover:bg-[#0077b5] hover:border-transparent transition-all duration-300 group"
                      >
                        <Linkedin className="w-4 h-4 group-hover:scale-110 transition-transform" aria-hidden="true" />
                      </SocialIconLink>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Main Free Consultation Form (7 Cols) */}
          <div id="consultation-form" className="xl:col-span-7 h-full scroll-mt-24">
            <FreeConsultationForm 
              initialSubject={initialSubject}
              initialProduct={initialProduct}
              initialMessage={initialMessage}
              className="h-full shadow-lg border-slate-200 hover:shadow-xl transition-shadow"
            />
          </div>
          
        </div>

        {/* Section 2: Massive Dark Cinematic Locations Card (from unified section) */}
        <div className="bg-[#001c3d] rounded-[2.5rem] sm:rounded-[3.5rem] p-6 sm:p-12 lg:p-16 relative overflow-hidden flex flex-col shadow-[0_30px_60px_rgba(0,0,0,0.15)] border-none">
          {/* Ambient Background Magic */}
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[radial-gradient(circle_at_center,_rgba(245,158,11,0.08)_0%,_transparent_70%)] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-[radial-gradient(circle_at_center,_rgba(0,63,134,0.15)_0%,_transparent_70%)] translate-y-1/3 -translate-x-1/3 pointer-events-none" />
          <div className="absolute inset-0 bg-[url('/images/cubes.png')] opacity-[0.03] pointer-events-none" />
          
          <div className="relative z-10 w-full">
            <div className="flex items-center gap-6 mb-10">
                <div className="h-px flex-1 bg-gradient-to-l from-white/20 to-transparent" />
                <h3 className="text-slate-200 font-bold text-lg tracking-widest uppercase">{t("آدرس مراکز و شعب")}</h3>
                <div className="h-px flex-1 bg-gradient-to-r from-white/20 to-transparent" />
              </div>

              {/* Fixed-Height Container for Scalability */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-auto lg:h-[560px]">
                
                {/* 1. Left Sidebar: Scrollable List of Branches */}
                <div className="lg:col-span-4 bg-white/5 border border-white/10 rounded-[2rem] p-4 flex flex-col  h-[350px] lg:h-full relative overflow-hidden shadow-2xl">
                   {/* Fade masks for elegant scrolling */}
                   <div className="absolute top-0 left-0 right-0 h-6 bg-gradient-to-b from-slate-950/80 to-transparent z-10 pointer-events-none rounded-t-[2rem]" />
                   <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-slate-950/90 to-transparent z-10 pointer-events-none rounded-b-[2rem]" />
                   
                   <div className="flex-1 overflow-y-auto pl-2 pr-1 dir-scrollbar space-y-3 relative z-0 pb-6 pt-2">
                     {locations.map((loc, idx) => {
                        const isActive = idx === activeLocationIndex;
                        const isHQ = loc.type === 'headquarter';
                        const isFact = loc.type === 'factory';
                        const Icon = isHQ ? Building2 : isFact ? Factory : MapPin;

                        return (
                          <button
                            key={loc.id || idx}
                            type="button"
                            onClick={() => setActiveLocationIndex(idx)}
                            aria-current={isActive ? 'true' : undefined}
                            className={`w-full text-right flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 border ${
                              isActive
                                ? 'bg-white/10 border-amber-400/40 shadow-[0_0_20px_rgba(251,191,36,0.1)]'
                                : 'bg-transparent border-transparent hover:bg-white/5 hover:border-white/10'
                            }`}
                          >
                             <div className={`w-12 h-12 rounded-[14px] flex items-center justify-center shrink-0 transition-all duration-300 shadow-inner ${
                               isActive ? 'bg-amber-400 text-slate-900 shadow-white/20' : 'bg-white/5 text-slate-300 shadow-transparent'
                             }`}>
                               <Icon className="w-5 h-5" aria-hidden="true" />
                             </div>
                             <div className="flex-1 overflow-hidden">
                               <p className={`font-black truncate text-[13px] sm:text-sm mb-1 transition-colors ${isActive ? 'text-amber-400' : 'text-slate-200'}`}>
                                 {loc.title || (isHQ ? t("دفتر مرکزی") : t("شعبه"))}
                               </p>
                               <p className="text-[11px] text-slate-300 truncate">{loc.address}</p>
                             </div>
                          </button>
                        )
                     })}
                   </div>
                </div>

                {activeLocation && (
                  <LocationDetailPane
                    location={activeLocation}
                    hours={(activeLocation as { workingHours?: string }).workingHours || (activeLocation.type === 'headquarter' ? companyInfo.workingHours : null)}
                  />
                )}

              </div>
          </div>
        </div>

      </div>
    </div>
  );
};
