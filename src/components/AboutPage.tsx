import React from 'react';
import { LazyImage } from './LazyImage';
import { SitePicture } from './SitePicture';
import { ArrowLeft, Building2, CheckCircle2, Factory, Globe2 } from '../icons';
import { SEO } from './SEO';
import { OFFICE_PHONE_DISPLAY, OFFICE_PHONE_LABEL, OFFICE_PHONE_TEL, SALES_PHONE_DISPLAY, SALES_PHONE_TEL } from '../data/contact';
import { useData } from '../context/DataContext';
import { Link } from 'react-router-dom';
import {
  ABOUT_ACTIVITIES, ABOUT_ACTIVITIES_HEADING, ABOUT_CTA_HEADING, ABOUT_CTA_LABEL, ABOUT_CTA_TEXT, ABOUT_DESIGN_CAPTION,
  ABOUT_EYEBROW, ABOUT_FLAGSHIP_CTA, ABOUT_FLAGSHIP_HEADING, ABOUT_FLAGSHIP_HREF, ABOUT_FLAGSHIP_TEXT,
  ABOUT_INTERNATIONAL_HEADING, ABOUT_INTERNATIONAL_TEXT, ABOUT_INTRO_HEADING, ABOUT_INTRO_PARAGRAPHS,
  ABOUT_PROCESS_EYEBROW, ABOUT_PROCESS_HEADING, ABOUT_PROCESS_INTRO, ABOUT_PROCESS_STEPS, ABOUT_PROCESS_STEP_LABEL,
  ABOUT_SUBTITLE, ABOUT_TITLE,
} from '../data/aboutCopy';
import { ABOUT_PHOTOS, type SitePhoto } from '../data/sitePhotos';
import { faDigits } from '../lib/faDigits';

import { getLang, isLtr, t, tr } from '../i18n';

type StepKey = (typeof ABOUT_PROCESS_STEPS)[number][0];
/** Photos per process step (graphic designer's picks, approved by the user 2026-11-14). */
const STEP_PHOTOS: Record<StepKey, SitePhoto[]> = {
  design: [ABOUT_PHOTOS.design],
  structure: [ABOUT_PHOTOS.structureFrame, ABOUT_PHOTOS.structureShell],
  supply: [ABOUT_PHOTOS.delivery],
  installation: [ABOUT_PHOTOS.installLayout, ABOUT_PHOTOS.installCrew, ABOUT_PHOTOS.installLines],
  team: [ABOUT_PHOTOS.fieldTeam],
  handover: [ABOUT_PHOTOS.operation],
};
const ONE_COL = '(min-width: 1280px) 600px, (min-width: 1024px) 46vw, 100vw';
const HALF_COL = '(min-width: 1280px) 300px, (min-width: 1024px) 23vw, 50vw';

const PRIMARY_CTA = 'group/cta inline-flex min-h-[52px] items-center justify-center gap-2.5 whitespace-nowrap rounded-full bg-gradient-to-l from-[#FFC303] to-[#FFA800] px-[22px] text-[17px] font-black text-[#333333] shadow-[0_10px_24px_rgba(255,170,0,0.30)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#003F84]';
const CtaArrow = () => (
  <span className="grid h-[30px] w-[30px] place-items-center rounded-full bg-black/[0.12] transition-transform group-hover/cta:-translate-x-1 motion-reduce:transition-none" aria-hidden="true">
    <ArrowLeft className="h-[18px] w-[18px] ltr:-scale-x-100" strokeWidth={2.4} />
  </span>
);

const StepMedia: React.FC<{ stepKey: StepKey }> = ({ stepKey }) => {
  const photos = STEP_PHOTOS[stepKey];
  if (stepKey === 'design') {
    // A drawing, not a site photo: framed and captioned as an illustration.
    return (
      <figure className="rounded-[2rem] bg-[#0b3c80] p-2 shadow-lg">
        <SitePicture photo={photos[0]} sizes={ONE_COL} className="block overflow-hidden rounded-[1.6rem] aspect-[16/9]" />
        <figcaption className="px-3 pt-2 pb-1 text-xs font-bold text-blue-100">{tr(ABOUT_DESIGN_CAPTION)}</figcaption>
      </figure>
    );
  }
  if (photos.length === 1) {
    return <SitePicture photo={photos[0]} sizes={ONE_COL} className={`block overflow-hidden rounded-[2rem] shadow-lg bg-slate-100 ${photos[0].height / photos[0].width > 0.7 ? 'aspect-[4/3]' : 'aspect-[16/9]'}`} />;
  }
  return (
    <div className="grid grid-cols-2 gap-3">
      {photos.map((photo, index) => {
        const wide = photos.length === 3 && index === 0;
        return (
          <SitePicture
            key={photo.base}
            photo={photo}
            sizes={wide ? ONE_COL : HALF_COL}
            className={`block overflow-hidden rounded-[1.5rem] shadow-md bg-slate-100 ${wide ? 'col-span-2 aspect-[16/7]' : 'aspect-[4/3]'}`}
          />
        );
      })}
    </div>
  );
};

export const AboutPage: React.FC = () => {
  const { pageContent } = useData();
  const lang = getLang();
  const cms = lang === 'fa'
    ? pageContent.about
    : { image: pageContent.about.image, ...(pageContent.about.translations?.[lang] || {}) };
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
  const numberLabel = (n: number) => (isLtr() ? String(n) : faDigits(n));
  const activities = ABOUT_ACTIVITIES.map(([title, description], index) => feature(index, tr(title), tr(description)));
  const introParagraphs = cms.intro ? cms.intro.split(/\n{2,}/).map((paragraph) => paragraph.trim()).filter(Boolean) : ABOUT_INTRO_PARAGRAPHS.map((paragraph) => tr(paragraph));
  return (
    <div className="bg-blueprint-light min-h-screen relative">
      <SEO
        title={tr(ABOUT_TITLE)}
        description={tr(ABOUT_SUBTITLE)}
      />

      {/* Section hero is rendered by App (RouteHero) from src/data/pageHeroes.ts. */}

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 w-full pb-24 space-y-10 lg:space-y-14">

        {/* 1. Intro: hall panorama banner, introduction and areas of activity */}
        <section className="bg-white rounded-[3rem] shadow-xl border border-white/50 overflow-hidden" aria-labelledby="about-intro">
          <div className="relative h-56 sm:h-72 lg:h-[26rem] bg-slate-100">
            {cms.image ? (
              <LazyImage src={cms.image} alt={t("طیوران صنعت پویا")} className="w-full h-full" imgClassName="w-full h-full object-cover" width={1600} height={666} />
            ) : (
              <SitePicture photo={ABOUT_PHOTOS.panorama} sizes="(min-width: 1280px) 1232px, 100vw" eager className="block w-full h-full" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 p-8 lg:p-16">
            <div>
              <div className="inline-flex items-center gap-2 bg-blue-50/50 text-[#003F86] px-4 py-2 rounded-xl mb-6 font-bold text-sm border border-blue-100/50">
                <Building2 className="w-4 h-4" />
                {tr(ABOUT_EYEBROW)}
              </div>
              <h2 id="about-intro" className="text-2xl lg:text-3xl font-black text-slate-900 leading-snug mb-5">
                {cms.heading || tr(ABOUT_INTRO_HEADING)}
              </h2>
              {introParagraphs.map((paragraph, index) => (
                <p key={index} className="text-slate-600 leading-relaxed text-sm sm:text-base text-justify font-medium mb-4">{paragraph}</p>
              ))}
            </div>

            <div>
              <h2 className="text-2xl lg:text-3xl font-black text-slate-900 leading-snug mb-5">{tr(ABOUT_ACTIVITIES_HEADING)}</h2>
              <div className="space-y-6">
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
            </div>
          </div>
        </section>

        {/* 2. Process: from design to handover (site photos) */}
        <section aria-labelledby="about-process">
          <div className="max-w-3xl mb-8 lg:mb-12">
            <span className="inline-flex items-center gap-2 rounded-full bg-amber-400/15 border border-amber-400/40 px-4 py-1.5 text-sm font-black text-amber-700 mb-4">{tr(ABOUT_PROCESS_EYEBROW)}</span>
            <h2 id="about-process" className="text-2xl lg:text-4xl font-black text-slate-900 leading-snug mb-4">{tr(ABOUT_PROCESS_HEADING)}</h2>
            <p className="text-slate-600 leading-relaxed text-sm sm:text-base font-medium">{tr(ABOUT_PROCESS_INTRO)}</p>
          </div>

          <ol className="space-y-6 lg:space-y-8">
            {ABOUT_PROCESS_STEPS.map(([key, heading, text], index) => (
              <li key={key} className="bg-white rounded-[2.5rem] shadow-lg border border-white/60 p-5 sm:p-8 lg:p-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12 items-center">
                  <div className={index % 2 === 1 ? 'lg:order-2' : ''}>
                    <div className="flex items-center gap-3 mb-4">
                      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#003F86] text-lg font-black text-white shadow-md">{numberLabel(index + 1)}</span>
                      <span className="text-sm font-bold text-slate-500">{tr(ABOUT_PROCESS_STEP_LABEL)} {numberLabel(index + 1)}</span>
                    </div>
                    <h3 className="text-xl lg:text-2xl font-black text-slate-900 leading-snug mb-3">{tr(heading)}</h3>
                    <p className="text-slate-600 leading-relaxed text-sm sm:text-base text-justify font-medium">{tr(text)}</p>
                    {key === 'handover' && (
                      <div className="mt-6 rounded-3xl bg-gradient-to-l from-[#003F86] to-[#0a56b0] p-6 text-white shadow-lg">
                        <p className="text-lg font-black mb-2">{tr(ABOUT_CTA_HEADING)}</p>
                        <p className="text-sm leading-relaxed text-blue-100 mb-5">{tr(ABOUT_CTA_TEXT)}</p>
                        <Link to="/contact" className={PRIMARY_CTA}>
                          {tr(ABOUT_CTA_LABEL)}
                          <CtaArrow />
                        </Link>
                      </div>
                    )}
                  </div>
                  <div className={index % 2 === 1 ? 'lg:order-1' : ''}>
                    <StepMedia stepKey={key} />
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* 3. Flagship product, international cooperation and contact */}
        <section className="bg-white rounded-[3rem] shadow-xl border border-white/50 p-8 lg:p-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
            <div>
              <h2 className="text-2xl lg:text-3xl font-black text-slate-900 leading-snug mb-5">{tr(ABOUT_FLAGSHIP_HEADING)}</h2>
              <p className="text-slate-600 leading-relaxed text-sm sm:text-base text-justify font-medium mb-6">{tr(ABOUT_FLAGSHIP_TEXT)}</p>
              <Link to={ABOUT_FLAGSHIP_HREF} className={PRIMARY_CTA}>
                {tr(ABOUT_FLAGSHIP_CTA)}
                <CtaArrow />
              </Link>
            </div>
            <div>
              <h2 className="text-2xl lg:text-3xl font-black text-slate-900 leading-snug mb-5">{tr(ABOUT_INTERNATIONAL_HEADING)}</h2>
              <p className="text-slate-600 leading-relaxed text-sm sm:text-base text-justify font-medium">{tr(ABOUT_INTERNATIONAL_TEXT)}</p>
            </div>
          </div>

          <div className="mt-10 bg-slate-50/80 p-6 rounded-2xl border border-slate-200/60 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center shadow-sm">
            <div className="text-slate-700 text-sm font-bold flex flex-wrap items-center gap-x-2 gap-y-1">
              {t("مشاوره، فروش و پشتیبانی:")}
              <a href={SALES_PHONE_TEL} className="font-mono text-[#003F86] text-base hover:underline whitespace-nowrap" dir="ltr">{tr(SALES_PHONE_DISPLAY)}</a>
            </div>
            <div className="text-slate-700 text-sm font-bold flex flex-wrap items-center gap-x-2 gap-y-1">
              {tr(OFFICE_PHONE_LABEL)}:
              <a href={OFFICE_PHONE_TEL} className="font-mono text-[#003F86] text-base hover:underline whitespace-nowrap" dir="ltr">{tr(OFFICE_PHONE_DISPLAY)}</a>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};
