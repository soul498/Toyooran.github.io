import type React from 'react';
import { Building2, FileCheck, FlaskConical, Phone, Sparkles, type IconProps } from '../icons';

export interface PageHeroConfig {
  title: string;
  subtitle: string;
  highlight?: string;
  eyebrow?: string;
  eyebrowIcon?: React.ComponentType<IconProps>;
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
    subtitle: 'از طراحی سوله تا نصب دانخوری، تهویه و گرمایش — استعلام فنی از طیوران صنعت پویا',
  },
  '/projects': {
    title: 'پروژه‌های اجراشده',
    highlight: 'اجراشده',
    eyebrow: 'مطالعات موردی',
    eyebrowIcon: FileCheck,
    subtitle: 'نمونه‌کارهای تجهیز سالن و خطوط خوراک به‌زودی در این بخش منتشر می‌شود',
  },
  '/magazine': {
    title: 'مجله تخصصی دام و طیور',
    highlight: 'دام و طیور',
    eyebrow: 'مجله تخصصی طیوران صنعت پویا',
    eyebrowIcon: Sparkles,
    subtitle: 'راهنماهای تجهیز، تهویه، گرمایش و نوسازی سالن مرغداری',
  },
  '/about': {
    title: 'درباره طیوران صنعت پویا',
    highlight: 'طیوران صنعت',
    eyebrow: 'توسعه صنعتی و تجهیزات مدرن',
    eyebrowIcon: Building2,
    subtitle: 'مشاور، طراح و مجری پروژه‌های دام، طیور و آبزیان با بیش از ۵۰ سال تجربه',
  },
  '/rnd': {
    title: 'واحد تحقیق و توسعه',
    highlight: 'تحقیق و توسعه',
    eyebrow: 'آینده صنعت دام و طیور',
    eyebrowIcon: FlaskConical,
    subtitle: 'بومی‌سازی تجهیزات مرغداری و خطوط خوراک با همکاری دانشگاه منابع طبیعی گلستان',
  },
  '/contact': {
    title: 'تماس و درخواست مشاوره',
    highlight: 'درخواست مشاوره',
    eyebrow: 'ارتباط هوشمند با طیوران صنعت پویا',
    eyebrowIcon: Phone,
    subtitle: 'مشاوره رایگان، استعلام قیمت و ارتباط با دفتر مشهد و واحد فنی گرگان',
  },
};

export const pageHeroFor = (pathname: string): PageHeroConfig | undefined =>
  PAGE_HEROES[pathname.replace(/\/+$/, '') || '/'];
