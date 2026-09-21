# ACTION PLAN — toyooran.com

Priorities: **Critical > High > Medium > Low**  
Aligned with their algorithm when evidence supports it:  
**(1) main content in initial HTML → (2) canonical/redirect/sitemap → (3) money H1/title/desc → (4) server schema → (5) commercial CTA → (6) article E-E-A-T**.

---

## Critical

| ID | Action | Evidence | Algorithm map |
|----|--------|----------|---------------|
| C1 | Fix ArvanCloud bot challenge so Googlebot/Bingbot/major tools get **200 without infinite 307** (whitelist or complete challenge server-side) | 307 self-loop + `__arcscoc`/`__arcsco` without cookies | Crawlability |
| C2 | **SSR/prerender** full money-page copy for `/`, `/services/poultry-hall-fitout`, key categories, `/contact`, `/about` into initial HTML | Shell ~3.4KB vs rendered ~87KB; contact prerender ~60 chars | Priority **1** |
| C3 | **Dedupe:** 301 `/services/srv-turnkey-shed` → `/services/poultry-hall-fitout` (or fully unique content); remove loser from sitemap | Identical title/desc/H1/prerender | Priority **2** + **3** |

## High

| ID | Action | Evidence | Algorithm map |
|----|--------|----------|---------------|
| H1 | Remove AI Studio placeholder OG/Twitter tags from base HTML | Toyooran / Google AI Studio on all samples | On-page / trust |
| H2 | Ensure **single H1**; remove prerender from DOM after hydrate; do not animate H1 from `opacity: 0` | Dual H1 on home/fitout; opacity:0 hero | Priority **3** / CWV |
| H3 | 404 shell: drop self-canonical; add `noindex,follow` | 404 canonicalizes missing URL | Priority **2** |
| H4 | Add `LocalBusiness` JSON-LD with مشهد NAP + گرگان branch/department; match visible phones | Organization only; Gorgan UI-only | Priority **4** |
| H5 | Product schema: add `image` + `Offer` (real availability/price policy) | Product JSON-LD incomplete | Priority **4** |
| H6 | Enrich contact/about `#seo-prerender` with phones, addresses, hours, CTA (form may stay CSR) | Contact prerender ~60 chars | Priority **5** |
| H7 | Code-split ~1.84MB JS (`/assets/index-DexY4bQy.js`); preload LCP image; WebP/AVIF hero | Lab asset sizes; PSI unavailable | Performance |

## Medium

| ID | Action | Algorithm map |
|----|--------|---------------|
| M1 | Article schema: ISO-8601 dates; named Person author where real | Priority **6** |
| M2 | Expand fitout page: process, capacity checklist, case studies, FAQ, strong CTA | Priority **1** + **5** |
| M3 | Strengthen thin categories (`feeding`, `inlet`) toward heating/ventilation depth | Priority **1** |
| M4 | Magazine E-E-A-T: author bios, citations, updated dates, links to fitout/categories | Priority **6** |
| M5 | Add `llms.txt`; sitemap `<lastmod>`; exclude non-canonical duplicates | GEO + Priority **2** |
| M6 | CSP `font-src` for required fonts (stop data: font blocks) | Technical |

## Low

| ID | Action |
|----|--------|
| L1 | Consider Persian slugs alongside/instead of opaque `TS-###` product URLs |
| L2 | Edge-cache public HTML where safe (`x-cache: BYPASS` today) |
| L3 | Add FAQ/HowTo schema on calculator-style magazine guides |
| L4 | Organization `sameAs` social profiles |

---

## Phased roadmap

### Phase 1 — Week 1 (Critical)
C1, C2, C3, H1

### Phase 2 — Weeks 2–3 (High)
H2–H7

### Phase 3 — Month 2 (Content & authority)
M1–M5

### Phase 4 — Ongoing
L1–L4, PSI/CrUX + GSC monitoring when credentials/quota available

---

## Do not prioritize yet

- Mass new blog posts before Priority **1–3** fixes (matches their stated algorithm)
- Fabricating Product prices in schema without real offer data
