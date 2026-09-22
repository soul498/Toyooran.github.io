import React from 'react';
import { Clock } from '../icons';

interface UnderConstructionProps {
  title?: string;
  description?: string;
}

export const UnderConstruction: React.FC<UnderConstructionProps> = ({
  title = "در حال آماده‌سازی و بارگذاری...",
  description = "ما در حال ارتقاء و تکمیل این بخش با اطلاعات جدید، تصاویر باکیفیت و امکانات پیشرفته هستیم. به زودی با تجربه کاربری کامل‌تری در خدمت شما خواهیم بود."
}) => {
  return (
    <div className="w-full relative py-8 px-4 sm:px-6 lg:px-8 z-10">
      <div className="max-w-4xl mx-auto w-full">
        <div className="bg-white rounded-[2rem] p-8 sm:p-12 border border-slate-200 text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-[#003F86] flex items-center justify-center">
            <Clock className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-4 leading-tight">
            {title}
          </h2>
          <p className="text-base text-slate-600 max-w-2xl mx-auto font-medium leading-relaxed">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
};
