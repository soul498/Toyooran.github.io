# CI/CD طیوران — Forgejo محلی

سورس حقیقت git روی همین سرور است: `https://git.toyooran.com/mhzare/toyooran.git`.
دیپلوی از GitHub، Docker Hub و GitHub Actions استفاده نمی‌کند.

## چرا این مدل

اینترنت بین‌الملل (GitHub، registry-1.docker.io) از این سرور اغلب قطع یا فیلتر است.
Forgejo، runner، کد، ایمیج `toyooran:*` و npm داخل ایمیج قبلی همه روی دیسک محلی هستند.

## مسیر دولوپر / ایجنت

کار در `/opt/Toyooran` روی شاخه **`main`**. push به `origin/main` دیپلوی می‌کند. شاخه جدا نساز.

| کار | دستور |
|---|---|
| وضعیت | `cd /opt/Toyooran && git status -sb` |
| دیپلوی از git | `toyooran-deploy.sh` |
| دیپلوی کار در حال انجام | `toyooran-deploy.sh --from-workdir` |
| rollback | `toyooran-rollback.sh` |
| سلامت | `curl -fsS http://127.0.0.1:3000/api/health` |

بیلد `FROM toyooran:prev` است تا بدون Docker Hub انجام شود. `npm install` با `--prefer-offline` از `node_modules` همان ایمیج استفاده می‌کند.

## دسترسی اگر DNS یا نت خارجی خوابید

روی خود سرور `git.toyooran.com` در `/etc/hosts` به `127.0.0.1` است.
از بیرون: سایت روی `www.toyooran.com`، گیت روی `git.toyooran.com`، پشتیبان Forgejo روی `https://IP:8443`.

## داده

`DATA_DIR=/opt/toyooran-data` روی کانتینر mount می‌شود. بکاپ SQLite در `/opt/toyooran-data/backups`.
