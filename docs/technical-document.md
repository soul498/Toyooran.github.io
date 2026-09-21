# سند فنی طیوران صنعت پویا

سایت شرکتی RTL برای تجهیز مرغداری. یک باینری Node هم UI را سرو می‌کند هم API را. SPA است، ولی HTML اولیه برای خزنده در سرور ساخته می‌شود.

## استک واقعی (از `package.json`)

- React 19 + React Router 7
- TypeScript
- Vite 6 + `@tailwindcss/vite` 4
- Express 5 (`server.ts`)
- Framer Motion / `motion`، Lenis، Lucide
- SQLite از `node:sqlite` در `server/auth.ts`
- بیلد: `vite build` سپس `esbuild` برای `dist/server.cjs`
- اجرای production: `node dist/server.cjs` داخل Docker روی پورت 3000

`README` قدیمی Google AI Studio را نادیده بگیر.

## دو فرایند، یک ریپو

```
مرورگر  →  nginx (443)  →  container :3000 (Express)
                                ├─ /api/* احراز هویت، state، مشاوره، health
                                ├─ /robots.txt /sitemap.xml
                                └─ HTML استاتیک dist + injectSeoTags(path)
```

توسعه محلی: `npm run dev` → `tsx server.ts` با Vite middleware. production: `NODE_ENV=production`.

## روت‌های عمومی (`src/App.tsx`)

| مسیر | کامپوننت |
|---|---|
| `/` | Hero + CompactShowcase |
| `/products`, `/products/:productId` | کاتالوگ / صفحه محصول |
| `/services`, `/services/:serviceId` | خدمات |
| `/projects`, `/projects/:projectId` | پروژه‌ها |
| `/magazine`, `/magazine/:articleId` | مجله |
| `/about`, `/rnd`, `/contact` | درباره، R&D، تماس |
| `/admin` | لاگین یا پنل |
| سایر | `NotFoundPage` + وضعیت 404 سروری اگر مسیر در `isKnownPublicPath` نباشد |

`toyooran.com` بدون www به `https://www.toyooran.com` ریدایرکت ۳۰۱ می‌شود.

## API (`server.ts`)

| روش | مسیر | توضیح |
|---|---|---|
| GET | `/api/health` | سلامت |
| GET | `/api/auth/csrf` | توکن CSRF |
| POST | `/api/auth/login` | ورود ادمین (+ Turnstile در production) |
| GET | `/api/auth/me` | نشست |
| POST | `/api/auth/logout` | خروج |
| POST | `/api/auth/password` | تعویض رمز (superadmin) |
| POST | `/api/auth/mfa/*` | setup / confirm / verify |
| GET/PUT | `/api/admin/state/:key` | JSON محتوا در SQLite؛ کلیدهای مجاز در خود روت |
| POST | `/api/consultation` | فرم سایت؛ فایل lead + اختیاری بله |
| GET | `/api/admin/leads.csv` | خروجی lead |
| GET | `/api/bale/status` | آیا توکن بله ست شده |
| GET | `/robots.txt`, `/sitemap.xml` | SEO |

نرخ: حدود ۶۰ درخواست API در دقیقه per IP. CSRF روی POST/PUT/PATCH/DELETE به‌جز login و consultation.

## SEO (قرارداد اجباری)

منبع خزنده: `server/seo.ts`. `injectSeoTags` روی `index.html` برای هر path: canonical ثابت `https://www.toyooran.com`، description، og، JSON-LD.

`src/components/SEO.tsx` فقط بعد از hydrate عنوان را در مرورگر هم‌تراز می‌کند. حذف prerender سرور یعنی گوگل title خالی Google AI Studio را می‌بیند.

`/admin` و `/api` در robots disallow هستند.

جزئیات مسیرها: `docs/seo/CHANGELOG.md`.

## امنیت هدر

CSP، HSTS در production، مخفی کردن `X-Powered-By`. اسکریپت Cloudflare Turnstile در CSP مجاز است.

## محیط اجرا روی این سرور

کانتینر `toyooran-app`، bind `127.0.0.1:3000`، volume `/opt/toyooran-data`.
`DATA_DIR=/opt/toyooran-data`، `LEADS_FILE=/opt/toyooran-data/qualified-leads.jsonl`، `APP_URL=https://www.toyooran.com`.

دستورات دیپلوی: `docs/ci-cd.md`.
