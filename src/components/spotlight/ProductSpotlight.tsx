import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Image as ImageIcon, Phone, Thermometer, Wheat } from '../../icons';
import { FEEDER_PHOTO, HEATER_PHOTO, type ProductPhoto } from '../../data/productPhotos';

/**
 * Product spotlight for «دانخوری پروانه‌ای پویا» and «جت هیتر IMACHINE».
 * - HomeProductBands: horizontal bands (same frame as the home brand band in Hero.tsx), after the home hero.
 * - ProductsSpotlightPanel: dark blueprint panel with numbered notes + spec grid, after the /products hero.
 * Feeder specs come from the magazine article «introduction-to-pouya-butterfly-feeder» and service
 * «srv-poultry-equipment-supply». No published IMACHINE heater datasheet exists, so the heater lists only
 * components visible on the approved photos (pump and valve labels); capacity figures are left out.
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
    sub: 'بشقاب دانخوری با لبهٔ پروانه‌ای برای تغذیهٔ جوجه از روز اول، بدون سینی دان',
    photo: FEEDER_PHOTO,
    specs: [
      { label: 'شروع تغذیه', value: 'از روز اول، بدون سینی دان' },
      { label: 'لبه', value: 'دوبل و ضدپاشش' },
      { label: 'متریال', value: 'پلی‌پروپیلن نو (Virgin) گرید بهداشتی' },
      { label: 'مقاومت', value: 'اشعهٔ UV، شستشو و ضدعفونی‌کننده' },
    ],
    keyFigure: { value: 'روز اول', unit: 'تغذیه بدون سینی دان' },
    keyFigure2: { value: 'Virgin PP', unit: 'مقاوم به UV و ضدعفونی' },
    callouts: [
      'لبهٔ پروانه‌ای کوتاه برای جوجهٔ یک‌روزه',
      'لبهٔ دوبل ضدپاشش',
      'شبکهٔ مانع ورود پرنده به بشقاب',
    ],
    specsHref: '/magazine/introduction-to-pouya-butterfly-feeder',
    icon: Wheat,
  },
  {
    key: 'heater',
    name: 'جت هیتر IMACHINE',
    eyebrow: 'گرمایش سالن مرغداری',
    sub: 'جت هیتر IMACHINE برای گرمایش سالن مرغداری؛ ظرفیت مناسب هر سالن با مشاورهٔ فنی تعیین می‌شود',
    photo: HEATER_PHOTO,
    specs: [
      { label: 'پمپ سوخت مشعل', value: 'Danfoss' },
      { label: 'شیر برقی گاز', value: 'MARAS، حفاظت IP54' },
      { label: 'تابلو کنترل', value: 'روی بدنهٔ دستگاه' },
      { label: 'انتخاب ظرفیت', value: 'با مشاورهٔ فنی رایگان' },
    ],
    keyFigure: { value: 'Danfoss', unit: 'پمپ سوخت مشعل' },
    keyFigure2: { value: 'IP54', unit: 'شیر برقی گاز MARAS' },
    callouts: [
      'پمپ سوخت Danfoss',
      'شیر برقی گاز MARAS',
      'تابلو کنترل روی بدنه',
    ],
    specsHref: '/products/heating',
    icon: Thermometer,
  },
];

const CONSULT = 'مشاورهٔ رایگان و استعلام قیمت';
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

const ProductBand: React.FC<{ spot: Spot }> = ({ spot }) => (
  <section
    aria-labelledby={`spot-band-${spot.key}`}
    className="group relative w-full rounded-[2.5rem] overflow-hidden bg-gradient-to-r from-[#001c3d] via-[#002d61] to-[#003F86] border border-blue-800 shadow-xl"
  >
    <BandGlows />
    <div className="relative z-10 flex flex-col lg:flex-row lg:items-stretch">
      <div className="spot-bleed relative h-36 lg:h-auto lg:w-[24%] shrink-0 overflow-hidden bg-white">
        <SpotPhoto photo={spot.photo} sizes="(min-width: 1024px) 300px, 100vw" className="transition-transform duration-700 group-hover:scale-[1.04]" />
      </div>
      <div className="flex-1 min-w-0 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-3 sm:gap-5 lg:gap-8 p-5 sm:p-8 lg:py-8 lg:pr-6 lg:pl-10">
        <div className="min-w-0">
          <span className="text-[10px] sm:text-[11px] font-bold text-amber-300 mb-1 sm:mb-1.5 block">{spot.eyebrow}</span>
          <h2 id={`spot-band-${spot.key}`} className="text-xl sm:text-3xl font-black text-white mb-1.5 sm:mb-2 lg:whitespace-nowrap">
            {spot.name}
          </h2>
          <p className="hidden sm:block text-sm text-blue-100 max-w-md leading-relaxed font-medium line-clamp-2">{spot.sub}</p>
        </div>
        <dl className="flex items-stretch gap-4 sm:gap-6 lg:border-r lg:border-white/15 lg:pr-8">
          {[spot.keyFigure, spot.keyFigure2].map((k, i) => (
            <div key={k.unit} className={i ? 'border-r border-white/15 pr-4 sm:pr-6 lg:hidden 2xl:block' : ''}>
              <dt className="sr-only">{k.unit}</dt>
              <dd
                className="text-2xl sm:text-3xl lg:text-[2rem] font-black text-amber-400 leading-none whitespace-nowrap"
                dir={/[A-Za-z]/.test(k.value) ? 'ltr' : undefined}
              >
                {k.value}
              </dd>
              <dd className="mt-1.5 text-[11px] sm:text-xs font-bold text-blue-100/80 whitespace-nowrap" aria-hidden="true">
                {k.unit}
              </dd>
            </div>
          ))}
        </dl>
        <SpotCtas spot={spot} stackOnDesktop />
      </div>
    </div>
  </section>
);

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
      <p className="mt-1.5 sm:mt-2 text-xs sm:text-base font-medium text-blue-100/80">دانخوری پروانه‌ای پویا و جت هیتر IMACHINE؛ مشخصات در یک نگاه</p>
    </div>
    <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8">
      {SPOTS.map((spot) => (
        <BlueprintCard key={spot.key} spot={spot} />
      ))}
    </div>
    <a href="tel:09115116258" className="relative mt-4 sm:mt-6 flex items-center justify-center gap-2 text-sm font-bold text-blue-100 hover:text-amber-300 min-h-11">
      <Phone className="w-4 h-4 text-amber-400" aria-hidden="true" />
      <span>مشاورهٔ فنی تلفنی:</span>
      <span dir="ltr">۰۹۱۱ ۵۱۱ ۶۲۵۸</span>
    </a>
  </section>
);
