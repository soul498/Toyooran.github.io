import React from "react";
import { AparatIcon } from "./AparatIcon";
import { Link } from 'react-router-dom';
import { SocialIconLink } from './SocialIconLink';
import { toTelHref, neshanMapsUrl } from '../lib/phone';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Instagram, 
  Send, 
  MessageCircle, 
  Linkedin,
  Youtube,
  Tv,
  Grid,
  ArrowLeft,
  ChevronLeft
} from '../icons';

interface FooterProps {
  onNavigate: (id: string) => void;
  onSelectCategory: (id: string) => void;
  onOpenConsultation: () => void;
  onOpenQuote: () => void;
  companyInfo: any;
  categories: any[];
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onSelectCategory, onOpenConsultation, onOpenQuote, companyInfo, categories }) => {
  const navigation = [
    { title: 'صفحه اصلی', path: '/' },
    { title: 'درباره ما', path: '/about' },
    { title: 'پروژه‌ها', path: '/projects' },
    { title: 'محصولات', path: '/products' },
    { title: 'خدمات', path: '/services' },
    { title: 'مجله', path: '/magazine' },
    { title: 'تماس با ما', path: '/contact' },
  ];

  

  const hq = companyInfo?.locations?.find(loc => loc.type === 'headquarter');

  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative w-full bg-[#020b18] pt-20 pb-6 overflow-hidden border-t border-white/5 z-20">
      
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-[700px] h-[700px] bg-[radial-gradient(circle_at_center,_rgba(59,130,246,0.05)_0%,_transparent_70%)] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[800px] h-[800px] bg-[radial-gradient(circle_at_center,_rgba(245,158,11,0.05)_0%,_transparent_70%)] translate-x-1/3 translate-y-1/3 pointer-events-none" />
      <div className="absolute inset-0 bg-[url('/images/cubes.png')] opacity-[0.02] mix-blend-overlay pointer-events-none" />

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 mb-16">
          
          {/* Column 1: Brand & About (Span 4) */}
          <div className="lg:col-span-4 flex flex-col">
            <div className="flex items-center gap-3 mb-6">
               <div className="h-14 flex items-center justify-center">
                  <img src="/images/logo-wide.png" alt="طیوران صنعت پویا" width={180} height={56} className="h-full w-auto object-contain" />
               </div>
               <div>
                  <p className="text-xl font-black text-white tracking-tight">{companyInfo?.name}</p>
                  <span className="text-xs text-amber-400 font-bold tracking-widest uppercase">{companyInfo?.nameEn}</span>
               </div>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed font-medium mb-8 max-w-sm">
              شرکت طیوران صنعت پویا، با بیش از 50 سال سابقه، پیشگام در طراحی، تولید و اجرای تجهیزات پرورشی و کارخانجات خوراک دام و طیور در خاورمیانه است.
            </p>
            
            {/* Social Links */}
            <div className="flex flex-nowrap items-center gap-2 overflow-x-auto pb-1">
              <SocialIconLink
                href={companyInfo?.socialLinks?.instagram}
                label="اینستاگرام"
                comingSoon="به زودی صفحه اینستاگرام ما راه‌اندازی می‌شود"
                className="rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white hover:bg-gradient-to-tr hover:from-yellow-400 hover:via-pink-500 hover:to-purple-500 hover:border-transparent transition-all duration-300 group"
              >
                <Instagram className="w-4 h-4 group-hover:scale-110 transition-transform" aria-hidden="true" />
              </SocialIconLink>
              <SocialIconLink
                href={companyInfo?.socialLinks?.telegram}
                label="تلگرام"
                comingSoon="به زودی کانال تلگرام ما راه‌اندازی می‌شود"
                className="rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white hover:bg-[#0088cc] hover:border-transparent transition-all duration-300 group"
              >
                <Send className="w-4 h-4 ml-0.5 group-hover:scale-110 transition-transform" aria-hidden="true" />
              </SocialIconLink>
              <SocialIconLink
                href={companyInfo?.socialLinks?.aparat}
                label="آپارات"
                comingSoon="به زودی کانال آپارات ما راه‌اندازی می‌شود"
                className="rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white hover:bg-[#263238] hover:border-transparent transition-all duration-300 group"
              >
                <AparatIcon className="w-4 h-4 group-hover:scale-110 transition-transform" />
              </SocialIconLink>
              <SocialIconLink
                href={companyInfo?.socialLinks?.rubika}
                label="روبیکا"
                comingSoon="به زودی کانال روبیکا ما راه‌اندازی می‌شود"
                className="rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white hover:bg-gradient-to-r hover:from-[#ff7300] hover:to-[#7600b5] hover:border-transparent transition-all duration-300 group"
              >
                <Grid className="w-4 h-4 group-hover:scale-110 transition-transform" aria-hidden="true" />
              </SocialIconLink>
              <SocialIconLink
                href={companyInfo?.socialLinks?.youtube}
                label="یوتیوب"
                comingSoon="به زودی کانال یوتیوب ما راه‌اندازی می‌شود"
                className="rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white hover:bg-[#ff0000] hover:border-transparent transition-all duration-300 group"
              >
                <Youtube className="w-4 h-4 group-hover:scale-110 transition-transform" aria-hidden="true" />
              </SocialIconLink>
              <SocialIconLink
                href={companyInfo?.socialLinks?.linkedin}
                label="لینکدین"
                comingSoon="به زودی صفحه لینکدین ما راه‌اندازی می‌شود"
                className="rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white hover:bg-[#0a66c2] hover:border-transparent transition-all duration-300 group"
              >
                <Linkedin className="w-4 h-4 group-hover:scale-110 transition-transform" aria-hidden="true" />
              </SocialIconLink>
            </div>
          </div>

          {/* Column 2: Quick Links (Span 2) */}
          <div className="lg:col-span-2 flex flex-col">
            <p className="text-white font-bold text-lg mb-6 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              دسترسی سریع
            </p>
            <ul className="space-y-3">
              {navigation.map((nav, idx) => (
                <li key={idx}>
                  <Link to={nav.path} className="text-slate-300 hover:text-amber-400 text-sm font-medium transition-colors flex items-center gap-1.5 group">
                    <ChevronLeft className="w-3.5 h-3.5 text-slate-600 group-hover:text-amber-400 transition-colors" />
                    {nav.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Services (Span 3) */}
          <div className="lg:col-span-3 flex flex-col">
            <p className="text-white font-bold text-lg mb-6 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              خدمات و محصولات
            </p>
            <ul className="space-y-3">
              <li>
                <Link to="/services/srv-machinery-manufacturing" className="text-slate-300 hover:text-blue-400 text-sm font-medium transition-colors flex items-center gap-1.5 group">
                  <ChevronLeft className="w-3.5 h-3.5 text-slate-600 group-hover:text-blue-400 transition-colors" />
                  ماشین‌آلات خوراک
                </Link>
              </li>
              <li>
                <Link to="/services/srv-poultry-equipment-supply" className="text-slate-300 hover:text-blue-400 text-sm font-medium transition-colors flex items-center gap-1.5 group">
                  <ChevronLeft className="w-3.5 h-3.5 text-slate-600 group-hover:text-blue-400 transition-colors" />
                  تجهیزات مرغداری
                </Link>
              </li>
              <li>
                <Link to="/services/poultry-hall-fitout" className="text-slate-300 hover:text-blue-400 text-sm font-medium transition-colors flex items-center gap-1.5 group">
                  <ChevronLeft className="w-3.5 h-3.5 text-slate-600 group-hover:text-blue-400 transition-colors" />
                  تجهیز و نوسازی سالن مرغداری
                </Link>
              </li>
              <li>
                <Link to="/services/srv-feed-formulation-pharma" className="text-slate-300 hover:text-blue-400 text-sm font-medium transition-colors flex items-center gap-1.5 group">
                  <ChevronLeft className="w-3.5 h-3.5 text-slate-600 group-hover:text-blue-400 transition-colors" />
                  خوراک و مکمل
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact Info (Span 3) */}
          <div className="lg:col-span-3 flex flex-col">
            <p className="text-white font-bold text-lg mb-6 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              اطلاعات تماس
            </p>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0 mt-1">
                  <Phone className="w-4 h-4 text-amber-400" />
                </div>
                <div className="space-y-1">
                  <span className="block text-[10px] text-slate-300 font-bold">تلفن دفتر مرکزی</span>
                  <a href={toTelHref(companyInfo?.phone || '۰۵۱-۳۶۶۶۵۶۰۰')} className="text-slate-300 hover:text-white font-medium text-sm transition-colors" dir="ltr">{companyInfo?.phone || '۰۵۱-۳۶۶۶۵۶۰۰'}</a>
                  <span className="block text-[10px] text-slate-300 font-bold pt-2">تلفن مشاوره و فروش</span>
                  <a href={toTelHref(companyInfo?.directSalesPhone || '۰۹۱۵۱۱۲۶۲۵۸')} className="text-slate-300 hover:text-white font-medium text-sm transition-colors" dir="ltr">{companyInfo?.directSalesPhone || '۰۹۱۵۱۱۲۶۲۵۸'}</a>
                </div>
              </div>
              
              {hq && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0 mt-1">
                    <MapPin className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-300 font-bold mb-1">دفتر مرکزی</span>
                    <a
                      href={neshanMapsUrl(hq.address, hq.lat, hq.lng)}
                      target="_blank"
                      rel="noreferrer"
                      className="text-slate-300 hover:text-amber-400 font-medium text-sm leading-relaxed"
                    >
                      {hq.address}
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
          
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-6" />

        {/* Copyright & Credits */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-medium text-slate-300">
          <p>
            © {currentYear} تمامی حقوق این وب‌سایت متعلق به طیوران صنعت پویا می‌باشد. طراحی و توسعه توسط <strong className="text-slate-200 font-black">هزارتو</strong>.
          </p>
          <div className="flex items-center gap-4">
             <span>قوانین و مقررات</span>
             <div className="w-1 h-1 rounded-full bg-slate-700" />
             <span>حریم خصوصی</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
