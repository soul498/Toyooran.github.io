import React, { useState, useEffect, useRef } from 'react';

function webpFor(src: string): string | null {
  if (src.endsWith('.jpg') || src.endsWith('.jpeg')) return src.replace(/\.jpe?g$/i, '.webp');
  if (src.endsWith('.webp')) return src;
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
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);
  const imgRef = useRef<HTMLImageElement>(null);
  const webp = currentSrc === fallbackSrc ? null : webpFor(currentSrc);

  useEffect(() => {
    setCurrentSrc(src);
    setIsLoaded(false);
  }, [src]);

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
