import React, { useState, useEffect, useRef } from 'react';
import { ArrowUp } from '../icons';
import { isLiteDevice } from '../lib/device';

const scrollTimelineSupported = () =>
  typeof CSS !== 'undefined' && CSS.supports('animation-timeline: scroll()');

function ScrollProgressUi() {
  // React state flips only when the button crosses the 1% threshold; the ring itself is
  // driven by a CSS scroll timeline (or a CSS variable written in rAF where unsupported).
  const [visible, setVisible] = useState(false);
  const ringRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const native = scrollTimelineSupported();
    let frame = 0;
    const update = () => {
      frame = 0;
      const el = document.documentElement;
      const max = el.scrollHeight - el.clientHeight;
      const p = max > 0 ? el.scrollTop / max : 0;
      setVisible(p > 0.01);
      if (!native) ringRef.current?.style.setProperty('--p', p.toFixed(4));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <button
      type="button"
      className={`fixed bottom-6 left-6 sm:bottom-10 sm:left-10 z-[99999] w-12 h-12 rounded-full bg-slate-900 text-amber-400 border border-white/10 shadow-lg flex items-center justify-center ${visible ? '' : 'hidden'}`}
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="بازگشت به بالا"
    >
      <span ref={ringRef} className="tsp-progress pointer-events-none" aria-hidden="true">
        <span className="tsp-half tsp-half-r"><span className="tsp-arc" /></span>
        <span className="tsp-half tsp-half-l"><span className="tsp-arc" /></span>
      </span>
      <ArrowUp className="w-5 h-5 relative" />
    </button>
  );
}

export const ScrollProgress: React.FC = () => {
  if (isLiteDevice()) return null;
  return <ScrollProgressUi />;
};
