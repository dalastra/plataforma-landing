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
  verifiedFields: {
    hasPhysicalLocation: boolean;
    hasPhone: boolean;
    hasSocial: boolean;
    hasReviews: boolean;
  };
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
}

export interface LandingPageProject {
  id: string;
  businessId: string;
  businessName: string;
  category: string;
  style: LandingPageStyle;
  content: LandingPageContent;
  htmlContent?: string;
  createdAt: string;
  updatedAt: string;
  status: 'draft' | 'ready' | 'shared';
}

export type LeadStatus =
  | 'new'
  | 'analyzed'
  | 'landing_page_created'
  | 'contacted'
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
}
