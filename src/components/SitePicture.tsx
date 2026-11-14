import React from 'react';
import { sitePhotoSrc, sitePhotoSrcSet, type SitePhoto } from '../data/sitePhotos';
import { tr } from '../i18n';

/** Responsive AVIF/WebP <picture> for a photo in src/data/sitePhotos.ts. Lazy unless `eager`. */
export const SitePicture: React.FC<{
  photo: SitePhoto;
  sizes: string;
  className?: string;
  imgClassName?: string;
  eager?: boolean;
}> = ({ photo, sizes, className, imgClassName, eager = false }) => (
  <picture className={className}>
    <source type="image/avif" srcSet={sitePhotoSrcSet(photo, 'avif')} sizes={sizes} />
    <source type="image/webp" srcSet={sitePhotoSrcSet(photo, 'webp')} sizes={sizes} />
    <img
      src={sitePhotoSrc(photo)}
      alt={tr(photo.alt)}
      width={photo.width}
      height={photo.height}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      className={imgClassName || 'w-full h-full object-cover'}
    />
  </picture>
);
