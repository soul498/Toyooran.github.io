import React from 'react';
import { LazyImage } from './LazyImage';
import { ArrowLeft, Building2, CheckCircle2, Factory, Globe2 } from '../icons';
import { SEO } from './SEO';
import { OFFICE_PHONE_DISPLAY, OFFICE_PHONE_LABEL, OFFICE_PHONE_TEL, SALES_PHONE_DISPLAY, SALES_PHONE_TEL } from '../data/contact';
import { useData } from '../context/DataContext';
import { Link } from 'react-router-dom';
import {
  ABOUT_ACTIVITIES, ABOUT_ACTIVITIES_HEADING, ABOUT_EYEBROW, ABOUT_FLAGSHIP_CTA, ABOUT_FLAGSHIP_HEADING,
  ABOUT_FLAGSHIP_HREF, ABOUT_FLAGSHIP_TEXT, ABOUT_INTERNATIONAL_HEADING, ABOUT_INTERNATIONAL_TEXT,
  ABOUT_INTRO_HEADING, ABOUT_INTRO_PARAGRAPHS, ABOUT_SUBTITLE, ABOUT_TITLE,
} from '../data/aboutCopy';
import { faDigits } from '../lib/faDigits';

import { isEn, t, tr } from '../i18n';
export const AboutPage: React.FC = () => {
  const { pageContent } = useData();
  const cms = isEn()
    ? { image: pageContent.about.image, ...(pageContent.about.translations?.en || {}) }
    : pageContent.about;
  const features = cms.features || [];
  const feature = (index: number, title: string, description: string) => ({
    title: features[index]?.title || title,
    description: features[index]?.description || description,
  });
  // Approved copy 2026-11-13: six numbered areas of activity; the existing three icon styles repeat.
  const ICON_STYLES = [
    { Icon: CheckCircle2, box: 'bg-[#003F86]/10 border-[#003F86]/10', icon: 'text-[#003F86]' },
    { Icon: Factory, box: 'bg-amber-500/10 border-amber-500/10', icon: 'text-amber-600' },
    { Icon: Globe2, box: 'bg-emerald-500/10 border-emerald-500/10', icon: 'text-emerald-600' },
  ] as const;
  const numberLabel = (n: number) => (isEn() ? String(n) : faDigits(n));
  const activities = ABOUT_ACTIVITIES.map(([title, description], index) => feature(index, tr(title), tr(description)));
  const introParagraphs = cms.intro ? cms.intro.split(/\n{2,}/).map((paragraph) => paragraph.trim()).filter(Boolean) : ABOUT_INTRO_PARAGRAPHS.map((paragraph) => tr(paragraph));
  return (
    <div className="bg-blueprint-light min-h-screen relative">
      <SEO 
        title={tr(ABOUT_TITLE)}
        description={tr(ABOUT_SUBTITLE)}
      />

      {/* Section hero is rendered by App (RouteHero) from src/data/pageHeroes.ts. */}

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 w-full pb-24">
        
        {/* Section 1: Intro */}
        <div className="bg-white rounded-[3rem] shadow-xl border border-white/50 overflow-hidden relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
            {/* Image */}
            <div className="relative h-96 lg:h-auto bg-slate-100">
               <LazyImage
                  src={cms.image || "/images/about-toyooran.jpg"}
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
                
                {tr(ABOUT_EYEBROW)}
              </div>
              
              <h2 className="text-2xl lg:text-3xl font-black text-slate-900 leading-snug mb-5">
                
                {cms.heading || tr(ABOUT_INTRO_HEADING)}
              </h2>
              
              {introParagraphs.map((paragraph, index) => (
                <p key={index} className={`text-slate-600 leading-relaxed text-sm sm:text-base text-justify font-medium ${index === introParagraphs.length - 1 ? 'mb-8' : 'mb-4'}`}>{paragraph}</p>
              ))}

              <h2 className="text-2xl lg:text-3xl font-black text-slate-900 leading-snug mb-5">{tr(ABOUT_ACTIVITIES_HEADING)}</h2>
              <div className="space-y-6 mb-10">
                {activities.map((activity, index) => {
                  const style = ICON_STYLES[index % ICON_STYLES.length];
                  return (
                    <div key={index} className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-2xl ${style.box} flex items-center justify-center shrink-0 shadow-sm border`}>
                        <style.Icon className={`w-6 h-6 ${style.icon}`} />
                      </div>
                      <div>
                        <h3 className="text-slate-900 font-bold text-base mb-1">{numberLabel(index + 1)}. {activity.title}</h3>
                        <p className="text-sm text-slate-600 leading-relaxed font-medium">{activity.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <h2 className="text-2xl lg:text-3xl font-black text-slate-900 leading-snug mb-5">{tr(ABOUT_FLAGSHIP_HEADING)}</h2>
              <p className="text-slate-600 leading-relaxed text-sm sm:text-base text-justify font-medium mb-6">{tr(ABOUT_FLAGSHIP_TEXT)}</p>
              <div className="mb-10">
                <Link
                  to={ABOUT_FLAGSHIP_HREF}
                  className="group/cta inline-flex min-h-[52px] items-center justify-center gap-2.5 whitespace-nowrap rounded-full bg-gradient-to-l from-[#FFC303] to-[#FFA800] px-[22px] text-[17px] font-black text-[#333333] shadow-[0_10px_24px_rgba(255,170,0,0.30)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#003F84]"
                >
                  {tr(ABOUT_FLAGSHIP_CTA)}
                  <span className="grid h-[30px] w-[30px] place-items-center rounded-full bg-black/[0.12] transition-transform group-hover/cta:-translate-x-1 motion-reduce:transition-none" aria-hidden="true">
                    <ArrowLeft className="h-[18px] w-[18px]" strokeWidth={2.4} />
                  </span>
                </Link>
              </div>

              <h2 className="text-2xl lg:text-3xl font-black text-slate-900 leading-snug mb-5">{tr(ABOUT_INTERNATIONAL_HEADING)}</h2>
              <p className="text-slate-600 leading-relaxed text-sm sm:text-base text-justify font-medium mb-8">{tr(ABOUT_INTERNATIONAL_TEXT)}</p>
              
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
