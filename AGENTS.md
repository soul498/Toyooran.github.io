# شروع اجباری برای همه ایجنت‌ها

کار فقط در `/opt/Toyooran` روی همین سرور. سورس حقیقت Forgejo است نه GitHub.

```bash
cd /opt/Toyooran
git status -sb
```

قبل از ادیت: `docs/README.md`، `docs/source-map.md`، `docs/ai-studio-boundary.md` و سیستم سئو در `docs/seo/README.md` را بخوان.
origin مرجع: `https://www.toyooran.com`. قرارداد فنی: `docs/seo/SEO-CONTRACT.md`.
SEO عمومی باید در HTML اولیه باشد (`server/seo.ts`). canonical، Schema، sitemap و prerender را برای UI حذف نکن.
`/admin` و `/api` نباید ایندکس شوند. ادعای فنی را اختراع نکن.
همهٔ commitها روی `main`. شاخهٔ دیگر نساز.

## مسیر قطعی کار و دیپلوی

1. ادیت در `/opt/Toyooran`
2. `git add` / `git commit` (شاخه `main`)
3. `git push origin main` → Forgejo Actions روی همین ماشین `/usr/local/sbin/toyooran-deploy.sh` را اجرا می‌کند (بیلد از `/var/lib/toyooran/src`، مستقل از وضعیت dirty بودن `/opt/Toyooran`)
4. اگر runner خواب بود: `toyooran-deploy.sh` (یا `--from-workdir` برای تست بدون push)
5. برگشت اضطراری: `toyooran-rollback.sh`

Remoteها:
- `origin` = `https://git.toyooran.com/mhzare/toyooran.git` (روی سرور به `127.0.0.1:3002` می‌رود)
- `github` = آرشیو قدیمی؛ برای دیپلوی استفاده نشود

داده پایدار: `/opt/toyooran-data` (SQLite + leads). داخل ایمیج نگه ندار.

Git UI: `https://git.toyooran.com` و اگر DNS/اینترنت بین‌الملل مشکل داشت `https://109.94.165.41:8443`
سایت: `https://www.toyooran.com`

جزئیات: `docs/ci-cd.md`

## زبان‌ها (fa / en / tr) — اجباری بعد از هر آپدیت

فارسی اصلی با همان URLهاست. انگلیسی زیر `/en` و ترکی زیر `/tr` است. هر تغییر متن فارسی (کد، `src/data/*`، محصول، مقاله یا CMS) باید در همان کار نسخهٔ انگلیسی و ترکی هم داشته باشد:

1. `npm run check:i18n` (برای فهرست خالی‌ها: `-- --todo /tmp/todo.json`)
2. انگلیسی را در `src/i18n/en/{ui,site,products,magazine}.json` و ترکی را در `src/i18n/tr/` با همان کلیدها اضافه/اصلاح کن و کلیدهای stale را پاک کن.
3. تا وقتی `i18n: in sync` چاپ نشده (exit 0 و `"inSync": true` در `i18n-report.json`) commit نکن.
4. بعد از دیپلوی: `npm run check:i18n -- --base https://www.toyooran.com`

قواعد متن، فال‌بک‌ها و جزئیات: `docs/i18n.md`. واژه‌نامهٔ پیش‌فرض در فایل‌های repo است. بازنویسیِ دستی هر زبان، مثل انگلیسی، در فیلد `translations.en` / `translations.tr` پنل ادمین ذخیره می‌شود.
