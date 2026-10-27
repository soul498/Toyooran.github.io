import type React from 'react';
import { SALES_PHONE_DISPLAY, SALES_PHONE_TEL } from './contact';
import { Building2, FileCheck, FlaskConical, Phone, Sparkles, type IconProps } from '../icons';

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
    subtitle: 'چهار حوزهٔ خدمت: ماشین‌آلات خوراک، تأمین و نصب تجهیزات، ساخت و نوسازی سالن، و خوراک و مکمل؛ با نیم قرن تجربه در صنعت دام و طیور.',
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
    title: 'درباره طیوران صنعت پویا',
    highlight: 'طیوران صنعت پویا',
    eyebrow: 'درباره شرکت',
    eyebrowIcon: Building2,
    subtitle: 'مشاور، طراح و مجری پروژه‌های دام، طیور و آبزیان با بیش از ۵۰ سال تجربه و ۲۰۰ پروژهٔ ملی و بین‌المللی',
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

export const pageHeroFor = (pathname: string): PageHeroConfig | undefined =>
  PAGE_HEROES[pathname.replace(/\/+$/, '') || '/'];

/** Real catalog file: public/TSPK_catalog.pdf, served by server.ts with Content-Disposition: attachment. */
export const CATALOG_PDF_HREF = '/TSPK_catalog.pdf';
