import type { NextFunction, Request, Response } from "express";

/**
 * URLs left over from an old Japanese-keyword spam injection (pre-relaunch site).
 * Google still crawls them; answering 410 Gone drops them faster than a 301 to the homepage.
 *
 *   /?goods/252000762   /?goods%2F122004524   /?jp/246020541_html   /?detail/2520007620846
 *   /?sitemapindex.xml  /0x04b8ffa9/
 *
 * Only a bare "key-less" query on the homepage is matched (no "=" before the first "/"),
 * so ?q=, utm_*, gclid, fbclid etc. are never touched.
 */
const SPAM_QUERY_RE = /^(?:goods|jp|detail)\/[^=&]*$|^sitemapindex[^=&]*$/i;
const SPAM_PATH_RE = /^\/0x[0-9a-f]+\/?$/i;

function safeDecode(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export function isLegacySpamUrl(originalUrl: string): boolean {
  const qIndex = originalUrl.indexOf("?");
  const rawPath = qIndex === -1 ? originalUrl : originalUrl.slice(0, qIndex);
  const rawQuery = qIndex === -1 ? "" : originalUrl.slice(qIndex + 1).split("#")[0];
  const path = safeDecode(rawPath);
  if (SPAM_PATH_RE.test(path)) return true;
  if (path !== "/" && path !== "/index.html") return false;
  if (!rawQuery) return false;
  return SPAM_QUERY_RE.test(safeDecode(rawQuery));
}

const GONE_HTML = `<!doctype html>
<html lang="fa" dir="rtl"><head><meta charset="utf-8"><meta name="robots" content="noindex, nofollow"><title>این صفحه حذف شده است | طیوران صنعت پویا</title></head>
<body style="font-family:sans-serif;text-align:center;padding:48px 16px"><h1>این صفحه حذف شده است</h1><p>نشانی درخواستی دیگر وجود ندارد.</p><p><a href="https://www.toyooran.com/">صفحه اصلی طیوران صنعت پویا</a></p></body></html>`;

export function legacySpamGone(req: Request, res: Response, next: NextFunction) {
  if ((req.method === "GET" || req.method === "HEAD") && isLegacySpamUrl(req.originalUrl)) {
    res.status(410);
    res.setHeader("X-Robots-Tag", "noindex, nofollow");
    res.setHeader("Cache-Control", "public, max-age=3600");
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.send(GONE_HTML);
    return;
  }
  next();
}
