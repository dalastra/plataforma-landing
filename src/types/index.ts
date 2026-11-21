export type WebsiteStatus =
  | 'none'
  | 'own_website'
  | 'social_only'
  | 'directory_only'
  | 'unconfirmed';

export type OpportunityLevel = 'high' | 'medium' | 'low';

export interface Business {
  id: string;
  name: string;
  category: string;
  categoryKey: string;
  address: string;
  neighborhood?: string;
  city?: string;
  lat: number;
  lng: number;
  distanceKm?: number;
  phone?: string;
  whatsapp?: string;
  instagram?: string;
  facebook?: string;
  websiteUrl?: string;
  websiteStatus: WebsiteStatus;
  rating?: number;
  reviewCount?: number;
  openingHours?: string[];
  photos: string[];
  services: string[];
  opportunityScore: OpportunityLevel;
  opportunityReason: string;
  phoneType?: 'mobile_whatsapp' | 'landline' | 'unknown';
  cnpj?: string;
  legalName?: string;
  owners?: string[];
  verifiedFields: {
    hasPhysicalLocation: boolean;
    hasPhone: boolean;
    hasSocial: boolean;
    hasReviews: boolean;
  };
  customHeadline?: string;
  customSubheadline?: string;
  customSlogan?: string;
  customServices?: string[];
  customAboutStory?: string;
  customDifferentials?: string[];
  logoUrl?: string;
}

export type StylePresetId =
  | 'modern-minimalist'
  | 'premium-sophisticated'
  | 'corporate-elegant'
  | 'urban-bold'
  | 'creative-playful'
  | 'sports-energetic'
  | 'luxury-exclusive'
  | 'clean-commercial';

export type HeroLayoutType = 'split-right' | 'centered' | 'card-overlay' | 'editorial-clean';
export type CardStyleType = 'glass' | 'solid' | 'bordered' | 'minimal';

export interface DesignTokens {
  theme?: 'dark' | 'light';
  bgColor?: string;
  textColor?: string;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  cardBg?: string;
  cardBorder?: string;
  fontHeading?: string;
  fontBody?: string;
  buttonRadius?: 'rounded-none' | 'rounded-md' | 'rounded-xl' | 'rounded-full';
  heroLayout?: HeroLayoutType;
  cardStyle?: CardStyleType;
}

export interface LandingPageStyle {
  id: StylePresetId;
  name: string;
  description: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  bgColor: string;
  textColor: string;
  fontHeading: string;
  fontBody: string;
  buttonRadius: 'rounded-none' | 'rounded-md' | 'rounded-xl' | 'rounded-full';
  theme: 'dark' | 'light';
  minimalismLevel: number; // 1 to 5
  isLogoCustomized?: boolean;
  logoPalette?: {
    primary: string;
    accent: string;
    secondary?: string;
    isLightLogo?: boolean;
  };
  heroLayout?: HeroLayoutType;
  cardStyle?: CardStyleType;
  cardBg?: string;
  cardBorder?: string;
}

export interface SectionHero {
  headline: string;
  subheadline: string;
  ctaText: string;
  ctaWhatsapp: boolean;
  badge?: string;
  backgroundImage?: string;
}

export interface SectionAbout {
  title: string;
  story: string;
  highlights: string[];
  image?: string;
}

export interface SectionServiceItem {
  id: string;
  title: string;
  description: string;
  price?: string;
  iconName?: string;
}

export interface SectionServices {
  title: string;
  subtitle: string;
  items: SectionServiceItem[];
}

export interface SectionDifferentialItem {
  title: string;
  description: string;
}

export interface SectionDifferentials {
  title: string;
  items: SectionDifferentialItem[];
}

export interface SectionGallery {
  title: string;
  images: { url: string; caption: string }[];
}

export interface SectionTestimonialItem {
  author: string;
  role?: string;
  text: string;
  rating: number;
}

export interface SectionTestimonials {
  title: string;
  items: SectionTestimonialItem[];
}

export interface SectionLocation {
  title: string;
  address: string;
  hours: string[];
  whatsapp: string;
  phone?: string;
  mapEmbedUrl?: string;
}

export type ReferenceMode = 'system_template' | 'url' | 'image';

export interface SiteReferenceInput {
  mode: ReferenceMode;
  url?: string;
  image?: string;
  notes?: string;
}

export interface CardapioItem {
  id: string;
  name: string;
  description: string;
  price: string;
  badge?: string;
  image?: string;
}

export interface PricingPlan {
  name: string;
  price: string;
  period: string;
  features: string[];
  recommended?: boolean;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface TeamMember {
  name: string;
  role: string;
  specialty: string;
  photo?: string;
}

export interface PropertyItem {
  id: string;
  title: string;
  price: string;
  location: string;
  specs: string[];
  image: string;
  badge?: string;
}

export interface ServiceTableItem {
  name: string;
  duration: string;
  price: string;
  description?: string;
}

export interface LandingPageContent {
  businessName: string;
  tagline: string;
  hero: SectionHero;
  about: SectionAbout;
  services: SectionServices;
  differentials: SectionDifferentials;
  gallery: SectionGallery;
  testimonials: SectionTestimonials;
  location: SectionLocation;
  whatsappNumber: string;
  instagramHandle?: string;
  logoUrl?: string;
  // Specialized segment modules for high conversion & non-generic layouts
  cardapioItems?: CardapioItem[];
  pricingPlans?: PricingPlan[];
  faqItems?: FaqItem[];
  specialBadges?: string[];
  teamMembers?: TeamMember[];
  propertyItems?: PropertyItem[];
  serviceTable?: ServiceTableItem[];
  layoutType?: 'gastronomy' | 'health_clinic' | 'grooming_beauty' | 'fitness' | 'automotive' | 'real_estate' | 'pet_care' | 'modern_business';
  heroLayout?: HeroLayoutType;
  designTokens?: DesignTokens;
}

export interface LandingPageProject {
  id: string;
  businessId: string;
  businessName: string;
  category: string;
  style: LandingPageStyle;
  content: LandingPageContent;
  logoUrl?: string;
  htmlContent?: string;
  reference?: SiteReferenceInput;
  createdAt: string;
  updatedAt: string;
  status: 'draft' | 'ready' | 'shared';
  vercelUrl?: string;
  demoViewsCount?: number;
  lastDemoViewedAt?: string;
  customDomain?: string;
}

export type LeadStatus =
  | 'new'
  | 'analyzed'
  | 'landing_page_created'
  | 'contacted'
  | 'demo_viewed'
  | 'negotiating'
  | 'won'
  | 'lost';

export interface Lead {
  id: string;
  businessId: string;
  business: Business;
  status: LeadStatus;
  projectId?: string;
  notes: string;
  isFavorite: boolean;
  dealValue?: number;
  demoViewsCount?: number;
  lastDemoViewedAt?: string;
  firstContactAt?: string;
  lastContactDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CommercialPitch {
  businessName: string;
  whatsappMessage: string;
  instagramMessage: string;
  directMessage: string;
  formalMessage: string;
  casualMessage: string;
}

export interface AppSettings {
  geminiApiKey: string;
  googlePlacesApiKey: string;
  provider: 'gemini' | 'heuristic';
  mapProvider: 'osm' | 'google';
  userCity: string;
  defaultRadiusKm: number;
  vercelAccessToken?: string;
  vercelTeamId?: string;
  vercelUser?: {
    id: string;
    username: string;
    email: string;
    name?: string;
    avatar?: string;
  };
}
