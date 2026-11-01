import { t, tf, tr } from "../i18n";

export type BaladLocation = {
  id?: string;
  title?: string;
  type?: string;
  baladEmbedUrl?: string;
};

const BALAD_BY_ID: Record<string, { src: string; title: string }> = {
  "hq-01": {
    src: "https://balad.ir/embed?p=6CHymGXdZRyn6u",
    title: "مشاهده «دفتر مرکزی طیوران صنعت پویا» روی نقشه بلد",
  },
  "rd-01": {
    src: "https://balad.ir/embed?p=2mnxzJeK25Qq8Q",
    title: "مشاهده «دفتر تحقیق و توسعه» روی نقشه بلد",
  },
};

export function baladEmbedFor(location: BaladLocation): { src: string; title: string } | null {
  const custom = location.baladEmbedUrl?.trim();
  if (custom) {
    return { src: custom, title: location.title ? tf("مشاهده «{title}» روی نقشه بلد", { title: location.title }) : t("نقشه بلد") };
  }
  if (location.id && BALAD_BY_ID[location.id]) return localized(BALAD_BY_ID[location.id]);
  const title = location.title || "";
  if (title.includes("مرکزی") || title.includes("مادر")) return localized(BALAD_BY_ID["hq-01"]);
  if (title.includes("تحقیق") || title.includes("منابع طبیعی") || title.includes("دانشگاه")) return localized(BALAD_BY_ID["rd-01"]);
  return null;
}

const localized = (m: { src: string; title: string }) => ({ ...m, title: tr(m.title) });

/** Public Balad place page for the same pin as the embed (`/p/{token}`). */
export function baladPlaceFor(location: BaladLocation): string | null {
  const embed = baladEmbedFor(location);
  if (!embed) return null;
  try {
    const token = new URL(embed.src).searchParams.get("p")?.trim() || "";
    if (!/^[A-Za-z0-9_-]+$/.test(token)) return null;
    return `https://balad.ir/p/${token}`;
  } catch {
    return null;
  }
}
