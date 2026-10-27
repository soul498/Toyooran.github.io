import { withMediaVersion } from '../lib/mediaUrl';

/**
 * Approved product photos (TSPK designer set, 16:9, product centred so cover crops are safe).
 * The Pouya butterfly feeder article still stores its old photo in the CMS; public renders swap it
 * for the approved photos here, so the stored record (and the admin view of it) stays untouched.
 */
export type ProductPhoto = { src: string; srcSet: string; alt: string; width: number; height: number };

const photo = (name: string, alt: string): ProductPhoto => ({
  src: withMediaVersion(`/images/photos/${name}-1600.webp`),
  srcSet: [800, 1600].map((w) => `${withMediaVersion(`/images/photos/${name}-${w}.webp`)} ${w}w`).join(', '),
  alt,
  width: 1600,
  height: 900,
});

export const FEEDER_PHOTO = photo('feeder-pouya-trough', 'دانخوری پروانه‌ای پویا، نمای نزدیک کاسه‌ها و دان');
export const FEEDER_HALL_PHOTO = photo('feeder-pouya-hall-installation', 'نصب دانخوری پروانه‌ای پویا در سالن مرغداری');
export const HEATER_PHOTO = photo('jet-heater-imachine', 'جت هیتر IMACHINE، نمای کامل');

/** Old feeder photo of «introduction-to-pouya-butterfly-feeder» (cover + inline). */
const OLD_FEEDER_RE = /^\/images\/article_feeder_[^/]*$/i;
const pathOf = (src: string) =>
  src.trim().replace(/^https?:\/\/(www\.)?toyooran\.com/i, '').replace(/[?#].*$/, '');
const isOldFeederPhoto = (src?: string | null): boolean => Boolean(src && OLD_FEEDER_RE.test(pathOf(src)));

const IMG_TOKEN_RE = /\[IMG\|([^|\]]+)\|[^\]]*\]/g;

/** Public copy of an article with the old feeder photo replaced; same object when nothing changes. */
export function withProductPhotos<T extends { image?: string; imageAlt?: string; content?: string[] }>(article: T): T {
  if (!article) return article;
  const coverOld = isOldFeederPhoto(article.image);
  const content = Array.isArray(article.content)
    ? article.content.map((line) =>
        typeof line === 'string' && line.includes('/images/')
          ? line.replace(IMG_TOKEN_RE, (token, src: string) =>
              // Inline slot gets the in-situ shot so it does not repeat the cover.
              isOldFeederPhoto(src) ? `[IMG|${FEEDER_HALL_PHOTO.src}|${FEEDER_HALL_PHOTO.alt}]` : token,
            )
          : line,
      )
    : article.content;
  const contentChanged = Array.isArray(article.content) && content!.some((line, i) => line !== article.content![i]);
  if (!coverOld && !contentChanged) return article;
  return {
    ...article,
    ...(coverOld ? { image: FEEDER_PHOTO.src, imageAlt: FEEDER_PHOTO.alt } : {}),
    ...(contentChanged ? { content } : {}),
  };
}
