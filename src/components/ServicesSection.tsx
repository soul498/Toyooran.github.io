import React, { useRef, useState, useEffect } from 'react';
import { 
  Building2, 
  Wrench, 
  TrendingUp, 
  Factory,
  Pill,
} from '../icons';
import { useInView } from '../lib/useInView';
import { Service } from '../types';
import { SERVICES } from '../data/mockData';
import { ServiceCard } from './Hero';
import { PageBanner } from './PageBanner';

import { Fan } from '../icons';
const categoryCards = [
    {
      id: 'heating',
      title: 'ماشین‌آلات خوراک',
      categoryEn: 'Feed Machinery',
      icon: Factory,
      desc: 'پرس پلت، اکسترودر، میکرودایزینگ و آسیاب میکسر',
      badge: 'کارخانجات خوراک',
      accentColor: '#003F86',
      badgeBg: 'bg-blue-50',
      badgeText: 'text-[#003F86]',
      specs: ['پرس پلت ۲ الی ۲۰ تن/ساعت', 'میکرودایزینگ دقیق افزودنی‌ها'],
      bgImage: '/images/service_feed_machinery.jpg'
    },
    {
      id: 'ventilation',
      title: 'تجهیزات مرغداری',
      categoryEn: 'Farm Equipment',
      icon: Fan,
      desc: 'بشقاب پروانه‌ای FDA، آبخوری نیپل و جت هیتر',
      badge: 'تاییدیه FDA آمریکا',
      accentColor: '#FF9F14',
      badgeBg: 'bg-amber-50',
      badgeText: 'text-amber-700',
      specs: ['بشقاب پروانه‌ای لیسانس آمریکا', 'جت هیتر و سیستم‌های گرمایشی'],
      bgImage: '/images/service_farm_equipment.jpg'
    },
    {
      id: 'cooling',
      title: 'سوله و سالن صنعتی',
      categoryEn: 'Turnkey Shed',
      icon: Building2,
      desc: 'طراحی، ساخت و تجهیز کامل سوله‌های پرورشی',
      badge: 'پیمانکاری Turn-key',
      accentColor: '#10B981',
      badgeBg: 'bg-emerald-50',
      badgeText: 'text-emerald-700',
      specs: ['سازه‌های مقاوم و عایق', 'اتوماسیون هوشمند یکپارچه'],
      bgImage: '/images/service_turnkey_shed.jpg'
    },
    {
      id: 'other',
      title: 'قطعات و پشتیبانی',
      categoryEn: 'Parts & Support',
      icon: Wrench,
      desc: 'تامین قطعات یدکی، گارانتی ۲۴ ماهه و تعمیرات',
      badge: 'خدمات پس از فروش',
      accentColor: '#F43F5E',
      badgeBg: 'bg-rose-50',
      badgeText: 'text-rose-700',
      specs: ['تامین فوری قطعات مصرفی', 'پشتیبانی فنی ۲۴/۷'],
      bgImage: '/images/service_supplements.jpg'
    }
  ];

import { Link } from 'react-router-dom';

interface ServicesSectionProps {
  services?: Service[];
  onSelectService: (service: Service) => void;
  onSelectCategory?: (categoryId: any) => void;
  onOpenConsultation: () => void;
}

const iconMap: Record<string, React.ElementType> = {
  Building2,
  Factory,
  Wrench,
  Pill,
  TrendingUp,
};


export const ServicesSection: React.FC<ServicesSectionProps> = ({
  services = SERVICES,
  onSelectService,
  onSelectCategory,
  onOpenConsultation,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [visibleCount, setVisibleCount] = useState(6);
  const { ref: loadMoreRef, isInView } = useInView<HTMLDivElement>();

  useEffect(() => {
    if (isInView) {
      setVisibleCount(prev => prev + 6);
    }
  }, [isInView]);

  const displayedServices = services.slice(0, visibleCount);
  
  return (
    <section className="min-h-screen relative z-0" id="services-section">
      <PageBanner
        title="خدمات طراحی، تجهیز و نوسازی مرغداری"
        subtitle="از طراحی سوله تا نصب دانخوری، تهویه و گرمایش — استعلام فنی از طیوران صنعت پویا"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 lg:pb-24 relative z-10">

        {/* Services Grid */}
        
        {/* 🎨 Dribbble-Worthy High-Fidelity Magic Cards */}
        <div className="relative z-10 w-full py-8 lg:py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6 w-full">
            {categoryCards.map((card, idx) => (
              <ServiceCard key={idx} idx={idx} card={card} onClick={() => onSelectCategory && onSelectCategory(card.id)} />
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-10">
            <Link to="/services/poultry-hall-fitout" className="bg-white border border-slate-200 rounded-3xl p-6 font-black text-slate-900 hover:border-[#003F86]">
              نوسازی و تجهیز کامل سالن مرغداری
            </Link>
            {services.slice(0, 4).map((service) => (
              <Link key={service.id} to={`/services/${service.id}`} className="bg-white border border-slate-200 rounded-3xl p-6 font-bold text-slate-800 hover:border-[#003F86]">
                {service.title}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
