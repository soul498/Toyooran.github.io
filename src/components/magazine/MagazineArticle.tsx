import React from 'react';
import { ArrowRight, Clock, Calendar, Share2, Tag, Link as LinkIcon, CheckCircle2, Image as ImageIcon } from '../../icons';
import { Link } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { LazyImage } from '../LazyImage';
import type { Article } from '../../types';
import { articleBlocks, type ArticleBlock } from '../../seo/articleBlocks';
import { publicProductPath, publicServicePath } from '../../seo/resolveSeo';
import { isSafeHref, isSafeImageSrc } from '../../seo/safeUrl';
import { inlinePlain } from '../../seo/richText';
import { withMediaVersion } from '../../lib/mediaUrl';
import { RichInline } from '../RichBlocks';

interface MagazineArticleProps {
  article: Article;
  onBack: () => void;
  onSelectProductById: (productId: string) => void;
}

type FitBox = { type: 'fit'; label: string; items: string[]; tone: 'good' | 'warn' };
type RenderItem = ArticleBlock | { type: 'fitGroup'; boxes: FitBox[] };

const FIT_RE = /^کی\s*مناسب/;
const NOT_FIT_RE = /^کی\s*مناسب\s*نیست/;

/** Pairs «کی مناسب است:» / «کی مناسب نیست…» paragraphs + their lists into side-by-side boxes. */
function groupBlocks(blocks: ArticleBlock[]): RenderItem[] {
  const out: RenderItem[] = [];
  for (let i = 0; i < blocks.length; i += 1) {
    const block = blocks[i];
    const next = blocks[i + 1];
    if (block.type === 'p' && next?.type === 'ul') {
      const label = inlinePlain(block.text).trim();
      if (FIT_RE.test(label)) {
        const box: FitBox = { type: 'fit', label, items: next.items, tone: NOT_FIT_RE.test(label) ? 'warn' : 'good' };
        const last = out[out.length - 1];
        if (last && last.type === 'fitGroup' && last.boxes.length < 2) last.boxes.push(box);
        else out.push({ type: 'fitGroup', boxes: [box] });
        i += 1;
        continue;
      }
    }
    out.push(block);
  }
  return out;
}

const samePath = (a?: string, b?: string) => Boolean(a && b && a.split(/[?#]/)[0] === b.split(/[?#]/)[0]);

const P_CLASS = 'mb-6 text-[17px] leading-[1.9] font-normal text-slate-700 text-start whitespace-pre-line';
const LI_CLASS = 'text-[17px] leading-[1.9] font-normal text-slate-700 ps-1';

export const MagazineArticle: React.FC<MagazineArticleProps> = ({ article, onBack, onSelectProductById }) => {
  const { products, services } = useData();
  const heroImage = article.image && isSafeImageSrc(article.image) ? article.image : "";
  const relatedService = article.relatedServiceId ? services.find((service) => service.id === article.relatedServiceId) : undefined;

  const linkedProducts = products.filter((p) => article.relatedProductIds?.includes(p.id));
  const items = groupBlocks(articleBlocks(article.content));

  const renderItem = (block: RenderItem, idx: number): React.ReactNode => {
    if (block.type === 'fitGroup') {
      return (
        <div key={idx} className={`my-8 grid gap-4 ${block.boxes.length > 1 ? 'md:grid-cols-2' : ''}`}>
          {block.boxes.map((box, boxIndex) => (
            <div
              key={boxIndex}
              className={`rounded-2xl border p-5 md:p-6 ${box.tone === 'good' ? 'bg-emerald-50/70 border-emerald-200' : 'bg-amber-50/70 border-amber-200'}`}
            >
              <p className={`mb-3 text-base font-black ${box.tone === 'good' ? 'text-emerald-800' : 'text-amber-800'}`}>{box.label}</p>
              <ul className="list-disc ps-5 space-y-2 marker:text-slate-400">
                {box.items.map((item, itemIndex) => (
                  <li key={itemIndex} className="text-[16px] leading-[1.9] font-normal text-slate-700 ps-1">
                    <RichInline text={item} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      );
    }
    if (block.type === "h2") {
      return (
        <h2 key={idx} className="text-2xl font-black text-slate-900 mt-12 mb-5 pb-3 border-b border-slate-200 leading-[1.6]">
          {block.text}
        </h2>
      );
    }
    if (block.type === "h3") {
      return (
        <h3 key={idx} className="text-xl font-bold text-slate-800 mt-8 mb-3 leading-[1.7]">
          <RichInline text={block.text} />
        </h3>
      );
    }
    if (block.type === "ul") {
      return (
        <ul key={idx} className="list-disc ps-6 mb-6 space-y-2 marker:text-[#003F86]">
          {block.items.map((item, itemIndex) => (
            <li key={`${idx}-${itemIndex}`} className={LI_CLASS}>
              <RichInline text={item} />
            </li>
          ))}
        </ul>
      );
    }
    if (block.type === "img") {
      if (!isSafeImageSrc(block.src)) return null;
      // The featured image is already shown above the body; don't repeat it.
      if (samePath(block.src, heroImage)) return null;
      return (
        <div key={idx} className="my-10 rounded-2xl overflow-hidden shadow-xl shadow-slate-200/50 border border-slate-200 bg-white">
          <LazyImage src={block.src} alt={block.alt} className="w-full min-h-[250px] md:min-h-[400px]" imgClassName="w-full h-auto object-cover max-h-[600px]" />
          {block.alt && <p className="text-center text-sm text-slate-500 py-3 font-medium bg-slate-50">{block.alt}</p>}
        </div>
      );
    }
    if (block.type === "cta") {
      if (!isSafeHref(block.href)) return null;
      const external = /^https?:\/\//i.test(block.href);
      const buttonClass = "relative z-10 whitespace-nowrap bg-amber-400 hover:bg-amber-500 text-blue-950 px-8 py-3.5 rounded-xl font-black text-sm transition-all shadow-lg shadow-amber-400/20";
      return (
        <div key={idx} className="my-10 bg-gradient-to-r from-blue-900 to-[#003F86] rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl shadow-blue-900/20 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('/images/pattern-circuit.svg')] opacity-10 mix-blend-overlay"></div>
          <div className="relative z-10 flex-1">
            <h4 className="text-white text-lg md:text-xl font-bold mb-2">نیاز به راهنمایی بیشتر دارید؟</h4>
            <p className="text-blue-100 text-sm md:text-base font-medium">کارشناسان ما آماده ارائه مشاوره تخصصی و فنی به شما هستند.</p>
          </div>
          {external ? (
            <a href={block.href} className={buttonClass} rel="noopener noreferrer">{block.label}</a>
          ) : (
            <Link to={block.href} className={buttonClass}>{block.label}</Link>
          )}
        </div>
      );
    }
    if (block.type === "table") {
      const [firstHeader, ...dataHeaders] = block.headers;
      return (
        <div key={idx} className="my-8">
          {/* Desktop / tablet: real table */}
          <div className="hidden sm:block overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-start text-[15px] leading-[1.8] text-slate-800">
              <thead>
                <tr className="bg-[#003F86] text-white">
                  {block.headers.map((cell, cellIndex) => (
                    <th key={`${idx}-${cellIndex}`} className="py-3 px-4 font-bold text-start align-bottom">
                      <RichInline text={cell} />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {block.rows.map((row, rowIdx) => (
                  <tr key={rowIdx} className="border-t border-slate-200 odd:bg-white even:bg-slate-50">
                    {row.map((cell, cellIdx) => (
                      <td key={`${rowIdx}-${cellIdx}`} className={`py-3 px-4 align-top ${cellIdx === 0 ? 'font-bold text-slate-900 min-w-[7.5rem]' : 'font-normal min-w-[8rem]'}`}>
                        <RichInline text={cell} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Mobile: one card per data column */}
          <div className="sm:hidden space-y-4">
            {dataHeaders.map((header, colIndex) => (
              <div key={colIndex} className="rounded-2xl border border-slate-200 overflow-hidden bg-white">
                <div className="bg-[#003F86] text-white font-bold px-4 py-2.5 text-[15px]"><RichInline text={header} /></div>
                <dl className="divide-y divide-slate-100">
                  {block.rows.map((row, rowIdx) => (
                    <div key={rowIdx} className="px-4 py-2.5 even:bg-slate-50">
                      <dt className="text-[13px] font-bold text-slate-500 mb-0.5">
                        {firstHeader ? <span className="sr-only">{firstHeader}: </span> : null}
                        <RichInline text={row[0] || ''} />
                      </dt>
                      <dd className="text-[15px] leading-[1.8] text-slate-800 font-normal"><RichInline text={row[colIndex + 1] || ''} /></dd>
                    </div>
                  ))}
                </dl>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return (
      <p key={idx} className={P_CLASS}>
        <RichInline text={block.text} />
      </p>
    );
  };

  return (
    <div className="article-page min-h-screen bg-[#F8FAFC] pb-24">
      {/* Header: plain light brand background, no image behind the title */}
      <header className="bg-gradient-to-b from-[#E8F0FA] to-[#F8FAFC] pt-28 pb-8 md:pb-10">
        <div className="max-w-[864px] mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={onBack}
              className="flex items-center gap-2 bg-white hover:bg-slate-50 border border-slate-200 text-[#003F86] px-4 py-2 rounded-full text-sm font-bold transition-all shadow-sm"
            >
              <ArrowRight className="w-4 h-4" />
              <span>بازگشت به مجله</span>
            </button>
            <button aria-label="اشتراک‌گذاری" className="flex items-center gap-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 p-2.5 rounded-full transition-all shadow-sm">
              <Share2 className="w-4 h-4" />
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-slate-500 text-sm font-medium mb-4">
            <span className="bg-amber-400 text-blue-950 px-3.5 py-1 rounded-full text-xs font-bold">
              {article.categoryLabel}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" /> {article.date}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" /> {article.readTime}
            </span>
          </div>
          <h1 className="text-[1.6rem] md:text-[2.1rem] font-black text-slate-900 leading-[1.6] mb-4">
            {article.title}
          </h1>
          <p className="text-base md:text-lg text-slate-600 leading-[1.9] font-normal">
            {article.summary}
          </p>
        </div>
      </header>

      <div className="max-w-[864px] mx-auto px-4 sm:px-6">
        {heroImage ? (
          <figure className="mb-8 rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 shadow-lg shadow-slate-200/60">
            <img
              src={withMediaVersion(heroImage)}
              alt={article.imageAlt || article.title}
              width={1200}
              height={630}
              loading="eager"
              fetchPriority="high"
              decoding="async"
              className="block w-full h-auto aspect-[1200/630] object-cover"
            />
          </figure>
        ) : null}

        <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-200 px-5 py-8 sm:p-8 md:p-12">

          {/* Article Text */}
          <div className="article-body max-w-none text-slate-700">
            {items.map(renderItem)}
          </div>

          {/* Related Products Section */}
          {linkedProducts.length > 0 && (
            <div className="mt-16 pt-12 border-t border-slate-200">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2.5 bg-blue-50 rounded-xl">
                  <LinkIcon className="w-6 h-6 text-[#003F86]" />
                </div>
                <h3 className="text-xl font-black text-slate-900">
                  محصولات و تجهیزات مرتبط
                </h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {linkedProducts.map((p) => (
                  <Link
                    key={p.id}
                    to={publicProductPath(p)}
                    className="flex items-center gap-4 p-4 rounded-2xl border border-slate-200 hover:border-[#003F86]/30 bg-slate-50/50 hover:bg-blue-50/50 transition-all group"
                  >
                    <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0">
                      <LazyImage src={p.image} alt={p.name} className="w-full h-full" imgClassName="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 group-hover:text-[#003F86] transition-colors">{p.name}</h4>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-1">{p.shortDescription}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
          
          <div className="mt-10 pt-8 border-t border-slate-200 text-sm text-slate-600 space-y-2">
            {article.authorName ? <p>نویسنده: {article.authorName}{article.authorRole ? ` — ${article.authorRole}` : ''}</p> : null}
            {article.reviewerName ? <p>بازبین فنی: {article.reviewerName}{article.reviewerRole ? ` — ${article.reviewerRole}` : ''}</p> : null}
            <p>تاریخ انتشار: {article.datePublishedIso || article.date}</p>
            {article.sources?.length ? (
              <ul className="list-disc mr-5">
                {article.sources.map((source, sourceIndex) => (
                  <li key={`${source.name}-${sourceIndex}`}>{source.url && isSafeHref(source.url) ? <a className="text-[#003F86] font-bold" href={source.url} rel="noopener noreferrer">{source.name}</a> : source.name}</li>
                ))}
              </ul>
            ) : null}
            <p>
              <Link className="text-[#003F86] font-bold" to={relatedService ? publicServicePath(relatedService) : "/services/poultry-hall-fitout"}>
                {relatedService ? relatedService.title : "تجهیز و نوسازی سالن"}
              </Link>
              {' · '}
              <Link className="text-[#003F86] font-bold" to="/contact?cta=article-consult">درخواست مشاوره</Link>
            </p>
          </div>
          <div className="mt-16 pt-8 flex flex-wrap items-center gap-2">
             <Tag className="w-5 h-5 text-slate-400 mr-2" />
             {(article.tags && article.tags.length > 0 ? article.tags : ['دانش فنی', 'صنعت طیور', 'تجهیزات']).map(tag => (
               <span key={tag} className="bg-slate-100 text-slate-600 text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-200 cursor-pointer transition-colors">
                 {tag}
               </span>
             ))}
          </div>

        </div>
      </div>
    </div>
  );
};
