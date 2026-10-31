import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { LazyImage } from '../LazyImage';
import { RichInline } from '../RichBlocks';
import { categoryIntro, publicProductPath } from '../../seo/resolveSeo';
import { relatedInCategory } from '../../seo/internalLinks';
import { withMediaVersion } from '../../lib/mediaUrl';
import { OFFICE_PHONE_DISPLAY, OFFICE_PHONE_LABEL, OFFICE_PHONE_TEL, SALES_PHONE_DISPLAY, SALES_PHONE_TEL } from '../../data/contact';
import type { Article, Product, ProductSpec } from '../../types';
import './product-detail.css';

/**
 * Product page body (marketplace-style layout, design 31 Oct 2026): gallery | title + key specs | sticky
 * inquiry box, sticky anchor tabs, sections, related products. Shared by every product; a section with
 * no data for a product is not rendered (no placeholders).
 */

const CATALOG_PDF = '/TSPK_catalog.pdf';
const PLACEHOLDER_RE = /product-placeholder/i;

type IconName =
  | 'zoom' | 'flame' | 'shield' | 'cog' | 'chip' | 'eye' | 'temp' | 'hang' | 'bird' | 'barn' | 'leaf' | 'factory'
  | 'phone' | 'doc' | 'award' | 'check' | 'chat' | 'left' | 'info' | 'book' | 'layers' | 'drop' | 'wave' | 'box';

const PATHS: Record<IconName, React.ReactNode> = {
  zoom: <><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5M11 8v6M8 11h6" /></>,
  flame: <path d="M12 22a7 7 0 0 0 7-7c0-4-3-6-4-10-2 2-3 4-3 6-1-1-2-2-2-4-2 2-5 5-5 8a7 7 0 0 0 7 7z" />,
  shield: <path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z" />,
  cog: <><circle cx="12" cy="12" r="3" /><path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" /></>,
  chip: <><rect x="6" y="6" width="12" height="12" rx="2" /><path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4" /></>,
  eye: <><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></>,
  temp: <path d="M14 14.8V4a2 2 0 0 0-4 0v10.8a4 4 0 1 0 4 0z" />,
  hang: <><path d="M12 2v5M5 7h14l-2 10H7z" /><path d="M8 21h8" /></>,
  bird: <><path d="M16 7h.01M3.4 18H12a8 8 0 0 0 8-8V7a4 4 0 0 0-7.3-2.2L2 20" /><path d="m20 7 2 .5-2 .5" /></>,
  barn: <><path d="M3 21V10l9-6 9 6v11z" /><path d="M9 21v-6h6v6" /></>,
  leaf: <><path d="M11 20A7 7 0 0 1 4 13c0-6 6-9 16-9 0 10-3 16-9 16z" /><path d="M4 21c3-6 7-9 12-11" /></>,
  factory: <><path d="M2 21V10l6 4V10l6 4V6l8 3v12z" /><path d="M6 17h2M11 17h2M16 17h2" /></>,
  phone: <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z" />,
  doc: <><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" /><path d="M14 3v6h6M12 12v6M9 15l3 3 3-3" /></>,
  award: <><circle cx="12" cy="9" r="6" /><path d="m8.5 14-1.5 8 5-3 5 3-1.5-8" /></>,
  check: <path d="M20 6 9 17l-5-5" />,
  chat: <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z" />,
  left: <path d="m15 18-6-6 6-6" />,
  info: <><circle cx="12" cy="12" r="9" /><path d="M12 11v6M12 7.5v.01" /></>,
  book: <><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5z" /><path d="M4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5" /></>,
  layers: <><path d="m12 3 9 5-9 5-9-5z" /><path d="m3 13 9 5 9-5" /></>,
  drop: <path d="M12 2.7S5 10 5 15a7 7 0 0 0 14 0c0-5-7-12.3-7-12.3z" />,
  wave: <path d="M2 12c2-3 4-3 6 0s4 3 6 0 4-3 6 0M2 18c2-3 4-3 6 0s4 3 6 0 4-3 6 0M2 6c2-3 4-3 6 0s4 3 6 0 4-3 6 0" />,
  box: <><path d="M21 8 12 3 3 8v8l9 5 9-5z" /><path d="m3 8 9 5 9-5M12 13v8" /></>,
};

const Icon: React.FC<{ name: IconName; className?: string }> = ({ name, className }) => (
  <svg className={`pd-ic ${className || ''}`} viewBox="0 0 24 24" aria-hidden="true" focusable="false">{PATHS[name]}</svg>
);

/** Feature icon by keyword; neutral check mark when nothing matches. */
function featureIcon(text: string): IconName {
  const rules: [RegExp, IconName][] = [
    [/شعله‌پخش|مشعل|احتراق/, 'flame'],
    [/بدنه|استنلس|استیل|گالوانیزه|ضدزنگ|مقاوم/, 'shield'],
    [/پانچ|ماشین|موتور|گیربکس|پروانه|پره/, 'cog'],
    [/برد|الکترونیک|تابلو|کنترلر|هوشمند/, 'chip'],
    [/نظارت|فتوسل|سنسور|یونیزاسیون/, 'eye'],
    [/ترموستات|دما|حرارت|گرمایش/, 'temp'],
    [/نصب|آویز|پرتابل/, 'hang'],
    [/آب|شستشو|شست‌وشو/, 'drop'],
    [/هوا|تهویه|هوادهی/, 'wave'],
    [/دان|خوراک|تغذیه/, 'box'],
  ];
  return rules.find(([re]) => re.test(text))?.[1] || 'check';
}

function applicationIcon(text: string): IconName {
  if (/گلخانه/.test(text)) return 'leaf';
  if (/طیور|مرغ|جوجه|پرنده/.test(text)) return 'bird';
  if (/دام|گاو|گوسفند/.test(text)) return 'barn';
  if (/صنعتی|کارگاه|سوله|کارخانه/.test(text)) return 'factory';
  return 'layers';
}

const hasRealImage = (p: Product) => Boolean(p.image && !PLACEHOLDER_RE.test(p.image));

/** Larger file of the same approved photo for the zoom view (`-800.webp` → `-1600/1536.webp`), else as is. */
/** True once the element nears the viewport, so below-the-fold card photos
 * (full-size files) don't compete with the main product photo for bandwidth. */
function useNearViewport<T extends Element>(): [(el: T | null) => void, boolean] {
  const [el, setEl] = useState<T | null>(null);
  const [near, setNear] = useState(false);
  useEffect(() => {
    if (!el || near) return;
    if (typeof IntersectionObserver === 'undefined') { setNear(true); return; }
    const io = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) { setNear(true); io.disconnect(); } }, { rootMargin: '200px 0px' });
    io.observe(el);
    return () => io.disconnect();
  }, [el, near]);
  return [setEl, near];
}

function zoomSrc(src: string): string {
  if (/jet-heater-v2-800\.webp$/.test(src)) return src.replace(/-800\.webp$/, '-1536.webp');
  if (/\/images\/photos\/.+-800\.webp$/.test(src)) return src.replace(/-800\.webp$/, '-1600.webp');
  return src;
}

type Tab = { id: string; label: string };

export const ProductDetail: React.FC<{ product: Product; products: Product[]; articles: Article[] }> = ({ product, products, articles }) => {
  const gallery = useMemo(() => {
    const list = [product.image, ...(product.gallery || [])].filter((src): src is string => Boolean(src) && !PLACEHOLDER_RE.test(String(src)));
    return Array.from(new Set(list));
  }, [product]);
  const [active, setActive] = useState(0);
  useEffect(() => setActive(0), [product.id]);
  const mainSrc = gallery[active] || product.image;

  const specs = product.specs || [];
  const keySpecs = (product.keySpecs && product.keySpecs.length ? product.keySpecs : specs).slice(0, 6) as ProductSpec[];
  const advantages = product.advantages || [];
  const applications = product.applications || [];
  const longApps = applications.some((a) => a.length > 48);
  const note = categoryIntro(product.category);
  const related = relatedInCategory(product, products, 6).filter(hasRealImage);
  const relatedArticles = articles.filter(
    (a) => a.status !== 'draft' && (product.relatedArticleIds?.includes(a.id) || a.relatedProductIds?.includes(product.id)),
  );
  const subline = product.subline || product.nameEn || '';

  const tabs: Tab[] = [
    { id: 'intro', label: 'معرفی' },
    ...(advantages.length ? [{ id: 'features', label: 'ویژگی‌ها' }] : []),
    ...(applications.length ? [{ id: 'uses', label: 'کاربردها' }] : []),
    ...(specs.length ? [{ id: 'specs', label: 'مشخصات فنی' }] : []),
  ];
  const [current, setCurrent] = useState('intro');
  const [relRowRef, relNear] = useNearViewport<HTMLDivElement>();
  const rootRef = useRef<HTMLDivElement>(null);

  // Sticky offsets follow the site's fixed header (its height differs per breakpoint).
  useEffect(() => {
    const root = rootRef.current;
    const header = document.querySelector('header');
    if (!root || !header) return;
    const set = () => root.style.setProperty('--pd-top', `${Math.round(header.getBoundingClientRect().bottom)}px`);
    set();
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(set) : null;
    ro?.observe(header);
    window.addEventListener('resize', set);
    return () => { ro?.disconnect(); window.removeEventListener('resize', set); };
  }, []);

  // Scroll-spy for the anchor tabs: the last section whose top has passed the sticky bar.
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const top = (parseInt(rootRef.current ? getComputedStyle(rootRef.current).getPropertyValue('--pd-top') : '', 10) || 72) + 80;
      let id = tabs[0]?.id || 'intro';
      for (const t of tabs) {
        const el = document.getElementById(t.id);
        if (el && el.getBoundingClientRect().top <= top) id = t.id;
      }
      setCurrent((prev) => (prev === id ? prev : id));
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => { window.removeEventListener('scroll', onScroll); if (raf) cancelAnimationFrame(raf); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.id, tabs.length]);

  // Mobile: keep the footer clear of the fixed bottom bar while this page is mounted.
  useEffect(() => {
    document.body.classList.add('pd-has-mbar');
    return () => document.body.classList.remove('pd-has-mbar');
  }, []);

  const goTo = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    e.preventDefault();
    const top = parseInt(getComputedStyle(rootRef.current!).getPropertyValue('--pd-top') || '72', 10) || 72;
    const y = el.getBoundingClientRect().top + window.scrollY - top - 64;
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' });
    setCurrent(id);
  };

  const quoteHref = '/contact';
  const isFeeding = product.category === 'feeding';

  return (
    <div className="pd" ref={rootRef}>
      <div className="pd-container">
        <nav aria-label="مسیر صفحه" className="pd-crumbs">
          <ol>
            <li><Link to="/">خانه</Link></li>
            <li aria-hidden="true" className="pd-sep">›</li>
            <li><Link to="/products">محصولات</Link></li>
            <li aria-hidden="true" className="pd-sep">›</li>
            <li><Link to={`/products/${product.category}`}>{product.categoryTitle}</Link></li>
            <li aria-hidden="true" className="pd-sep">›</li>
            <li aria-current="page">{product.name}</li>
          </ol>
        </nav>

        <div className="pd-grid">
          <section className="pd-card pd-top" aria-labelledby="pd-title">
            <div className="pd-gallery">
              <div className="pd-main">
                <LazyImage
                  src={mainSrc}
                  alt={active === 0 ? product.imageAlt || product.name : `${product.name} - ${active + 1}`}
                  priority={active === 0}
                  width={800}
                  height={450}
                  className="pd-main-img"
                  imgClassName="w-full h-full object-cover"
                />
                <a className="pd-zoom" href={withMediaVersion(zoomSrc(mainSrc))} target="_blank" rel="noopener" aria-label="بزرگ‌نمایی تصویر">
                  <Icon name="zoom" />
                </a>
              </div>
              {gallery.length >= 2 ? (
                <div className="pd-thumbs" role="list" aria-label="تصاویر محصول">
                  {gallery.map((src, i) => (
                    <button
                      key={src}
                      type="button"
                      role="listitem"
                      className="pd-thumb"
                      aria-label={`تصویر ${(i + 1).toLocaleString('fa-IR')}`}
                      aria-pressed={i === active}
                      onClick={() => setActive(i)}
                    >
                      <LazyImage src={src} alt="" width={160} height={90} className="w-full h-full" imgClassName="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="pd-summary">
              <Link className="pd-cat" to={`/products/${product.category}`}>
                <Icon name="layers" className="pd-ic-sm" />
                {product.categoryTitle}
              </Link>
              <h1 id="pd-title">{product.name}</h1>
              {subline ? <p className="pd-subline">{subline}</p> : null}
              {keySpecs.length ? (
                <>
                  <h2 className="pd-attrs-title">ویژگی‌های کلیدی</h2>
                  <dl className="pd-attrs">
                    {keySpecs.map((s, i) => (
                      <div className="pd-attr" key={i}>
                        <dt>{s.label}</dt>
                        <dd>{s.value}</dd>
                      </div>
                    ))}
                  </dl>
                </>
              ) : null}
              {specs.length > keySpecs.length ? (
                <a className="pd-more" href="#specs" onClick={(e) => goTo(e, 'specs')}>
                  مشاهدهٔ همهٔ مشخصات فنی
                  <Icon name="left" className="pd-ic-sm" />
                </a>
              ) : null}
            </div>
          </section>

          <aside className="pd-card pd-inquiry" aria-labelledby="pd-inq-t">
            <h2 id="pd-inq-t">استعلام قیمت و مشاورهٔ رایگان</h2>
            {product.inquiryNote ? <p className="pd-inq-note">{product.inquiryNote}</p> : null}
            <div className="pd-inq-actions">
              <Link className="pd-btn pd-btn-primary pd-desk-only" to={quoteHref}>
                <Icon name="chat" />
                استعلام قیمت
              </Link>
              {isFeeding ? (
                <Link className="pd-btn pd-btn-outline" to={`/contact?cta=feeder-line-count&product=${encodeURIComponent(product.code || product.id)}`}>
                  محاسبه تعداد خطوط
                </Link>
              ) : null}
              <a className="pd-btn pd-btn-outline pd-desk-only" href={SALES_PHONE_TEL}>
                <Icon name="phone" />
                تماس: <bdi dir="ltr">{SALES_PHONE_DISPLAY}</bdi>
              </a>
            </div>
            <div className="pd-landline">
              {OFFICE_PHONE_LABEL}: <a href={OFFICE_PHONE_TEL}><bdi dir="ltr">{OFFICE_PHONE_DISPLAY}</bdi></a>
            </div>
            <ul className="pd-trust">
              <li><Icon name="award" />۵۰ سال سابقه</li>
              <li><Icon name="check" />بیش از ۲۰۰ پروژه</li>
              <li><Icon name="chat" />مشاورهٔ رایگان</li>
            </ul>
            <a className="pd-catalog" href={CATALOG_PDF} target="_blank" rel="noopener">
              <Icon name="doc" />
              دانلود کاتالوگ PDF
            </a>
          </aside>

          <div className="pd-rest">
            {tabs.length > 1 ? (
              <nav className="pd-tabs" aria-label="بخش‌های صفحه">
                {tabs.map((t) => (
                  <a key={t.id} href={`#${t.id}`} aria-current={current === t.id ? 'true' : undefined} onClick={(e) => goTo(e, t.id)}>
                    {t.label}
                  </a>
                ))}
              </nav>
            ) : null}

            <section id="intro" className="pd-card pd-section pd-prose">
              <h2>معرفی محصول</h2>
              <p>{product.fullDescription || product.shortDescription}</p>
              {(product.details || []).map((b, i) => {
                if ('h2' in b) return <h3 key={i}><RichInline text={b.h2} /></h3>;
                if ('p' in b) return <p key={i}><RichInline text={b.p} /></p>;
                return <ul key={i}>{b.ul.map((li, j) => <li key={j}><RichInline text={li} /></li>)}</ul>;
              })}
              {note ? (
                <div className="pd-note">
                  <Icon name="info" />
                  <div>
                    <b>نکتهٔ انتخاب در {product.categoryTitle}</b>
                    <p>{note}</p>
                  </div>
                </div>
              ) : null}
            </section>

            {advantages.length ? (
              <section id="features" className="pd-card pd-section">
                <h2>ویژگی‌ها</h2>
                <ul className="pd-feats">
                  {advantages.map((a, i) => (
                    <li key={i} className="pd-feat">
                      <span className="pd-ico"><Icon name={featureIcon(a)} /></span>
                      <p>{a}</p>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            {applications.length ? (
              <section id="uses" className="pd-card pd-section">
                <h2>کاربردها</h2>
                <ul className={`pd-apps${longApps ? ' pd-apps-long' : ''}`}>
                  {applications.map((a, i) => (
                    <li key={i} className="pd-app">
                      <span className="pd-ico"><Icon name={applicationIcon(a)} /></span>
                      <b>{a}</b>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            {specs.length ? (
              <section id="specs" className="pd-card pd-section">
                <h2>مشخصات فنی</h2>
                <table className="pd-spec">
                  <tbody>
                    {specs.map((s, i) => (
                      <tr key={i}>
                        <th scope="row">{s.label}</th>
                        <td>{s.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>
            ) : null}

            {related.length || relatedArticles.length ? (
              <section className="pd-card pd-related" aria-labelledby="pd-rel-t">
                {related.length ? (
                  <>
                    <div className="pd-rel-head">
                      <h2 id="pd-rel-t">محصولات مرتبط</h2>
                      <Link className="pd-rel-all" to={`/products/${product.category}`}>
                        همه محصولات {product.categoryTitle}
                        <Icon name="left" className="pd-ic-sm" />
                      </Link>
                    </div>
                    <div className="pd-rel-row" ref={relRowRef}>
                      {related.map((p) => (
                        <Link key={p.id} className="pd-rel" to={publicProductPath(p)}>
                          <div className="pd-rel-thumb">
                            {relNear && <LazyImage src={p.image} alt={p.imageAlt || p.name} width={400} height={225} className="w-full h-full" imgClassName="w-full h-full object-cover" />}
                          </div>
                          <div className="pd-rel-meta">
                            <small>{p.categoryTitle}</small>
                            <b>{p.name}</b>
                            <span className="pd-go">مشاهده<Icon name="left" className="pd-ic-xs" /></span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </>
                ) : (
                  <h2 id="pd-rel-t" className="pd-sr">مطالب مرتبط</h2>
                )}
                {relatedArticles.length ? (
                  <div className="pd-guides">
                    {relatedArticles.map((a) => (
                      <Link key={a.id} className="pd-guide" to={`/magazine/${a.id}`}>
                        <Icon name="book" />
                        <span><small>راهنمای مرتبط</small>{product.articleLinkLabels?.[a.id] || a.title}</span>
                      </Link>
                    ))}
                  </div>
                ) : null}
              </section>
            ) : null}
          </div>
        </div>
      </div>

      <div className="pd-mbar" role="region" aria-label="اقدام سریع">
        <a className="pd-btn pd-btn-outline" href={SALES_PHONE_TEL}><Icon name="phone" />تماس</a>
        <Link className="pd-btn pd-btn-primary" to={quoteHref}>استعلام قیمت</Link>
      </div>
    </div>
  );
};
