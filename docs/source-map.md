# نقشه سورس طیوران

هدف این صفحه: دولوپر جدید بداند برای یک تغییر کدام فایل را باز کند. ادعاهای بازاریابی اینجا نیست؛ فقط کد موجود.

## ریشه ریپو

| مسیر | نقش |
|---|---|
| `server.ts` | فرایند Node: Express، API، تزریق SEO در HTML، استاتیک `dist` در production |
| `server/seo.ts` | تزریق HTML، robots، sitemap، llms.txt |
| `server/catalog.ts` | کاتالوگ SEO از SQLite با fallback به seed |
| `server/cmsApi.ts` | API مدیریت محتوا (`/api/cms/v1`) با توکن Bearer، بکاپ خودکار SQLite و لاگ ممیزی |
| `server/legacySpam.ts` | پاسخ `410 Gone` برای URLهای اسپم قدیمی |
| `src/seo/resolveSeo.ts` | منبع واحد title/canonical/JSON-LD/prerender |
| `src/seo/internalLinks.ts` | محصولات پرکاربرد صفحه اصلی (`HOME_PRIORITY_PRODUCT_IDS`) و لینک به محصولات هم‌دسته |
| `src/lib/mediaUrl.ts` | نسخه‌گذاری و Cache-busting تصاویر محصولات (`MEDIA_VERSION`) |
| `src/lib/baladMaps.ts` | ساخت لینک و iframe نقشه بلد برای لوکیشن‌های شرکت |
| `src/lib/device.ts` | تشخیص دستگاه‌های کم‌توان و تلویزیون‌های هوشمند (`isLiteDevice`) |
| `docs/seo/` | سیستم عملیاتی سئو: قرارداد، استراتژی محتوا، backlog |
| `server/auth.ts` | SQLite، نشست ادمین، CSRF، نقش‌ها، MFA |
| `server/leads.ts` | ذخیره lead در فایل JSONL |
| `src/main.tsx` | mount ری‌اکت |
| `src/App.tsx` | Router عمومی + `/admin` |
| `src/context/DataContext.tsx` | state کاتالوگ/CMS و همگام‌سازی با `/api/admin/state` |
| `src/data/mockData.ts` | دادهٔ پیش‌فرض سایت عمومی و SEO سرور |
| `src/data/productsData.ts` | داده کمکی محصولات (در کنار mock) |
| `src/types.ts` | قرارداد TypeScript موجودیت‌ها |
| `src/admin/` | UI پنل مدیریت |
| `src/components/` | صفحات و سکشن‌های سایت عمومی |
| `public/images/` | تصاویر استاتیک |
| `index.html` | پوسته HTML؛ تگ‌های SEO نهایی را سرور تزریق می‌کند |
| `Dockerfile` | بیلد از ایمیج قبلی محلی (`toyooran:prev`) |
| `.forgejo/workflows/deploy.yml` | push به `main` → دیپلوی روی همین سرور |
| `.env.example` | نام متغیرها؛ فایل واقعی را commit نکن |

اسکریپت‌های قدیمی `rewrite_*.js` / `update_*.js` در ریشه، ابزار یک‌بارمصرف داده هستند نه مسیر اجرای سایت.

## `src/components/` — سایت عمومی

| فایل | صفحه / کار |
|---|---|
| `Hero.tsx`, `CompactShowcase.tsx`, `AboutContactUnifiedSection.tsx` | صفحهٔ خانه `/` (شامل هیرو، نوار دسته‌ها، اسلایدر محصولات پرفروش/پرکاربرد، مجله و لوکیشن‌ها) |
| `ShopHero.tsx`, `ProductCatalogSection.tsx`, `ProductPage.tsx` | `/products`, `/products/:productId` (بنر کاتالوگ، دکمه دانلود کاتالوگ، فیلتر و صفحه محصول) |
| `ServicesSection.tsx`, `ServicePage.tsx` | `/services`, `/services/:serviceId` |
| `FeaturedProjectsSection.tsx`, `ProjectPage.tsx` | `/projects`, `/projects/:projectId` |
| `magazine/MagazineFeed.tsx`, `magazine/MagazineArticle.tsx` | `/magazine`, `/magazine/:articleId` |
| `AboutPage.tsx` | `/about` |
| `RnDPage.tsx` | `/rnd` |
| `ContactPage.tsx`, `FreeConsultationForm.tsx` | `/contact` و فرم مشاوره → `POST /api/consultation` |
| `Navbar.tsx`, `Footer.tsx` | پوسته |
| `SEO.tsx` | به‌روز کردن title/meta در مرورگر بعد از hydrate؛ منبع خزنده `server/seo.ts` است |
| `NotFoundPage.tsx` | مسیر ناشناس |
| `Modals/` | جستجو، جزئیات پروژه/خدمت، نقل‌قول |
| `AiEngineerAssistantModal.tsx` | دستیار UI؛ `POST /api/chat` می‌زند ولی این روت در `server.ts` فعلی تعریف نشده |

## `src/admin/` — پنل `/admin`

ورود: `AdminLogin.tsx`. شِل: `AdminPanel.tsx` + `AdminSidebar.tsx` + `AdminHeader.tsx`.

تب‌ها در `admin/tabs/`: Overview، HeroCms، Products، Projects، Services، Articles، Categories، CompanyCms، Quotes، Consultations، Customers، Media، Backup، Security، AiConfig.

## نقطه ورود منطقی برای کارهای رایج

- متن/محصول پیش‌فرض سایت و sitemap: `src/data/mockData.ts` سپس در صورت نیاز `server/seo.ts`
- روت جدید عمومی: `src/App.tsx` **و** `isKnownPublicPath` در `server/seo.ts`
- استایل: کلاس Tailwind در همان کامپوننت؛ پلاگین در `vite.config.ts`
- API جدید: `server.ts`؛ اگر state ادمین است کلید را در لیست `PUT /api/admin/state/:key` هم اضافه کن
- دیپلوی: فقط `main` → `docs/ci-cd.md`
