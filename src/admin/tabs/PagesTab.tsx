import React, { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, FileText, Save } from '../../icons';
import { useData } from '../../context/DataContext';
import type { AboutPageCms, CmsPageKey, PageHeroCms, PagesCms } from '../../types';
import { ImagePicker } from '../components/ImagePicker';
import { PAGE_HEROES } from '../../data/pageHeroes';
import { ABOUT_ACTIVITIES, ABOUT_INTRO_HEADING, ABOUT_INTRO_PARAGRAPHS } from '../../data/aboutCopy';
import { EN_DICT } from '../../i18n/enDict';
import { hasPersian } from '../../i18n';

const en = (fa?: string) => fa ? EN_DICT[fa] || '' : '';
const containsPersian = (value: unknown): boolean => typeof value === 'string' ? hasPersian(value) : Array.isArray(value) ? value.some(containsPersian) : Boolean(value && typeof value === 'object' && Object.values(value).some(containsPersian));
const PAGE_PATH: Record<CmsPageKey, string> = { services: '/services', magazine: '/magazine', about: '/about', contact: '/contact' };
// Defaults = the approved /about copy (src/data/aboutCopy.ts). Empty CMS fields fall back to these.
const ABOUT_FEATURES = ABOUT_ACTIVITIES;
const ABOUT_HEADING = ABOUT_INTRO_HEADING;
const ABOUT_INTRO = ABOUT_INTRO_PARAGRAPHS.join('\n\n');
const PAGE_OPTIONS: { key: CmsPageKey; label: string; description: string }[] = [
  { key: 'services', label: 'صفحه خدمات', description: 'تیتر، زیرتیتر و دعوت به اقدام بالای صفحه خدمات' },
  { key: 'magazine', label: 'صفحه مجله', description: 'تیتر و متن معرفی بالای فهرست مقالات' },
  { key: 'about', label: 'صفحه درباره شرکت', description: 'هیرو و متن‌های معرفی شرکت' },
  { key: 'contact', label: 'صفحه تماس', description: 'هیرو بالای فرم تماس و مشاوره' },
];

const fieldClass = 'mt-1.5 w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:border-amber-400';
const compactFieldClass = fieldClass.replace('mt-1.5 ', '');

export const PagesTab: React.FC = () => {
  const { pageContent, updatePageContent } = useData();
  const [draft, setDraft] = useState<PagesCms>(pageContent);
  const [activePage, setActivePage] = useState<CmsPageKey>('about');
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  useEffect(() => { setDraft(pageContent); }, [pageContent]);

  const activeHero = useMemo(() => draft.heroes[activePage] || {}, [draft.heroes, activePage]);
  const baseHero = PAGE_HEROES[PAGE_PATH[activePage]];
  const activeHeroEn = (activeHero.translations?.en || {}) as Partial<Omit<PageHeroCms, 'translations'>>;
  const aboutEn = (draft.about.translations?.en || {}) as Partial<Omit<AboutPageCms, 'translations'>>;

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

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setSaved(false);
    setSaveError('');
    if (Object.values(draft.heroes as Record<string, PageHeroCms>).some((hero) => containsPersian(hero?.translations?.en)) || containsPersian(draft.about.translations?.en) || containsPersian(draft.rnd.translations?.en)) {
      setSaveError('فیلدهای نسخهٔ انگلیسی نباید متن فارسی داشته باشند.');
      setSaving(false);
      return;
    }
    try {
      await updatePageContent(draft);
      setSaved(true);
      window.setTimeout(() => setSaved(false), 2500);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'ذخیره انجام نشد. دوباره تلاش کنید.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={save} className="space-y-6 pb-16">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-3xl sticky top-0 z-20">
        <div>
          <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2"><FileText className="w-5 h-5 text-amber-400" />محتوای صفحات ثابت</h2>
          <p className="text-xs text-slate-400 mt-1">متن هر صفحه، جدا از چیدمان آن مدیریت می‌شود؛ بنابراین مسیرها و ظاهر فعلی سایت دست‌نخورده می‌مانند.</p>
        </div>
        <button disabled={saving} className="bg-amber-400 hover:bg-amber-300 disabled:opacity-60 text-slate-950 font-black px-5 py-2.5 rounded-xl text-xs inline-flex items-center justify-center gap-2"><Save className="w-4 h-4" />{saving ? 'در حال ذخیره…' : 'ذخیره و انتشار'}</button>
      </header>

      {saved && <div className="rounded-2xl p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-200 text-xs flex items-center gap-2"><CheckCircle2 className="w-4 h-4" />محتوای صفحه ذخیره و برای بازدیدکنندگان منتشر شد.</div>}
      {saveError && <div role="alert" className="rounded-2xl p-3 bg-rose-500/10 border border-rose-500/30 text-rose-200 text-xs">{saveError}</div>}

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
            <label className="block text-xs text-slate-300">تیتر اصلی<input value={activeHero.title ?? baseHero.title} onChange={(event) => updateHero({ title: event.target.value })} className={fieldClass} /></label>
            <label className="block text-xs text-slate-300">عنوانک بالای تیتر<input value={activeHero.eyebrow ?? baseHero.eyebrow ?? ''} onChange={(event) => updateHero({ eyebrow: event.target.value })} className={fieldClass} /></label>
            <label className="block text-xs text-slate-300">زیرتیتر<textarea rows={3} value={activeHero.subtitle ?? baseHero.subtitle} onChange={(event) => updateHero({ subtitle: event.target.value })} className={fieldClass} /></label>
            <label className="block text-xs text-slate-300">متن دکمه اصلی<input value={activeHero.ctaLabel ?? baseHero.cta?.label ?? ''} onChange={(event) => updateHero({ ctaLabel: event.target.value })} className={fieldClass} /></label>
            <label className="block text-xs text-slate-300">متن دکمه دوم<input value={activeHero.secondaryCtaLabel ?? baseHero.secondaryCta?.label ?? ''} onChange={(event) => updateHero({ secondaryCtaLabel: event.target.value })} className={fieldClass} /></label>
          </div>
          <div className="space-y-3" dir="ltr">
            <p className="text-xs font-bold text-blue-300">English</p>
            <label className="block text-xs text-slate-300">Page title<input value={activeHeroEn.title ?? en(baseHero.title)} onChange={(event) => updateHeroEnglish({ title: event.target.value })} className={fieldClass} /></label>
            <label className="block text-xs text-slate-300">Eyebrow<input value={activeHeroEn.eyebrow ?? en(baseHero.eyebrow)} onChange={(event) => updateHeroEnglish({ eyebrow: event.target.value })} className={fieldClass} /></label>
            <label className="block text-xs text-slate-300">Subtitle<textarea rows={3} value={activeHeroEn.subtitle ?? en(baseHero.subtitle)} onChange={(event) => updateHeroEnglish({ subtitle: event.target.value })} className={fieldClass} /></label>
            <label className="block text-xs text-slate-300">Primary button<input value={activeHeroEn.ctaLabel ?? en(baseHero.cta?.label)} onChange={(event) => updateHeroEnglish({ ctaLabel: event.target.value })} className={fieldClass} /></label>
            <label className="block text-xs text-slate-300">Secondary button<input value={activeHeroEn.secondaryCtaLabel ?? en(baseHero.secondaryCta?.label)} onChange={(event) => updateHeroEnglish({ secondaryCtaLabel: event.target.value })} className={fieldClass} /></label>
          </div>
        </div>
      </section>

      {activePage === 'about' && (
        <section className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-5">
          <div><h3 className="text-sm font-black text-white">بخش معرفی صفحه درباره شرکت</h3><p className="text-[11px] text-slate-500 mt-1">تصویر، متن معرفی (پاراگراف‌ها با یک خط خالی جدا می‌شوند) و شش حوزهٔ فعالیت قابل ویرایش‌اند.</p></div>
          <ImagePicker label="تصویر معرفی" value={draft.about.image || ''} onChange={(image) => updateAbout({ image })} />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="space-y-3">
              <p className="text-xs font-bold text-amber-300">فارسی</p>
              <label className="block text-xs text-slate-300">تیتر معرفی<input value={draft.about.heading ?? ABOUT_HEADING} onChange={(event) => updateAbout({ heading: event.target.value })} className={fieldClass} /></label>
              <label className="block text-xs text-slate-300">متن معرفی<textarea rows={5} value={draft.about.intro ?? ABOUT_INTRO} onChange={(event) => updateAbout({ intro: event.target.value })} className={fieldClass} /></label>
              {ABOUT_FEATURES.map((_, index) => (
                <div key={index} className="rounded-2xl border border-slate-800 bg-slate-950/50 p-3 space-y-2">
                  <p className="text-[11px] text-slate-500">حوزهٔ فعالیت {index + 1}</p>
                  <input value={draft.about.features?.[index]?.title ?? ABOUT_FEATURES[index][0]} onChange={(event) => updateAboutFeature(index, { title: event.target.value })} placeholder="عنوان" className={compactFieldClass} />
                  <textarea rows={2} value={draft.about.features?.[index]?.description ?? ABOUT_FEATURES[index][1]} onChange={(event) => updateAboutFeature(index, { description: event.target.value })} placeholder="توضیح" className={compactFieldClass} />
                </div>
              ))}
            </div>
            <div className="space-y-3" dir="ltr">
              <p className="text-xs font-bold text-blue-300">English</p>
              <label className="block text-xs text-slate-300">Introduction title<input value={aboutEn.heading ?? en(ABOUT_HEADING)} onChange={(event) => updateAbout({ translations: { en: { ...aboutEn, heading: event.target.value } } })} className={fieldClass} /></label>
              <label className="block text-xs text-slate-300">Introduction text<textarea rows={5} value={aboutEn.intro ?? ABOUT_INTRO_PARAGRAPHS.map((paragraph) => en(paragraph)).join('\n\n')} onChange={(event) => updateAbout({ translations: { en: { ...aboutEn, intro: event.target.value } } })} className={fieldClass} /></label>
              {ABOUT_FEATURES.map((_, index) => (
                <div key={index} className="rounded-2xl border border-slate-800 bg-slate-950/50 p-3 space-y-2">
                  <p className="text-[11px] text-slate-500">Area of activity {index + 1}</p>
                  <input value={aboutEn.features?.[index]?.title ?? en(ABOUT_FEATURES[index][0])} onChange={(event) => updateAboutFeature(index, { title: event.target.value }, true)} placeholder="Title" className={compactFieldClass} />
                  <textarea rows={2} value={aboutEn.features?.[index]?.description ?? en(ABOUT_FEATURES[index][1])} onChange={(event) => updateAboutFeature(index, { description: event.target.value }, true)} placeholder="Description" className={compactFieldClass} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </form>
  );
};
