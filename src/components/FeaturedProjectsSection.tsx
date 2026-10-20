import React from 'react';
import { PAGE_HEROES } from '../data/pageHeroes';
import { PageBanner } from './PageBanner';
import { UnderConstruction } from './UnderConstruction';

interface FeaturedProjectsSectionProps {
  projects?: unknown;
  onSelectProject?: (project: unknown) => void;
  onOpenConsultation?: () => void;
}

export const FeaturedProjectsSection: React.FC<FeaturedProjectsSectionProps> = () => {
  return (
    <section className="min-h-screen relative z-0" id="projects-section">
      <PageBanner {...PAGE_HEROES['/projects']} />
      <UnderConstruction
        title="درحال بارگزاری..."
        description="آرشیو پروژه‌های واقعی در حال آماده‌سازی است. برای بازدید از سالن اجراشده یا دریافت مشخصات فنی، از صفحه تماس درخواست مشاوره بدهید."
      />
    </section>
  );
};
