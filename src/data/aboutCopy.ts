/**
 * Copy of the /about page, approved by the user on 2026-11-13 (source: ABOUT_v1_2026-11-13.md).
 * Shared by the page (src/components/AboutPage.tsx), its hero (src/data/pageHeroes.ts), the
 * server prerender (src/seo/resolveSeo.ts) and the admin pages tab defaults. English is in src/i18n/en/ui.json.
 */
export const ABOUT_PAGE_NAME = "درباره" as const;
export const ABOUT_TITLE = "درباره | طیوران صنعت پویا، بیش از نیم قرن تجربه در صنایع دام، طیور و آبزیان" as const;
export const ABOUT_SUBTITLE = "همراهی تخصص، مهندسی و تولید در توسعه زیرساخت‌های صنعت دام، طیور و آبزیان" as const;
export const ABOUT_EYEBROW = "طیوران صنعت پویا" as const;
export const ABOUT_INTRO_HEADING = "معرفی" as const;
export const ABOUT_INTRO_PARAGRAPHS = [
  "طیوران صنعت پویا با اتکا به بیش از نیم قرن تجربهٔ تخصصی مؤسسان و مدیران خود در صنایع دام، طیور و آبزیان، در زمینهٔ مشاوره، طراحی، ساخت، تجهیز، راه‌اندازی و توسعهٔ پروژه‌های صنعتی و کشاورزی فعالیت می‌کند.",
  "این مجموعه از مطالعات اولیه و نیازسنجی تا طراحی، ساخت، تأمین تجهیزات، نصب، راه‌اندازی و پشتیبانی فنی، در کنار پروژه حضور دارد.",
] as const;
export const ABOUT_ACTIVITIES_HEADING = "حوزه‌های فعالیت" as const;
/** Six numbered areas of activity: [title, description]. */
export const ABOUT_ACTIVITIES = [
  ["طراحی و ساخت سالن‌ها و سازه‌های صنعتی", "سالن‌های پرورش دام و طیور، زیرساخت‌های آبزی‌پروری و سوله‌های تولیدی و انبارداری، با سازهٔ سبک و پوشش ساندویچ‌پنل. تیم مهندسی و اجرایی طیوران صنعت پویا بیش از ۱۵ سال سابقهٔ اجرای پروژه‌های صنعتی در سراسر کشور را دارد."],
  ["تجهیز و راه‌اندازی واحدهای پرورشی و تولیدی", "دانخوری و آبخوری، جت هیتر و گرمایش، تهویه، پد خنک‌کننده و مه‌پاش، کنترل شرایط محیطی، به‌همراه نصب، آموزش و پشتیبانی."],
  ["تولید و تأمین ماشین‌آلات صنعتی", "با برند IMACHINE: طراحی و راه‌اندازی خطوط تولید خوراک پلت و اکسترود دام، طیور و آبزیان."],
  ["تأمین و تولید محصولات تغذیه", "خوراک آماده، کنسانتره، مکمل و پیش‌مخلوط (Premix) و نهاده‌های تولید خوراک."],
  ["توسعه و نوسازی زیرساخت‌ها", "ارزیابی فنی واحدهای فعال، افزایش ظرفیت، بازسازی و بهینه‌سازی تغذیه، تهویه و گرمایش."],
  ["همکاری فنی، پژوهشی و انتقال دانش", "همکاری علمی با دانشگاه علوم کشاورزی و منابع طبیعی گلستان و پارک علم و فناوری، در تحقیق و توسعه، سامانه‌های هوشمند و آموزش نیروی متخصص."],
] as const;
export const ABOUT_FLAGSHIP_HEADING = "محصول شاخص: دانخوری پروانه‌ای پویا" as const;
export const ABOUT_FLAGSHIP_TEXT = "دانخوری پروانه‌ای پویا (Butterfly Feeder) محصول اختصاصی طیوران صنعت پویا و حاصل طراحی و توسعهٔ تخصصی در تجهیزات تغذیهٔ طیور است. طیوران صنعت پویا تولیدکنندهٔ انحصاری این محصول در خاورمیانه است و آن را با پنج سال ضمانت بی‌قیدوشرط عرضه می‌کند." as const;
export const ABOUT_FLAGSHIP_CTA = "مشاهده مشخصات" as const;
/** Same destination as the home feeder card's «مشاهده مشخصات» (ProductSpotlight, product ts-114). */
export const ABOUT_FLAGSHIP_HREF = "/products/pouya-butterfly-feeder" as const;
export const ABOUT_INTERNATIONAL_HEADING = "همکاری‌های بین‌المللی" as const;
export const ABOUT_INTERNATIONAL_TEXT = "طیوران صنعت پویا از همکاری با مجموعه‌های دولتی و خصوصی و سرمایه‌گذاران در بازارهای منطقه‌ای و بین‌المللی استقبال می‌کند: اجرای پروژه‌های کامل پرورشی و کارخانه‌های خوراک، صادرات تجهیزات و ماشین‌آلات، نوسازی واحدهای موجود، سرمایه‌گذاری مشترک و انتقال دانش فنی." as const;
