import React from 'react';
import { UnderConstruction } from './UnderConstruction';

export const RnDPage: React.FC = () => {
  return (
    <div className="bg-blueprint-light min-h-screen">
      {/* Section hero is rendered by App (RouteHero) from src/data/pageHeroes.ts. */}
      <div className="w-full relative z-10">
        <UnderConstruction 
          title="دپارتمان تحقیق و توسعه در حال تجهیز است" 
          description="ما در حال گردآوری و طراحی بخش‌های مربوط به دستاوردهای علمی، اختراعات ثبت شده و پروژه‌های مشترک با دانشگاه‌ها هستیم. این بخش به زودی در دسترس متخصصین قرار خواهد گرفت."
        />
      </div>
    </div>
  );
};
