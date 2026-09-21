# مرز Google AI Studio

هدف: گاهی اصلاح UI از ایجنت AI Studio وارد شود، بدون دست‌زدن به SEO، ادمین، دیپلوی و قرارداد دامنه.

## قانون طلایی

خروجی Studio را **روی `/opt/Toyooran` unpack نکن.** در یک پوشه موقت بگذار و فقط فایل‌های allowlist را یکی‌یکی کپی کن. commit همان پچ روی `main`.

Canonical همیشه `https://www.toyooran.com` است. `server/seo.ts` را Studio نباید ببیند.

## هسته — دست نزن (مگر کار همین لایه باشد)

- `server.ts`, `server/seo.ts`, `server/auth.ts`, `server/leads.ts`
- `.forgejo/`, `Dockerfile`, `docs/`, `AGENTS.md`
- اسکریپت‌های `package.json`: `dev` / `build` / `start` باید `tsx server.ts` و `esbuild server.ts` بمانند
- `index.html`: `lang="fa-IR"` `dir="rtl"` و `<div id="root"></div>` برای prerender

اگر Studio `package.json` جدید آورد، dependency را merge کن؛ scripts و نام سرور را از ما نگه دار.

## پوسته — با احتیاط

| فایل | کار Studio | کار ما بعد از کپی |
|---|---|---|
| `src/components/*.tsx` به‌جز `SEO.tsx` | ظاهر سکشن/صفحه | روت و فرم مشاوره را نشکن |
| `src/admin/tabs/*` | UI تب | API و CSRF را عوض نکن |
| `public/images/` | تصویر جدید | URL قدیمی sitemap را حذف نکن مگر redirect |
| `src/data/mockData.ts` | فقط اگر کاتالوگ عوض شده | همزمان `server/seo.ts` را چک کن؛ sitemap از همین seed است |

## ممنوع برای کپی خام Studio

- `src/App.tsx` را جایگزین کامل نکن. روت جدید را دستی به Router **و** `isKnownPublicPath` / `sitemapXml` اضافه کن.
- `src/components/SEO.tsx` را حذف نکن و منطق canonical را از آن به `http` یا دامنه دیگر نبر.
- `src/context/DataContext.tsx` را با نسخه localStorage-only Studio عوض نکن.
- `src/main.tsx` را به Vite-only بدون Express برنگردان.

## چک‌لیست بعد از هر پچ

```bash
cd /opt/Toyooran
npm run check:seo
npm run build
```

اگر سایت بالاست:

```bash
curl -fsS http://127.0.0.1:3000/api/health
curl -fsS http://127.0.0.1:3000/ | grep 'rel="canonical"'
curl -fsS http://127.0.0.1:3000/robots.txt | grep Disallow
curl -fsS http://127.0.0.1:3000/sitemap.xml | head
```

باید ببینی: canonical روی `https://www.toyooran.com`، JSON-LD، `#seo-prerender`، disallow برای `/admin` و `/api`.

سپس `git add` فقط همان فایل‌های UI → commit روی `main` → `git push origin main`.

## مدل ذهنی درست

```
AI Studio  -->  پچ ظاهر (components / css)
این ریپو    -->  روتر، SEO سرور، API، SQLite، Forgejo
گوگل        -->  فقط HTML خروجی Express
```

اگر Studio کل اپ را از نو ساخت، آن را پروژه جدید ندان؛ diff بگیر و سه فایل Hero/Footer/یک سکشن را بیاور، نه zip را.
