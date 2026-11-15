import React, { useState } from 'react';
import { ServiceCard } from './Hero';
import { ServicePreview } from './ServicePreview';
import { LANDING_SERVICE_CARDS } from '../data/landingServiceCards';
import { translateDeep } from '../i18n';

interface ServicesSectionProps {
  services?: unknown;
  onSelectService?: (service: unknown) => void;
  onSelectCategory?: (categoryId: unknown) => void;
  onOpenConsultation?: () => void;
}

export const ServicesSection: React.FC<ServicesSectionProps> = () => {
  const [openSlug, setOpenSlug] = useState<string | null>(null);
  const cards = translateDeep(LANDING_SERVICE_CARDS);
  const openCard = cards.find((card) => card.serviceId === openSlug);

  return (
    <section className="min-h-screen relative z-0" id="services-section">
      {/* Section hero is rendered by App (RouteHero) from src/data/pageHeroes.ts. */}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 lg:pb-24 relative z-10">
        <div className="relative z-10 w-full py-8 lg:py-12">
          <div className={`services-split${openSlug ? ' services-split--open' : ''}`}>
            <div className={`grid gap-5 lg:gap-6 w-full ${openSlug ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
              {cards.map((card, idx) => (
                <ServiceCard
                  key={card.serviceId}
                  idx={idx}
                  card={card}
                  preview
                  selected={openSlug === card.serviceId}
                  onClick={() => setOpenSlug((current) => (current === card.serviceId ? null : card.serviceId))}
                />
              ))}
            </div>
            <ServicePreview
              key={openSlug ?? 'closed'}
              slug={openSlug}
              icon={openCard?.icon}
              bgImage={openCard?.bgImage}
              onClose={() => setOpenSlug(null)}
            />
          </div>
        </div>
      </div>
    </section>
  );
};
