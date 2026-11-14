import React, { useEffect, useRef, useState } from 'react';
import { LazyImage } from './LazyImage';
import { withMediaVersion } from '../lib/mediaUrl';

/** Catalog photos /images/products/TS-NNN.webp have 4:3 card thumbnails in /images/products/thumb/ (400/800w, AVIF + WebP). */
const CATALOG_PHOTO_RE = /^\/images\/products\/(TS-\d+)\.webp(?:[?#].*)?$/i;

export function productThumbBase(src?: string | null): string | null {
  const m = src ? CATALOG_PHOTO_RE.exec(src.trim()) : null;
  return m ? `/images/products/thumb/${m[1].toUpperCase()}` : null;
}

const srcSet = (base: string, ext: 'avif' | 'webp') =>
  [400, 800].map((w) => `${withMediaVersion(`${base}-${w}.${ext}`)} ${w}w`).join(', ');

/**
 * Product card thumbnail (catalog grid, related products). Uses the small thumbnails when the product
 * has a catalog photo; anything else (CMS uploads, placeholders) falls back to LazyImage with the full file.
 * Full-size images stay on the product detail page.
 */
export const ProductThumb: React.FC<{
  src: string;
  alt: string;
  sizes: string;
  className?: string;
  eager?: boolean;
}> = ({ src, alt, sizes, className = 'w-full h-full', eager = false }) => {
  const base = productThumbBase(src);
  const imgRef = useRef<HTMLImageElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    if (imgRef.current?.complete && imgRef.current.naturalWidth > 0) setLoaded(true);
  }, [base]);

  if (!base || failed) {
    return <LazyImage src={src} alt={alt} className={className} imgClassName="w-full h-full object-cover" width={800} height={600} />;
  }
  return (
    <picture className={`block relative overflow-hidden bg-slate-100 ${className}`}>
      <source type="image/avif" srcSet={srcSet(base, 'avif')} sizes={sizes} />
      <source type="image/webp" srcSet={srcSet(base, 'webp')} sizes={sizes} />
      <img
        ref={imgRef}
        src={withMediaVersion(`${base}-800.webp`)}
        alt={alt}
        width={800}
        height={600}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={() => setFailed(true)}
        className={`w-full h-full object-cover transition-opacity duration-200 ${loaded ? 'opacity-100' : 'opacity-0'}`}
      />
    </picture>
  );
};
