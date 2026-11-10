# Changelog

## 2026-11-10

- SEO 404 and redirect fixes: restore ts-114 and ts-115 as public products (`/products/pouya-butterfly-feeder`, `/products/jet-heater`); 301 disabled `/services/*` pages to `/services` (and `/en/services`); rename nine کارنو/کارنوتک product slugs with 301s from the old URLs; localize English canonical, hreflang and JSON-LD `@id` on the client as well as the server.


## 2026-10-09

- Add a bearer content API at `/api/cms/v1`. The server stores only the SHA-256 hash (`CMS_API_TOKEN_SHA256`, or `DATA_DIR/cms-api.sha256`). Allowlisted keys: `articles`, `products`, `categories`, `services`, `projects`, `companyInfo`, `heroCms`. Each write snapshots SQLite to `DATA_DIR/backups/cms-api-<key>-<timestamp>.sqlite` and appends `DATA_DIR/cms-api-audit.log`.
