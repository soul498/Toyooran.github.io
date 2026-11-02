import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const MAX_MEDIA_BYTES = 8 * 1024 * 1024;

/** Media lives beside the persistent CMS database rather than inside a disposable
 * Docker layer. It is still served by this application at /media/ and survives
 * every code deployment. */
export function mediaDirectory(): string {
  const configured = (process.env.MEDIA_DIR || '').trim();
  const base = configured || path.join(path.resolve(process.env.DATA_DIR || './data'), 'media');
  fs.mkdirSync(base, { recursive: true });
  return path.resolve(base);
}

type DetectedImage = { ext: 'jpg' | 'png' | 'webp' | 'avif'; mime: string };

function detectImage(bytes: Buffer): DetectedImage | null {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return { ext: 'jpg', mime: 'image/jpeg' };
  if (bytes.length >= 8 && bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return { ext: 'png', mime: 'image/png' };
  if (bytes.length >= 12 && bytes.subarray(0, 4).toString('ascii') === 'RIFF' && bytes.subarray(8, 12).toString('ascii') === 'WEBP') return { ext: 'webp', mime: 'image/webp' };
  if (bytes.length >= 12 && bytes.subarray(4, 8).toString('ascii') === 'ftyp' && /^(avif|avis)$/i.test(bytes.subarray(8, 12).toString('ascii'))) return { ext: 'avif', mime: 'image/avif' };
  return null;
}

export function saveImageDataUrl(dataUrl: string): { filename: string; url: string; bytes: number; mime: string } {
  const match = /^data:image\/(?:jpeg|jpg|png|webp|avif);base64,([a-z0-9+/=\r\n]+)$/i.exec(dataUrl.trim());
  if (!match) throw new Error('فرمت فایل تصویر مجاز نیست. فقط JPEG، PNG، WebP و AVIF پشتیبانی می‌شوند.');
  const source = match[1].replace(/\s/g, '');
  if (!source || source.length > Math.ceil(MAX_MEDIA_BYTES * 1.4)) throw new Error('اندازهٔ تصویر بیش از حد مجاز است.');
  const bytes = Buffer.from(source, 'base64');
  if (!bytes.length || bytes.length > MAX_MEDIA_BYTES) throw new Error('اندازهٔ تصویر باید حداکثر ۸ مگابایت باشد.');
  const detected = detectImage(bytes);
  if (!detected) throw new Error('محتوای فایل با یک تصویر معتبر مطابقت ندارد.');

  const filename = `media-${Date.now()}-${crypto.randomBytes(12).toString('hex')}.${detected.ext}`;
  fs.writeFileSync(path.join(mediaDirectory(), filename), bytes, { flag: 'wx', mode: 0o640 });
  return { filename, url: `/media/${filename}`, bytes: bytes.length, mime: detected.mime };
}

export function deleteStoredImage(filename: string): boolean {
  if (!/^media-\d+-[a-f0-9]{24}\.(?:jpg|png|webp|avif)$/.test(filename)) throw new Error('نام فایل نامعتبر است.');
  const root = mediaDirectory();
  const target = path.join(root, filename);
  if (!target.startsWith(`${root}${path.sep}`)) throw new Error('مسیر نامعتبر است.');
  try {
    fs.unlinkSync(target);
    return true;
  } catch (error: any) {
    if (error?.code === 'ENOENT') return false;
    throw error;
  }
}
