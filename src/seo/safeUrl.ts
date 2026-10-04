export function isSafeHref(value: string): boolean {
  const href = value.trim();
  if (!href || href.toLowerCase().includes("javascript:")) return false;
  if (href.startsWith("/") && !href.startsWith("//") && !href.startsWith("/\\")) return true;
  try {
    const url = new URL(href);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function isSafeImageSrc(value: string): boolean {
  const src = value.trim();
  if (!src || src.startsWith("blob:")) return false;
  if (src.startsWith("data:image/")) return true;
  return isSafeHref(src);
}
