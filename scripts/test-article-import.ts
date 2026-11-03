import assert from 'node:assert/strict';
import { importPlainArticle } from '../src/admin/blog/articleImport';
import { blocksToContent, contentToBlocks } from '../src/admin/blog/contentBlocks';
import { articleBlocks } from '../src/seo/articleBlocks';

const pasted = `# راهنمای کامل تهویه مرغداری

این راهنما روش انتخاب ظرفیت تهویه و بررسی شرایط سالن مرغداری را مرحله به مرحله توضیح می‌دهد.

## محاسبه ظرفیت

ظرفیت مورد نیاز به تعداد پرنده و فصل بستگی دارد.

- تعداد پرنده
- دمای محیط

![هواکش سالن](/media/fan.webp "هواکش نصب‌شده در سالن")

### نکات اجرایی

فیلترها را مرتب بررسی کنید.`;

const result = importPlainArticle(pasted);
assert.equal(result.title, 'راهنمای کامل تهویه مرغداری');
assert.match(result.summary, /این راهنما روش انتخاب/);
assert.deepEqual(result.blocks.map((block) => block.type), ['p', 'h2', 'p', 'ul', 'img', 'h3', 'p']);
const image = result.blocks.find((block) => block.type === 'img');
assert.equal(image?.type === 'img' ? image.caption : undefined, 'هواکش نصب‌شده در سالن');
const content = blocksToContent(result.blocks);
const parsedImage = articleBlocks(content).find((block) => block.type === 'img');
assert.equal(parsedImage?.type === 'img' ? parsedImage.caption : undefined, 'هواکش نصب‌شده در سالن');
assert.equal(contentToBlocks(content).length, result.blocks.length);
const legacy = articleBlocks(['[IMG|/media/old.webp|توضیح قدیمی]']);
assert.equal(legacy[0].type === 'img' ? legacy[0].caption : null, undefined);

const plain = importPlainArticle('عنوان مقاله\n\nمتن مقدمهٔ بلندتری برای مقاله نوشته شده است و توضیحات لازم را شامل می‌شود.\n\nمزایای اصلی\n\nاین بخش دلایل استفاده از محصول را با جزئیات بیشتر توضیح می‌دهد.');
assert.equal(plain.title, 'عنوان مقاله');
assert.ok(plain.blocks.some((block) => block.type === 'h2' && block.text === 'مزایای اصلی'));
const table = importPlainArticle('# جدول آزمایشی\n\n| مشخصه | مقدار |\n| --- | --- |\n| ظرفیت | ۱۰۰ |');
assert.equal(table.blocks[0]?.type, 'table');
console.log('Article paste and caption round-trip OK');
