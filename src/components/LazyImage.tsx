import React, { useState, useEffect, useRef } from 'react';

export const LazyImage = ({ src, alt, className, imgClassName, fallbackSrc = '/images/product-placeholder.svg' }: { src: string, alt?: string, className?: string, imgClassName?: string, fallbackSrc?: string }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);
  const imgRef = useRef<HTMLImageElement>(null);

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
      <img
        ref={imgRef}
        src={currentSrc}
        alt={alt !== undefined ? alt : 'تجهیزات مرغداری طیوران صنعت پویا'}
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
    </div>
  );
};
