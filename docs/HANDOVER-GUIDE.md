# راهنمای کامل تحویل پروژه و سرور طیوران صنعت پویا (TSPK)

این سند به شکلی نوشته شده است که اگر هیچ‌کدام از توسعه‌دهندگان قبلی یا ایجنت‌ها حضور نداشته باشند، یک برنامه‌نویس جدید بتواند از صفر تا صد سرور، کد، دیتابیس، سئو، دیپلوی و نگهداری سایت `https://www.toyooran.com` را بدون آزمون و خطا در دست بگیرد.

---

## ۱. تصویر کلی و قوانین طلایی (قبل از هر کاری بخوانید)

1. **محل کار روی سرور:** مسیر کاری اصلی `/opt/Toyooran` است.
2. **سورس حقیقت Git:** سرویس **Forgejo محلی** روی همین سرور است (`http://127.0.0.1:3002/mhzare/toyooran.git` یا از بیرون `https://git.toyooran.com/mhzare/toyooran.git`).
   - ریموت `github` فقط یک آرشیو قدیمی است؛ **هرگز** برای دیپلوی یا PR از GitHub استفاده نکنید.
3. **شاخه (Branch):** تمام کامیت‌ها و پوش‌ها **فقط و فقط روی شاخهٔ `main`** انجام می‌شود. شاخهٔ فرعی نسازید.
4. **دیپلوی خودکار:** با اجرای `git push origin main`، سرویس Forgejo Actions روی همین سرور اسکریپت `/usr/local/sbin/toyooran-deploy.sh` را اجرا می‌کند.
5. **عدم وابستگی به اینترنت بین‌الملل در بیلد:** به دلیل تحریم/فیلترینگ احتمالی Docker Hub و npm، بیلد داکر از ایمیج محلی قبلی (`FROM toyooran:prev`) انجام می‌شود و پکیج‌ها آفلاین در ایمیج موجودند.
6. **داده‌های پایدار (Persistent Data):** دیتابیس SQLite، لیدها، بکاپ‌ها و هش توکن‌ها در `/opt/toyooran-data` روی هاست قرار دارند و داخل کانتینر در `/opt/toyooran-data` مانت می‌شوند. هرگز دیتابیس را داخل ایمیج داکر ذخیره یا کامیت نکنید.
7. **حفظ قرارداد سئو (SEO Contract):** سایت یک اپلیکیشن React 19 (SPA) است، اما سرور Express (`server.ts` + `server/seo.ts`) در لحظهٔ درخواست، تگ‌های متا، Canonical، اسکیما (JSON-LD) و محتوای کامل HTML (`#seo-prerender`) را داخل `index.html` تزریق می‌کند تا گوگل و بات‌ها بدون نیاز به اجرای جاوااسکریپت کل محتوا را ببینند.

---

## ۲. معماری سیستم و سرویس‌های روی سرور

```
اینترنت / کاربر / Googlebot
        │
        ▼
  Nginx (پورت 80 / 443)
   ├── www.toyooran.com  ──►  127.0.0.1:3000 (کانتینر Docker: toyooran-app)
   └── git.toyooran.com  ──►  127.0.0.1:3002 (کانتینر Docker: forgejo)
```

### سرویس‌های Docker فعال روی سرور
با دستور `docker ps` می‌توانید وضعیت آن‌ها را ببینید:
- `toyooran-app`: اپلیکیشن اصلی Node.js/Express + React (پورت `127.0.0.1:3000`).
- `forgejo`: گیت سرور محلی و Actions Runner (پورت `3002` و پشتیبان روی `8443`).
- `mailserver`: سرویس ایمیل سازمانی.

### فایل‌ها و مسیرهای حیاتی روی سیستم‌عامل (خارج از ریپو)
| مسیر | کاربرد |
|---|---|
| `/opt/Toyooran` | کلون کاری پروژه برای ویرایش کد و کامیت |
| `/var/lib/toyooran/src` | کلون تمیز که اسکریپت دیپلوی (`toyooran-deploy.sh`) از روی `origin/main` آپدیت و بیلد می‌کند |
| `/opt/toyooran-data/toyooran.sqlite` | دیتابیس اصلی SQLite (حالت WAL) |
| `/opt/toyooran-data/qualified-leads.jsonl` | فایل ذخیرهٔ فرم‌های مشاوره و استعلام قیمت |
| `/opt/toyooran-data/cms-api.sha256` | هش SHA-256 توکن دسترسی به API محتوا (`/api/cms/v1`) |
| `/opt/toyooran-data/cms-api-audit.log` | لاگ تغییرات اعمال‌شده از طریق CMS API |
| `/opt/toyooran-data/backups/` | بکاپ‌های خودکار دیتابیس قبل از هر دیپلوی و قبل از هر نوشتن در CMS API |
| `/etc/toyooran.env` | متغیرهای محیطی Production که به کانتینر تزریق می‌شود |
| `/etc/toyooran/deploy.conf` | تنظیمات مسیرها و نام کانتینر برای اسکریپت‌های دیپلوی |
| `/usr/local/sbin/toyooran-deploy.sh` | اسکریپت اصلی بیلد، بکاپ، تست سلامت و جایگزینی کانتینر |
| `/usr/local/sbin/toyooran-rollback.sh` | اسکریپت بازگشت فوری به ایمیج قبلی (`toyooran:prev`) |
| `/usr/local/sbin/toyooran-backup.sh` | اسکریپت بکاپ‌گیری دستی/زمان‌بندی‌شده از SQLite |

---

## ۳. گردش کار توسعه، تست و دیپلوی (گام‌به‌گام)

### گام ۱: همگام‌سازی قبل از شروع کار
ممکن است کامیت دیگری (مثلاً برای مقالات یا تصاویر) روی `origin/main` پوش شده باشد. همیشه قبل از شروع کار:
```bash
cd /opt/Toyooran
git status -sb
git fetch origin main
git rebase origin/main
```

### گام ۲: اعمال تغییرات و تست قبل از کامیت
بعد از ویرایش فایل‌ها، حتماً تایپ‌چک و قرارداد سئو را اجرا کنید:
```bash
cd /opt/Toyooran
npm run lint              # اجرای tsc --noEmit
npm run test:legacy-spam  # تست وضعیت 410 برای لینک‌های اسپم قدیمی
npm run check:seo         # بررسی کامل قرارداد سئو روی کد و سرور زنده
```

### گام ۳: کامیت و پوش (دیپلوی خودکار)
```bash
cd /opt/Toyooran
git add <files>
git commit -m "توضیح روشن و دقیق تغییر"
git push origin main
```
*نکته:* اگر هنگام پوش با خطای `fetch first / non-fast-forward` مواجه شدید:
```bash
git fetch origin main && git rebase origin/main && git push origin main
```

### گام ۴: بررسی وضعیت دیپلوی
بلافاصله پس از پوش، Forgejo Actions شروع به کار می‌کند (حدود ۳۰ تا ۶۰ ثانیه زمان می‌برد):
```bash
# مشاهده وضعیت آخرین اجرای Actions
curl -sS "http://127.0.0.1:3002/api/v1/repos/mhzare/toyooran/actions/tasks?limit=1" | python3 -m json.tool

# بررسی سلامت سرور پس از اتمام
curl -fsS http://127.0.0.1:3000/api/health
```
اگر به هر دلیلی Runner خواب بود، می‌توانید دستی دیپلوی را اجرا کنید:
```bash
/usr/local/sbin/toyooran-deploy.sh
```
و اگر سایت بالا نیامد، اسکریپت خودش Rollback می‌کند؛ برای Rollback دستی:
```bash
/usr/local/sbin/toyooran-rollback.sh
```

---

## ۴. معماری کد و راهنمای ویرایش بخش‌های مختلف

### ۴.۱. داده‌ها کجا هستند؟ (Seed در کد در برابر SQLite)
سایت دو لایه داده دارد که در `server/catalog.ts` و `src/context/DataContext.tsx` با هم ترکیب می‌شوند:
1. **داده‌های Seed در کد:**
   - `src/data/productsData.ts`: لیست کامل ۱۱۴ محصول (`PRODUCTS`).
   - `src/data/mockData.ts`: دسته‌بندی‌ها (`CATEGORIES_DATA`)، اطلاعات شرکت و لوکیشن‌ها (`COMPANY_INFO`)، خدمات (`SERVICES`)، پروژه‌ها (`PROJECTS`) و مقالات اولیه (`ARTICLES`).
   - `src/data/landingServiceCards.ts`: کارت‌های خدمات در هیروی صفحهٔ اصلی.
   - `src/data/pageHeroes.ts`: بنر و دکمه‌های بالای صفحات داخلی.
2. **داده‌های زنده در SQLite (`admin_state`):**
   - هر زمان از پنل ادمین (`/admin`) یا از طریق API محتوا (`/api/cms/v1`) تغییری ذخیره شود، در جدول `admin_state` در `/opt/toyooran-data/toyooran.sqlite` قرار می‌گیرد.
   - در `server/catalog.ts`:
     - برای `articles`: اگر در دیتابیس باشد، دیتابیس منبع اصلی است (و مقالات `draft` یا زمان‌بندی‌شده در آینده در سایت عمومی فیلتر می‌شوند).
     - برای `products` و `projects`: آیتم‌های Seed حفظ می‌شوند و آیتم‌های جدید دیتابیس به انتهای آن اضافه می‌شوند (`mergeSeedById`).
     - برای `services`: تغییرات دیتابیس روی همان IDهای Seed می‌نشیند (`overlaySeedOnly`).
     - برای `companyInfo`: مقادیر دیتابیس روی `COMPANY_INFO` مرج می‌شوند.

> **نکته بسیار مهم هنگام ویرایش محصولات، لوکیشن‌ها یا خدمات:**
> اگر چیزی را در `src/data/productsData.ts` یا `src/data/mockData.ts` عوض کردید، بررسی کنید که آیا رکورد قدیمی در جدول `admin_state` دیتابیس آن را بازنویسی (override) می‌کند یا نه. در فرانت‌اند هم کلید کش `localStorage` در `DataContext.tsx` (مثل `toyooran_company_v5`) یا در صورت نیاز جدول `admin_state` باید هماهنگ باشد.

### ۴.۲. تعویض یا افزودن تصاویر محصولات و کش‌شکنی (Cache Busting)
تصاویر محصولات در `public/images/products/TS-XXX.webp` قرار دارند.
چون در `server.ts` و CDN هدر کش طولانی‌مدت روی تصاویر تنظیم شده است، هر بار که فایل تصویری را در `public/images/` با همان نام قبلی جایگزین می‌کنید:
1. فایل `.webp` جدید را در `public/images/products/` کپی کنید.
2. **حتماً** مقدار `MEDIA_VERSION` را در فایل `src/lib/mediaUrl.ts` به تاریخ/نسخهٔ جدید تغییر دهید (مثلاً `"p4img-20261021"`).
3. کامپوننت `LazyImage` به صورت خودکار `?v=<MEDIA_VERSION>` را به آدرس تصاویر اضافه می‌کند و مرورگرهای کاربران بلافاصله تصویر جدید را می‌گیرند.

### ۴.۳. صفحهٔ اصلی (Landing Page) و ویترین (`CompactShowcase.tsx`)
در صفحهٔ اصلی (`/`):
- کامپوننت `Hero.tsx` بخش اول صفحه و کارت‌های خدمات را رندر می‌کند.
- داخل آن، `CompactShowcase.tsx` قرار دارد که شامل:
  1. **نوار دسته‌بندی‌ها (`CategoryBand`):** نمایش کارت‌های «دسته‌های تجهیزات دام و طیور» با آیکون و تعداد محصول.
  2. **اسلایدر محصولات پرفروش و پرکاربرد (`showcaseSlides`):** ابتدا محصولات دارای `isFeatured: true` (۴ محصول پرفروش) و سپس محصولات پرکاربرد تعریف‌شده در `HOME_PRIORITY_PRODUCT_IDS` (`src/seo/internalLinks.ts`) را بدون تکرار در یک اسلایدر ۱۶تایی نمایش می‌دهد.
  3. **ستون مجله تخصصی:** ۳ مقالهٔ آخر منتشرشده را نشان می‌دهد.
- *نکته تاریخی:* قبلاً کامپوننت جداگانه‌ای به نام `PopularLinksSection.tsx` زیر این بخش وجود داشت که برای لینک‌سازی داخلی سئو ساخته شده بود؛ طبق نظر کارفرما، آن سکشن حذف و محتوایش (دسته‌ها + محصولات پرکاربرد) داخل همین `CompactShowcase.tsx` ادغام شد تا ظاهر صفحه تمیز و یکپارچه بماند، در حالی که پیش‌رندر سروری (`#seo-prerender`) در `src/seo/resolveSeo.ts` همچنان تمام لینک‌ها را برای خزنده‌ها نگه داشته است.

### ۴.۴. بخش محصولات (`/products`)
- بنر بالای صفحهٔ محصولات در `src/components/ShopHero.tsx` است (دکمهٔ «دانلود کاتالوگ» که فایل `/TSPK_catalog.pdf` را دانلود می‌کند و دکمهٔ «استعلام قیمت»).
- لیست، فیلتر و جستجوی محصولات در `src/components/ProductCatalogSection.tsx` و نوار دسته‌ها در `src/components/CategoryMarquee.tsx` قرار دارد.
- صفحهٔ تک‌محصول در `src/components/ProductPage.tsx` است. آدرس کانونیکال هر محصول از تابع `publicProductPath(product)` در `src/seo/resolveSeo.ts` ساخته می‌شود و درخواست به کد محصول (مثل `/products/TS-001`) با ریدایرکت `301` به اسلاگ فارسی کامل می‌رود.

### ۴.۵. لوکیشن‌ها و نقشه‌های بلد (`AboutContactUnifiedSection.tsx` و `ContactPage.tsx`)
- در حال حاضر شرکت **فقط ۲ لوکیشن فعال** در سایت دارد (`src/data/mockData.ts` در `COMPANY_INFO.locations`):
  1. **دفتر مرکزی مشهد:** میدان مادر، مجتمع تجاری ادیب، طبقه ۳، واحد ۴۰۶ (`baladEmbedUrl: 'https://balad.ir/embed?p=6CHymGXdZRyn6u'`)
  2. **دفتر تحقیق و توسعه:** گرگان، بلوار بهشتی (`baladEmbedUrl: 'https://balad.ir/embed?p=2mnxzJeK25Qq8Q'`)
- لوکیشن‌های قدیمی (کارخانه میثاق، کارخانه نوآوری و...) به درخواست کارفرما حذف شده‌اند و نباید برگردند.
- لینک‌های «مشاهده نقشه» از طریق `src/lib/baladMaps.ts` مستقیم به صفحهٔ مکان در **بلد** (`https://balad.ir/p/<token>`) باز می‌شوند (نه نشان).
- در `server.ts`، دامنهٔ `https://balad.ir` در هدر `Content-Security-Policy` بخش `frame-src` مجاز شده است تا iframe نقشه بلد مسدود نشود.

### ۴.۶. لوگو و برندینگ
- فایل `/images/logo-mark.png` و `/images/logo-new.png` نشان بدون متن زیرین TSPK هستند.
- در `Navbar.tsx` و `Footer.tsx` این لوگو در کنار متن «طیوران صنعت پویا / TSPK» نمایش داده می‌شود.

### ۴.۷. سازگاری با تلویزیون‌های هوشمند و مرورگرهای قدیمی (Chrome 98 / Android TV)
- کارفرما سایت را روی تلویزیون هوشمند (با مرورگرهای قدیمی‌تر مثل Chrome 98 و سخت‌افزار ضعیف) نیز بررسی می‌کند.
- فایل `src/lib/device.ts` (`isLiteDevice`) دستگاه‌های کم‌توان/تلویزیون را تشخیص می‌دهد تا انیمیشن‌های سنگین، افکت‌های `backdrop-filter: blur` سنگین یا اسکرول‌های بی‌نهایت جاوااسکریپتی باعث کندی یا بهم‌ریختگی تصویر نشوند.
- در CSS و Tailwind از ویژگی‌هایی که در Chrome 98 پشتیبانی نمی‌شوند بدون fallback استفاده نکنید.

---

## ۵. سیستم سئو (SEO) و قوانین تغییرناپذیر آن

فایل‌های اصلی سئو:
- `src/seo/resolveSeo.ts`: قلب سئو. برای هر مسیر (`/`، `/products`، `/products/:slug`، `/services/:slug`، `/projects/:id`، `/magazine/:id`، `/about`، `/contact`) خروجی `title`، `description`، `h1`، `canonicalHref`، `robots`، `jsonLd` و `body` (محتوای HTML داخل `#seo-prerender`) را تولید می‌کند. `/rnd` صفحهٔ عمومی نیست و باید ۴۰۴ بدهد.
- `server/seo.ts`: تزریق خروجی `resolveSeo` به `index.html`، تولید `/robots.txt`، `/sitemap.xml` و `/llms.txt`، نرمال‌سازی URLها (حذف اسلش اضافه، ریدایرکت ۳۰۱ کد محصول به اسلاگ).
- `server/legacySpam.ts`: برگرداندن وضعیت `410 Gone` با هدر `X-Robots-Tag: noindex, nofollow` برای URLهای اسپم ژاپنی قدیمی (`/?goods/...`، `/?jp/...`، `/0x...`) که از سایت قبلی در گوگل مانده بود.

**چک‌لیست اجباری سئو در هر تغییر:**
1. هر صفحهٔ عمومی دقیقاً **یک تگ `<h1>`** دارد و متن `<h1>` در کامپوننت React باید با `h1` تولیدشده در `resolveSeo.ts` هم‌خوانی داشته باشد.
2. مسیرهای `/admin`، `/crm` و `/api/*` هرگز نباید ایندکس شوند (`noindex, nofollow` و Disallow در `robots.txt`).
3. مسیرهای نامعتبر باید وضعیت HTTP واقعی `404` برگردانند (نه `200` با ظاهر ۴۰۴).
4. بعد از هر تغییر مرتبط با روت یا محتوا، `npm run check:seo` را اجرا کنید و تغییرات سئو را در `docs/seo/CHANGELOG.md` ثبت نمایید.

---

## ۶. API درون‌سازمانی مدیریت محتوا (`/api/cms/v1`)

فایل: `server/cmsApi.ts`
این API برای ویرایش امن محتوا (مقالات، محصولات، خدمات، پروژه‌ها، دسته‌ها، اطلاعات شرکت و هیرو) توسط اسکریپت‌ها یا همکاران محتوا بدون نیاز به لاگین در پنل ادمین طراحی شده است.

### امنیت و احراز هویت
- احراز هویت با هدر `Authorization: Bearer <TOKEN>` انجام می‌شود.
- سرور، توکن دریافتی را SHA-256 می‌گیرد و با هش ذخیره‌شده در `/opt/toyooran-data/cms-api.sha256` (یا متغیر محیطی `CMS_API_TOKEN_SHA256`) با `crypto.timingSafeEqual` مقایسه می‌کند.
- قبل از هر عملیات نوشتن (`PUT` / `DELETE`)، یک بکاپ کامل آنلاین با دستور `VACUUM INTO` در `/opt/toyooran-data/backups/cms-api-<key>-<timestamp>.sqlite` گرفته می‌شود و در `/opt/toyooran-data/cms-api-audit.log` ثبت می‌گردد.
- محدودیت نرخ: حداکثر ۳۰ نوشتن در هر ۱۰ دقیقه به ازای هر IP و حداکثر حجم ۲ مگابایت.

### نحوه ساخت یا تعویض توکن CMS API روی سرور
اگر توکن قبلی گم شد یا خواستید توکن را عوض کنید (توکن قبلی بلافاصله باطل می‌شود):
```bash
TOKEN="tspk_cms_$(openssl rand -hex 24)"
printf '%s' "$TOKEN" | sha256sum | awk '{print $1}' > /opt/toyooran-data/cms-api.sha256
chmod 600 /opt/toyooran-data/cms-api.sha256
echo "New Bearer Token (save it now, not stored in plaintext):"
echo "$TOKEN"
```

### اندپوینت‌های `/api/cms/v1`
- `GET /api/cms/v1/state/:key` — دریافت کل آرایه/آبجکت یک کلید (`articles`, `products`, `categories`, `services`, `projects`, `companyInfo`, `heroCms`).
- `PUT /api/cms/v1/state/:key` — جایگزینی کامل مقدار یک کلید (همراه با بکاپ خودکار).
- `PUT /api/cms/v1/articles/:id` — افزودن یا ویرایش تکی یک مقاله با `id` مشخص بدون دست‌زدن به سایر مقالات.
- `DELETE /api/cms/v1/articles/:id?confirm=1` — حذف یک مقاله با `id` مشخص (نیازمند `?confirm=1`).

---

## ۷. پنل مدیریت (`/admin`) و سیستم CRM (`/crm`)

- **ورود ادمین:** از مسیر `/admin` انجام می‌شود. کد بک‌اند احراز هویت در `server/auth.ts` است (شامل رمز عبور bcrypt، کوکی نشست `HttpOnly`، توکن CSRF، کد دو مرحله‌ای TOTP MFA و کپچای Cloudflare Turnstile در محیط Production).
- **CRM:** در مسیر `/crm` قرار دارد (`src/crm/CrmApp.tsx`) و با همان نشست ادمین کار می‌کند. شامل مدیریت سرنخ‌ها (Leads)، قیف فروش (Pipeline)، پرسوناها و ورود/خروج اکسل (`src/crm/utils/crmExcel.ts`) است.
- **فرم‌های مشاوره سایت:** هر فرم که در سایت پر شود به `POST /api/consultation` ارسال می‌شود و در `/opt/toyooran-data/qualified-leads.jsonl` ذخیره می‌گردد. همان مشخصات (نام، تلفن و بقیهٔ فیلدها) در `/opt/toyooran-data/bale-inbox/leads.jsonl` هم صف می‌شود تا سرویس میزبان `bale-monitor` آن را به گفتگوی تأییدشده در بله بفرستد. توکن بله داخل کانتینر سایت نیست.

---

## ۸. دستورات اضطراری و عیب‌یابی سریع (Runbook)

| مشکل / نیاز | دستور بررسی و رفع |
|---|---|
| بررسی زنده بودن اپ | `curl -i http://127.0.0.1:3000/api/health` |
| مشاهده لاگ‌های لحظه‌ای کانتینر اپ | `docker logs -f --tail 100 toyooran-app` |
| مشاهده وضعیت کانتینرها | `docker ps -a` |
| سایت خطای 502 Bad Gateway می‌دهد | ۱. `docker ps` را چک کنید. ۲. اگر `toyooran-app` پایین است: `/usr/local/sbin/toyooran-rollback.sh` یا `/usr/local/sbin/toyooran-deploy.sh` را بزنید. |
| خطای `max depth exceeded` در Docker | اسکریپت `toyooran-deploy.sh` به صورت خودکار وقتی تعداد لایه‌های ایمیج بالای ۹۰ برسد آن را با `flatten_image` فشرده می‌کند. کافی است `/usr/local/sbin/toyooran-deploy.sh` را اجرا کنید. |
| بازگردانی دیتابیس از بکاپ | ۱. لیست بکاپ‌ها: `ls -lt /opt/toyooran-data/backups/ \| head`<br>۲. توقف اپ: `docker stop toyooran-app`<br>۳. کپی بکاپ: `cp /opt/toyooran-data/backups/<BACKUP_FILE>.sqlite /opt/toyooran-data/toyooran.sqlite && rm -f /opt/toyooran-data/toyooran.sqlite-wal /opt/toyooran-data/toyooran.sqlite-shm`<br>۴. روشن کردن اپ: `docker start toyooran-app` |
| ریست کردن کش کاتالوگ سئو در سرور | ری‌استارت سبک کانتینر: `docker restart toyooran-app` (کش کاتالوگ در حافظه ۵ ثانیه TTL دارد ولی ری‌استارت کل حافظه را پاک می‌کند). |
| بررسی صحت کامل سئو پس از تغییرات | `cd /opt/Toyooran && npm run check:seo` |
