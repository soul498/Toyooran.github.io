export type BaladLocation = {
  id?: string;
  title?: string;
  type?: string;
  baladEmbedUrl?: string;
};

const BALAD_BY_ID: Record<string, { src: string; title: string }> = {
  "hq-01": {
    src: "https://balad.ir/embed?p=2XXUngg0bK6lAQ",
    title: "مشاهده «دفتر مرکزی طیوران صنعت پویا» روی نقشه بلد",
  },
  "fact-01": {
    src: "https://balad.ir/embed?p=6CHymGXdZRyn6u",
    title: "مشاهده «طیوران صنعت پویا» روی نقشه بلد",
  },
  "rd-01": {
    src: "https://balad.ir/embed?p=3vQBwlNBZMYwZm",
    title: "مشاهده «دفتر تحقیق و توسعه طیوران صنعت پویا» روی نقشه بلد",
  },
  "branch-tehran": {
    src: "https://balad.ir/embed?p=PMzvHKnmzUK1EG",
    title: "مشاهده «دفتر بازرگانی طیوران صنعت پویا» روی نقشه بلد",
  },
};

export function baladEmbedFor(location: BaladLocation): { src: string; title: string } | null {
  const custom = location.baladEmbedUrl?.trim();
  if (custom) {
    return { src: custom, title: location.title ? `مشاهده «${location.title}» روی نقشه بلد` : "نقشه بلد" };
  }
  if (location.id && BALAD_BY_ID[location.id]) return BALAD_BY_ID[location.id];
  const title = location.title || "";
  if (title.includes("مرکزی")) return BALAD_BY_ID["hq-01"];
  if (title.includes("تحقیق")) return BALAD_BY_ID["rd-01"];
  if (title.includes("بازرگانی")) return BALAD_BY_ID["branch-tehran"];
  if (location.type === "factory" || title.includes("کارخانه")) return BALAD_BY_ID["fact-01"];
  return null;
}
