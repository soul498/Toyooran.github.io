import React from 'react';
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
      <PageBanner
        title="پروژه‌های اجرا شده"
        subtitle="نمونه‌کارهای تجهیز سالن و خطوط خوراک به‌زودی در این بخش منتشر می‌شود"
      />
      <UnderConstruction
        title="این بخش در حال بارگزاری هست"
        description="آرشیو پروژه‌های واقعی در حال آماده‌سازی است. برای بازدید از سالن اجراشده یا دریافت مشخصات فنی، از صفحه تماس درخواست مشاوره بدهید."
      />
    </section>
  );
};
