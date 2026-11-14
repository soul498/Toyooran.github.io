import type React from 'react';
import { SALES_PHONE_DISPLAY, SALES_PHONE_TEL } from './contact';
import { ABOUT_EYEBROW, ABOUT_PAGE_NAME, ABOUT_SUBTITLE } from './aboutCopy';
import { hasPersian, isEn, translateDeep } from '../i18n';
import { Building2, FileCheck, FlaskConical, Phone, Sparkles, type IconProps } from '../icons';
import type { CmsPageKey, PageHeroCms } from '../types';

export interface PageHeroConfig {
  title: string;
  subtitle: string;
  highlight?: string;
  eyebrow?: string;
  eyebrowIcon?: React.ComponentType<IconProps>;
  /** Optional call to action under the subtitle (internal route, tel: link or #anchor). */
  cta?: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
}

/**
 * Section heroes for nav routes, rendered by RouteHero in App.tsx outside the route
 * Suspense, so the hero (and its H1, the LCP) paints before the lazy page chunk arrives.
 * `title` is the page's only H1 and must stay equal to the prerender H1 (src/seo/resolveSeo.ts).
 */
export const PAGE_HEROES: Record<string, PageHeroConfig> = {
  '/services': {
    title: 'خدمات طراحی و تجهیز صنعت دام و طیور',
    highlight: 'دام و طیور',
    eyebrow: 'خدمات مهندسی و اجرایی',
    eyebrowIcon: Sparkles,
    subtitle: 'طیوران صنعت پویا با رویکردی یکپارچه، آمادگی دارد در پروژه‌های صنعتی و کشاورزی، از مرحله مطالعات اولیه، نیازسنجی و طراحی تا ساخت، تأمین تجهیزات، نصب، راه‌اندازی و پشتیبانی فنی مشارکت نماید.',
    cta: { label: 'درخواست مشاورهٔ رایگان', href: '/contact' },
  },
  '/projects': {
    title: 'پروژه‌های اجراشده',
    highlight: 'اجراشده',
    eyebrow: 'گزارش پروژه‌ها',
    eyebrowIcon: FileCheck,
    subtitle: 'گزارش پروژه‌های تجهیز سالن و خطوط خوراک به‌زودی در این بخش منتشر می‌شود؛ برای دریافت مشخصات فنی، درخواست مشاوره ثبت کنید.',
    cta: { label: 'درخواست مشاورهٔ رایگان', href: '/contact' },
  },
  '/magazine': {
    title: 'مجله تخصصی دام و طیور',
    highlight: 'دام و طیور',
    eyebrow: 'مجلهٔ تخصصی طیوران صنعت پویا',
    eyebrowIcon: Sparkles,
    subtitle: 'راهنماهای فنی انتخاب، نصب و نگهداری تجهیزات مرغداری: تهویه، گرمایش، دانخوری، آبخوری و نوسازی سالن',
  },
  '/about': {
    title: ABOUT_PAGE_NAME,
    highlight: ABOUT_PAGE_NAME,
    eyebrow: ABOUT_EYEBROW,
    eyebrowIcon: Building2,
    subtitle: ABOUT_SUBTITLE,
    cta: { label: 'درخواست مشاورهٔ رایگان', href: '/contact' },
  },
  '/rnd': {
    title: 'واحد تحقیق و توسعه',
    highlight: 'تحقیق و توسعه',
    eyebrow: 'تحقیق و توسعه',
    eyebrowIcon: FlaskConical,
    subtitle: 'بومی‌سازی تجهیزات مرغداری و خطوط خوراک با همکاری دانشگاه منابع طبیعی گلستان',
    cta: { label: 'تماس با واحد فنی', href: '/contact' },
  },
  '/contact': {
    title: 'تماس و درخواست مشاوره',
    highlight: 'درخواست مشاوره',
    eyebrow: 'مشاورهٔ رایگان و استعلام قیمت',
    eyebrowIcon: Phone,
    subtitle: `فرم را تکمیل کنید یا با \u2066${SALES_PHONE_DISPLAY}\u2069 تماس بگیرید.`,
    cta: { label: 'تماس تلفنی', href: SALES_PHONE_TEL },
    secondaryCta: { label: 'تکمیل فرم', href: '#consultation-form' },
  },
};

/** Hero for a (language-neutral) path, in the active language. */
const PAGE_KEY_BY_PATH: Partial<Record<string, CmsPageKey>> = {
  '/services': 'services',
  '/magazine': 'magazine',
  '/about': 'about',
  '/rnd': 'rnd',
  '/contact': 'contact',
};

/** Adds CMS-written copy while preserving the icons, links and structure authored in code. */
export const pageHeroFor = (
  pathname: string,
  overrides?: Partial<Record<CmsPageKey, PageHeroCms>>,
): PageHeroConfig | undefined => {
  const normalizedPath = pathname.replace(/\/+$/, '') || '/';
  const hero = PAGE_HEROES[normalizedPath];
  if (!hero) return undefined;
  const rawOverride = PAGE_KEY_BY_PATH[normalizedPath] ? overrides?.[PAGE_KEY_BY_PATH[normalizedPath]!] : undefined;
  // English copy is independent. A Persian CMS edit without an English edit must
  // keep the original English text instead of leaking the new Persian text.
  const english = rawOverride?.translations?.en;
  const safeEnglish = (value?: string) => value && !hasPersian(value) ? value : undefined;
  const cms = isEn() ? {
    title: safeEnglish(english?.title), subtitle: safeEnglish(english?.subtitle),
    eyebrow: safeEnglish(english?.eyebrow), ctaLabel: safeEnglish(english?.ctaLabel),
    secondaryCtaLabel: safeEnglish(english?.secondaryCtaLabel),
  } : rawOverride;
  const merged: PageHeroConfig = {
    ...hero,
    title: cms?.title || hero.title,
    subtitle: cms?.subtitle || hero.subtitle,
    eyebrow: cms?.eyebrow || hero.eyebrow,
    cta: cms?.ctaLabel && hero.cta ? { ...hero.cta, label: cms.ctaLabel } : hero.cta,
    secondaryCta: cms?.secondaryCtaLabel && hero.secondaryCta ? { ...hero.secondaryCta, label: cms.secondaryCtaLabel } : hero.secondaryCta,
  };
  return translateDeep(merged);
};

/** Real catalog file: public/TSPK_catalog.pdf, served by server.ts with Content-Disposition: attachment. */
export const CATALOG_PDF_HREF = '/TSPK_catalog.pdf';
