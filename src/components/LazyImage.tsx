import React, { useState, useEffect, useRef } from 'react';
import { withMediaVersion } from '../lib/mediaUrl';

function webpFor(src: string): string | null {
  const q = src.search(/[?#]/);
  const path = q === -1 ? src : src.slice(0, q);
  const query = q === -1 ? "" : src.slice(q);
  if (/\.jpe?g$/i.test(path)) return `${path.replace(/\.jpe?g$/i, ".webp")}${query}`;
  if (/\.webp$/i.test(path)) return src;
  return null;
}

export const LazyImage = ({
  src,
  alt,
  className,
  imgClassName,
  fallbackSrc = '/images/product-placeholder.svg',
  width = 800,
  height = 600,
}: {
  src: string;
  alt?: string;
  className?: string;
  imgClassName?: string;
  fallbackSrc?: string;
  width?: number;
  height?: number;
}) => {
  const versionedSrc = withMediaVersion(src);
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(versionedSrc);
  const imgRef = useRef<HTMLImageElement>(null);
  const webp = currentSrc === fallbackSrc ? null : webpFor(currentSrc);

  useEffect(() => {
    setCurrentSrc(versionedSrc);
    setIsLoaded(false);
  }, [versionedSrc]);

  useEffect(() => {
    if (imgRef.current?.complete && imgRef.current?.naturalWidth > 0) {
      setIsLoaded(true);
    }
  }, [currentSrc]);

  return (
    <div className={`relative overflow-hidden bg-slate-100 ${className || ''}`}>
      <picture>
        {webp ? <source srcSet={webp} type="image/webp" /> : null}
        <img
          ref={imgRef}
          src={webp || currentSrc}
          alt={alt !== undefined ? alt : 'تجهیزات مرغداری طیوران صنعت پویا'}
          width={width}
          height={height}
          loading="lazy"
          decoding="async"
          onLoad={() => setIsLoaded(true)}
          onError={() => {
            if (currentSrc !== fallbackSrc) {
              setCurrentSrc(fallbackSrc);
            } else {
              setIsLoaded(true);
            }
          }}
          className={`relative z-10 ${imgClassName || 'w-full h-full object-cover'} ${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
        />
      </picture>
    </div>
  );
};
