import React, { createContext, useContext, useState, useEffect, useMemo, useRef } from 'react';
import { isPublicProduct } from '../data/removedProducts';
import {
  Product,
  Project,
  Service,
  Article,
  CategoryItem,
  CompanyInfo,
  HeroCmsContent,
  AiAdvisorConfig,
  QuoteRequestItem,
  ConsultationRequestItem,
  AdminUser,
  QuoteFormData,
  ConsultationFormData,
  CustomerContact,
  MediaItem,
  SiteLayoutConfig,
  AdminSection,
  PagesCms
} from '../types';
import {
  PROJECTS,
  SERVICES,
  ARTICLES,
  CATEGORIES_DATA,
  COMPANY_INFO,
  DEFAULT_HERO_CMS,
  DEFAULT_AI_CONFIG,
  INITIAL_QUOTES,
  INITIAL_CONSULTATIONS,
  INITIAL_MEDIA
} from '../data/mockData';
import { migrateCustomerRecord } from '../crm/utils/crmRecords';
import { withProductPhotos } from '../data/productPhotos';
import { hasPersian, isEn, isFullyTranslated, setEnAvailability, translateCmsRecord, translateDeep, translateProduct } from '../i18n';

function loadStoredArticles(stored: Article[] | null | undefined): Article[] {
  if (!Array.isArray(stored)) return ARTICLES;
  return stored.filter((item) => item?.id && item?.title);
}

interface DataContextType {
  // Products
  /** Public catalog (hidden products removed). */
  products: Product[];
  /** Every product including hidden ones — admin panel only. */
  allProducts: Product[];
  catalogReady: boolean;
  addProduct: (product: Product) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  replaceAllProducts: (newProducts: Product[]) => void;

  // Projects
  projects: Project[];
  addProject: (project: Project) => void;
  updateProject: (id: string, project: Partial<Project>) => void;
  deleteProject: (id: string) => void;

  // Services
  services: Service[];
  addService: (service: Service) => void;
  updateService: (id: string, service: Partial<Service>) => void;
  deleteService: (id: string) => void;

  // Articles
  articles: Article[];
  magazineReady: boolean;
  addArticle: (article: Article) => void;
  updateArticle: (id: string, article: Partial<Article>) => void;
  deleteArticle: (id: string) => void;

  // Categories
  categories: CategoryItem[];
  addCategory: (category: CategoryItem) => void;
  updateCategory: (id: string, category: Partial<CategoryItem>) => void;
  deleteCategory: (id: string) => void;
  setCategories: React.Dispatch<React.SetStateAction<CategoryItem[]>>;

  // Company Info & CMS
  companyInfo: CompanyInfo;
  updateCompanyInfo: (info: Partial<CompanyInfo>) => void;
  heroCms: HeroCmsContent;
  updateHeroCms: (cms: Partial<HeroCmsContent>) => Promise<void>;
  siteLayout: SiteLayoutConfig;
  updateSiteLayout: (layout: Partial<SiteLayoutConfig>) => Promise<void>;
  pageContent: PagesCms;
  updatePageContent: (content: Partial<PagesCms>) => Promise<void>;
  aiConfig: AiAdvisorConfig;
  updateAiConfig: (config: Partial<AiAdvisorConfig>) => void;

  // Quotes & Inquiries
  quoteRequests: QuoteRequestItem[];
  addQuoteRequest: (formData: QuoteFormData) => string;
  updateQuoteStatus: (id: string, status: QuoteRequestItem['status']) => void;
  updateQuoteAdminNotes: (id: string, notes: string) => void;
  deleteQuoteRequest: (id: string) => void;

  consultationRequests: ConsultationRequestItem[];
  addConsultationRequest: (formData: ConsultationFormData) => string;
  updateConsultationStatus: (id: string, status: ConsultationRequestItem['status']) => void;
  updateConsultationAdminNotes: (id: string, notes: string) => void;
  deleteConsultationRequest: (id: string) => void;

  // Customers
  customers: CustomerContact[];
  addCustomer: (customer: CustomerContact) => void;
  updateCustomer: (id: string, customer: Partial<CustomerContact>) => void;
  deleteCustomer: (id: string) => void;

  // Media Library
  mediaLibrary: MediaItem[];
  addMedia: (media: MediaItem) => void;
  deleteMedia: (id: string) => void;

  // Authentication
  adminUser: AdminUser | null;
  adminDataReady: boolean;
  adminLoadError: string;
  retryAdminLoad: () => void;
  isAuthenticated: boolean;
  login: (username: string, password: string, turnstileToken?: string) => Promise<{ success: boolean; error?: string }>;
  canAccess: (section: AdminSection) => boolean;
  hasAdminPassword: boolean;
  logout: () => void;
  changePassword: (oldPassword: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;

  // System & Backup
  resetToDefaults: () => void;
  exportBackupJson: () => string;
  importBackupJson: (jsonData: string) => { success: boolean; error?: string };
}

const DataContext = createContext<DataContextType | null>(null);

const STORAGE_KEYS = {
  PRODUCTS: 'toyooran_products_v5',
  PROJECTS: 'toyooran_projects_v3',
  SERVICES: 'toyooran_services_v3',
  ARTICLES: 'toyooran_articles_v4',
  CATEGORIES: 'toyooran_categories_v4',
  COMPANY_INFO: 'toyooran_company_v7',
  HERO_CMS: 'toyooran_hero_cms_v3',
  AI_CONFIG: 'toyooran_ai_config_v3',
  QUOTES: 'toyooran_quotes_v3',
  CONSULTATIONS: 'toyooran_consultations_v3',
  ADMIN_USER: 'toyooran_admin_session_v3',
  ADMIN_PASSWORD: 'toyooran_admin_password_hash_v3',
  CUSTOMERS: 'toyooran_customers_v3',
  MEDIA: 'toyooran_media_v3',
};

export const DEFAULT_SITE_LAYOUT: SiteLayoutConfig = {
  header: { visible: true, logoUrl: '/images/logo-mark.png', brandFa: 'طیوران صنعت پویا', brandEn: 'TSPK' },
  footer: { visible: true, logoUrl: '/images/logo-mark.png' },
  home: { hero: true, productBands: true, showcase: true, aboutContact: true },
};

export const DEFAULT_PAGES_CMS: PagesCms = {
  heroes: {},
  about: { features: [] },
  rnd: {},
};

function mergeSiteLayout(value: unknown): SiteLayoutConfig {
  const source = value && typeof value === 'object' ? value as Partial<SiteLayoutConfig> : {};
  return {
    header: { ...DEFAULT_SITE_LAYOUT.header, ...(source.header || {}) },
    footer: { ...DEFAULT_SITE_LAYOUT.footer, ...(source.footer || {}) },
    home: { ...DEFAULT_SITE_LAYOUT.home, ...(source.home || {}) },
  };
}

function mergePagesCms(value: unknown): PagesCms {
  const source = value && typeof value === 'object' ? value as Partial<PagesCms> : {};
  const aboutSource: Partial<PagesCms['about']> = source.about && typeof source.about === 'object' ? source.about : {};
  return {
    heroes: source.heroes && typeof source.heroes === 'object' ? source.heroes : {},
    about: {
      ...DEFAULT_PAGES_CMS.about,
      ...aboutSource,
      features: Array.isArray(aboutSource.features) ? aboutSource.features : [],
    },
    rnd: {
      ...DEFAULT_PAGES_CMS.rnd,
      ...(source.rnd && typeof source.rnd === 'object' ? source.rnd : {}),
    },
  };
}

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize from LocalStorage or Defaults
  const [products, setProducts] = useState<Product[]>([]);
  const [catalogReady, setCatalogReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    import("../data/productsData").then((mod) => {
      if (!cancelled) {
        setProducts((prev) => (!prev.length ? mod.PRODUCTS : prev.every((item) => item?.hidden) ? [...mod.PRODUCTS, ...prev] : prev));
        setCatalogReady(true);
      }
    }).catch(() => {
      if (!cancelled) setCatalogReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const [projects, setProjects] = useState<Project[]>(PROJECTS);

  const [services, setServices] = useState<Service[]>(SERVICES);

  const [articles, setArticles] = useState<Article[]>(() => ARTICLES.map(withProductPhotos));

  const [categories, setCategories] = useState<CategoryItem[]>(CATEGORIES_DATA as CategoryItem[]);

  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>(() => { const saved = localStorage.getItem(STORAGE_KEYS.COMPANY_INFO); if (saved) { const parsed = JSON.parse(saved); if (!parsed.locations || parsed.locations.length === 0) return COMPANY_INFO as CompanyInfo; return parsed; } return COMPANY_INFO as CompanyInfo; });

  const [heroCms, setHeroCms] = useState<HeroCmsContent>(DEFAULT_HERO_CMS);
  const [siteLayout, setSiteLayout] = useState<SiteLayoutConfig>(DEFAULT_SITE_LAYOUT);
  const [pageContent, setPageContent] = useState<PagesCms>(DEFAULT_PAGES_CMS);

  const [aiConfig, setAiConfig] = useState<AiAdvisorConfig>(DEFAULT_AI_CONFIG);

  const [quoteRequests, setQuoteRequests] = useState<QuoteRequestItem[]>(INITIAL_QUOTES);

  const [consultationRequests, setConsultationRequests] = useState<ConsultationRequestItem[]>(INITIAL_CONSULTATIONS);

  const [customers, setCustomers] = useState<CustomerContact[]>([]);
  const [mediaLibrary, setMediaLibrary] = useState<MediaItem[]>(INITIAL_MEDIA);

  const addCustomer = (customer: CustomerContact) => setCustomers(prev => [customer, ...prev]);
  const updateCustomer = (id: string, updates: Partial<CustomerContact>) => setCustomers(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  const deleteCustomer = (id: string) => setCustomers(prev => prev.filter(c => c.id !== id));
  const addMedia = (media: MediaItem) => setMediaLibrary(prev => [media, ...prev]);
  const deleteMedia = (id: string) => setMediaLibrary(prev => prev.filter(m => m.id !== id));

  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [hasAdminPassword] = useState(true);

  const [adminDataReady, setAdminDataReady] = useState(false);
  const [adminLoadError, setAdminLoadError] = useState('');
  const [adminLoadAttempt, setAdminLoadAttempt] = useState(0);
  const [csrfToken, setCsrfToken] = useState('');
  const pendingStateWrites = useRef(new Map<string, Promise<void>>());
  const [magazineReady, setMagazineReady] = useState(false);
  const magazineLockedByAdmin = useRef(false);
  const articlesHydrated = useRef(false);
  // Visitors receive the already-published CMS snapshot as well. Previously only
  // the authenticated browser hydrated these values, which made a saved change
  // look local until the next deploy.
  useEffect(() => {
    let cancelled = false;
    fetch(isEn() ? '/api/public/cms?lang=en' : '/api/public/cms')
      .then((response) => response.ok ? response.json() : null)
      .then((data) => {
        if (cancelled || magazineLockedByAdmin.current || !data) return;
        if (Array.isArray(data.products)) setProducts(data.products as Product[]);
        if (Array.isArray(data.services)) setServices(data.services as Service[]);
        if (Array.isArray(data.articles)) setArticles(loadStoredArticles(data.articles as Article[]));
        if (Array.isArray(data.categories)) setCategories(data.categories as CategoryItem[]);
        if (data.companyInfo && typeof data.companyInfo === 'object') setCompanyInfo(data.companyInfo as CompanyInfo);
        if (data.heroCms && typeof data.heroCms === 'object') setHeroCms(data.heroCms as HeroCmsContent);
        if (data.siteLayout && typeof data.siteLayout === 'object') setSiteLayout(mergeSiteLayout(data.siteLayout));
        if (data.pageContent && typeof data.pageContent === 'object') setPageContent(mergePagesCms(data.pageContent));
        setCatalogReady(true);
      })
      .catch(() => undefined);
    return () => { cancelled = true; };
  }, []);
  useEffect(() => {
    let cancelled = false;
    // English pages get the server-translated magazine (only articles with a complete English version).
    fetch(isEn() ? '/api/magazine?lang=en' : '/api/magazine')
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (cancelled || magazineLockedByAdmin.current) return;
        if (Array.isArray(data?.articles)) {
          if (isEn()) setEnAvailability({ articles: data.articles.map((item: Article) => item.id), topics: Array.isArray(data.topics) ? data.topics : undefined });
          setArticles(data.articles);
        }
      })
      .catch(() => undefined)
      .finally(() => {
        if (!cancelled && !magazineLockedByAdmin.current) setMagazineReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);
  useEffect(() => {
    if (adminUser) return;
    magazineLockedByAdmin.current = false;
    setArticles((current) => current.some((article) => article.status === 'draft' || article.status === 'review')
      ? current.filter((article) => article.status !== 'draft' && article.status !== 'review')
      : current);
  }, [adminUser]);
  const refreshCsrf = async () => {
    const response = await fetch('/api/auth/csrf', { credentials: 'include' });
    const result = await response.json();
    setCsrfToken(result.token || '');
    return result.token || '';
  };
  const loadCurrentAdmin = async (): Promise<AdminUser | null> => {
    const response = await fetch('/api/auth/me', { credentials: 'include' });
    const result = response.ok ? await response.json() : null;
    if (!result?.admin) return null;
    const admin = result.admin as AdminUser;
    setAdminUser(admin);
    return admin;
  };
  useEffect(() => {
    // The admin session (and its save-back effects) only runs on the Persian site.
    if (isEn()) return;
    loadCurrentAdmin()
      .then(async result => { if (result) await refreshCsrf(); })
      .catch(() => undefined);
  }, []);
  // Hidden products (e.g. Kolak Gostar) stay listed for the admin even if the stored copy predates them.
  // Separate lazy chunk: public visitors never download these records.
  const withHiddenProducts = () => {
    void import('../data/hiddenProducts').then(({ HIDDEN_PRODUCTS }) => {
      setProducts((prev) => {
        const ids = new Set(prev.map((item) => item?.id));
        const missing = HIDDEN_PRODUCTS.filter((item) => !ids.has(item.id));
        return missing.length ? [...prev, ...missing] : prev;
      });
    });
  };
  const persistAdminState = (key: string, value: unknown): Promise<void> => {
    if (!adminUser || !adminDataReady || !csrfToken) return Promise.reject(new Error('اطلاعات پنل هنوز آماده نیست. دوباره تلاش کنید.'));
    const previous = pendingStateWrites.current.get(key) || Promise.resolve();
    const write = previous.catch(() => undefined).then(async () => {
      const response = await fetch(`/api/admin/state/${key}`, {
        method: 'PUT', credentials: 'include',
        headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrfToken },
        body: JSON.stringify({ value }),
      });
      if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        throw new Error(result.error || 'ذخیره در سرور انجام نشد. دوباره تلاش کنید.');
      }
    });
    pendingStateWrites.current.set(key, write);
    void write.finally(() => {
      if (pendingStateWrites.current.get(key) === write) pendingStateWrites.current.delete(key);
    }).catch(() => undefined);
    return write;
  };
  const saveAdminState = (key: string, value: unknown) => {
    if (adminUser && adminDataReady && csrfToken) void persistAdminState(key, value).catch((error) => console.error('CMS save failed:', key, error));
  };
  useEffect(() => {
    if (!adminUser) { setAdminDataReady(false); return; }
    let cancelled = false;
    setAdminLoadError('');
    setAdminDataReady(false);
    magazineLockedByAdmin.current = true;
    articlesHydrated.current = false;
    const keys = ['products', 'projects', 'services', 'articles', 'categories', 'companyInfo', 'heroCms', 'siteLayout', 'pageContent', 'aiConfig', 'quotes', 'consultations', 'customers', 'media'];
    Promise.all(keys.map(async key => {
      const response = await fetch(`/api/admin/state/${key}`, { credentials: 'include' });
      if (response.status === 403) return [key, { value: null }] as const;
      if (!response.ok) throw new Error(`بارگذاری ${key} ناموفق بود.`);
      return [key, await response.json()] as const;
    }))
      .then(async entries => {
        if (cancelled) return;
        const state = Object.fromEntries(entries);
        if (Array.isArray(state.products.value) && state.products.value.length) {
          const stored = state.products.value as Product[];
          setProducts(stored.map((item) => (item && !isPublicProduct(item) && !item.hidden ? { ...item, hidden: true } : item)));
        }
        withHiddenProducts();
        if (state.projects.value) setProjects(state.projects.value);
        if (state.services.value) setServices(state.services.value);
        articlesHydrated.current = true;
        if (Array.isArray(state.articles.value)) setArticles(loadStoredArticles(state.articles.value));
        setMagazineReady(true);
        if (state.categories.value) setCategories(state.categories.value);
        if (state.companyInfo.value) setCompanyInfo(state.companyInfo.value);
        if (state.heroCms.value) setHeroCms(state.heroCms.value);
        if (state.siteLayout.value) setSiteLayout(mergeSiteLayout(state.siteLayout.value));
        if (state.pageContent.value) setPageContent(mergePagesCms(state.pageContent.value));
        if (state.aiConfig.value) setAiConfig(state.aiConfig.value);
        const fakeLeadIds = new Set(["quote-101", "quote-102", "cons-201", "cons-202"]);
        if (Array.isArray(state.quotes.value)) {
          setQuoteRequests(state.quotes.value.filter((item: { id?: string }) => !fakeLeadIds.has(item?.id || "")));
        }
        if (Array.isArray(state.consultations.value)) {
          setConsultationRequests(state.consultations.value.filter((item: { id?: string }) => !fakeLeadIds.has(item?.id || "")));
        }
        if (Array.isArray(state.customers.value) && state.customers.value.length) {
          setCustomers(state.customers.value.map((item: CustomerContact) => migrateCustomerRecord(item)));
        } else {
          // Admin-only lazy chunk: CRM personas never ship in the public bundle.
          const { CRM_PERSONAS } = await import('../crm/data/personas');
          setCustomers(CRM_PERSONAS);
        }
        if (state.media.value) setMediaLibrary(state.media.value);
        setAdminDataReady(true);
      }).catch((error) => {
        if (cancelled) return;
        articlesHydrated.current = false;
        setMagazineReady(true);
        setAdminDataReady(false);
        setAdminLoadError(error instanceof Error ? error.message : 'بارگذاری اطلاعات پنل ناموفق بود.');
      });
    return () => { cancelled = true; };
  }, [adminUser, adminLoadAttempt]);
  useEffect(() => { saveAdminState('products', products); }, [products, adminUser, adminDataReady]);
  useEffect(() => { saveAdminState('projects', projects); }, [projects, adminUser, adminDataReady]);
  useEffect(() => { saveAdminState('services', services); }, [services, adminUser, adminDataReady]);
  useEffect(() => { if (articlesHydrated.current) saveAdminState('articles', articles); }, [articles, adminUser, adminDataReady]);
  useEffect(() => { saveAdminState('categories', categories); }, [categories, adminUser, adminDataReady]);
  useEffect(() => { saveAdminState('companyInfo', companyInfo); }, [companyInfo, adminUser, adminDataReady]);
  useEffect(() => { saveAdminState('heroCms', heroCms); }, [heroCms, adminUser, adminDataReady]);
  useEffect(() => { saveAdminState('siteLayout', siteLayout); }, [siteLayout, adminUser, adminDataReady]);
  useEffect(() => { saveAdminState('pageContent', pageContent); }, [pageContent, adminUser, adminDataReady]);
  useEffect(() => { saveAdminState('aiConfig', aiConfig); }, [aiConfig, adminUser, adminDataReady]);
  useEffect(() => { saveAdminState('quotes', quoteRequests); }, [quoteRequests, adminUser, adminDataReady]);
  useEffect(() => { saveAdminState('consultations', consultationRequests); }, [consultationRequests, adminUser, adminDataReady]);
  useEffect(() => { saveAdminState('customers', customers); }, [customers, adminUser, adminDataReady]);
  useEffect(() => { saveAdminState('media', mediaLibrary); }, [mediaLibrary, adminUser, adminDataReady]);
  const publicProducts = useMemo(() => products.filter((item) => item && isPublicProduct(item)), [products]);
  // English (/en): expose only products with a complete English version, translated; same for the
  // site data below. State itself always stays Persian (nothing English is ever saved back).
  const en = isEn();
  const shownProducts = useMemo(() => {
    if (!en) return publicProducts;
    const ok = publicProducts.filter((item) => isFullyTranslated(translateProduct(item)));
    setEnAvailability({ products: ok.map((item) => item.id) });
    return ok.map((item) => translateProduct(item));
  }, [en, publicProducts]);
  const publicServices = useMemo(() => services.filter((item) => item.status !== 'draft' && item.status !== 'review'), [services]);
  const shownServices = useMemo(() => (adminUser ? services : publicServices).map((item) => translateCmsRecord(item)), [services, publicServices, adminUser, en]);
  const shownCategories = useMemo(() => translateDeep(categories), [categories, en]);
  const shownCompanyInfo = useMemo(() => translateCmsRecord(companyInfo), [companyInfo, en]);
  const shownHeroCms = useMemo(() => {
    if (!en) return heroCms;
    const defaults = translateDeep(DEFAULT_HERO_CMS);
    const englishCopy = (value: string | undefined, fallback: string) => value && !hasPersian(value) ? value : fallback;
    return {
      ...heroCms,
      title: englishCopy(heroCms.translations?.en?.title, defaults.title),
      subtitle: englishCopy(heroCms.translations?.en?.subtitle, defaults.subtitle),
      pillText: englishCopy(heroCms.translations?.en?.pillText, defaults.pillText),
      ctaPrimaryText: englishCopy(heroCms.translations?.en?.ctaPrimaryText, defaults.ctaPrimaryText),
      ctaSecondaryText: englishCopy(heroCms.translations?.en?.ctaSecondaryText, defaults.ctaSecondaryText),
    };
  }, [heroCms, en]);
  // Product CRUD
  const addProduct = (product: Product) => {
    setProducts(prev => [product, ...prev]);
  };

  const updateProduct = (id: string, updated: Partial<Product>) => {
    setProducts(prev => prev.map(p => (p.id === id ? { ...p, ...updated } : p)));
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const replaceAllProducts = (newProducts: Product[]) => {
    setProducts(newProducts);
  };

  // Project CRUD
  const addProject = (project: Project) => {
    setProjects(prev => [project, ...prev]);
  };

  const updateProject = (id: string, updated: Partial<Project>) => {
    setProjects(prev => prev.map(p => (p.id === id ? { ...p, ...updated } : p)));
  };

  const deleteProject = (id: string) => {
    setProjects(prev => prev.filter(p => p.id !== id));
  };

  // Service CRUD
  const addService = (service: Service) => {
    setServices(prev => [service, ...prev]);
  };

  const updateService = (id: string, updated: Partial<Service>) => {
    setServices(prev => prev.map(s => (s.id === id ? { ...s, ...updated } : s)));
  };

  const deleteService = (id: string) => {
    setServices(prev => prev.filter(s => s.id !== id));
  };

  // Article CRUD
  const addArticle = (article: Article) => {
    setArticles((prev) => [article, ...prev.filter((item) => item.id !== article.id)]);
  };

  const updateArticle = (id: string, updated: Partial<Article>) => {
    setArticles((prev) => prev.map((article) => (article.id === id ? { ...article, ...updated } : article)));
  };

  const deleteArticle = (id: string) => {
    setArticles((prev) => prev.filter((article) => article.id !== id));
  };

  // Category CRUD
  const addCategory = (category: CategoryItem) => {
    setCategories(prev => [...prev, category]);
  };

  const updateCategory = (id: string, updated: Partial<CategoryItem>) => {
    setCategories(prev => prev.map(c => (c.id === id ? { ...c, ...updated } : c)));
  };

  const deleteCategory = (id: string) => {
    setCategories(prev => prev.filter(c => c.id !== id));
  };

  // Company info and CMS
  const updateCompanyInfo = (info: Partial<CompanyInfo>) => {
    setCompanyInfo(prev => ({ ...prev, ...info }));
  };

  const updateHeroCms = async (cms: Partial<HeroCmsContent>) => {
    const next = { ...heroCms, ...cms };
    await persistAdminState('heroCms', next);
    setHeroCms(next);
  };

  const updateSiteLayout = async (layout: Partial<SiteLayoutConfig>) => {
    const next = mergeSiteLayout({
      ...siteLayout,
      ...layout,
      header: { ...siteLayout.header, ...(layout.header || {}) },
      footer: { ...siteLayout.footer, ...(layout.footer || {}) },
      home: { ...siteLayout.home, ...(layout.home || {}) },
    });
    await persistAdminState('siteLayout', next);
    setSiteLayout(next);
  };

  const updatePageContent = async (content: Partial<PagesCms>) => {
    const next = mergePagesCms({
      ...pageContent,
      ...content,
      heroes: { ...pageContent.heroes, ...(content.heroes || {}) },
      about: { ...pageContent.about, ...(content.about || {}) },
      rnd: { ...pageContent.rnd, ...(content.rnd || {}) },
    });
    await persistAdminState('pageContent', next);
    setPageContent(next);
  };

  const updateAiConfig = (config: Partial<AiAdvisorConfig>) => {
    setAiConfig(prev => ({ ...prev, ...config }));
  };

  // Quote Submissions
  const addQuoteRequest = (formData: QuoteFormData): string => {
    const id = `quote-${Date.now()}`;
    const now = new Date();
    const dateStr = `${now.toLocaleDateString('fa-IR')} - ${now.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}`;
    const newRequest: QuoteRequestItem = {
      id,
      createdAt: dateStr,
      status: 'new',
      formData,
      adminNotes: ''
    };
    setQuoteRequests(prev => [newRequest, ...prev]);
    return id;
  };

  const updateQuoteStatus = (id: string, status: QuoteRequestItem['status']) => {
    setQuoteRequests(prev => prev.map(q => (q.id === id ? { ...q, status } : q)));
  };

  const updateQuoteAdminNotes = (id: string, adminNotes: string) => {
    setQuoteRequests(prev => prev.map(q => (q.id === id ? { ...q, adminNotes } : q)));
  };

  const deleteQuoteRequest = (id: string) => {
    setQuoteRequests(prev => prev.filter(q => q.id !== id));
  };

  // Consultation Submissions
  const addConsultationRequest = (formData: ConsultationFormData): string => {
    const id = `cons-${Date.now()}`;
    const now = new Date();
    const dateStr = `${now.toLocaleDateString('fa-IR')} - ${now.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}`;
    const newRequest: ConsultationRequestItem = {
      id,
      createdAt: dateStr,
      status: 'new',
      formData,
      adminNotes: ''
    };
    setConsultationRequests(prev => [newRequest, ...prev]);
    return id;
  };

  const updateConsultationStatus = (id: string, status: ConsultationRequestItem['status']) => {
    setConsultationRequests(prev => prev.map(c => (c.id === id ? { ...c, status } : c)));
  };

  const updateConsultationAdminNotes = (id: string, adminNotes: string) => {
    setConsultationRequests(prev => prev.map(c => (c.id === id ? { ...c, adminNotes } : c)));
  };

  const deleteConsultationRequest = (id: string) => {
    setConsultationRequests(prev => prev.filter(c => c.id !== id));
  };

  // Authentication is performed by the backend; no password or session token is stored in the browser.
  const login = async (username: string, password: string, turnstileToken?: string) => {
    try {
      const response = await fetch('/api/auth/login', { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password, turnstileToken }) });
      const result = await response.json().catch(() => ({ error: 'پاسخ ورود نامعتبر است.' }));
      if (response.ok) {
        await refreshCsrf();
        if (!await loadCurrentAdmin()) return { success: false, error: 'نشست ورود ساخته شد اما اطلاعات مدیر خوانده نشد.' };
        return { success: true };
      }
      return { success: false, error: result.error || 'ورود ناموفق بود.' };
    } catch {
      return { success: false, error: 'ارتباط با سرور ورود برقرار نشد.' };
    }
  };

  const logout = () => { void fetch('/api/auth/logout', { method: 'POST', credentials: 'include', headers: { 'X-CSRF-Token': csrfToken } }); setAdminUser(null); };

  const changePassword = async (oldPassword: string, newPassword: string) => {
    try {
      const tokenValue = csrfToken || await refreshCsrf();
      const response = await fetch('/api/auth/password', {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': tokenValue },
        body: JSON.stringify({ oldPassword, newPassword }),
      });
      if (response.ok) {
        setAdminUser(null);
        return { success: true };
      }
      const result = await response.json().catch(() => ({}));
      return { success: false, error: result.error || 'تغییر رمز ناموفق بود.' };
    } catch {
      return { success: false, error: 'ارتباط با سرور برقرار نشد.' };
    }
  };

  const canAccess = (section: AdminSection) => Boolean(adminUser?.isSuperadmin || adminUser?.permissions.includes(section));

  // Reset to Defaults
  const resetToDefaults = () => {
    import("../data/productsData").then((mod) => setProducts(mod.PRODUCTS)).then(() => withHiddenProducts());
    setProjects(PROJECTS);
    setServices(SERVICES);
    void import("../data/seedArticles").then(({ SEED_ARTICLES }) => setArticles(SEED_ARTICLES.map(withProductPhotos)));
    setCategories(CATEGORIES_DATA as CategoryItem[]);
    setCompanyInfo(COMPANY_INFO as CompanyInfo);
    setHeroCms(DEFAULT_HERO_CMS);
    setSiteLayout(DEFAULT_SITE_LAYOUT);
    setPageContent(DEFAULT_PAGES_CMS);
    setAiConfig(DEFAULT_AI_CONFIG);
    setQuoteRequests(INITIAL_QUOTES);
    setConsultationRequests(INITIAL_CONSULTATIONS);
  };

  // Backup Export/Import
  const exportBackupJson = () => {
    const backupData = {
      version: '3.0.0',
      exportedAt: new Date().toISOString(),
      products,
      projects,
      services,
      articles,
      categories,
      companyInfo,
      heroCms,
      siteLayout,
      pageContent,
      aiConfig,
      quoteRequests,
      consultationRequests,
    };
    return JSON.stringify(backupData, null, 2);
  };

  const importBackupJson = (jsonData: string) => {
    try {
      const parsed = JSON.parse(jsonData);
      if (parsed.products) setProducts(parsed.products);
      if (parsed.projects) setProjects(parsed.projects);
      if (parsed.services) setServices(parsed.services);
      if (parsed.articles) setArticles(loadStoredArticles(parsed.articles));
      if (parsed.categories) setCategories(parsed.categories);
      if (parsed.companyInfo) setCompanyInfo(parsed.companyInfo);
      if (parsed.heroCms) setHeroCms(parsed.heroCms);
      if (parsed.siteLayout) setSiteLayout(mergeSiteLayout(parsed.siteLayout));
      if (parsed.pageContent) setPageContent(mergePagesCms(parsed.pageContent));
      if (parsed.aiConfig) setAiConfig(parsed.aiConfig);
      if (parsed.quoteRequests) setQuoteRequests(parsed.quoteRequests);
      if (parsed.consultationRequests) setConsultationRequests(parsed.consultationRequests);
      return { success: true };
    } catch {
      return { success: false, error: 'فایل بکاپ نامعتبر یا دارای فرمت نادرست است.' };
    }
  };

  return (
    <DataContext.Provider
      value={{
        products: shownProducts,
        allProducts: products,
        catalogReady,
        addProduct,
        updateProduct,
        deleteProduct,
        replaceAllProducts,
        projects,
        addProject,
        updateProject,
        deleteProject,
        services: shownServices,
        addService,
        updateService,
        deleteService,
        articles,
        magazineReady,
        addArticle,
        updateArticle,
        deleteArticle,
        categories: shownCategories,
        addCategory,
        updateCategory,
        deleteCategory,
        setCategories,
        companyInfo: shownCompanyInfo,
        updateCompanyInfo,
        heroCms: shownHeroCms,
        updateHeroCms,
        siteLayout,
        updateSiteLayout,
        pageContent,
        updatePageContent,
        aiConfig,
        updateAiConfig,
        quoteRequests,
        addQuoteRequest,
        updateQuoteStatus,
        updateQuoteAdminNotes,
        deleteQuoteRequest,
        consultationRequests,
        addConsultationRequest,
        updateConsultationStatus,
        updateConsultationAdminNotes,
        deleteConsultationRequest,
    customers,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    mediaLibrary,
    addMedia,
    deleteMedia,
        adminUser,
        adminDataReady: adminDataReady && Boolean(csrfToken),
        adminLoadError,
        retryAdminLoad: () => setAdminLoadAttempt((attempt) => attempt + 1),
        isAuthenticated: !!adminUser,
        login,
        canAccess,
        hasAdminPassword,
        logout,
        changePassword,
        resetToDefaults,
        exportBackupJson,
        importBackupJson,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
