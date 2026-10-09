import React, { useState, useEffect, useMemo, lazy, Suspense } from 'react';
import { sortArticlesNewestFirst } from './seo/articleMeta';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
const Toaster = lazy(() => import('react-hot-toast').then((m) => ({ default: m.Toaster })));
import { ScrollProgress } from './components/ScrollProgress';
import { DataProvider, useData } from './context/DataContext';
import { PageSection, Product, Project, Service, Article, ProductCategory } from './types';

const AdminLogin = lazy(() => import('./admin/AdminLogin').then((m) => ({ default: m.AdminLogin })));
const AdminPanel = lazy(() => import('./admin/AdminPanel').then((m) => ({ default: m.AdminPanel })));
const CrmApp = lazy(() => import('./crm/CrmApp').then((m) => ({ default: m.CrmApp })));
const ProductPage = lazy(() => import('./components/ProductPage').then((m) => ({ default: m.ProductPage })));
const ProductCatalogSection = lazy(() => import('./components/ProductCatalogSection').then((m) => ({ default: m.ProductCatalogSection })));
const ServicePage = lazy(() => import('./components/ServicePage').then((m) => ({ default: m.ServicePage })));
const ProjectPage = lazy(() => import('./components/ProjectPage').then((m) => ({ default: m.ProjectPage })));
const ServicesSection = lazy(() => import('./components/ServicesSection').then((m) => ({ default: m.ServicesSection })));
const FeaturedProjectsSection = lazy(() => import('./components/FeaturedProjectsSection').then((m) => ({ default: m.FeaturedProjectsSection })));
const MagazineFeed = lazy(() => import('./components/magazine/MagazineFeed').then((m) => ({ default: m.MagazineFeed })));
const MagazineArticle = lazy(() => import('./components/magazine/MagazineArticle').then((m) => ({ default: m.MagazineArticle })));
const AboutPage = lazy(() => import('./components/AboutPage').then((m) => ({ default: m.AboutPage })));
const RnDPage = lazy(() => import('./components/RnDPage').then((m) => ({ default: m.RnDPage })));
const ContactPage = lazy(() => import('./components/ContactPage').then((m) => ({ default: m.ContactPage })));
const CompactShowcase = lazy(() => import('./components/CompactShowcase').then((m) => ({ default: m.CompactShowcase })));
const AboutContactUnifiedSection = lazy(() => import('./components/AboutContactUnifiedSection').then((m) => ({ default: m.AboutContactUnifiedSection })));
const CaseStudyModal = lazy(() => import('./components/Modals/CaseStudyModal').then((m) => ({ default: m.CaseStudyModal })));
const ServiceDetailModal = lazy(() => import('./components/Modals/ServiceDetailModal').then((m) => ({ default: m.ServiceDetailModal })));
const GlobalSearchModal = lazy(() => import('./components/Modals/GlobalSearchModal').then((m) => ({ default: m.GlobalSearchModal })));
const AiEngineerAssistantModal = lazy(() => import('./components/AiEngineerAssistantModal').then((m) => ({ default: m.AiEngineerAssistantModal })));

import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Footer } from './components/Footer';
const CustomCursor = lazy(() => import('./components/CustomCursor').then((m) => ({ default: m.CustomCursor })));
import { NotFoundPage } from './components/NotFoundPage';
import { useParams } from 'react-router-dom';
import { SeoHead } from "./components/SEO";
import { publicProductPath } from "./seo/resolveSeo";

const RouteFallback = () => <div className="min-h-[40vh]" aria-hidden="true" />;

const MagazineArticleWrapper = ({ articles, onBack, onSelectProductById }: { articles: Article[]; onBack: () => void; onSelectProductById: (productId: string) => void }) => {
  const { articleId } = useParams();
  const { magazineReady } = useData();
  if (!magazineReady) return <div className="min-h-screen" aria-busy="true" />;
  const slug = articleId || "";
  const article = articles.find((item) => item.id === slug);
  const alias = articles.find((item) => item.id !== slug && item.aliases?.includes(slug));
  if (alias) return <Navigate to={`/magazine/${alias.id}`} replace />;
  if (!article) return <NotFoundPage />;
  return (
    <MagazineArticle article={article} onBack={onBack} onSelectProductById={onSelectProductById} />
  );
};

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);
  return null;
};

const MainAppInner: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { 
    isAuthenticated, 
    products, 
    projects, 
    services, 
    articles,
    magazineReady,
    categories, 
    companyInfo, 
    heroCms 
  } = useData();
  const publicArticles = useMemo(() => sortArticlesNewestFirst(articles.filter((article) => article.status !== 'draft')), [articles]);

  // Navigation and consultation state
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'all'>('all');

  // Unified Consultation / Quote Form prefill state
  const [consultationSubject, setConsultationSubject] = useState<string | undefined>('مرغداری گوشتی');
  const [consultationProduct, setConsultationProduct] = useState<string | undefined>('');
  const [consultationMessage, setConsultationMessage] = useState<string | undefined>('');

  // Modals state
  const handleSelectProduct = (product: Product) => {
    navigate(publicProductPath(product));
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
    else if (section === 'knowledge' || section === 'magazine' || section === 'magazine-article') navigate('/magazine');
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

  if (location.pathname === '/crm' || location.pathname.startsWith('/crm/')) {
    return (
      <Suspense fallback={<div className="min-h-screen bg-[#f5f5f7]" dir="rtl" />}>
        {isAuthenticated ? (
          <CrmApp />
        ) : (
          <AdminLogin mode="crm" />
        )}
      </Suspense>
    );
  }

  // If Admin Route: render Admin Login or Admin Dashboard
  if (location.pathname.startsWith('/admin')) {
    return (
      <Suspense fallback={<div className="min-h-screen bg-slate-950" dir="rtl" />}>
        {isAuthenticated ? (
          <AdminPanel onViewPublicSite={navigateToPublic} />
        ) : (
          <AdminLogin onBackToSite={navigateToPublic} />
        )}
      </Suspense>
    );
  }

  // Public Website View
  return (
    <div className="min-h-screen bg-blueprint-light text-[#333132] font-['Estedad',sans-serif] flex flex-col selection:bg-amber-400 selection:text-slate-950" dir="rtl">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:right-2 focus:z-[100] bg-white text-[#003F86] font-bold px-4 py-2 rounded-xl">
        رفتن به محتوای اصلی
      </a>
      <ScrollToTop />
      <SeoHead />
      <Suspense fallback={null}><CustomCursor /></Suspense>
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
      <main id="main-content" className="flex-1">
        <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path="/" element={
            <Hero
              cmsHero={heroCms}
              onNavigate={handleNavigateSection}
              onSelectCategory={handleSelectCategory}
              onOpenConsultation={() => handleOpenUnifiedConsultation()}
              onOpenQuote={() => handleOpenUnifiedConsultation('استعلام قیمت و پیش‌فاکتور')}
              onOpenAiAssistant={() => setIsAiAssistantOpen(true)}
            >
              <Suspense fallback={null}>
              <CompactShowcase 
                products={products}
                articles={publicArticles}
                onNavigate={handleNavigateSection}
                onSelectProduct={handleSelectProductById}
                onSelectArticle={(articleId) => navigate(`/magazine/${articleId}`)}
              />
              <AboutContactUnifiedSection />
              </Suspense>
            </Hero>
          } />
          <Route path="/products/:productId" element={<ProductPage />} />
          <Route path="/products" element={
            <ProductCatalogSection
              products={products}
              selectedCategory={selectedCategory}
              onSelectCategory={handleSelectCategory}
              onSelectProduct={handleSelectProduct}
              onRequestQuoteForProduct={handleRequestQuoteForProduct}
            />
          } />
          <Route path="/services/:serviceId" element={<ServicePage onOpenConsultation={(title) => handleOpenUnifiedConsultation(title, undefined, `مشاوره درباره خدمت: ${title}`)} />} />
          <Route path="/services" element={
            <ServicesSection
              services={services}
              onSelectService={setSelectedService}
              onSelectCategory={handleSelectCategory}
              onOpenConsultation={() => handleOpenUnifiedConsultation('سوله و سالن صنعتی')}
            />
          } />
          <Route path="/projects/:projectId" element={<ProjectPage onOpenConsultation={(title) => handleOpenUnifiedConsultation('سوله و سالن صنعتی', undefined, `مشاوره درباره پروژه: ${title}`)} />} />
          <Route path="/projects" element={
            <FeaturedProjectsSection
              projects={projects}
              onSelectProject={setSelectedProject}
              onOpenConsultation={() => handleOpenUnifiedConsultation('سوله و سالن صنعتی')}
            />
          } />
          <Route path="/magazine" element={
            magazineReady ? (
            <MagazineFeed
              articles={publicArticles}
              onSelectArticle={(article) => {
                setSelectedArticle(article);
                navigate(`/magazine/${article.id}`);
              }}
            />
            ) : <div className="min-h-screen" aria-busy="true" />
          } />
          <Route path="/magazine/:articleId" element={
            <MagazineArticleWrapper
               articles={publicArticles}
               onBack={() => navigate('/magazine')}
               onSelectProductById={handleSelectProductById}
            />
          } />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/rnd" element={<RnDPage />} />
          <Route path="/contact" element={
            <ContactPage 
              initialSubject={consultationSubject}
              initialProduct={consultationProduct}
              initialMessage={consultationMessage}
            />
          } />
          {/* Catch-all for unknown routes */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
        </Suspense>
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
        <Suspense fallback={null}>
        <CaseStudyModal
          project={selectedProject}
          isOpen={!!selectedProject}
          onClose={() => setSelectedProject(null)}
          onOpenConsultation={() => handleOpenUnifiedConsultation('سوله و سالن صنعتی', undefined, `مشاوره درباره پروژه: ${selectedProject.title}`)}
        />
        </Suspense>
      )}

      {selectedService && (
        <Suspense fallback={null}>
        <ServiceDetailModal
          service={selectedService}
          isOpen={!!selectedService}
          onClose={() => setSelectedService(null)}
          onOpenConsultation={() => handleOpenUnifiedConsultation(selectedService.title, undefined, `مشاوره درباره خدمت: ${selectedService.title}`)}
        />
        </Suspense>
      )}

      {isSearchOpen ? (
      <Suspense fallback={null}>
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectProduct={handleSelectProduct}
        onSelectProject={setSelectedProject}
        onSelectArticle={setSelectedArticle}
      />
      </Suspense>
      ) : null}

      {isAiAssistantOpen ? (
      <Suspense fallback={null}>
      <AiEngineerAssistantModal
        isOpen={isAiAssistantOpen}
        onClose={() => setIsAiAssistantOpen(false)}
        onOpenQuote={() => {
          setIsAiAssistantOpen(false);
          handleOpenUnifiedConsultation('استعلام قیمت و پیش‌فاکتور');
        }}
      />
      </Suspense>
      ) : null}

    </div>
  );
};

export default function App() {
  return (
    <DataProvider>
      <BrowserRouter>
        <MainAppInner />
        <Suspense fallback={null}>
          <Toaster position="bottom-center" toastOptions={{ style: { background: '#333', color: '#fff', borderRadius: '12px', fontFamily: 'Estedad, sans-serif' } }} />
        </Suspense>
      </BrowserRouter>
    </DataProvider>
  );
}
