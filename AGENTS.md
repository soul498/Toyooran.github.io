# شروع اجباری برای همه ایجنت‌ها

کار فقط در `/opt/Toyooran` روی همین سرور. سورس حقیقت Forgejo است نه GitHub.

```bash
cd /opt/Toyooran
git status -sb
```

قبل از ادیت: `docs/seo` و قرارداد canonical `https://www.toyooran.com` را بخوان.
SEO عمومی باید در HTML اولیه باشد (`server/seo.ts`). canonical، Schema، sitemap و prerender را برای UI حذف نکن.
`/admin` و `/api` نباید ایندکس شوند. ادعای فنی را اختراع نکن.

## مسیر قطعی کار و دیپلوی

1. ادیت در `/opt/Toyooran`
2. `git add` / `git commit` (شاخه `main`)
3. `git push origin main` → Forgejo Actions روی همین ماشین `/usr/local/sbin/toyooran-deploy.sh` را اجرا می‌کند
4. اگر runner خواب بود: `toyooran-deploy.sh` (یا `--from-workdir` برای تست بدون push)
5. برگشت اضطراری: `toyooran-rollback.sh`

Remoteها:
- `origin` = `https://git.toyooran.com/mhzare/toyooran.git` (روی سرور به `127.0.0.1:3002` می‌رود)
- `github` = آرشیو قدیمی؛ برای دیپلوی استفاده نشود

داده پایدار: `/opt/toyooran-data` (SQLite + leads). داخل ایمیج نگه ندار.

Git UI: `https://git.toyooran.com` و اگر DNS/اینترنت بین‌الملل مشکل داشت `https://109.94.165.41:8443`
سایت: `https://www.toyooran.com`

جزئیات: `docs/ci-cd.md`
