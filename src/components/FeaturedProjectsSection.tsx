import React, { useState, useRef, useEffect } from 'react';
import { useInView } from 'motion/react';
import { Project } from '../types';
import { PROJECTS } from '../data/mockData';
import { PageBanner } from './PageBanner';
import { Link } from 'react-router-dom';
import { LazyImage } from './LazyImage';

interface FeaturedProjectsSectionProps {
  projects?: Project[];
  onSelectProject: (project: Project) => void;
  onOpenConsultation: () => void;
}


export const FeaturedProjectsSection: React.FC<FeaturedProjectsSectionProps> = ({
  projects = PROJECTS,
  onSelectProject,
  onOpenConsultation,
}) => {
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [visibleCount, setVisibleCount] = useState(6);
  
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(loadMoreRef, { margin: "200px 0px" });

  useEffect(() => {
    setVisibleCount(6);
  }, [activeFilter]);

  useEffect(() => {
    if (isInView) {
      setVisibleCount(prev => prev + 6);
    }
  }, [isInView]);

  const filterTabs = [
    { id: 'all', label: 'همه پروژه‌ها' },
    { id: 'broiler', label: 'مرغداری گوشتی' },
    { id: 'layer', label: 'مرغداری تخم‌گذار' },
    { id: 'feed_mill', label: 'کارخانه خوراک' },
    { id: 'breeder', label: 'مادر و اجداد' },
  ];

  const filteredProjects = activeFilter === 'all' 
    ? projects 
    : projects.filter(p => p.type === activeFilter);
    
  const displayedProjects = filteredProjects.slice(0, visibleCount);

  return (
    <section className="min-h-screen relative z-0" id="projects-section">
      <PageBanner
        title="پروژه‌های اجرا شده"
        subtitle="نمونه سالن گوشتی، تخم‌گذار و کارخانه خوراک با نتایج واقعی ظرفیت و راندمان"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pb-20 grid md:grid-cols-2 gap-6">
        {displayedProjects.map((project) => (
          <Link key={project.id} to={`/projects/${project.id}`} className="bg-white rounded-3xl border border-slate-200 overflow-hidden hover:shadow-lg">
            <LazyImage src={project.image} alt={project.title} className="w-full h-48" />
            <div className="p-5">
              <h2 className="font-black text-slate-900 mb-2">{project.title}</h2>
              <p className="text-sm text-slate-600">{project.location} · {project.year}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};
