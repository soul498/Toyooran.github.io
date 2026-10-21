---
name: toyooran-maintainer
description: راهنمای عملیاتی و اسکیل جامع توسعه، ویرایش محتوا، جایگزینی تصاویر، حفظ قرارداد سئو و دیپلوی سایت طیوران صنعت پویا (toyooran.com) روی سرور اختصاصی. در هر کار مربوط به تغییر UI، محصولات، مقالات، لوکیشن‌ها، سئو یا دیپلوی این پروژه استفاده شود.
---

# اسکیل نگهداری و توسعه سامانه طیوران صنعت پویا (`toyooran-maintainer`)

نسخهٔ کامل این اسکیل در `docs/skills/toyooran-maintainer/SKILL.md` و راهنمای جامع تحویل سرور و پروژه در `docs/HANDOVER-GUIDE.md` قرار دارد. قبل از هر تغییر در پروژه آن‌ها را مطالعه کنید.

## خلاصه قوانین کلیدی

1. **مسیر و شاخه:** کار فقط در `/opt/Toyooran` روی شاخهٔ `main`. قبل از شروع و قبل از پوش: `git fetch origin main && git rebase origin/main`.
2. **دیپلوی:** پوش با `git push origin main` از طریق Forgejo Actions اسکریپت `/usr/local/sbin/toyooran-deploy.sh` را اجرا می‌کند.
3. **تصاویر محصولات:** فایل‌های جدید در `public/images/products/TS-XXX.webp` قرار می‌گیرند و پس از هر جایگزینی باید `MEDIA_VERSION` در `src/lib/mediaUrl.ts` افزایش یابد.
4. **ویترین صفحه اصلی:** در `src/components/CompactShowcase.tsx` است (شامل نوار «دسته‌های تجهیزات دام و طیور»، اسلایدر ۱۶تایی محصولات پرفروش + پرکاربرد، و ستون مجله). سکشن جداگانه برای لینک‌های سئو در پایین صفحه نسازید.
5. **بخش محصولات (`/products`):** بنر و دکمهٔ «دانلود کاتالوگ» در `src/components/ShopHero.tsx` و لیست محصولات در `src/components/ProductCatalogSection.tsx` است.
6. **لوکیشن‌ها:** فقط ۲ لوکیشن (دفتر مرکزی مشهد در میدان مادر و دفتر تحقیق و توسعه در گرگان، بلوار بهشتی) با نقشه و لینک مستقیم بلد (`src/lib/baladMaps.ts`).
7. **تست‌های الزامی:** قبل از پایان کار، `npm run lint` و `npm run check:seo` را اجرا کنید.
