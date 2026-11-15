import React, { useEffect, useId, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, X } from '../icons';
import { LazyImage } from './LazyImage';
import { findServicePage, servicePagePath } from '../data/servicePages';
import { routerTo, t, tr } from '../i18n';

type ServicePreviewProps = {
  slug: string | null;
  icon?: React.ElementType;
  bgImage?: string;
  onClose: () => void;
};

export const ServicePreview: React.FC<ServicePreviewProps> = ({ slug, icon: Icon, bgImage, onClose }) => {
  const page = slug ? findServicePage(slug) : undefined;
  const titleId = useId();
  const panelRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!page) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const mobile = window.matchMedia('(max-width: 1023px)').matches;
    const target = mobile
      ? (document.querySelector('.service-card-shell--active') as HTMLElement | null)
      : panelRef.current;
    target?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: mobile ? 'start' : 'nearest', inline: 'nearest' });
    return () => document.removeEventListener('keydown', onKey);
  }, [page, onClose]);

  if (!page) return null;

  const href = routerTo(servicePagePath(page));
  const intro = page.intro.length > 0 ? page.intro : [page.description];

  return (
    <div className="service-preview-slot">
      <aside
        ref={panelRef}
        id="service-detail-panel"
        role="region"
        aria-labelledby={titleId}
        className="service-preview-page relative overflow-hidden rounded-[2rem] bg-[#001c3d] border border-white/10 shadow-[0_28px_56px_-24px_rgba(0,8,24,0.45)]"
      >
        <div className="relative h-36 sm:h-44 overflow-hidden">
          {bgImage ? (
            <LazyImage
              src={bgImage}
              alt=""
              className="absolute inset-0 h-full w-full"
              imgClassName="service-preview-photo h-full w-full object-cover opacity-55"
              width={960}
              height={420}
            />
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-b from-[#001c3d]/15 via-[#001c3d]/50 to-[#001c3d]" />
          <div className="service-preview-glow pointer-events-none absolute -top-16 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full bg-amber-400/25" />
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 left-4 z-10 grid h-11 w-11 place-items-center rounded-2xl bg-black/35 border border-white/15 text-white hover:bg-black/50"
            aria-label={t("بستن")}
          >
            <X className="w-5 h-5" />
          </button>
          {Icon ? (
            <div className="service-preview-icon absolute bottom-5 right-6 grid h-14 w-14 place-items-center rounded-2xl bg-white/10 border border-amber-400/40 text-amber-400 shadow-[0_0_24px_rgba(251,191,36,0.25)]">
              <Icon className="w-7 h-7" aria-hidden="true" />
            </div>
          ) : null}
        </div>

        <div className="service-preview-body px-6 sm:px-7 pb-7 pt-2">
          <p id={titleId} className="text-2xl font-black text-white leading-snug">
            {tr(page.title)}
          </p>
          <span className="service-preview-rule mt-3 mb-5 block h-[2px] w-14 rounded-full bg-amber-400" aria-hidden="true" />
          {intro.map((paragraph) => (
            <p key={paragraph} className="service-preview-copy text-sm sm:text-[0.95rem] text-slate-200/90 leading-relaxed font-medium mb-3 last:mb-0">
              {tr(paragraph)}
            </p>
          ))}
          {page.items.length > 0 ? (
            <>
              <p className="service-preview-copy mt-5 mb-3 text-xs font-black tracking-wide text-amber-300/90">{tr(page.listHeading)}</p>
              <ul className="space-y-2.5">
                {page.items.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-slate-100/90 leading-relaxed">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" aria-hidden="true" />
                    <span>{tr(item)}</span>
                  </li>
                ))}
              </ul>
            </>
          ) : null}

          <Link
            to={href}
            className="service-preview-cta mt-7 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-amber-400 px-6 py-3.5 text-[#001c3d] font-black hover:bg-amber-300"
          >
            {t("مطالعه بیشتر")}
            <ArrowLeft className="h-5 w-5 ltr:-scale-x-100" strokeWidth={2.4} />
          </Link>
        </div>
      </aside>
    </div>
  );
};
