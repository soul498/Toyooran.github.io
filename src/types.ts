import type { RichBlock } from "./seo/richText";
// UI Sync triggered
export type PageSection = 'home' | 'projects' | 'products' | 'services' | 'knowledge' | 'magazine' | 'about' | 'contact' | 'magazine-article' | 'rnd';

export type ProductCategory = 
  | 'heating'
  | 'ventilation'
  | 'drinking'
  | 'cooling'
  | 'inlet'
  | 'feeding'
  | 'cage'
  | 'silo'
  | 'other';

export interface CategoryItem {
  id: ProductCategory | string;
  title: string;
  titleEn?: string;
  description: string;
  icon: string;
  iconName?: string;
  productCount?: number;
  badge?: string;
  image?: string;
}

export type CategoryInfo = CategoryItem;

export interface ProjectCaseStudy {
  problem: string;
  clientNeed: string;
  solution: string;
  processSteps: { title: string; desc: string }[];
  equipmentList: string[];
  results: { label: string; value: string; detail: string }[];
}

export interface Project {
  id: string;
  title: string;
  type: 'broiler' | 'layer' | 'breeder' | 'feed_mill' | 'agriculture' | string;
  typeTitle: string;
  capacity: string;
  location: string;
  year: string;
  image: string;
  servicesProvided: string[];
  equipmentSummary: string[];
  keyOutcome: string;
  caseStudy?: ProjectCaseStudy;
}

export interface ProductSpec {
  label: string;
  value: string;
}

export interface Product {
  /** English pages only (never stored): the Persian name, so /en product URLs keep the Persian slug. */
  slugName?: string;
  isFeatured?: boolean;
  /** Hidden from the public site and search engines; kept for the admin panel (re-enable by clearing it). */
  hidden?: boolean;
  id: string;
  code: string;
  /** Optional clean Latin URL slug (e.g. "jet-heater"); without it the slug is `<name>-<code>`. */
  slug?: string;
  /** Optional <title> override; defaults to `<name> | طیوران صنعت پویا`. */
  seoTitle?: string;
  /** Third-party product: omit brand/manufacturer from the Product JSON-LD. */
  noBrandSchema?: boolean;
  /** Optional Persian alt text for the main product image (defaults to the product name). */
  imageAlt?: string;
  /** Optional display label per related article id (overrides the article title in «راهنمای مرتبط»). */
  articleLinkLabels?: Record<string, string>;
  name: string;
  nameEn?: string;
  category: ProductCategory;
  categoryTitle: string;
  isIndustrialMachine?: boolean;
  shortDescription: string;
  fullDescription: string;
  image: string;
  gallery?: string[];
  advantages: string[];
  applications: string[];
  specs: ProductSpec[];
  models?: string[];
  catalogPdfName?: string;
  relatedProjectIds?: string[];
  relatedArticleIds?: string[];
  faqs?: { q: string; a: string }[];
  /** Approved long-form copy under «معرفی محصول»; rendered in #seo-prerender and on the product page. */
  details?: RichBlock[];
  /** Product page: up to 6 key-spec tiles beside the photo (taken from `specs`; defaults to the first 6 specs). */
  keySpecs?: ProductSpec[];
  /** Product ids never shown in this product's related list (page-level editorial choice). */
  relatedExclude?: string[];
  /** Product page: short line under the H1 (from the product's own copy). */
  subline?: string;
  /** Product page: sentence in the «استعلام قیمت و مشاورهٔ رایگان» box (from the product's own copy). */
  inquiryNote?: string;
}

export interface ServiceWorkflowStep {
  stepNumber: number;
  title: string;
  description: string;
  deliverable: string;
}

export interface Service {
  id: string;
  title: string;
  tagline: string;
  iconName: string;
  problemSolved: string;
  whatWeProvide: string[];
  workflow: ServiceWorkflowStep[];
  suitableFor: string[];
  relatedEquipmentCategories: string[];
  sampleProjectIds: string[];
  faqs: { q: string; a: string }[];
}

export interface ArticleSource {
  name: string;
  url?: string;
}

export interface Article {
  id: string;
  title: string;
  category: 'article' | 'technical-guide' | 'product-guide' | 'faq' | string;
  categoryLabel: string;
  readTime: string;
  date: string;
  datePublishedIso?: string;
  dateModifiedIso?: string;
  summary: string;
  content: string[];
  image?: string;
  tags?: string[];
  /** Fixed topic tag slug (see src/seo/topics.ts). */
  topic?: string;
  relatedProductIds: string[];
  relatedServiceId?: string;
  authorName?: string;
  authorRole?: string;
  reviewerName?: string;
  reviewerRole?: string;
  sources?: ArticleSource[];
  /** پیش‌نویس روی سایت، سایت‌مپ و نتایج جستجو نمی‌آید. مقدار خالی یعنی منتشرشده. */
  status?: 'draft' | 'published';
  seoTitle?: string;
  seoDescription?: string;
  focusKeyword?: string;
  imageAlt?: string;
  /** اگر true باشد صفحه عمومی است ولی noindex می‌ماند. */
  noindex?: boolean;
  /** نامک‌های قبلی برای ریدایرکت ۳۰۱ به آدرس جدید. */
  aliases?: string[];
}

export interface CompanyInfo {
  nameFa?: string;
  nameEn?: string;
  tagline?: string;
  subTagline?: string;
  experienceYears?: string;
  completedProjects?: string;
  activeProvinces?: string;
  customerSatisfaction?: string;
  phone: string;
  salesPhone?: string;
  directSalesPhone?: string;
  supportPhone?: string;
  technicalSupportPhone?: string;
  email?: string;
  website?: string;
  address: string;
  rdAddress?: string;
  factoryAddress: string;
  workingHours: string;
  fdaLicense?: string;
  fdaLicenseText?: string;
  socialLinks?: {
    instagram?: string;
    telegram?: string;
    whatsapp?: string;
    linkedin?: string;
    bale?: string;
    eitaa?: string;
    rubika?: string;
    aparat?: string;
    youtube?: string;
  };
  locations?: {
    id: string;
    title: string;
    type: 'headquarter' | 'factory' | 'branch' | 'rd';
    address: string;
    mapEmbedUrl?: string;
    baladEmbedUrl?: string;
    lat?: number;
    lng?: number;
  }[];
}

export interface HeroCms {
  title: string;
  subtitle: string;
  pillText?: string;
  ctaPrimaryText?: string;
  ctaSecondaryText?: string;
  backgroundImage?: string;
}

export type HeroCmsContent = HeroCms;

export interface QuoteFormData {
  projectType: string;
  targetCategory: ProductCategory | 'multiple' | string;
  selectedEquipment: string[];
  capacity: string;
  deliveryLocation: string;
  companyName: string;
  fullName: string;
  phoneNumber: string;
  email?: string;
  additionalNotes: string;
  hasAttachment?: boolean;
}

export interface QuoteRequestItem {
  id: string;
  createdAt: string;
  status: 'new' | 'in_progress' | 'contacted' | 'completed' | 'archived';
  formData: QuoteFormData;
  adminNotes?: string;
}

export type QuoteRequest = QuoteRequestItem;

export interface ConsultationFormData {
  fullName: string;
  phoneNumber: string;
  requestType: 'project-design' | 'equipment-selection' | 'efficiency-audit' | 'after-sales' | 'technical-inquiry' | string;
  projectType: string;
  projectCapacity: string;
  location: string;
  message: string;
}

export interface ConsultationRequestItem {
  id: string;
  createdAt: string;
  status: 'new' | 'in_progress' | 'contacted' | 'completed' | 'archived';
  formData: ConsultationFormData;
  adminNotes?: string;
}

export type ConsultationRequest = ConsultationRequestItem;

export interface AiAdvisorConfig {
  systemPrompt: string;
  welcomeMessage: string;
  suggestedQuestions: string[];
}

export interface AdminUser {
  username: string;
  displayName: string;
  role: 'superadmin' | 'editor';
}


export type PipelineStage =
  | 'directory'
  | 'new_lead'
  | 'contacted'
  | 'consulting'
  | 'proposal'
  | 'negotiation'
  | 'won'
  | 'lost';

export interface FollowUpRecord {
  id: string;
  date: string;
  note: string;
  performedBy?: string;
  status: 'pending' | 'completed' | 'cancelled';
  priority?: 'high' | 'medium' | 'low';
}

export interface CustomerContact {
  id: string;
  fullName: string;
  phoneNumber: string;
  email?: string;
  companyName?: string;
  role?: string;
  source: 'quote' | 'consultation' | 'manual' | string;
  notes?: string;
  createdAt: string;
  nextFollowUpDate?: string;
  nextFollowUpTime?: string;
  nextFollowUpNote?: string;
  followUpPriority?: 'high' | 'medium' | 'low';
  followUpStatus?: 'pending' | 'completed' | 'cancelled' | 'none';
  lastFollowUpDate?: string;
  followUpHistory?: FollowUpRecord[];
  tags?: string[];
  pipelineStage?: PipelineStage | string;
  dealValue?: string;
  farmCapacity?: string;
  province?: string;
  linkedInboundIds?: string[];
}

export interface MediaItem {
  id: string;
  url: string;
  title: string;
  createdAt: string;
}
