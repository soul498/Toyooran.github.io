import React, { useEffect, useMemo, useRef, useState } from "react";
import { MAGAZINE_TOPICS } from "../../seo/topics";
import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  Check,
  ExternalLink,
  Plus,
  Save,
  Trash2,
  X,
} from "../../icons";
import type { Article, ArticleSource, Product, Service } from "../../types";
import { ImagePicker } from "../components/ImagePicker";
import { CANONICAL_ORIGIN } from "../../seo/resolveSeo";
import { isSafeHref, isSafeImageSrc } from "../../seo/safeUrl";
import { effectiveSeoDescription, effectiveSeoTitle } from "../../seo/articleMeta";
import {
  EditorBlock,
  blocksToContent,
  contentToBlocks,
  createBlock,
  estimateReadTime,
  normalizeSlug,
} from "./contentBlocks";
import { articleSeoChecks, seoScore } from "./seoChecklist";
import { importHtmlArticle, importPlainArticle, type ImportedArticle } from "./articleImport";
import { uploadImageFile } from "../mediaApi";
import { useData } from "../../context/DataContext";

const CATEGORIES = [
  { value: "technical-guide", label: "راهنمای فنی مهندسی" },
  { value: "product-guide", label: "راهنمای ماشین‌آلات و کاتالوگ" },
  { value: "article", label: "مقاله تخصصی پرورش طیور" },
  { value: "faq", label: "سوالات متداول و پرسش و پاسخ" },
];

const BLOCK_TYPES: { type: EditorBlock["type"]; label: string }[] = [
  { type: "p", label: "پاراگراف" },
  { type: "h2", label: "تیتر ۲" },
  { type: "h3", label: "تیتر ۳" },
  { type: "ul", label: "فهرست" },
  { type: "img", label: "تصویر" },
  { type: "cta", label: "دکمه" },
  { type: "table", label: "جدول" },
];

const fieldClass = "w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-400";

interface ArticleEditorProps {
  initial: Article | null;
  articles: Article[];
  products: Product[];
  services: Service[];
  onCancel: () => void;
  onSave: (article: Article) => Promise<void>;
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function slugTaken(slug: string, articles: Article[], currentId: string): boolean {
  return articles.some((article) => article.id !== currentId && (article.id === slug || article.aliases?.includes(slug)));
}

export const ArticleEditor: React.FC<ArticleEditorProps> = ({
  initial,
  articles,
  products,
  services,
  onCancel,
  onSave,
}) => {
  const { addMedia } = useData();
  const [title, setTitle] = useState(initial?.title || "");
  const [slug, setSlug] = useState(initial?.id || "");
  const [status, setStatus] = useState<Article["status"]>(initial ? initial.status || "published" : "draft");
  const [category, setCategory] = useState(initial?.category || "technical-guide");
  const [summary, setSummary] = useState(initial?.summary || "");
  const [seoTitle, setSeoTitle] = useState(initial?.seoTitle || "");
  const [seoDescription, setSeoDescription] = useState(initial?.seoDescription || "");
  const [focusKeyword, setFocusKeyword] = useState(initial?.focusKeyword || "");
  const [image, setImage] = useState(initial?.image || "");
  const [imageAlt, setImageAlt] = useState(initial?.imageAlt || "");
  const [date, setDate] = useState(initial?.date || new Date().toLocaleDateString("fa-IR"));
  const [tagsText, setTagsText] = useState(initial?.tags?.join("، ") || "");
  const [topic, setTopic] = useState(initial?.topic || "");
  const [authorName, setAuthorName] = useState(initial?.authorName || "");
  const [authorRole, setAuthorRole] = useState(initial?.authorRole || "");
  const [reviewerName, setReviewerName] = useState(initial?.reviewerName || "");
  const [reviewerRole, setReviewerRole] = useState(initial?.reviewerRole || "");
  const [sources, setSources] = useState<ArticleSource[]>(initial?.sources?.length ? initial.sources : [{ name: "", url: "" }]);
  const initialEnglish = (initial?.translations?.en || {}) as Partial<Omit<Article, 'translations'>>;
  const [englishTitle, setEnglishTitle] = useState(initialEnglish.title || "");
  const [englishCategoryLabel, setEnglishCategoryLabel] = useState(initialEnglish.categoryLabel || "");
  const [englishReadTime, setEnglishReadTime] = useState(initialEnglish.readTime || "");
  const [englishSummary, setEnglishSummary] = useState(initialEnglish.summary || "");
  const [englishContent, setEnglishContent] = useState(initialEnglish.content?.join("\n") || "");
  const [englishImageAlt, setEnglishImageAlt] = useState(initialEnglish.imageAlt || "");
  const [englishTagsText, setEnglishTagsText] = useState(initialEnglish.tags?.join(", ") || "");
  const [englishSeoTitle, setEnglishSeoTitle] = useState(initialEnglish.seoTitle || "");
  const [englishSeoDescription, setEnglishSeoDescription] = useState(initialEnglish.seoDescription || "");
  const [englishFocusKeyword, setEnglishFocusKeyword] = useState(initialEnglish.focusKeyword || "");
  const [englishAuthorName, setEnglishAuthorName] = useState(initialEnglish.authorName || "");
  const [englishAuthorRole, setEnglishAuthorRole] = useState(initialEnglish.authorRole || "");
  const [englishReviewerName, setEnglishReviewerName] = useState(initialEnglish.reviewerName || "");
  const [englishReviewerRole, setEnglishReviewerRole] = useState(initialEnglish.reviewerRole || "");
  const [englishSourcesText, setEnglishSourcesText] = useState((initialEnglish.sources || []).map((source) => [source.name, source.url || ""].join(" | ")).join("\n"));
  const initialTurkish = (initial?.translations?.tr || {}) as Partial<Omit<Article, 'translations'>>;
  const [turkishTitle, setTurkishTitle] = useState(initialTurkish.title || "");
  const [turkishCategoryLabel, setTurkishCategoryLabel] = useState(initialTurkish.categoryLabel || "");
  const [turkishReadTime, setTurkishReadTime] = useState(initialTurkish.readTime || "");
  const [turkishSummary, setTurkishSummary] = useState(initialTurkish.summary || "");
  const [turkishContent, setTurkishContent] = useState(initialTurkish.content?.join("\n") || "");
  const [turkishImageAlt, setTurkishImageAlt] = useState(initialTurkish.imageAlt || "");
  const [turkishTagsText, setTurkishTagsText] = useState(initialTurkish.tags?.join(", ") || "");
  const [turkishSeoTitle, setTurkishSeoTitle] = useState(initialTurkish.seoTitle || "");
  const [turkishSeoDescription, setTurkishSeoDescription] = useState(initialTurkish.seoDescription || "");
  const [turkishFocusKeyword, setTurkishFocusKeyword] = useState(initialTurkish.focusKeyword || "");
  const [turkishAuthorName, setTurkishAuthorName] = useState(initialTurkish.authorName || "");
  const [turkishAuthorRole, setTurkishAuthorRole] = useState(initialTurkish.authorRole || "");
  const [turkishReviewerName, setTurkishReviewerName] = useState(initialTurkish.reviewerName || "");
  const [turkishReviewerRole, setTurkishReviewerRole] = useState(initialTurkish.reviewerRole || "");
  const [turkishSourcesText, setTurkishSourcesText] = useState((initialTurkish.sources || []).map((source) => [source.name, source.url || ""].join(" | ")).join("\n"));
  const initialRussian = (initial?.translations?.ru || {}) as Partial<Omit<Article, 'translations'>>;
  const [russianTitle, setRussianTitle] = useState(initialRussian.title || "");
  const [russianSummary, setRussianSummary] = useState(initialRussian.summary || "");
  const [russianContent, setRussianContent] = useState(initialRussian.content?.join("\n") || "");
  const [russianSeoTitle, setRussianSeoTitle] = useState(initialRussian.seoTitle || "");
  const [russianSeoDescription, setRussianSeoDescription] = useState(initialRussian.seoDescription || "");
  const initialArabic = (initial?.translations?.ar || {}) as Partial<Omit<Article, 'translations'>>;
  const [arabicTitle, setArabicTitle] = useState(initialArabic.title || "");
  const [arabicSummary, setArabicSummary] = useState(initialArabic.summary || "");
  const [arabicContent, setArabicContent] = useState(initialArabic.content?.join("\n") || "");
  const [arabicSeoTitle, setArabicSeoTitle] = useState(initialArabic.seoTitle || "");
  const [arabicSeoDescription, setArabicSeoDescription] = useState(initialArabic.seoDescription || "");
  const [relatedProductIds, setRelatedProductIds] = useState<string[]>(initial?.relatedProductIds || []);
  const [relatedServiceId, setRelatedServiceId] = useState(initial?.relatedServiceId || "");
  const [noindex, setNoindex] = useState(Boolean(initial?.noindex));
  const [blocks, setBlocks] = useState<EditorBlock[]>(() => contentToBlocks(initial?.content));
  const [productQuery, setProductQuery] = useState("");
  const [preview, setPreview] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [pasteText, setPasteText] = useState("");
  const [imported, setImported] = useState<ImportedArticle | null>(null);
  const [importError, setImportError] = useState("");
  const [importing, setImporting] = useState(false);
  const [replaceMeta, setReplaceMeta] = useState(!initial);
  const [importSuccess, setImportSuccess] = useState("");
  const pastedFiles = useRef(new Map<string, File>());

  useEffect(() => () => {
    for (const url of pastedFiles.current.keys()) URL.revokeObjectURL(url);
  }, []);

  const analyzePaste = (text: string, html = "", files: File[] = []) => {
    setImportError("");
    setImportSuccess("");
    if (text.length > 300_000 || html.length > 12_000_000) {
      setImported(null);
      setImportError("حجم متن چسبانده‌شده زیاد است. مقاله را در چند بخش وارد کنید.");
      return;
    }
    for (const url of pastedFiles.current.keys()) URL.revokeObjectURL(url);
    pastedFiles.current.clear();
    const rich = html ? importHtmlArticle(html) : null;
    const useRich = Boolean(rich && (rich.title || rich.blocks.length > 1 || rich.blocks.some((block) => block.type !== "p")));
    const result = useRich && rich ? rich : importPlainArticle(text);
    const imageFiles = files.filter((file) => file.type.startsWith("image/"));
    const imageCount = result.blocks.filter((block) => block.type === "img").length;
    const pairAllImages = imageCount > 0 && imageFiles.length === imageCount;
    let fileIndex = 0;
    const blocksWithFiles = result.blocks.map((block) => {
      if (block.type !== "img" || (!pairAllImages && block.src) || !imageFiles[fileIndex]) return block;
      const file = imageFiles[fileIndex++];
      const url = URL.createObjectURL(file);
      pastedFiles.current.set(url, file);
      return { ...block, src: url, alt: block.alt || file.name.replace(/\.[^.]+$/, "") };
    });
    const imagesWithoutPosition = !blocksWithFiles.some((block) => block.type === "img") && imageFiles.length > 0;
    if (imagesWithoutPosition) {
      for (const file of imageFiles) {
        const url = URL.createObjectURL(file);
        pastedFiles.current.set(url, file);
        blocksWithFiles.push({ id: createBlock("img").id, type: "img", src: url, alt: file.name.replace(/\.[^.]+$/, ""), caption: "" });
      }
    }
    setImported({ ...result, blocks: blocksWithFiles, warnings: [
      ...(pairAllImages ? result.warnings.filter((warning) => !warning.startsWith("یک تصویرِ چسبانده‌شده")) : result.warnings),
      ...(imagesWithoutPosition ? ["جای تصویرها در متن کلیپ‌بورد مشخص نبود؛ به انتهای مقاله افزوده شدند و می‌توانید بلوک‌ها را جابه‌جا کنید."] : []),
    ] });
    if (!blocksWithFiles.length && !result.title) setImportError("تیتر یا پاراگرافی در متن پیدا نشد. متن مقاله را در این کادر بچسبانید.");
  };

  const applyPaste = async (mode: "replace" | "append") => {
    if (!imported?.blocks.length) return;
    setImporting(true);
    setImportError("");
    try {
      const ready: EditorBlock[] = [];
      for (const block of imported.blocks) {
        if (block.type !== "img" || !(block.src.startsWith("data:image/") || block.src.startsWith("blob:"))) { ready.push(block); continue; }
        const file = pastedFiles.current.get(block.src) || await fetch(block.src).then(async (response) => {
          if (!response.ok) throw new Error("خواندن تصویر چسبانده‌شده ناموفق بود.");
          const blob = await response.blob();
          return new File([blob], `article-image.${blob.type.split("/")[1] || "png"}`, { type: blob.type });
        });
        const media = await uploadImageFile(file, block.alt || "تصویر مقاله");
        addMedia(media);
        ready.push({ ...block, src: media.url });
      }
      setBlocks((current) => mode === "replace" ? ready : [...current.filter((block) => block.type !== "p" || block.text.trim()), ...ready]);
      if (imported.title && (replaceMeta || !title.trim())) setTitle(imported.title);
      if (imported.summary && (replaceMeta || !summary.trim())) setSummary(imported.summary);
      setImported(null);
      setPasteText("");
      for (const url of pastedFiles.current.keys()) URL.revokeObjectURL(url);
      pastedFiles.current.clear();
      setImportSuccess(`${ready.length.toLocaleString("fa-IR")} بلوک وارد شد. پیش‌نمایش را بررسی کنید و سپس مقاله را ذخیره کنید.`);
    } catch (cause) {
      setImportError(cause instanceof Error ? cause.message : "ورود مقاله ناموفق بود.");
    } finally {
      setImporting(false);
    }
  };

  const draftArticle = useMemo<Partial<Article>>(
    () => ({
      id: normalizeSlug(slug),
      title,
      summary,
      seoTitle,
      seoDescription,
      focusKeyword,
      image,
      imageAlt,
      authorName,
      reviewerName,
      sources,
      relatedProductIds,
      relatedServiceId,
      status,
      noindex,
    }),
    [
      slug,
      title,
      summary,
      seoTitle,
      seoDescription,
      focusKeyword,
      image,
      imageAlt,
      authorName,
      reviewerName,
      sources,
      relatedProductIds,
      relatedServiceId,
      status,
      noindex,
    ]
  );

  const checks = useMemo(() => articleSeoChecks(draftArticle, blocks), [draftArticle, blocks]);
  const score = seoScore(checks);
  const renderedTitle = effectiveSeoTitle({ title, seoTitle });
  const renderedDescription = effectiveSeoDescription({ summary, seoDescription });
  const canonicalSlug = normalizeSlug(slug);
  const canonicalUrl = `${CANONICAL_ORIGIN}/magazine/${canonicalSlug || "نامک"}`;
  const scoreTone = score >= 80 ? "text-emerald-300 border-emerald-400/40 bg-emerald-400/10" : score >= 50 ? "text-amber-200 border-amber-400/40 bg-amber-400/10" : "text-rose-200 border-rose-400/40 bg-rose-400/10";

  const updateBlock = (id: string, next: EditorBlock) => {
    setBlocks((current) => current.map((block) => (block.id === id ? next : block)));
  };

  const moveBlock = (index: number, direction: -1 | 1) => {
    setBlocks((current) => {
      const target = index + direction;
      if (target < 0 || target >= current.length) return current;
      const copy = current.slice();
      const [item] = copy.splice(index, 1);
      copy.splice(target, 0, item);
      return copy;
    });
  };

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    const nextSlug = normalizeSlug(slug) || `article-${Date.now()}`;
    if (!title.trim()) {
      setError("عنوان نوشته لازم است.");
      return;
    }
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(nextSlug)) {
      setError("نامک فقط می‌تواند حروف انگلیسی کوچک، عدد و خط تیره باشد.");
      return;
    }
    if (slugTaken(nextSlug, articles, initial?.id || "")) {
      setError("این نامک قبلاً برای نوشته دیگری استفاده شده است.");
      return;
    }
    if (image.trim() && !isSafeImageSrc(image)) {
      setError("آدرس تصویر شاخص باید مسیر سایت یا لینک http/https باشد.");
      return;
    }
    if (blocks.some((block) => block.type === "img" && block.src.trim() && !isSafeImageSrc(block.src))) {
      setError("آدرس تصویر داخل متن نامعتبر است.");
      return;
    }
    if (blocks.some((block) => block.type === "cta" && block.label.trim() && block.href.trim() && !isSafeHref(block.href))) {
      setError("لینک دکمه باید مسیر داخلی مثل /contact یا آدرس http/https باشد.");
      return;
    }
    if (sources.some((source) => source.url?.trim() && !isSafeHref(source.url))) {
      setError("آدرس منبع باید لینک http یا https باشد.");
      return;
    }
    const englishSources: ArticleSource[] = englishSourcesText
      .split("\n")
      .map((line) => {
        const [name, ...urlParts] = line.split("|");
        return { name: name?.trim() || "", url: urlParts.join("|").trim() || undefined };
      })
      .filter((source) => source.name);
    if (englishSources.some((source) => source.url && !isSafeHref(source.url))) {
      setError("آدرس منبع انگلیسی باید لینک http یا https باشد.");
      return;
    }
    if (status === "published") {
      if (!summary.trim() && !seoDescription.trim()) {
        setError("برای انتشار، چکیده یا توضیحات متا لازم است.");
        return;
      }
      if (!blocksToContent(blocks).length) {
        setError("نوشته منتشرشده باید حداقل یک بلوک محتوا داشته باشد.");
        return;
      }
    }

    const aliases = new Set((initial?.aliases || []).filter((alias) => alias && alias !== nextSlug));
    if (initial?.id && initial.id !== nextSlug) aliases.add(initial.id);
    const matchedCategory = CATEGORIES.find((item) => item.value === category);
    const cleanSources = sources.filter((source) => source.name.trim());
    const englishHasContent = [
      englishTitle, englishCategoryLabel, englishReadTime, englishSummary, englishContent, englishImageAlt,
      englishTagsText, englishSeoTitle, englishSeoDescription, englishFocusKeyword, englishAuthorName,
      englishAuthorRole, englishReviewerName, englishReviewerRole, englishSourcesText,
    ].some((value) => value.trim());
    const englishTranslation: Partial<Omit<Article, 'translations'>> = {
      ...initialEnglish,
      title: englishTitle.trim() || undefined,
      categoryLabel: englishCategoryLabel.trim() || undefined,
      readTime: englishReadTime.trim() || undefined,
      summary: englishSummary.trim() || undefined,
      content: englishContent.split("\n").map((line) => line.trim()).filter(Boolean),
      imageAlt: englishImageAlt.trim() || undefined,
      tags: englishTagsText.split(",").map((tag) => tag.trim()).filter(Boolean),
      seoTitle: englishSeoTitle.trim() || undefined,
      seoDescription: englishSeoDescription.trim() || undefined,
      focusKeyword: englishFocusKeyword.trim() || undefined,
      authorName: englishAuthorName.trim() || undefined,
      authorRole: englishAuthorRole.trim() || undefined,
      reviewerName: englishReviewerName.trim() || undefined,
      reviewerRole: englishReviewerRole.trim() || undefined,
      sources: englishSources.length ? englishSources : undefined,
    };
    const turkishSources: ArticleSource[] = turkishSourcesText
      .split("\n")
      .map((line) => {
        const [name, ...urlParts] = line.split("|");
        return { name: name?.trim() || "", url: urlParts.join("|").trim() || undefined };
      })
      .filter((source) => source.name);
    if (turkishSources.some((source) => source.url && !isSafeHref(source.url))) {
      setError("آدرس منبع ترکی باید لینک http یا https باشد.");
      return;
    }
    const turkishHasContent = [
      turkishTitle, turkishCategoryLabel, turkishReadTime, turkishSummary, turkishContent, turkishImageAlt,
      turkishTagsText, turkishSeoTitle, turkishSeoDescription, turkishFocusKeyword, turkishAuthorName,
      turkishAuthorRole, turkishReviewerName, turkishReviewerRole, turkishSourcesText,
    ].some((value) => value.trim());
    const turkishTranslation: Partial<Omit<Article, 'translations'>> = {
      ...initialTurkish,
      title: turkishTitle.trim() || undefined,
      categoryLabel: turkishCategoryLabel.trim() || undefined,
      readTime: turkishReadTime.trim() || undefined,
      summary: turkishSummary.trim() || undefined,
      content: turkishContent.split("\n").map((line) => line.trim()).filter(Boolean),
      imageAlt: turkishImageAlt.trim() || undefined,
      tags: turkishTagsText.split(",").map((tag) => tag.trim()).filter(Boolean),
      seoTitle: turkishSeoTitle.trim() || undefined,
      seoDescription: turkishSeoDescription.trim() || undefined,
      focusKeyword: turkishFocusKeyword.trim() || undefined,
      authorName: turkishAuthorName.trim() || undefined,
      authorRole: turkishAuthorRole.trim() || undefined,
      reviewerName: turkishReviewerName.trim() || undefined,
      reviewerRole: turkishReviewerRole.trim() || undefined,
      sources: turkishSources.length ? turkishSources : undefined,
    };
    const russianHasContent = [russianTitle, russianSummary, russianContent, russianSeoTitle, russianSeoDescription].some((value) => value.trim());
    const russianTranslation: Partial<Omit<Article, 'translations'>> = {
      ...initialRussian,
      title: russianTitle.trim() || undefined,
      summary: russianSummary.trim() || undefined,
      content: russianContent.split("\n").map((line) => line.trim()).filter(Boolean),
      seoTitle: russianSeoTitle.trim() || undefined,
      seoDescription: russianSeoDescription.trim() || undefined,
    };
    const arabicHasContent = [arabicTitle, arabicSummary, arabicContent, arabicSeoTitle, arabicSeoDescription].some((value) => value.trim());
    const arabicTranslation: Partial<Omit<Article, 'translations'>> = {
      ...initialArabic,
      title: arabicTitle.trim() || undefined,
      summary: arabicSummary.trim() || undefined,
      content: arabicContent.split("\n").map((line) => line.trim()).filter(Boolean),
      seoTitle: arabicSeoTitle.trim() || undefined,
      seoDescription: arabicSeoDescription.trim() || undefined,
    };
    const article: Article = {
      ...(initial || { id: nextSlug, title: title.trim(), category, categoryLabel: "", readTime: "", date, summary: "", content: [], relatedProductIds: [] }),
      id: nextSlug,
      title: title.trim(),
      category,
      categoryLabel: matchedCategory?.label || initial?.categoryLabel || "مقاله فنی",
      readTime: estimateReadTime(blocks),
      date: date.trim() || new Date().toLocaleDateString("fa-IR"),
      datePublishedIso: status === "published" ? initial?.datePublishedIso || todayIso() : initial?.datePublishedIso,
      dateModifiedIso: todayIso(),
      summary: summary.trim(),
      content: blocksToContent(blocks),
      image: image.trim() || undefined,
      imageAlt: imageAlt.trim() || undefined,
      tags: tagsText.split(/[،,]/).map((tag) => tag.trim()).filter(Boolean),
      topic: topic || undefined,
      relatedProductIds,
      relatedServiceId: relatedServiceId || undefined,
      authorName: authorName.trim() || undefined,
      authorRole: authorRole.trim() || undefined,
      reviewerName: reviewerName.trim() || undefined,
      reviewerRole: reviewerRole.trim() || undefined,
      sources: cleanSources.length ? cleanSources.map((source) => ({ name: source.name.trim(), url: source.url?.trim() || undefined })) : undefined,
      status,
      seoTitle: seoTitle.trim() || undefined,
      seoDescription: seoDescription.trim() || undefined,
      focusKeyword: focusKeyword.trim() || undefined,
      noindex: noindex || undefined,
      aliases: aliases.size ? [...aliases] : undefined,
      translations: (englishHasContent || turkishHasContent || russianHasContent || arabicHasContent) ? { ...(englishHasContent ? { en: englishTranslation } : {}), ...(turkishHasContent ? { tr: turkishTranslation } : {}), ...(russianHasContent ? { ru: russianTranslation } : {}), ...(arabicHasContent ? { ar: arabicTranslation } : {}) } : undefined,
    };
    setSaving(true);
    setError("");
    try {
      await onSave(article);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "ذخیرهٔ مقاله در سرور انجام نشد. دوباره تلاش کنید.");
    } finally {
      setSaving(false);
    }
  };

  const productMatches = products
    .filter((product) => {
      const query = productQuery.trim();
      if (!query) return false;
      return product.name.includes(query) || product.code?.toLowerCase().includes(query.toLowerCase());
    })
    .slice(0, 6);

  return (
    <form onSubmit={handleSave} className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between bg-slate-900 border border-slate-800 rounded-3xl p-4">
        <div className="min-w-0">
          <button type="button" onClick={onCancel} className="text-[11px] text-slate-400 hover:text-white">
            بازگشت به فهرست
          </button>
          <h2 className="text-base font-black text-white truncate">{initial ? "ویرایش نوشته" : "نوشته جدید"}</h2>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select value={status || "published"} onChange={(event) => setStatus(event.target.value as Article["status"])} className={fieldClass + " w-auto"}>
            <option value="draft">پیش‌نویس</option>
            <option value="review">در انتظار بررسی</option>
            <option value="published">منتشر شده</option>
          </select>
          <button type="button" onClick={() => setPreview((value) => !value)} className="px-3 py-2 rounded-xl bg-slate-800 text-slate-200 text-xs font-bold">
            {preview ? "ویرایش" : "پیش‌نمایش"}
          </button>
          <button type="submit" disabled={saving || importing || Boolean(imported)} className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-slate-950 text-xs font-black inline-flex items-center gap-1.5">
            <Save className="w-4 h-4" />
            {saving ? "در حال ذخیره…" : "ذخیره"}
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-xs text-rose-200 bg-rose-950/40 border border-rose-500/30 rounded-2xl px-4 py-3">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_22rem] gap-4 items-start">
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-5 space-y-3">
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="عنوان نوشته"
              className="w-full bg-transparent border-none text-lg sm:text-xl font-black text-white placeholder:text-slate-600 focus:outline-none"
            />
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-[11px]">
              <span className="text-slate-500 shrink-0">نامک</span>
              <input
                value={slug}
                onChange={(event) => setSlug(event.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                onBlur={() => setSlug(normalizeSlug(slug))}
                placeholder="ventilation-capacity"
                dir="ltr"
                className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-amber-200 font-mono focus:border-amber-400"
              />
            </div>
            <p className="text-[11px] text-slate-500 break-all" dir="ltr">{canonicalUrl}</p>
            {initial && canonicalSlug && canonicalSlug !== initial.id && (
              <p className="text-[11px] text-amber-300">آدرس قبلی به همین نامک جدید منتقل می‌شود.</p>
            )}
          </div>

          {!preview && (
            <section className="bg-slate-900 border border-amber-400/30 rounded-3xl p-4 sm:p-5 space-y-3">
              <div>
                <h3 className="text-sm font-black text-white">چسباندن کل مقاله</h3>
                <p className="text-[11px] text-slate-400 mt-1">متن را از Word، Google Docs یا Markdown اینجا بچسبانید. تیتر، تیترهای میانی، پاراگراف‌ها، فهرست‌ها، جدول، تصویر و کپشن به بلوک‌های قابل ویرایش تبدیل می‌شوند. تصاویرِ همراه کلیپ‌بورد هنگام اعمال در رسانه‌های سایت آپلود می‌شوند.</p>
              </div>
              <textarea
                value={pasteText}
                onChange={(event) => { setPasteText(event.target.value); setImported(null); setImportSuccess(""); }}
                onPaste={(event) => {
                  event.preventDefault();
                  const text = event.clipboardData.getData("text/plain");
                  const html = event.clipboardData.getData("text/html");
                  setPasteText(text);
                  analyzePaste(text, html, Array.from(event.clipboardData.files));
                }}
                rows={5}
                dir="auto"
                placeholder={"عنوان مقاله\n\n## تیتر بخش اول\nمتن پاراگراف...\n\n![متن جایگزین](/media/image.webp \"کپشن تصویر\")"}
                className={fieldClass + " leading-7 resize-y"}
              />
              <button type="button" onClick={() => analyzePaste(pasteText)} disabled={!pasteText.trim()} className="rounded-xl bg-slate-800 disabled:opacity-50 px-3 py-2 text-xs font-bold text-slate-200">تحلیل متن واردشده</button>
              {importError && <p role="alert" className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-200">{importError}</p>}
              {importSuccess && <p role="status" className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-200">{importSuccess}</p>}
              {imported && (imported.title || imported.blocks.length > 0) && (
                <div className="rounded-2xl border border-slate-700 bg-slate-950/60 p-4 space-y-3">
                  <div className="flex flex-wrap gap-3 text-[11px] text-slate-300">
                    <span>{imported.blocks.length.toLocaleString("fa-IR")} بلوک</span>
                    <span>{imported.blocks.filter((block) => block.type === "h2" || block.type === "h3").length.toLocaleString("fa-IR")} تیتر میانی</span>
                    <span>{imported.blocks.filter((block) => block.type === "img").length.toLocaleString("fa-IR")} تصویر</span>
                  </div>
                  {imported.title && <p className="text-sm font-black text-white">عنوان: {imported.title}</p>}
                  {imported.summary && <p className="text-xs text-slate-400 leading-6">چکیدهٔ پیشنهادی: {imported.summary}</p>}
                  <div className="max-h-48 overflow-y-auto space-y-1 text-xs text-slate-300">
                    {imported.blocks.slice(0, 30).map((block) => <p key={block.id} className="truncate">{block.type === "h2" ? "تیتر ۲: " : block.type === "h3" ? "تیتر ۳: " : block.type === "img" ? "تصویر: " : block.type === "ul" ? "فهرست: " : block.type === "table" ? "جدول: " : "پاراگراف: "}{block.type === "ul" ? block.items.join("، ") : block.type === "img" ? block.caption || block.alt || (block.src.startsWith("data:") || block.src.startsWith("blob:") ? "تصویر چسبانده‌شده" : block.src) : block.type === "table" ? block.source.split("\n")[0] : "text" in block ? block.text : ""}</p>)}
                    {imported.blocks.length > 30 && <p className="text-slate-500">و {imported.blocks.length - 30} بلوک دیگر…</p>}
                  </div>
                  {imported.warnings.map((warning, index) => <p key={index} className="text-[11px] text-amber-200">{warning}</p>)}
                  <label className="flex items-center gap-2 text-xs text-slate-300"><input type="checkbox" checked={replaceMeta} onChange={(event) => setReplaceMeta(event.target.checked)} /> عنوان و چکیدهٔ فعلی نیز با متن واردشده جایگزین شوند</label>
                  <div className="flex flex-wrap gap-2">
                    <button type="button" disabled={importing || !imported.blocks.length} onClick={() => void applyPaste("replace")} className="rounded-xl bg-amber-400 disabled:opacity-50 px-4 py-2 text-xs font-black text-slate-950">{importing ? "در حال آپلود تصاویر…" : "جایگزینی بلوک‌های مقاله"}</button>
                    <button type="button" disabled={importing || !imported.blocks.length} onClick={() => void applyPaste("append")} className="rounded-xl bg-slate-800 disabled:opacity-50 px-4 py-2 text-xs font-bold text-slate-200">افزودن به انتهای مقاله</button>
                  </div>
                  <p className="text-[11px] text-slate-500">ابتدا بلوک‌ها را اعمال کنید؛ سپس دکمهٔ ذخیرهٔ مقاله فعال می‌شود.</p>
                </div>
              )}
            </section>
          )}

          {preview ? (
            <article className="bg-white text-slate-800 rounded-3xl p-6 sm:p-8 space-y-4">
              <h1 className="text-2xl font-black leading-relaxed">{title || "بدون عنوان"}</h1>
              {summary && <p className="text-sm text-slate-600 leading-7">{summary}</p>}
              {blocks.map((block) => (
                <PreviewBlock key={block.id} block={block} />
              ))}
            </article>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-5 space-y-3">
              <div className="flex flex-wrap gap-1.5">
                {BLOCK_TYPES.map((item) => (
                  <button
                    key={item.type}
                    type="button"
                    onClick={() => setBlocks((current) => [...current, createBlock(item.type)])}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-200 inline-flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3 text-amber-400" />
                    {item.label}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-slate-500">بلوک‌ها همان صفحه مجله را می‌سازند. برای سوالات متداول، هر پرسش را تیتر ۳ و پاسخ را پاراگراف بعدی بگذارید.</p>
              <div className="space-y-2">
                {blocks.map((block, index) => (
                  <div key={block.id} className="border border-slate-800 rounded-2xl p-3 bg-slate-950/50 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold text-amber-300">{BLOCK_TYPES.find((item) => item.type === block.type)?.label}</span>
                      <div className="flex items-center gap-1">
                        <button type="button" onClick={() => moveBlock(index, -1)} className="p-1 text-slate-400 hover:text-white" aria-label="بالا">
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button type="button" onClick={() => moveBlock(index, 1)} className="p-1 text-slate-400 hover:text-white" aria-label="پایین">
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button type="button" onClick={() => setBlocks((current) => current.filter((item) => item.id !== block.id))} className="p-1 text-rose-300" aria-label="حذف بلوک">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <BlockFields block={block} onChange={(next) => updateBlock(block.id, next)} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <aside className="space-y-3 xl:sticky xl:top-4">
          <section className={`rounded-3xl border p-4 ${scoreTone}`}>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black">امتیاز سئو</h3>
              <span className="text-2xl font-black">{score.toLocaleString("fa-IR")}</span>
            </div>
            <p className="text-[11px] mt-1 opacity-80">
              {status === "draft" ? "پیش‌نویس در سایت و سایت‌مپ نیست." : status === "review" ? "این نوشته برای بررسی است و هنوز روی سایت نمایش داده نمی‌شود." : noindex ? "منتشر می‌شود ولی noindex است." : "پس از ذخیره در مجله و سایت‌مپ می‌آید."}
            </p>
          </section>

          <section className="bg-white rounded-3xl p-4 text-right space-y-1">
            <p className="text-[10px] text-slate-500">پیش‌نمایش نتیجه جستجو</p>
            <p className="text-[#1a0dab] text-sm font-medium leading-6 line-clamp-2">{renderedTitle || "عنوان سئو"}</p>
            <p className="text-[#006621] text-[11px] break-all" dir="ltr">{canonicalUrl}</p>
            <p className="text-[#4d5156] text-[11px] leading-5 line-clamp-3">{renderedDescription || "توضیحات متا اینجا دیده می‌شود."}</p>
          </section>

          <section className="bg-slate-900 border border-slate-800 rounded-3xl p-4 space-y-2">
            <h3 className="text-xs font-black text-white">سئو</h3>
            <label className="block text-[11px] text-slate-400">کلمه کلیدی کانونی
              <input value={focusKeyword} onChange={(event) => setFocusKeyword(event.target.value)} className={fieldClass + " mt-1"} placeholder="محاسبه تهویه سالن" />
            </label>
            <label className="block text-[11px] text-slate-400">عنوان سئو
              <input value={seoTitle} onChange={(event) => setSeoTitle(event.target.value)} className={fieldClass + " mt-1"} placeholder={title ? `${title} | مجله طیوران صنعت پویا` : "اگر خالی بماند از عنوان نوشته ساخته می‌شود"} />
            </label>
            <p className="text-[10px] text-slate-500">{Array.from(renderedTitle).length.toLocaleString("fa-IR")} نویسه</p>
            <label className="block text-[11px] text-slate-400">توضیحات متا
              <textarea value={seoDescription} onChange={(event) => setSeoDescription(event.target.value)} rows={3} className={fieldClass + " mt-1 leading-6"} placeholder="اگر خالی بماند چکیده استفاده می‌شود" />
            </label>
            <p className="text-[10px] text-slate-500">{Array.from(renderedDescription).length.toLocaleString("fa-IR")} نویسه</p>
            <label className="flex items-center gap-2 text-[11px] text-slate-300">
              <input type="checkbox" checked={noindex} onChange={(event) => setNoindex(event.target.checked)} />
              این نوشته در گوگل ایندکس نشود
            </label>
            <ul className="space-y-1.5 pt-1">
              {checks.map((check) => (
                <li key={check.id} className="flex items-start gap-2 text-[11px]">
                  {check.ok ? <Check className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" /> : <X className="w-3.5 h-3.5 text-rose-300 mt-0.5 shrink-0" />}
                  <span>
                    <span className="text-slate-200 font-bold">{check.label}</span>
                    <span className="block text-slate-500">{check.detail}</span>
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section className="bg-slate-900 border border-slate-800 rounded-3xl p-4 space-y-3">
            <h3 className="text-xs font-black text-white">انتشار</h3>
            <label className="block text-[11px] text-slate-400">دسته
              <select value={category} onChange={(event) => setCategory(event.target.value)} className={fieldClass + " mt-1"}>
                {CATEGORIES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
              </select>
            </label>
            <label className="block text-[11px] text-slate-400">تاریخ نمایش
              <input value={date} onChange={(event) => setDate(event.target.value)} className={fieldClass + " mt-1"} />
            </label>
            <p className="text-[11px] text-slate-500">زمان مطالعه: {estimateReadTime(blocks)}</p>
            <label className="block text-[11px] text-slate-400">چکیده
              <textarea value={summary} onChange={(event) => setSummary(event.target.value)} rows={3} className={fieldClass + " mt-1 leading-6"} />
            </label>
            <label className="block text-[11px] text-slate-400">برچسب موضوعی ثابت (صفحهٔ موضوع)
              <select value={topic} onChange={(event) => setTopic(event.target.value)} className={fieldClass + " mt-1"}>
                <option value="">بدون موضوع</option>
                {MAGAZINE_TOPICS.map((t) => <option key={t.slug} value={t.slug}>{t.label}</option>)}
              </select>
            </label>
            <label className="block text-[11px] text-slate-400">برچسب‌های متغیر (۲ تا ۵ مورد)
              <input value={tagsText} onChange={(event) => setTagsText(event.target.value)} className={fieldClass + " mt-1"} placeholder="تهویه، مرغداری" />
            </label>
            <ImagePicker label="تصویر شاخص" value={image} onChange={setImage} />
            <label className="block text-[11px] text-slate-400">متن جایگزین تصویر شاخص
              <input value={imageAlt} onChange={(event) => setImageAlt(event.target.value)} className={fieldClass + " mt-1"} />
            </label>
            {status === "published" && initial && canonicalSlug === initial.id && (
              <a href={`/magazine/${canonicalSlug}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[11px] text-amber-300">
                <ExternalLink className="w-3.5 h-3.5" />
                مشاهده روی سایت
              </a>
            )}
          </section>

          <section className="bg-slate-900 border border-slate-800 rounded-3xl p-4 space-y-2">
            <h3 className="text-xs font-black text-white">نویسنده و بازبین</h3>
            <input value={authorName} onChange={(event) => setAuthorName(event.target.value)} placeholder="نام نویسنده" className={fieldClass} />
            <input value={authorRole} onChange={(event) => setAuthorRole(event.target.value)} placeholder="سمت نویسنده" className={fieldClass} />
            <input value={reviewerName} onChange={(event) => setReviewerName(event.target.value)} placeholder="نام بازبین فنی" className={fieldClass} />
            <input value={reviewerRole} onChange={(event) => setReviewerRole(event.target.value)} placeholder="سمت بازبین" className={fieldClass} />
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-400">منابع</span>
                <button type="button" onClick={() => setSources((current) => [...current, { name: "", url: "" }])} className="text-[11px] text-amber-300">افزودن</button>
              </div>
              {sources.map((source, index) => (
                <div key={index} className="grid grid-cols-1 gap-1">
                  <input
                    value={source.name}
                    onChange={(event) => setSources((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, name: event.target.value } : item))}
                    placeholder="نام منبع"
                    className={fieldClass}
                  />
                  <div className="flex gap-1">
                    <input
                      value={source.url || ""}
                      onChange={(event) => setSources((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, url: event.target.value } : item))}
                      placeholder="https://"
                      dir="ltr"
                      className={fieldClass}
                    />
                    <button type="button" onClick={() => setSources((current) => current.filter((_, itemIndex) => itemIndex !== index))} className="px-2 text-rose-300" aria-label="حذف منبع">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-slate-900 border border-slate-800 rounded-3xl p-4 space-y-2">
            <h3 className="text-xs font-black text-white">پیوندهای داخلی</h3>
            <select value={relatedServiceId} onChange={(event) => setRelatedServiceId(event.target.value)} className={fieldClass}>
              <option value="">بدون خدمت مرتبط</option>
              {services.map((service) => <option key={service.id} value={service.id}>{service.title}</option>)}
            </select>
            <input value={productQuery} onChange={(event) => setProductQuery(event.target.value)} placeholder="جستجوی محصول مرتبط" className={fieldClass} />
            {productMatches.map((product) => (
              <button
                key={product.id}
                type="button"
                onClick={() => {
                  setRelatedProductIds((current) => current.includes(product.id) ? current : [...current, product.id]);
                  setProductQuery("");
                }}
                className="block w-full text-right text-[11px] text-slate-300 hover:text-white"
              >
                {product.name}
              </button>
            ))}
            <div className="flex flex-wrap gap-1.5">
              {relatedProductIds.map((id) => {
                const product = products.find((item) => item.id === id);
                return (
                  <button key={id} type="button" onClick={() => setRelatedProductIds((current) => current.filter((item) => item !== id))} className="px-2 py-1 rounded-lg bg-slate-800 text-[10px] text-slate-200">
                    {(product?.name || id) + " ×"}
                  </button>
                );
              })}
            </div>
          </section>
        </aside>
      </div>

      <section className="bg-blue-500/5 border border-blue-500/25 rounded-3xl p-4 sm:p-5 space-y-4" dir="ltr">
        <div dir="rtl">
          <h3 className="text-sm font-black text-blue-100">نسخه انگلیسی مقاله</h3>
          <p className="text-[11px] text-slate-500 mt-1">محتوای انگلیسی مستقل است. تا وقتی ترجمه کامل نباشد، نسخه /en این مقاله منتشر نمی‌شود.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <label className="block text-xs text-slate-300">Article title<input value={englishTitle} onChange={(event) => setEnglishTitle(event.target.value)} className={fieldClass + " mt-1"} /></label>
          <label className="block text-xs text-slate-300">Category label<input value={englishCategoryLabel} onChange={(event) => setEnglishCategoryLabel(event.target.value)} className={fieldClass + " mt-1"} /></label>
          <label className="block text-xs text-slate-300">Reading time<input value={englishReadTime} onChange={(event) => setEnglishReadTime(event.target.value)} placeholder="5 min read" className={fieldClass + " mt-1"} /></label>
          <label className="block text-xs text-slate-300">Image alt text<input value={englishImageAlt} onChange={(event) => setEnglishImageAlt(event.target.value)} className={fieldClass + " mt-1"} /></label>
        </div>
        <label className="block text-xs text-slate-300">Article summary<textarea rows={3} value={englishSummary} onChange={(event) => setEnglishSummary(event.target.value)} className={fieldClass + " mt-1 leading-6"} /></label>
        <label className="block text-xs text-slate-300">Article content (keep content markers such as ##, -, [IMG|...], [CTA|...])<textarea rows={12} value={englishContent} onChange={(event) => setEnglishContent(event.target.value)} className={fieldClass + " mt-1 leading-6 font-mono"} /></label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <label className="block text-xs text-slate-300">Tags (comma-separated)<input value={englishTagsText} onChange={(event) => setEnglishTagsText(event.target.value)} className={fieldClass + " mt-1"} /></label>
          <label className="block text-xs text-slate-300">Focus keyword<input value={englishFocusKeyword} onChange={(event) => setEnglishFocusKeyword(event.target.value)} className={fieldClass + " mt-1"} /></label>
          <label className="block text-xs text-slate-300">SEO title<input value={englishSeoTitle} onChange={(event) => setEnglishSeoTitle(event.target.value)} className={fieldClass + " mt-1"} /></label>
          <label className="block text-xs text-slate-300">SEO description<textarea rows={2} value={englishSeoDescription} onChange={(event) => setEnglishSeoDescription(event.target.value)} className={fieldClass + " mt-1"} /></label>
          <label className="block text-xs text-slate-300">Author name<input value={englishAuthorName} onChange={(event) => setEnglishAuthorName(event.target.value)} className={fieldClass + " mt-1"} /></label>
          <label className="block text-xs text-slate-300">Author role<input value={englishAuthorRole} onChange={(event) => setEnglishAuthorRole(event.target.value)} className={fieldClass + " mt-1"} /></label>
          <label className="block text-xs text-slate-300">Reviewer name<input value={englishReviewerName} onChange={(event) => setEnglishReviewerName(event.target.value)} className={fieldClass + " mt-1"} /></label>
          <label className="block text-xs text-slate-300">Reviewer role<input value={englishReviewerRole} onChange={(event) => setEnglishReviewerRole(event.target.value)} className={fieldClass + " mt-1"} /></label>
        </div>
        <label className="block text-xs text-slate-300">Sources — one per line: Name | https://example.com<textarea rows={3} value={englishSourcesText} onChange={(event) => setEnglishSourcesText(event.target.value)} className={fieldClass + " mt-1 font-mono"} /></label>
      </section>

      <section className="bg-emerald-500/5 border border-emerald-500/25 rounded-3xl p-4 sm:p-5 space-y-4" dir="ltr">
        <div dir="rtl">
          <h3 className="text-sm font-black text-emerald-100">نسخه ترکی مقاله</h3>
          <p className="text-[11px] text-slate-500 mt-1">محتوای ترکی مستقل است. تا وقتی ترجمه کامل نباشد، نسخه /tr این مقاله منتشر نمی‌شود.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <label className="block text-xs text-slate-300">Makale başlığı<input value={turkishTitle} onChange={(event) => setTurkishTitle(event.target.value)} className={fieldClass + " mt-1"} /></label>
          <label className="block text-xs text-slate-300">Kategori etiketi<input value={turkishCategoryLabel} onChange={(event) => setTurkishCategoryLabel(event.target.value)} className={fieldClass + " mt-1"} /></label>
          <label className="block text-xs text-slate-300">Okuma süresi<input value={turkishReadTime} onChange={(event) => setTurkishReadTime(event.target.value)} placeholder="5 dk okuma" className={fieldClass + " mt-1"} /></label>
          <label className="block text-xs text-slate-300">Görsel alt metni<input value={turkishImageAlt} onChange={(event) => setTurkishImageAlt(event.target.value)} className={fieldClass + " mt-1"} /></label>
        </div>
        <label className="block text-xs text-slate-300">Makale özeti<textarea rows={3} value={turkishSummary} onChange={(event) => setTurkishSummary(event.target.value)} className={fieldClass + " mt-1 leading-6"} /></label>
        <label className="block text-xs text-slate-300">Makale içeriği (##, -, [IMG|...], [CTA|...] işaretlerini koruyun)<textarea rows={12} value={turkishContent} onChange={(event) => setTurkishContent(event.target.value)} className={fieldClass + " mt-1 leading-6 font-mono"} /></label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <label className="block text-xs text-slate-300">Etiketler (virgülle)<input value={turkishTagsText} onChange={(event) => setTurkishTagsText(event.target.value)} className={fieldClass + " mt-1"} /></label>
          <label className="block text-xs text-slate-300">Odak anahtar kelime<input value={turkishFocusKeyword} onChange={(event) => setTurkishFocusKeyword(event.target.value)} className={fieldClass + " mt-1"} /></label>
          <label className="block text-xs text-slate-300">SEO başlığı<input value={turkishSeoTitle} onChange={(event) => setTurkishSeoTitle(event.target.value)} className={fieldClass + " mt-1"} /></label>
          <label className="block text-xs text-slate-300">SEO açıklaması<textarea rows={2} value={turkishSeoDescription} onChange={(event) => setTurkishSeoDescription(event.target.value)} className={fieldClass + " mt-1"} /></label>
          <label className="block text-xs text-slate-300">Yazar adı<input value={turkishAuthorName} onChange={(event) => setTurkishAuthorName(event.target.value)} className={fieldClass + " mt-1"} /></label>
          <label className="block text-xs text-slate-300">Yazar rolü<input value={turkishAuthorRole} onChange={(event) => setTurkishAuthorRole(event.target.value)} className={fieldClass + " mt-1"} /></label>
          <label className="block text-xs text-slate-300">İnceleyen adı<input value={turkishReviewerName} onChange={(event) => setTurkishReviewerName(event.target.value)} className={fieldClass + " mt-1"} /></label>
          <label className="block text-xs text-slate-300">İnceleyen rolü<input value={turkishReviewerRole} onChange={(event) => setTurkishReviewerRole(event.target.value)} className={fieldClass + " mt-1"} /></label>
        </div>
        <label className="block text-xs text-slate-300">Kaynaklar — satır başına: Ad | https://example.com<textarea rows={3} value={turkishSourcesText} onChange={(event) => setTurkishSourcesText(event.target.value)} className={fieldClass + " mt-1 font-mono"} /></label>
      </section>

      <section className="bg-rose-500/5 border border-rose-500/25 rounded-3xl p-4 sm:p-5 space-y-4" dir="ltr">
        <div dir="rtl">
          <h3 className="text-sm font-black text-rose-100">نسخه روسی مقاله</h3>
          <p className="text-[11px] text-slate-500 mt-1">محتوای روسی مستقل است. تا وقتی ترجمه کامل نباشد، نسخه /ru این مقاله منتشر نمی‌شود.</p>
        </div>
        <label className="block text-xs text-slate-300">Заголовок<input value={russianTitle} onChange={(event) => setRussianTitle(event.target.value)} className={fieldClass + " mt-1"} /></label>
        <label className="block text-xs text-slate-300">Краткое содержание<textarea rows={3} value={russianSummary} onChange={(event) => setRussianSummary(event.target.value)} className={fieldClass + " mt-1 leading-6"} /></label>
        <label className="block text-xs text-slate-300">Текст (сохраните маркеры ##, -, [IMG|...], [CTA|...])<textarea rows={12} value={russianContent} onChange={(event) => setRussianContent(event.target.value)} className={fieldClass + " mt-1 leading-6 font-mono"} /></label>
        <label className="block text-xs text-slate-300">SEO-заголовок<input value={russianSeoTitle} onChange={(event) => setRussianSeoTitle(event.target.value)} className={fieldClass + " mt-1"} /></label>
        <label className="block text-xs text-slate-300">SEO-описание<textarea rows={2} value={russianSeoDescription} onChange={(event) => setRussianSeoDescription(event.target.value)} className={fieldClass + " mt-1"} /></label>
      </section>

      <section className="bg-amber-500/5 border border-amber-500/25 rounded-3xl p-4 sm:p-5 space-y-4" dir="rtl">
        <div>
          <h3 className="text-sm font-black text-amber-100">النسخة العربية للمقال</h3>
          <p className="text-[11px] text-slate-500 mt-1">محتوای عربی مستقل است. تا وقتی ترجمه کامل نباشد، نسخه /ar این مقاله منتشر نمی‌شود.</p>
        </div>
        <label className="block text-xs text-slate-300">العنوان<input value={arabicTitle} onChange={(event) => setArabicTitle(event.target.value)} className={fieldClass + " mt-1"} /></label>
        <label className="block text-xs text-slate-300">الملخص<textarea rows={3} value={arabicSummary} onChange={(event) => setArabicSummary(event.target.value)} className={fieldClass + " mt-1 leading-6"} /></label>
        <label className="block text-xs text-slate-300">النص (احتفظ بعلامات ## و - و [IMG|...] و [CTA|...])<textarea rows={12} value={arabicContent} onChange={(event) => setArabicContent(event.target.value)} className={fieldClass + " mt-1 leading-6 font-mono"} dir="rtl" /></label>
        <label className="block text-xs text-slate-300">عنوان SEO<input value={arabicSeoTitle} onChange={(event) => setArabicSeoTitle(event.target.value)} className={fieldClass + " mt-1"} /></label>
        <label className="block text-xs text-slate-300">وصف SEO<textarea rows={2} value={arabicSeoDescription} onChange={(event) => setArabicSeoDescription(event.target.value)} className={fieldClass + " mt-1"} /></label>
      </section>
    </form>
  );
};

const BlockFields: React.FC<{ block: EditorBlock; onChange: (block: EditorBlock) => void }> = ({ block, onChange }) => {
  if (block.type === "p" || block.type === "h2" || block.type === "h3") {
    return (
      <textarea
        value={block.text}
        onChange={(event) => onChange({ ...block, text: event.target.value })}
        rows={block.type === "p" ? 4 : 2}
        className={fieldClass + " leading-6"}
        placeholder={block.type === "p" ? "متن پاراگراف" : "متن تیتر"}
      />
    );
  }
  if (block.type === "ul") {
    return (
      <div className="space-y-1.5">
        {block.items.map((item, index) => (
          <div key={index} className="flex gap-1">
            <input
              value={item}
              onChange={(event) => onChange({ ...block, items: block.items.map((value, itemIndex) => itemIndex === index ? event.target.value : value) })}
              className={fieldClass}
              placeholder="مورد فهرست"
            />
            <button type="button" onClick={() => onChange({ ...block, items: block.items.filter((_, itemIndex) => itemIndex !== index) })} className="px-2 text-rose-300" aria-label="حذف مورد">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
        <button type="button" onClick={() => onChange({ ...block, items: [...block.items, ""] })} className="text-[11px] text-amber-300">افزودن مورد</button>
      </div>
    );
  }
  if (block.type === "img") {
    return (
      <div className="space-y-2">
        <ImagePicker label="تصویر داخل متن" value={block.src} onChange={(src) => onChange({ ...block, src })} />
        <input value={block.alt} onChange={(event) => onChange({ ...block, alt: event.target.value })} placeholder="متن جایگزین تصویر برای سئو" className={fieldClass} />
        <input value={block.caption} onChange={(event) => onChange({ ...block, caption: event.target.value })} placeholder="کپشن زیر تصویر (اختیاری)" className={fieldClass} />
      </div>
    );
  }
  if (block.type === "cta") {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <input value={block.label} onChange={(event) => onChange({ ...block, label: event.target.value })} placeholder="متن دکمه" className={fieldClass} />
        <input value={block.href} onChange={(event) => onChange({ ...block, href: event.target.value })} placeholder="/contact" dir="ltr" className={fieldClass} />
      </div>
    );
  }
  return (
    <textarea
      value={block.source}
      onChange={(event) => onChange({ ...block, source: event.target.value })}
      rows={4}
      dir="rtl"
      className={fieldClass + " leading-6 font-mono"}
      placeholder={"ستون ۱ | ستون ۲\nمقدار | مقدار"}
    />
  );
};

const PreviewBlock: React.FC<{ block: EditorBlock }> = ({ block }) => {
  if (block.type === "h2") return <h2 className="text-xl font-black pt-2">{block.text}</h2>;
  if (block.type === "h3") return <h3 className="text-lg font-bold">{block.text}</h3>;
  if (block.type === "ul") {
    return (
      <ul className="list-disc pr-5 space-y-1 text-sm">
        {block.items.filter(Boolean).map((item, index) => <li key={`${block.id}-${index}`}>{item}</li>)}
      </ul>
    );
  }
  if (block.type === "img" && block.src) {
    return (
      <figure>
        <img src={block.src} alt={block.alt} className="w-full rounded-2xl max-h-80 object-cover" />
        {block.caption && <figcaption className="text-center text-xs text-slate-500 mt-1">{block.caption}</figcaption>}
      </figure>
    );
  }
  if (block.type === "cta") {
    return <p className="text-sm font-bold text-[#003F86]">{block.label}</p>;
  }
  if (block.type === "table") {
    const rows = block.source.split("\n").map((line) => line.split("|").map((cell) => cell.trim())).filter((row) => row.some(Boolean));
    if (rows.length < 2) return null;
    return (
      <div className="overflow-x-auto text-xs">
        <table className="w-full border border-slate-200">
          <thead>
            <tr>{rows[0].map((cell, cellIndex) => <th key={cellIndex} className="border border-slate-200 px-2 py-1">{cell}</th>)}</tr>
          </thead>
          <tbody>
            {rows.slice(1).map((row, index) => (
              <tr key={index}>{row.map((cell, cellIndex) => <td key={cellIndex} className="border border-slate-200 px-2 py-1">{cell}</td>)}</tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
  if (block.type === "p") return <p className="text-sm leading-7 text-justify">{block.text}</p>;
  return null;
};
