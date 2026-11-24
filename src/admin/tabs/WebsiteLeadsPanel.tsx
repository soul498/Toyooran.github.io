import React, { useEffect, useState } from 'react';
import { Globe2 as Globe, Phone, RefreshCw } from '../../icons';

/** One row of /opt/toyooran-data/qualified-leads.jsonl, as returned by GET /api/admin/leads. */
interface WebsiteLead {
  id?: string;
  createdAt?: string;
  fullName?: string;
  phoneNumber?: string;
  companyName?: string;
  email?: string;
  subject?: string;
  productName?: string;
  location?: string;
  country?: string;
  province?: string;
  city?: string;
  capacity?: string;
  timing?: string;
  isDecisionMaker?: boolean;
  message?: string;
  lang?: string;
  pagePath?: string;
}

const LANG_LABEL: Record<string, string> = { fa: 'فارسی', en: 'انگلیسی', tr: 'ترکی', ar: 'عربی', ru: 'روسی' };

function langOf(lead: WebsiteLead): string {
  if (lead.lang) return lead.lang;
  const m = /^\/(en|tr|ar|ru)(\/|$)/.exec(lead.pagePath || '');
  return m ? m[1] : 'fa';
}

function when(iso?: string): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return `${d.toLocaleDateString('fa-IR', { timeZone: 'Asia/Tehran' })} - ${d.toLocaleTimeString('fa-IR', { timeZone: 'Asia/Tehran', hour: '2-digit', minute: '2-digit' })}`;
}

const Field: React.FC<{ label: string; value?: string; ltr?: boolean }> = ({ label, value, ltr }) =>
  value ? (
    <div className="text-[11px] leading-6">
      <span className="text-slate-500">{label}: </span>
      <span className="text-slate-200 font-bold" dir={ltr ? 'ltr' : undefined}>{value}</span>
    </div>
  ) : null;

/** Website contact-form submissions (all languages), read-only, straight from the server log. */
export const WebsiteLeadsPanel: React.FC = () => {
  const [leads, setLeads] = useState<WebsiteLead[] | null>(null);
  const [error, setError] = useState('');
  const [open, setOpen] = useState<string | null>(null);

  const load = async () => {
    setError('');
    try {
      const res = await fetch('/api/admin/leads', { credentials: 'include' });
      if (!res.ok) throw new Error(String(res.status));
      const data = await res.json();
      setLeads(Array.isArray(data.leads) ? data.leads : []);
    } catch {
      setError('دریافت فرم‌های سایت انجام نشد.');
      setLeads([]);
    }
  };
  useEffect(() => { void load(); }, []);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
            <Globe className="w-4 h-4 text-amber-400" />
            <span>فرم‌های تماس سایت (همهٔ زبان‌ها){leads ? ` (${leads.length.toLocaleString('fa-IR')})` : ''}</span>
          </h3>
          <p className="text-[11px] text-slate-400 mt-1">هر فرمی که مشتری در سایت پر کرده، با کشور، استان، شهر، ایمیل و شرکت (در فرم‌های غیرفارسی).</p>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => void load()} className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl px-3 py-2 flex items-center gap-1.5">
            <RefreshCw className="w-3.5 h-3.5" /> به‌روزرسانی
          </button>
          <a href="/api/admin/leads.csv" className="text-xs bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 rounded-xl px-3 py-2">دریافت CSV</a>
        </div>
      </div>
      {error ? <p className="text-xs text-rose-400">{error}</p> : null}
      {leads === null ? (
        <p className="text-xs text-slate-500">در حال بارگذاری…</p>
      ) : leads.length === 0 ? (
        <p className="text-xs text-slate-500">هنوز فرمی ثبت نشده است.</p>
      ) : (
        <div className="divide-y divide-slate-800/80 max-h-[32rem] overflow-y-auto">
          {leads.map((lead, i) => {
            const key = lead.id || String(i);
            const lang = langOf(lead);
            const place = [lead.city, lead.province, lead.country].filter(Boolean).join('، ') || lead.location || '—';
            const expanded = open === key;
            return (
              <div key={key} className="py-3">
                <button type="button" onClick={() => setOpen(expanded ? null : key)} className="w-full text-right grid grid-cols-2 sm:grid-cols-5 gap-2 items-center text-xs">
                  <span className="font-bold text-white truncate">{lead.fullName || '—'}</span>
                  <span className="font-mono text-amber-400 font-bold flex items-center gap-1" dir="ltr"><Phone className="w-3 h-3" />{lead.phoneNumber || '—'}</span>
                  <span className="text-slate-300 truncate">{place}</span>
                  <span className="text-slate-400"><span className={`px-2 py-0.5 rounded-full border text-[10px] ${lang === 'fa' ? 'border-slate-700 text-slate-400' : 'border-sky-500/40 text-sky-300'}`}>{LANG_LABEL[lang] || lang}</span></span>
                  <span className="text-slate-500 font-mono text-[11px]">{when(lead.createdAt)}</span>
                </button>
                {expanded ? (
                  <div className="mt-3 bg-slate-950/60 rounded-2xl p-4 grid sm:grid-cols-2 gap-x-6">
                    <Field label="کشور" value={lead.country} />
                    <Field label="استان / ایالت" value={lead.province} />
                    <Field label="شهر" value={lead.city} />
                    <Field label="محل (فرم فارسی)" value={!lead.country ? lead.location : undefined} />
                    <Field label="ایمیل" value={lead.email} ltr />
                    <Field label="شرکت" value={lead.companyName} />
                    <Field label="موضوع" value={lead.subject} />
                    <Field label="محصول" value={lead.productName} />
                    <Field label="ظرفیت" value={lead.capacity} />
                    <Field label="زمان تصمیم" value={lead.timing} />
                    <Field label="تصمیم‌گیرنده خرید" value={lead.isDecisionMaker ? 'بله' : undefined} />
                    <Field label="صفحه" value={lead.pagePath} ltr />
                    {lead.message ? <p className="sm:col-span-2 mt-2 text-xs text-slate-300 whitespace-pre-wrap leading-6">{lead.message}</p> : null}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
