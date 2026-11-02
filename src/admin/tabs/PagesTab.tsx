import React, { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, FileText, Save } from '../../icons';
import { useData } from '../../context/DataContext';
import type { AboutPageCms, CmsPageKey, PageHeroCms, PagesCms, RndPageCms } from '../../types';
import { ImagePicker } from '../components/ImagePicker';

const PAGE_OPTIONS: { key: CmsPageKey; label: string; description: string }[] = [
  { key: 'services', label: 'صفحه خدمات', description: 'تیتر، زیرتیتر و دعوت به اقدام بالای صفحه خدمات' },
  { key: 'magazine', label: 'صفحه مجله', description: 'تیتر و متن معرفی بالای فهرست مقالات' },
  { key: 'about', label: 'صفحه درباره شرکت', description: 'هیرو و متن‌های معرفی شرکت' },
  { key: 'rnd', label: 'صفحه تحقیق و توسعه', description: 'هیرو و پیام صفحه تحقیق و توسعه' },
  { key: 'contact', label: 'صفحه تماس', description: 'هیرو بالای فرم تماس و مشاوره' },
];

const fieldClass = 'mt-1.5 w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:border-amber-400';
const compactFieldClass = fieldClass.replace('mt-1.5 ', '');

export const PagesTab: React.FC = () => {
  const { pageContent, updatePageContent } = useData();
  const [draft, setDraft] = useState<PagesCms>(pageContent);
  const [activePage, setActivePage] = useState<CmsPageKey>('about');
  const [saved, setSaved] = useState(false);

  useEffect(() => { setDraft(pageContent); }, [pageContent]);

  const activeHero = useMemo(() => draft.heroes[activePage] || {}, [draft.heroes, activePage]);
  const activeHeroEn = (activeHero.translations?.en || {}) as Partial<Omit<PageHeroCms, 'translations'>>;
  const aboutEn = (draft.about.translations?.en || {}) as Partial<Omit<AboutPageCms, 'translations'>>;
  const rndEn = (draft.rnd.translations?.en || {}) as Partial<Omit<RndPageCms, 'translations'>>;

  const updateHero = (patch: Partial<PageHeroCms>) => {
    setDraft((previous) => ({
      ...previous,
      heroes: {
        ...previous.heroes,
        [activePage]: { ...(previous.heroes[activePage] || {}), ...patch },
      },
    }));
  };

  const updateHeroEnglish = (patch: Partial<PageHeroCms>) => {
    updateHero({ translations: { en: { ...activeHeroEn, ...patch } } });
  };

  const updateAbout = (patch: Partial<AboutPageCms>) => {
    setDraft((previous) => ({ ...previous, about: { ...previous.about, ...patch } }));
  };

  const updateAboutFeature = (index: number, patch: { title?: string; description?: string }, english = false) => {
    const base = english ? aboutEn : draft.about;
    const features = [...(base.features || [])];
    features[index] = { ...(features[index] || {}), ...patch };
    if (english) updateAbout({ translations: { en: { ...aboutEn, features } } });
    else updateAbout({ features });
  };

  const updateRnd = (patch: Partial<RndPageCms>) => {
    setDraft((previous) => ({ ...previous, rnd: { ...previous.rnd, ...patch } }));
  };

  const save = (event: React.FormEvent) => {
    event.preventDefault();
    updatePageContent(draft);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2500);
  };

  return (
    <form onSubmit={save} className="space-y-6 pb-16">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-3xl sticky top-0 z-20">
        <div>
          <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2"><FileText className="w-5 h-5 text-amber-400" />محتوای صفحات ثابت</h2>
          <p className="text-xs text-slate-400 mt-1">متن هر صفحه، جدا از چیدمان آن مدیریت می‌شود؛ بنابراین مسیرها و ظاهر فعلی سایت دست‌نخورده می‌مانند.</p>
        </div>
        <button className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black px-5 py-2.5 rounded-xl text-xs inline-flex items-center justify-center gap-2"><Save className="w-4 h-4" />ذخیره و انتشار</button>
      </header>

      {saved && <div className="rounded-2xl p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-200 text-xs flex items-center gap-2"><CheckCircle2 className="w-4 h-4" />محتوای صفحه ذخیره و برای بازدیدکنندگان منتشر شد.</div>}

      <section className="bg-slate-900 border border-slate-800 rounded-3xl p-5">
        <div className="flex flex-wrap gap-2">
          {PAGE_OPTIONS.map((page) => (
            <button
              key={page.key}
              type="button"
              onClick={() => setActivePage(page.key)}
              className={'px-3 py-2 rounded-xl text-xs font-bold transition-colors ' + (activePage === page.key ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-slate-300 hover:bg-slate-700')}
            >
              {page.label}
            </button>
          ))}
        </div>
      </section>

      <section className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-5">
        <div>
          <h3 className="text-sm font-black text-white">{PAGE_OPTIONS.find((item) => item.key === activePage)?.label} — هیرو صفحه</h3>
          <p className="text-[11px] text-slate-500 mt-1">{PAGE_OPTIONS.find((item) => item.key === activePage)?.description}</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="space-y-3">
            <p className="text-xs font-bold text-amber-300">فارسی</p>
            <label className="block text-xs text-slate-300">تیتر اصلی<input value={activeHero.title || ''} onChange={(event) => updateHero({ title: event.target.value })} className={fieldClass} /></label>
            <label className="block text-xs text-slate-300">عنوانک بالای تیتر<input value={activeHero.eyebrow || ''} onChange={(event) => updateHero({ eyebrow: event.target.value })} className={fieldClass} /></label>
            <label className="block text-xs text-slate-300">زیرتیتر<textarea rows={3} value={activeHero.subtitle || ''} onChange={(event) => updateHero({ subtitle: event.target.value })} className={fieldClass} /></label>
            <label className="block text-xs text-slate-300">متن دکمه اصلی<input value={activeHero.ctaLabel || ''} onChange={(event) => updateHero({ ctaLabel: event.target.value })} className={fieldClass} /></label>
            <label className="block text-xs text-slate-300">متن دکمه دوم<input value={activeHero.secondaryCtaLabel || ''} onChange={(event) => updateHero({ secondaryCtaLabel: event.target.value })} className={fieldClass} /></label>
          </div>
          <div className="space-y-3" dir="ltr">
            <p className="text-xs font-bold text-blue-300">English</p>
            <label className="block text-xs text-slate-300">Page title<input value={activeHeroEn.title || ''} onChange={(event) => updateHeroEnglish({ title: event.target.value })} className={fieldClass} /></label>
            <label className="block text-xs text-slate-300">Eyebrow<input value={activeHeroEn.eyebrow || ''} onChange={(event) => updateHeroEnglish({ eyebrow: event.target.value })} className={fieldClass} /></label>
            <label className="block text-xs text-slate-300">Subtitle<textarea rows={3} value={activeHeroEn.subtitle || ''} onChange={(event) => updateHeroEnglish({ subtitle: event.target.value })} className={fieldClass} /></label>
            <label className="block text-xs text-slate-300">Primary button<input value={activeHeroEn.ctaLabel || ''} onChange={(event) => updateHeroEnglish({ ctaLabel: event.target.value })} className={fieldClass} /></label>
            <label className="block text-xs text-slate-300">Secondary button<input value={activeHeroEn.secondaryCtaLabel || ''} onChange={(event) => updateHeroEnglish({ secondaryCtaLabel: event.target.value })} className={fieldClass} /></label>
          </div>
        </div>
      </section>

      {activePage === 'about' && (
        <section className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-5">
          <div><h3 className="text-sm font-black text-white">بخش معرفی صفحه درباره شرکت</h3><p className="text-[11px] text-slate-500 mt-1">تصویر، متن معرفی و سه مزیت پایین آن قابل ویرایش‌اند.</p></div>
          <ImagePicker label="تصویر معرفی" value={draft.about.image || ''} onChange={(image) => updateAbout({ image })} />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="space-y-3">
              <p className="text-xs font-bold text-amber-300">فارسی</p>
              <label className="block text-xs text-slate-300">تیتر معرفی<input value={draft.about.heading || ''} onChange={(event) => updateAbout({ heading: event.target.value })} className={fieldClass} /></label>
              <label className="block text-xs text-slate-300">متن معرفی<textarea rows={5} value={draft.about.intro || ''} onChange={(event) => updateAbout({ intro: event.target.value })} className={fieldClass} /></label>
              {[0, 1, 2].map((index) => (
                <div key={index} className="rounded-2xl border border-slate-800 bg-slate-950/50 p-3 space-y-2">
                  <p className="text-[11px] text-slate-500">مزیت {index + 1}</p>
                  <input value={draft.about.features?.[index]?.title || ''} onChange={(event) => updateAboutFeature(index, { title: event.target.value })} placeholder="عنوان" className={compactFieldClass} />
                  <textarea rows={2} value={draft.about.features?.[index]?.description || ''} onChange={(event) => updateAboutFeature(index, { description: event.target.value })} placeholder="توضیح" className={compactFieldClass} />
                </div>
              ))}
            </div>
            <div className="space-y-3" dir="ltr">
              <p className="text-xs font-bold text-blue-300">English</p>
              <label className="block text-xs text-slate-300">Introduction title<input value={aboutEn.heading || ''} onChange={(event) => updateAbout({ translations: { en: { ...aboutEn, heading: event.target.value } } })} className={fieldClass} /></label>
              <label className="block text-xs text-slate-300">Introduction text<textarea rows={5} value={aboutEn.intro || ''} onChange={(event) => updateAbout({ translations: { en: { ...aboutEn, intro: event.target.value } } })} className={fieldClass} /></label>
              {[0, 1, 2].map((index) => (
                <div key={index} className="rounded-2xl border border-slate-800 bg-slate-950/50 p-3 space-y-2">
                  <p className="text-[11px] text-slate-500">Feature {index + 1}</p>
                  <input value={aboutEn.features?.[index]?.title || ''} onChange={(event) => updateAboutFeature(index, { title: event.target.value }, true)} placeholder="Title" className={compactFieldClass} />
                  <textarea rows={2} value={aboutEn.features?.[index]?.description || ''} onChange={(event) => updateAboutFeature(index, { description: event.target.value }, true)} placeholder="Description" className={compactFieldClass} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {activePage === 'rnd' && (
        <section className="bg-slate-900 border border-slate-800 rounded-3xl p-5 grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="space-y-3">
            <p className="text-xs font-bold text-amber-300">متن فارسی بخش در حال آماده‌سازی</p>
            <label className="block text-xs text-slate-300">عنوان<input value={draft.rnd.title || ''} onChange={(event) => updateRnd({ title: event.target.value })} className={fieldClass} /></label>
            <label className="block text-xs text-slate-300">توضیح<textarea rows={4} value={draft.rnd.description || ''} onChange={(event) => updateRnd({ description: event.target.value })} className={fieldClass} /></label>
          </div>
          <div className="space-y-3" dir="ltr">
            <p className="text-xs font-bold text-blue-300">English coming-soon content</p>
            <label className="block text-xs text-slate-300">Title<input value={rndEn.title || ''} onChange={(event) => updateRnd({ translations: { en: { ...rndEn, title: event.target.value } } })} className={fieldClass} /></label>
            <label className="block text-xs text-slate-300">Description<textarea rows={4} value={rndEn.description || ''} onChange={(event) => updateRnd({ translations: { en: { ...rndEn, description: event.target.value } } })} className={fieldClass} /></label>
          </div>
        </section>
      )}
    </form>
  );
};
