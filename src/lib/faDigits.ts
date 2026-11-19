/**
 * Display-only digit localization for spec values/labels (see displayDigits in i18n).
 * Model codes and alphanumeric tokens (GH 0625, BCF-85, NTAC9/150D, NH3, CO2, TS-100, A2, DSA 15)
 * are left untouched; number + unit (380V, 1.1 kW, 25,000 kcal/hr) gets Persian digits and the
 * Latin unit stays. On fa, thousands separators → «٬», decimal point → «٫», percent after a digit → «٪».
 * Arabic pages use Arabic-Indic digits (٠١٢٣٤٥٦٧٨٩). English, Turkish and Russian keep Latin digits.
 * Never used for SEO head / JSON-LD.
 */
import { displayDigits } from '../i18n';

export function faDigits(text: string | number | null | undefined): string {
  return displayDigits(text);
}

/** Spec rows whose label names a model/code keep their value verbatim. */
export function faSpecValue(label: string, value: string): string {
  const l = label.trim();
  return /(?:^|\s)(?:مدل|کد)(?:\s|$)/.test(l) && !/^تعداد/.test(l) ? value : faDigits(value);
}
