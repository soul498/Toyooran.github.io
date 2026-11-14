/**
 * Display-only: Latin digits → Persian digits for spec values/labels.
 * Model codes and alphanumeric tokens (GH 0625, BCF-85, NTAC9/150D, NH3, CO2, TS-100, A2, DSA 15)
 * are left untouched; number + unit (380V, 1.1 kW, 25,000 kcal/hr) gets Persian digits and the
 * Latin unit stays. Thousands separators → «٬», decimal point → «٫», percent after a digit → «٪».
 * Never used for SEO head / JSON-LD.
 */
import { isLtr, latinDigits } from '../i18n';

const FA = '۰۱۲۳۴۵۶۷۸۹';
// Letters glued to a following digit (NH3, NTAC9/150D, FTP4E-350, A2) or an uppercase code
// followed by "-" / space and digits (GH 0625, BCF-85, DSA 15, TS-100).
const CODE_RE = /(?<![A-Za-z0-9])(?:[A-Za-z]+\d[A-Za-z0-9]*(?:[-/.][A-Za-z0-9]+)*|[A-Z]{1,}[A-Z]*[- ]\d[A-Za-z0-9]*(?:[-/][A-Za-z0-9]+)*)(?![A-Za-z0-9])/g;

function convertPlain(s: string): string {
  return s
    .replace(/(\d),(?=\d{3}(?!\d))/g, '$1٬')
    .replace(/(\d)\.(?=\d)/g, '$1٫')
    .replace(/(\d)%/g, '$1٪')
    .replace(/\d/g, (d) => FA[Number(d)]);
}

export function faDigits(text: string | number | null | undefined): string {
  const s = text == null ? '' : String(text);
  // English and Turkish pages keep Latin digits.
  if (isLtr()) return latinDigits(s);
  if (!/[0-9]/.test(s)) return s;
  let out = '';
  let last = 0;
  for (const m of s.matchAll(CODE_RE)) {
    const i = m.index ?? 0;
    out += convertPlain(s.slice(last, i)) + m[0];
    last = i + m[0].length;
  }
  return out + convertPlain(s.slice(last));
}

/** Spec rows whose label names a model/code keep their value verbatim. */
export function faSpecValue(label: string, value: string): string {
  const l = label.trim();
  return /(?:^|\s)(?:مدل|کد)(?:\s|$)/.test(l) && !/^تعداد/.test(l) ? value : faDigits(value);
}
