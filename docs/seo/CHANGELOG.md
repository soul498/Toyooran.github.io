# SEO Changelog

تغییرات عمومی SEO را با تاریخ، فایل، URL متاثر، ریسک و روش Verify ثبت کنید.

## قالب

### YYYY-MM-DD — عنوان

- مالک:
- فایل‌ها:
- URLها:
- تغییر:
- دلیل/Issue:
- invariantهای بررسی‌شده:
- Verify: lint / build / raw HTML / status / canonical / schema / sitemap
- نتیجه پس از انتشار:

## 2026-09-21 — افزودن سیستم عملیاتی سئو به ریپوی زنده

- مالک: SEO
- فایل‌ها: `docs/seo/README.md`, `docs/seo/SEO-CONTRACT.md`, `docs/seo/CONTENT-STRATEGY.md`, `docs/seo/CONTENT-BRIEF-TEMPLATE.md`, `docs/seo/CONTENT-BACKLOG.md`, `docs/seo/CHANGELOG.md`, `docs/README.md`, `AGENTS.md`, `docs/technical-document.md`
- URLها: ندارد
- تغییر: قرارداد، استراتژی محتوا، Brief و Backlog به `docs/seo` اضافه شد. هشدار clone ناقص در قرارداد با وضعیت ریپوی زنده هم‌تراز شد.
- invariantهای بررسی‌شده: origin `https://www.toyooran.com`؛ robots disallow برای `/admin` و `/api`؛ prerender در `server/seo.ts` حفظ شد.
- Verify: بازبینی Markdown؛ raw HTML روی `127.0.0.1:3000` برای `/`، خدمت نوسازی، دسته تهویه، دو مقاله مجله، 404 و sitemap
- نتیجه: اسناد در git؛ کد رندر در این commit عوض نشد.

## 2026-09-21 — ایجاد قرارداد و سیستم محتوایی

- مالک: SEO
- فایل‌ها: `AGENTS.md`, `GEMINI.md`, `.cursor/rules/*`, `docs/seo/*`
- URLها: ندارد
- تغییر: قواعد بین‌ایجنتی، قرارداد SEO، استراتژی محتوا و Brief ایجاد شد.
- Verify: بازبینی Markdown و سازگاری با ساختار مشاهده‌شده ریپو
- مانع (در clone اولیه): چند import کلیدی tracked نبود. روی ریپوی زنده `/opt/Toyooran` این مانع برای `mockData.ts` / `SEO.tsx` / `AdminPanel.tsx` برطرف است.

## 2026-09-21 — فونداسیون SEO روی سرور زنده

- مالک: توسعه
- فایل‌ها: `server/seo.ts`, `server.ts`, `.forgejo/workflows/deploy.yml`
- URLها: صفحات عمومی سایت
- تغییر: canonical و prerender و JSON-LD سروری؛ URL خدمت/دسته/پروژه؛ فرم مشاوره به API و فایل Lead؛ workflow فورجو
- Verify: `scripts/check-seo-contract.sh` و HTML محلی
