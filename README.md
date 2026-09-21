# طیوران صنعت پویا

سایت و پنل `www.toyooran.com`. سورس روی Forgejo همین سرور: `https://git.toyooran.com/mhzare/toyooran.git` شاخه **`main`**.

برای آشنایی با کد از [docs/README.md](docs/README.md) شروع کن. ایجنت‌ها [AGENTS.md](AGENTS.md) را اول بخوانند.

## کار روی سرور

```bash
cd /opt/Toyooran
git checkout main
npm install   # اگر node_modules نیست؛ در production از ایمیج محلی استفاده می‌شود
npm run dev   # توسعه
npm run build && npm start
```

دیپلوی: `git push origin main` یا `toyooran-deploy.sh`. جزئیات: [docs/ci-cd.md](docs/ci-cd.md).

## قانون شاخه

تغییرات این پروژه روی `main` می‌روند. شاخه جدا نساز مگر درخواست صریح.
