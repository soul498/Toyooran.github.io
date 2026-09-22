import React from 'react';
import { notify } from '../lib/notify';

type SocialIconLinkProps = {
  href?: string | null;
  label: string;
  comingSoon: string;
  className: string;
  children: React.ReactNode;
};

export const SocialIconLink: React.FC<SocialIconLinkProps> = ({
  href,
  label,
  comingSoon,
  className,
  children,
}) => {
  const url = typeof href === 'string' && href.trim() && href !== '#' ? href.trim() : '';
  const cls = `min-w-11 min-h-11 w-11 h-11 ${className}`;
  if (url) {
    return (
      <a href={url} target="_blank" rel="noreferrer" aria-label={label} className={cls}>
        {children}
      </a>
    );
  }
  return (
    <button
      type="button"
      aria-label={label}
      className={cls}
      onClick={() => {
        void notify(comingSoon, { icon: '✨' });
      }}
    >
      {children}
    </button>
  );
};
