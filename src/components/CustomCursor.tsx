import React, { useEffect, useRef, useState } from 'react';
import { isFinePointer } from '../lib/device';

/** Light desktop cursor: amber dot + blink ring. Off on touch. */
export const CustomCursor: React.FC = () => {
  const [enabled, setEnabled] = useState(false);
  const [hovering, setHovering] = useState(false);
  const pos = useRef({ x: 0, y: 0 });
  const el = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isFinePointer()) return;
    setEnabled(true);
    let raf = 0;
    const tick = () => {
      if (el.current) {
        el.current.style.transform = `translate3d(${pos.current.x - 16}px, ${pos.current.y - 16}px, 0)`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    const onMove = (e: MouseEvent) => {
      pos.current = { x: e.clientX, y: e.clientY };
    };
    const onOver = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      setHovering(Boolean(t.closest('button, a, .cursor-pointer')));
    };
    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('mouseover', onOver, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseover', onOver);
    };
  }, []);

  if (!enabled) return null;

  return (
    <div
      ref={el}
      className="fixed top-0 left-0 z-[9999] w-8 h-8 pointer-events-none hidden md:block mix-blend-difference"
      aria-hidden
    >
      <span className={`absolute inset-0 rounded-full border border-amber-400/70 ${hovering ? 'scale-150 opacity-40' : 'animate-ping opacity-50'}`} />
      <span className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-400 ${hovering ? 'w-3 h-3' : 'w-2 h-2'}`} />
    </div>
  );
};
