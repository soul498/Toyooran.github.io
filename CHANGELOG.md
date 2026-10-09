# Changelog

## 2026-10-09

- Add a bearer content API at `/api/cms/v1`. The server stores only the SHA-256 hash (`CMS_API_TOKEN_SHA256`, or `DATA_DIR/cms-api.sha256`). Allowlisted keys: `articles`, `products`, `categories`, `services`, `projects`, `companyInfo`, `heroCms`. Each write snapshots SQLite to `DATA_DIR/backups/cms-api-<key>-<timestamp>.sqlite` and appends `DATA_DIR/cms-api-audit.log`.
