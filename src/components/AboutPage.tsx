import React from 'react';
import { LazyImage } from './LazyImage';
import { Building2, CheckCircle2, Factory, Globe2 } from '../icons';
import { SEO } from './SEO';
import { PageBanner } from './PageBanner';

export const AboutPage: React.FC = () => {
  return (
    <div className="bg-blueprint-light min-h-screen relative">
      <SEO 
        title="درباره طیوران صنعت پویا"
        description="مشاور، طراح و مجری توسعه و بهره‌برداری پروژه‌های صنعتی با بیش از ۵۰ سال تجربه در صنعت دام، طیور و آبزیان."
      />

      <PageBanner
        title="درباره طیوران صنعت پویا"
        subtitle="مشاور، طراح و مجری پروژه‌های دام، طیور و آبزیان با بیش از ۵۰ سال تجربه"
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 w-full pb-24">
        
        {/* Section 1: Intro */}
        <div className="bg-white rounded-[3rem] shadow-xl border border-white/50 overflow-hidden relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
            {/* Image */}
            <div className="relative h-96 lg:h-auto bg-slate-100">
               <LazyImage
                  src="/images/about-toyooran.jpg"
                  alt="طیوران صنعت پویا"
                  className="w-full h-full"
                  imgClassName="w-full h-full object-cover"
               />
               <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
            </div>

            {/* Content */}
            <div className="p-8 lg:p-16 flex flex-col justify-center">
              <div className="inline-flex items-center gap-2 bg-blue-50/50 text-[#003F86] px-4 py-2 rounded-xl mb-6 self-start font-bold text-sm border border-blue-100/50">
                <Building2 className="w-4 h-4" />
                درباره طیوران صنعت پویا
              </div>
              
              <h2 className="text-3xl lg:text-4xl font-black text-slate-900 leading-tight mb-6">
                مشاور، طراح و مجری توسعه و بهره‌برداری پروژه‌های صنعتی
              </h2>
              
              <p className="text-slate-600 leading-relaxed text-lg mb-8 text-justify font-medium">
                شرکت طیوران صنعت پویا با بیش از ۵۰ سال تجربه در صنعت دام، طیور و آبزیان، مجری بیش از ۲۰۰ پروژه ملی و بین‌المللی است. ما به عنوان یک مرجع تخصصی، راهکارهای جامع توسعه، طراحی، ساخت و تجهیز کامل سوله و کارخانجات را ارائه می‌دهیم.
              </p>

              <div className="space-y-6 mb-10">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#003F86]/10 flex items-center justify-center shrink-0 shadow-sm border border-[#003F86]/10">
                    <CheckCircle2 className="w-6 h-6 text-[#003F86]" />
                  </div>
                  <div>
                    <h3 className="text-slate-900 font-bold text-lg mb-1">لایسنس معتبر بین‌المللی</h3>
                    <p className="text-sm text-slate-600 leading-relaxed font-medium">تنها تولیدکننده بشقاب‌های پروانه‌ای تحت لیسانس Butterfly Concepts آمریکا با تاییدیه FDA.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center shrink-0 shadow-sm border border-amber-500/10">
                    <Factory className="w-6 h-6 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="text-slate-900 font-bold text-lg mb-1">تولید تخصصی ماشین‌آلات</h3>
                    <p className="text-sm text-slate-600 leading-relaxed font-medium">تولیدکننده تخصصی انواع جت هیتر، تجهیزات گرمایشی و ماشین‌آلات خطوط تولید خوراک دام و طیور.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center shrink-0 shadow-sm border border-emerald-500/10">
                    <Globe2 className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="text-slate-900 font-bold text-lg mb-1">گستره فعالیت و توسعه</h3>
                    <p className="text-sm text-slate-600 leading-relaxed font-medium">دارای دفتر تحقیق و توسعه (R&D) مستقر در دانشگاه منابع طبیعی گلستان و حضور فعال در بازارهای داخلی و خارجی.</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-slate-50/80 p-6 rounded-2xl border border-slate-200/60 flex flex-col sm:flex-row gap-4 justify-between items-center shadow-sm">
                 <div className="text-slate-700 text-sm font-bold flex items-center gap-2">
                   تلفن دفتر مرکزی:
                   <span className="font-mono text-[#003F86] text-base">۰۵۱۳۶۶۶۵۶۰۰</span>
                 </div>
                 <div className="w-px h-6 bg-slate-200 hidden sm:block"></div>
                 <div className="text-slate-700 text-sm font-bold flex items-center gap-2">
                   مشاوره فروش:
                   <span className="font-mono text-[#003F86] text-base">۰۹۱۵۱۱۲۶۲۵۸</span>
                 </div>
              </div>

            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
};
