# Changelog

## 2026-11-15

- Four-language audit: the live CMS ventilation category description (`هواکش‌های صنعتی ۱۴۰ و ۱۰۰، فن‌های سیرکوله و آکسیال`) had no EN/TR/RU dictionary entry, so the Persian sentence appeared on `/en`, `/tr` and `/ru` homepages. Added the missing translations, aligned the seed category text, and gave Categories in `/admin` the same EN/TR/RU overlay fields as products/services so a later Persian edit does not leak. Categories now use `translateCmsRecord`.
- English product counts no longer say "1 products". Turkish magazine copy had a systematic `kapassit` misspelling of `kapasite` (83). `check:i18n` now also requires used keys to exist in the Turkish and Russian dictionaries.

## 2026-11-14

- Services: four cards → six (user request, group «سایت طیوران صنعت»), each with its own indexable page: /services/industrial-buildings, /farm-equipment-installation, /feed-machinery, /feed-products, /modernization, /research-collaboration (+ /en). Body text is only the user's copy (src/data/servicePages.ts), edited for brand rules (third person, no «ما»; doubled spaces). Per page: title, meta description from the user's text, H1 = service title, canonical, hreflang, OG, Service + BreadcrumbList JSON-LD, related links (feeder + jet heater on service 2, the feed mill/mixer product on 3, /rnd on 6), free-consultation CTA and phones, links to the other services. Service 2 carries the flagship butterfly feeder block; service 6 the international cooperation and approach sections. Cards are now real links in a 3-column grid (home and /services); footer lists the six pages; /services hero subtitle and prerender use the user's text. Old service URLs 301 to the closest new page (fit-out and consulting → modernization; turnkey shed → industrial-buildings; equipment supply → farm-equipment-installation; machinery → feed-machinery; feed & supplements → feed-products), and in-text links to them are rewritten to the new pages. Sitemap and llms.txt list the six pages.
- /about page name «درباره» → «درباره ما» (requested; the only exception to the no-«ما» rule): menu, footer, H1 and <title>/og:title «درباره ما | طیوران صنعت پویا، …». Body copy, URL and layout unchanged; English stays "About".
- /products fixes: card thumbnails use new 4:3 AVIF/WebP thumbnails (public/images/products/thumb/TS-NNN-{400,800}, srcset/sizes, first row eager; full files stay on the detail page; related products use the 400w thumb); category label on cards sits above the photo; search matches product names only (no ts codes); category grid text aligns to the start in English. «استعلام قیمت» on cards navigates once, scrolls to #consultation-form once the contact page has loaded, does not repeat the product line, and selects the «استعلام قیمت» subject (other preset subjects not in the list get their own option). Latin model names in Persian product names are isolated (<bdi dir="ltr">) in cards, the category list, breadcrumbs, H1 and related products. /api/auth/me answers 200 {authenticated:false} (no-store) when there is no session cookie; requests with a cookie still go through requireAdmin.
- Real site photos (Z:\tspk, user-approved 2026-11-14; graphic designer's picks) under public/images/site/ as AVIF + WebP at several widths (src/data/sitePhotos.ts, alt text fa/en).
- Home: hero is the equipped hall (photo 05), a single image with a 4:5 mobile crop on the feeder line; AVIF preload with media queries, now only on "/" (was on every page). Service card «تجهیزات دام و طیور» uses photo 10 (chicks along the feeder line). Layout unchanged.
- /about: new structure: panorama banner (07) with intro and areas of activity; new section «از طراحی تا تحویل» in six steps (design drawing 22 shown as an illustration, structure 20/28, supply 13, installation 02/17/06, field team 14, handover 10 with the free consultation CTA); flagship product, international cooperation and phones kept. Copy in src/data/aboutCopy.ts, English in ui.json, prerender updated.

## 2026-11-13

- /about: new user-approved copy (intro, six areas of activity, flagship Pouya butterfly feeder with «مشاهده مشخصات» to /products/pouya-butterfly-feeder, international cooperation); page name «درباره» in H1, menu and footer; new title; prerender (resolveSeo) and /en/about updated. Contact block, hours and addresses unchanged. Copy lives in src/data/aboutCopy.ts.
- Jet heater (ts-115) product page and homepage heater card show the previous jet-heater-v2 photo again, at the user's request.

## 2026-11-10

- Restore ts-114 and ts-115 product photos under the logo rules: feeder uses detail_01_trough and insitu_01 (feeder-pouya-trough / feeder-pouya-hall-installation); heater does not use jet-heater-v2 (IMACHINE) and falls back to the logo-free heating-category image /images/hero-final-1.jpg. Public JSON-LD for these two omits sku.
- SEO 404 and redirect fixes: restore ts-114 and ts-115 as public products (`/products/pouya-butterfly-feeder`, `/products/jet-heater`); 301 disabled `/services/*` pages to `/services` (and `/en/services`); rename nine کارنو/کارنوتک product slugs with 301s from the old URLs; localize English canonical, hreflang and JSON-LD `@id` on the client as well as the server.


## 2026-10-09

- Add a bearer content API at `/api/cms/v1`. The server stores only the SHA-256 hash (`CMS_API_TOKEN_SHA256`, or `DATA_DIR/cms-api.sha256`). Allowlisted keys: `articles`, `products`, `categories`, `services`, `projects`, `companyInfo`, `heroCms`. Each write snapshots SQLite to `DATA_DIR/backups/cms-api-<key>-<timestamp>.sqlite` and appends `DATA_DIR/cms-api-audit.log`.
