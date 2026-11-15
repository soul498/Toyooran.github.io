import React, { Fragment, useState } from 'react';
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

  return (
    <section className="min-h-screen relative z-0" id="services-section">
      {/* Section hero is rendered by App (RouteHero) from src/data/pageHeroes.ts. */}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 lg:pb-24 relative z-10">
        <div className="relative z-10 w-full py-8 lg:py-12">
          <div className={`services-split${openSlug ? ' services-split--open' : ''}`}>
            {cards.map((card, idx) => (
              <Fragment key={card.serviceId}>
                <ServiceCard
                  idx={idx}
                  card={card}
                  preview
                  selected={openSlug === card.serviceId}
                  onClick={() => setOpenSlug((current) => (current === card.serviceId ? null : card.serviceId))}
                />
                {openSlug === card.serviceId ? (
                  <ServicePreview
                    key={card.serviceId}
                    slug={openSlug}
                    icon={card.icon}
                    bgImage={card.bgImage}
                    onClose={() => setOpenSlug(null)}
                  />
                ) : null}
              </Fragment>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
