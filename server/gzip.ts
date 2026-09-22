import type { Request, Response, NextFunction } from "express";
import path from "path";
import zlib from "zlib";

export function gzipResponses(req: Request, res: Response, next: NextFunction) {
  if (!/\bgzip\b/.test(String(req.headers["accept-encoding"] || ""))) return next();
  const ext = path.extname(req.path);
  const maybeHtml = !ext || ext === ".html";
  const maybeText = /\.(js|css|json|xml|txt|svg|map)$/i.test(req.path);
  if (!maybeHtml && !maybeText) return next();

  const chunks: Buffer[] = [];
  const originalWrite = res.write.bind(res);
  const originalEnd = res.end.bind(res);

  res.write = ((chunk: unknown, encoding?: unknown, cb?: unknown) => {
    if (chunk) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk as string, encoding as BufferEncoding));
    if (typeof encoding === "function") encoding();
    if (typeof cb === "function") cb();
    return true;
  }) as typeof res.write;

  res.end = ((chunk?: unknown, encoding?: unknown, cb?: unknown) => {
    if (chunk) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk as string, encoding as BufferEncoding));
    const body = chunks.length ? Buffer.concat(chunks) : Buffer.alloc(0);
    const type = String(res.getHeader("Content-Type") || (maybeHtml ? "text/html; charset=utf-8" : ""));
    const compressible = body.length > 800 && /javascript|json|text\/|xml|svg\+xml/.test(type);
    if (!compressible) {
      res.write = originalWrite;
      res.end = originalEnd;
      return originalEnd(body);
    }
    try {
      const gz = zlib.gzipSync(body, { level: 5 });
      res.setHeader("Content-Encoding", "gzip");
      res.setHeader("Vary", "Accept-Encoding");
      res.setHeader("Content-Length", String(gz.length));
      res.removeHeader("Accept-Ranges");
      res.write = originalWrite;
      res.end = originalEnd;
      return originalEnd(gz);
    } catch {
      res.write = originalWrite;
      res.end = originalEnd;
      return originalEnd(body);
    }
  }) as typeof res.end;

  next();
}
