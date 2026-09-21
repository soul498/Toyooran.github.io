# FULL SEO AUDIT REPORT — toyooran.com

**Preferred canonical:** https://www.toyooran.com  
**Audit completed:** 2026-09-21 (Asia/Tehran)  
**Runtime setup:** Succeeded (`claude-seo setup` + `doctor --json` → `ready: true`, `browser_ready: true`)  
**Methods:** curl (cookie jar), Playwright `render_page.py`, screenshots, `pagespeed_check.py` (rate-limited), robots/sitemap  
**Crawl sample:** 29 key URLs + sitemap inventory (**143** URLs). Quality over a 500-page breadth crawl.

---

## Executive Summary

| Metric | Value |
|--------|-------|
| **SEO Health Score** | **51/100** |
| **Business type** | B2B Local Industrial Services + Equipment Catalog (poultry house equipping/renovation — طیوران صنعت پویا) |
| Pages in sitemap | 143 |
| Pages deeply audited | 29 shells + homepage/fitout/contact renders |

### Score breakdown (skill weights)

| Category | Weight | Score |
|----------|--------|------:|
| Technical SEO | 22% | 48 |
| Content Quality | 23% | 50 |
| On-Page SEO | 20% | 62 |
| Schema / Structured Data | 10% | 58 |
| Performance (CWV) | 10% | 38 |
| AI Search Readiness | 10% | 45 |
| Images | 5% | 48 |
| **Weighted total** | 100% | **51** |

### Top 5 critical / high issues (with evidence)

1. **Critical — ArvanCloud 307 cookie loop**  
   `https://www.toyooran.com/` returns **307 → self** with `Set-Cookie: __arcscoc` / `__arcsco` until cookies are stored. Cookie-less curl infinite-loops. Googlebot UA: 307 without jar; **200** with jar.

2. **Critical — CSR-thin main content (Priority #1)**  
   Empty `#root` + short `#seo-prerender`. Homepage shell ~3388 bytes vs Playwright rendered ~87KB; contact prerender ~60 characters; main JS `/assets/index-DexY4bQy.js` ~1.84MB.

3. **Critical — Duplicate money pages**  
   `https://www.toyooran.com/services/poultry-hall-fitout` and `https://www.toyooran.com/services/srv-turnkey-shed` share **identical** `<title>`, meta description, H1, and `#seo-prerender` body. Both listed in sitemap.

4. **High — OG “Google AI Studio” placeholders**  
   Sampled pages emit `og:title=Toyooran` and `og:description=An application built with Google AI Studio.` before correct Persian OG tags.

5. **High — Dual H1 + invisible hero H1**  
   After hydrate, `#seo-prerender` H1 remains alongside React H1. Homepage hero H1 starts with inline `opacity: 0`.

### Top 5 quick wins

1. Remove AI Studio default OG/Twitter tags from the HTML template.
2. 301 `https://www.toyooran.com/services/srv-turnkey-shed` → `https://www.toyooran.com/services/poultry-hall-fitout` (or unique rewrite + sitemap cleanup).
3. Fix 404 shell: no self-canonical; add `noindex`.
4. Enrich `/contact` and `/about` `#seo-prerender` with full NAP + CTA (مشهد / گرگان).
5. Fix Article `datePublished` to ISO-8601 in JSON-LD.

### www / canonical / redirect summary

| Entry | Result |
|-------|--------|
| `https://toyooran.com/` | **301** → `https://www.toyooran.com/` |
| `http://www.toyooran.com/` / `http://toyooran.com/` | **301** → `https://www.toyooran.com/` |
| `https://www.toyooran.com/` (no cookies) | **307** self-loop |
| `https://www.toyooran.com/` (cookie jar) | **200** |
| Canonicals + sitemap | **www only**, consistent with preferred origin |

Contract claim of www/non-www canonical inconsistency: **Partially verified** (host consolidation OK; cookie challenge complicates tooling).

### Contract hypotheses — verification

| Hypothesis | Status |
|------------|--------|
| React + React Router + Vite + Express | **Partially verified** (Vite hashed SPA assets + empty `#root`; exact versions not exposed in HTML) |
| Main content CSR; metadata in HTML shell | **Verified** |
| www vs non-www canonical inconsistency | **Partially verified** |
| `lang` en instead of fa-IR/rtl | **Not verified** — live `lang="fa-IR" dir="rtl"` |

---

## Technical SEO (score 48)

Details: `findings/technical.md`.

**Works:** HTTPS, HSTS `includeSubDomains`, robots clarity + AI bot allows, apex→www 301, www canonicals, true 404 status, viewport, baseline security headers, `fa-IR`/`rtl`.

**Issues:** Cookie 307 loop; SPA thin body; dual H1; CSP missing `font-src` (blocks `data:` fonts); 404 self-canonical; HTML `x-cache: BYPASS`.

## Content Quality (score 50)

Details: `findings/content.md`.

Persian niche quality is solid where present (magazine topics useful for poultry engineering). Crawlable depth is the bottleneck. Duplicate service URL is the worst content-architecture defect on the highest commercial intent.

Rendered homepage includes experience/project claims and CTAs; گرگان offices appear in rendered DOM but are weak in shell/schema.

## On-Page SEO (score 62)

Money-page titles / H1 / descriptions generally match تجهیز، نوسازی، تهویه، گرمایش intents (Priority #3 mostly met for tags). Gaps: OG pollution, dual H1, thin contact/about shells, opaque `TS-###` product slugs.

## Schema / Structured Data (score 58)

Details: `findings/schema.md`.

Server JSON-LD present: Organization, WebSite, Service, Product, Article, BreadcrumbList (Priority #4 partly met). Missing LocalBusiness, Product `image`/`Offer`, ISO article dates, city-level `areaServed` for مشهد/گرگان.

## Performance (score 38)

Details: `findings/performance.md`.

**PSI/CrUX unavailable** (rate limit) — no fabricated field CWV. Lab: ~1.84MB JS (`/assets/index-DexY4bQy.js`), ~4.3s Playwright render, hero JPEG ~179KB, HTML cache BYPASS.

## Images (score 48)

Homepage rendered: 13 `<img>`, **4** missing/empty `alt`. Hero remains JPEG (not AVIF/WebP in sampled URL).

## AI Search Readiness (score 45)

Details: `findings/geo.md`.

AI bots allowed in robots.txt. **No `llms.txt`** (404). Citability limited by thin prerender + OG placeholder.

## SXO (search experience)

Details: `findings/sxo.md`.

Fitout URL matches commercial intent but is thin and cannibalized by `https://www.toyooran.com/services/srv-turnkey-shed`. Categories fit equipment queries better. Local مشهد/گرگان intent under-supported in schema/shell. Rendered CTAs (مشاوره) are strong when JS runs.

## Visual

Screenshots: `screenshots/flat/home-desktop.png`, `home-mobile.png`, `fitout-desktop.png`, `contact-desktop.png`.

RTL responsive UI with clear yellow CTAs; fitout page visually sparse vs home.

## Limitations (no fabrication)

- No GSC / GA4 / CrUX / paid SERP APIs in this run
- PSI rate-limited — CWV field metrics not available
- Crawl sample 29 + sitemap 143 (not exhaustive link crawl to 500)
- Cookie challenge may differ for Google’s production crawlers vs this lab

## Artifact index

| Path | Description |
|------|-------------|
| `FULL-AUDIT-REPORT.md` | This report |
| `ACTION-PLAN.md` | Prioritized actions |
| `audit-data.json` | Skill envelope |
| `findings/*.md` | Category findings |
| `screenshots/flat/*` | Desktop/mobile captures |
| `raw/` | HTML shells, crawl JSON, robots, sitemap, renders |
