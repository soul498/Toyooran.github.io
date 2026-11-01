import React from 'react';
import { Link } from 'react-router-dom';
import { parseInline, RichBlock } from '../seo/richText';
import { routerTo } from '../i18n';

export const RichInline: React.FC<{ text: string }> = ({ text }) => (
  <>
    {parseInline(text).map((part, i) =>
      part.href ? (
        <Link key={i} to={routerTo(part.href)} className="text-[#003F86] font-bold hover:underline">
          {part.text}
        </Link>
      ) : part.bold ? (
        <strong key={i} className="font-black text-slate-800">{part.text}</strong>
      ) : (
        <React.Fragment key={i}>{part.text}</React.Fragment>
      )
    )}
  </>
);

/** Client twin of blocksToHtml(): same copy the server puts in #seo-prerender. */
export const RichBlocks: React.FC<{ blocks?: RichBlock[]; className?: string }> = ({ blocks, className }) => {
  if (!blocks?.length) return null;
  return (
    <div className={className ?? 'space-y-3 text-sm md:text-base text-slate-600 leading-relaxed font-medium text-justify'}>
      {blocks.map((b, i) => {
        if ('h2' in b) return <h2 key={i} className="text-base md:text-lg font-black text-slate-800 pt-2"><RichInline text={b.h2} /></h2>;
        if ('p' in b) return <p key={i}><RichInline text={b.p} /></p>;
        return (
          <ul key={i} className="list-disc pr-5 space-y-1.5">
            {b.ul.map((li, j) => <li key={j}><RichInline text={li} /></li>)}
          </ul>
        );
      })}
    </div>
  );
};
