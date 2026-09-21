# نقد معماری (برای دولوپر)

این سایت یک محصول Studio-export است که بعداً سرور، SEO، ادمین و دیپلوی محلی به آن چسبیده. لایه‌ها از هم جدا نیستند؛ برای همین یک پچ از Google AI Studio می‌تواند گوگل را خراب کند بدون اینکه UI بد به نظر برسد.

## چه چیزی درست کار می‌کند

- یک پروسس Express هم صفحه می‌دهد هم API؛ nginx فقط reverse proxy است.
- خزنده HTML اول را از `server/seo.ts` می‌گیرد، نه از SPA خالی.
- ادمین و نشست در SQLite روی volume است.
- دیپلوی به GitHub/Docker Hub وابسته نیست.

## مشکلات ساختاری

**۱. دو منبع حقیقت برای صفحه.**  
`src/App.tsx` + `SEO.tsx` یک عنوان می‌سازند؛ `server/seo.ts` یکی دیگر. اگر Studio فقط کامپوننت را عوض کند، کاربر عنوان جدید می‌بیند و گوگل عنوان قدیم (یا بدتر: تایتل خام `index.html` مثل Toyooran / AI Studio).

**۲. دو منبع حقیقت برای محتوا.**  
بازدیدکننده و sitemap از `mockData.ts` می‌آیند. پنل ادمین در SQLite می‌نویسد. گوگل CMS را نمی‌بیند مگر seed را هم عوض کنی.

**۳. Studio مالک «کل اپ» فرض شده.**  
`package.json` هنوز `react-example` است، `index.html` هنوز og از AI Studio دارد، `metadata.json` قابلیت Gemini را یدک می‌کشد. خروجی Studio معمولاً `src/`، `index.html`، `package.json`، `vite.config.ts` و README را یکجا عوض می‌کند. هسته ما (`server.ts`, `server/seo.ts`, `.forgejo`, Docker) در آن مدل وجود ندارد و در merge حذف می‌شود.

**۴. `App.tsx` خدا-فایل است.**  
روتر، Lenis، مودال، گیت ادمین، prefills مشاوره. Studio این فایل را دوست دارد بازنویسی کند. اگر بازنویسی شود، `/admin` یا روت مجله می‌پرد.

**۵. قرارداد روت نداریم.**  
مسیر جدید در Router بدون `isKnownPublicPath` / sitemap یعنی ۲۰۰ ظاهری برای انسان و ۴۰۴/بی‌ایندکس برای خزنده، یا برعکس.

**۶. سطح UI بدهی دارد.**  
`POST /api/chat` در مودال هست، در سرور نیست. `AdminPanelModal` هنوز به `/api/quotes` می‌زند. کلید localStorage کنار SQLite مانده.

## حکم برنامه‌نویس

Studio را **کارخانه پچ ظاهر** بگیر، نه Git و نه production. هسته (سرور، SEO، ادمین، دیپلوی) این ریپو است و فقط روی `main` همین Forgejo زندگی می‌کند.

پروتکل عملی: [ai-studio-boundary.md](ai-studio-boundary.md). بعد از هر ورود Studio: `npm run check:seo`.
