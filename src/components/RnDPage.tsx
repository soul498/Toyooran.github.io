import React from 'react';
import { UnderConstruction } from './UnderConstruction';
import { useData } from '../context/DataContext';

import { t, translateCmsRecord } from '../i18n';
export const RnDPage: React.FC = () => {
  const { pageContent } = useData();
  const cms = translateCmsRecord(pageContent.rnd);
  return (
    <div className="bg-blueprint-light min-h-screen">
      {/* Section hero is rendered by App (RouteHero) from src/data/pageHeroes.ts. */}
      <div className="w-full relative z-10">
        <UnderConstruction 
          title={cms.title || t("دپارتمان تحقیق و توسعه در حال تجهیز است")}
          description={cms.description || t("بخش دستاوردهای علمی و پروژه‌های مشترک دانشگاهی طیوران صنعت پویا در حال آماده‌سازی است و به‌زودی منتشر می‌شود.")}
        />
      </div>
    </div>
  );
};
