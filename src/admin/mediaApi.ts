import type { MediaItem } from '../types';

function asDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('خواندن فایل ناموفق بود.'));
    reader.onload = () => typeof reader.result === 'string' ? resolve(reader.result) : reject(new Error('فرمت فایل نامعتبر است.'));
    reader.readAsDataURL(file);
  });
}

async function csrfToken(): Promise<string> {
  const response = await fetch('/api/auth/csrf', { credentials: 'include' });
  const result = await response.json().catch(() => ({}));
  return String(result.token || '');
}

export async function uploadImageFile(file: File, title?: string): Promise<MediaItem> {
  if (!/^image\/(jpeg|png|webp|avif)$/i.test(file.type)) throw new Error('فقط JPEG، PNG، WebP و AVIF قابل آپلود هستند.');
  if (file.size > 8 * 1024 * 1024) throw new Error('اندازهٔ تصویر باید حداکثر ۸ مگابایت باشد.');
  const [dataUrl, csrf] = await Promise.all([asDataUrl(file), csrfToken()]);
  const response = await fetch('/api/admin/media/upload', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrf },
    body: JSON.stringify({ dataUrl, title: (title || file.name.replace(/\.[^.]+$/, '') || 'تصویر جدید').slice(0, 180) }),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok || !result.media) throw new Error(result.error || 'آپلود تصویر ناموفق بود.');
  return result.media as MediaItem;
}

export async function deleteStoredImage(url: string): Promise<void> {
  const parsed = new URL(url, window.location.origin);
  if (!parsed.pathname.startsWith('/media/')) return;
  const filename = parsed.pathname.slice('/media/'.length);
  if (!filename) return;
  const csrf = await csrfToken();
  const response = await fetch('/api/admin/media/' + encodeURIComponent(filename), {
    method: 'DELETE',
    credentials: 'include',
    headers: { 'X-CSRF-Token': csrf },
  });
  if (!response.ok) {
    const result = await response.json().catch(() => ({}));
    throw new Error(result.error || 'حذف فایل ناموفق بود.');
  }
}
