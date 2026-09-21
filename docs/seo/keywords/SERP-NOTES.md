# SERP Notes — طیوران صنعت پویا (keyword research)

**Date:** 2026-09-21 (Asia/Tehran, UTC+3:30)  
**Scope:** fa-IR B2B poultry-house equipment / renovation — toyooran.com  
**Volume policy:** Qualitative only (High / Med / Low). **No invented monthly search volumes.**

---

## Method

| Source | What we used | Limitation |
|--------|----------------|------------|
| Google Suggest API (`suggestqueries.google.com`, `hl=fa`, `gl=ir`) | Autocomplete expansion for ~30 Persian seeds | Presence of suggestions ≠ volume; empty suggest ≠ zero demand |
| WebSearch SERP snapshots | Competitor titles/URLs for main commercial & calc seeds | Ranking fluctuates; not a full SERP scrape |
| Competitor homepage title fetch (curl) | Positioning of known Iranian vendors | Some sites timeout / no title |
| toyooran.com sitemap + JS bundle (cookie-jar curl) | Real URLs, product categories, magazine slugs | Homepage is SPA; cookie-less WebFetch timed out (Arvan-style challenge) |
| Existing Ready backlog | Anchored clusters and scores | Assumed SME/CTA still valid |

**Demand estimate rubric (qualitative):**

- **High:** Rich autocomplete tree and/or multiple dedicated competitor articles/product pages in SERP for the same head term  
- **Med:** Exact/near suggest + some SERP depth, or strong commercial intent with thinner suggest  
- **Low:** Sparse suggest, niche/local, or intent diluted (DIY/directories)

---

## Site structure observed (toyooran.com)

Verified HTTP 200 (cookie jar):

- Service hub: `/services/poultry-hall-fitout` (+ other srv-* in sitemap)
- Product categories: `/products/ventilation|heating|feeding|drinking|cooling|inlet|cage|silo|other`
- Magazine (relevant):  
  - `/magazine/how-to-calculate-ventilation-capacity`  
  - `/magazine/comparison-of-heating-systems`  
  - `/magazine/introduction-to-pouya-butterfly-feeder`  
  - `/magazine/common-mistakes-in-poultry-design`  
  - Also present (strategy-blocked for claims): `case-study-implemented-project`, `cost-and-components-of-equipping-a-hall`, `before-and-after-renovation`
- Projects: several `/projects/proj-*` URLs in sitemap — treat as evidence-gated for ranking claims

Brand also appears on directory listings (parscenter) under «طیوران صنعت پویا» / مشهد; older domain references (tspk-co.com) still circulate — canonicalize to toyooran.com in content.

---

## Seed → SERP / suggest observations

### A — Equip / renovate

- Query **تجهیز و نوسازی سالن مرغداری**: SERP skewed to **guides** (isonic essential-equipment design, asanmoshaver farm setup, sandwich-panel vendors, Chinese-cage retrofit articles) more than Mashhad turnkey fitout vendors. **Gap:** engineering service page with consultation CTA.
- **طراحی سالن مرغداری** / **اجرای سالن مرغداری**: autocomplete present; intent mixes civil contractor vs equipment packager — messaging must stay on تاسیسات/تجهیز.
- **تجهیزات مرغداری مشهد**: local SERP includes pars-tajhizat.ir, behtarino directories, map listings — NAP + local proof matter.
- **تجهیزات مرغداری گرگان**: suggest exists; thinner competitive content observed.
- **هزینه تجهیز سالن**: high commercial curiosity in market narrative; **do not publish fixed prices** (blocked). Scenario/components only.

### B — Ventilation / climate

- **محاسبه تهویه / تعداد هواکش**: crowded with strong how-tos — aerofanco.ir, karnotech.co, nemunetak.com. Common pattern: tunnel CFM from cross-section × velocity ÷ fan catalog m³/h. **Gap for Toyooran:** static pressure, pad/inlet losses, manufacturer curves, CTA to supply + install (not another copy of the same formula).
- **هواکش مرغداری**: rich suggest (۱۴۰، ۱۰۰، قیمت، سقفی، دست دوم، صنعتی). Commercial category opportunity on `/products/ventilation`.
- **اینلت مرغداری**: very rich suggest (چیست، قیمت، ابعاد، خرید، پارس، بهترین). Product SERPs: kgy-ind.com, andisheh-sabz.com, chicken-device.ir. **Gap:** calc of inlet count + negative pressure tied to fan selection.
- **تهویه تونلی / تهویه حداقلی**: exact suggests; fewer polished decision guides than tunnel CFM pages.
- **پد سلولزی مرغداری**: rich suggest including **محاسبه** and **نصب**. garmasaze.com has fan-pad calc article. Natural pair with cooling category TS-017 etc.
- **فن سیرکوله مرغداری**: exact suggest; lower breadth than ۱۴۰ fans.

### C — Heating

- **جت هیتر مرغداری**: dense suggest (قیمت، بهترین، گازی، برقی، مصرف گاز، ترموستات، تعمیر). Content/commerce: ntdamavand.co, garmasaze.com, eig-shop, akhgartabesh (radiant vs other).
- **مقایسه جت‌هیتر و گرمایش تابشی**: comparison intent served by radiant vendors and general heater blogs — Ready#4 should stay decision-oriented and route to `/products/heating`.
- **هیتر مرغداری** / **کوره هوای گرم مرغداری**: broad commercial head terms; cannibalize into single heating hub.

### D — Feeding / drinking

- **دانخوری پروانه ای / پویا**: brand/product mostly directory (parscenter) rather than owned educational landing — Ready#3 critical.
- **دانخوری بشقابی** / **دانخوری زنجیری**: strong autocomplete (پارس، کوناوی، قیمت، قطعات زنجیری). Use as comparison cluster → Pouya CTA, not primary product push for chain feeders.
- **آبخوری نیپل**: broad suggest + calc pages (modiranfarm, karnotech). Opportunity: calc + `/products/drinking` + install package.

### Other

- **اتوماسیون مرغداری**: rich suggest (قیمت، گوشتی، هوشمند). Valid later topic once core fitout/ventilation/heating/feeding pages mature; product TS-019 exists.

---

## Competitor map (content / commerce roles)

| Player | Role in SERPs observed | Content gap vs Toyooran opportunity |
|--------|------------------------|-------------------------------------|
| **karnotech.co** | Design/renovate positioning; strong calc articles (ventilation, drinker/feeder counts) | Own calc + **Pouya feeder** + Mashhad/Gorgan execution CTA |
| **aerofanco.ir** | Fan OEM; deep ventilation calculation guide | Tie calc to multi-brand supply + hall retrofit, not fan-only |
| **isonic.ir** | Broiler essential equipment / hall design education | Convert education → fitout service quote |
| **kgy-ind.com (کولاک گستر)** | Inlet/fans/heaters manufacturer | Reseller/integrator narrative + system design |
| **andisheh-sabz.com / chicken-device.ir** | Inlet & equipment ecommerce-style pages | Spec + engineering selection vs pure SKU |
| **ntdamavand.co / garmasaze.com** | Jet heater / radiant / pad calc commerce content | Neutral comparison → package with ventilation |
| **pars-tajhizat.ir** | Local Mashhad poultry supplies | Service depth (نوسازی مهندسی) vs shop |
| **modiranfarm.com** | Training/calc (drinkers) | B2B quote path weaker — Toyooran CTA advantage |
| **Directory (parscenter, behtarino)** | Brand discovery | Thin product education — owned pages must win |

Toyooran-specific evidence possible today: product catalog depth (TS-* ventilation/heating/feeding/drinking), service fitout URL, magazine drafts. **Project before/after still evidence-blocked.**

---

## Content gaps (actionable)

1. **Service page for تجهیز/نوسازی** that outranks generic “how to build a farm” articles — process, audit, systems order, CTA.  
2. **Ventilation calc rewrite** differentiated on static pressure + real fan curves + link to SKUs.  
3. **Inlet education + count calculator** (under-served vs fan calc).  
4. **Fan 140 buying guide** on owned category (prices as inquiry, not fake lists).  
5. **Pouya paddle feeder** owned narrative vs directory scraps + comparison vs بشقابی/زنجیری.  
6. **Pad sizing** paired with tunnel fans (complements Ready ventilation).  
7. **Pre-renovation audit checklist** (Ready#5) — SERP has hygiene/startup checklists, not equipment retrofit audits.  
8. **Local Mashhad/Gorgan** trust layer after national service page is strong.  
9. **Do not** chase vanity: news, fixed hall cost tables, case studies without photos/metrics.

---

## Tooling / access blockers

| Blocker | Impact | Mitigation used |
|---------|--------|-----------------|
| No keyword-volume API (Ahrefs/Keyword Planner/etc.) | No exact monthly volumes | Autocomplete + SERP depth → High/Med/Low |
| Arvan/cookie challenge on cookie-less WebFetch | Homepage fetch timeout via WebFetch | curl + cookie jar succeeded |
| SPA shell | Raw HTML thin without JS | Parsed `/assets/index-*.js` + sitemap.xml |
| Suggest empty for some commercial phrases (e.g. نوسازی سالن، هزینه تجهیز) | Cannot treat as zero demand | Kept via SERP intent + stakeholder Ready scores |
| No live GSC / Search Console export in this task | No branded query list or impressions | Recommend pull GSC next for validation |
| Rankings not scraped position-by-position | Competitor list is illustrative | Re-check before publishing each page |

---

## PAA-style patterns (from SERP titles & guides — not fabricated Q&A widgets)

Recurring question shapes to cover in guides/calcs:

- How many **۱۴۰** fans for hall W×H and target airspeed?  
- Catalog CFM vs **real** CFM at operating static pressure?  
- How many **inlets** for given fan capacity and inlet opening velocity?  
- Tunnel vs **minimum** ventilation — when to switch?  
- Jet heater vs **radiant** — fuel, litter, chimney, bird comfort?  
- Birds per **nipple** / per **paddle feeder**?  
- What to audit **before** renovating an old hall?

Each answer page must end in consultation/quote CTA aligned to a Product/Service URL.
