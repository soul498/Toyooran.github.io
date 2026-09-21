# ساختار محصول و جریان داده

## لایه‌ها

1. **دادهٔ seed:** `src/data/mockData.ts` (و `productsData.ts`). سایت عمومی و `server/seo.ts` از همین‌جا می‌خوانند تا HTML اول و sitemap بدون لاگین ادمین کامل باشد.
2. **UI عمومی:** `src/components/*` از `useData()` در `DataContext` تغذیه می‌شود. پیش‌فرض همان seed است.
3. **پنل ادمین:** بعد از کوکی نشست، Context کلیدهای state را از SQLite می‌گیرد و با هر تغییر `PUT /api/admin/state/:key` می‌نویسد.
4. **پایداری سرور:** جدول `admin_state` در `DATA_DIR/toyooran.sqlite`. lead جدا در JSONL.

بازدیدکنندهٔ عادی SQLite را برای کاتالوگ صدا نمی‌زند؛ اگر ادمین محتوا را عوض کرده باشد، تا وقتی همان مرورگر/کش یا یک بار لود با نشست ادمین state را نیاورد، عمومی همان seed را نشان می‌دهد. SEO سرور هم از seed است نه از SQLite. اگر محتوای CMS باید در گوگل بیاید، `server/catalog.ts` از `admin_state` می‌خواند و در صورت خالی بودن به seed برمی‌گردد.

## کلیدهای `admin_state`

`products`, `projects`, `services`, `articles`, `categories`, `companyInfo`, `heroCms`, `aiConfig`, `quotes`, `consultations`, `customers`, `media`

تعریف شکل داده: `src/types.ts`.

## فرم مشاوره

`FreeConsultationForm` → `src/utils/sendToBale.ts` → `POST /api/consultation` → `server/leads.ts` و در صورت تنظیم env، پیام به بله.

## تصاویر

فایل‌های استاتیک در `public/images/` با URL مثل `/images/...`. در ادمین Media هم می‌توان آیتم ثبت کرد (state).

## تایپ مسیر بخش‌ها

`PageSection` در `types.ts` برای نوار ناوبری؛ با pathهای Router یکی نیست (`knowledge` ≈ `/magazine`).
