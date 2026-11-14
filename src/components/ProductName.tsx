import React from 'react';
import { isEn } from '../i18n';

/**
 * Latin model names inside Persian product names («جت هیتر ۱۰۰ هزار (GLE-100)», «هیتر گازی مدل GH 0625»).
 * A run is a token with a Latin letter plus any following tokens/numbers, e.g. "GLE-100", "GH 0625", "2EL-120".
 */
const LATIN_RUN = /[A-Za-z0-9][A-Za-z0-9\-./*_]*[A-Za-z][A-Za-z0-9\-./*_]*(?:\s+[A-Za-z0-9][A-Za-z0-9\-./*_]*)*|[A-Za-z][A-Za-z0-9\-./*_]*(?:\s+[A-Za-z0-9][A-Za-z0-9\-./*_]*)*/g;

/**
 * Product name with each Latin run isolated (<bdi dir="ltr">, no line break inside), so brackets and
 * hyphens around model names render in the right order in RTL text. English names render unchanged.
 */
export const ProductName: React.FC<{ name: string }> = ({ name }) => {
  if (isEn() || !name || !/[A-Za-z]/.test(name)) return <>{name}</>;
  const parts: React.ReactNode[] = [];
  let last = 0;
  for (const m of name.matchAll(LATIN_RUN)) {
    const start = m.index ?? 0;
    if (start > last) parts.push(name.slice(last, start));
    parts.push(<bdi key={start} dir="ltr" className="whitespace-nowrap">{m[0]}</bdi>);
    last = start + m[0].length;
  }
  if (last < name.length) parts.push(name.slice(last));
  return <>{parts}</>;
};
