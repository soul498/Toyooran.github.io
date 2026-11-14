/**
 * Process photos of hall construction and equipping (user-supplied, Z:\tspk, approved 2026-11-14;
 * real photos, AI-enhanced). Files under public/images/site/ as <name>-<width>.{avif,webp}, made from
 * the originals with sharp (AVIF q50 / WebP q72). Alt text is Persian; English is in src/i18n/en/ui.json.
 * These are process imagery, not project reports: never label them as projects.
 */
export interface SitePhoto {
  /** Base path without width and extension, e.g. /images/site/about-field-team */
  base: string;
  widths: readonly number[];
  /** Intrinsic size of the largest file (for width/height attributes and aspect ratio). */
  width: number;
  height: number;
  alt: string;
}

const photo = (name: string, widths: readonly number[], width: number, height: number, alt: string): SitePhoto => ({
  base: `/images/site/${name}`, widths, width, height, alt,
});

export const sitePhotoSrcSet = (p: SitePhoto, format: 'avif' | 'webp') =>
  p.widths.map((w) => `${p.base}-${w}.${format} ${w}w`).join(', ');
export const sitePhotoSrc = (p: SitePhoto, width?: number) => `${p.base}-${width ?? p.widths[p.widths.length - 1]}.webp`;

/** Home hero (photo 05): landscape for ≥768px, a 4:5 crop centred on the middle feeder/drinker line below. */
export const HOME_HERO_PHOTO = photo('home-hero-hall', [960, 1366, 1672], 1672, 941, 'سالن مرغداری تجهیزشده با خطوط دانخوری و آبخوری زرد');
export const HOME_HERO_MOBILE_PHOTO = photo('home-hero-hall-mobile', [480, 750], 750, 937, HOME_HERO_PHOTO.alt);
/** Key the home hero uses in Hero.tsx; LazyHeroImage renders the responsive sources for it. */
export const HOME_HERO_KEY = '/images/site/home-hero-hall-1672.webp';

/** Home service card «تجهیزات دام و طیور» (photo 10): chicks along a feeder line, 800×800 crop. */
export const HOME_EQUIPMENT_CARD_IMAGE = '/images/site/home-equipment-operation-800.webp';

export const ABOUT_PHOTOS = {
  panorama: photo('about-hall-panorama', [640, 1024, 1600], 1600, 666, 'نمای کامل سالن مرغداری تجهیزشده با خطوط دانخوری و آبخوری'),
  design: photo('about-design-drawing', [640, 1024], 1024, 576, 'طرح مفهومی سازهٔ قوسی سالن مرغداری (تصویرسازی)'),
  structureFrame: photo('about-structure-frame', [640, 1024], 1024, 576, 'برپایی اسکلت فلزی قوسی سالن در محل اجرا'),
  structureShell: photo('about-structure-shell', [640, 1024], 1024, 576, 'فضای داخلی سالن پس از اجرای سازه و پوشش'),
  delivery: photo('about-equipment-delivery', [640, 1024], 1024, 576, 'تخلیهٔ تجهیزات دانخوری از کامیون در محل سالن'),
  installLayout: photo('about-installation-layout', [640, 1024], 1024, 461, 'آماده‌سازی و چیدمان قطعات خطوط دانخوری در سالن'),
  installCrew: photo('about-installation-crew', [640, 1024], 1024, 576, 'تیم نصب در حال نصب خط دانخوری در سالن مرغداری'),
  installLines: photo('about-installation-lines', [640, 1024], 1024, 576, 'نصب و تنظیم خطوط دانخوری و آبخوری در سالن'),
  operation: photo('about-operation', [640, 1024], 1024, 576, 'جوجه‌ها در کنار خط دانخوری در سالن در حال بهره‌برداری'),
  fieldTeam: photo('about-field-team', [640, 1024], 1024, 768, 'هماهنگی تیم فنی و بررسی تجهیزات در محل اجرا'),
} as const;
