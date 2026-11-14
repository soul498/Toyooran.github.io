import React from 'react';
import { HOME_HERO_KEY, HOME_HERO_MOBILE_PHOTO, HOME_HERO_PHOTO, sitePhotoSrc, sitePhotoSrcSet } from '../data/sitePhotos';

import { t, tr } from '../i18n';
function webpFor(src: string): string | null {
  if (src.endsWith(".jpg") || src.endsWith(".jpeg")) return src.replace(/\.jpe?g$/i, ".webp");
  if (src.endsWith(".webp")) return src;
  return null;
}

/** Breakpoint between the mobile crop and the landscape photo; keep equal to the preload media in server/seo.ts. */
export const HERO_MOBILE_MEDIA = "(max-width: 767px)";

export const LazyHeroImage: React.FC<{ src: string, alt?: string, className?: string, isActive: boolean }> = ({ src, alt, className, isActive }) => {
  const imgProps = {
    loading: (isActive ? "eager" : "lazy") as "eager" | "lazy",
    decoding: (isActive ? "sync" : "async") as "sync" | "async",
    fetchPriority: (isActive ? "high" : "low") as "high" | "low",
    className: "absolute inset-0 w-full h-full object-cover object-center",
  };
  const wrapperClass = `absolute inset-0 ${isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'} ${className || ''}`;

  if (src === HOME_HERO_KEY) {
    // Home hero (site photo 05): 4:5 crop centred on the feeder line on phones, landscape above 767px.
    return (
      <div className={wrapperClass}>
        <picture>
          <source media={HERO_MOBILE_MEDIA} type="image/avif" srcSet={sitePhotoSrcSet(HOME_HERO_MOBILE_PHOTO, 'avif')} sizes="100vw" />
          <source media={HERO_MOBILE_MEDIA} type="image/webp" srcSet={sitePhotoSrcSet(HOME_HERO_MOBILE_PHOTO, 'webp')} sizes="100vw" />
          <source type="image/avif" srcSet={sitePhotoSrcSet(HOME_HERO_PHOTO, 'avif')} sizes="100vw" />
          <source type="image/webp" srcSet={sitePhotoSrcSet(HOME_HERO_PHOTO, 'webp')} sizes="100vw" />
          <img
            src={sitePhotoSrc(HOME_HERO_PHOTO)}
            alt={tr(HOME_HERO_PHOTO.alt)}
            width={HOME_HERO_PHOTO.width}
            height={HOME_HERO_PHOTO.height}
            {...imgProps}
          />
        </picture>
      </div>
    );
  }

  const webp = webpFor(src);
  const mobileSrcSet = src.includes("hero-final-1")
    ? "/images/hero-final-1-480.webp 480w, /images/hero-final-1-800.webp 800w, /images/hero-final-1.webp 1400w"
    : null;
  const mobileWebp = src.includes("hero-final-1") ? "/images/hero-final-1-480.webp" : null;
  const label = alt !== undefined ? alt : t("سالن مرغداری تجهیزشده توسط طیوران صنعت پویا");

  return (
    <div className={wrapperClass}>
      <picture>
        {mobileSrcSet ? <source srcSet={mobileSrcSet} sizes="100vw" type="image/webp" /> : null}
        {webp && !mobileWebp ? <source srcSet={webp} type="image/webp" /> : null}
        <img
          src={mobileWebp || webp || src}
          alt={label}
          width={1400}
          height={1750}
          {...imgProps}
        />
      </picture>
    </div>
  );
};
