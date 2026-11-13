# Changelog

## 2026-11-13

- /about: new user-approved copy (intro, six areas of activity, flagship Pouya butterfly feeder with «مشاهده مشخصات» to /products/pouya-butterfly-feeder, international cooperation); page name «درباره» in H1, menu and footer; new title; prerender (resolveSeo) and /en/about updated. Contact block, hours and addresses unchanged. Copy lives in src/data/aboutCopy.ts.
- Jet heater (ts-115) product page and homepage heater card show the previous jet-heater-v2 photo again, at the user's request.

## 2026-11-10

- Restore ts-114 and ts-115 product photos under the logo rules: feeder uses detail_01_trough and insitu_01 (feeder-pouya-trough / feeder-pouya-hall-installation); heater does not use jet-heater-v2 (IMACHINE) and falls back to the logo-free heating-category image /images/hero-final-1.jpg. Public JSON-LD for these two omits sku.
- SEO 404 and redirect fixes: restore ts-114 and ts-115 as public products (`/products/pouya-butterfly-feeder`, `/products/jet-heater`); 301 disabled `/services/*` pages to `/services` (and `/en/services`); rename nine کارنو/کارنوتک product slugs with 301s from the old URLs; localize English canonical, hreflang and JSON-LD `@id` on the client as well as the server.


## 2026-10-09

- Add a bearer content API at `/api/cms/v1`. The server stores only the SHA-256 hash (`CMS_API_TOKEN_SHA256`, or `DATA_DIR/cms-api.sha256`). Allowlisted keys: `articles`, `products`, `categories`, `services`, `projects`, `companyInfo`, `heroCms`. Each write snapshots SQLite to `DATA_DIR/backups/cms-api-<key>-<timestamp>.sqlite` and appends `DATA_DIR/cms-api-audit.log`.
