import React, { useState, useEffect, useMemo, useRef, lazy, Suspense } from 'react';
import { sortArticlesNewestFirst } from './seo/articleMeta';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation, useNavigationType } from 'react-router-dom';
import { catalogCategoryFromPath } from './lib/catalogPath';
const Toaster = lazy(() => import('react-hot-toast').then((m) => ({ default: m.Toaster })));
import { ScrollProgress } from './components/ScrollProgress';
import { DataProvider, useData } from './context/DataContext';
import { PageSection, Product, Service, Article, ProductCategory, PagesCms } from './types';

const AdminLogin = lazy(() => import('./admin/AdminLogin').then((m) => ({ default: m.AdminLogin })));
const AdminPanel = lazy(() => import('./admin/AdminPanel').then((m) => ({ default: m.AdminPanel })));
const CrmApp = lazy(() => import('./crm/CrmApp').then((m) => ({ default: m.CrmApp })));
const ProductPage = lazy(() => import('./components/ProductPage').then((m) => ({ default: m.ProductPage })));
const ServicePage = lazy(() => import('./components/ServicePage').then((m) => ({ default: m.ServicePage })));
const ServicesSection = lazy(() => import('./components/ServicesSection').then((m) => ({ default: m.ServicesSection })));
const MagazineFeed = lazy(() => import('./components/magazine/MagazineFeed').then((m) => ({ default: m.MagazineFeed })));
const MagazineTopic = lazy(() => import('./components/magazine/MagazineTopic').then((m) => ({ default: m.MagazineTopic })));
const MagazineArticle = lazy(() => import('./components/magazine/MagazineArticle').then((m) => ({ default: m.MagazineArticle })));
const AboutPage = lazy(() => import('./components/AboutPage').then((m) => ({ default: m.AboutPage })));
const RnDPage = lazy(() => import('./components/RnDPage').then((m) => ({ default: m.RnDPage })));
const ContactPage = lazy(() => import('./components/ContactPage').then((m) => ({ default: m.ContactPage })));
const CompactShowcase = lazy(() => import('./components/CompactShowcase').then((m) => ({ default: m.CompactShowcase })));
const AboutContactUnifiedSection = lazy(() => import('./components/AboutContactUnifiedSection').then((m) => ({ default: m.AboutContactUnifiedSection })));
const ServiceDetailModal = lazy(() => import('./components/Modals/ServiceDetailModal').then((m) => ({ default: m.ServiceDetailModal })));
const GlobalSearchModal = lazy(() => import('./components/Modals/GlobalSearchModal').then((m) => ({ default: m.GlobalSearchModal })));
const AiEngineerAssistantModal = lazy(() => import('./components/AiEngineerAssistantModal').then((m) => ({ default: m.AiEngineerAssistantModal })));

import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Footer } from './components/Footer';
import { PageBanner } from './components/PageBanner';
import { ShopHero } from './components/ShopHero';
import { HomeProductBands } from './components/spotlight/ProductSpotlight';
import { pageHeroFor } from './data/pageHeroes';
const CustomCursor = lazy(() => import('./components/CustomCursor').then((m) => ({ default: m.CustomCursor })));
import { NotFoundPage } from './components/NotFoundPage';
import { useParams } from 'react-router-dom';
import { SeoHead } from "./components/SEO";
import { publicProductPath } from "./seo/resolveSeo";

import { t, isEn, keepFa, EN_PREFIX } from './i18n';
// Reserve a full viewport while a lazy route loads so the footer never paints in view and then jumps (CLS).
const RouteFallback = () => <div className="min-h-[100svh]" aria-hidden="true" />;

// Section hero for nav routes, rendered outside the route Suspense so it (and its H1, the LCP)
// paints on the first commit and is not re-mounted when the lazy page chunk arrives.
const RouteHero = ({ categories, pageContent }: { categories: { id: string; title: string }[]; pageContent: PagesCms }) => {
  const { pathname } = useLocation();
  const catalogCategory = catalogCategoryFromPath(pathname);
  if (catalogCategory) {
    // /products and every /products/<category> get the section hero with their own H1.
    return <ShopHero selectedCategory={catalogCategory} categories={categories} />;
  }
  const hero = pageHeroFor(pathname, pageContent.heroes);
  return hero ? <PageBanner {...hero} /> : null;
};

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
  const navigationType = useNavigationType();
  const previousPath = useRef(pathname);
  useEffect(() => {
    const from = previousPath.current;
    previousPath.current = pathname;
    // Switching category from the chips keeps the reader at the list instead of jumping back to the hero.
    if (navigationType === 'PUSH' && from !== pathname && catalogCategoryFromPath(from) && catalogCategoryFromPath(pathname)) return;
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname, navigationType]);
  return null;
};

const MainAppInner: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { 
    isAuthenticated, 
    products, 
    services, 
    articles,
    magazineReady,
    categories, 
    companyInfo, 
    heroCms,
    siteLayout,
    pageContent,
  } = useData();
  const publicArticles = useMemo(() => sortArticlesNewestFirst(articles.filter((article) => article.status !== 'draft' && article.status !== 'review')), [articles]);

  // Navigation and consultation state

  // Unified Consultation / Quote Form prefill state
  const [consultationSubject, setConsultationSubject] = useState<string | undefined>(keepFa("مرغداری گوشتی"));
  const [consultationProduct, setConsultationProduct] = useState<string | undefined>('');
  const [consultationMessage, setConsultationMessage] = useState<string | undefined>('');

  // Modals state
  const handleSelectProduct = (product: Product) => {
    navigate(publicProductPath(product));
  };

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
    else if (section === 'knowledge' || section === 'magazine' || section === 'magazine-article') navigate('/magazine');
    else if (section === 'about') navigate('/about');
    else if (section === 'rnd') navigate('/rnd');
    else if (section === 'contact') navigate('/contact');
  };
  
  // Helper to determine currentSection for Navbar
  const currentSection = location.pathname === '/' ? 'home' : 
                         (location.pathname === '/products' || location.pathname.startsWith('/products/')) ? 'products' : 
                         location.pathname === '/services' ? 'services' : 
                         location.pathname.startsWith('/magazine') ? 'knowledge' : 
                         location.pathname === '/about' ? 'about' : 
                         location.pathname === '/rnd' ? 'rnd' : 
                         location.pathname === '/contact' ? 'contact' : 'home';

  const handleSelectCategory = (cat: ProductCategory | 'all') => {
    if (cat === 'all') navigate('/products');
    else navigate(`/products/${cat}`);
  };

  // Unified Handler: Redirects all quotes and consultations to the unified form in Contact Us
  const handleOpenUnifiedConsultation = (subject?: string, product?: string, message?: string) => {
    if (subject) setConsultationSubject(subject);
    if (product !== undefined) setConsultationProduct(product);
    if (message !== undefined) setConsultationMessage(message);

    // Close any open modals
    setSelectedService(null);
    setIsAiAssistantOpen(false);

    if (currentSection === 'home' && location.pathname === '/contact') {
      const formEl = document.getElementById('consultation-form');
      if (formEl) {
        formEl.scrollIntoView({ behavior: 'smooth' });
        return;
      }
    }

    navigate('/contact');
    // The contact page is a lazy chunk: wait (up to ~3 s) until the form exists, then bring it into view.
    let tries = 0;
    const scrollToForm = () => {
      const formEl = document.getElementById('consultation-form');
      if (formEl) formEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      else if (++tries < 30) window.setTimeout(scrollToForm, 100);
    };
    window.setTimeout(scrollToForm, 150);
  };

  const handleRequestQuoteForProduct = (product: Product) => {
    handleOpenUnifiedConsultation(
      keepFa("استعلام قیمت"),
      product.name,
      `${t("درخواست استعلام قیمت و مشخصات فنی برای محصول:")} ${product.name}`
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
    <div className={`min-h-screen bg-blueprint-light text-[#333132] ${isEn() ? "font-['Estedad_Latin',ui-sans-serif,system-ui,sans-serif]" : "font-['Estedad',sans-serif]"} flex flex-col selection:bg-amber-400 selection:text-slate-950`} dir={isEn() ? 'ltr' : 'rtl'} lang={isEn() ? 'en' : undefined}>
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:start-2 focus:z-[100] bg-white text-[#003F86] font-bold px-4 py-2 rounded-xl">
        
        {t("رفتن به محتوای اصلی")}
      </a>
      <ScrollToTop />
      <SeoHead />
      <Suspense fallback={null}><CustomCursor /></Suspense>
      <ScrollProgress />
      
      {/* Top Navbar */}
      {siteLayout.header.visible && <Navbar
        currentSection={currentSection}
        onNavigate={handleNavigateSection}
        onOpenConsultation={() => handleOpenUnifiedConsultation()}
        onOpenQuote={() => handleOpenUnifiedConsultation(keepFa("استعلام قیمت"))}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenAiAssistant={() => setIsAiAssistantOpen(true)}
        logoUrl={siteLayout.header.logoUrl}
        brandFa={siteLayout.header.brandFa}
        brandEn={siteLayout.header.brandEn}
        navLabelsFa={siteLayout.header.navLabelsFa}
        navLabelsEn={siteLayout.header.navLabelsEn}
      />}

      {/* Main Content by Section */}
      <main id="main-content" className="flex-1">
        <RouteHero categories={categories as { id: string; title: string }[]} pageContent={pageContent} />
        <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path="/" element={
            <Hero
              cmsHero={heroCms}
              showHero={siteLayout.home.hero}
              onNavigate={handleNavigateSection}
              onSelectCategory={handleSelectCategory}
              onOpenConsultation={() => handleOpenUnifiedConsultation()}
              onOpenQuote={() => handleOpenUnifiedConsultation(keepFa("استعلام قیمت"))}
              onOpenAiAssistant={() => setIsAiAssistantOpen(true)}
              beforeServices={siteLayout.home.productBands ? <HomeProductBands /> : null}
            >
              <Suspense fallback={null}>
              {siteLayout.home.showcase && <CompactShowcase onNavigate={handleNavigateSection} />}
              {siteLayout.home.aboutContact && <AboutContactUnifiedSection />}
              </Suspense>
            </Hero>
          } />
          {/* Hub, categories and products share one route so a category switch never remounts the catalog. */}
          <Route path="/products/:productId?" element={<ProductPage onRequestQuoteForProduct={handleRequestQuoteForProduct} />} />
          <Route path="/services/:serviceId" element={<ServicePage onOpenConsultation={(title) => handleOpenUnifiedConsultation(title, undefined, `${t("مشاوره درباره خدمت:")} ${title}`)} />} />
          <Route path="/services" element={
            <ServicesSection
              services={services}
              onSelectService={setSelectedService}
              onSelectCategory={handleSelectCategory}
              onOpenConsultation={() => handleOpenUnifiedConsultation(keepFa("سوله و سالن صنعتی"))}
            />
          } />
          {/* No projects are published yet: project URLs redirect to /services (server sends 301). */}
          <Route path="/projects/*" element={<Navigate to="/services" replace />} />
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
          <Route path="/magazine/topic/:topicSlug" element={
            magazineReady ? <MagazineTopic articles={publicArticles} notFound={<NotFoundPage />} /> : <div className="min-h-screen" aria-busy="true" />
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
      {siteLayout.footer.visible && <Footer
        onNavigate={handleNavigateSection}
        onSelectCategory={handleSelectCategory}
        onOpenConsultation={() => handleOpenUnifiedConsultation()}
        onOpenQuote={() => handleOpenUnifiedConsultation(keepFa("استعلام قیمت"))}
        companyInfo={companyInfo}
        categories={categories}
        layout={siteLayout.footer}
      />}

      {/* Detail Modals (Technical specifications & info) */}
      {selectedService && (
        <Suspense fallback={null}>
        <ServiceDetailModal
          service={selectedService}
          isOpen={!!selectedService}
          onClose={() => setSelectedService(null)}
          onOpenConsultation={() => handleOpenUnifiedConsultation(selectedService.title, undefined, `${t("مشاوره درباره خدمت:")} ${selectedService.title}`)}
        />
        </Suspense>
      )}

      {isSearchOpen ? (
      <Suspense fallback={null}>
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectProduct={handleSelectProduct}
        onSelectProject={() => {}}
        projects={[]}
        onSelectArticle={setSelectedArticle}
        articles={publicArticles}
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
          handleOpenUnifiedConsultation(keepFa("استعلام قیمت"));
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
      <BrowserRouter basename={isEn() ? EN_PREFIX : undefined}>
        <MainAppInner />
        <Suspense fallback={null}>
          <Toaster position="bottom-center" toastOptions={{ style: { background: '#333', color: '#fff', borderRadius: '12px', fontFamily: isEn() ? 'system-ui, sans-serif' : 'Estedad, sans-serif' } }} />
        </Suspense>
      </BrowserRouter>
    </DataProvider>
  );
}
