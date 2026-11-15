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
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!page) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', onKey);
    };
  }, [page, onClose]);

  if (!page) return null;

  const href = routerTo(servicePagePath(page));
  const items = page.items.slice(0, 5);

  return (
    <div
      className="service-preview-backdrop fixed inset-0 z-[80] flex items-end sm:items-center justify-center p-0 sm:p-6"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="service-preview-panel relative w-full sm:max-w-2xl max-h-[92vh] overflow-hidden rounded-t-[2rem] sm:rounded-[2rem] bg-[#001c3d] border border-white/10 shadow-[0_40px_80px_-24px_rgba(0,8,24,0.7)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="relative h-40 sm:h-52 overflow-hidden">
          {bgImage ? (
            <LazyImage
              src={bgImage}
              alt=""
              className="absolute inset-0 h-full w-full"
              imgClassName="h-full w-full object-cover opacity-60"
              width={960}
              height={420}
            />
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-b from-[#001c3d]/20 via-[#001c3d]/55 to-[#001c3d]" />
          <div className="service-preview-glow pointer-events-none absolute -top-16 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full bg-amber-400/25" />
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="absolute top-4 left-4 z-10 grid h-11 w-11 place-items-center rounded-2xl bg-black/35 border border-white/15 text-white hover:bg-black/50"
            aria-label={t("بستن")}
          >
            <X className="w-5 h-5" />
          </button>
          {Icon ? (
            <div className="absolute bottom-5 right-6 grid h-14 w-14 place-items-center rounded-2xl bg-white/10 border border-amber-400/40 text-amber-400 shadow-[0_0_24px_rgba(251,191,36,0.25)]">
              <Icon className="w-7 h-7" aria-hidden="true" />
            </div>
          ) : null}
        </div>

        <div className="overflow-y-auto max-h-[calc(92vh-10rem)] px-6 sm:px-8 pb-7 pt-2">
          <p id={titleId} className="text-2xl sm:text-3xl font-black text-white leading-snug">
            {tr(page.title)}
          </p>
          <span className="mt-3 mb-5 block h-[2px] w-14 rounded-full bg-amber-400" aria-hidden="true" />
          <p className="text-sm sm:text-base text-slate-200/90 leading-relaxed font-medium">
            {tr(page.description)}
          </p>
          {items.length > 0 ? (
            <ul className="mt-5 space-y-2.5">
              {items.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-slate-100/90 leading-relaxed">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" aria-hidden="true" />
                  <span>{tr(item)}</span>
                </li>
              ))}
            </ul>
          ) : null}

          <Link
            to={href}
            className="service-preview-cta mt-7 inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-2xl bg-amber-400 px-6 py-3.5 text-[#001c3d] font-black hover:bg-amber-300"
          >
            {t("مطالعه بیشتر")}
            <ArrowLeft className="h-5 w-5 ltr:-scale-x-100" strokeWidth={2.4} />
          </Link>
        </div>
      </div>
    </div>
  );
};
