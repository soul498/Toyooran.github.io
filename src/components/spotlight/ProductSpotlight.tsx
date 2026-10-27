import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Thermometer, Wheat, Phone, ShieldCheck, Wind, Zap, Image as ImageIcon, ChevronLeft, ArrowLeft } from '../../icons';

/**
 * DESIGN ÉTUDES (throwaway branch, not for main): product spotlight for
 * «دانخوری پروانه‌ای پویا» and «جت هیتر ۱۰۰ هزار». Real specs come from the site data
 * (magazine article introduction-to-pouya-butterfly-feeder, service srv-poultry-equipment-supply,
 * products ts-043/044/045). Anything missing is a bracketed «— تکمیل شود» placeholder.
 * Variant via #etude=A|B|C ; &ph=1 swaps photos for the labelled placeholder box.
 */

type Spec = { label: string; value: string; todo?: boolean };
type Spot = {
  key: 'feeder' | 'heater';
  name: string;
  tab: string;
  kicker: string;
  pitch: string;
  image: string;
  imageAlt: string;
  specs: Spec[];
  specsHref: string;
  icon: React.ElementType;
};

const FEEDER: Spot = {
  key: 'feeder',
  name: 'دانخوری پروانه‌ای پویا',
  tab: 'دانخوری پروانه‌ای',
  kicker: 'تولید طیوران صنعت پویا',
  pitch:
    'لبه‌های «پروانه‌ای» به جوجهٔ یک‌روزه اجازه می‌دهد بدون ورود به بشقاب دان تمیز بردارد؛ سینی دستی هفتهٔ اول حذف می‌شود و لبهٔ دوبل ضدپاشش با بزرگ‌شدن پرنده وارد عمل می‌شود.',
  image: '/images/article_feeder_1787988014850.jpg',
  imageAlt: 'بشقاب دانخوری پروانه‌ای پویا در سالن مرغداری با جوجه‌های یک‌روزه',
  specs: [
    { label: 'شروع تغذیه', value: 'از روز اول، بدون سینی دان' },
    { label: 'لبه', value: 'دوبل و ضدپاشش (Anti-spill)' },
    { label: 'متریال', value: 'پلی‌پروپیلن نو (Virgin) گرید بهداشتی' },
    { label: 'مقاومت', value: 'اشعهٔ UV، شستشو و ضدعفونی‌کننده' },
    { label: 'تنظیم سطح دان', value: 'متناسب با سن گله' },
    { label: 'قطر بشقاب', value: '[قطر — تکمیل شود]', todo: true },
    { label: 'ظرفیت', value: '[قطعه در هر بشقاب — تکمیل شود]', todo: true },
  ],
  specsHref: '/magazine/introduction-to-pouya-butterfly-feeder',
  icon: Wheat,
};

const HEATER_MODELS = [
  { id: 'GE-100', fuel: 'گاز طبیعی', note: 'شیر برقی استاندارد و کنترل با ترموستات محیطی', href: '/products/جت-هیتر-گازی-100-هزار-مدل-GE-100-ts-044' },
  { id: 'GLE-100', fuel: 'گازوئیل', note: 'قابلیت نصب آویز و پایه', href: '/products/جت-هیتر-100-هزار-گازوئیلی-GLE-100-ts-043' },
  { id: 'GLD-100', fuel: 'گاز / گازوئیل', note: 'دوگانه‌سوز با تابلو برق ضدآب تمام‌خودکار', href: '/products/جت-هیتر-دوگانه-سوز-100-هزار-مدلGLD-100-ts-045' },
];

const HEATER: Spot = {
  key: 'heater',
  name: 'جت هیتر ۱۰۰ هزار',
  tab: 'جت هیتر ۱۰۰',
  kicker: 'گرمایش سالن مرغداری',
  pitch:
    'جت هیتر ۱۰۰ هزار کیلوکالری در سه نسخهٔ گازی، گازوئیلی و دوگانه‌سوز؛ هوادهی ۷٬۰۰۰ مترمکعب و پرتاب هوای گرم تا ۲۰ متر برای گرمایش یکنواخت سالن.',
  image: '/images/products/TS-045.webp',
  imageAlt: 'جت هیتر دوگانه‌سوز ۱۰۰ هزار مدل GLD-100',
  specs: [
    { label: 'ظرفیت حرارتی', value: '۱۰۰٬۰۰۰ کیلوکالری بر ساعت' },
    { label: 'هوادهی', value: '۷٬۰۰۰ مترمکعب بر ساعت' },
    { label: 'پرتاب هوای گرم', value: 'تا ۲۰ متر' },
    { label: 'سوخت', value: 'گاز / گازوئیل / دوگانه‌سوز' },
    { label: 'مصرف سوخت', value: '[مصرف — تکمیل شود]', todo: true },
    { label: 'توان الکتروموتور', value: '[برق مصرفی — تکمیل شود]', todo: true },
  ],
  specsHref: '/products/heating',
  icon: Thermometer,
};

const SPOTS = [FEEDER, HEATER];
const CONSULT = 'مشاورهٔ رایگان و استعلام قیمت';
const SECTION_TITLE = 'محصولات شاخص طیوران صنعت پویا';

const usePlaceholder = () =>
  typeof window !== 'undefined' && new URLSearchParams(window.location.hash.slice(1)).get('ph') === '1';

/** Fixed-ratio image slot: real photo (lazy) or a clearly labelled placeholder. */
const ImageSlot: React.FC<{ spot: Spot; dark?: boolean; className?: string; ratio?: string }> = ({ spot, dark, className = '', ratio = 'aspect-[4/3]' }) => {
  const ph = usePlaceholder();
  return (
    <div className={`relative ${ratio} w-full overflow-hidden ${className}`}>
      {ph ? (
        <div
          className={`absolute inset-0 flex flex-col items-center justify-center gap-2 border-2 border-dashed ${
            dark ? 'border-white/25 bg-white/5 text-blue-100' : 'border-slate-300 bg-slate-50 text-slate-500'
          } rounded-[inherit]`}
        >
          <ImageIcon className="w-8 h-8 opacity-70" aria-hidden="true" />
          <span className="font-black text-sm">جای عکس محصول</span>
          <span className="text-xs opacity-70">{spot.name} — نسبت ۴:۳</span>
        </div>
      ) : (
        <img
          src={spot.image}
          alt={spot.imageAlt}
          loading="lazy"
          decoding="async"
          width={1200}
          height={900}
          className={`absolute inset-0 h-full w-full ${spot.key === 'heater' ? 'object-contain p-4 sm:p-6' : 'object-cover'}`}
        />
      )}
    </div>
  );
};

const Ctas: React.FC<{ spot: Spot; dark?: boolean; href?: string }> = ({ spot, dark, href }) => (
  <div className="flex flex-col sm:flex-row gap-3">
    <Link
      to={href || spot.specsHref}
      className={`inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-bold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500 ${
        dark ? 'bg-white/10 text-white border border-white/25 hover:bg-white/20' : 'bg-white text-[#003F86] border border-[#003F86]/25 hover:border-[#003F86]'
      }`}
    >
      مشاهده مشخصات
    </Link>
    <Link
      to="/contact"
      className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full bg-amber-400 px-6 py-3 text-sm font-black text-blue-950 shadow-lg shadow-amber-500/20 hover:bg-amber-300 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-900"
    >
      {CONSULT}
    </Link>
  </div>
);

const SectionHead: React.FC<{ dark?: boolean; sub: string }> = ({ dark, sub }) => (
  <div className="mb-6 sm:mb-8 text-center">
    <h2 className={`font-black text-2xl sm:text-3xl tracking-tight ${dark ? 'text-white' : 'text-slate-900'}`}>{SECTION_TITLE}</h2>
    <p className={`mt-2 text-sm sm:text-base font-medium ${dark ? 'text-blue-100/80' : 'text-slate-500'}`}>{sub}</p>
  </div>
);

/* ---------------- Étude A: split spotlight, alternating sides ---------------- */
const EtudeA: React.FC = () => (
  <section className="w-full">
    <SectionHead sub="دو محصول پرکاربرد برای دانخوری و گرمایش سالن مرغداری" />
    <div className="space-y-6 lg:space-y-8">
      {SPOTS.map((spot, i) => {
        const Icon = spot.icon;
        return (
          <article
            key={spot.key}
            className="spot-rise grid grid-cols-1 lg:grid-cols-2 overflow-hidden rounded-[2rem] bg-white border border-slate-100 shadow-xl shadow-slate-200/40"
          >
            <div className={`relative bg-gradient-to-br from-slate-50 to-blue-50 ${i % 2 ? 'lg:order-2' : ''}`}>
              <ImageSlot spot={spot} className="h-full lg:aspect-auto lg:min-h-[420px]" />
              <span className="absolute top-4 right-4 inline-flex items-center gap-1.5 rounded-full bg-[#003F86] px-3 py-1.5 text-xs font-bold text-white shadow">
                <Icon className="w-3.5 h-3.5 text-amber-400" aria-hidden="true" />
                {spot.kicker}
              </span>
            </div>
            <div className="p-6 sm:p-8 lg:p-10 flex flex-col justify-center">
              <h3 className="font-black text-2xl sm:text-3xl text-slate-900 tracking-tight">{spot.name}</h3>
              <span className="mt-3 h-[3px] w-14 rounded-full bg-amber-400" aria-hidden="true" />
              <p className="mt-4 text-slate-600 leading-relaxed font-medium">{spot.pitch}</p>
              <ul className="mt-6 flex flex-wrap gap-2">
                {spot.specs.map((s) => (
                  <li
                    key={s.label}
                    className={`rounded-full px-3.5 py-2 text-xs sm:text-[13px] font-bold border ${
                      s.todo ? 'border-dashed border-amber-400 bg-amber-50 text-amber-800' : 'border-blue-100 bg-blue-50/60 text-[#003F86]'
                    }`}
                  >
                    <span className="text-slate-500 font-medium">{s.label}: </span>
                    {s.value}
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <Ctas spot={spot} />
              </div>
            </div>
          </article>
        );
      })}
    </div>
  </section>
);

/* ---------------- Étude B: dark blueprint with annotated callouts ---------------- */
const CALLOUTS: Record<Spot['key'], { t: string; pos: string }[]> = {
  feeder: [
    { t: 'لبهٔ پروانه‌ای کوتاه برای جوجهٔ یک‌روزه', pos: 'top-[14%] right-[4%]' },
    { t: 'لبهٔ دوبل ضدپاشش', pos: 'top-[46%] left-[4%]' },
    { t: 'شبکهٔ مانع ورود پرنده به بشقاب', pos: 'bottom-[10%] right-[10%]' },
  ],
  heater: [
    { t: 'پرتاب هوای گرم تا ۲۰ متر', pos: 'top-[12%] left-[6%]' },
    { t: 'هوادهی ۷٬۰۰۰ m³/h', pos: 'bottom-[14%] left-[10%]' },
    { t: 'برد کنترل و تابلو برق', pos: 'top-[18%] right-[4%]' },
  ],
};

const EtudeB: React.FC = () => (
  <section className="spot-blueprint relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-blue-950 via-[#06245a] to-indigo-950 p-5 sm:p-8 lg:p-12 text-white">
    <SectionHead dark sub="مشخصات فنی واقعی؛ موارد خط‌چین در انتظار دیتاشیت" />
    <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
      {SPOTS.map((spot) => {
        const Icon = spot.icon;
        const real = spot.specs.filter((s) => !s.todo).slice(0, 4);
        const todo = spot.specs.filter((s) => s.todo);
        return (
          <article key={spot.key} className="rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-5 sm:p-6 flex flex-col">
            <div className="flex items-center gap-3">
              <span className="w-11 h-11 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center">
                <Icon className="w-5 h-5 text-amber-400" aria-hidden="true" />
              </span>
              <div>
                <p className="text-xs font-bold text-blue-200/80">{spot.kicker}</p>
                <h3 className="font-black text-xl sm:text-2xl tracking-tight">{spot.name}</h3>
              </div>
            </div>
            <div className="relative mt-5 rounded-[1.5rem] bg-[#001c3d]/70 border border-white/10">
              <ImageSlot spot={spot} dark className="rounded-[1.5rem]" />
              <ul className="hidden sm:block" aria-label={`نکات فنی ${spot.name}`}>
                {CALLOUTS[spot.key].map((c, n) => (
                  <li key={c.t} className={`absolute ${c.pos} flex items-center gap-2`}>
                    <span className="spot-ping relative flex h-6 w-6 items-center justify-center rounded-full bg-amber-400 text-[11px] font-black text-blue-950">
                      {(n + 1).toLocaleString('fa-IR')}
                    </span>
                    <span className="rounded-lg bg-blue-950/85 border border-white/15 px-2.5 py-1 text-[11px] font-bold text-white shadow-lg">{c.t}</span>
                  </li>
                ))}
              </ul>
            </div>
            <ol className="sm:hidden mt-4 space-y-2 text-sm">
              {CALLOUTS[spot.key].map((c, n) => (
                <li key={c.t} className="flex items-center gap-2">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-400 text-[11px] font-black text-blue-950">
                    {(n + 1).toLocaleString('fa-IR')}
                  </span>
                  <span className="text-blue-50 font-medium">{c.t}</span>
                </li>
              ))}
            </ol>
            <dl className="mt-5 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10">
              {real.map((s) => (
                <div key={s.label} className="bg-blue-950/80 p-3.5">
                  <dt className="text-[11px] font-bold text-blue-200/70">{s.label}</dt>
                  <dd className="mt-1 text-sm sm:text-[15px] font-black text-amber-300 leading-snug">{s.value}</dd>
                </div>
              ))}
              {todo.map((s) => (
                <div key={s.label} className="bg-blue-950/80 p-3.5 outline outline-1 outline-dashed outline-amber-400/50 -outline-offset-4">
                  <dt className="text-[11px] font-bold text-blue-200/70">{s.label}</dt>
                  <dd className="mt-1 text-xs font-bold text-amber-200/80">{s.value}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-auto pt-6">
              <Ctas spot={spot} dark />
            </div>
          </article>
        );
      })}
    </div>
    <a href="tel:09115116258" className="relative mt-6 flex items-center justify-center gap-2 text-sm font-bold text-blue-100 hover:text-amber-300 min-h-11">
      <Phone className="w-4 h-4 text-amber-400" aria-hidden="true" />
      <span>مشاورهٔ فنی تلفنی:</span>
      <span dir="ltr">۰۹۱۱ ۵۱۱ ۶۲۵۸</span>
    </a>
  </section>
);

/* ---------------- Étude C: switchable spotlight with fuel-model selector ---------------- */
const EtudeC: React.FC = () => {
  const [active, setActive] = useState<Spot['key']>('feeder');
  const [model, setModel] = useState(2);
  const spot = active === 'feeder' ? FEEDER : HEATER;
  const m = HEATER_MODELS[model];
  return (
    <section className="w-full">
      <div className="rounded-[2rem] bg-white border border-slate-100 shadow-xl shadow-slate-200/40 p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-6">
          <div>
            <h2 className="font-black text-2xl sm:text-3xl text-slate-900 tracking-tight">{SECTION_TITLE}</h2>
            <p className="mt-1 text-sm text-slate-500 font-bold">یک محصول را انتخاب کنید تا مشخصات آن نمایش داده شود</p>
          </div>
          <div role="tablist" aria-label="انتخاب محصول" className="grid grid-cols-2 gap-1 rounded-full bg-slate-100 p-1">
            {SPOTS.map((s) => {
              const Icon = s.icon;
              const on = s.key === active;
              return (
                <button
                  key={s.key}
                  type="button"
                  role="tab"
                  aria-selected={on}
                  onClick={() => setActive(s.key)}
                  className={`min-h-11 inline-flex items-center justify-center gap-2 rounded-full px-4 sm:px-6 text-sm font-black transition-colors ${
                    on ? 'bg-[#003F86] text-white shadow' : 'text-slate-600 hover:text-[#003F86]'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${on ? 'text-amber-400' : ''}`} aria-hidden="true" />
                  <span className="whitespace-nowrap">{s.tab}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div key={active} role="tabpanel" className="spot-fade grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-8 items-stretch">
          <div className="lg:col-span-7 relative overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-[#003F86] via-blue-900 to-indigo-950">
            {spot.key === 'heater' && <div className="spot-heat absolute inset-y-0 left-0 w-1/2 pointer-events-none" aria-hidden="true" />}
            <ImageSlot spot={spot} dark className={spot.key === 'feeder' ? 'opacity-95' : ''} />
            <div className="absolute bottom-0 inset-x-0 p-4 sm:p-5 bg-gradient-to-t from-blue-950/90 to-transparent">
              <p className="text-xs font-bold text-amber-300">{spot.kicker}</p>
              <h3 className="font-black text-xl sm:text-2xl text-white">{spot.name}{spot.key === 'heater' ? ` — ${m.id}` : ''}</h3>
            </div>
          </div>

          <div className="lg:col-span-5 flex flex-col">
            <p className="text-slate-600 leading-relaxed font-medium">{spot.pitch}</p>

            {spot.key === 'heater' && (
              <div className="mt-5">
                <p className="text-xs font-black text-slate-500 mb-2">نوع سوخت</p>
                <div className="grid grid-cols-3 gap-2">
                  {HEATER_MODELS.map((hm, i) => (
                    <button
                      key={hm.id}
                      type="button"
                      aria-pressed={i === model}
                      onClick={() => setModel(i)}
                      className={`min-h-11 rounded-2xl border px-2 py-2 text-center transition-colors ${
                        i === model ? 'border-[#003F86] bg-blue-50 text-[#003F86]' : 'border-slate-200 text-slate-600 hover:border-blue-300'
                      }`}
                    >
                      <span className="block text-sm font-black" dir="ltr">{hm.id}</span>
                      <span className="block text-[11px] font-bold opacity-80">{hm.fuel}</span>
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-xs text-slate-500 font-medium flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
                  {m.note}
                </p>
              </div>
            )}

            <dl className="mt-5 divide-y divide-slate-100 rounded-2xl border border-slate-100">
              {spot.specs.map((s) => (
                <div key={s.label} className="flex items-center justify-between gap-3 px-4 py-2.5">
                  <dt className="text-xs sm:text-sm font-bold text-slate-500 flex items-center gap-2">
                    {spot.key === 'heater' ? <Zap className="w-3.5 h-3.5 text-amber-500" aria-hidden="true" /> : <Wind className="w-3.5 h-3.5 text-amber-500" aria-hidden="true" />}
                    {s.label}
                  </dt>
                  <dd className={`text-xs sm:text-sm font-black text-left ${s.todo ? 'text-amber-700 border border-dashed border-amber-400 rounded-md px-1.5' : 'text-slate-900'}`}>
                    {spot.key === 'heater' && s.label === 'سوخت' ? m.fuel : s.value}
                  </dd>
                </div>
              ))}
            </dl>

            <div className="mt-6 lg:mt-auto lg:pt-6">
              <Ctas spot={spot} href={spot.key === 'heater' ? m.href : undefined} />
              <a href="tel:09115116258" className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-[#003F86] hover:text-amber-600 min-h-11">
                <Phone className="w-4 h-4" aria-hidden="true" />
                <span dir="ltr">۰۹۱۱ ۵۱۱ ۶۲۵۸</span>
                <ChevronLeft className="w-3.5 h-3.5" aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};


/* =====================================================================================
 * HORIZONTAL-BAND ÉTUDES D/E/F — same frame as the home brand band in Hero.tsx
 * (rounded-[2.5rem], from-[#001c3d] via-[#002d61] to-[#003F86], border-blue-800,
 * p-8 sm:p-10, amber CTA px-8 py-4 rounded-2xl, title text-2xl sm:text-3xl lg:text-4xl).
 * One band per product; the product name is the band's H2.
 * ===================================================================================== */

type BandData = {
  spot: Spot;
  eyebrow: string;
  sub: string;
  chips: Spec[];
  key: { value: string; unit: string };
  key2?: { value: string; unit: string };
};

const BANDS: BandData[] = [
  {
    spot: FEEDER,
    eyebrow: 'تولید طیوران صنعت پویا',
    sub: 'بشقاب دانخوری با لبهٔ پروانه‌ای برای تغذیهٔ جوجه از روز اول، بدون سینی دان',
    chips: [
      { label: '', value: 'از روز اول، بدون سینی' },
      { label: '', value: 'لبهٔ دوبل ضدپاشش' },
      { label: '', value: 'PP نو گرید بهداشتی' },
    ],
    key: { value: 'روز اول', unit: 'تغذیه بدون سینی دان' },
    key2: { value: 'Virgin PP', unit: 'مقاوم به UV و ضدعفونی' },
  },
  {
    spot: HEATER,
    eyebrow: 'گرمایش سالن مرغداری',
    sub: 'جت هیتر ۱۰۰ هزار در سه نسخهٔ گازی، گازوئیلی و دوگانه‌سوز برای گرمایش یکنواخت سالن',
    chips: [
      { label: '', value: '۱۰۰٬۰۰۰ کیلوکالری' },
      { label: '', value: 'هوادهی ۷٬۰۰۰ مترمکعب' },
      { label: '', value: 'پرتاب تا ۲۰ متر' },
      { label: '', value: 'گاز / گازوئیل / دوگانه' },
    ],
    key: { value: '۱۰۰٬۰۰۰', unit: 'کیلوکالری بر ساعت' },
    key2: { value: '۷٬۰۰۰', unit: 'مترمکعب هوادهی در ساعت' },
  },
];

const BAND_SHELL =
  'relative w-full rounded-[2.5rem] overflow-hidden bg-gradient-to-r from-[#001c3d] via-[#002d61] to-[#003F86] border border-blue-800 shadow-xl';

const BandGlows = () => (
  <>
    <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[radial-gradient(circle_at_center,_rgba(245,158,11,0.08)_0%,_transparent_70%)] -translate-y-1/2 translate-x-1/2 pointer-events-none" aria-hidden="true" />
    <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[radial-gradient(circle_at_center,_rgba(96,165,250,0.08)_0%,_transparent_70%)] translate-y-1/2 -translate-x-1/2 pointer-events-none" aria-hidden="true" />
  </>
);

/** Small fixed-size product tile (replaces the band's 80×80 icon tile). */
const ThumbTile: React.FC<{ spot: Spot; size?: string; light?: boolean }> = ({ spot, size = 'w-16 h-16 sm:w-20 sm:h-20', light }) => {
  const ph = usePlaceholder();
  return (
    <div className={`relative ${size} shrink-0 rounded-2xl overflow-hidden border-[1.5px] ${light ? 'border-amber-300 bg-white' : 'border-white/40 bg-white/10'}`}>
      {ph ? (
        <div className={`absolute inset-0 flex flex-col items-center justify-center gap-0.5 border border-dashed rounded-2xl ${light ? 'border-amber-400 text-amber-700' : 'border-white/40 text-blue-100'}`}>
          <ImageIcon className="w-5 h-5 opacity-80" aria-hidden="true" />
          <span className="text-[9px] font-black leading-tight text-center">جای عکس<br />محصول</span>
        </div>
      ) : (
        <img
          src={spot.image}
          alt={spot.imageAlt}
          loading="lazy"
          decoding="async"
          width={160}
          height={160}
          className={`absolute inset-0 h-full w-full ${spot.key === 'heater' ? 'object-contain bg-white p-1' : 'object-cover'}`}
        />
      )}
    </div>
  );
};

const BandCtas: React.FC<{ spot: Spot; light?: boolean; compact?: boolean; stack?: boolean }> = ({ spot, light, compact, stack }) => (
  <div className={`flex flex-col sm:flex-row ${compact ? '' : stack ? 'lg:flex-col' : ''} items-stretch sm:items-center gap-1 sm:gap-3 w-full lg:w-auto shrink-0`}>
    <Link
      to="/contact"
      className={`group/cta flex-1 lg:flex-none bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black ${compact ? 'px-4 py-3' : 'px-5 sm:px-8 py-3.5 sm:py-4'} rounded-2xl inline-flex items-center justify-center gap-2 sm:gap-3 shadow-[0_10px_30px_rgba(251,191,36,0.3)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white`}
    >
      <span className="text-[13px] sm:text-sm whitespace-nowrap">{CONSULT}</span>
      <span className="hidden sm:flex w-8 h-8 rounded-full bg-slate-950/10 items-center justify-center group-hover/cta:-translate-x-1 transition-transform">
        <ArrowLeft className="w-4 h-4" aria-hidden="true" />
      </span>
    </Link>
    <Link
      to={spot.specsHref}
      className={`inline-flex items-center justify-center rounded-2xl ${compact ? 'px-4 py-3' : 'px-4 sm:px-6 py-3.5 sm:py-4'} max-sm:py-2 max-sm:min-h-[40px] max-sm:border-transparent max-sm:bg-transparent max-sm:underline max-sm:underline-offset-4 text-[13px] sm:text-sm font-bold whitespace-nowrap focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400 ${
        light ? 'border border-[#003F86]/25 text-[#003F86] bg-white hover:border-[#003F86]' : 'border border-white/25 text-white bg-white/5 hover:bg-white/15'
      }`}
    >
      مشاهده مشخصات
    </Link>
  </div>
);

const Chip: React.FC<{ c: Spec; light?: boolean; i?: number }> = ({ c, light, i = 0 }) => (
  <li
    className={`${i >= 2 ? 'hidden sm:block' : ''} shrink-0 rounded-full px-3 py-1 text-[11px] sm:text-xs font-bold border whitespace-nowrap ${
      c.todo
        ? 'border-dashed border-amber-400/80 text-amber-300 bg-amber-400/5'
        : light
          ? 'border-amber-300 bg-white text-[#003F86]'
          : 'border-white/20 bg-white/10 text-blue-50'
    }`}
  >
    {c.value}
  </li>
);

/* ---------- Étude D: the reference band 1:1, product tile instead of icon, chips instead of subtitle ---------- */
const BandD: React.FC<{ b: BandData }> = ({ b }) => (
  <section className={`${BAND_SHELL} p-5 sm:p-8 lg:p-10`}>
    <BandGlows />
    <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4 lg:gap-8">
      <div className="flex items-center gap-4 sm:gap-6 min-w-0">
        <ThumbTile spot={b.spot} />
        <div className="min-w-0">
          <span className="text-[10px] sm:text-[11px] font-bold text-amber-300 mb-1 sm:mb-1.5 block">{b.eyebrow}</span>
          <h2 className="text-xl sm:text-3xl lg:text-4xl font-black text-white mb-2">{b.spot.name}</h2>
          <ul className="flex flex-wrap gap-1.5 sm:gap-2" aria-label={`مشخصات ${b.spot.name}`}>
            {b.chips.map((c, i) => <Chip key={c.value} c={c} i={i} />)}
          </ul>
        </div>
      </div>
      <BandCtas spot={b.spot} />
    </div>
  </section>
);

const EtudeD: React.FC = () => (
  <div className="space-y-4 lg:space-y-6">
    {BANDS.map((b) => <BandD key={b.spot.key} b={b} />)}
  </div>
);

/* ---------- Étude E: photo panel bleeding off the start edge + key-number highlight ---------- */
const BandE: React.FC<{ b: BandData }> = ({ b }) => {
  const ph = usePlaceholder();
  const heater = b.spot.key === 'heater';
  return (
    <section className={`${BAND_SHELL} group`}>
      <BandGlows />
      <div className="relative z-10 flex flex-col lg:flex-row lg:items-stretch">
        {/* photo panel: top strip on mobile, diagonal start-edge panel on desktop */}
        <div className="spot-bleed relative h-24 sm:h-36 lg:h-auto lg:w-[24%] shrink-0 overflow-hidden bg-white">
          {ph ? (
            <div className="absolute inset-2 lg:inset-3 lg:left-10 flex flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 text-slate-500">
              <ImageIcon className="w-6 h-6" aria-hidden="true" />
              <span className="text-xs font-black">جای عکس محصول</span>
            </div>
          ) : (
            <img
              src={b.spot.image}
              alt={b.spot.imageAlt}
              loading="lazy"
              decoding="async"
              width={600}
              height={400}
              className={`absolute inset-0 h-full w-full ${heater ? 'object-contain p-3 lg:pl-12' : 'object-cover'} transition-transform duration-700 group-hover:scale-[1.04]`}
            />
          )}
        </div>
        <div className="flex-1 min-w-0 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-3 sm:gap-5 lg:gap-8 p-5 sm:p-8 lg:py-8 lg:pr-6 lg:pl-10">
          <div className="min-w-0">
            <span className="text-[10px] sm:text-[11px] font-bold text-amber-300 mb-1 sm:mb-1.5 block">{b.eyebrow}</span>
            <h2 className="text-xl sm:text-3xl font-black text-white mb-1.5 sm:mb-2 lg:whitespace-nowrap">{b.spot.name}</h2>
            <p className="hidden sm:block text-sm text-blue-100 max-w-md leading-relaxed font-medium line-clamp-2">{b.sub}</p>
          </div>
          <dl className="flex items-stretch gap-4 sm:gap-6 lg:border-r lg:border-white/15 lg:pr-8">
            {[b.key, b.key2].filter(Boolean).map((k, i) => (
              <div key={i} className={i ? 'border-r border-white/15 pr-4 sm:pr-6 lg:hidden 2xl:block' : ''}>
                <dd className="text-2xl sm:text-3xl lg:text-[2rem] font-black text-amber-400 leading-none whitespace-nowrap" dir={/[A-Za-z]/.test(k!.value) ? 'ltr' : undefined}>{k!.value}</dd>
                <dt className="mt-1.5 text-[11px] sm:text-xs font-bold text-blue-100/80 whitespace-nowrap">{k!.unit}</dt>
              </div>
            ))}
          </dl>
          <BandCtas spot={b.spot} stack />
        </div>
      </div>
    </section>
  );
};

const EtudeE: React.FC = () => (
  <div className="space-y-4 lg:space-y-6">
    {BANDS.map((b) => <BandE key={b.spot.key} b={b} />)}
  </div>
);

/* ---------- Étude F: two half-width bands side by side — feeder light/amber, heater dark ---------- */
const BandF: React.FC<{ b: BandData; light?: boolean }> = ({ b, light }) => (
  <section
    className={`relative w-full rounded-[2.5rem] overflow-hidden shadow-xl p-5 sm:p-7 ${
      light ? 'bg-gradient-to-l from-amber-50 via-white to-amber-100/70 border border-amber-200' : 'bg-gradient-to-r from-[#001c3d] via-[#002d61] to-[#003F86] border border-blue-800'
    }`}
  >
    {!light && <BandGlows />}
    {light && <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-[radial-gradient(circle,_rgba(245,158,11,0.18)_0%,_transparent_70%)] pointer-events-none" aria-hidden="true" />}
    <div className="relative z-10 flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <ThumbTile spot={b.spot} light={light} size="w-16 h-16" />
        <div className="min-w-0">
          <span className={`text-[10px] sm:text-[11px] font-bold mb-1 block ${light ? 'text-amber-700' : 'text-amber-300'}`}>{b.eyebrow}</span>
          <h2 className={`text-xl sm:text-2xl lg:text-[1.75rem] font-black leading-tight ${light ? 'text-slate-900' : 'text-white'}`}>{b.spot.name}</h2>
          <ul className="mt-2 flex flex-wrap gap-1.5" aria-label={`مشخصات ${b.spot.name}`}>
            {b.chips.slice(0, 3).map((c, i) => <Chip key={c.value} c={c} light={light} i={i} />)}
          </ul>
        </div>
      </div>
      <BandCtas spot={b.spot} light={light} compact />
    </div>
  </section>
);

const EtudeF: React.FC = () => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
    <BandF b={BANDS[0]} light />
    <BandF b={BANDS[1]} />
  </div>
);

/** Renders the étude chosen by #etude=A|B|C (nothing otherwise). */
export const ProductSpotlightEtude: React.FC = () => {
  const v = typeof window !== 'undefined' ? new URLSearchParams(window.location.hash.slice(1)).get('etude') : null;
  if (v === 'A') return <EtudeA />;
  if (v === 'B') return <EtudeB />;
  if (v === 'C') return <EtudeC />;
  if (v === 'D') return <EtudeD />;
  if (v === 'E') return <EtudeE />;
  if (v === 'F') return <EtudeF />;
  return null;
};
