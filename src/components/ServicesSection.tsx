import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ServiceCard } from './Hero';
import { LANDING_SERVICE_CARDS } from '../data/landingServiceCards';
import { translateDeep } from '../i18n';

interface ServicesSectionProps {
  services?: unknown;
  onSelectService?: (service: unknown) => void;
  onSelectCategory?: (categoryId: unknown) => void;
  onOpenConsultation?: () => void;
}

export const ServicesSection: React.FC<ServicesSectionProps> = () => {
  const navigate = useNavigate();

  return (
    <section className="min-h-screen relative z-0" id="services-section">
      {/* Section hero is rendered by App (RouteHero) from src/data/pageHeroes.ts. */}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 lg:pb-24 relative z-10">
        <div className="relative z-10 w-full py-8 lg:py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6 w-full">
            {translateDeep(LANDING_SERVICE_CARDS).map((card, idx) => (
              <ServiceCard key={card.serviceId} idx={idx} card={card} onClick={() => navigate(card.to)} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
