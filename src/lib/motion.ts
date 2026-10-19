import { flushSync } from 'react-dom';

/**
 * Tiny shared motion runtime (no animation library).
 * - [data-reveal] elements get `.is-in` once they enter the viewport (one-shot).
 * - [data-anim] elements toggle `.is-visible` so CSS can pause looping
 *   animations while they are offscreen (animation-play-state).
 * Lazy sections are picked up with a MutationObserver. Hidden reveal states
 * only apply under html.tsp-motion, so content is visible without JS and
 * with prefers-reduced-motion.
 */
const reduced = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let started = false;

export function startMotion() {
  if (started || typeof window === 'undefined' || !('IntersectionObserver' in window)) return;
  started = true;
  const root = document.documentElement;
  const motionOk = !reduced();
  const sda = typeof CSS !== 'undefined' && CSS.supports('animation-timeline: view()');
  if (motionOk) root.classList.add('tsp-motion');
  if (motionOk && sda) root.classList.add('tsp-sda');

  const reveal = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        e.target.classList.add('is-in');
        reveal.unobserve(e.target);
      }
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.12 },
  );
  const anim = new IntersectionObserver(
    (entries) => {
      for (const e of entries) e.target.classList.toggle('is-visible', e.isIntersecting);
    },
    { rootMargin: '80px 0px' },
  );

  const scan = (node: ParentNode) => {
    node.querySelectorAll<HTMLElement>('[data-reveal]:not([data-rv])').forEach((el) => {
      el.dataset.rv = '';
      if (motionOk && !sda) reveal.observe(el);
      else el.classList.add('is-in');
    });
    node.querySelectorAll<HTMLElement>('[data-anim]:not([data-av])').forEach((el) => {
      el.dataset.av = '';
      anim.observe(el);
    });
  };
  scan(document);
  let queued = false;
  new MutationObserver(() => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      scan(document);
    });
  }).observe(document.getElementById('root') || document.body, { childList: true, subtree: true });
}

/** Run a React state update inside a View Transition when supported and motion is allowed. */
export function withViewTransition(update: () => void) {
  const d = document as Document & { startViewTransition?: (cb: () => void) => unknown };
  if (!d.startViewTransition || reduced()) {
    update();
    return;
  }
  d.startViewTransition(() => flushSync(update));
}
