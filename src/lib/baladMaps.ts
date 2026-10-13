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
    title: "مشاهده «دانشگاه منابع طبیعی گرگان» روی نقشه بلد",
  },
};

export function baladEmbedFor(location: BaladLocation): { src: string; title: string } | null {
  const custom = location.baladEmbedUrl?.trim();
  if (custom) {
    return { src: custom, title: location.title ? `مشاهده «${location.title}» روی نقشه بلد` : "نقشه بلد" };
  }
  if (location.id && BALAD_BY_ID[location.id]) return BALAD_BY_ID[location.id];
  const title = location.title || "";
  if (title.includes("مرکزی") || title.includes("مادر")) return BALAD_BY_ID["hq-01"];
  if (title.includes("تحقیق") || title.includes("منابع طبیعی") || title.includes("دانشگاه")) return BALAD_BY_ID["rd-01"];
  return null;
}

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
