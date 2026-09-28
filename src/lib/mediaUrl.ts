/** Bump when replacing files under /images (especially product WebP). */
export const MEDIA_VERSION = "p4img-20260928";

export function withMediaVersion(src: string | undefined | null): string {
  if (!src) return "";
  const trimmed = src.trim();
  if (!trimmed || trimmed.startsWith("data:") || trimmed.startsWith("blob:")) return trimmed;
  if (/[?&]v=/.test(trimmed)) return trimmed;
  const [path] = trimmed.split(/[?#]/);
  if (!path.startsWith("/images/") && !path.includes("/images/products/")) return trimmed;
  const sep = trimmed.includes("?") ? "&" : "?";
  return `${trimmed}${sep}v=${MEDIA_VERSION}`;
}
