import React from 'react';
import { UnderConstruction } from './UnderConstruction';

interface FeaturedProjectsSectionProps {
  projects?: unknown;
  onSelectProject?: (project: unknown) => void;
  onOpenConsultation?: () => void;
}

export const FeaturedProjectsSection: React.FC<FeaturedProjectsSectionProps> = () => {
  return (
    <section className="min-h-screen relative z-0" id="projects-section">
      {/* Section hero is rendered by App (RouteHero) from src/data/pageHeroes.ts. */}
      <UnderConstruction
        title="درحال بارگزاری..."
        description="آرشیو پروژه‌های واقعی در حال آماده‌سازی است. برای بازدید از سالن اجراشده یا دریافت مشخصات فنی، از صفحه تماس درخواست مشاوره بدهید."
      />
    </section>
  );
};
