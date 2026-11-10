import { Business, WebsiteStatus, OpportunityLevel } from '@/types';
import { BUSINESS_CATEGORIES } from './constants';

export interface RawPlaceInput {
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
  rawWebsite?: string;
  rating?: number;
  reviewCount?: number;
  openingHours?: string[];
  services?: string[];
}

export function detectWebsiteStatus(rawWebsite?: string, instagram?: string, facebook?: string): {
  status: WebsiteStatus;
  url?: string;
} {
  if (!rawWebsite || rawWebsite.trim() === '') {
    if (instagram || facebook) {
      return { status: 'social_only', url: instagram || facebook };
    }
    return { status: 'none', url: undefined };
  }

  const cleanUrl = rawWebsite.trim().toLowerCase();

  // Social domains
  if (
    cleanUrl.includes('instagram.com') ||
    cleanUrl.includes('instagr.am') ||
    cleanUrl.includes('facebook.com') ||
    cleanUrl.includes('fb.me') ||
    cleanUrl.includes('tiktok.com') ||
    cleanUrl.includes('linkedin.com')
  ) {
    return { status: 'social_only', url: rawWebsite };
  }

  // Directory / 3rd-party delivery apps
  if (
    cleanUrl.includes('ifood.com.br') ||
    cleanUrl.includes('tripadvisor.com') ||
    cleanUrl.includes('rappi.com') ||
    cleanUrl.includes('guiamais.com.br') ||
    cleanUrl.includes('apontador.com.br') ||
    cleanUrl.includes('cardapioweb.com') ||
    cleanUrl.includes('ola.click') ||
    cleanUrl.includes('linktr.ee') ||
    cleanUrl.includes('beacons.ai') ||
    cleanUrl.includes('wa.me') ||
    cleanUrl.includes('api.whatsapp.com')
  ) {
    return { status: 'directory_only', url: rawWebsite };
  }

  // Valid domain with extension
  if (
    cleanUrl.startsWith('http://') ||
    cleanUrl.startsWith('https://') ||
    cleanUrl.includes('.com') ||
    cleanUrl.includes('.com.br') ||
    cleanUrl.includes('.net') ||
    cleanUrl.includes('.org') ||
    cleanUrl.includes('.io') ||
    cleanUrl.includes('.app') ||
    cleanUrl.includes('.med.br') ||
    cleanUrl.includes('.adv.br') ||
    cleanUrl.includes('.me')
  ) {
    return { status: 'own_website', url: rawWebsite };
  }

  return { status: 'unconfirmed', url: rawWebsite };
}

export function detectPhoneType(phone?: string): 'mobile_whatsapp' | 'landline' | 'unknown' {
  if (!phone) return 'unknown';
  const digits = phone.replace(/\D/g, '');
  let localNum = digits;
  if (localNum.startsWith('55') && (localNum.length === 12 || localNum.length === 13)) {
    localNum = localNum.slice(2);
  }
  if (localNum.length === 11) {
    const thirdDigit = localNum.charAt(2);
    if (thirdDigit === '9') return 'mobile_whatsapp';
  }
  if (localNum.length === 10) {
    const thirdDigit = localNum.charAt(2);
    if (['2', '3', '4', '5'].includes(thirdDigit)) return 'landline';
    if (['9', '8', '7'].includes(thirdDigit)) return 'mobile_whatsapp';
  }
  return 'unknown';
}

export async function lookupBrasilApiCnpj(cnpj: string) {
  try {
    const cleanCnpj = cnpj.replace(/\D/g, '');
    if (cleanCnpj.length !== 14) return null;
    const res = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cleanCnpj}`);
    if (!res.ok) return null;
    const data = await res.json();
    return {
      cnpj: data.cnpj,
      razaoSocial: data.razao_social,
      nomeFantasia: data.nome_fantasia,
      owners: (data.qsa || []).map((s: any) => s.nome_socio),
      situacao: data.descricao_situacao_cadastral,
      cnae: data.cnae_fiscal_descricao,
    };
  } catch {
    return null;
  }
}

export function analyzeOpportunity(input: RawPlaceInput): Business {
  const { status: websiteStatus, url: websiteUrl } = detectWebsiteStatus(
    input.rawWebsite,
    input.instagram,
    input.facebook
  );

  const phoneType = detectPhoneType(input.whatsapp || input.phone);

  const hasPhone = Boolean(input.phone && input.phone.trim().length > 5);
  const hasWhatsapp = Boolean(input.whatsapp && input.whatsapp.trim().length > 5);
  const hasInstagram = Boolean(input.instagram && input.instagram.trim().length > 2);
  const hasFacebook = Boolean(input.facebook && input.facebook.trim().length > 2);
  const hasDigitalPresence = hasInstagram || hasFacebook || websiteStatus === 'directory_only';
  const hasGoodRating = (input.rating || 0) >= 4.0;
  const hasManyReviews = (input.reviewCount || 0) >= 20;

  // High conversion categories for local landing pages
  const highConversionCategories = [
    'barbearia',
    'estetica',
    'odontologia',
    'academia',
    'pizzaria',
    'restaurante',
    'oficina',
    'petshop',
    'imobiliaria',
  ];
  const isHighValueCategory = highConversionCategories.includes(input.categoryKey);

  let opportunityScore: OpportunityLevel = 'medium';
  let opportunityReason = '';

  // 1. If it already has its own verified website:
  if (websiteStatus === 'own_website') {
    opportunityScore = 'low';
    opportunityReason =
      'O estabelecimento já possui um site próprio institucional indexado. A chance de contratação imediata de uma nova landing page é baixa.';
  }
  // 2. High Opportunity condition:
  // - No own website (none, social_only, directory_only)
  // - Has digital presence (Instagram/Facebook) or active contact (WhatsApp)
  // - Fits high commercial value categories
  else if (
    (websiteStatus === 'none' || websiteStatus === 'social_only' || websiteStatus === 'directory_only') &&
    (hasDigitalPresence || hasWhatsapp) &&
    isHighValueCategory &&
    (hasPhone || hasWhatsapp)
  ) {
    opportunityScore = 'high';

    if (websiteStatus === 'social_only') {
      opportunityReason =
        `Possui presença digital ativa no Instagram (${input.instagram || 'perfil social'}), boa receptividade do público, mas depende exclusivamente de redes sociais ou link na bio. Uma landing page profissional aumentará a conversão de agendamentos e orçamentos via WhatsApp.`;
    } else if (websiteStatus === 'directory_only') {
      opportunityReason =
        `Utiliza apenas aplicativos de terceiros ou diretórios (ex: delivery/cardápio externo), pagando taxas ou perdendo a identidade da marca. Uma landing page própria trará autonomia e captação direta de clientes sem intermediários.`;
    } else {
      opportunityReason =
        `Negócio local com forte apelo visual e comercial no segmento de ${input.category}. Não possui site próprio identificado, mas tem contato direto estabelecido. Uma landing page com catálogo de serviços e botão WhatsApp é perfeita para fechar vendas.`;
    }
  }
  // 3. Medium Opportunity condition:
  else if (
    (websiteStatus === 'none' || websiteStatus === 'unconfirmed') &&
    (hasPhone || hasWhatsapp || hasDigitalPresence)
  ) {
    opportunityScore = 'medium';
    opportunityReason =
      `Não possui site identificado, porém tem presença digital modesta ou informações parciais cadastradas. Apresenta potencial para uma página comercial simples focada em localização e contato rápido.`;
  }
  // 4. Low Opportunity condition:
  else {
    opportunityScore = 'low';
    opportunityReason =
      `Poucas informações de contato confirmadas ou segmento de baixa necessidade de landing page. É recomendável priorizar estabelecimentos com maior presença e dados verificáveis.`;
  }

  // Get photo samples based on category
  const photos = getCategoryPhotos(input.categoryKey);

  // Fallback services if none provided
  const categoryDef = BUSINESS_CATEGORIES.find((c) => c.key === input.categoryKey);
  const services = input.services && input.services.length > 0
    ? input.services
    : (categoryDef ? categoryDef.defaultServices : ['Atendimento Personalizado', 'Serviço Especializado']);

  return {
    id: input.id,
    name: input.name,
    category: input.category,
    categoryKey: input.categoryKey,
    address: input.address,
    neighborhood: input.neighborhood,
    city: input.city,
    lat: input.lat,
    lng: input.lng,
    distanceKm: input.distanceKm,
    phone: input.phone,
    whatsapp: input.whatsapp,
    instagram: input.instagram,
    facebook: input.facebook,
    websiteUrl,
    websiteStatus,
    rating: input.rating,
    reviewCount: input.reviewCount,
    openingHours: input.openingHours,
    photos,
    services,
    opportunityScore,
    opportunityReason,
    phoneType,
    verifiedFields: {
      hasPhysicalLocation: Boolean(input.address && !input.address.includes('Não informado')),
      hasPhone: Boolean(hasPhone || hasWhatsapp),
      hasSocial: Boolean(hasInstagram || hasFacebook),
      hasReviews: Boolean(input.reviewCount && input.reviewCount > 0),
    },
  };
}

function getCategoryPhotos(categoryKey: string): string[] {
  const photoMap: Record<string, string[]> = {
    barbearia: [
      'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=800&q=80',
    ],
    estetica: [
      'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1512290900672-1f413a967c7e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1560750588-73207b1ef5b8?auto=format&fit=crop&w=800&q=80',
    ],
    odontologia: [
      'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1598256989800-fe5f95da9787?auto=format&fit=crop&w=800&q=80',
    ],
    academia: [
      'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80',
    ],
    restaurante: [
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=800&q=80',
    ],
    pizzaria: [
      'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=800&q=80',
    ],
    oficina: [
      'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80',
    ],
    petshop: [
      'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=800&q=80',
    ],
    imobiliaria: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80',
    ],
    escola: [
      'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=80',
    ],
    servicos: [
      'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
    ],
  };

  return photoMap[categoryKey] || photoMap.servicos;
}
