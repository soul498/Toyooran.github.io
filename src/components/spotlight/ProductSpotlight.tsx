import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Image as ImageIcon, Phone, Thermometer, Wheat } from '../../icons';
import { FEEDER_PHOTO, HEATER_PHOTO, type ProductPhoto } from '../../data/productPhotos';

/**
 * Product spotlight for «دانخوری پروانه‌ای پویا» and «جت هیتر».
 * - HomeProductBands: horizontal bands (same frame as the home brand band in Hero.tsx), after the home hero.
 * - ProductsSpotlightPanel: dark blueprint panel with numbered notes + spec grid, after the /products hero.
 * Feeder specs come from the magazine article «introduction-to-pouya-butterfly-feeder» and service
 * «srv-poultry-equipment-supply». Heater specs come from the published article /magazine/imachine-jet-heater.
 * Visible copy says only «جت هیتر» (no brand name); unverified component brands were removed.
 */

type Spec = { label: string; value: string };
type SpotKey = 'feeder' | 'heater';
type Spot = {
  key: SpotKey;
  name: string;
  eyebrow: string;
  sub: string;
  photo: ProductPhoto;
  specs: Spec[];
  keyFigure: { value: string; unit: string };
  keyFigure2: { value: string; unit: string };
  callouts: string[];
  specsHref: string;
  icon: React.ElementType;
};

const SPOTS: Spot[] = [
  {
    key: 'feeder',
    name: 'دانخوری پروانه‌ای پویا',
    eyebrow: 'تولید طیوران صنعت پویا',
    sub: 'تغذیهٔ جوجه از روز اول بدون سینی دان؛ کاهش ۳ تا ۵ درصدی هدررفت دان.',
    photo: FEEDER_PHOTO,
    specs: [
      { label: 'شروع تغذیه', value: 'از روز اول، بدون سینی دان' },
      { label: 'لبه', value: 'دوبل و ضدپاشش' },
      { label: 'متریال', value: 'پلی‌پروپیلن نو' },
      { label: 'مقاومت', value: 'اشعهٔ UV، شستشو و ضدعفونی‌کننده' },
    ],
    keyFigure: { value: 'روز اول', unit: 'تغذیه بدون سینی دان' },
    keyFigure2: { value: '۳ تا ۵٪', unit: 'کاهش هدررفت دان' },
    callouts: [
      'لبهٔ پروانه‌ای کوتاه برای جوجهٔ یک‌روزه',
      'کاهش ۳ تا ۵ درصدی هدررفت دان',
      'شبکهٔ مانع ورود پرنده به بشقاب',
    ],
    specsHref: '/magazine/introduction-to-pouya-butterfly-feeder',
    icon: Wheat,
  },
  {
    key: 'heater',
    name: 'جت هیتر',
    eyebrow: 'گرمایش سالن مرغداری',
    sub: 'گرمایش سالن مرغداری؛ ظرفیت مناسب هر سالن با مشاورهٔ کارشناسان تعیین می‌شود.',
    photo: HEATER_PHOTO,
    specs: [
      { label: 'سوخت', value: 'گاز طبیعی یا گازوئیل' },
      { label: 'ظرفیت (کیلوکالری بر ساعت)', value: '۱۰۰٬۰۰۰' },
      { label: 'برد کنترل', value: 'تمام‌اتوماتیک' },
      { label: 'انتخاب ظرفیت', value: 'با مشاورهٔ فنی رایگان' },
    ],
    keyFigure: { value: '۱۰۰٬۰۰۰', unit: 'کیلوکالری بر ساعت' },
    keyFigure2: { value: 'گاز یا گازوئیل', unit: 'سوخت دستگاه' },
    callouts: [
      'بدنهٔ استنلس استیل',
      'نصب آویز یا پرتابل',
      'کنترل شعله با فتوسل',
    ],
    specsHref: '/magazine/imachine-jet-heater',
    icon: Thermometer,
  },
];

const CONSULT = 'درخواست مشاورهٔ رایگان';
const faDigit = (n: number) => n.toLocaleString('fa-IR');

/** Fixed-size, lazy product photo filling its frame (cover, centred: the product sits in the centre square). */
const SpotPhoto: React.FC<{ photo: ProductPhoto; sizes: string; className?: string }> = ({ photo, sizes, className = '' }) => (
  <img
    src={photo.src}
    srcSet={photo.srcSet}
    sizes={sizes}
    alt={photo.alt}
    width={photo.width}
    height={photo.height}
    loading="lazy"
    decoding="async"
    className={`absolute inset-0 h-full w-full object-cover object-center ${className}`}
  />
);

/** Primary amber CTA + secondary «مشاهده مشخصات» (a text link on mobile to keep the block short). */
const SpotCtas: React.FC<{ spot: Spot; stackOnDesktop?: boolean }> = ({ spot, stackOnDesktop }) => (
  <div className={`flex flex-col sm:flex-row ${stackOnDesktop ? 'lg:flex-col' : ''} items-stretch sm:items-center gap-1 sm:gap-3 w-full lg:w-auto shrink-0`}>
    <Link
      to="/contact"
      className="group/cta bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black px-5 sm:px-8 py-3.5 sm:py-4 rounded-2xl inline-flex items-center justify-center gap-2 sm:gap-3 shadow-[0_10px_30px_rgba(251,191,36,0.3)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
    >
      <span className="text-[13px] sm:text-sm whitespace-nowrap">{CONSULT}</span>
      <span className="hidden sm:flex w-8 h-8 rounded-full bg-slate-950/10 items-center justify-center transition-transform group-hover/cta:-translate-x-1">
        <ArrowLeft className="w-4 h-4" aria-hidden="true" />
      </span>
    </Link>
    <Link
      to={spot.specsHref}
      className="inline-flex min-h-[40px] items-center justify-center rounded-2xl px-4 sm:px-6 py-2 sm:py-4 text-[13px] sm:text-sm font-bold whitespace-nowrap text-white underline underline-offset-4 sm:no-underline sm:border sm:border-white/25 sm:bg-white/5 hover:bg-white/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400"
    >
      مشاهده مشخصات
    </Link>
  </div>
);

const BandGlows = () => (
  <>
    <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[radial-gradient(circle_at_center,_rgba(245,158,11,0.08)_0%,_transparent_70%)] -translate-y-1/2 translate-x-1/2 pointer-events-none" aria-hidden="true" />
    <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[radial-gradient(circle_at_center,_rgba(96,165,250,0.08)_0%,_transparent_70%)] translate-y-1/2 -translate-x-1/2 pointer-events-none" aria-hidden="true" />
  </>
);

/* ------------------------------ Home: horizontal bands ------------------------------ */
/* Home bands: name + secondary stat only (description line and first stat removed, user request
 * 2026-10-28); primary CTA «مشاهده مشخصات», small outline «درخواست مشاورهٔ رایگان».
 * The heater band is a clear (transparent) box with dark text; the feeder band keeps the navy fill. */

const BandCtas: React.FC<{ spot: Spot; clear: boolean }> = ({ spot, clear }) => (
  <div className="flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center gap-2 sm:gap-3 w-full lg:w-auto shrink-0">
    <Link
      to={spot.specsHref}
      className={`group/cta bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black px-5 sm:px-8 py-3.5 sm:py-4 rounded-2xl inline-flex items-center justify-center gap-2 sm:gap-3 shadow-[0_10px_30px_rgba(251,191,36,0.3)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${clear ? 'focus-visible:outline-[#003F86]' : 'focus-visible:outline-white'}`}
    >
      <span className="text-[13px] sm:text-sm whitespace-nowrap">مشاهده مشخصات</span>
      <span className="hidden sm:flex w-8 h-8 rounded-full bg-slate-950/10 items-center justify-center transition-transform group-hover/cta:-translate-x-1">
        <ArrowLeft className="w-4 h-4" aria-hidden="true" />
      </span>
    </Link>
    <Link
      to="/contact"
      className={`self-center sm:self-auto lg:self-center inline-flex min-h-[40px] items-center justify-center rounded-xl border px-4 py-2 text-xs font-bold whitespace-nowrap transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
        clear
          ? 'border-slate-300 text-[#003F86] hover:bg-slate-100 focus-visible:outline-[#003F86]'
          : 'border-white/30 text-white hover:bg-white/10 focus-visible:outline-amber-400'
      }`}
    >
      {CONSULT}
    </Link>
  </div>
);

const ProductBand: React.FC<{ spot: Spot }> = ({ spot }) => {
  const clear = spot.key === 'heater';
  const k = spot.keyFigure2;
  return (
    <section
      aria-labelledby={`spot-band-${spot.key}`}
      className={`group relative w-full rounded-[2.5rem] overflow-hidden ${
        clear ? 'bg-transparent border border-slate-200' : 'bg-gradient-to-r from-[#001c3d] via-[#002d61] to-[#003F86] border border-blue-800 shadow-xl'
      }`}
    >
      {!clear && <BandGlows />}
      <div className="relative z-10 flex flex-col lg:flex-row lg:items-stretch">
        <div className="spot-bleed relative h-36 lg:h-auto lg:w-[24%] shrink-0 overflow-hidden bg-white">
          <SpotPhoto photo={spot.photo} sizes="(min-width: 1024px) 300px, 100vw" className="transition-transform duration-700 group-hover:scale-[1.04]" />
        </div>
        <div className="flex-1 min-w-0 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_auto] 2xl:grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-3 sm:gap-5 lg:gap-8 p-5 sm:p-8 lg:py-8 lg:pr-6 lg:pl-10">
          <div className="min-w-0">
            <span className={`text-[10px] sm:text-[11px] font-bold mb-1 sm:mb-1.5 block ${clear ? 'text-amber-700' : 'text-amber-300'}`}>{spot.eyebrow}</span>
            <h2 id={`spot-band-${spot.key}`} className={`text-xl sm:text-3xl font-black lg:whitespace-nowrap ${clear ? 'text-[#003F86]' : 'text-white'}`}>
              {spot.name}
            </h2>
          </div>
          <dl className={`flex items-stretch lg:hidden 2xl:flex 2xl:border-r 2xl:pr-8 ${clear ? '2xl:border-slate-200' : '2xl:border-white/15'}`}>
            <div>
              <dt className="sr-only">{k.unit}</dt>
              <dd
                className={`text-2xl sm:text-3xl lg:text-[2rem] font-black leading-none whitespace-nowrap ${clear ? 'text-amber-700' : 'text-amber-400'}`}
                dir={/[A-Za-z]/.test(k.value) ? 'ltr' : undefined}
              >
                {k.value}
              </dd>
              <dd className={`mt-1.5 text-[11px] sm:text-xs font-bold whitespace-nowrap ${clear ? 'text-slate-600' : 'text-blue-100/80'}`} aria-hidden="true">
                {k.unit}
              </dd>
            </div>
          </dl>
          <BandCtas spot={spot} clear={clear} />
        </div>
      </div>
    </section>
  );
};

export const HomeProductBands: React.FC = () => (
  <div className="space-y-4 lg:space-y-6">
    {SPOTS.map((spot) => (
      <ProductBand key={spot.key} spot={spot} />
    ))}
  </div>
);

/* ------------------------------ /products: blueprint panel ------------------------------ */

const BlueprintCard: React.FC<{ spot: Spot }> = ({ spot }) => {
  const Icon = spot.icon;
  return (
    <article className="rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-4 sm:p-6 flex flex-col">
      <div className="flex items-center gap-3">
        <span className="w-10 h-10 sm:w-11 sm:h-11 shrink-0 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center">
          <Icon className="w-5 h-5 text-amber-400" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="text-[11px] sm:text-xs font-bold text-blue-200/80">{spot.eyebrow}</p>
          <h3 className="font-black text-lg sm:text-2xl tracking-tight">{spot.name}</h3>
        </div>
      </div>

      <div className="relative mt-4 sm:mt-5 aspect-[16/9] overflow-hidden rounded-[1.5rem] border border-white/10 bg-white">
        <SpotPhoto photo={spot.photo} sizes="(min-width: 1024px) 560px, 100vw" />
      </div>

      {/* Numbered technical notes as compact chips. */}
      <ol className="mt-3 flex flex-wrap gap-1.5" aria-label={`نکات فنی ${spot.name}`}>
        {spot.callouts.map((c, n) => (
          <li key={c} className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 py-1 pl-2.5 pr-1 text-[11px] font-bold text-blue-50">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 text-[10px] font-black text-blue-950">{faDigit(n + 1)}</span>
            {c}
          </li>
        ))}
      </ol>

      <dl className="mt-4 sm:mt-5 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10">
        {spot.specs.map((s) => (
          <div key={s.label} className="bg-blue-950/80 p-2.5 sm:p-3.5">
            <dt className="text-[10px] sm:text-[11px] font-bold text-blue-200/70">{s.label}</dt>
            <dd className="mt-0.5 sm:mt-1 text-[13px] sm:text-[15px] font-black text-amber-300 leading-snug">{s.value}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-auto pt-4 sm:pt-6">
        <SpotCtas spot={spot} />
      </div>
    </article>
  );
};

export const ProductsSpotlightPanel: React.FC = () => (
  <section
    aria-labelledby="products-spotlight-heading"
    className="spot-blueprint relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-blue-950 via-[#06245a] to-indigo-950 p-4 sm:p-8 lg:p-12 text-white"
  >
    <div className="relative mb-5 sm:mb-8 text-center">
      <h2 id="products-spotlight-heading" className="font-black text-xl sm:text-3xl tracking-tight">
        محصولات شاخص طیوران صنعت پویا
      </h2>
      <p className="mt-1.5 sm:mt-2 text-xs sm:text-base font-medium text-blue-100/80">دانخوری پروانه‌ای پویا و جت هیتر؛ مشخصات در یک نگاه</p>
    </div>
    <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8">
      {SPOTS.map((spot) => (
        <BlueprintCard key={spot.key} spot={spot} />
      ))}
    </div>
    <a href="tel:+989115116258" className="relative mt-4 sm:mt-6 flex items-center justify-center gap-2 text-sm font-bold text-blue-100 hover:text-amber-300 min-h-11">
      <Phone className="w-4 h-4 text-amber-400" aria-hidden="true" />
      <span>مشاورهٔ فنی تلفنی:</span>
      <span dir="ltr">۰۹۱۱ ۵۱۱ ۶۲۵۸</span>
    </a>
  </section>
);
