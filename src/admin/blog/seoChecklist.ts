import type { Article } from "../../types";
import { effectiveSeoDescription, effectiveSeoTitle } from "../../seo/articleMeta";
import { EditorBlock, blockPlainText, contentToBlocks } from "./contentBlocks";

export type SeoCheck = {
  id: string;
  label: string;
  ok: boolean;
  detail: string;
};

function lengthOf(value: string): number {
  return Array.from(value).length;
}

function includesKeyword(value: string, keyword: string): boolean {
  if (!keyword) return false;
  return value.toLocaleLowerCase("fa").includes(keyword.toLocaleLowerCase("fa"));
}

export function articleSeoChecks(article: Partial<Article>, blocks?: EditorBlock[]): SeoCheck[] {
  const contentBlocks = blocks ?? contentToBlocks(article.content || []);
  const title = effectiveSeoTitle({ title: article.title || "", seoTitle: article.seoTitle });
  const description = effectiveSeoDescription({ summary: article.summary || "", seoDescription: article.seoDescription });
  const titleLength = lengthOf(title);
  const descriptionLength = lengthOf(description);
  const keyword = (article.focusKeyword || "").trim();
  const slug = article.id || "";
  const firstParagraph = contentBlocks.find((block) => block.type === "p" && block.text.trim());
  const words = blockPlainText(contentBlocks).trim().split(/\s+/).filter(Boolean).length;
  const images = contentBlocks.filter((block) => block.type === "img");
  const checks: SeoCheck[] = [
    {
      id: "title-length",
      label: "طول عنوان سئو",
      ok: titleLength >= 35 && titleLength <= 65,
      detail: title ? `${titleLength.toLocaleString("fa-IR")} نویسه؛ بازه مناسب ۳۵ تا ۶۵` : "عنوان خالی است",
    },
    {
      id: "description-length",
      label: "طول توضیحات متا",
      ok: descriptionLength >= 110 && descriptionLength <= 160,
      detail: description ? `${descriptionLength.toLocaleString("fa-IR")} نویسه؛ بازه مناسب ۱۱۰ تا ۱۶۰` : "توضیحات متا یا چکیده خالی است",
    },
    {
      id: "slug",
      label: "نامک انگلیسی",
      ok: /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug),
      detail: slug || "نامک خالی است",
    },
    {
      id: "h2",
      label: "حداقل یک تیتر دوم",
      ok: contentBlocks.some((block) => block.type === "h2" && block.text.trim()),
      detail: "تیتر دوم ساختار صفحه را برای جستجو مشخص می‌کند",
    },
    {
      id: "length",
      label: "حجم متن",
      ok: words >= 300,
      detail: `${words.toLocaleString("fa-IR")} کلمه؛ برای راهنمای فنی حداقل ۳۰۰ کلمه`,
    },
    {
      id: "image",
      label: "تصویر شاخص",
      ok: Boolean(article.image?.trim()),
      detail: article.image ? "انتخاب شده" : "تصویر شاخص برای اشتراک و نتیجه جستجو لازم است",
    },
    {
      id: "image-alt",
      label: "متن جایگزین تصویر شاخص",
      ok: Boolean(article.image?.trim() && article.imageAlt?.trim()),
      detail: article.imageAlt?.trim() || "بنویسید تصویر چه چیزی را نشان می‌دهد",
    },
    {
      id: "inline-alt",
      label: "متن جایگزین تصاویر داخل متن",
      ok: images.every((block) => block.type === "img" && block.alt.trim()),
      detail: images.length ? `${images.length.toLocaleString("fa-IR")} تصویر` : "تصویر داخل متن نیست",
    },
    {
      id: "author",
      label: "نام نویسنده",
      ok: Boolean(article.authorName?.trim()),
      detail: "نویسنده نام‌دار در اسکیما و پایین مقاله دیده می‌شود",
    },
    {
      id: "reviewer",
      label: "بازبین فنی",
      ok: Boolean(article.reviewerName?.trim()),
      detail: "بازبین مهندسی برای اعتماد موضوع تخصصی لازم است",
    },
    {
      id: "sources",
      label: "حداقل یک منبع",
      ok: Boolean(article.sources?.some((source) => source.name.trim())),
      detail: "منبع قابل‌بررسی زیر مقاله و در داده ساختاریافته می‌آید",
    },
    {
      id: "links",
      label: "پیوند داخلی",
      ok:
        Boolean(article.relatedProductIds?.length) ||
        Boolean(article.relatedServiceId) ||
        contentBlocks.some((block) => block.type === "cta" && block.href.trim().startsWith("/")),
      detail: "محصول، خدمت یا دکمه مشاوره به صفحات خود سایت",
    },
  ];

  if (!keyword) {
    checks.splice(2, 0, {
      id: "keyword",
      label: "کلمه کلیدی کانونی",
      ok: false,
      detail: "یک عبارت جستجو مشخص کنید و در عنوان، چکیده و تیتر استفاده کنید",
    });
    return checks;
  }

  const latinKeyword = /[a-z0-9]/i.test(keyword);
  checks.splice(
    2,
    0,
    {
      id: "keyword-title",
      label: "کلمه کلیدی در عنوان",
      ok: includesKeyword(title, keyword),
      detail: keyword,
    },
    {
      id: "keyword-description",
      label: "کلمه کلیدی در توضیحات",
      ok: includesKeyword(description, keyword),
      detail: keyword,
    },
    {
      id: "keyword-slug",
      label: "نامک مرتبط با کلمه کلیدی",
      ok: latinKeyword ? slug.includes(keyword.toLowerCase().replace(/\s+/g, "-")) : /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug),
      detail: latinKeyword ? "عبارت انگلیسی باید داخل نامک باشد" : "برای عبارت فارسی، نامک انگلیسی کوتاه کافی است",
    },
    {
      id: "keyword-lead",
      label: "کلمه کلیدی در پاراگراف اول",
      ok: Boolean(firstParagraph && firstParagraph.type === "p" && includesKeyword(firstParagraph.text, keyword)),
      detail: "در همان شروع متن بیاید",
    },
    {
      id: "keyword-h2",
      label: "کلمه کلیدی در یک تیتر دوم",
      ok: contentBlocks.some((block) => block.type === "h2" && includesKeyword(block.text, keyword)),
      detail: keyword,
    }
  );
  return checks;
}

export function seoScore(checks: SeoCheck[]): number {
  if (!checks.length) return 0;
  return Math.round((checks.filter((check) => check.ok).length / checks.length) * 100);
}
