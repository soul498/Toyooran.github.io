import React from 'react';

function webpFor(src: string): string | null {
  if (src.endsWith(".jpg") || src.endsWith(".jpeg")) return src.replace(/\.jpe?g$/i, ".webp");
  if (src.endsWith(".webp")) return src;
  return null;
}

export const LazyHeroImage: React.FC<{ src: string, alt?: string, className?: string, isActive: boolean, priority?: boolean }> = ({ src, alt, className, isActive, priority = isActive }) => {
  const webp = webpFor(src);
  const mobileSrcSet = src.includes("hero-final-1")
    ? "/images/hero-final-1-480.webp 480w, /images/hero-final-1-800.webp 800w, /images/hero-final-1.webp 1400w"
    : null;
  const mobileWebp = src.includes("hero-final-1") ? "/images/hero-final-1-480.webp" : null;
  const label = alt !== undefined ? alt : "سالن مرغداری تجهیزشده توسط طیوران صنعت پویا";

  return (
    <div
      className={`absolute inset-0 ${isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'} ${className || ''}`}
    >
      <picture>
        {mobileSrcSet ? <source srcSet={mobileSrcSet} sizes="100vw" type="image/webp" /> : null}
        {webp && !mobileWebp ? <source srcSet={webp} type="image/webp" /> : null}
        <img
          src={mobileWebp || webp || src}
          alt={label}
          width={1400}
          height={1750}
          loading={priority ? "eager" : "lazy"}
          decoding={priority ? "sync" : "async"}
          fetchPriority={priority ? "high" : "low"}
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
      </picture>
    </div>
  );
};
