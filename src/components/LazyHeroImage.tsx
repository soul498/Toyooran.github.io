import React, { useState } from 'react';
import { motion } from 'motion/react';

function webpFor(src: string): string | null {
  if (src.endsWith(".jpg") || src.endsWith(".jpeg")) return src.replace(/\.jpe?g$/i, ".webp");
  return null;
}

export const LazyHeroImage: React.FC<{ src: string, alt?: string, className?: string, isActive: boolean }> = ({ src, alt, className, isActive }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const webp = webpFor(src);
  const label = alt && alt.trim() ? alt : "سالن مرغداری تجهیزشده توسط طیوران صنعت پویا";

  return (
    <div 
      className={`absolute inset-0 transition-opacity duration-1500 ease-in-out ${isActive ? 'opacity-100 z-10' : 'opacity-0 z-0'} ${className || ''}`}
    >
      <picture>
        {webp ? <source srcSet={webp} type="image/webp" /> : null}
        <motion.img
          src={src}
          alt={label}
          loading={isActive ? "eager" : "lazy"}
          fetchPriority={isActive ? "high" : "low"}
          onLoad={() => setIsLoaded(true)}
          initial={{ scale: 1.02 }}
          animate={{ 
            scale: isActive ? 1 : 1.02,
            filter: isLoaded ? 'blur(0px)' : 'blur(6px)'
          }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
      </picture>
    </div>
  );
};
