import React from 'react';

function webpFor(src: string): string | null {
  if (src.endsWith(".jpg") || src.endsWith(".jpeg")) return src.replace(/\.jpe?g$/i, ".webp");
  return null;
}

export const LazyHeroImage: React.FC<{ src: string, alt?: string, className?: string, isActive: boolean }> = ({ src, alt, className, isActive }) => {
  const webp = webpFor(src);
  const label = alt && alt.trim() ? alt : "سالن مرغداری تجهیزشده توسط طیوران صنعت پویا";

  return (
    <div
      className={`absolute inset-0 transition-opacity duration-700 ease-out ${isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'} ${className || ''}`}
    >
      <picture>
        {webp ? <source srcSet={webp} type="image/webp" /> : null}
        <img
          src={src}
          alt={label}
          loading={isActive ? "eager" : "lazy"}
          decoding="async"
          fetchPriority={isActive ? "high" : "low"}
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
      </picture>
    </div>
  );
};
