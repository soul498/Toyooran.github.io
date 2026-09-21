# داده و پایداری

## production روی این سرور

| ذخیره | مسیر | محتوا |
|---|---|---|
| SQLite WAL | `/opt/toyooran-data/toyooran.sqlite` | ادمین، نشست، MFA، `admin_state`، audit |
| JSONL | `/opt/toyooran-data/qualified-leads.jsonl` | lead فرم سایت |
| بکاپ | `/opt/toyooran-data/backups/` | کپی SQLite هنگام دیپلوی / cron |

`DATA_DIR` باید volume باشد. داخل ایمیج Docker ماندگار نیست.

جدول‌ها در `server/auth.ts` ساخته می‌شوند: `admins`, `sessions`, `admin_state`, `audit_log`, `mfa_recovery_codes`, `password_history`, `rate_limits`.

اولین ادمین فقط اگر جدول خالی باشد و `ADMIN_BOOTSTRAP_PASSWORD` (≥۱۶ کاراکتر) ست شده باشد ساخته می‌شود. تغییر بعدی env رمز موجود را عوض نمی‌کند.

## سایت عمومی

پیش‌فرض RAM از `mockData.ts`. `localStorage` هنوز برای بخشی از `companyInfo` در Context خوانده می‌شود؛ مسیر اصلی persistence ادمین SQLite است نه localStorage.

سند قدیمی که فقط «Memory / LocalStorage» می‌گفت منسوخ است.

## توسعه محلی

بدون volume هم SQLite در `./data/toyooran.sqlite` نسبی ساخته می‌شود. آن را commit نکن.

## بکاپ ادمین در UI

`BackupTab` JSON از state می‌سازد و در نسخه‌های قدیمی کلید localStorage می‌نوشت. منبع حقیقت سرور همان API state است؛ بعد از import، ذخیره از طریق Context به SQLite برمی‌گردد اگر نشست ادمین فعال باشد.
