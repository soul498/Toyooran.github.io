/**
 * Photos waiting for a real replacement (e.g. the Pouya butterfly feeder). Every public render of an
 * article swaps such an image for a neutral «عکس به زودی اضافه می‌شود» placeholder. Stored CMS data is
 * left untouched (the admin still sees and edits the original), and the image files stay in the repo.
 */
export const PHOTO_PENDING_SRC = '/images/placeholders/photo-coming-soon.webp';
export const PHOTO_PENDING_ALT = 'عکس به زودی اضافه می‌شود';

/** Pouya butterfly feeder photos (cover + inline image of «introduction-to-pouya-butterfly-feeder»). */
const PENDING_PATH_RE = /^\/images\/article_feeder_[^/]*$/i;

const pathOf = (src: string) =>
  src.trim().replace(/^https?:\/\/(www\.)?toyooran\.com/i, '').replace(/[?#].*$/, '');

export const isPendingPhoto = (src?: string | null): boolean => Boolean(src && PENDING_PATH_RE.test(pathOf(src)));

/** True for the placeholder itself, so share images (og:image, JSON-LD) can fall back to the site default. */
export const isPhotoPlaceholder = (src?: string | null): boolean => Boolean(src && pathOf(src) === PHOTO_PENDING_SRC);

const IMG_TOKEN_RE = /\[IMG\|([^|\]]+)\|[^\]]*\]/g;

function replaceInLine(line: string): string {
  if (typeof line !== 'string' || !line.includes('/images/')) return line;
  return line.replace(IMG_TOKEN_RE, (token, src: string) => (isPendingPhoto(src) ? `[IMG|${PHOTO_PENDING_SRC}|${PHOTO_PENDING_ALT}]` : token));
}

/** Public copy of an article with pending photos replaced; returns the same object when nothing changes. */
export function withPendingPhotos<T extends { image?: string; imageAlt?: string; content?: string[] }>(article: T): T {
  if (!article) return article;
  const coverPending = isPendingPhoto(article.image);
  const content = Array.isArray(article.content) ? article.content.map(replaceInLine) : article.content;
  const contentChanged = Array.isArray(article.content) && content!.some((line, i) => line !== article.content![i]);
  if (!coverPending && !contentChanged) return article;
  return {
    ...article,
    ...(coverPending ? { image: PHOTO_PENDING_SRC, imageAlt: PHOTO_PENDING_ALT } : {}),
    ...(contentChanged ? { content } : {}),
  };
}
