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

## 2026-10-11 — اصلاح دسته ts-009، حذف ادعای ts-057، لحن رسمی مقاله‌ها

- مالک: سئو (تأیید مدیر)
- فایل‌ها: `src/data/productsData.ts`، `src/data/mockData.ts` + DB از CMS API: products (`backups/cms-api-products-2026-10-11T12-50-57-161Z.sqlite`)، services (`backups/cms-api-services-2026-10-11T12-51-01-849Z.sqlite`)، articles (۵ PUT، `backups/cms-api-articles-2026-10-11T12-49-*.sqlite`)
- URLها: `/products/heating`، `/products/ventilation`، صفحه ts-009 و ts-057 (اسلاگ بدون تغییر)، ۵ مقاله، `/services/*`
- تغییر: ts-009 «هواکش صنعتی KGFI140» از دسته گرمایش به تهویه منتقل شد. ts-057: «راندمان ۹۹٪، کاهش ۷۰٪ مصرف برق» از توضیح، ویژگی‌ها و مشخصات حذف و توضیح خنثی بدون عدد جدید نوشته شد. مقاله‌ها: فعل اول‌شخص جمع و «ما» به سوم‌شخص/مجهول و «مرغدار/مرغداران» به «بهره‌بردار/مدیر واحد» (عنوان مقاله تهویه: «چگونه ظرفیت تهویه سالن محاسبه می‌شود؟»). خدمت: «مرغداران» → «بهره‌برداران واحدهای مرغداری».
- Verify: lint + build + اسکن پیش‌رندر زنده همه مقاله‌ها + H1 + لیست دسته‌ها

## 2026-10-11 — 410 برای URLهای اسپم قدیمی + لینک‌سازی داخلی برای اولویت خزش

- مالک: سئو (تأیید مدیر)
- فایل‌ها: `server/legacySpam.ts`، `server.ts`، `scripts/test-legacy-spam.ts`، `package.json` (`test:legacy-spam`)، `src/seo/internalLinks.ts`، `src/seo/resolveSeo.ts`، `src/components/PopularLinksSection.tsx`، `src/App.tsx`، `src/components/ProductPage.tsx`، `src/components/ProductCatalogSection.tsx` + محتوای ۸ مقاله از CMS API (بکاپ خودکار هر PUT در `backups/cms-api-articles-*.sqlite`)
- URLها: `/?goods/…`، `/?jp/…`، `/?detail/…`، `/?sitemapindex…`، `/0x<hex>/` (۴۱۰)؛ `/`، `/products/*`، `/magazine/*`
- تغییر: پاسخ 410 Gone با صفحه کوچک noindex و هدر `X-Robots-Tag: noindex, nofollow` برای کوئری بدون کلید روی صفحه اصلی (goods/، jp/، detail/، sitemapindex؛ شکل %2F هم) و مسیر `^/0x[0-9a-f]+/?$`، قبل از نرمال‌سازی URL و SPA. صفحه اصلی: بخش «دسته‌های تجهیزات دام و طیور» و «محصولات پرکاربرد» (۱۲ محصول) در پیش‌رندر و مرورگر. صفحه دسته: فهرست کامل لینک محصولات دسته در مرورگر (گرید تدریجی بارگذاری می‌شد). صفحه محصول: breadcrumb لینک‌دار (پیش‌رندر + مرورگر) و ۶ محصول هم‌دسته‌ی مجاور به‌جای ۸ محصول اول دسته (پخش یکنواخت لینک). مقاله‌ها: ۲ تا ۴ لینک درون‌متنی به دسته/محصول روی عبارت‌های موجود.
- invariantها: یک H1، H1 پیش‌رندر = مرورگر، title/meta بدون تغییر.
- Verify: test:legacy-spam + lint + build + curl زنده (۴۱۰ و ۲۰۰) + شمارش inlink پیش‌رندر قبل/بعد + GSC

## 2026-10-09 — ترتیب مقاله‌ها: جدیدترین اول

- مالک: سئو/فرانت (درخواست مدیر)
- فایل‌ها: `src/seo/articleMeta.ts` (`articlePublishDay`، `sortArticlesNewestFirst`)، `server/catalog.ts`، `src/seo/resolveSeo.ts`، `src/App.tsx`
- URLها: `/magazine`، `/api/magazine`، ویجت‌های مقاله صفحه اصلی و دسته‌ها، پیش‌رندر فهرست‌ها
- تغییر: مقاله‌ها همه‌جا بر اساس `datePublishedIso` (در نبود آن، تاریخ شمسی/میلادی `date`) نزولی مرتب می‌شوند، مستقل از ترتیب آرایه DB.
- Verify: lint + build + `/magazine` در مرورگر و HTML گوگل‌بات (اولین مقاله = feeder-types-comparison)

## 2026-10-09 — بازطراحی قالب صفحه مقاله مجله

- مالک: سئو/فرانت (تأیید مدیر)
- فایل‌ها: `src/components/magazine/MagazineArticle.tsx`، `src/index.css`، `public/fonts/estedad-latin-400.woff2`، `public/fonts/estedad-latin-700.woff2`، `src/data/mockData.ts` + محتوای DB از CMS API (`PUT /api/cms/v1/articles/feeder-types-comparison`، بکاپ خودکار `backups/cms-api-articles-2026-10-09T11-02-07-838Z.sqlite`)
- URLها: همه `/magazine/*` (فقط صفحه جزئیات مقاله)
- تغییر: هدر روشن بدون تصویر پس‌زمینه (H1 کوچک‌تر، همان متن)؛ تصویر شاخص در کادر گرد با `<img>` واقعی، width/height=1200×630، eager + fetchpriority=high (تصویر [IMG] تکراری اول بدنه در کلاینت نمایش داده نمی‌شود)؛ ستون متن ~۷۲۰px؛ پاراگراف‌ها وزن عادی، راست‌چین، line-height 1.9، فقط **bold** پررنگ؛ فونت لاتین Estedad (زیرمجموعه لاتین) فقط در صفحه مقاله؛ جدول ۱۵px، سرستون برند، ستون اول پررنگ، zebra و در موبایل (<640px) کارت به‌ازای هر ستون؛ «کی مناسب است/نیست» + فهرست به‌صورت دو کادر سبز/کهربایی کنار هم؛ CTA میانی «استعلام خط دانخوری» بعد از جدول مقاله مقایسه دانخوری.
- invariantها: پیش‌رندر، H1، title/meta، JSON-LD و sitemap تغییری نکردند.
- Verify: lint + build + اسکرین‌شات قبل/بعد ۱۳۶۶ و ۴۰۰ + بررسی ۸ مقاله (یک H1، H1 پیش‌رندر = مرورگر، هش JSON-LD قبل/بعد)

## 2026-10-08 — انتشار مقاله «مقایسه دانخوری پروانه‌ای، بشقابی و زنجیری»

- مالک: سئو (تأیید مدیر)
- فایل‌ها: `src/data/mockData.ts` (ARTICLES)، `public/images/feeder-types-comparison.webp`، `src/seo/resolveSeo.ts`، `src/components/magazine/MagazineArticle.tsx` + DB (admin_state.articles) با بکاپ `backups/manual-before-article-feeder-*.sqlite`
- URLها: `/magazine/feeder-types-comparison` (جدید)، `/magazine`، `/sitemap.xml`
- تغییر: مقاله از پیش‌نویس ۱۸ منتشر شد (title/meta/H1/alt از پیش‌نویس، منابع Ross و Cobb در فیلد sources). رندر مقاله‌ها حالا `**bold**` و لینک داخلی `[متن](/path)` را در پاراگراف، فهرست، H3 و سلول جدول، هم در پیش‌رندر و هم در مرورگر، رندر می‌کند. FAQPage JSON-LD برای بخش «پرسش‌های متداول» هر مقاله (نه فقط دسته faq) از همان متن قابل‌مشاهده ساخته می‌شود.
- Verify: lint + build + HTML زنده (status، H1، canonical، JSON-LD، تصویر، sitemap) + Chrome headless + ارسال مجدد sitemap و URL Inspection در GSC

## 2026-10-06 — حذف ادعاهای گارانتی ۲۴ ماهه، FCR ۱.۵۱، «صفر شدن نیاز به سینی دان» و Chore-Time؛ یکسان‌سازی H1

- مالک: سئو (تأیید مدیر)
- فایل‌ها: `src/data/mockData.ts`، `src/data/productsData.ts`، `src/seo/resolveSeo.ts`، `src/components/ProjectPage.tsx`، `src/components/FeaturedProjectsSection.tsx`، `src/components/magazine/MagazineFeed.tsx`، `src/components/ContactPage.tsx`، `src/components/Modals/CaseStudyModal.tsx` + DB (projects، services، products) با بکاپ `backups/manual-before-claims2-20261006-164422.sqlite`
- URLها: `/services/srv-poultry-equipment-supply`، `/projects`، `/projects/*`، محصول TS-091 (کوناوی)، `/magazine`، `/contact`، `/rnd`
- تغییر: ادعاهای بالا حذف شد (keyOutcome پروژه نوین خالی شد؛ meta آن به solution برمی‌گردد). H1 پیش‌رندر و مرورگر یکی شد: مجله «مجله تخصصی دام و طیور»، پروژه‌ها «پروژه‌های اجراشده»، صفحه پروژه = نام پروژه، تماس «تماس و درخواست مشاوره»، R&D «واحد تحقیق و توسعه».
- Verify: lint + build + اسکن H1 همه URLهای sitemap + HTML زنده و Chrome headless

## 2026-10-06 — حذف ادعای «تنها تولیدکننده / لیسانس Butterfly Concepts / تاییدیه FDA»

- مالک: سئو (تأیید مدیر)
- فایل‌ها: `src/data/mockData.ts`، `src/data/landingServiceCards.ts`، `src/admin/tabs/ProjectsTab.tsx` + دیتابیس (admin_state: projects، services، articles، companyInfo، aiConfig) با بکاپ `backups/manual-before-claims-cleanup-20261006-162633.sqlite`
- URLها: `/`، `/services`، `/services/srv-poultry-equipment-supply`، `/about`، `/projects/*`، `/magazine/introduction-to-pouya-butterfly-feeder`، `/llms.txt`، چت‌بات
- تغییر: ادعای انحصار، لیسانس آمریکایی، برند Butterfly Concepts و تاییدیه FDA از همه متن‌های عمومی حذف شد و جمله‌ها به حالت خنثی بازنویسی شد؛ `fdaLicense` خالی شد. عنوان خدمت در DB هم «…دام و طیور» شد. slugها/idها ثابت ماندند.
- Verify: lint + build + HTML زنده (Googlebot) + Chrome headless

## 2026-10-06 — متن معرفی دسته‌های قفس/سیلو/سایر، متن شش محصول، و «تجهیزات دام و طیور» برای خدمت تأمین تجهیزات

- مالک: سئو (پیش‌نویس‌های تأییدشده مدیر محتوا 01–03 و 09–14)
- فایل‌ها: `src/seo/richText.ts` (جدید)، `src/components/RichBlocks.tsx` (جدید)، `src/seo/resolveSeo.ts`، `src/components/ProductCatalogSection.tsx`، `src/components/ProductPage.tsx`، `src/types.ts`، `src/data/productsData.ts`، `src/data/mockData.ts`، `src/data/landingServiceCards.ts`، `src/components/Footer.tsx`
- URLها: `/products/cage`، `/products/silo`، `/products/other` و محصولات این دسته‌ها (معرفی دسته در «نکته انتخاب»)، محصولات TS-001/002/003/005/010/015، `/services/srv-poultry-equipment-supply`، `/services`، `/`
- تغییر: CATEGORY_SEO فیلد `intro` (بلوک‌های متنی) گرفت که هم در #seo-prerender و هم در کاتالوگ کلاینت یکسان رندر می‌شود. Product فیلد اختیاری `details` گرفت. H1 دسته قفس طبق پیش‌نویس «قفس مرغداری». عنوان خدمت `srv-poultry-equipment-supply` و کارت/فوتر به «دام و طیور» تغییر کرد؛ slug ثابت ماند. جاهای خالی [..] و موارد نیازمند تأیید منتشر نشد.
- Verify: lint + build + HTML زنده (Googlebot) + متن رندرشده با Chrome headless + تطابق H1 در ۱۰ URL کاتالوگ

## 2026-10-06 — H1 اختصاصی هر دسته و حوزه «صنعت دام و طیور» در متن‌های کلی شرکت

- مالک: سئو
- فایل‌ها: `src/seo/resolveSeo.ts`, `src/components/ProductCatalogSection.tsx`, `src/components/ServicesSection.tsx`, `src/components/CategoryHexSection.tsx`, `src/components/LazyImage.tsx`, `index.html`
- URLها: `/products`, `/products/{heating,ventilation,drinking,cooling,inlet,feeding,cage,silo,other}`, `/`, `/services`, `/about`, `/contact`, `/llms.txt`
- تغییر: H1 کلاینت کاتالوگ دیگر هاردکد «تجهیزات مرغداری» نیست؛ از `catalogHeading()` می‌آید که همان H1 پیش‌رندر سرور است. هاب: «تجهیزات صنعت دام و طیور». ورودی CATEGORY_SEO برای cage و other اضافه شد. متن‌های کلی شرکت (عنوان/توضیح خانه، هاب محصولات و خدمات، درباره، تماس، llms.txt) از «فقط مرغداری» به «صنعت دام و طیور» تغییر کرد؛ متن‌های اختصاصی سالن مرغداری حفظ شد.
- دلیل/Issue: همه دسته‌ها H1 یکسان داشتند و شرکت در کل صنعت دام و طیور فعال است (درخواست مدیر).
- Verify: lint + build + HTML زنده (Googlebot) + H1 رندرشده با Chrome headless

## 2026-09-25 — H1 لندینگ دوباره از روی کامپوننت خوانده می‌شود

- مالک: توسعه
- فایل‌ها: `src/components/Hero.tsx`, `src/data/mockData.ts`, `src/seo/resolveSeo.ts`
- URLها: `/`
- تغییر: تیتر هیرو دیگر هاردکد «تجهیز و نوسازی سالن مرغداری» نیست؛ از CMS با پیش‌فرض «طیوران صنعت پویا» می‌آید تا با متن قبل از بازنویسی SEO یکی باشد.
- دلیل/Issue: بعد از `d15ff7a` کامیت `19b9d9e` تیتر را در Hero قفل کرده بود و روی سایت زنده همان متن قبلی دیده می‌شد
- Verify: lint + HTML زنده
- نتیجه پس از انتشار: در همین commit

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
