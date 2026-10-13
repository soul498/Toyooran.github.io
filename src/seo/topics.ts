export type MagazineTopic = { slug: string; label: string; h1: string; title: string; intro: string };

/** Fixed topic tags; each has an indexable hub at /magazine/topic/<slug>. */
export const MAGAZINE_TOPICS: MagazineTopic[] = [
  { slug: "ventilation", label: "تهویه", h1: "مقالات تهویه سالن مرغداری", title: "مقالات تهویه مرغداری | مجله طیوران صنعت پویا", intro: "راهنماهای فنی دربارهٔ محاسبهٔ ظرفیت تهویه، تهویهٔ حداقلی و تونلی، پنجرهٔ اینلت و فن‌های سالن مرغداری." },
  { slug: "heating", label: "گرمایش", h1: "مقالات گرمایش سالن مرغداری", title: "مقالات گرمایش مرغداری | مجله طیوران صنعت پویا", intro: "مقایسه و راهنمای انتخاب جت‌هیتر، هیتر کابینتی و سیستم‌های تابشی، برآورد مصرف سوخت و ایمنی احتراق در سالن مرغداری." },
  { slug: "feed-water", label: "دان و آب", h1: "مقالات سیستم دانخوری و آبخوری مرغداری", title: "مقالات دانخوری و آبخوری مرغداری | مجله طیوران صنعت پویا", intro: "راهنمای انتخاب و تنظیم دانخوری بشقابی، پروانه‌ای و زنجیری، خط انتقال دان و سیستم آبخوری سالن مرغداری." },
  { slug: "house-equipment", label: "تجهیز سالن", h1: "مقالات طراحی و تجهیز سالن مرغداری", title: "مقالات تجهیز سالن مرغداری | مجله طیوران صنعت پویا", intro: "طراحی، تجهیز و نوسازی سالن مرغداری: هزینه و اجزای تجهیز، اشتباه‌های رایج طراحی و گزارش پروژه‌های اجراشده." },
];

export function findTopic(slug?: string): MagazineTopic | undefined {
  return slug ? MAGAZINE_TOPICS.find((t) => t.slug === slug) : undefined;
}

export const topicPath = (topic: MagazineTopic) => `/magazine/topic/${topic.slug}`;
