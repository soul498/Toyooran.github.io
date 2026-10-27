import React, { useMemo, useState } from "react";
import {
  AlertCircle,
  BookOpen,
  Calendar,
  Clock,
  ExternalLink,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "../../icons";
import { useData } from "../../context/DataContext";
import type { Article } from "../../types";
import { isPublicArticle } from "../../seo/articleMeta";
import { ArticleEditor } from "../blog/ArticleEditor";
import { articleSeoChecks, seoScore } from "../blog/seoChecklist";

const CATEGORIES = [
  { value: "technical-guide", label: "راهنمای فنی مهندسی" },
  { value: "product-guide", label: "راهنمای ماشین‌آلات و کاتالوگ" },
  { value: "article", label: "مقاله تخصصی پرورش طیور" },
  { value: "faq", label: "سوالات متداول و پرسش و پاسخ" },
];

export const ArticlesTab: React.FC = () => {
  const { articles, addArticle, updateArticle, deleteArticle, allProducts: products, services } = useData();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [editing, setEditing] = useState<Article | "new" | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Article | null>(null);

  const scores = useMemo(() => {
    const map = new Map<string, number>();
    for (const article of articles) map.set(article.id, seoScore(articleSeoChecks(article)));
    return map;
  }, [articles]);

  const filtered = articles.filter((article) => {
    const haystack = `${article.title} ${article.summary} ${article.focusKeyword || ""}`.toLowerCase();
    const matchesSearch = haystack.includes(searchTerm.trim().toLowerCase());
    const matchesCategory = categoryFilter === "all" || article.category === categoryFilter;
    const published = isPublicArticle(article);
    const matchesStatus = statusFilter === "all" || (statusFilter === "published" ? published : !published);
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const saveArticle = (article: Article) => {
    const previous = editing !== "new" && editing ? editing : null;
    if (!previous) addArticle(article);
    else if (previous.id === article.id) updateArticle(previous.id, article);
    else {
      deleteArticle(previous.id);
      addArticle(article);
    }
    setEditing(null);
  };

  if (editing) {
    return (
      <ArticleEditor
        initial={editing === "new" ? null : editing}
        articles={articles}
        products={products}
        services={services}
        onCancel={() => setEditing(null)}
        onSave={saveArticle}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-3xl">
        <div>
          <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-400" />
            <span>مجله و نوشته‌ها ({articles.length.toLocaleString("fa-IR")})</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">نوشته جدید، پیش‌نویس، بلوک محتوا و مشخصات سئو از همین‌جا مدیریت می‌شود.</p>
        </div>
        <button
          type="button"
          onClick={() => setEditing("new")}
          className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black inline-flex items-center justify-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          مقاله جدید
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-3">
        <div className="flex-1 relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="جستجو در عنوان، چکیده یا کلمه کلیدی"
            className="w-full bg-slate-900 border border-slate-800 focus:border-amber-400 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 pl-10"
          />
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
        </div>
        <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)} className="bg-slate-900 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2.5">
          <option value="all">همه دسته‌ها</option>
          {CATEGORIES.map((category) => <option key={category.value} value={category.value}>{category.label}</option>)}
        </select>
        <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="bg-slate-900 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2.5">
          <option value="all">همه وضعیت‌ها</option>
          <option value="published">منتشر شده</option>
          <option value="draft">پیش‌نویس</option>
        </select>
      </div>

      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center text-xs text-slate-400">نوشته‌ای با این فیلتر پیدا نشد.</div>
        )}
        {filtered.map((article) => {
          const score = scores.get(article.id) || 0;
          const published = isPublicArticle(article);
          return (
            <div key={article.id} className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="bg-amber-400/15 text-amber-300 border border-amber-400/30 text-[10px] font-bold px-2.5 py-0.5 rounded-full">{article.categoryLabel}</span>
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${published ? "text-emerald-300 border-emerald-400/30 bg-emerald-400/10" : "text-slate-300 border-slate-600 bg-slate-800"}`}>
                      {published ? "منتشر شده" : "پیش‌نویس"}
                    </span>
                    {article.noindex && <span className="text-[10px] text-rose-200 border border-rose-400/30 rounded-full px-2 py-0.5">noindex</span>}
                    <span className="text-[11px] text-slate-500 inline-flex items-center gap-1"><Calendar className="w-3 h-3" />{article.date}</span>
                    <span className="text-[11px] text-slate-500 inline-flex items-center gap-1"><Clock className="w-3 h-3" />{article.readTime}</span>
                  </div>
                  <h3 className="text-sm font-bold text-white">{article.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">{article.summary}</p>
                </div>
                <div className="flex items-center gap-1.5 self-end sm:self-start shrink-0">
                  <span className={`text-[11px] font-black px-2 py-1 rounded-lg border ${score >= 80 ? "text-emerald-300 border-emerald-400/30" : score >= 50 ? "text-amber-200 border-amber-400/30" : "text-rose-200 border-rose-400/30"}`}>
                    سئو {score.toLocaleString("fa-IR")}
                  </span>
                  {published && (
                    <a href={`/magazine/${article.id}`} target="_blank" rel="noreferrer" className="p-2 bg-slate-800 text-slate-200 rounded-xl" aria-label="مشاهده">
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                  <button type="button" onClick={() => setEditing(article)} className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs inline-flex items-center gap-1">
                    <Pencil className="w-3.5 h-3.5" />
                    ویرایش
                  </button>
                  <button type="button" onClick={() => setDeleteTarget(article)} className="p-2 bg-rose-950/40 text-rose-300 rounded-xl" aria-label="حذف">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-500 font-mono" dir="ltr">/magazine/{article.id}</div>
            </div>
          );
        })}
      </div>

      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-sm w-full space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-rose-400" />
              حذف نوشته
            </h3>
            <p className="text-xs text-slate-300 leading-6">«{deleteTarget.title}» از مجله، نتیجه جستجو و سایت‌مپ حذف می‌شود.</p>
            <div className="flex items-center justify-end gap-2">
              <button type="button" onClick={() => setDeleteTarget(null)} className="px-3.5 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-bold">انصراف</button>
              <button
                type="button"
                onClick={() => {
                  deleteArticle(deleteTarget.id);
                  setDeleteTarget(null);
                }}
                className="px-3.5 py-2 bg-rose-600 text-white rounded-xl text-xs font-black"
              >
                حذف قطعی
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
