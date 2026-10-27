/**
 * Public-copy corrections applied on top of stored CMS records (the admin DB is not edited).
 * Pouya butterfly feeder: feed-waste savings are 3–5 percent, not 15 percent.
 */
const CORRECTIONS: [RegExp, string][] = [
  [/هدررفت دان تا (?:۱۵|15) ?(?:٪|%|درصد) کاهش می‌یابد/g, 'هدررفت دان بین ۳ تا ۵ درصد کاهش می‌یابد'],
  [/کاهش هدررفت دان تا (?:۱۵|15) ?(?:٪|%|درصد)/g, 'کاهش ۳ تا ۵ درصدی هدررفت دان'],
  [/(کاهش (?:پرت|هدررفت|اتلاف) دان(?: تا)?) (?:۱۵|15) ?(?:٪|%|درصد)/g, '$1 ۳ تا ۵ درصد'],
];

const fixText = (text: string): string =>
  /(?:۱۵|15) ?(?:٪|%|درصد)/.test(text) ? CORRECTIONS.reduce((acc, [re, to]) => acc.replace(re, to), text) : text;

/** Deep copy with corrected strings; returns the same reference when nothing changes. */
export function withContentCorrections<T>(value: T): T {
  if (typeof value === 'string') return fixText(value) as unknown as T;
  if (Array.isArray(value)) {
    let changed = false;
    const next = value.map((item) => {
      const fixed = withContentCorrections(item);
      if (fixed !== item) changed = true;
      return fixed;
    });
    return (changed ? next : value) as unknown as T;
  }
  if (value && typeof value === 'object') {
    let changed = false;
    const next: Record<string, unknown> = {};
    for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
      const fixed = withContentCorrections(item);
      if (fixed !== item) changed = true;
      next[key] = fixed;
    }
    return (changed ? next : value) as T;
  }
  return value;
}
