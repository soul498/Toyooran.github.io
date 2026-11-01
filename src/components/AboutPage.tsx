import React from 'react';
import { LazyImage } from './LazyImage';
import { Building2, CheckCircle2, Factory, Globe2 } from '../icons';
import { SEO } from './SEO';
import { OFFICE_PHONE_DISPLAY, OFFICE_PHONE_LABEL, OFFICE_PHONE_TEL, SALES_PHONE_DISPLAY, SALES_PHONE_TEL } from '../data/contact';

import { t, tr } from '../i18n';
export const AboutPage: React.FC = () => {
  return (
    <div className="bg-blueprint-light min-h-screen relative">
      <SEO 
        title={t("درباره طیوران صنعت پویا | ۵۰ سال سابقه در صنعت دام و طیور")}
        description={t("مشاور، طراح و مجری توسعه و بهره‌برداری پروژه‌های صنعتی با بیش از ۵۰ سال تجربه در صنعت دام، طیور و آبزیان.")}
      />

      {/* Section hero is rendered by App (RouteHero) from src/data/pageHeroes.ts. */}

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 w-full pb-24">
        
        {/* Section 1: Intro */}
        <div className="bg-white rounded-[3rem] shadow-xl border border-white/50 overflow-hidden relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
            {/* Image */}
            <div className="relative h-96 lg:h-auto bg-slate-100">
               <LazyImage
                  src="/images/about-toyooran.jpg"
                  alt={t("طیوران صنعت پویا")}
                  className="w-full h-full"
                  imgClassName="w-full h-full object-cover"
               />
               <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
            </div>

            {/* Content */}
            <div className="p-8 lg:p-16 flex flex-col justify-center">
              <div className="inline-flex items-center gap-2 bg-blue-50/50 text-[#003F86] px-4 py-2 rounded-xl mb-6 self-start font-bold text-sm border border-blue-100/50">
                <Building2 className="w-4 h-4" />
                
                {t("درباره طیوران صنعت پویا")}
              </div>
              
              <h2 className="text-2xl lg:text-3xl font-black text-slate-900 leading-snug mb-5">
                
                {t("مشاور، طراح و مجری توسعه و بهره‌برداری پروژه‌های صنعتی")}
              </h2>
              
              <p className="text-slate-600 leading-relaxed text-sm sm:text-base mb-8 text-justify font-medium">
                
                {t("شرکت طیوران صنعت پویا با بیش از ۵۰ سال تجربه در صنعت دام، طیور و آبزیان، مجری بیش از ۲۰۰ پروژهٔ ملی و بین‌المللی است و راهکارهای جامع توسعه، طراحی، ساخت و تجهیز کامل سوله و کارخانه‌ها را ارائه می‌کند.")}
              </p>

              <div className="space-y-6 mb-10">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#003F86]/10 flex items-center justify-center shrink-0 shadow-sm border border-[#003F86]/10">
                    <CheckCircle2 className="w-6 h-6 text-[#003F86]" />
                  </div>
                  <div>
                    <h3 className="text-slate-900 font-bold text-base mb-1">{t("برند IMACHINE")}</h3>
                    <p className="text-sm text-slate-600 leading-relaxed font-medium">{t("طراحی و تولید ماشین‌آلات صنعتی با برند IMACHINE در صنعت خوراک.")}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center shrink-0 shadow-sm border border-amber-500/10">
                    <Factory className="w-6 h-6 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="text-slate-900 font-bold text-base mb-1">{t("تولید تخصصی ماشین‌آلات")}</h3>
                    <p className="text-sm text-slate-600 leading-relaxed font-medium">{t("تولیدکننده تخصصی انواع جت هیتر، تجهیزات گرمایشی و ماشین‌آلات خطوط تولید خوراک دام و طیور.")}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center shrink-0 shadow-sm border border-emerald-500/10">
                    <Globe2 className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="text-slate-900 font-bold text-base mb-1">{t("گستره فعالیت و توسعه")}</h3>
                    <p className="text-sm text-slate-600 leading-relaxed font-medium">{t("دارای دفتر تحقیق و توسعه (R&D) مستقر در دانشگاه منابع طبیعی گلستان و حضور فعال در بازارهای داخلی و خارجی.")}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-slate-50/80 p-6 rounded-2xl border border-slate-200/60 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center shadow-sm">
                 <div className="text-slate-700 text-sm font-bold flex flex-wrap items-center gap-x-2 gap-y-1">
                   
                   {t("مشاوره، فروش و پشتیبانی:")}
                   <a href={SALES_PHONE_TEL} className="font-mono text-[#003F86] text-base hover:underline whitespace-nowrap" dir="ltr">{tr(SALES_PHONE_DISPLAY)}</a>
                 </div>
                 <div className="text-slate-700 text-sm font-bold flex flex-wrap items-center gap-x-2 gap-y-1">
                   {tr(OFFICE_PHONE_LABEL)}:
                   <a href={OFFICE_PHONE_TEL} className="font-mono text-[#003F86] text-base hover:underline whitespace-nowrap" dir="ltr">{tr(OFFICE_PHONE_DISPLAY)}</a>
                 </div>
              </div>

            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
};
