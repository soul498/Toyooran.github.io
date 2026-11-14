import type { Article, CategoryItem, CompanyInfo, Product, Project, Service } from "../types";
import { withMediaVersion } from "../lib/mediaUrl";
import { articleBlocks } from "./articleBlocks";
import { MAGAZINE_TOPICS, findTopic, localTopics, topicPath } from "./topics";
import { resolveProductCards, PRODUCT_CARDS_HEADING, PRODUCT_CARD_IMG } from "./productCards";
import { effectiveSeoDescription, effectiveSeoTitle, isPublicArticle, sortArticlesNewestFirst } from "./articleMeta";
import { isSafeHref, isSafeImageSrc } from "./safeUrl";
import { homePriorityProducts, relatedInCategory } from "./internalLinks";
import { blocksToHtml, inlinePlain, inlineToHtml, type RichBlock } from "./richText";
import { OFFICE_PHONE_DISPLAY, OFFICE_PHONE_E164, OFFICE_PHONE_TEL, SALES_PHONE_DISPLAY, SALES_PHONE_E164, SALES_PHONE_TEL } from '../data/contact';
import { removedProductRedirect } from '../data/removedProducts';
import { PUBLIC_SERVICE_IDS } from "../data/mockData";
import { isDisabledPagePath, isServiceDisabled, rewriteDisabledHref } from "../data/disabledPages";
import { SERVICE_PAGES, SERVICE_PAGE_LABELS, findServicePage, servicePagePath, type ServicePageData } from "../data/servicePages";
import { sitePhotoSrc } from "../data/sitePhotos";
import { PRODUCT_SLUG_BY_ID, productAliasTarget } from "./productUrls";
import {
  ABOUT_ACTIVITIES, ABOUT_ACTIVITIES_HEADING, ABOUT_FLAGSHIP_CTA, ABOUT_FLAGSHIP_HEADING, ABOUT_FLAGSHIP_HREF,
  ABOUT_FLAGSHIP_TEXT, ABOUT_INTERNATIONAL_HEADING, ABOUT_INTERNATIONAL_TEXT, ABOUT_INTRO_HEADING,
  ABOUT_INTRO_PARAGRAPHS, ABOUT_PAGE_NAME, ABOUT_SUBTITLE, ABOUT_TITLE,
  ABOUT_CTA_LABEL, ABOUT_CTA_TEXT, ABOUT_PROCESS_HEADING, ABOUT_PROCESS_INTRO, ABOUT_PROCESS_STEPS,
} from "../data/aboutCopy";
import { faDigits } from "../lib/faDigits";

import { EN_PREFIX, isEn, keepFa, lp, t, tf, tr, translateDeep } from '../i18n';
export const CANONICAL_ORIGIN = "https://www.toyooran.com";
export const FITOUT_SERVICE_ID = "srv-turnkey-shed";
export const FITOUT_SLUG = "poultry-hall-fitout";

export const SEO_REDIRECTS: Record<string, string> = {
  "/magazine/poultry-hall-audit-checklist": "/magazine/before-and-after-renovation",
};

// body: one-paragraph intro (inline **bold** / [label](/path) allowed; categoryIntro() returns plain text).
// intro: optional longer approved copy rendered under it, identically in #seo-prerender and the client catalog.
const CATEGORY_SEO_FA: Record<string, { title: string; h1: string; description: string; body: string; intro?: RichBlock[] }> = {
  ventilation: {
    title: "هواکش و تهویه سالن مرغداری | طیوران صنعت پویا",
    h1: "هواکش و سیستم تهویه سالن مرغداری",
    description: "فن ۱۰۰ و ۱۴۰، اینلت و محاسبه تعداد هواکش بر اساس سطح مقطع سالن. استعلام فنی از طیوران صنعت پویا.",
    body: "انتخاب فن بر اساس سطح مقطع سالن، سرعت هوای تونلی و ظرفیت در فشار استاتیک واقعی است نه ظرفیت اسمی کاتالوگ. اینلت، پد و کنترلر باید با همان محاسبه هماهنگ شوند.",
  },
  heating: {
    title: "جت هیتر و گرمایش مرغداری | طیوران صنعت پویا",
    h1: "سیستم گرمایش سالن مرغداری",
    description: "هیتر گازی و دوگانه‌سوز برای سالن گوشتی؛ مقایسه با تابشی در مشاوره فنی طیوران صنعت پویا.",
    body: "جت‌هیتر، کابینتی یا تابشی بر اساس عایق سازه، نوع سوخت، تهویه حداقل و توزیع دما انتخاب می‌شود. رقم مصرف سوخت واحد برای همه سالن‌ها ادعا نمی‌شود.",
  },
  feeding: {
    title: "دانخوری پروانه‌ای و بشقابی | طیوران صنعت پویا",
    h1: "دانخوری اتومات مرغداری",
    description: "دانخوری پروانه‌ای پویا و بشقابی؛ ظرفیت خط، تنظیم دان، شست‌وشو و استعلام از طیوران صنعت پویا.",
    body: "برای دانخوری اتومات باید تعداد خط، فاصله بشقاب، ارتفاع لبه، قابلیت تغذیه از یک‌روزگی و شست‌وشو مشخص شود. دانخوری پروانه‌ای پویا برای کاهش پرت دان و حذف سینی هفته اول طراحی شده؛ ظرفیت خط پس از ابعاد سالن محاسبه می‌شود. استعلام شامل نقشه چیدمان است نه فقط قیمت بشقاب.",
  },
  drinking: {
    title: "آبخوری نیپل مرغداری | طیوران صنعت پویا",
    h1: "سیستم آبخوری سالن مرغداری",
    description: "آبخوری نیپل و تجهیزات آب سالن مرغداری. درخواست مشاوره فنی از طیوران صنعت پویا.",
    body: "نیپل، فشارشکن و شیب خط باید با ظرفیت گله و کیفیت آب هماهنگ شود تا بستر خشک بماند.",
  },
  cooling: {
    title: "سرمایش و پد سلولزی مرغداری | طیوران صنعت پویا",
    h1: "سیستم سرمایش سالن مرغداری",
    description: "پد سلولزی و سرمایش سالن مرغداری. استعلام فنی از طیوران صنعت پویا.",
    body: "پد و مهپاش فقط وقتی مؤثرند که دبی فن و آب‌رسانی پد با اقلیم و سطح مقطع سالن جور باشد.",
  },
  inlet: {
    title: "اینلت سالن مرغداری | طیوران صنعت پویا",
    h1: "دریچه اینلت سالن مرغداری",
    description: "اینلت و ورودی هوای سالن مرغداری؛ فشار منفی، یکنواختی هوا و مشاوره انتخاب از طیوران صنعت پویا.",
    body: "اینلت باید با ظرفیت فن، فشار منفی هدف و فصل پرورش انتخاب شود. جانمایی نادرست نقطه کور و باد سرد روی بستر می‌سازد. در استعلام، عرض سالن، ارتفاع و نوع تهویه (حداقل/تونلی) لازم است تا تعداد و زاویه دریچه مشخص شود.",
  },
  silo: {
    // Distinct from the product "سیلو و انتقال دان" (ts-109) so the category hub and product don't share a title.
    title: "سیلو دان و سیستم انتقال دان مرغداری | طیوران صنعت پویا",
    h1: "سیلو و سیستم انتقال دان مرغداری",
    description: "سیلو ذخیره دان، خط انتقال دان اوگر و آسیاب میکسر برای سالن مرغداری. استعلام فنی از طیوران صنعت پویا.",
    body: "این دسته سیلو و سیستم انتقال دان مرغداری را در بر می‌گیرد و مسیر دان را از ذخیره تا داخل سالن پوشش می‌دهد. دان در سیلو نگهداری می‌شود، با خط انتقال اوگر به هاپر سالن می‌رسد و از آنجا وارد خطوط دانخوری می‌شود. اگر دان در خود فارم تهیه شود، آسیاب، میکسر و بالابر هم به این زنجیره اضافه می‌شوند. سه محصول این دسته همین سه حلقه‌اند.",
    intro: [
      { h2: "محصولات این دسته" },
      {
        ul: [
          "**سیلو ذخیره‌ی دان:** سیلوی پیچ و مهره‌ای با ورق گالوانیزه‌ی کرکره‌ای، ظرفیت استاندارد ۲.۵ تا ۳۰ تن و ظرفیت سفارشی تا ۱۰۰ تن، روی ۴ تا ۱۰ پایه‌ی لوله‌ای. نردبان حفاظ‌دار، پنجره‌ی بازدید و اهرمی برای باز کردن دریچه‌ی بالایی از پایین دارد. مونتاژ و دمونتاژ آن ساده است.",
          "**سیستم انتقال دان:** خط انتقال با اوگر فنری فولادی داخل لوله‌ی ضدسایش، که دان را از سیلو به هاپرهای سالن می‌برد. سنسور خازنی انتهای خط، وقتی هاپر پر شد، خط را متوقف می‌کند.",
          "**آسیاب، میکسر و بالابر:** مجموعه‌ی تهیه‌ی دان در فارم، شامل آسیاب چکشی یا غلطکی، میکسر عمودی یا افقی و بالابر پیچی، در ظرفیت‌های ۱، ۲، ۳، ۴ و ۵ تن در ساعت.",
        ],
      },
      { h2: "انتخاب بر چه اساسی است" },
      { p: "اندازه‌ی سیلو و طول خط انتقال از مصرف دان سالن و فاصله‌ی دفعات تحویل دان به دست می‌آید. برای برآورد، کارشناس این اطلاعات را لازم دارد:" },
      {
        ul: [
          "تعداد سالن‌ها و ظرفیت هر سالن در هر دوره",
          "نوع پرورش: گوشتی، تخمگذار یا مادر",
          "فاصله‌ی محل سیلو تا سالن و جای ورودی خط به سالن",
          "دان آماده خریداری می‌شود یا در فارم تهیه می‌شود",
          "وضعیت زمین محل نصب سیلو و دسترسی کامیون حمل دان",
          "برق در دسترس برای موتور خط انتقال و، در صورت نیاز، آسیاب و میکسر",
        ],
      },
      { p: "خط انتقال باید با سیستم دانخوری داخل سالن هماهنگ باشد. برای دیدن بشقاب‌ها و خطوط دانخوری، به دسته‌ی [بشقاب دانخوری](/products/feeding) سر بزنید. برای طراحی کامل سالن، صفحه‌ی [تجهیز و نوسازی سالن مرغداری](/services/poultry-hall-fitout) را ببینید." },
      { h2: "استعلام فنی" },
      { p: "تعداد و ظرفیت سالن‌ها و فاصله‌ی سیلو تا سالن را از طریق [فرم تماس](/contact) بفرستید تا کارشناس ابعاد سیلو و مسیر خط انتقال را بررسی کند." },
    ],
  },
  cage: {
    title: "قفس مرغداری تخمگذار، گوشتی و پولت | طیوران صنعت پویا",
    h1: "قفس مرغداری",
    description: "قفس باتری مرغ تخمگذار، قفس مرغ گوشتی، قفس پولت و آشیانه اتوماتیک. استعلام فنی از طیوران صنعت پویا.",
    body: "قفس مرغداری برای سالن‌هایی است که پرورش در چند طبقه و با خطوط خودکار دان، آب، کود و جمع‌آوری انجام می‌شود. در این دسته چهار سیستم آمده است: قفس باتری مرغ تخمگذار، قفس مرغ گوشتی، قفس پولت و آشیانه‌ی تمام اتوماتیک مرغ مادر. هر کدام برای یک مرحله یا نوع پرورش طراحی شده و جای یکدیگر را نمی‌گیرند.",
    intro: [
      { h2: "محصولات این دسته" },
      {
        ul: [
          "**قفس مرغ تخمگذار (باتری):** قفس تمام مکانیزه با کانوایر جمع‌آوری تخم‌مرغ، نوار کودکش پلی‌پروپیلن و خطوط اتومات دانخوری و آبخوری نیپل. تعداد طبقات از ۳ تا ۱۲ طبقه و عرض خط انتقال ۵۰ سانتی‌متر آلومینیومی است.",
          "**قفس مرغ گوشتی:** سیستم تمام اتوماتیک با کفی پلیمری منعطف، کانوایر افقی و عمودی برای تخلیه‌ی مرغ در پایان دوره، دو خط دانخوری بشقابی در هر سلول و نوار کودکش PP.",
          "**قفس پولت:** برای دوره‌ی پرورش پولت تخمگذار، با بدنه‌ی گالوانیزه و رنگ الکترواستاتیک، فاصله‌ی پایه‌ی ۶۰ سانتی‌متر و چهار نیپل استیل در هر سلول.",
          "**آشیانه‌ی تمام اتوماتیک:** لانه‌ی تخمگذاری برای مرغ مادر و پرورش بستری، با نوار جمع‌آوری PP که سرعتش با اینورتر تنظیم می‌شود و اسلت پلاستیکی در ابعاد ۶۰×۱۲۰ و ۶۰×۱۰۰ سانتی‌متر.",
        ],
      },
      { h2: "انتخاب قفس بر چه اساسی است" },
      { p: "انتخاب قفس از نوع پرورش شروع می‌شود، نه از مدل محصول. برای برآورد، کارشناس معمولاً این اطلاعات را می‌خواهد:" },
      {
        ul: [
          "نوع پرورش و مرحله‌ی گله: تخمگذار، گوشتی، پولت یا مادر",
          "طول، عرض و ارتفاع مفید سالن، چون تعداد ردیف و طبقه را تعیین می‌کند",
          "ظرفیت مدنظر در هر دوره",
          "وضعیت کف و سازه برای تحمل بار قفس و تجهیزات",
          "برنامه‌ی تخلیه‌ی کود و مسیر انتقال تخم‌مرغ یا مرغ تا بیرون سالن",
          "وضعیت تهویه و برق فعلی، چون پرورش چندطبقه هوای بیشتری در حجم کمتر جابه‌جا می‌کند",
        ],
      },
      { p: "قفس جدا از بقیه‌ی سالن کار نمی‌کند. خط دان، آب، تهویه و گرمایش باید با چیدمان قفس هماهنگ طراحی شوند. اگر سالن را از نو تجهیز یا نوسازی می‌کنید، صفحه‌ی [تجهیز و نوسازی سالن مرغداری](/services/poultry-hall-fitout) کل این فرایند را توضیح می‌دهد." },
      { h2: "استعلام فنی" },
      { p: "ابعاد سالن، نوع پرورش و ظرفیت مدنظر را از طریق [فرم تماس](/contact) بفرستید تا کارشناس سیستم مناسب و چیدمان پیشنهادی را بررسی کند." },
    ],
  },
  other: {
    title: "سایر تجهیزات و ماشین‌آلات دام و طیور | طیوران صنعت پویا",
    h1: "سایر تجهیزات و ماشین‌آلات دام و طیور",
    description: "سایر ادوات، اتوماسیون و ماشین‌آلات تخصصی صنعت دام و طیور. استعلام فنی از طیوران صنعت پویا.",
    body: "بیشتر تجهیزات سالن مرغداری در دسته‌های اصلی سایت آمده‌اند: [گرمایش](/products/heating)، [تهویه](/products/ventilation)، [سرمایش](/products/cooling)، [اینلت](/products/inlet)، [آبخوری](/products/drinking) و [بشقاب دانخوری](/products/feeding). این دسته برای اقلام و پکیج‌هایی است که در یکی از آن دسته‌ها نمی‌گنجند، یا ترکیبی از چند سیستم‌اند.",
    intro: [
      { h2: "محصولات فعلی این دسته" },
      {
        ul: [
          "**سیستم تهویه تونلی مرغداری:** پکیج تهویه‌ی تونلی و عرضی سالن مرغداری. هواکش‌های این پکیج ۱۴۰×۱۴۰ سانتی‌متر با بدنه‌ی ورق گالوانیزه، پروانه‌ی استیل و دمپر گریز از مرکز هستند. دمپر وقتی هواکش خاموش است بسته می‌ماند و جلوی ورود هوای بیرون را می‌گیرد.",
        ],
      },
      { h2: "اگر دنبال تجهیز خاصی هستید" },
      { p: "اگر قطعه یا دستگاهی را که لازم دارید در این دسته یا دسته‌های اصلی پیدا نکردید، به این معنا نیست که تأمین نمی‌شود. فهرست سایت همه‌ی اقلام را نشان نمی‌دهد. در استعلام این موارد را بنویسید تا کارشناس سریع‌تر بررسی کند:" },
      {
        ul: [
          "نام یا کاربرد تجهیز و، اگر دارید، مدل یا عکس نمونه‌ی فعلی",
          "نوع پرورش و ابعاد سالن",
          "این‌که تجهیز برای سالن نو است یا جایگزین دستگاه موجود",
          "برق و سوخت در دسترس محل",
        ],
      },
      { p: "تجهیز تکی وقتی درست کار می‌کند که با بقیه‌ی سیستم‌های سالن هماهنگ باشد. یک هواکش اضافه، بدون هماهنگی با اینلت و کنترل، ممکن است مشکل تهویه را حل نکند. برای همین کارشناس ممکن است درباره‌ی بقیه‌ی تجهیزات سالن هم سؤال بپرسد." },
      { h2: "چرا این دسته کوچک است" },
      { p: "فهرست محصولات سایت به‌تدریج کامل می‌شود. هر وقت تجهیز تازه‌ای به فهرست اضافه شود که در دسته‌های اصلی جا نگیرد، در همین صفحه می‌آید. تا آن زمان، استعلام مستقیم سریع‌ترین راه است." },
      { h2: "استعلام فنی" },
      { p: "مشخصات تجهیز مدنظر و شرایط سالن را از طریق [فرم تماس](/contact) بفرستید تا کارشناس امکان تأمین و سازگاری آن با سالن را بررسی کند." },
    ],
  },
};

/** Category copy for the active language (Persian source; English via the dictionary). */
function catSeo(slug: string) {
  const m = CATEGORY_SEO_FA[slug];
  return m ? translateDeep(m) : undefined;
}

/** H1 of the /products hub. The company covers the whole livestock & poultry industry, not only poultry halls. */
export const PRODUCTS_HUB_H1 = "فروشگاه";

/**
 * Single source of truth for the catalog H1 (server prerender and client UI must match).
 * "all"/empty → hub H1; known category → CATEGORY_SEO h1, else the category's own title.
 */
export function catalogHeading(slug: string | undefined, categories: { id: string; title: string }[] = []): string {
  if (!slug || slug === "all") return tr(PRODUCTS_HUB_H1);
  return catSeo(slug)?.h1 || categories.find((c) => c.id === slug)?.title || tr(PRODUCTS_HUB_H1);
}

export const FITOUT_CHECKLIST = [
  "عایق سقف و دیوار و هوابندی سازه",
  "برق، دیزل و تابلو متناسب با فن و هیتر",
  "آب، فشارشکن و شیب خط آبخوری",
  "تهویه: فن، اینلت، پد و کنترل اقلیم",
  "گرمایش متناسب با اقلیم و عایق",
  "خطوط دان و آب و دسترسی شست‌وشو",
  "ایمنی گاز، اگزوز و خروج اضطراری",
];

export const FITOUT_LEAD =
  "نوسازی و تجهیز کامل سالن مرغداری یعنی سازه، دان، آب، تهویه و گرمایش در یک فرایند تحویل می‌شود تا ناهماهنگی سازنده سوله و نصاب تجهیزات تکرار نشود. کار از مشاوره و طراحی سازه شروع می‌شود، با اسکلت و پوشش عایق ادامه می‌یابد و با نصب خطوط و تحویل آماده جوجه‌ریزی تمام می‌شود.";

export type SeoCatalog = {
  products: Product[];
  services: Service[];
  projects: Project[];
  articles: Article[];
  categories: CategoryItem[];
  company: CompanyInfo;
  collectionUpdatedAt?: Partial<Record<"products" | "services" | "projects" | "articles" | "companyInfo", string | null>>;
};

export type SeoDoc = {
  title: string;
  description: string;
  h1: string;
  ogType: string;
  body: string;
  jsonLd: unknown[];
  robots: string;
  canonicalHref: string | null;
  notFound?: boolean;
  lastmod?: string;
  ogImage?: string;
};

export function stripQuery(rawPath: string): string {
  const pathOnly = (rawPath || "/").split("?")[0].split("#")[0];
  if (pathOnly.length > 1 && pathOnly.endsWith("/")) return pathOnly.slice(0, -1);
  return pathOnly || "/";
}

/** Decode percent-encoded path once. Express/nginx may pass either form; never throw on bad %. */
export function decodePathname(pathname: string): string {
  try {
    return decodeURIComponent(pathname);
  } catch {
    return pathname;
  }
}

export function publicSegments(pathname: string): string[] {
  return decodePathname(stripQuery(pathname)).split("/").filter(Boolean);
}

export function canonicalPath(pathname: string): string {
  return `${CANONICAL_ORIGIN}${pathname === "/" ? "/" : pathname}`;
}

export const PRIVATE_APP_PREFIXES = ["/admin", "/login", "/dashboard", "/crm", "/api"] as const;

export function isPrivateAppPath(pathname: string): boolean {
  const path = decodePathname(stripQuery(pathname));
  return PRIVATE_APP_PREFIXES.some((prefix) => path === prefix || path.startsWith(`${prefix}/`));
}

function listedServices(catalog: SeoCatalog): Service[] {
  const byId = new Map(catalog.services.map((s) => [s.id, s]));
  return PUBLIC_SERVICE_IDS.map((id) => byId.get(id)).filter((s): s is Service => Boolean(s) && !isServiceDisabled(s!.id));
}

/** `<li>` links to the six service pages (src/data/servicePages.ts), in the user's order. */
function servicePageLinks(): string {
  return SERVICE_PAGES.map((s) => `<li><a href="${servicePagePath(s)}">${escapeHtml(tr(s.title))}</a></li>`).join("");
}

/** Related product links of a service page: fixed links plus catalog products (by id) at their public URL. */
export function servicePageRelated(page: ServicePageData, products: Product[]): { label: string; href: string }[] {
  const fixed = (page.related || []).map((l) => ({ label: tr(l.label), href: l.href }));
  const fromCatalog = (page.relatedProductIds || [])
    .map((id) => products.find((p) => String(p.id).toLowerCase() === id))
    .filter((p): p is Product => Boolean(p))
    .map((p) => ({ label: p.name, href: publicProductPath(p) }));
  return [...fixed, ...fromCatalog];
}

function servicePageBody(page: ServicePageData, catalog: SeoCatalog): string {
  const p = (text: string) => `<p>${escapeHtml(tr(text))}</p>`;
  const related = servicePageRelated(page, catalog.products);
  const others = SERVICE_PAGES.filter((s) => s.slug !== page.slug)
    .map((s) => `<li><a href="${servicePagePath(s)}">${escapeHtml(tr(s.title))}</a></li>`)
    .join("");
  const sections = (page.sections || [])
    .map(
      (sec) =>
        `<h2>${escapeHtml(tr(sec.heading))}</h2>${sec.paragraphs.map(p).join("")}${
          sec.items?.length ? `<ul>${sec.items.map((i) => `<li><strong>${escapeHtml(tr(i.label))}:</strong> ${escapeHtml(tr(i.text))}</li>`).join("")}</ul>` : ""
        }`
    )
    .join("\n");
  return `${page.intro.map(p).join("")}
<h2>${escapeHtml(tr(page.listHeading))}</h2>
<ul>${page.items.map((i) => `<li>${escapeHtml(tr(i))}</li>`).join("")}</ul>
${(page.outro || []).map(p).join("")}
${page.feature ? `<h2>${escapeHtml(tr(page.feature.heading))}</h2>${p(page.feature.text)}<p><a href="${page.feature.href}">${escapeHtml(tr(page.feature.cta))}</a></p>` : ""}
${sections}
${related.length ? `<h2>${tr(SERVICE_PAGE_LABELS.related)}</h2><ul>${related.map((l) => `<li><a href="${l.href}">${escapeHtml(l.label)}</a></li>`).join("")}</ul>` : ""}
<h2>${tr(SERVICE_PAGE_LABELS.ctaHeading)}</h2>
<p><a href="/contact">${tr(SERVICE_PAGE_LABELS.cta)}</a></p>
<p>${tr(SERVICE_PAGE_LABELS.phones)} <a href="${SALES_PHONE_TEL}" dir="ltr">${tr(SALES_PHONE_DISPLAY)}</a> · ${tr(SERVICE_PAGE_LABELS.office)} <a href="${OFFICE_PHONE_TEL}" dir="ltr">${tr(OFFICE_PHONE_DISPLAY)}</a></p>
<h2>${tr(SERVICE_PAGE_LABELS.others)}</h2>
<ul>${others}</ul>`;
}

/** `<a>` to the fitout service page, or to /services while that page is switched off. */
function fitoutLink(label: string): string {
  const href = isServiceDisabled(FITOUT_SERVICE_ID) ? "/services" : `/services/${FITOUT_SLUG}`;
  return `<a href="${href}">${label}</a>`;
}

/** Safety net for prerender HTML: links to switched-off service pages go to /services. */
function unlinkDisabled(html: string): string {
  return html.replace(/<a href="([^"]*)"([^>]*)>([\s\S]*?)<\/a>/g, (whole, href: string, attrs: string, text: string) =>
    isDisabledPagePath(href) ? `<a href="${rewriteDisabledHref(href)}"${attrs}>${text}</a>` : whole
  );
}

export function publicServicePath(service: Service): string {
  if (service.id === FITOUT_SERVICE_ID) return `/services/${FITOUT_SLUG}`;
  return `/services/${service.id}`;
}

export function publicProductPath(product: Product): string {
  return `/products/${productSeoSlug(product)}`;
}

export function productSeoSlug(product: Product): string {
  const forced = PRODUCT_SLUG_BY_ID[String(product.id || "").toLowerCase()];
  if (forced) return forced;
  const custom = String(product.slug || "").trim().toLowerCase();
  if (/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(custom)) return custom;
  const code = String(product.code || product.id || "").toLowerCase();
  const name = String(product.slugName || product.name || "")
    .trim()
    .replace(/[()[\].,،/\\+#]+/g, " ")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return name ? `${name}-${code}` : code;
}

export function findProduct(slug: string, source: SeoCatalog | Product[]): Product | undefined {
  const decoded = decodePathname(slug);
  const products = Array.isArray(source) ? source : source.products;
  const exact = products.find(
    (p) => p.id === decoded || p.code === decoded || productSeoSlug(p) === decoded || productSeoSlug(p) === slug
  );
  if (exact) return exact;
  // Old name slugs (e.g. after a product was renamed) still end in the stable code: `<old-name>-ts-057`.
  // Resolve them by that code so the server 301s to the current canonical slug.
  const m = decoded.toLowerCase().match(/-(ts-\d{3})$/);
  return m ? products.find((p) => String(p.code || p.id || "").toLowerCase() === m[1]) : undefined;
}

export function seoRedirectFor(pathname: string, catalog: SeoCatalog): string | null {
  const path = decodePathname(stripQuery(pathname));
  if (SEO_REDIRECTS[path]) return SEO_REDIRECTS[path];
  const parts = publicSegments(path);

  if (parts[0] === "products" && parts.length >= 2) {
    const slug = parts[1];
    if (isCategorySlug(slug, catalog)) {
      const leaf = `/products/${slug}`;
      return leaf !== path ? leaf : null;
    }
    const alias = productAliasTarget(slug);
    if (alias) {
      const aliased = catalog.products.find((item) => item.id === alias.productId) || findProduct(slug, catalog);
      if (aliased) {
        const canonical = publicProductPath(aliased);
        return canonical !== path ? canonical : null;
      }
      return alias.fallback !== path ? alias.fallback : null;
    }
    const product = findProduct(slug, catalog);
    if (!product) return parts.length === 2 ? removedProductRedirect(slug) : null;
    const canonical = publicProductPath(product);
    return canonical !== path ? canonical : null;
  }

  if (parts[0] === "services" && parts.length >= 2) {
    const service = findService(parts[1], catalog);
    if (!service) return null;
    const leaf = publicServicePath(service);
    return leaf !== path ? leaf : null;
  }

  if (parts[0] === "magazine" && parts.length >= 2) {
    const slug = parts[1];
    const aliasHit = catalog.articles.find((article) => article.id !== slug && isPublicArticle(article) && article.aliases?.includes(slug));
    if (aliasHit && parts.length === 2) return `/magazine/${aliasHit.id}`;
    if (parts.length > 2 && catalog.articles.some((article) => article.id === slug && isPublicArticle(article))) return `/magazine/${slug}`;
  }

  // No projects are published yet: the index and every project URL go to /services.
  if (parts[0] === "projects") return "/services";

  return null;
}

export function escapeHtml(value: unknown): string {
  // CMS records may carry null/number fields; a TypeError here used to become an HTTP 500.
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function isoDay(value?: string | null): string | undefined {
  if (!value) return undefined;
  const m = value.match(/^(\d{4}-\d{2}-\d{2})/);
  return m ? m[1] : undefined;
}

function collectionDay(catalog: SeoCatalog, key: keyof NonNullable<SeoCatalog["collectionUpdatedAt"]>): string | undefined {
  return isoDay(catalog.collectionUpdatedAt?.[key] || undefined);
}

function orgSchema(company: CompanyInfo) {
  const sameAs = Object.values(company.socialLinks || {}).filter((url) => Boolean(url && url.startsWith("http")));
  return {
    "@type": "Organization",
    "@id": `${CANONICAL_ORIGIN}/#org`,
    name: company.nameFa,
    alternateName: company.nameEn,
    url: CANONICAL_ORIGIN,
    telephone: SALES_PHONE_E164,
    contactPoint: [
      { "@type": "ContactPoint", telephone: SALES_PHONE_E164, contactType: "sales", name: t("مشاوره، فروش و پشتیبانی"), areaServed: "IR", availableLanguage: "fa" },
      { "@type": "ContactPoint", telephone: OFFICE_PHONE_E164, contactType: "customer service", name: t("تلفن دفتر"), areaServed: "IR", availableLanguage: "fa" },
    ],
    email: company.email || undefined,
    address: {
      "@type": "PostalAddress",
      addressCountry: "IR",
      addressLocality: t("مشهد"),
      streetAddress: company.address,
    },
    sameAs,
  };
}

function breadcrumb(items: { name: string; path: string }[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: canonicalPath(item.path),
    })),
  };
}

/** Plain-text one-paragraph intro (markup stripped). */
export function categoryIntro(slug: string): string | undefined {
  const body = catSeo(slug)?.body;
  return body ? inlinePlain(body) : undefined;
}

/** Raw intro paragraph (may contain inline **bold** / [label](/path)) for rich rendering. */
export function categoryIntroRich(slug: string): string | undefined {
  return catSeo(slug)?.body;
}

/** Longer approved category copy, rendered under the intro on server and client. */
export function categoryIntroBlocks(slug: string): RichBlock[] | undefined {
  return catSeo(slug)?.intro;
}

function categoryMeta(slug: string, catalog: SeoCatalog) {
  { const m = catSeo(slug); if (m) return m; }
  const cat = catalog.categories.find((c) => c.id === slug);
  if (!cat) return null;
  return {
    title: `${cat.title} | ${t("طیوران صنعت پویا")}`,
    h1: catalogHeading(slug, catalog.categories),
    description: cat.description,
    body: cat.description,
  };
}

function isCategorySlug(slug: string, catalog: SeoCatalog) {
  return Boolean(CATEGORY_SEO_FA[slug] || catalog.categories.some((c) => c.id === slug));
}

function articleShareImage(image?: string): string | undefined {
  if (!image || image.startsWith("data:") || image.startsWith("blob:")) return undefined;
  if (image.startsWith("http://") || image.startsWith("https://")) return image;
  const path = image.startsWith("/") ? image : `/${image}`;
  return `${CANONICAL_ORIGIN}${withMediaVersion(path)}`;
}

const FAQ_HEADING_RE = /^(پرسش‌های متداول|پرسش های متداول|سؤالات متداول|سوالات متداول)/;

/**
 * Q&A pairs for FAQPage JSON-LD: every h3 + following paragraphs in a "faq" article,
 * or only inside a "پرسش‌های متداول" h2 section of any other article.
 * Text is the same visible copy with inline markup stripped.
 */
function faqEntities(article: Article): { q: string; a: string }[] {
  const all = articleBlocks(article.content || []);
  let blocks = all;
  if (article.category !== "faq") {
    const start = all.findIndex((b) => b.type === "h2" && FAQ_HEADING_RE.test(b.text.trim()));
    if (start < 0) return [];
    const rest = all.slice(start + 1);
    const end = rest.findIndex((b) => b.type === "h2");
    blocks = end < 0 ? rest : rest.slice(0, end);
  }
  const pairs: { q: string; a: string }[] = [];
  let index = 0;
  while (index < blocks.length) {
    const question = blocks[index];
    if (question?.type === "h3" && question.text.trim()) {
      const answers: string[] = [];
      let cursor = index + 1;
      while (cursor < blocks.length) {
        const answer = blocks[cursor];
        if (answer?.type !== "p") break;
        const text = inlinePlain(answer.text).trim();
        if (!text) break;
        answers.push(text);
        cursor += 1;
      }
      if (answers.length) {
        pairs.push({ q: inlinePlain(question.text).trim(), a: answers.join(" ") });
        index = cursor;
        continue;
      }
    }
    index += 1;
  }
  return pairs;
}

function articleHtml(article: Article, products: Product[] = []): string {
  return articleBlocks(article.content)
    .map((block) => {
      if (block.type === "h2") return `<h2>${escapeHtml(block.text)}</h2>`;
      if (block.type === "h3") return `<h3>${inlineToHtml(block.text)}</h3>`;
      if (block.type === "p") return `<p>${inlineToHtml(block.text).replace(/\n/g, "<br>")}</p>`;
      if (block.type === "ul") return `<ul>${block.items.map((item) => `<li>${inlineToHtml(item)}</li>`).join("")}</ul>`;
      if (block.type === "img") {
        if (!isSafeImageSrc(block.src)) return "";
        return `<figure><img src="${escapeHtml(block.src)}" alt="${escapeHtml(block.alt)}" />${(block.caption ?? block.alt) ? `<figcaption>${escapeHtml(block.caption ?? block.alt)}</figcaption>` : ""}</figure>`;
      }
      if (block.type === "products") {
        const cards = resolveProductCards(block.ids, products);
        if (!cards.length) return "";
        const items = cards
          .map((c) => `<li>${c.image ? `<img src="${escapeHtml(c.image)}" alt="${escapeHtml(c.name)}" width="${PRODUCT_CARD_IMG.width}" height="${PRODUCT_CARD_IMG.height}" loading="lazy" decoding="async" />` : ""}<h3><a href="${escapeHtml(c.href)}">${escapeHtml(c.name)}</a></h3>${c.model ? `<p>${t("مدل:")} ${escapeHtml(c.model)}</p>` : ""}${c.spec ? `<p>${escapeHtml(c.spec)}</p>` : ""}<a href="${escapeHtml(c.href)}">${t("مشاهده محصول")}</a></li>`)
          .join("");
        return `<section aria-label="${tr(PRODUCT_CARDS_HEADING)}"><h2>${tr(PRODUCT_CARDS_HEADING)}</h2><ul>${items}</ul></section>`;
      }
      if (block.type === "cta") {
        if (!isSafeHref(block.href)) return "";
        return `<p><a href="${escapeHtml(rewriteDisabledHref(block.href))}">${escapeHtml(block.label)}</a></p>`;
      }
      const head = `<tr>${block.headers.map((cell) => `<th>${inlineToHtml(cell)}</th>`).join("")}</tr>`;
      const body = block.rows.map((row) => `<tr>${row.map((cell) => `<td>${inlineToHtml(cell)}</td>`).join("")}</tr>`).join("");
      return `<table>${head}${body}</table>`;
    })
    .join("\n");
}

function articleTagsHtml(article: Article): string {
  const topic = findTopic(article.topic);
  const parts: string[] = [];
  if (topic) parts.push(`<p>${t("موضوع:")} <a href="${topicPath(topic)}">${escapeHtml(topic.label)}</a></p>`);
  if (article.categoryLabel) parts.push(`<p>${t("دسته:")} ${escapeHtml(article.categoryLabel)}</p>`);
  const tags = (article.tags || []).filter(Boolean);
  if (tags.length) parts.push(`<p>${t("برچسب‌ها:")} ${tags.map((tag) => escapeHtml(tag)).join(isEn() ? ", " : "، ")}</p>`);
  return parts.join("\n");
}

function snippet(text: string | undefined, maxWords = 18): string {
  const words = String(text || "").replace(/\.\.\.$/, "").split(/\s+/).filter(Boolean);
  return words.length > maxWords ? `${words.slice(0, maxWords).join(" ")}…` : words.join(" ");
}

function indexableArticles(catalog: SeoCatalog): Article[] {
  return sortArticlesNewestFirst(catalog.articles.filter((a) => isPublicArticle(a) && !a.noindex));
}

function servicesForCategory(category: string, catalog: SeoCatalog): Service[] {
  return listedServices(catalog).filter((s) => s.relatedEquipmentCategories?.includes(category));
}

function productBody(product: Product, catalog?: SeoCatalog): string {
  const specs = (product.specs || [])
    .slice(0, 12)
    .map((s) => `<li>${escapeHtml(s.label)}: ${escapeHtml(s.value)}</li>`)
    .join("");
  const advantages = (product.advantages || [])
    .slice(0, 8)
    .map((item) => `<li>${escapeHtml(item)}</li>`)
    .join("");
  const applications = (product.applications || [])
    .slice(0, 8)
    .map((item) => `<li>${escapeHtml(item)}</li>`)
    .join("");
  const feedingCta =
    product.category === "feeding"
      ? `<p><a href="/contact">${t("محاسبه تعداد خطوط دانخوری")}</a></p>`
      : "";
  const intro = categoryIntro(product.category);
  const siblings = (catalog ? relatedInCategory(product, catalog.products, 6) : [])
    .map((p) => `<li><a href="${publicProductPath(p)}">${escapeHtml(p.name)}</a></li>`)
    .join("");
  const articles = catalog
    ? indexableArticles(catalog)
        .filter((a) => a.relatedProductIds?.includes(product.id) || product.relatedArticleIds?.includes(a.id))
        .map((a) => `<li><a href="/magazine/${a.id}">${escapeHtml(product.articleLinkLabels?.[a.id] || a.title)}</a></li>`)
        .join("")
    : "";
  const services = catalog
    ? servicesForCategory(product.category, catalog)
        .map((s) => `<li><a href="${publicServicePath(s)}">${escapeHtml(s.title)}</a></li>`)
        .join("")
    : "";
  const crumbs = `<nav aria-label="${t("مسیر صفحه")}"><a href="/">${t("خانه")}</a> › <a href="/products">${t("محصولات")}</a> › <a href="/products/${escapeHtml(product.category)}">${escapeHtml(product.categoryTitle)}</a> › ${escapeHtml(product.name)}</nav>`;
  // Real <img> for crawlers and an early, high-priority fetch of the hero photo (same URL as the client
  // LazyImage, so the client render hits the cache). All product photos are 16:9. `hidden` keeps it out
  // of layout: a laid-out image inside the clipped #seo-prerender produced a 0.47 CLS in Lighthouse.
  const heroSrc = product.image ? withMediaVersion(product.image) : "";
  const hero = heroSrc
    ? `<img src="${escapeHtml(heroSrc)}" alt="${escapeHtml(product.imageAlt || product.name)}" width="800" height="450" loading="eager" fetchpriority="high" decoding="async" hidden />`
    : "";
  return `${crumbs}
${hero}
<p>${escapeHtml(product.fullDescription || product.shortDescription)}</p>
${blocksToHtml(product.details)}
<p>${t("دسته:")} <a href="/products/${escapeHtml(product.category)}">${escapeHtml(product.categoryTitle)}</a></p>
${specs ? `<h2>${tf("مشخصات فنی {name}", { name: escapeHtml(product.name) })}</h2><ul>${specs}</ul>` : ""}
${advantages ? `<h2>${t("ویژگی‌ها")}</h2><ul>${advantages}</ul>` : ""}
${applications ? `<h2>${t("کاربردها")}</h2><ul>${applications}</ul>` : ""}
${intro ? `<h2>${tf("نکته انتخاب در {category}", { category: escapeHtml(product.categoryTitle) })}</h2><p>${escapeHtml(intro)}</p>` : ""}
${articles ? `<h2>${t("راهنمای مرتبط")}</h2><ul>${articles}</ul>` : ""}
${fitoutLink("") || services ? `<h2>${t("خدمات مرتبط")}</h2><ul>${fitoutLink("") ? `<li>${fitoutLink(t("تجهیز و نوسازی سالن مرغداری"))}</li>` : ""}${services}</ul>` : ""}
${siblings ? `<h2>${tf("محصولات دیگر {category}", { category: escapeHtml(product.categoryTitle) })}</h2><ul>${siblings}</ul>` : ""}
${feedingCta}
<p><a href="/contact">${tf("استعلام قیمت و مشخصات فنی {name}", { name: escapeHtml(product.name) })}</a> · <a href="/TSPK_catalog.pdf">${t("دانلود کاتالوگ PDF")}</a></p>`;
}

function serviceBody(service: Service, h1: string, catalog: SeoCatalog): string {
  const provide = service.whatWeProvide.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
  const steps = (service.workflow || [])
    .map((step) => `<li>${escapeHtml(step.title)}: ${escapeHtml(step.description)} — ${t("خروجی:")} ${escapeHtml(step.deliverable)}</li>`)
    .join("");
  const isFitout = service.id === FITOUT_SERVICE_ID;
  const checklist = isFitout ? `<h2>${t("چک‌لیست ممیزی قبل از نوسازی")}</h2><ul>${FITOUT_CHECKLIST.map(tr).map((i) => `<li>${escapeHtml(i)}</li>`).join("")}</ul>` : "";
  const faqs = (service.faqs || []).map((f) => `<h3>${escapeHtml(f.q)}</h3><p>${escapeHtml(f.a)}</p>`).join("");
  const related = catalog.projects
    .filter((p) => service.sampleProjectIds?.includes(p.id))
    .map((p) => `<li><a href="/projects/${p.id}">${escapeHtml(p.title)}</a> — ${escapeHtml(p.location)}</li>`)
    .join("");
  const lead = isFitout ? `<p>${escapeHtml(tr(FITOUT_LEAD))}</p>` : `<p>${escapeHtml(service.tagline)}</p>`;
  const suitable = (service.suitableFor || []).map((item) => `<li>${escapeHtml(item)}</li>`).join("");
  const relatedCats = (service.relatedEquipmentCategories || [])
    .map((id) => catalog.categories.find((c) => c.id === id))
    .filter((c): c is CategoryItem => Boolean(c))
    .map((c) => `<li><a href="/products/${c.id}">${escapeHtml(c.title)}</a> — ${escapeHtml(c.description)}</li>`)
    .join("");
  const auditLink = isFitout
    ? ` · <a href="/magazine/before-and-after-renovation">${t("قبل و بعد از نوسازی")}</a> · <a href="/contact">${t("درخواست ممیزی")}</a>`
    : "";
  return `${lead}
<p>${escapeHtml(service.problemSolved)}</p>
<h2>${tf("دامنه کار {title}", { title: escapeHtml(h1) })}</h2>
<ul>${provide}</ul>
${steps ? `<h2>${t("فرایند اجرا")}</h2><ol>${steps}</ol>` : ""}
${checklist}
${suitable ? `<h2>${t("مناسب برای")}</h2><ul>${suitable}</ul>` : ""}
${relatedCats ? `<h2>${t("تجهیزات مرتبط")}</h2><ul>${relatedCats}</ul>` : ""}
${related ? `<h2>${t("پروژه‌های مرتبط")}</h2><ul>${related}</ul>` : ""}
${faqs ? `<h2>${t("پرسش‌های متداول")}</h2>${faqs}` : ""}
<p><a href="/contact">${t("درخواست بازدید و پیشنهاد فنی")}</a> · <a href="/products">${t("مشاهده تجهیزات")}</a>${auditLink}</p>`;
}

function projectBody(project: Project): string {
  const cs = project.caseStudy;
  const steps = cs?.processSteps?.map((s) => `<li>${escapeHtml(s.title)}: ${escapeHtml(s.desc)}</li>`).join("") || "";
  const results = cs?.results?.map((r) => `<li>${escapeHtml(r.label)}: ${escapeHtml(r.value)} — ${escapeHtml(r.detail)}</li>`).join("") || "";
  return `<p>${escapeHtml(project.location)} — ${escapeHtml(project.year)} — ${t("ظرفیت:")} ${escapeHtml(project.capacity)}</p>
${project.keyOutcome ? `<p>${escapeHtml(project.keyOutcome)}</p>` : ""}
${cs ? `<p>${escapeHtml(cs.problem)}</p><p>${escapeHtml(cs.solution)}</p>` : ""}
${steps ? `<h2>${t("مراحل")}</h2><ol>${steps}</ol>` : ""}
${results ? `<h2>${t("نتیجه اعلام‌شده")}</h2><ul>${results}</ul>` : `<ul>${project.servicesProvided.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`}
<p><a href="/contact">${t("مشاوره پروژه مشابه")}</a></p>`;
}

export const HOME_LINKS_CATEGORIES_HEADING = "دسته‌های تجهیزات دام و طیور";
export const HOME_LINKS_PRODUCTS_HEADING = "محصولات پرکاربرد";

function homeExtras(catalog: SeoCatalog): string {
  const fitout = catalog.services.find((s) => s.id === FITOUT_SERVICE_ID);
  const steps = (fitout?.workflow || []).map((st) => `<li>${escapeHtml(st.title)}: ${escapeHtml(st.description)}</li>`).join("");
  const featured = catalog.products
    .filter((p) => p.isFeatured)
    .slice(0, 8)
    .map((p) => `<li><a href="${publicProductPath(p)}">${escapeHtml(p.name)}</a> — ${escapeHtml(snippet(p.shortDescription, 14))}</li>`)
    .join("");
  const posts = indexableArticles(catalog)
    .map((a) => `<li><a href="/magazine/${a.id}">${escapeHtml(a.title)}</a> — ${escapeHtml(snippet(a.summary, 20))}</li>`)
    .join("");
  const projects = catalog.projects
    .map((p) => `<li><a href="/projects/${p.id}">${escapeHtml(p.title)}</a> — ${escapeHtml(p.location)}</li>`)
    .join("");
  const catLinks = catalog.categories
    .map((c) => `<li><a href="/products/${escapeHtml(c.id)}">${escapeHtml(c.title)}</a></li>`)
    .join("");
  const popular = homePriorityProducts(catalog.products)
    .map((p) => `<li><a href="${publicProductPath(p)}">${escapeHtml(p.name)}</a></li>`)
    .join("");
  return `<h2>${t("نوسازی و تجهیز کامل سالن مرغداری")}</h2><p>${escapeHtml(tr(FITOUT_LEAD))}</p>
${steps ? `<ol>${steps}</ol>` : ""}
${catLinks ? `<h2>${tr(HOME_LINKS_CATEGORIES_HEADING)}</h2><ul>${catLinks}</ul>` : ""}
${popular ? `<h2>${tr(HOME_LINKS_PRODUCTS_HEADING)}</h2><ul>${popular}</ul>` : ""}
${featured ? `<h2>${t("محصولات پرفروش")}</h2><ul>${featured}</ul>` : ""}
${projects ? `<h2>${t("پروژه‌ها")}</h2><ul>${projects}</ul>` : ""}
${posts ? `<h2>${t("مجله تخصصی")}</h2><ul>${posts}</ul>` : ""}`;
}

function localBusinessNodes(company: CompanyInfo) {
  const locations = company.locations || [];
  return locations.map((loc) => ({
    "@type": loc.type === "factory" ? "LocalBusiness" : loc.type === "rd" ? "LocalBusiness" : "LocalBusiness",
    name: `${company.nameFa} — ${loc.title}`,
    parentOrganization: { "@id": `${CANONICAL_ORIGIN}/#org` },
    // The 051 landline is the Mashhad office line; the Gorgan R&D unit lists the mobile only.
    telephone: loc.type === "rd" ? SALES_PHONE_E164 : [SALES_PHONE_E164, OFFICE_PHONE_E164],
    address: {
      "@type": "PostalAddress",
      addressCountry: "IR",
      ...(loc.type === "rd" ? { addressLocality: t("گرگان") } : {}),
      streetAddress: loc.address,
    },
  }));
}

function findService(slug: string, catalog: SeoCatalog): Service | undefined {
  const id = slug === FITOUT_SLUG ? FITOUT_SERVICE_ID : slug;
  return catalog.services.find((s) => s.id === id);
}

function okDoc(partial: Omit<SeoDoc, "robots" | "canonicalHref"> & { path: string; robots?: string; lastmod?: string }): SeoDoc {
  return {
    ...partial,
    body: unlinkDisabled(partial.body),
    robots: partial.robots || "index, follow",
    canonicalHref: canonicalPath(partial.path),
  };
}

export function resolveSeo(pathname: string, catalog: SeoCatalog): SeoDoc {
  const path = decodePathname(stripQuery(pathname));
  const company = catalog.company;
  if (isPrivateAppPath(path)) {
    return {
      title: t("ورود مدیریت | طیوران صنعت پویا"),
      description: t("بخش خصوصی سامانه طیوران صنعت پویا."),
      h1: t("ورود مدیریت"),
      ogType: "website",
      body: "",
      jsonLd: [],
      robots: "noindex, nofollow, noarchive",
      canonicalHref: null,
    };
  }

  if (path === "/") {
    const serviceLinks = servicePageLinks();
    return okDoc({
      path,
      title: t("طیوران صنعت پویا | تجهیزات دام و طیور و نوسازی سالن مرغداری"),
      description:
        t("تأمین تجهیزات صنعت دام و طیور، ماشین‌آلات خوراک و طراحی و نوسازی سالن مرغداری: تهویه، گرمایش، دانخوری و آبخوری. استعلام فنی از طیوران صنعت پویا."),
      h1: t("طیوران صنعت پویا"),
      ogType: "website",
      lastmod: collectionDay(catalog, "companyInfo"),
      body: `<p>${t("طیوران صنعت پویا در صنعت دام و طیور فعال است: تأمین تجهیزات، ماشین‌آلات خوراک و طراحی و اجرای نوسازی سالن مرغداری. اعتبار دفاتر مشهد و واحد تحقیق و توسعه گرگان پشتوانه پروژه‌های اجرایی است.")}</p>
<p>${t("مشاوره، فروش و پشتیبانی:")} <a href="${SALES_PHONE_TEL}" dir="ltr">${tr(SALES_PHONE_DISPLAY)}</a></p>
<p>${t("تلفن دفتر:")} <a href="${OFFICE_PHONE_TEL}" dir="ltr">${tr(OFFICE_PHONE_DISPLAY)}</a></p>
<p>${escapeHtml(company.address)}</p>
<p>${t("واحد تحقیق و توسعه:")} ${escapeHtml(company.rdAddress || "")}</p>
<p>${[fitoutLink(t("نوسازی و تجهیز کامل سالن")), `<a href="/products">${t("تجهیزات دام و طیور")}</a>`, `<a href="/contact">${t("درخواست مشاوره")}</a>`].filter(Boolean).join(" · ")}</p>
${serviceLinks ? `<h2>${t("خدمات")}</h2>
<ul>${serviceLinks}</ul>` : ""}
<h2>${t("دسته‌های تجهیزات")}</h2>
<ul>${catalog.categories.map((c) => `<li><a href="/products/${c.id}">${escapeHtml(c.title)}</a> — ${escapeHtml(c.description)}</li>`).join("")}</ul>
${homeExtras(catalog)}`,
      jsonLd: [
        orgSchema(company),
        {
          "@type": "WebSite",
          "@id": `${CANONICAL_ORIGIN}/#website`,
          url: CANONICAL_ORIGIN,
          name: company.nameFa,
          publisher: { "@id": `${CANONICAL_ORIGIN}/#org` },
        },
      ],
    });
  }

  if (path === "/services") {
    const links = servicePageLinks();
    return okDoc({
      path,
      title: t("خدمات تجهیز دام و طیور و مرغداری | طیوران صنعت پویا"),
      description: t("از طراحی سالن تا نصب تهویه، گرمایش و سیستم دان. درخواست مشاوره فنی."),
      h1: t("خدمات طراحی و تجهیز صنعت دام و طیور"),
      ogType: "website",
      lastmod: collectionDay(catalog, "services"),
      body: `<p>${t("حوزه‌های اصلی فعالیت و خدمات طیوران صنعت پویا عبارت‌اند از:")}</p><ul>${links}</ul>`,
      jsonLd: [orgSchema(company), breadcrumb([{ name: t("خانه"), path: "/" }, { name: t("خدمات"), path: "/services" }])],
    });
  }

  const servicePage = path.startsWith("/services/") && publicSegments(path).length === 2 ? findServicePage(path.split("/")[2]) : undefined;
  if (servicePage) {
    const pagePath = servicePagePath(servicePage);
    const h1 = tr(servicePage.title);
    const description = tr(servicePage.description);
    return okDoc({
      path: pagePath,
      title: `${h1} | ${t("طیوران صنعت پویا")}`,
      description,
      h1,
      ogType: "website",
      ogImage: servicePage.photo ? `${CANONICAL_ORIGIN}${sitePhotoSrc(servicePage.photo)}` : undefined,
      lastmod: collectionDay(catalog, "services"),
      body: servicePageBody(servicePage, catalog),
      jsonLd: [
        orgSchema(company),
        {
          "@type": "Service",
          name: h1,
          serviceType: h1,
          description,
          provider: { "@id": `${CANONICAL_ORIGIN}/#org` },
          url: canonicalPath(pagePath),
          ...(servicePage.photo ? { image: `${CANONICAL_ORIGIN}${sitePhotoSrc(servicePage.photo)}` } : {}),
        },
        breadcrumb([
          { name: t("خانه"), path: "/" },
          { name: t("خدمات"), path: "/services" },
          { name: h1, path: pagePath },
        ]),
      ],
    });
  }

  if (path.startsWith("/services/") && publicSegments(path).length === 2) {
    const slug = path.split("/")[2];
    const service = isServiceDisabled(slug) ? undefined : findService(slug, catalog);
    if (service) {
      const isFitout = slug === FITOUT_SLUG || service.id === FITOUT_SERVICE_ID;
      const canonicalServicePath = publicServicePath(service);
      const title = isFitout
        ? t("تجهیز و نوسازی سالن مرغداری | طیوران صنعت پویا")
        : `${service.title} | ${t("طیوران صنعت پویا")}`;
      const h1 = isFitout ? t("تجهیز و نوسازی سالن مرغداری") : service.title;
      const description = isFitout
        ? t("محاسبه ظرفیت، انتخاب تجهیزات و اجرای نوسازی سالن گوشتی/تخم‌گذار. بازدید و پیشنهاد فنی.")
        : service.tagline;
      return okDoc({
        path: canonicalServicePath,
        title,
        description,
        h1,
        ogType: "website",
        lastmod: collectionDay(catalog, "services"),
        body: serviceBody(service, h1, catalog),
        jsonLd: [
          orgSchema(company),
          {
            "@type": "Service",
            name: h1,
            description,
            provider: { "@id": `${CANONICAL_ORIGIN}/#org` },
            areaServed: ["IR", t("مشهد"), t("گرگان")],
            url: canonicalPath(canonicalServicePath),
          },
          ...(service.faqs?.length
            ? [
                {
                  "@type": "FAQPage",
                  mainEntity: service.faqs.map((f) => ({
                    "@type": "Question",
                    name: f.q,
                    acceptedAnswer: { "@type": "Answer", text: f.a },
                  })),
                },
              ]
            : []),
          breadcrumb([
            { name: t("خانه"), path: "/" },
            { name: t("خدمات"), path: "/services" },
            { name: h1, path: canonicalServicePath },
          ]),
        ],
      });
    }
  }

  if (path === "/products") {
    const cats = catalog.categories
      .map((c) => {
        const count = catalog.products.filter((p) => p.category === c.id).length;
        const intro = categoryIntro(c.id);
        return `<li><a href="/products/${c.id}">${escapeHtml(c.title)}</a> (${tf("{n} محصول", { n: count })}) — ${escapeHtml(intro || c.description)}</li>`;
      })
      .join("");
    return okDoc({
      path,
      title: t("تجهیزات دام و طیور و مرغداری: تهویه، هیتر، دانخوری، آبخوری | طیوران صنعت پویا"),
      description: t("کاتالوگ تجهیزات صنعت دام و طیور: هواکش، جت‌هیتر، دانخوری پروانه‌ای، آبخوری نیپل، قفس و سیلو. استعلام قیمت."),
      h1: tr(PRODUCTS_HUB_H1),
      ogType: "website",
      lastmod: collectionDay(catalog, "products"),
      body: `<p>${t("کاتالوگ تجهیزات صنعت دام و طیور طیوران صنعت پویا؛ از تهویه، گرمایش، دانخوری و آبخوری سالن مرغداری تا قفس و سیلو.")}</p><ul>${cats}</ul><p><a href="/TSPK_catalog.pdf">${t("دانلود کاتالوگ PDF")}</a> · <a href="/contact">${t("استعلام قیمت")}</a></p>`,
      jsonLd: [orgSchema(company), breadcrumb([{ name: t("خانه"), path: "/" }, { name: tr(PRODUCTS_HUB_H1), path: "/products" }])],
    });
  }

  if (path.startsWith("/products/") && publicSegments(path).length === 2) {
    const slug = decodePathname(path.split("/")[2] || "");
    const category = categoryMeta(slug, catalog);
    if (category && isCategorySlug(slug, catalog)) {
      const inCategory = catalog.products.filter((p) => p.category === slug);
      // No slice: every product must have a crawlable link from its category (heating has 37).
      const items = inCategory
        .map((p) => `<li><a href="${publicProductPath(p)}">${escapeHtml(p.name)}</a> — ${escapeHtml(snippet(p.shortDescription))}</li>`)
        .join("");
      const ids = new Set(inCategory.map((p) => p.id));
      const catArticles = indexableArticles(catalog)
        .filter((a) => a.relatedProductIds?.some((id) => ids.has(id)))
        .map((a) => `<li><a href="/magazine/${a.id}">${escapeHtml(a.title)}</a></li>`)
        .join("");
      const catServices = servicesForCategory(slug, catalog)
        .map((s) => `<li><a href="${publicServicePath(s)}">${escapeHtml(s.title)}</a></li>`)
        .join("");
      return okDoc({
        path,
        title: category.title,
        description: category.description,
        h1: category.h1,
        ogType: "website",
        lastmod: collectionDay(catalog, "products"),
        body: `<p>${inlineToHtml(category.body || category.description || "")}</p>
${blocksToHtml(categoryIntroBlocks(slug))}
<h2>${tf("محصولات {category}", { category: escapeHtml(category.h1) })} (${tf("{n} مورد", { n: inCategory.length })})</h2><ul>${items}</ul>
${catArticles ? `<h2>${t("راهنماهای مرتبط")}</h2><ul>${catArticles}</ul>` : ""}
${catServices ? `<h2>${t("خدمات مرتبط")}</h2><ul>${catServices}</ul>` : ""}
<p>${[`<a href="/contact">${t("استعلام فنی")}</a>`, fitoutLink(t("تجهیز و نوسازی سالن")), `<a href="/TSPK_catalog.pdf">${t("کاتالوگ PDF")}</a>`].filter(Boolean).join(" · ")}</p>`,
        jsonLd: [
          orgSchema(company),
          breadcrumb([
            { name: t("خانه"), path: "/" },
            { name: t("محصولات"), path: "/products" },
            { name: category.h1, path },
          ]),
        ],
      });
    }
    const product = findProduct(slug, catalog);
    if (product) {
      const imagePath = withMediaVersion(product.image || "/images/hero-final-1.jpg");
      const imageAbs = imagePath.startsWith("http") ? imagePath : `${CANONICAL_ORIGIN}${imagePath}`;
      return okDoc({
        path: publicProductPath(product),
        title: product.seoTitle || `${product.name} | ${t("طیوران صنعت پویا")}`,
        description: product.shortDescription || product.fullDescription,
        h1: product.name,
        ogType: "product",
        ogImage: imageAbs,
        lastmod: collectionDay(catalog, "products"),
        body: productBody(product, catalog),
        jsonLd: [
          {
            "@type": "Product",
            name: product.name,
            description: product.shortDescription || product.fullDescription,
            ...(isEn() || product.hideCode ? {} : { sku: product.code }),
            image: imageAbs,
            ...(product.noBrandSchema
              ? {}
              : { brand: { "@type": "Brand", name: company.nameFa }, manufacturer: { "@id": `${CANONICAL_ORIGIN}/#org` } }),
            offers: {
              "@type": "Offer",
              url: canonicalPath(publicProductPath(product)),
              availability: "https://schema.org/InStock",
              businessFunction: "https://schema.org/Sell",
              ...(product.noBrandSchema ? { seller: { "@id": `${CANONICAL_ORIGIN}/#org` } } : {}),
              priceSpecification: {
                "@type": "PriceSpecification",
                description: t("قیمت پس از استعلام فنی و ظرفیت سالن اعلام می‌شود؛ قیمت ثابت در اسکیما درج نشده است."),
              },
            },
          },
          breadcrumb([
            { name: t("خانه"), path: "/" },
            { name: t("محصولات"), path: "/products" },
            { name: product.categoryTitle, path: `/products/${product.category}` },
            { name: product.name, path: publicProductPath(product) },
          ]),
        ],
      });
    }
  }

  if (path === "/projects") {
    const links = catalog.projects.map((p) => `<li><a href="/projects/${p.id}">${escapeHtml(p.title)}</a> — ${escapeHtml(p.location)} · ${escapeHtml(p.capacity)}${p.keyOutcome ? ` · ${escapeHtml(p.keyOutcome)}` : ""}</li>`).join("");
    return okDoc({
      path,
      title: t("پروژه‌های تجهیز مرغداری | طیوران صنعت پویا"),
      description: t("نمونه کارهای اجرایی طیوران صنعت پویا در سالن مرغداری و کارخانه خوراک."),
      h1: t("پروژه‌های اجراشده"),
      ogType: "website",
      lastmod: collectionDay(catalog, "projects"),
      body: `<p>${t("پروژه‌های شاخص طیوران صنعت پویا. جزئیات عددی فقط در صورت داده تأییدشده شرکت در صفحه پروژه آمده است.")}</p><ul>${links}</ul>`,
      jsonLd: [orgSchema(company), breadcrumb([{ name: t("خانه"), path: "/" }, { name: t("پروژه‌ها"), path: "/projects" }])],
    });
  }

  if (path.startsWith("/projects/") && publicSegments(path).length === 2) {
    const project = catalog.projects.find((p) => p.id === path.split("/")[2]);
    if (project) {
      return okDoc({
        path,
        title: `${project.title} | ${t("طیوران صنعت پویا")}`,
        description: project.keyOutcome || project.caseStudy?.solution || project.title,
        h1: project.title,
        ogType: "article",
        lastmod: collectionDay(catalog, "projects"),
        body: projectBody(project),
        jsonLd: [
          {
            "@type": "CreativeWork",
            headline: project.title,
            description: project.keyOutcome || project.caseStudy?.solution || project.title,
            about: project.typeTitle,
            author: { "@id": `${CANONICAL_ORIGIN}/#org` },
          },
          breadcrumb([
            { name: t("خانه"), path: "/" },
            { name: t("پروژه‌ها"), path: "/projects" },
            { name: project.title, path },
          ]),
        ],
      });
    }
  }

  if (path === "/magazine") {
    const links = indexableArticles(catalog).map((a) => `<li><a href="/magazine/${a.id}">${escapeHtml(a.title)}</a><p>${escapeHtml(a.summary)}</p></li>`).join("");
    return okDoc({
      path,
      title: t("مجله تخصصی دام و طیور و مرغداری | طیوران صنعت پویا"),
      description: t("راهنماهای فنی تهویه، گرمایش و تجهیز سالن مرغداری."),
      h1: t("مجله تخصصی دام و طیور"),
      ogType: "website",
      lastmod: collectionDay(catalog, "articles"),
      body: `<ul>${links}</ul>`,
      jsonLd: [orgSchema(company), breadcrumb([{ name: t("خانه"), path: "/" }, { name: t("مجله"), path: "/magazine" }])],
    });
  }

  if (path.startsWith("/magazine/topic/") && publicSegments(path).length === 3) {
    const topic = findTopic(publicSegments(path)[2]);
    if (topic) {
      const list = indexableArticles(catalog).filter((a) => a.topic === topic.slug);
      const links = list.map((a) => `<li><a href="/magazine/${a.id}">${escapeHtml(a.title)}</a><p>${escapeHtml(a.summary)}</p></li>`).join("");
      const others = localTopics().filter((t) => t.slug !== topic.slug).map((t) => `<a href="${topicPath(t)}">${escapeHtml(t.label)}</a>`).join(" · ");
      return okDoc({
        path,
        title: topic.title,
        description: topic.intro,
        h1: topic.h1,
        ogType: "website",
        lastmod: collectionDay(catalog, "articles"),
        body: `<p>${escapeHtml(topic.intro)}</p><ul>${links}</ul><p>${t("موضوعات دیگر:")} ${others} · <a href="/magazine">${t("همهٔ مقالات مجله")}</a></p>`,
        jsonLd: [orgSchema(company), breadcrumb([{ name: t("خانه"), path: "/" }, { name: t("مجله"), path: "/magazine" }, { name: topic.label, path: topicPath(topic) }])],
      });
    }
  }

  if (path.startsWith("/magazine/") && publicSegments(path).length === 2) {
    const article = catalog.articles.find((a) => a.id === path.split("/")[2]);
    if (article && isPublicArticle(article)) {
      const relatedService = article.relatedServiceId
        ? catalog.services.find((s) => s.id === article.relatedServiceId)
        : undefined;
      const relatedProducts = catalog.products.filter((p) => article.relatedProductIds?.includes(p.id)).slice(0, 4);
      const authorNode = article.authorName
        ? { "@type": "Person", name: article.authorName, jobTitle: article.authorRole }
        : { "@type": "Organization", name: company.nameFa };
      const citations = (article.sources || [])
        .filter((source) => source.name.trim())
        .map((source) => ({
          "@type": "CreativeWork",
          name: source.name.trim(),
          ...(source.url && isSafeHref(source.url) ? { url: rewriteDisabledHref(source.url.trim()) } : {}),
        }));
      const sourceHtml = (article.sources || [])
        .filter((source) => source.name.trim())
        .map((source) => (source.url && isSafeHref(source.url) ? `<li><a href="${escapeHtml(rewriteDisabledHref(source.url))}">${escapeHtml(source.name)}</a></li>` : `<li>${escapeHtml(source.name)}</li>`))
        .join("");
      const authorHtml = article.authorName
        ? `<p>${t("نویسنده:")} ${escapeHtml(article.authorName)}${article.authorRole ? ` (${escapeHtml(article.authorRole)})` : ""}</p>`
        : "";
      const reviewerHtml = article.reviewerName
        ? `<p>${t("بازبین فنی:")} ${escapeHtml(article.reviewerName)}${article.reviewerRole ? ` (${escapeHtml(article.reviewerRole)})` : ""}</p>`
        : "";
      const relatedHtml = [
        relatedService ? (isServiceDisabled(relatedService.id) ? "" : `<a href="${publicServicePath(relatedService)}">${escapeHtml(relatedService.title)}</a>`) : fitoutLink(t("تجهیز سالن")),
        ...relatedProducts.map((p) => `<a href="${publicProductPath(p)}">${escapeHtml(p.name)}</a>`),
        `<a href="/contact">${t("مشاوره")}</a>`,
      ].filter(Boolean).join(" · ");
      const seoTitle = effectiveSeoTitle(article);
      const seoDescription = effectiveSeoDescription(article);
      const shareImage = articleShareImage(article.image);
      const faqs = faqEntities(article);
      return okDoc({
        path,
        title: seoTitle || `${article.title} | ${t("مجله طیوران صنعت پویا")}`,
        description: seoDescription || article.summary,
        h1: article.title,
        ogType: "article",
        robots: article.noindex ? "noindex, follow" : undefined,
        ogImage: shareImage,
        lastmod: isoDay(article.dateModifiedIso || article.datePublishedIso) || collectionDay(catalog, "articles"),
        body: `${articleHtml(article, catalog.products)}
${articleTagsHtml(article)}
${authorHtml}
${reviewerHtml}
<p>${t("تاریخ انتشار:")} ${escapeHtml(article.datePublishedIso || article.date)}</p>
${sourceHtml ? `<h2>${t("منابع")}</h2><ul>${sourceHtml}</ul>` : ""}
<p>${relatedHtml}</p>`,
        jsonLd: [
          {
            "@type": "Article",
            headline: article.title,
            description: seoDescription || article.summary,
            inLanguage: "fa-IR",
            ...(shareImage ? { image: shareImage } : {}),
            datePublished: article.datePublishedIso || undefined,
            dateModified: article.dateModifiedIso || article.datePublishedIso || undefined,
            author: authorNode,
            ...(citations.length ? { citation: citations } : {}),
            publisher: { "@id": `${CANONICAL_ORIGIN}/#org` },
            mainEntityOfPage: { "@type": "WebPage", "@id": canonicalPath(path) },
          },
          ...(faqs.length
            ? [
                {
                  "@type": "FAQPage",
                  mainEntity: faqs.map((item) => ({
                    "@type": "Question",
                    name: item.q,
                    acceptedAnswer: { "@type": "Answer", text: item.a },
                  })),
                },
              ]
            : []),
          ...(article.id === "how-to-calculate-ventilation-capacity"
            ? [
                {
                  "@type": "HowTo",
                  name: article.title,
                  description: article.summary,
                  step: [
                    { "@type": "HowToStep", name: t("محاسبه حجم و سطح مقطع سالن"), text: t("طول، عرض و ارتفاع میانگین سالن را برای حجم و سطح مقطع تهویه تونلی ثبت کنید.") },
                    { "@type": "HowToStep", name: t("تعیین وزن زنده پایان دوره"), text: t("تعداد پرنده × وزن هدف؛ مبنای دبی باید منبع سویه باشد نه رقم بازار بدون شرط.") },
                    { "@type": "HowToStep", name: t("انتخاب فن روی منحنی فشار استاتیک"), text: t("ظرفیت کاتالوگ را در فشار استاتیک پد/اینلت اصلاح کنید و با مهندس تأیید کنید.") },
                  ],
                },
              ]
            : []),
          breadcrumb([
            { name: t("خانه"), path: "/" },
            { name: t("مجله"), path: "/magazine" },
            { name: article.title, path },
          ]),
        ],
      });
    }
  }

  if (path === "/about") {
    // Approved copy 2026-11-13 (src/data/aboutCopy.ts); contact lines below are unchanged.
    const activityNumber = (n: number) => (isEn() ? String(n) : faDigits(n));
    const processSteps = ABOUT_PROCESS_STEPS.map(([, heading, text]) => `<li><strong>${escapeHtml(tr(heading))}</strong> — ${escapeHtml(tr(text))}</li>`).join("");
    const activities = ABOUT_ACTIVITIES.map(([title, description], index) => `<li><strong>${activityNumber(index + 1)}. ${escapeHtml(tr(title))}</strong> — ${escapeHtml(tr(description))}</li>`).join("");
    return okDoc({
      path,
      title: tr(ABOUT_TITLE),
      description: tr(ABOUT_SUBTITLE),
      h1: tr(ABOUT_PAGE_NAME),
      ogType: "website",
      lastmod: collectionDay(catalog, "companyInfo"),
      body: `<p>${escapeHtml(tr(ABOUT_SUBTITLE))}</p>
<h2>${escapeHtml(tr(ABOUT_INTRO_HEADING))}</h2>
${ABOUT_INTRO_PARAGRAPHS.map((paragraph) => `<p>${escapeHtml(tr(paragraph))}</p>`).join("\n")}
<h2>${escapeHtml(tr(ABOUT_ACTIVITIES_HEADING))}</h2>
<ul>${activities}</ul>
<h2>${escapeHtml(tr(ABOUT_PROCESS_HEADING))}</h2>
<p>${escapeHtml(tr(ABOUT_PROCESS_INTRO))}</p>
<ol>${processSteps}</ol>
<p>${escapeHtml(tr(ABOUT_CTA_TEXT))} <a href="/contact">${escapeHtml(tr(ABOUT_CTA_LABEL))}</a></p>
<h2>${escapeHtml(tr(ABOUT_FLAGSHIP_HEADING))}</h2>
<p>${escapeHtml(tr(ABOUT_FLAGSHIP_TEXT))}</p>
<p><a href="${ABOUT_FLAGSHIP_HREF}">${escapeHtml(tr(ABOUT_FLAGSHIP_CTA))}</a></p>
<h2>${escapeHtml(tr(ABOUT_INTERNATIONAL_HEADING))}</h2>
<p>${escapeHtml(tr(ABOUT_INTERNATIONAL_TEXT))}</p>
<p>${t("مشاوره، فروش و پشتیبانی:")} <a href="${SALES_PHONE_TEL}" dir="ltr">${tr(SALES_PHONE_DISPLAY)}</a></p>
<p>${t("تلفن دفتر:")} <a href="${OFFICE_PHONE_TEL}" dir="ltr">${tr(OFFICE_PHONE_DISPLAY)}</a></p>
<p>${t("ساعات کار:")} ${escapeHtml(company.workingHours)}</p>
<p>${t("دفتر مشهد:")} ${escapeHtml(company.address)}</p>
<p>${t("کارخانه:")} ${escapeHtml(company.factoryAddress)}</p>
<p>${t("واحد تحقیق و توسعه گرگان:")} ${escapeHtml(company.rdAddress || "")}</p>
<p><a href="/contact">${t("درخواست مشاوره تجهیز سالن")}</a></p>`,
      jsonLd: [orgSchema(company)],
    });
  }

  if (path === "/contact") {
    const locHtml = (company.locations || [])
      .map((loc) => `<li>${escapeHtml(loc.title)}: ${escapeHtml(loc.address)}</li>`)
      .join("");
    return okDoc({
      path,
      title: t("تماس و مشاوره تجهیزات دام و طیور | طیوران صنعت پویا"),
      description: t("درخواست مشاوره فنی برای تجهیزات دام و طیور، ماشین‌آلات خوراک و نوسازی سالن مرغداری."),
      h1: t("تماس و درخواست مشاوره"),
      ogType: "website",
      lastmod: collectionDay(catalog, "companyInfo"),
      body: `<p>${t("مشاوره، فروش و پشتیبانی:")} <a href="${SALES_PHONE_TEL}" dir="ltr">${tr(SALES_PHONE_DISPLAY)}</a></p>
<p>${t("تلفن دفتر:")} <a href="${OFFICE_PHONE_TEL}" dir="ltr">${tr(OFFICE_PHONE_DISPLAY)}</a></p>
<p>${t("ساعات کار:")} ${escapeHtml(company.workingHours)}</p>
<ul>${locHtml}</ul>
<p><a href="#free-consultation-form">${t("فرم درخواست بازدید و پیشنهاد فنی")}</a></p>`,
      jsonLd: [orgSchema(company), ...localBusinessNodes(company)],
    });
  }

  return {
    title: t("صفحه پیدا نشد | طیوران صنعت پویا"),
    description: t("صفحه مورد نظر یافت نشد."),
    h1: t("صفحه پیدا نشد"),
    ogType: "website",
    body: `<p>${t("این مسیر در سایت وجود ندارد.")} <a href="/">${t("بازگشت به خانه")}</a></p>`,
    jsonLd: [],
    robots: "noindex, follow",
    canonicalHref: null,
    notFound: true,
  };
}

export function isKnownPublicPath(pathname: string, catalog: SeoCatalog): boolean {
  const path = decodePathname(stripQuery(pathname));
  const parts = publicSegments(path);
  if (["/", "/products", "/services", "/magazine", "/about", "/contact"].includes(path)) {
    return true;
  }
  // Only the real app prefixes (/admin, /admin/..., /crm/...), not /administrator or /admin.php.
  if (isPrivateAppPath(path) && !path.startsWith("/api")) return true;
  if (parts.length === 3 && parts[0] === "magazine" && parts[1] === "topic") return Boolean(findTopic(parts[2]));
  if (parts.length !== 2) return false;
  if (parts[0] === "magazine") return catalog.articles.some((a) => a.id === parts[1]);
  if (parts[0] === "products") {
    const slug = parts[1];
    if (isCategorySlug(slug, catalog)) return true;
    return catalog.products.some((p) => p.id === slug || p.code === slug || productSeoSlug(p) === slug);
  }
  if (parts[0] === "services") return Boolean(findServicePage(parts[1])) || (!isServiceDisabled(parts[1]) && Boolean(findService(parts[1], catalog)));
  if (parts[0] === "projects") return catalog.projects.some((p) => p.id === parts[1]);
  return false;
}

export function sitemapEntries(catalog: SeoCatalog): { loc: string; lastmod?: string; priority: string }[] {
  const urls: { loc: string; lastmod?: string; priority: string }[] = [
    { loc: "/", priority: "1.0", lastmod: collectionDay(catalog, "companyInfo") },
    { loc: "/services", priority: "0.9", lastmod: collectionDay(catalog, "services") },
    ...(isServiceDisabled(FITOUT_SERVICE_ID) ? [] : [{ loc: `/services/${FITOUT_SLUG}`, priority: "0.9", lastmod: collectionDay(catalog, "services") }]),
    { loc: "/products", priority: "0.9", lastmod: collectionDay(catalog, "products") },
    { loc: "/magazine", priority: "0.6", lastmod: collectionDay(catalog, "articles") },
    { loc: "/about", priority: "0.5", lastmod: collectionDay(catalog, "companyInfo") },
    { loc: "/contact", priority: "0.8", lastmod: collectionDay(catalog, "companyInfo") },
  ];
  const seen = new Set(urls.map((u) => u.loc));
  const add = (loc: string, priority: string, lastmod?: string) => {
    if (isPrivateAppPath(loc) || seen.has(loc)) return;
    seen.add(loc);
    urls.push({ loc, priority, lastmod });
  };
  for (const page of SERVICE_PAGES) add(servicePagePath(page), "0.8", collectionDay(catalog, "services"));
  for (const cat of catalog.categories) add(`/products/${cat.id}`, "0.8", collectionDay(catalog, "products"));
  for (const service of catalog.services) if (!isServiceDisabled(service.id)) add(publicServicePath(service), "0.8", collectionDay(catalog, "services"));
  for (const product of catalog.products) add(publicProductPath(product), "0.7", collectionDay(catalog, "products"));
  for (const project of catalog.projects) add(`/projects/${project.id}`, "0.7", collectionDay(catalog, "projects"));
  for (const topic of MAGAZINE_TOPICS) add(topicPath(topic), "0.5", collectionDay(catalog, "articles"));
  for (const article of catalog.articles) {
    if (!isPublicArticle(article) || article.noindex) continue;
    add(`/magazine/${article.id}`, "0.6", isoDay(article.dateModifiedIso || article.datePublishedIso) || collectionDay(catalog, "articles"));
  }
  return urls;
}

export function llmsTxt(catalog: SeoCatalog): string {
  // Persian section at the original URLs; the server appends the English section (lang "en", /en URLs).
  const en = isEn();
  const services = [
    ...SERVICE_PAGES.map((s) => `- ${lp(servicePagePath(s))} — ${tr(s.title)}`),
    ...catalog.services.filter((s) => !isServiceDisabled(s.id)).map((s) => `- ${lp(publicServicePath(s))} — ${s.title}`),
  ].join("\n");
  const cats = catalog.categories.map((c) => `- ${lp(`/products/${c.id}`)} — ${c.title}`).join("\n");
  const posts = catalog.articles
    .filter((article) => isPublicArticle(article) && !article.noindex)
    .map((article) => `- ${lp(`/magazine/${article.id}`)} — ${article.title}`)
    .join("\n");
  const fitout = isServiceDisabled(FITOUT_SERVICE_ID) ? "" : `- ${en ? "Core service:" : keepFa("خدمت محوری:")} ${CANONICAL_ORIGIN}${lp(`/services/${FITOUT_SLUG}`)}\n`;
  if (en) {
    return `# Toyooran Sanat Pouya (English)
> Livestock and poultry equipment, feed machinery and poultry house renovation: ventilation, heating, feeding and drinking systems. Offices in Mashhad and Gorgan.

- Site: ${CANONICAL_ORIGIN}${EN_PREFIX}
- Contact: ${CANONICAL_ORIGIN}${EN_PREFIX}/contact
${fitout}${services ? `\n## Services\n${services}\n` : ""}
## Product categories
${cats}

## Magazine
${posts}

## Citation rules
- Do not quote fan capacity or fuel consumption figures without static pressure, climate and an engineer's confirmation.
- Product prices on public pages are given on request, not as a fixed figure.
- Read layouts and specifications from the initial HTML or the product/service page, not from model guesses.
`;
  }
  return `${keepFa("# طیوران صنعت پویا")}
${keepFa("> تجهیزات صنعت دام و طیور، ماشین‌آلات خوراک و نوسازی سالن مرغداری؛ تهویه، گرمایش، دانخوری و آبخوری. دفاتر مشهد و گرگان.")}

- ${keepFa("سایت:")} ${CANONICAL_ORIGIN}
- ${keepFa("تماس:")} ${CANONICAL_ORIGIN}/contact
${fitout}${services ? `\n## ${keepFa("خدمات")}\n${services}\n` : ""}
## ${keepFa("دسته‌های محصول")}
${cats}

## ${keepFa("مجله")}
${posts}

## ${keepFa("قواعد استناد")}
- ${keepFa("اعداد ظرفیت فن و مصرف سوخت را بدون فشار استاتیک، اقلیم و تأیید مهندس نقل نکنید.")}
- ${keepFa("قیمت محصول در صفحات عمومی استعلام است نه رقم ثابت.")}
- ${keepFa("نقشه و مشخصات را از HTML اولیه یا صفحه محصول/خدمت بخوانید نه از حدس مدل.")}
`;
}
