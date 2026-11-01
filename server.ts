import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import fs from "fs";
import cookieParser from "cookie-parser";
import { audit, changePassword, confirmMfa, consumeRateLimit, createCsrfToken, getAdminState, listSessions, loginAdmin, logoutAdmin, publicTurnstileSiteKey, requireAdmin, requireMfaPending, requireRole, resetRateLimit, revokeAllSessions, setAdminState, startMfaSetup, verifyCsrf, verifyMfaSession } from "./server/auth";
import { z } from 'zod';
import { DISABLED_PAGE_REDIRECT, isDisabledPagePath } from "./src/data/disabledPages";
import { CANONICAL_ORIGIN, englishFallbackRedirect, injectSeoTags, isKnownPublicPath, isPrivateAppPath, llmsTxtAll, normalizePublicUrl, robotsTxt, seoRedirectForAnyLang, sitemapXml, stripQuery } from "./server/seo";
import { englishArticle } from "./server/i18n";
import { EN_PREFIX, pathLang } from "./src/i18n";
import { invalidateSeoCatalog, loadPublicArticles, loadSeoCatalog } from "./server/catalog";
import { appendLead, leadsToCsv } from "./server/leads";
import { gzipResponses } from "./server/gzip";
import { cmsApiRouter } from "./server/cmsApi";
import { legacySpamGone } from "./server/legacySpam";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;
  app.disable('x-powered-by');
  // nginx (and docker bridge) sit in front of Express. Without this, req.ip is the proxy
  // address for every visitor, so the /api rate limiter becomes one global bucket.
  // Pair with nginx real_ip (set_real_ip_from <ArvanCloud ranges>) so X-Forwarded-For is the client.
  app.set('trust proxy', 'loopback, uniquelocal');
  // Legacy spam URLs (old hack): 410 Gone before host/URL normalization and SPA fallback.
  app.use(legacySpamGone);
  app.use((req, res, next) => {
    const host = (req.hostname || "").toLowerCase();
    if (host === "toyooran.com") {
      return res.redirect(301, `${CANONICAL_ORIGIN}${req.originalUrl}`);
    }
    next();
  });
  // One-hop URL normalization for public HTML routes: /index.html, trailing slash, junk query params.
  app.use((req, res, next) => {
    if (req.method !== 'GET' && req.method !== 'HEAD') return next();
    if (req.path.startsWith('/api/') || /\.[a-z0-9]{2,5}$/i.test(req.path) && req.path !== '/index.html') return next();
    const target = normalizePublicUrl(req.originalUrl);
    if (target && target !== req.originalUrl) return res.redirect(301, `${CANONICAL_ORIGIN}${target}`);
    next();
  });
  // Pages switched off for now (src/data/disabledPages.ts): temporary 302 to the home page, never cached,
  // noindex on the redirect itself. Runs before seoRedirectFor so aliases don't 301 into a disabled page.
  app.use((req, res, next) => {
    if (req.method !== 'GET' && req.method !== 'HEAD') return next();
    if (!isDisabledPagePath(req.path)) return next();
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-Robots-Tag', 'noindex');
    const home = pathLang(req.path) === 'en' ? (DISABLED_PAGE_REDIRECT === '/' ? EN_PREFIX : `${EN_PREFIX}${DISABLED_PAGE_REDIRECT}`) : DISABLED_PAGE_REDIRECT;
    return res.redirect(302, `${CANONICAL_ORIGIN}${home}`);
  });
  app.use((req, res, next) => {
    if (req.method !== 'GET' && req.method !== 'HEAD') return next();
    // Static files and API never need the catalog lookup (it used to run for every asset request).
    if (req.path.startsWith('/api/') || req.path.startsWith('/assets/') || /\.[a-z0-9]{2,5}$/i.test(req.path)) return next();
    const dest = seoRedirectForAnyLang(req.path, loadSeoCatalog());
    if (dest) {
      return res.redirect(301, `${CANONICAL_ORIGIN}${dest}`);
    }
    // An /en URL whose Persian page has no English version yet → closest English listing (temporary).
    const enFallback = englishFallbackRedirect(req.path);
    if (enFallback) {
      res.setHeader('Cache-Control', 'no-store');
      res.setHeader('X-Robots-Tag', 'noindex');
      return res.redirect(302, `${CANONICAL_ORIGIN}${enFallback}`);
    }
    next();
  });
  app.use((_req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    if (process.env.NODE_ENV === "production") {
      res.setHeader(
        "Content-Security-Policy",
        "default-src 'self'; base-uri 'self'; object-src 'none'; img-src 'self' data: https:; font-src 'self'; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com https://www.googletagmanager.com https://www.google-analytics.com https://www.google.com; connect-src 'self' https://challenges.cloudflare.com https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com https://www.google.com https://stats.g.doubleclick.net; frame-src https://challenges.cloudflare.com https://www.googletagmanager.com https://balad.ir"
      );
      res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
    } else {
      res.setHeader(
        "Content-Security-Policy",
        "default-src 'self'; base-uri 'self'; object-src 'none'; img-src 'self' data: https:; font-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://challenges.cloudflare.com https://www.googletagmanager.com https://www.google-analytics.com https://www.google.com; connect-src 'self' https://challenges.cloudflare.com https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com https://www.google.com https://stats.g.doubleclick.net; frame-src https://challenges.cloudflare.com https://www.googletagmanager.com https://balad.ir"
      );
    }
    next();
  });
  app.use(express.json({ limit: '2mb' }));
  app.use(cookieParser());
  app.use(gzipResponses);
  app.use("/api/cms/v1", cmsApiRouter);
  app.use('/api', (req, res, next) => {
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method) && !req.path.startsWith('/auth/login') && !req.path.startsWith('/consultation') && !verifyCsrf(req)) return res.status(403).json({ error: 'CSRF token نامعتبر است.' });
    next();
  });

  const apiHits = new Map<string, { count: number; resetAt: number }>();
  app.use('/api', (req, res, next) => {
    const now = Date.now();
    const key = req.ip || 'unknown';
    const entry = apiHits.get(key) || { count: 0, resetAt: now + 60_000 };
    if (entry.resetAt <= now) { entry.count = 0; entry.resetAt = now + 60_000; }
    entry.count += 1; apiHits.set(key, entry);
    if (entry.count > 60) return res.status(429).json({ success: false, error: 'درخواست‌های بیش از حد' });
    next();
  });

  app.post('/api/auth/login', async (req, res) => {
    const key = `login:${req.ip || 'unknown'}`; const rate = consumeRateLimit(key, 5, 15 * 60_000); if (!rate.allowed) return res.status(429).json({ success: false, error: 'تلاش‌های ورود زیاد است.' });
    const parsed = z.object({ username: z.string().trim().min(1).max(80), password: z.string().min(1).max(256), turnstileToken: z.string().optional() }).safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ success: false, error: 'اطلاعات ورود نامعتبر است.' });
    const { username, password, turnstileToken } = parsed.data;
    const result = await loginAdmin(username, password, turnstileToken, req.ip, res);
    if (result.success) resetRateLimit(key);
    res.status(result.success ? 200 : 401).json(result);
  });
  app.get('/api/auth/csrf', (_req, res) => res.json({ token: createCsrfToken(res), turnstileSiteKey: publicTurnstileSiteKey() }));
  app.post('/api/auth/password', requireAdmin, requireRole('superadmin'), (req, res) => {
    const parsed = z.object({ oldPassword: z.string().min(1).max(256), newPassword: z.string().min(16).max(256) }).safeParse(req.body);
    if (!parsed.success || !changePassword(req as any, parsed.data.oldPassword, parsed.data.newPassword)) return res.status(400).json({ success: false, error: 'تغییر رمز ناموفق بود.' });
    audit(req as any, 'password_changed'); res.status(204).end();
  });
  app.get('/api/auth/sessions', requireAdmin, (req, res) => res.json({ sessions: listSessions(req as any) }));
  app.delete('/api/auth/sessions', requireAdmin, (req, res) => { revokeAllSessions(req as any); res.status(204).end(); });
  app.post('/api/auth/logout', requireAdmin, (req, res) => { logoutAdmin(req, res); res.status(204).end(); });
  app.get('/api/auth/me', requireAdmin, (req, res) => res.json({ authenticated: true, admin: (req as any).admin }));
  app.post('/api/auth/mfa/verify', requireMfaPending, async (req, res) => {
    const ok = await verifyMfaSession(req as any, String(req.body?.token || ''));
    res.status(ok ? 200 : 400).json({ success: ok, error: ok ? undefined : 'کد MFA نامعتبر است.' });
  });
  app.post('/api/auth/mfa/setup', requireAdmin, (req, res) => res.json(startMfaSetup((req as any).admin.id)));
  app.post('/api/auth/mfa/confirm', requireAdmin, async (req, res) => {
    const ok = await confirmMfa((req as any).admin.id, String(req.body?.token || ''));
    res.status(ok ? 200 : 400).json({ success: ok, error: ok ? undefined : 'کد MFA نامعتبر است.' });
  });
  app.get('/api/admin/state/:key', requireAdmin, requireRole('superadmin', 'content_manager', 'sales_manager', 'media_manager', 'viewer'), (req, res) => {
    const key = String(req.params.key);
    const value = getAdminState(key);
    res.json({ value });
  });
  app.put('/api/admin/state/:key', requireAdmin, requireRole('superadmin', 'content_manager', 'sales_manager', 'media_manager'), (req, res) => {
    const key = String(req.params.key);
    if (!['products', 'projects', 'services', 'articles', 'categories', 'companyInfo', 'heroCms', 'aiConfig', 'quotes', 'consultations', 'customers', 'media'].includes(key)) return res.status(400).json({ error: 'کلید state نامعتبر است.' });
    if (JSON.stringify(req.body?.value ?? null).length > 2_000_000) return res.status(413).json({ error: 'داده بیش از حد بزرگ است.' });
    setAdminState(req as any, key, req.body?.value);
    invalidateSeoCatalog();
    res.status(204).end();
  });
  app.get('/api/magazine', (req, res) => {
    res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
    // ?lang=en: only articles with a complete English version (src/i18n/en/magazine.json), translated.
    if (req.query.lang === 'en') {
      const articles = loadPublicArticles().map((a) => englishArticle(a)).filter(Boolean);
      return res.json({ articles, topics: [...new Set(articles.map((a) => a!.topic).filter(Boolean))] });
    }
    res.json({ articles: loadPublicArticles() });
  });

  // API Route: Send form submission / consultation to Bale Bot
  app.post("/api/consultation", async (req, res) => {
    try {
      const {
        fullName,
        phoneNumber,
        companyName,
        subject,
        productName,
        capacity,
        location,
        message,
        source,
        timestamp,
        isDecisionMaker,
        timing,
        pagePath,
        conversionEvent
      } = req.body;
      appendLead({
        fullName,
        phoneNumber,
        companyName,
        subject,
        productName,
        capacity,
        location,
        message,
        source,
        isDecisionMaker: Boolean(isDecisionMaker),
        timing,
        pagePath,
        conversionEvent,
      });

      const baleToken = process.env.BALE_BOT_TOKEN === 'AI_STUDIO_PREVIEW_DISABLED' ? '' : process.env.BALE_BOT_TOKEN;
      const baleChatId = process.env.BALE_CHAT_ID === 'AI_STUDIO_PREVIEW_DISABLED' ? '' : process.env.BALE_CHAT_ID;

      // Construct formatted Persian message for Bale Messenger
      const formattedLines = [
        `🔔 *درخواست جدید از وب‌سایت طیوران صنعت پویا*`,
        `━━━━━━━━━━━━━━━━━━`,
        `👤 *نام متقاضی:* ${fullName || 'ثبت نشده'}`,
        `📞 *شماره تماس:* ${phoneNumber || 'ثبت نشده'}`,
        companyName ? `🏢 *نام واحد / مرغداری:* ${companyName}` : null,
        subject ? `📋 *موضوع:* ${subject}` : null,
        productName ? `📦 *محصول انتخابی:* ${productName}` : null,
        location ? `📍 *شهر / استان:* ${location}` : null,
        capacity ? `📐 *ظرفیت سالن:* ${capacity}` : null,
        message ? `📝 *توضیحات:* ${message}` : null,
        source ? `🏷 *بخش ارسال‌کننده:* ${source}` : null,
        `━━━━━━━━━━━━━━━━━━`,
        `⏰ *زمان ثبت:* ${timestamp || new Date().toLocaleString('fa-IR')}`,
        `🌐 *سامانه آنلاین طیوران صنعت پویا*`
      ].filter(Boolean);

      const formattedMessage = formattedLines.join('\n');

      let baleResult: any = null;
      let sent = false;

      if (baleToken && baleChatId) {
        try {
          const response = await fetch(`https://tapi.bale.ai/bot${baleToken}/sendMessage`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              chat_id: baleChatId,
              text: formattedMessage,
            })
          });
          baleResult = await response.json();
          sent = response.ok;
          if (!response.ok) {
            console.error("Bale API responded with error:", baleResult);
          }
        } catch (fetchError) {
          console.error("Error connecting to Bale API:", fetchError);
        }
      } else {
        console.log("ℹ️ Bale Bot Token or Chat ID not configured in .env. Message formatted:\n", formattedMessage);
      }

      res.status(200).json({
        success: true,
        sentToBale: sent,
        baleResult,
        message: sent 
          ? 'درخواست با موفقیت ثبت و پیام به ربات بله ارسال گردید.' 
          : 'درخواست در سیستم ثبت شد.'
      });
    } catch (error: any) {
      console.error("Consultation API error:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Bale bot configuration status
  app.get("/api/bale/status", (_req, res) => {
    const hasToken = !!process.env.BALE_BOT_TOKEN && process.env.BALE_BOT_TOKEN !== 'AI_STUDIO_PREVIEW_DISABLED';
    const hasChatId = !!process.env.BALE_CHAT_ID && process.env.BALE_CHAT_ID !== 'AI_STUDIO_PREVIEW_DISABLED';
    res.json({
      configured: hasToken && hasChatId,
      hasToken,
      hasChatId
    });
  });

  // Health check endpoint
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });
  app.get("/api/admin/leads.csv", requireAdmin, (_req, res) => {
    res.set({ "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": "attachment; filename=toyooran-leads.csv" });
    res.send(leadsToCsv());
  });

  // SEO: robots.txt
  app.get("/robots.txt", (_req, res) => {
    res.type('text/plain');
    res.set("Cache-Control", "public, max-age=300, s-maxage=3600");
    res.send(robotsTxt());
  });

  app.get("/llms.txt", (_req, res) => {
    res.type("text/plain; charset=utf-8");
    res.set("Cache-Control", "public, max-age=300, s-maxage=3600");
    res.send(llmsTxtAll());
  });

  app.get("/sitemap.xml", (_req, res) => {
    res.header('Content-Type', 'application/xml');
    res.set("Cache-Control", "public, max-age=300, s-maxage=3600");
    res.send(sitemapXml());
  });

  app.get("/TSPK_catalog.pdf", (_req, res) => {
    const prodFile = path.join(process.cwd(), "dist", "TSPK_catalog.pdf");
    const devFile = path.join(process.cwd(), "public", "TSPK_catalog.pdf");
    const file = fs.existsSync(prodFile) ? prodFile : devFile;
    if (!fs.existsSync(file)) return res.status(404).type("text/plain").send("catalog not found");
    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="TSPK_catalog.pdf"',
      "Cache-Control": "public, max-age=86400",
    });
    res.sendFile(path.resolve(file));
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "custom", // Changed from spa to custom to handle HTML manually
    });
    app.use(vite.middlewares);
    
    // Serve index.html for all other routes
    app.use(/.*/, async (req, res, next) => {
      try {
        const url = stripQuery(req.originalUrl);
        
        let template = fs.readFileSync(path.resolve('index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        
        const finalHtml = injectSeoTags(template, url);
        const isKnownRoute = isKnownPublicPath(url);
        const headers: Record<string, string> = { "Content-Type": "text/html" };
        if (!isKnownRoute && url !== "/") {
          headers["Cache-Control"] = "no-store";
          headers["X-Robots-Tag"] = "noindex, nofollow, noarchive";
          res.status(404).set(headers).end(finalHtml);
          return;
        }
        if (isPrivateAppPath(url)) {
          headers["Cache-Control"] = "no-store";
          headers["X-Robots-Tag"] = "noindex, nofollow, noarchive";
        } else {
          headers["Cache-Control"] = "public, max-age=120, s-maxage=600, stale-while-revalidate=86400";
        }
        res.status(200).set(headers).end(finalHtml);
      } catch (e: any) {
        vite.ssrFixStacktrace(e);
        next(e);
      }
    });
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(
      "/assets",
      express.static(path.join(distPath, "assets"), {
        maxAge: "1y",
        immutable: true,
        index: false,
        setHeaders(res) {
          res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
        },
      })
    );
    app.use(
      express.static(distPath, {
        index: false,
        maxAge: "7d",
        setHeaders(res, filePath) {
          if (/[/\\]images[/\\]/.test(filePath)) {
            res.setHeader("Cache-Control", "public, max-age=3600, must-revalidate");
            return;
          }
          if (/\.(webp|avif|jpg|jpeg|png|svg|woff2)$/i.test(filePath)) {
            res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
          }
        },
      })
    );
    
    const template = fs.readFileSync(path.join(distPath, 'index.html'), 'utf-8');
    app.get(/.*/, (req, res) => {
      const url = stripQuery(req.originalUrl);
      let finalHtml: string;
      try {
        finalHtml = injectSeoTags(template, url);
      } catch (error) {
        // Never let a malformed CMS record become a hard 500 for Googlebot. 503 + Retry-After is
        // treated as temporary; the real fix is defensive rendering in resolveSeo.
        console.error('SEO render failed for', url, error);
        res.status(503).set({ 'Retry-After': '120', 'Cache-Control': 'no-store', 'Content-Type': 'text/html' }).send(template);
        return;
      }
      const isKnownRoute = isKnownPublicPath(url);
      const headers: Record<string, string> = { "Content-Type": "text/html" };
      if (!isKnownRoute && url !== "/") {
        headers["Cache-Control"] = "no-store";
        headers["X-Robots-Tag"] = "noindex, nofollow, noarchive";
        res.status(404).set(headers).send(finalHtml);
        return;
      }
      if (isPrivateAppPath(url)) {
        headers["Cache-Control"] = "no-store";
        headers["X-Robots-Tag"] = "noindex, nofollow, noarchive";
      } else {
        headers["Cache-Control"] = "public, max-age=120, s-maxage=600, stale-while-revalidate=86400";
      }
      res.status(200).set(headers).send(finalHtml);
    });
  }

  process.on('unhandledRejection', (reason) => console.error('unhandledRejection', reason));

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
