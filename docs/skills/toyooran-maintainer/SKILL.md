---
name: toyooran-maintainer
description: راهنمای عملیاتی و اسکیل جامع توسعه، ویرایش محتوا، جایگزینی تصاویر، حفظ قرارداد سئو و دیپلوی سایت طیوران صنعت پویا (toyooran.com) روی سرور اختصاصی. در هر کار مربوط به تغییر UI، محصولات، مقالات، لوکیشن‌ها، سئو یا دیپلوی این پروژه استفاده شود.
---

# اسکیل نگهداری و توسعه سامانه طیوران صنعت پویا (`toyooran-maintainer`)

این اسکیل تمام قوانین، ساختار فایل‌ها و گردش‌کارهای تست‌شده روی سرور و کدبیس **طیوران صنعت پویا (TSPK)** را در اختیار برنامه‌نویس یا ایجنت هوش مصنوعی قرار می‌دهد.

## ۱. قوانین مطلق محیط کار و Git

1. **مسیر پروژه:** همیشه در `/opt/Toyooran` کار کنید.
2. **تک‌شاخه‌ای (`main`):** تمام تغییرات، کامیت‌ها و پوش‌ها **فقط روی شاخهٔ `main`** انجام می‌شود. هرگز برنچ جدید نسازید و PR باز نکنید.
3. **ریموت مرجع (`origin`):** فقط به `origin` (`http://127.0.0.1:3002/mhzare/toyooran.git`) پوش کنید. ریموت `github` آرشیو است و نباید استفاده شود.
4. **همگام‌سازی قبل از کار و قبل از پوش:**
   ```bash
   cd /opt/Toyooran
   git fetch origin main && git rebase origin/main
   ```
5. **دیپلوی خودکار و بررسی آن:**
   پوش به `origin main` یک تسک در Forgejo Actions اجرا می‌کند که اسکریپت `/usr/local/sbin/toyooran-deploy.sh` را صدا می‌زند (بیلد از `/var/lib/toyooran/src` روی ایمیج محلی `toyooran:prev`).
   برای اطمینان از اتمام دیپلوی:
   ```bash
   curl -sS "http://127.0.0.1:3002/api/v1/repos/mhzare/toyooran/actions/tasks?limit=1"
   curl -fsS http://127.0.0.1:3000/api/health
   ```

---

## ۲. دستورالعمل کارهای پرتکرار (Playbooks)

### الف) تعویض یا به‌روزرسانی تصویر محصول
1. شماره یا کد محصول را در `src/data/productsData.ts` پیدا کنید (مثلاً محصول ۲ معادل `ts-002` / `TS-002` و فایل `/images/products/TS-002.webp` است).
2. فایل تصویر جدید (ترجیحاً با فرمت `.webp`) را در `public/images/products/TS-XXX.webp` جایگزین کنید.
3. **الزامی (Cache Busting):** فایل `src/lib/mediaUrl.ts` را باز کنید و مقدار `MEDIA_VERSION` را به یک رشتهٔ جدید تغییر دهید (مثلاً `export const MEDIA_VERSION = "p4img-YYYYMMDD";`). بدون این کار، مرورگرها و CDN تصویر قبلی را از کش نشان می‌دهند.

### ب) ویرایش بخش‌های صفحهٔ اصلی (لندینگ)
- **هیرو و کارت‌های ۴گانه خدمات:** `src/components/Hero.tsx` و دادهٔ کارت‌ها در `src/data/landingServiceCards.ts`.
- **ویترین میانی (`src/components/CompactShowcase.tsx`):**
  - شامل نوار «دسته‌های تجهیزات دام و طیور» (`CategoryBand`)، اسلایدر «محصولات پرفروش / پرکاربرد» (`showcaseSlides`) و ستون «مجله تخصصی» است.
  - توجه: سکشن جداگانهٔ لینک‌های سئوی پایین صفحه (`PopularLinksSection`) قبلاً در این ویترین ادغام و حذف شده است؛ دوباره سکشن تکراری پایین صفحه نسازید.
  - لیست محصولات پرکاربرد که بعد از محصولات `isFeatured` وارد اسلایدر می‌شوند در `HOME_PRIORITY_PRODUCT_IDS` داخل `src/seo/internalLinks.ts` تعریف شده است.
- **بخش درباره ما، فرم مشاوره و لوکیشن‌ها در لندینگ:** `src/components/AboutContactUnifiedSection.tsx`.

### ج) ویرایش لوکیشن‌ها و نقشه بلد
- منبع دادهٔ لوکیشن‌ها: آرایهٔ `locations` در `COMPANY_INFO` داخل `src/data/mockData.ts` (و در صورت وجود در جدول `admin_state` کلید `companyInfo`).
- فقط ۲ لوکیشن مجاز است:
  1. `دفتر مرکزی مشهد` (میدان مادر، مجتمع تجاری ادیب، طبقه ۳، واحد ۴۰۶) — توکن بلد: `6CHymGXdZRyn6u`
  2. `دفتر تحقیق و توسعه` (گرگان، بلوار بهشتی) — توکن بلد: `2mnxzJeK25Qq8Q`
- هلپر لینک و iframe بلد در `src/lib/baladMaps.ts` قرار دارد. دکمهٔ «مشاهده نقشه» باید به `https://balad.ir/p/<token>` لینک شود.

### د) ویرایش صفحهٔ محصولات (`/products`)
- بنر بالای صفحهٔ کاتالوگ محصولات در `src/components/ShopHero.tsx` است (شامل دکمهٔ «دانلود کاتالوگ» برای `/TSPK_catalog.pdf` و دکمهٔ «استعلام قیمت»).
- گرید محصولات و فیلترها در `src/components/ProductCatalogSection.tsx` است.
- صفحهٔ جزئیات هر محصول در `src/components/ProductPage.tsx` است.

### هـ) ویرایش مقالات، محصولات یا خدمات از طریق CMS API
اگر قرار است محتوا بدون تغییر کد و مستقیم در دیتابیس SQLite (`/opt/toyooran-data/toyooran.sqlite`) به‌روز شود:
- اندپوینت‌ها در `server/cmsApi.ts` زیر مسیر `/api/cms/v1` قرار دارند.
- نیاز به هدر `Authorization: Bearer <TOKEN>` دارد (هش توکن در `/opt/toyooran-data/cms-api.sha256` است).
- هر درخواست `PUT` یا `DELETE` به صورت خودکار قبل از اعمال تغییر، یک بکاپ در `/opt/toyooran-data/backups/` می‌سازد.

---

## ۳. خط قرمزهای سئو و پرفورمنس (هرگز نقض نشود)

1. **پیش‌رندر سرور (`#seo-prerender`):**
   فایل `src/seo/resolveSeo.ts` و `server/seo.ts` وظیفه دارند تمام متن‌ها، لینک‌های داخلی، عنوان (`title`)، تگ `canonical` و `JSON-LD` را در پاسخ اولیهٔ سرور قرار دهند. هیچ تغییری در ظاهر React نباید باعث حذف یا از کار افتادن `injectSeoTags` در `server.ts` شود.
2. **تطابق H1:**
   متن تگ `<h1>` در کامپوننت‌های صفحه (مثل `ShopHero.tsx`، `ProductPage.tsx`، `ServicePage.tsx`، `MagazineArticle.tsx`) باید با `h1` خروجی `resolveSeo.ts` یکسان باشد.
3. **پشتیبانی از تلویزیون و مرورگرهای قدیمی (Chrome 98):**
   از افکت‌های گرافیکی سنگین که روی تلویزیون‌های هوشمند (Android TV با Chrome 98) فریم‌ریت را می‌اندازند یا پشتیبانی نمی‌شوند پرهیز کنید و در انیمیشن‌های پیوسته وضعیت `isLiteDevice()` (`src/lib/device.ts`) را رعایت کنید.
4. **تست نهایی قبل از اتمام کار:**
   ```bash
   cd /opt/Toyooran
   npm run lint
   npm run test:legacy-spam
   npm run check:seo
   ```
   هر سه دستور باید بدون خطا (`Exit code: 0`) اجرا شوند.
