import { ProductPage } from './components/ProductPage';
import { ProductCatalogSection } from './components/ProductCatalogSection';
import { ServicePage } from './components/ServicePage';
import { ProjectPage } from './components/ProjectPage';
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import { ScrollProgress } from './components/ScrollProgress';
import { DataProvider, useData } from './context/DataContext';
import { PageSection, Product, Project, Service, Article, ProductCategory } from './types';

// Admin Components
import { AdminLogin } from './admin/AdminLogin';
import { AdminPanel } from './admin/AdminPanel';

// Public Components
import { CustomCursor } from './components/CustomCursor';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { TrustBar } from './components/TrustBar';
import { CategoryHexSection } from './components/CategoryHexSection';
import { WorkflowSection } from './components/WorkflowSection';
import { ServicesSection } from './components/ServicesSection';
import { FeaturedProjectsSection } from './components/FeaturedProjectsSection';
import { MagazineFeed } from './components/magazine/MagazineFeed';
import { MagazineArticle } from './components/magazine/MagazineArticle';
import { AboutPage } from './components/AboutPage';
import { RnDPage } from './components/RnDPage';
import { CompactShowcase } from './components/CompactShowcase';
import { ContactPage } from './components/ContactPage';
import { AboutContactUnifiedSection } from './components/AboutContactUnifiedSection';
import { Footer } from './components/Footer';
import { NotFoundPage } from './components/NotFoundPage'; // Added

// Modals
import { CaseStudyModal } from './components/Modals/CaseStudyModal';
import { ServiceDetailModal } from './components/Modals/ServiceDetailModal';
import { GlobalSearchModal } from './components/Modals/GlobalSearchModal';
import { AiEngineerAssistantModal } from './components/AiEngineerAssistantModal';

import { useParams } from 'react-router-dom';

import { SEO } from "./components/SEO";

const SEORoute = ({ title, description, children }: { title: string, description: string, children: React.ReactNode }) => {
  return (
    <>
      <SEO title={title} description={description} />
      {children}
    </>
  );
};

// Component to scroll to top on route change
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    if ((window as any).lenis) {
      (window as any).lenis.scrollTo(0, { immediate: true });
    } else {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [pathname]);
  return null;
};

const MagazineArticleWrapper = ({ articles, onBack, onSelectProductById }: any) => {
  const { articleId } = useParams();
  const article = articles.find((a: any) => a.id === articleId);
  if (!article) return <NotFoundPage />;
  return (
    <SEORoute title={`${article.title} | مجله طیوران صنعت پویا`} description={article.excerpt}>
      <MagazineArticle article={article} onBack={onBack} onSelectProductById={onSelectProductById} />
    </SEORoute>
  );
};

const MainAppInner: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  // Initialize Smooth Scrolling (Lenis)
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      touchMultiplier: 2,
      infinite: false,
    });

    (window as any).lenis = lenis;
    function raf(time: any) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
      delete (window as any).lenis;
    };
  }, []);
  const { 
    isAuthenticated, 
    products, 
    projects, 
    services, 
    articles, 
    categories, 
    companyInfo, 
    heroCms 
  } = useData();

  // Navigation and consultation state
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'all'>('all');

  // Unified Consultation / Quote Form prefill state
  const [consultationSubject, setConsultationSubject] = useState<string | undefined>('مرغداری گوشتی');
  const [consultationProduct, setConsultationProduct] = useState<string | undefined>('');
  const [consultationMessage, setConsultationMessage] = useState<string | undefined>('');

  // Modals state
  const handleSelectProduct = (product: Product) => {
    navigate(`/products/${product.code || product.id}`);
  };

  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAiAssistantOpen, setIsAiAssistantOpen] = useState(false);

  const navigateToPublic = () => {
    navigate('/');
  };

  const handleNavigateSection = (section: PageSection) => {
    if (section === 'home') navigate('/');
    else if (section === 'products') navigate('/products');
    else if (section === 'services') navigate('/services');
    else if (section === 'projects') navigate('/projects');
    else if (section === 'knowledge') navigate('/magazine');
    else if (section === 'about') navigate('/about');
    else if (section === 'rnd') navigate('/rnd');
    else if (section === 'contact') navigate('/contact');
  };
  
  // Helper to determine currentSection for Navbar
  const currentSection = location.pathname === '/' ? 'home' : 
                         location.pathname === '/products' ? 'products' : 
                         location.pathname === '/services' ? 'services' : 
                         location.pathname === '/projects' ? 'projects' : 
                         location.pathname.startsWith('/magazine') ? 'knowledge' : 
                         location.pathname === '/about' ? 'about' : 
                         location.pathname === '/rnd' ? 'rnd' : 
                         location.pathname === '/contact' ? 'contact' : 'home';

  const handleSelectCategory = (cat: ProductCategory | 'all') => {
    setSelectedCategory(cat);
    if (cat === 'all') navigate('/products');
    else navigate(`/products/${cat}`);
  };

  // Unified Handler: Redirects all quotes and consultations to the unified form in Contact Us
  const handleOpenUnifiedConsultation = (subject?: string, product?: string, message?: string) => {
    if (subject) setConsultationSubject(subject);
    if (product !== undefined) setConsultationProduct(product);
    if (message !== undefined) setConsultationMessage(message);

    // Close any open modals
    setSelectedProject(null);
    setSelectedService(null);
    setIsAiAssistantOpen(false);

    if (currentSection === 'home' && location.pathname === '/contact') {
      const formEl = document.getElementById('free-consultation-form');
      if (formEl) {
        formEl.scrollIntoView({ behavior: 'smooth' });
        return;
      }
    }

    navigate('/contact');
    setTimeout(() => {
      document.getElementById('free-consultation-form')?.scrollIntoView({ behavior: 'smooth' });
    }, 200);
  };

  const handleRequestQuoteForProduct = (product: Product) => {
    handleOpenUnifiedConsultation(
      'استعلام قیمت و پیش‌فاکتور',
      product.name,
      `درخواست استعلام قیمت و مشخصات فنی برای محصول: ${product.name} (کد: ${product.code || product.id})`
    );
  };

  const handleSelectProductById = (productId: string) => {
    const found = products.find((p) => p.id === productId);
    if (found) {
      handleSelectProduct(found);
    }
  };

  // If Admin Route: render Admin Login or Admin Dashboard
  if (location.pathname.startsWith('/admin')) {
    if (isAuthenticated) {
      return <AdminPanel onViewPublicSite={navigateToPublic} />;
    }
    return <AdminLogin onBackToSite={navigateToPublic} />;
  }

  // Public Website View
  return (
    <div className="min-h-screen bg-blueprint-light text-[#333132] font-['Estedad',sans-serif] flex flex-col selection:bg-amber-400 selection:text-slate-950" dir="rtl">
      <ScrollToTop />
      <CustomCursor />
      <ScrollProgress />
      
      {/* Top Navbar */}
      <Navbar
        currentSection={currentSection}
        onNavigate={handleNavigateSection}
        onOpenConsultation={() => handleOpenUnifiedConsultation()}
        onOpenQuote={() => handleOpenUnifiedConsultation('استعلام قیمت و پیش‌فاکتور')}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenAiAssistant={() => setIsAiAssistantOpen(true)}
      />

      {/* Main Content by Section */}
      <main className="flex-1">
        <Routes>
          <Route path="/" element={
            <SEORoute title="تجهیز و نوسازی سالن مرغداری | طیوران صنعت پویا" description="طراحی، تأمین تجهیزات و اجرای نوسازی سالن مرغداری: تهویه، گرمایش، دانخوری و آبخوری. استعلام فنی از طیوران صنعت پویا.">
              <Hero
                cmsHero={heroCms}
                onNavigate={handleNavigateSection}
                onSelectCategory={handleSelectCategory}
                onOpenConsultation={() => handleOpenUnifiedConsultation()}
                onOpenQuote={() => handleOpenUnifiedConsultation('استعلام قیمت و پیش‌فاکتور')}
                onOpenAiAssistant={() => setIsAiAssistantOpen(true)}
              >
                <CompactShowcase 
                  products={products}
                  articles={articles}
                  onNavigate={handleNavigateSection}
                  onSelectProduct={handleSelectProductById}
                  onSelectArticle={(articleId) => navigate(`/magazine/${articleId}`)}
                />
                <AboutContactUnifiedSection />
              </Hero>
            </SEORoute>
          } />
          <Route path="/products/:productId" element={<ProductPage />} />
          <Route path="/products" element={
            <SEORoute title="تجهیزات مرغداری: تهویه، هیتر، دانخوری، آبخوری | طیوران صنعت پویا" description="کاتالوگ هواکش، جت‌هیتر، دانخوری پروانه‌ای و آبخوری نیپل. استعلام قیمت.">
              <ProductCatalogSection
                products={products}
                selectedCategory={selectedCategory}
                onSelectCategory={handleSelectCategory}
                onSelectProduct={handleSelectProduct}
                onRequestQuoteForProduct={handleRequestQuoteForProduct}
              />
            </SEORoute>
          } />
          <Route path="/services/:serviceId" element={<ServicePage onOpenConsultation={(title) => handleOpenUnifiedConsultation(title, undefined, `مشاوره درباره خدمت: ${title}`)} />} />
          <Route path="/services" element={
            <SEORoute title="خدمات طراحی و تجهیز مرغداری | طیوران صنعت پویا" description="از طراحی سالن تا نصب تهویه، گرمایش و سیستم دان. درخواست مشاوره فنی.">
              <ServicesSection
                services={services}
                onSelectService={setSelectedService}
                onSelectCategory={handleSelectCategory}
                onOpenConsultation={() => handleOpenUnifiedConsultation('سوله و سالن صنعتی')}
              />
            </SEORoute>
          } />
          <Route path="/projects/:projectId" element={<ProjectPage onOpenConsultation={(title) => handleOpenUnifiedConsultation('سوله و سالن صنعتی', undefined, `مشاوره درباره پروژه: ${title}`)} />} />
          <Route path="/projects" element={
            <SEORoute title="پروژه‌های تجهیز مرغداری | طیوران صنعت پویا" description="نمونه کارهای اجرایی طیوران صنعت پویا در سالن مرغداری و کارخانه خوراک.">
              <FeaturedProjectsSection
                projects={projects}
                onSelectProject={setSelectedProject}
                onOpenConsultation={() => handleOpenUnifiedConsultation('سوله و سالن صنعتی')}
              />
            </SEORoute>
          } />
          <Route path="/magazine" element={
            <SEORoute title="مجله تخصصی و مقالات مرغداری | Toyooran" description="دانش‌نامه و مجله تخصصی صنعت مرغداری. مقالات آموزشی پرورش طیور، تجهیزات و جدیدترین اخبار.">
              <MagazineFeed
                articles={articles}
                onSelectArticle={(article) => {
                  setSelectedArticle(article);
                  navigate(`/magazine/${article.id}`);
                }}
              />
            </SEORoute>
          } />
          <Route path="/magazine/:articleId" element={
            <MagazineArticleWrapper
               articles={articles}
               onBack={() => navigate('/magazine')}
               onSelectProductById={handleSelectProductById}
            />
          } />
          <Route path="/about" element={
            <SEORoute title="درباره ما | شرکت طیوران صنعت پویا" description="معرفی شرکت طیوران صنعت پویا، تاریخچه، گواهینامه‌ها و چشم‌انداز فعالیت در حوزه تجهیزات مدرن مرغداری.">
              <AboutPage />
            </SEORoute>
          } />
          <Route path="/rnd" element={
            <SEORoute title="تحقیق و توسعه | شرکت طیوران صنعت پویا" description="واحد تحقیق و توسعه شرکت طیوران صنعت پویا.">
              <RnDPage />
            </SEORoute>
          } />
          <Route path="/contact" element={
            <SEORoute title="تماس با ما و مشاوره | Toyooran" description="ارتباط با کارشناسان فروش، پشتیبانی فنی و ثبت درخواست مشاوره برای راه‌اندازی و تجهیز مرغداری.">
              <ContactPage 
                initialSubject={consultationSubject}
                initialProduct={consultationProduct}
                initialMessage={consultationMessage}
              />
            </SEORoute>
          } />
          {/* Catch-all for unknown routes */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>

      {/* Footer */}
      <Footer 
        onNavigate={handleNavigateSection}
        onSelectCategory={handleSelectCategory}
        onOpenConsultation={() => handleOpenUnifiedConsultation()}
        onOpenQuote={() => handleOpenUnifiedConsultation('استعلام قیمت و پیش‌فاکتور')}
        companyInfo={companyInfo}
        categories={categories}
      />

      {/* Detail Modals (Technical specifications & info) */}
      {selectedProject && (
        <CaseStudyModal
          project={selectedProject}
          isOpen={!!selectedProject}
          onClose={() => setSelectedProject(null)}
          onOpenConsultation={() => handleOpenUnifiedConsultation('سوله و سالن صنعتی', undefined, `مشاوره درباره پروژه: ${selectedProject.title}`)}
        />
      )}

      {selectedService && (
        <ServiceDetailModal
          service={selectedService}
          isOpen={!!selectedService}
          onClose={() => setSelectedService(null)}
          onOpenConsultation={() => handleOpenUnifiedConsultation(selectedService.title, undefined, `مشاوره درباره خدمت: ${selectedService.title}`)}
        />
      )}

      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectProduct={handleSelectProduct}
        onSelectProject={setSelectedProject}
        onSelectArticle={setSelectedArticle}
      />

      <AiEngineerAssistantModal
        isOpen={isAiAssistantOpen}
        onClose={() => setIsAiAssistantOpen(false)}
        onOpenQuote={() => {
          setIsAiAssistantOpen(false);
          handleOpenUnifiedConsultation('استعلام قیمت و پیش‌فاکتور');
        }}
      />

    </div>
  );
};

export default function App() {
  return (
    <DataProvider>
      <BrowserRouter>
        <MainAppInner />
        <Toaster position="bottom-center" toastOptions={{ style: { background: '#333', color: '#fff', borderRadius: '12px', fontFamily: 'Estedad, sans-serif' } }} />
      </BrowserRouter>
    </DataProvider>
  );
}
