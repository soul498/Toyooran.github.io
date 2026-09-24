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

## 2026-09-24 — برگشت متن هیرو لندینگ به قبل از بازنویسی SEO

- مالک: توسعه
- فایل‌ها: `src/data/mockData.ts`, `src/seo/resolveSeo.ts`, `index.html`
- URLها: `/`
- تغییر: فقط تیتر هیرو (H1) و title/og:title صفحه اصلی از «تجهیز و نوسازی سالن مرغداری» به «طیوران صنعت پویا» برگشت؛ همان متن قبل از `ce01a36`. ساب‌تایتل، بج، CTA، چیدمان و متن مجله دست نخورده‌اند.
- دلیل/Issue: درخواست برگشت متن‌های عوض‌شدهٔ لندینگ
- Verify: lint
- نتیجه پس از انتشار: در همین commit

## 2026-09-24 — برگشت متن مجله به قبل از صف Ready 1–5

- مالک: توسعه
- فایل‌ها: `src/data/mockData.ts`
- URLها: `/magazine/how-to-calculate-ventilation-capacity`، `/magazine/comparison-of-heating-systems`، `/magazine/introduction-to-pouya-butterfly-feeder`
- تغییر: فقط عنوان، خلاصه و بدنهٔ این سه مقاله به متن قبل از `eedfdd3` برگشت. لینک محصول (`ts-*`)، ساختار صفحه، Brief و کامپوننت‌ها دست نخورده‌اند.
- دلیل/Issue: درخواست برگشت متن‌های عوض‌شده در آن commit
- Verify: lint
- نتیجه پس از انتشار: در همین commit

## 2026-09-22 — Accessibility صفحه اصلی (نام کنترل، کنتراست، heading)

- مالک: توسعه
- فایل‌ها: Navbar, Hero, CompactShowcase, Footer, AboutContactUnifiedSection, ContactPage, LazyImage, LazyHeroImage, AparatIcon
- URLها: `/` (و هم‌خوانی `/contact`)
- تغییر: aria-label شبکه اجتماعی و دکمه‌های آیکونی؛ اسلایدر Link/دکمه با نام و tap ۲۴px؛ alt لوگو؛ TSPK و تیتر کهربایی بدون text-transparent؛ پلاک تیره فقط پشت متن Hero؛ slate-300 روی متن تیره؛ h5 شعب به متن معمولی؛ prerender همچنان بعد از hydrate حذف می‌شود
- Verify: lint

## 2026-09-22 — C1 آروان: حذف چالش کوکی ۳۰۷ برای خزنده

- مالک: زیرساخت CDN (پنل آروان، بدون تغییر کد اپ)
- فایل‌ها: هیچ فایل اپ؛ تنظیم `ddos/settings` و page-ruleهای CDN
- URLها: `/` ، `/robots.txt` ، `/sitemap.xml`
- تغییر: پلن Basic اجازهٔ exception برای DDoS/چالش ندارد؛ `protection_mode=cookie` خاموش شد تا Googlebot بدون `__arcscoc` همان اول **200** بگیرد. فایروال روشن ماند (`default_action=allow`) + قانون `KnownBots` با `is_known_bot`. کش لبه برای `/admin*` `/api*` `/login*` `/dashboard*` `/crm*` روی `off`. WAF همچنان off (وضع قبلی). HTTPS 301 به www دست نخورده.
- دلیل/Issue: ACTION-PLAN C1
- invariantهای بررسی‌شده: Googlebot/Bingbot/GPTBot بدون کوکی 200؛ apex 301 به www؛ `seo-prerender` و canonical در HTML اولیه؛ بدون Set-Cookie چالش
- Verify: curl بدون cookie jar با UA گوگل‌بات
- نتیجه پس از انتشار: زنده روی لبهٔ آروان (کد اپ commit لازم نداشت)

## 2026-09-22 — PageSpeed موبایل (viewport، CSS غیرمسدود، LCP/فونت)

- مالک: توسعه
- فایل‌ها: `index.html`, `src/index.css`, `server/seo.ts`, `server/gzip.ts`, `src/main.tsx`, `src/components/LazyHeroImage.tsx`
- URLها: `/`
- تغییر: برگشت viewport، preload فونت woff2، تعویق CSS رندر-بلاک، تصویر LCP 480w، aria-hidden روی prerender، کش تصویر ۱ سال، target es2022
- Verify: lint + check:seo



- مالک: توسعه
- فایل‌ها: `src/data/mockData.ts`, `src/components/ServicePage.tsx`, `src/seo/resolveSeo.ts`, `src/context/DataContext.tsx`, `server/catalog.ts`
- URLها: `/magazine/*`؛ ۳۰۱ از `/magazine/poultry-hall-audit-checklist`
- تغییر: مقاله چک‌لیست ممیزی از مجله حذف شد؛ چک‌لیست روی صفحه خدمت باقی است؛ کاتالوگ SEO دیگر مقالهٔ خارج از seed را منتشر نمی‌کند
- Verify: lint / tsc / فهرست ۷ مقاله در seed

## 2026-09-22 — بهینه‌سازی Core Web Vitals / PageSpeed

- مالک: توسعه
- فایل‌ها: `server.ts`, `server/gzip.ts`, `server/seo.ts`, `vite.config.ts`, `src/App.tsx`, `src/context/DataContext.tsx`, `src/components/LazyHeroImage.tsx`, `deploy/nginx-toyooran.conf`
- URLها: `/` و دارایی‌های `/assets/`
- تغییر: gzip پروکسی، کش immutable برای JS/CSS، code-split مسیرها و کاتالوگ، LCP webp 800w، حذف preload JPG، CLS prerender، contrast و دکمه به‌جای div
- Verify: lint + check:seo پس از دیپلوی



- مالک: توسعه + SEO
- فایل‌ها: `docs/seo/briefs/*`, `src/components/ServicePage.tsx`, `src/components/ProductPage.tsx`, `src/components/magazine/MagazineArticle.tsx`, `src/data/mockData.ts`, `src/data/productsData.ts`, `src/seo/resolveSeo.ts`, `src/seo/articleBlocks.ts`, `server/catalog.ts`
- URLها: `/services/poultry-hall-fitout`, `/magazine/how-to-calculate-ventilation-capacity`, `/magazine/comparison-of-heating-systems`, `/magazine/introduction-to-pouya-butterfly-feeder`, `/magazine/poultry-hall-audit-checklist`, محصول `ts-013`
- تغییر: Brief اجباری برای ۵ آیتم Ready؛ Lead و کارت پروژه در خدمت fitout؛ جدول مقایسه گرمایش؛ قید شواهد تهویه/دانخوری؛ چک‌لیست ممیزی؛ کاربردها و CTA محاسبه خطوط روی دانخوری؛ seed کاتالوگ SEO روی idهای seed غالب است
- دلیل/Issue: ACTION-PLAN M2–M4 و CONTENT-BACKLOG پس از رد کردن C1 توسط مالک
- invariantهای بررسی‌شده: بدون قیمت Product جعلی؛ بدون Person اختراعی؛ بدون کیس‌استادی/هزینه Blocked
- Verify: `npm run lint` و `npm run check:seo` پس از دیپلوی
- نتیجه پس از انتشار: در همین commit

## 2026-09-21 — بستن آیتم‌های باز ACTION-PLAN

- مالک: توسعه
- فایل‌ها: `src/seo/resolveSeo.ts`, `server.ts`, `server/seo.ts`, `vite.config.ts`, `deploy/nginx-toyooran.conf`, صفحات خدمت/کاتالوگ/هیرو، تصاویر webp
- URLها: عمومی، `/llms.txt`، `/products/{slug}`، fitout، feeding/inlet
- تغییر: prerender غنی‌تر، حذف prerender بعد از hydrate، H1 هیرو بدون opacity 0، LocalBusiness از قبل، Product image+Offer بدون قیمت جعلی، lastmod/llms.txt، FAQ/HowTo مرئی، CSP font-src، کش HTML، اسلاگ فارسی محصول با 301 از کد، code-split، preload WebP، nginx بدون Connection:upgrade دائمی
- Verify: lint + check:seo پس از دیپلوی



- مالک: توسعه + SEO
- فایل‌ها: `src/seo/resolveSeo.ts`, `server/catalog.ts`, `server/seo.ts`, `server.ts`, `src/components/SEO.tsx`, `src/App.tsx`, صفحات خدمت/محصول/پروژه/مجله، `src/data/mockData.ts`, `scripts/check-seo-contract.sh`
- URLها: همهٔ صفحات عمومی، `/services/srv-turnkey-shed`، `/magazine/*`، `/contact`، 404
- تغییر: منبع واحد metadata، prerender کامل‌تر، sitemap canonical با lastmod واقعی در صورت وجود، 404 بدون canonical و با noindex، 301 alias خدمت، LocalBusiness، Article با فیلد نویسنده/منبع، کاتالوگ SEO از SQLite، event تبدیل فرم
- invariantهای بررسی‌شده: origin www؛ robots admin/api؛ prerender؛ عدم Offer جعلی؛ عدم lastmod تاریخ امروز
- Verify: `npm run lint`، `npm run check:seo` پس از دیپلوی
- نتیجه: در همین انتشار



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
