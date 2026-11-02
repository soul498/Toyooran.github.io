import React, { useEffect, useState } from 'react';
import { CheckCircle2, LayoutDashboard, Save } from '../../icons';
import type { SiteLayoutConfig } from '../../types';
import { useData } from '../../context/DataContext';
import { ImagePicker } from '../components/ImagePicker';

const HOME_SECTIONS: { key: keyof SiteLayoutConfig['home']; title: string; description: string }[] = [
  { key: 'hero', title: 'هیرو اصلی', description: 'بنر و دعوت به اقدام ابتدای صفحه اصلی' },
  { key: 'productBands', title: 'نوارهای محصولات', description: 'بلوک محصولات منتخب پیش از خدمات' },
  { key: 'showcase', title: 'ویترین فشرده', description: 'نمایش مجموعه و محصولات در صفحه اصلی' },
  { key: 'aboutContact', title: 'معرفی و تماس', description: 'بلوک معرفی شرکت و مسیرهای تماس' },
];

export const LayoutTab: React.FC = () => {
  const { siteLayout, updateSiteLayout } = useData();
  const [draft, setDraft] = useState<SiteLayoutConfig>(siteLayout);
  const [saved, setSaved] = useState(false);

  useEffect(() => { setDraft(siteLayout); }, [siteLayout]);

  const save = (event: React.FormEvent) => {
    event.preventDefault();
    updateSiteLayout(draft);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2500);
  };

  return (
    <form onSubmit={save} className="space-y-6 pb-16">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-3xl sticky top-0 z-20">
        <div>
          <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2"><LayoutDashboard className="w-5 h-5 text-amber-400" />هدر، فوتر و نمایش سکشن‌ها</h2>
          <p className="text-xs text-slate-400 mt-1">هر گزینه فقط نمایش همان بخش را کنترل می‌کند؛ ساختار و مسیرهای سایت تغییر نمی‌کنند.</p>
        </div>
        <button className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black px-5 py-2.5 rounded-xl text-xs inline-flex items-center justify-center gap-2"><Save className="w-4 h-4" />ذخیره و انتشار</button>
      </header>

      {saved && <div className="rounded-2xl p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-200 text-xs flex items-center gap-2"><CheckCircle2 className="w-4 h-4" />تنظیمات نمایش با موفقیت منتشر شد.</div>}

      <section className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div><h3 className="text-sm font-black text-white">هدر سایت</h3><p className="text-[11px] text-slate-500 mt-1">لوگو و نام برند در هر دو زبان قابل مدیریت است.</p></div>
          <label className="flex items-center gap-2 text-xs text-slate-200"><input type="checkbox" checked={draft.header.visible} onChange={(event) => setDraft({ ...draft, header: { ...draft.header, visible: event.target.checked } })} /> نمایش هدر</label>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ImagePicker label="لوگوی هدر" value={draft.header.logoUrl || ''} onChange={(logoUrl) => setDraft({ ...draft, header: { ...draft.header, logoUrl } })} />
          <div className="space-y-3">
            <label className="block text-xs text-slate-300">نام برند فارسی<input value={draft.header.brandFa || ''} onChange={(event) => setDraft({ ...draft, header: { ...draft.header, brandFa: event.target.value } })} className="mt-1.5 w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white" /></label>
            <label className="block text-xs text-slate-300">نام برند انگلیسی<input dir="ltr" value={draft.header.brandEn || ''} onChange={(event) => setDraft({ ...draft, header: { ...draft.header, brandEn: event.target.value } })} className="mt-1.5 w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white" /></label>
          </div>
        </div>
      </section>

      <section className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div><h3 className="text-sm font-black text-white">فوتر سایت</h3><p className="text-[11px] text-slate-500 mt-1">اطلاعات تماس و شبکه‌های اجتماعی از «اطلاعات شرکت» مدیریت می‌شوند.</p></div>
          <label className="flex items-center gap-2 text-xs text-slate-200"><input type="checkbox" checked={draft.footer.visible} onChange={(event) => setDraft({ ...draft, footer: { ...draft.footer, visible: event.target.checked } })} /> نمایش فوتر</label>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ImagePicker label="لوگوی فوتر" value={draft.footer.logoUrl || ''} onChange={(logoUrl) => setDraft({ ...draft, footer: { ...draft.footer, logoUrl } })} />
          <div className="space-y-3">
            <label className="block text-xs text-slate-300">متن معرفی فارسی<input value={draft.footer.aboutFa || ''} onChange={(event) => setDraft({ ...draft, footer: { ...draft.footer, aboutFa: event.target.value } })} className="mt-1.5 w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white" /></label>
            <label className="block text-xs text-slate-300">متن معرفی انگلیسی<input dir="ltr" value={draft.footer.aboutEn || ''} onChange={(event) => setDraft({ ...draft, footer: { ...draft.footer, aboutEn: event.target.value } })} className="mt-1.5 w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white" /></label>
          </div>
        </div>
      </section>

      <section className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-3">
        <div className="border-b border-slate-800 pb-3"><h3 className="text-sm font-black text-white">سکشن‌های صفحه اصلی</h3><p className="text-[11px] text-slate-500 mt-1">خاموش‌کردن هر مورد فقط آن را از صفحه اصلی پنهان می‌کند.</p></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {HOME_SECTIONS.map((section) => <label key={section.key} className="flex items-start gap-3 rounded-2xl border border-slate-800 bg-slate-950/50 p-4 cursor-pointer">
            <input className="mt-1" type="checkbox" checked={draft.home[section.key]} onChange={(event) => setDraft({ ...draft, home: { ...draft.home, [section.key]: event.target.checked } })} />
            <span><strong className="block text-xs text-slate-200">{section.title}</strong><span className="block text-[11px] text-slate-500 mt-1">{section.description}</span></span>
          </label>)}
        </div>
      </section>
    </form>
  );
};
