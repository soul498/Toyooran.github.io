# قرارداد فنی و معماری SEO

## وضعیت مشاهده‌شده (نسخه اولیه سند)

- Stack: React 19 + React Router 7 + Vite 6 + Express 5.
- `server.ts` metadata را در پوسته HTML تزریق می‌کند، اما محتوای اصلی صفحه CSR است.
- metadata دیگری در `SEORoute` کلاینتی تنظیم می‌شود؛ این دو منبع نباید متناقض باشند.
- داده Product/Service/Article از defaults و state ادمین می‌آید.
- مسیر محصول `/products/:productId` وجود دارد؛ محصولات باید لینک crawlable داشته باشند.
- canonical زنده بین www و non-www ناسازگار مشاهده شد.
- `index.html` در clone فعلی `lang="en"` دارد و باید `fa-IR`/`rtl` شود.

## به‌روزرسانی ریپو زنده — 2026-09-21

روی `/opt/Toyooran` شاخه `main` این فایل‌ها tracked هستند و حدس‌زدن از روی import لازم نیست:

- `src/data/mockData.ts`
- بخش عمده `src/components/` از جمله `src/components/SEO.tsx`
- `src/admin/AdminPanel.tsx`

`server/catalog.ts` هنوز وجود ندارد. `index.html` الان `lang="fa-IR" dir="rtl"` است.
`server/seo.ts` برای مسیرهای عمومی title/description/canonical/JSON-LD/`#seo-prerender` تزریق می‌کند.
HTTP و apex (`toyooran.com`) در لایه اپ/CDN به `https://www.toyooran.com` می‌روند.

مشاهده‌های باقی‌مانده نسبت به invariantها در `CHANGELOG.md` و گزارش ایجنت ثبت می‌شود؛ این قرارداد را برای دور زدن prerender بازنویسی نکنید.

## هشدار صحت ریپو

در clone مورخ 2026-09-21 چند import کلیدی tracked نبود. آن هشدار برای ریپوی زنده فعلی صدق نمی‌کند.
ایجنت حق ندارد فایل موجود را از روی نام import حدس بزند یا بازنویسی کند؛ منبع حقیقت همین درخت git است.

## invariantهای دامنه و URL

- origin مرجع: `https://www.toyooran.com`
- HTTP و non-www باید با یک 301 به origin مرجع بروند.
- canonical هر صفحه absolute و self-referencing است.
- URL منتشرشده فقط با redirect map تغییر می‌شود.
- indexable route باید status واقعی 200 داشته باشد؛ NotFound واقعی 404.
- query/filter داخلی canonical مستقل نمی‌گیرد مگر Intent و محتوای مستقل داشته باشد.

## invariantهای رندر

در HTML اولیه هر صفحه عمومی باید موجود باشد:

- title، meta description، canonical، robots
- H1 و محتوای اصلی قابل‌فهم
- JSON-LD مرتبط
- لینک‌های داخلی اصلی

تغییر React در `useEffect` جایگزین HTML سروری نیست. CSR فقط برای تعامل، فیلتر،
ادمین و CRM مجاز است.

## معماری صفحات

- Home: Organization + WebSite، معرفی خدمت محوری و لینک به صفحات پول‌ساز
- Service: URL مستقل برای تجهیز/نوسازی، تهویه و سایر خدمات دارای Intent
- Category: URL مستقل برای ventilation/heating/cooling/feeding/drinking/inlet
- Product: URL ثابت بر پایه slug/code، مشخصات و Product/Offer
- Project: Case Study مستقل، نه فقط Modal
- Article: Article + author/reviewer/date/sources + لینک به Service/Product
- Contact/locations: فقط مکان واقعی، NAP یکسان

## Schema مجاز

- Home: `Organization`, `WebSite`
- Location: `LocalBusiness` فقط با آدرس/تلفن/مختصات واقعی
- Service: `Service`, `BreadcrumbList`
- Product: `Product`, `Offer` فقط با قیمت/موجودی واقعی، `BreadcrumbList`
- Article: `Article` یا `BlogPosting`, `Person`, `BreadcrumbList`
- Project: `Article`/`CreativeWork` با داده واقعی

FAQPage مزیت Rich Result عمومی ندارد؛ فقط FAQ مرئی برای کاربر نگه داشته شود.
Review/AggregateRating بدون Review واقعی ممنوع است.

## sitemap و robots

- sitemap فقط URLهای canonical با status 200 را شامل شود.
- Products، Services، Projects و Articles مستقل وارد sitemap شوند.
- `lastmod` تاریخ تغییر واقعی است؛ تاریخ روز در هر request ممنوع.
- private routes، API، hash و Modal وارد sitemap نشوند.
- Googlebot، OAI-SearchBot، Claude-SearchBot و PerplexityBot مسدود نشوند مگر
  تصمیم حقوقی مستند گرفته شود.

## Definition of Done

1. raw HTML بدون اجرای JS بررسی شده است.
2. status، canonical، robots و H1 درست‌اند.
3. JSON-LD parse و با محتوای مرئی منطبق است.
4. URL در sitemap و internal links قرار دارد.
5. CTA conversion قابل اندازه‌گیری است.
6. `npm run lint` و `npm run build` موفق‌اند.
7. تغییر در `CHANGELOG.md` ثبت شده است.
