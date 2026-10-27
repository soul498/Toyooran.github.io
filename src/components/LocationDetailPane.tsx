import React, { useEffect, useRef, useState } from "react";
import { Building2, Clock, Factory, MapPin } from "../icons";
import { baladEmbedFor, baladPlaceFor } from "../lib/baladMaps";
import { neshanMapsUrl } from "../lib/phone";

type LocationLike = {
  id?: string;
  title?: string;
  type?: string;
  address?: string;
  lat?: number;
  lng?: number;
  baladEmbedUrl?: string;
  workingHours?: string;
};

export const LocationDetailPane: React.FC<{
  location: LocationLike;
  hours?: string | null;
  /** Mount the map iframe only once the pane is near the viewport (keeps it off the initial load). */
  deferMap?: boolean;
}> = ({ location, hours, deferMap = false }) => {
  const paneRef = useRef<HTMLDivElement>(null);
  const [mapVisible, setMapVisible] = useState(!deferMap);
  useEffect(() => {
    if (mapVisible) return;
    const el = paneRef.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setMapVisible(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setMapVisible(true);
          io.disconnect();
        }
      },
      { rootMargin: "200px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [mapVisible]);
  const embed = baladEmbedFor(location);
  const title = location.title || (location.type === "headquarter" ? "دفتر مرکزی" : "شعبه");
  const mapHref = baladPlaceFor(location) || neshanMapsUrl(location.address || "", location.lat, location.lng);

  return (
    <div ref={paneRef} className="lg:col-span-8 relative rounded-[2rem] overflow-hidden bg-[#001c3d] border border-white/10 h-[460px] lg:h-full shadow-2xl">
      <div className="absolute inset-0">
        {embed && mapVisible ? (
          <iframe
            key={embed.src}
            src={embed.src}
            title={embed.title}
            className="absolute inset-0 h-full w-full border-0 pointer-events-none"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        ) : embed ? null : (
          <div className="absolute inset-0 flex items-center justify-center">
            {location.type === "headquarter" ? (
              <Building2 className="w-12 h-12 text-amber-500/50" />
            ) : location.type === "factory" ? (
              <Factory className="w-12 h-12 text-amber-500/50" />
            ) : (
              <MapPin className="w-12 h-12 text-amber-500/50" />
            )}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#001c3d] via-[#001c3d]/60 to-transparent z-10 pointer-events-none" />
      </div>
      <div className="relative z-20 mt-auto h-full flex flex-col justify-end p-6 sm:p-10 lg:p-12 items-center text-center sm:items-stretch sm:text-right">
        <p className="text-2xl sm:text-4xl font-black text-white mb-4 leading-tight drop-shadow-lg">{title}</p>
        {location.address && (
          <a
            href={mapHref}
            target="_blank"
            rel="noreferrer"
            className="text-slate-200 text-sm sm:text-base leading-relaxed max-w-2xl mb-5 font-medium hover:text-amber-300 transition-colors"
          >
            {location.address}
          </a>
        )}
        <a
          href={mapHref}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 self-center sm:self-start mb-6 px-5 py-2.5 rounded-xl bg-amber-400 text-slate-950 font-black text-sm hover:bg-amber-300"
        >
          <MapPin className="w-4 h-4" />
          مشاهده نقشه
        </a>
        {hours && (
          <div className="flex flex-wrap items-center gap-6 pt-5 border-t border-white/15">
            <div className="flex items-center gap-2.5 text-sm sm:text-base text-amber-300 font-bold bg-[#001c3d]/70 px-5 py-2.5 rounded-xl border border-amber-400/25">
              <Clock className="w-4 h-4" />
              <span>{hours}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
