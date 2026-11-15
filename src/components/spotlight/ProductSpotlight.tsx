import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Thermometer, Wheat } from '../../icons';
import { FEEDER_PHOTO, HEATER_PHOTO, type ProductPhoto } from '../../data/productPhotos';

import { t, translateDeep, tr } from '../../i18n';
/**
 * Product spotlight for «دانخوری پروانه‌ای پویا» and «جت هیتر».
 * - HomeProductBands: horizontal bands (same frame as the home brand band in Hero.tsx), after the home hero.
 * Used on the home page and, since 2026-10-31 (user request), at the top of /products (replacing the old blueprint panel).
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
  callouts: string[];
  specsHref: string;
  icon: React.ElementType;
  /** Home card (redesign variant B, approved 2026-10-29): description, four features, key number. */
  card: { desc: string; feats: { icon: FeatIconKey; text: string }[]; stat: { value: string; unit: string }; photoPos: string };
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
    callouts: [
      'لبهٔ پروانه‌ای کوتاه برای جوجهٔ یک‌روزه',
      'کاهش ۳ تا ۵ درصدی هدررفت دان',
      'شبکهٔ مانع ورود پرنده به بشقاب',
    ],
    specsHref: '/products/pouya-butterfly-feeder',
    icon: Wheat,
    card: {
      desc: 'نسل جدید دانخوری‌های محیطی طیور؛ دسترسی کامل پرنده به خوراک، بدون ورود به داخل دانخوری.',
      feats: [
        { icon: 'shield', text: 'کاهش آلودگی خوراک' },
        { icon: 'clock', text: 'مناسب تمام دورهٔ پرورش' },
        { icon: 'link', text: 'نصب روی خطوط موجود' },
        { icon: 'drop', text: 'شستشوی سریع و آسان' },
      ],
      stat: { value: '۳ تا ۵٪', unit: 'کاهش هدررفت دان' },
      photoPos: '60% 50%',
    },
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
    callouts: [
      'بدنهٔ استنلس استیل',
      'نصب آویز یا پرتابل',
      'کنترل شعله با فتوسل',
    ],
    specsHref: '/products/jet-heater',
    icon: Thermometer,
    card: {
      desc: 'گرمایش سریع فضاهای بزرگ با سوخت گاز طبیعی، گازوئیل یا دوگانه‌سوز.',
      feats: [
        { icon: 'fuel', text: 'گاز طبیعی، گازوئیل یا دوگانه‌سوز' },
        { icon: 'cube', text: 'گرمایش ۱۰۰۰ تا ۴۰۰۰ مترمکعب' },
        { icon: 'layers', text: 'بدنه از استنلس استیل نسوز' },
        { icon: 'flame', text: 'کنترل شعله با فتوسل' },
      ],
      stat: { value: '۱۰۰ هزار', unit: 'کیلوکالری بر ساعت' },
      photoPos: '50% 50%',
    },
  },
];

const CONSULT = 'درخواست مشاورهٔ رایگان';
/* ------------------------------ Home: product cards (variant B) ------------------------------ */
/* Redesign approved by the user 2026-10-29 (designer handoff «product_cards», variant B):
 * photo at the right edge with the diagonal cut, text column (eyebrow, title, description, four features),
 * action column at the left edge (key number, primary «مشاهده مشخصات», secondary consult button).
 * Stacked below md. Feeder card navy, heater card light. Photos are the site's current ones (user request).
 * Titles use Estedad (Anjoman Max is not served by the site). Colours/contrast from the handoff's contrast.md. */

type FeatIconKey = 'shield' | 'clock' | 'link' | 'drop' | 'fuel' | 'cube' | 'layers' | 'flame';
const FEAT_PATHS: Record<FeatIconKey, string[]> = {
  shield: ['M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z', 'm9 12 2 2 4-4'],
  clock: ['M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z', 'M12 7v5l3 2'],
  link: ['M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1', 'M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1'],
  drop: ['M12 3s7 7.5 7 12a7 7 0 0 1-14 0c0-4.5 7-12 7-12z'],
  fuel: ['M4 21V5a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v16M3 21h13M7 8h5M15 10h2a2 2 0 0 1 2 2v5a1.5 1.5 0 0 0 3 0V8l-3-3'],
  cube: ['M21 8 12 3 3 8v8l9 5 9-5z', 'm3 8 9 5 9-5M12 13v8'],
  layers: ['m12 3 9 5-9 5-9-5z', 'm3 13 9 5 9-5'],
  flame: ['M12 22a7 7 0 0 0 7-7c0-4-3-6-4-10-2 2-3 4-3 6-1-1-2-2-2-4-2 2-5 5-5 8a7 7 0 0 0 7 7z'],
};
const FeatIcon: React.FC<{ name: FeatIconKey }> = ({ name }) => (
  <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {FEAT_PATHS[name].map((d) => (
      <path key={d} d={d} />
    ))}
  </svg>
);

const ProductCard: React.FC<{ spot: Spot }> = ({ spot }) => {
  const dark = spot.key === 'feeder';
  const { desc, feats, stat, photoPos } = spot.card;
  return (
    <section
      aria-labelledby={`spot-band-${spot.key}`}
      className={`pcard group relative grid overflow-hidden rounded-3xl md:rounded-[2rem] border ${dark ? 'pcard-dark border-[#0A55A8] text-white' : 'pcard-light border-[#003F84]/25 text-[#1F2733]'}`}
    >
      <div className="pcard-media relative h-[190px] md:h-auto overflow-hidden bg-slate-200">
        <img
          src={spot.photo.src}
          srcSet={spot.photo.srcSet}
          sizes="(min-width: 1280px) 330px, (min-width: 768px) 280px, 100vw"
          alt={spot.photo.alt}
          width={spot.photo.width}
          height={spot.photo.height}
          loading="lazy"
          decoding="async"
          style={{ objectPosition: photoPos }}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
        />
      </div>

      <div className="pcard-body flex min-w-0 flex-col justify-center gap-2 md:gap-2.5 px-[18px] pt-4 pb-1 md:px-8 md:py-8 lg:ps-9 lg:pe-6">
        <p className={`flex items-center gap-2 text-[15px] font-extrabold ${dark ? 'text-[#FFC303]' : 'text-[#8A5A00]'}`}>
          <span className="h-[3px] w-5 rounded-sm bg-[#FFC303]" aria-hidden="true" />
          {spot.eyebrow}
        </p>
        <h2 id={`spot-band-${spot.key}`} className={`text-[26px] md:text-[34px] font-black leading-[1.4] ${dark ? 'text-white' : 'text-[#003F84]'}`}>
          {spot.name}
        </h2>
        <p className={`max-w-[620px] text-base md:text-[17px] leading-[1.85] ${dark ? 'text-white/[0.92]' : 'text-[#4A5568]'}`}>{desc}</p>
        <ul className="mt-1.5 grid max-w-[640px] grid-cols-1 sm:grid-cols-2 md:grid-cols-1 xl:grid-cols-2 gap-x-[18px] gap-y-2">
          {feats.map((f) => (
            <li key={f.text} className="flex items-center gap-2.5 text-[15px] font-bold leading-normal">
              <span
                className={`grid h-[30px] w-[30px] flex-none place-items-center rounded-[9px] ${
                  dark ? 'bg-white/[0.12] text-[#FFC303]' : 'bg-white text-[#003F84] shadow-[0_0_0_1px_#D6DFEB]'
                }`}
              >
                <FeatIcon name={f.icon} />
              </span>
              {f.text}
            </li>
          ))}
        </ul>
      </div>

      <div
        className={`pcard-aside relative flex flex-col justify-center gap-3.5 lg:gap-[18px] px-[18px] pt-3 pb-5 md:px-8 md:pb-8 md:pt-0 lg:py-7 lg:ps-8 lg:pe-7 lg:before:absolute lg:before:inset-y-9 lg:before:start-0 lg:before:border-s ${
          dark ? 'lg:before:border-white/[0.18]' : 'lg:before:border-[#D6DFEB]'
        }`}
      >
        <p
          className={`flex flex-row items-baseline gap-2.5 rounded-[14px] px-3.5 py-2.5 lg:flex-col lg:items-start lg:gap-0 lg:rounded-none lg:p-0 lg:bg-transparent lg:shadow-none ${
            dark ? 'bg-white/10' : 'bg-white shadow-[0_0_0_1px_#D6DFEB]'
          }`}
        >
          <span className={`whitespace-nowrap text-[28px] lg:text-[40px] font-black leading-[1.2] ${dark ? 'text-[#FFC303]' : 'text-[#003F84]'}`}>{stat.value}</span>
          <span className={`text-[15px] font-bold ${dark ? 'text-white/90' : 'text-[#4A5568]'}`}>{stat.unit}</span>
        </p>
        <div className="flex flex-col items-stretch gap-2.5">
          <Link
            to={spot.specsHref}
            className="group/cta inline-flex min-h-[52px] flex-1 items-center justify-center gap-2.5 whitespace-nowrap rounded-full bg-gradient-to-l from-[#FFC303] to-[#FFA800] px-[22px] text-[17px] font-black text-[#333333] shadow-[0_10px_24px_rgba(255,170,0,0.30)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#003F84]"
          >
            
            {t("مشاهده مشخصات")}
            <span className="grid h-[30px] w-[30px] place-items-center rounded-full bg-black/[0.12] transition-transform rtl:group-hover/cta:-translate-x-1 ltr:group-hover/cta:translate-x-1 motion-reduce:transition-none" aria-hidden="true">
              <ArrowLeft className="h-[18px] w-[18px] ltr:-scale-x-100" strokeWidth={2.4} />
            </span>
          </Link>
          <Link
            to="/contact"
            className={`inline-flex min-h-[46px] flex-1 items-center justify-center whitespace-nowrap rounded-full border-[1.5px] px-[22px] text-[15px] font-extrabold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
              dark
                ? 'border-white/60 text-white hover:bg-white/10 focus-visible:outline-[#FFC303]'
                : 'border-[#003F84] bg-white text-[#003F84] hover:bg-[#F2F6FB] focus-visible:outline-[#003F84]'
            }`}
          >
            {tr(CONSULT)}
          </Link>
        </div>
      </div>
    </section>
  );
};

export const HomeProductBands: React.FC = () => (
  <div className="space-y-4 md:space-y-6">
    {SPOTS.map((spot) => (
      <ProductCard key={spot.key} spot={translateDeep(spot)} />
    ))}
  </div>
);
