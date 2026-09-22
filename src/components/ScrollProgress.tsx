import React, { useState, useEffect } from 'react';
import { motion, useScroll, useSpring } from 'motion/react';
import { ArrowUp } from '../icons';
import { isLiteDevice } from '../lib/device';

function ScrollProgressUi() {
  const { scrollYProgress } = useScroll();
  const [percentage, setPercentage] = useState(0);
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  useEffect(() => {
    return scrollYProgress.on('change', (latest) => {
      setPercentage(Math.round(latest * 100));
    });
  }, [scrollYProgress]);

  return (
    <motion.div
      className="fixed bottom-6 left-6 sm:bottom-10 sm:left-10 z-[99999] flex items-center justify-center cursor-pointer group"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: percentage > 1 ? 1 : 0, y: percentage > 1 ? 0 : 20, scale: percentage > 1 ? 1 : 0.8 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      title="بازگشت به بالا"
    >
      <div className="absolute inset-0 bg-slate-900/95 rounded-full border border-white/10 shadow-2xl" />
      <svg width="64" height="64" className="transform -rotate-90 relative z-10">
        <circle cx="32" cy="32" r="28" stroke="rgba(255,255,255,0.05)" strokeWidth="2" fill="none" />
        <motion.circle
          cx="32"
          cy="32"
          r="28"
          stroke="#fbbf24"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
          style={{ pathLength: smoothProgress }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-amber-400 z-20">
        <span className="text-[12px] font-black font-mono tracking-tighter mt-0.5">{percentage}</span>
      </div>
      <ArrowUp className="w-5 h-5 absolute opacity-0 group-hover:opacity-100" />
    </motion.div>
  );
}

export const ScrollProgress: React.FC = () => {
  if (isLiteDevice()) return null;
  return <ScrollProgressUi />;
};
