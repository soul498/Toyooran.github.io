import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from '../../icons';
import { FEEDER_PHOTO, HEATER_PHOTO, type ProductPhoto } from '../../data/productPhotos';

/**
 * «محصولات شاخص»: دانخوری پروانه‌ای پویا + جت هیتر (copy: site_hero_review/NEW_SECTIONS_REVIEW.md).
 * - HomeProductBands: one section, two small cards, one CTA; under the home hero, above «خدمات».
 * - ProductsSpotlightPanel: compact panel (max three bullets per card, one CTA) above the /products catalog.
 * Only approved facts: feeder from the magazine article and the verified 3–5% feed-waste saving; the
 * heater card has no unverified component or capacity claims. Product codes are never shown here.
 */

type SpotKey = 'feeder' | 'heater';
type Spot = {
  key: SpotKey;
  name: string;
  label?: string;
  line: string;
  points: string[];
  photo: ProductPhoto;
  href: string;
  linkHome: string;
  linkPanel: string;
};

export const HEATER_ARTICLE_HREF = '/magazine/imachine-jet-heater';

const SPOTS: Spot[] = [
  {
    key: 'feeder',
    name: 'دانخوری پروانه‌ای پویا',
    label: 'تولید طیوران صنعت پویا',
    line: 'تغذیهٔ جوجه از روز اول بدون سینی دان؛ کاهش ۳ تا ۵ درصدی هدررفت دان.',
    points: [
      'تغذیهٔ جوجه از روز اول، بدون سینی دان',
      'لبهٔ ضدپاشش؛ کاهش ۳ تا ۵ درصدی هدررفت دان',
      'پلی‌پروپیلن نو، مقاوم به UV و مواد ضدعفونی؛ عمر بیش از ۱۰ سال',
    ],
    photo: FEEDER_PHOTO,
    href: '/magazine/introduction-to-pouya-butterfly-feeder',
    linkHome: 'معرفی محصول',
    linkPanel: 'معرفی کامل محصول',
  },
  {
    key: 'heater',
    name: 'جت هیتر',
    line: 'گرمایش سالن مرغداری؛ ظرفیت مناسب هر سالن با مشاورهٔ کارشناسان تعیین می‌شود.',
    points: ['گرمایش سالن مرغداری', 'انتخاب ظرفیت متناسب با سالن، با مشاورهٔ رایگان کارشناسان'],
    photo: HEATER_PHOTO,
    href: HEATER_ARTICLE_HREF,
    linkHome: 'مشاهدهٔ جت هیترها',
    linkPanel: 'مشاهدهٔ جت هیترها',
  },
];

const CONSULT = 'درخواست مشاورهٔ رایگان';

/** Fixed-size, lazy product photo filling its frame (cover, centred: the product sits in the centre). */
const SpotPhoto: React.FC<{ photo: ProductPhoto; sizes: string }> = ({ photo, sizes }) => (
  <img
    src={photo.src}
    srcSet={photo.srcSet}
    sizes={sizes}
    alt={photo.alt}
    width={photo.width}
    height={photo.height}
    loading="lazy"
    decoding="async"
    className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
  />
);

/** The single amber CTA of each section. */
const ConsultCta: React.FC<{ className?: string }> = ({ className = '' }) => (
  <Link
    to="/contact"
    className={`group/cta bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black px-6 sm:px-8 py-3.5 rounded-2xl inline-flex items-center justify-center gap-3 shadow-[0_10px_30px_rgba(251,191,36,0.3)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${className}`}
  >
    <span className="text-sm whitespace-nowrap">{CONSULT}</span>
    <span className="w-7 h-7 rounded-full bg-slate-950/10 flex items-center justify-center transition-transform group-hover/cta:-translate-x-1">
      <ArrowLeft className="w-4 h-4" aria-hidden="true" />
    </span>
  </Link>
);

/** Text link whose ::after covers the whole card, so the card is clickable without nesting links. */
const CardLink: React.FC<{ to: string; label: string; name: string }> = ({ to, label, name }) => (
  <Link
    to={to}
    aria-label={`${label}: ${name}`}
    className="mt-auto inline-flex items-center gap-1.5 text-[13px] sm:text-sm font-bold text-amber-300 hover:text-amber-200 after:absolute after:inset-0 after:content-[''] after:rounded-[inherit] focus-visible:outline-none focus-visible:after:ring-2 focus-visible:after:ring-amber-400"
  >
    {label}
    <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" aria-hidden="true" />
  </Link>
);

const Glows = () => (
  <>
    <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[radial-gradient(circle_at_center,_rgba(245,158,11,0.08)_0%,_transparent_70%)] -translate-y-1/2 translate-x-1/2 pointer-events-none" aria-hidden="true" />
    <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[radial-gradient(circle_at_center,_rgba(96,165,250,0.08)_0%,_transparent_70%)] translate-y-1/2 -translate-x-1/2 pointer-events-none" aria-hidden="true" />
  </>
);

/* ------------------------------ Home: one section, two small cards ------------------------------ */

const HomeCard: React.FC<{ spot: Spot }> = ({ spot }) => (
  <article className="group relative grid grid-cols-[7.5rem_minmax(0,1fr)] sm:grid-cols-[11rem_minmax(0,1fr)] rounded-[1.75rem] overflow-hidden border border-white/10 bg-white/[0.05] hover:bg-white/[0.08] transition-colors">
    <div className="relative min-h-[8.5rem] sm:min-h-[9.5rem] overflow-hidden bg-white">
      <SpotPhoto photo={spot.photo} sizes="(min-width: 640px) 176px, 120px" />
    </div>
    <div className="flex flex-col p-4 sm:p-5 min-w-0">
      {spot.label ? <span className="text-[10px] sm:text-[11px] font-bold text-amber-300/90 mb-1">{spot.label}</span> : null}
      <h3 className="text-lg sm:text-xl font-black text-white">{spot.name}</h3>
      <p className="mt-1 mb-3 text-[12px] sm:text-sm text-blue-100/90 leading-relaxed font-medium">{spot.line}</p>
      <CardLink to={spot.href} label={spot.linkHome} name={spot.name} />
    </div>
  </article>
);

export const HomeProductBands: React.FC = () => (
  <section
    aria-labelledby="home-featured-heading"
    className="relative w-full rounded-[2.5rem] overflow-hidden bg-gradient-to-r from-[#001c3d] via-[#002d61] to-[#003F86] border border-blue-800 shadow-xl p-4 sm:p-6 lg:p-8"
  >
    <Glows />
    {/* One CTA: under the cards on mobile, beside the heading from sm up (grid order, no duplicate link). */}
    <div className="relative z-10 grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center gap-4 lg:gap-6">
      <h2 id="home-featured-heading" className="order-1 text-xl sm:text-3xl font-black text-white">محصولات شاخص</h2>
      <div className="order-2 sm:order-3 sm:col-span-2 grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
        {SPOTS.map((spot) => (
          <HomeCard key={spot.key} spot={spot} />
        ))}
      </div>
      <ConsultCta className="order-3 sm:order-2 w-full sm:w-auto" />
    </div>
  </section>
);

/* ------------------------------ /products: compact panel ------------------------------ */

const PanelCard: React.FC<{ spot: Spot }> = ({ spot }) => (
  <article className="group relative grid grid-cols-[6.5rem_minmax(0,1fr)] sm:grid-cols-[38%_minmax(0,1fr)] rounded-[1.5rem] overflow-hidden border border-white/10 bg-white/[0.04] hover:bg-white/[0.07] transition-colors">
    <div className="relative min-h-[9rem] sm:min-h-[11rem] overflow-hidden bg-white">
      <SpotPhoto photo={spot.photo} sizes="(min-width: 1024px) 220px, (min-width: 640px) 38vw, 104px" />
    </div>
    <div className="flex flex-col p-4 sm:p-5 min-w-0">
      <h3 className="font-black text-lg sm:text-xl text-white">{spot.name}</h3>
      <ul className="mt-2 mb-3 space-y-1.5">
        {spot.points.map((p) => (
          <li key={p} className="flex items-start gap-2 text-[12px] sm:text-[13px] leading-relaxed font-medium text-blue-50/90">
            <span className="mt-[0.45rem] h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" aria-hidden="true" />
            <span>{p}</span>
          </li>
        ))}
      </ul>
      <CardLink to={spot.href} label={spot.linkPanel} name={spot.name} />
    </div>
  </article>
);

export const ProductsSpotlightPanel: React.FC = () => (
  <section
    aria-labelledby="products-spotlight-heading"
    className="spot-blueprint relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-blue-950 via-[#06245a] to-indigo-950 p-4 sm:p-6 lg:p-8 text-white"
  >
    <div className="relative grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center gap-4 sm:gap-x-4 sm:gap-y-6">
      <h2 id="products-spotlight-heading" className="order-1 font-black text-xl sm:text-2xl tracking-tight">
        محصولات شاخص
      </h2>
      <div className="order-2 sm:order-3 sm:col-span-2 grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
        {SPOTS.map((spot) => (
          <PanelCard key={spot.key} spot={spot} />
        ))}
      </div>
      <ConsultCta className="order-3 sm:order-2 w-full sm:w-auto" />
    </div>
  </section>
);
