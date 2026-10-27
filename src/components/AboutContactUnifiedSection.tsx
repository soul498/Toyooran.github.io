import React, { useState } from "react";
import { AparatIcon } from "./AparatIcon";
import { SocialIconLink } from './SocialIconLink';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Instagram, 
  Send, 
  MessageCircle, 
  Linkedin,
  Building2,
  Factory,
  Map,
  Youtube,
  Tv,
  Grid
} from '../icons';
import { useData } from '../context/DataContext';
import { SALES_PHONE_DISPLAY, SALES_PHONE_TEL } from '../data/contact';
import { LocationDetailPane } from './LocationDetailPane';

export const AboutContactUnifiedSection: React.FC = () => {
  const { companyInfo } = useData();
  const [activeLocationIndex, setActiveLocationIndex] = useState(0);
  
  // Clean Data Extractions
  const email = companyInfo.email || 'info@pooyapoultry.com';
  const locations = companyInfo.locations || [];
  
  const hasSocials = companyInfo.socialLinks && Object.values(companyInfo.socialLinks).some(link => typeof link === 'string' && link.trim() !== '');

  const activeLocation = locations[activeLocationIndex] || null;

  return (
    <section className="relative w-full overflow-hidden z-10">
      <style>{`
        .dir-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .dir-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.1);
          border-radius: 8px;
        }
        .dir-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.15);
          border-radius: 8px;
        }
        .dir-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(251, 191, 36, 0.4);
        }
      `}</style>

      <div className="w-full">
        
        {/* Massive Dark Cinematic Card */}
        <div className="bg-[#001c3d] rounded-[2.5rem] sm:rounded-[3.5rem] p-6 sm:p-12 lg:p-16 relative overflow-hidden flex flex-col shadow-[0_30px_60px_rgba(0,0,0,0.1)]">
          
          {/* Ambient Background Magic */}
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[radial-gradient(circle_at_center,_rgba(245,158,11,0.08)_0%,_transparent_70%)] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-[radial-gradient(circle_at_center,_rgba(0,63,134,0.15)_0%,_transparent_70%)] translate-y-1/3 -translate-x-1/3 pointer-events-none" />
          <div className="absolute inset-0 bg-[url('/images/cubes.png')] opacity-[0.03] pointer-events-none" />

          {/* TOP ROW: Manifesto & Core Contacts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 relative z-10">
            {/* Left: Manifesto */}
            <div className="flex flex-col justify-center">
              <span className="text-amber-400 font-black tracking-widest text-xs uppercase mb-6 flex items-center gap-3 drop-shadow-md">
                <div className="w-8 h-px bg-amber-400/50" />
                ارتباط با طیوران صنعت پویا
              </span>
              
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-[1.2] mb-6 drop-shadow-lg">
                آینده‌ی صنعت را <br/>
                <span className="text-amber-300">
                  با هم بسازیم.
                </span>
              </h2>
              
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-0 font-medium max-w-md">
                تیم مهندسی طیوران صنعت پویا آماده ارائه مشاوره تخصصی در زمینه راه‌اندازی و تجهیز مدرن‌ترین سیستم‌های پرورشی است.
              </p>
            </div>

            {/* Right: Core Contacts */}
            <div className="flex flex-col gap-6 justify-center lg:pl-10">
              {/* Phone */}
              <div className="flex flex-col gap-4">
                <div className="group flex items-center gap-5">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-amber-400 group-hover:bg-amber-400 group-hover:text-slate-900 transition-colors shrink-0">
                    <Phone className="w-6 h-6 sm:w-7 sm:h-7" />
                  </div>
                  <div>
                    <span className="block text-[11px] sm:text-xs text-slate-300 font-bold mb-1 uppercase tracking-wider">مشاوره و فروش</span>
                    <a href={SALES_PHONE_TEL} className="block text-xl sm:text-2xl text-white font-black hover:text-amber-400 transition-colors drop-shadow-md" dir="ltr" style={{ textAlign: 'right' }}>{SALES_PHONE_DISPLAY}</a>
                  </div>
                </div>
              </div>
              
              {/* Social Links Row */}
              {hasSocials && (
                <div className="mt-6">
                  <span className="text-xs font-bold text-slate-300 block mb-3">شبکه‌های اجتماعی:</span>
                  <div className="flex flex-nowrap items-center gap-2 overflow-x-auto pb-1">
                  <SocialIconLink
                    href={companyInfo.socialLinks?.instagram}
                    label="اینستاگرام"
                    comingSoon="صفحهٔ اینستاگرام طیوران صنعت پویا به‌زودی راه‌اندازی می‌شود"
                    className="rounded-xl bg-white/5 border border-white/10 text-slate-300 flex items-center justify-center hover:bg-gradient-to-tr hover:from-yellow-400 hover:via-pink-500 hover:to-purple-500 hover:text-white hover:border-transparent hover:scale-110 hover:-rotate-12 transition-all duration-300"
                  >
                    <Instagram className="w-4 h-4" aria-hidden="true" />
                  </SocialIconLink>
                  <SocialIconLink
                    href={companyInfo.socialLinks?.telegram}
                    label="تلگرام"
                    comingSoon="کانال تلگرام طیوران صنعت پویا به‌زودی راه‌اندازی می‌شود"
                    className="rounded-xl bg-white/5 border border-white/10 text-slate-300 flex items-center justify-center hover:bg-[#0088cc] hover:text-white hover:border-transparent hover:scale-110 hover:rotate-12 transition-all duration-300"
                  >
                    <Send className="w-4 h-4 ml-0.5" aria-hidden="true" />
                  </SocialIconLink>
                  <SocialIconLink
                    href={companyInfo.socialLinks?.aparat}
                    label="آپارات"
                    comingSoon="کانال آپارات طیوران صنعت پویا به‌زودی راه‌اندازی می‌شود"
                    className="rounded-xl bg-white/5 border border-white/10 text-slate-300 flex items-center justify-center hover:bg-[#263238] hover:text-white hover:border-transparent hover:scale-110 hover:-rotate-12 transition-all duration-300"
                  >
                    <AparatIcon className="w-4 h-4" />
                  </SocialIconLink>
                  <SocialIconLink
                    href={companyInfo.socialLinks?.rubika}
                    label="روبیکا"
                    comingSoon="کانال روبیکا طیوران صنعت پویا به‌زودی راه‌اندازی می‌شود"
                    className="rounded-xl bg-white/5 border border-white/10 text-slate-300 flex items-center justify-center hover:bg-gradient-to-r hover:from-[#ff7300] hover:to-[#7600b5] hover:text-white hover:border-transparent hover:scale-110 hover:rotate-12 transition-all duration-300"
                  >
                    <Grid className="w-4 h-4" aria-hidden="true" />
                  </SocialIconLink>
                  <SocialIconLink
                    href={companyInfo.socialLinks?.youtube}
                    label="یوتیوب"
                    comingSoon="کانال یوتیوب طیوران صنعت پویا به‌زودی راه‌اندازی می‌شود"
                    className="rounded-xl bg-white/5 border border-white/10 text-slate-300 flex items-center justify-center hover:bg-[#ff0000] hover:text-white hover:border-transparent hover:scale-110 hover:-rotate-12 transition-all duration-300"
                  >
                    <Youtube className="w-4 h-4" aria-hidden="true" />
                  </SocialIconLink>
                  <SocialIconLink
                    href={companyInfo.socialLinks?.linkedin}
                    label="لینکدین"
                    comingSoon="صفحهٔ لینکدین طیوران صنعت پویا به‌زودی راه‌اندازی می‌شود"
                    className="rounded-xl bg-white/5 border border-white/10 text-slate-300 flex items-center justify-center hover:bg-[#0a66c2] hover:text-white hover:border-transparent hover:scale-110 hover:rotate-12 transition-all duration-300"
                  >
                    <Linkedin className="w-4 h-4" aria-hidden="true" />
                  </SocialIconLink>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* BOTTOM ROW: Master-Detail Locations Directory */}
          {locations && locations.length > 0 && (
            <div id="addresses" className="mt-16 sm:mt-24 relative z-10">
              
              <div className="flex items-center gap-6 mb-10">
                <div className="h-px flex-1 bg-gradient-to-l from-white/20 to-transparent" />
                <h3 className="text-slate-200 font-bold text-lg tracking-widest uppercase">آدرس مراکز و شعب</h3>
                <div className="h-px flex-1 bg-gradient-to-r from-white/20 to-transparent" />
              </div>

              {/* Fixed-Height Container for Scalability */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-auto lg:h-[560px]">
                
                {/* 1. Left Sidebar: Scrollable List of Branches */}
                <div className="lg:col-span-4 bg-white/5 border border-white/10 rounded-[2rem] p-4 flex flex-col  h-[350px] lg:h-full relative overflow-hidden shadow-2xl">
                   {/* Fade masks for elegant scrolling */}
                   <div className="absolute top-0 left-0 right-0 h-6 bg-gradient-to-b from-slate-950/80 to-transparent z-10 pointer-events-none rounded-t-[2rem]" />
                   <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-slate-950/90 to-transparent z-10 pointer-events-none rounded-b-[2rem]" />
                   
                   <div className="flex-1 overflow-y-auto pl-2 pr-1 dir-scrollbar space-y-3 relative z-0 pb-6 pt-2">
                     {locations.map((loc, idx) => {
                        const isActive = idx === activeLocationIndex;
                        const isHQ = loc.type === 'headquarter';
                        const isFact = loc.type === 'factory';
                        const Icon = isHQ ? Building2 : isFact ? Factory : MapPin;

                        return (
                          <button
                            key={loc.id || idx}
                            type="button"
                            onClick={() => setActiveLocationIndex(idx)}
                            aria-current={isActive ? 'true' : undefined}
                            className={`w-full text-right flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 border ${
                              isActive
                                ? 'bg-white/10 border-amber-400/40 shadow-[0_0_20px_rgba(251,191,36,0.1)]'
                                : 'bg-transparent border-transparent hover:bg-white/5 hover:border-white/10'
                            }`}
                          >
                             <div className={`w-12 h-12 rounded-[14px] flex items-center justify-center shrink-0 transition-all duration-300 shadow-inner ${
                               isActive ? 'bg-amber-400 text-slate-900 shadow-white/20' : 'bg-white/5 text-slate-300 shadow-transparent'
                             }`}>
                               <Icon className="w-5 h-5" aria-hidden="true" />
                             </div>
                             <div className="flex-1 overflow-hidden">
                               <p className={`font-black truncate text-[13px] sm:text-sm mb-1 transition-colors ${isActive ? 'text-amber-400' : 'text-slate-200'}`}>
                                 {loc.title || (isHQ ? 'دفتر مرکزی' : 'شعبه')}
                               </p>
                               <p className="text-[11px] text-slate-300 truncate">{loc.address}</p>
                             </div>
                          </button>
                        )
                     })}
                   </div>
                </div>

                {activeLocation && (
                  <LocationDetailPane
                    deferMap
                    location={activeLocation}
                    hours={(activeLocation as { workingHours?: string }).workingHours || (activeLocation.type === 'headquarter' ? companyInfo.workingHours : null)}
                  />
                )}

              </div>
            </div>
          )}

        </div>
      </div>
    </section>
  );
};
