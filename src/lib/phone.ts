const FA_DIGITS = "۰۱۲۳۴۵۶۷۸۹";

/** Convert Persian/Arabic digits and punctuation into a dialable tel: href. */
export function toTelHref(raw: string | undefined | null): string {
  if (!raw) return "#";
  let s = String(raw).trim();
  s = s.replace(/[۰-۹]/g, (d) => String(FA_DIGITS.indexOf(d)));
  s = s.replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)));
  s = s.replace(/[^\d+]/g, "");
  if (!s) return "#";
  if (s.startsWith("00")) s = `+${s.slice(2)}`;
  if (s.startsWith("0") && !s.startsWith("00")) s = `+98${s.slice(1)}`;
  if (!s.startsWith("+")) s = `+98${s}`;
  return `tel:${s}`;
}

export function neshanMapsUrl(address: string, lat?: number, lng?: number): string {
  if (typeof lat === "number" && typeof lng === "number") {
    return `https://neshan.org/maps/@${lat},${lng},17z`;
  }
  return `https://neshan.org/maps#/search/${encodeURIComponent(address)}`;
}
