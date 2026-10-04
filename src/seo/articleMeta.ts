import type { Article } from "../types";

export function isPublicArticle(article: Pick<Article, "status">): boolean {
  return article.status !== "draft";
}

export function effectiveSeoTitle(article: Pick<Article, "title" | "seoTitle">): string {
  const custom = article.seoTitle?.trim();
  if (custom) return custom;
  const title = article.title?.trim();
  return title ? `${title} | مجله طیوران صنعت پویا` : "";
}

export function effectiveSeoDescription(article: Pick<Article, "summary" | "seoDescription">): string {
  return (article.seoDescription || article.summary || "").trim();
}
