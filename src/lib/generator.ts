import {
  Business,
  LandingPageContent,
  LandingPageProject,
  LandingPageStyle,
  SiteReferenceInput,
  CardapioItem,
  PricingPlan,
  FaqItem,
  TeamMember,
  PropertyItem,
  ServiceTableItem,
} from '@/types';
import { STYLE_PRESETS } from './constants';

export const CATEGORY_STOCK_PHOTOS: Record<
  string,
  { hero: string; about: string; gallery: string[] }
> = {
  barbearia: {
    hero: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=1600&q=80',
    about: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&w=1000&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1512690459411-b9245aed614b?auto=format&fit=crop&w=800&q=80',
    ],
  },
  odontologia: {
    hero: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=1600&q=80',
    about: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=1000&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1598256989800-fe5f95da9787?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80',
    ],
  },
  estetica: {
    hero: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=1600&q=80',
    about: 'https://images.unsplash.com/photo-1512290900672-1f41b3123869?auto=format&fit=crop&w=1000&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1519415510236-718bdfcd89c8?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=800&q=80',
    ],
  },
  academia: {
    hero: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1600&q=80',
    about: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1000&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=800&q=80',
    ],
  },
  pizzaria: {
    hero: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1600&q=80',
    about: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=1000&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1590947132387-155cc02f3212?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1528137871618-79d2761e3fd5?auto=format&fit=crop&w=800&q=80',
    ],
  },
  restaurante: {
    hero: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1600&q=80',
    about: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1000&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=800&q=80',
    ],
  },
  oficina: {
    hero: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=1600&q=80',
    about: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=1000&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1487754180451-c456f719a1fc?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1530046339160-ce3e530c7d2f?auto=format&fit=crop&w=800&q=80',
    ],
  },
  petshop: {
    hero: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=1600&q=80',
    about: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=1000&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1535268647677-300dbf3d78d1?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1541599540903-216a46ca1dc0?auto=format&fit=crop&w=800&q=80',
    ],
  },
  imobiliaria: {
    hero: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80',
    about: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1000&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
    ],
  },
  geral: {
    hero: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1600&q=80',
    about: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1000&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80',
    ],
  },
};

export function getCuratedPhotosForBusiness(business: Business) {
  const stock = CATEGORY_STOCK_PHOTOS[business.categoryKey] || CATEGORY_STOCK_PHOTOS.geral;
  const userPhotos = business.photos || [];

  const heroPhoto = userPhotos[0] || stock.hero;
  const aboutPhoto = userPhotos[1] || userPhotos[0] || stock.about;
  const galleryPhotos = userPhotos.length > 0 ? userPhotos : stock.gallery;

  return { heroPhoto, aboutPhoto, galleryPhotos };
}

async function inspectReferenceUrl(
  url: string
): Promise<{ title?: string; description?: string; headings?: string[] } | null> {
  try {
    const targetUrl = url.startsWith('http') ? url : `https://${url}`;
    const res = await fetch(targetUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      },
      signal: AbortSignal.timeout(3500),
    });
    if (!res.ok) return null;
    const html = await res.text();
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
    const headings = Array.from(html.matchAll(/<h[123][^>]*>([^<]+)<\/h[123]>/gi))
      .map((m) => m[1].replace(/<[^>]+>/g, '').trim())
      .filter((h) => h.length > 4 && h.length < 80)
      .slice(0, 5);

    return {
      title: titleMatch ? titleMatch[1].trim() : undefined,
      description: descMatch ? descMatch[1].trim() : undefined,
      headings,
    };
  } catch {
    return null;
  }
}

export async function generateLandingPageProject(
  business: Business,
  styleOverride?: LandingPageStyle,
  geminiApiKey?: string,
  reference?: SiteReferenceInput
): Promise<LandingPageProject> {
  const defaultStyleId =
    styleOverride?.id ||
    (business.categoryKey === 'barbearia'
      ? 'urban-bold'
      : business.categoryKey === 'odontologia'
      ? 'clean-commercial'
      : business.categoryKey === 'estetica'
      ? 'premium-sophisticated'
      : business.categoryKey === 'academia'
      ? 'sports-energetic'
      : business.categoryKey === 'imobiliaria'
      ? 'luxury-exclusive'
      : business.categoryKey === 'pizzaria' || business.categoryKey === 'restaurante'
      ? 'urban-bold'
      : business.categoryKey === 'petshop'
      ? 'creative-playful'
      : business.categoryKey === 'oficina'
      ? 'corporate-elegant'
      : 'modern-minimalist');

  const style = styleOverride || STYLE_PRESETS[defaultStyleId] || STYLE_PRESETS['modern-minimalist'];

  let inspectedRef: { title?: string; description?: string; headings?: string[] } | null = null;
  if (reference?.mode === 'url' && reference.url) {
    inspectedRef = await inspectReferenceUrl(reference.url);
  }

  let content: LandingPageContent;
  if (geminiApiKey && geminiApiKey.trim().length > 10) {
    try {
      content = await generateWithGemini(business, style, geminiApiKey);
    } catch (err) {
      console.warn('Gemini generation failed, falling back to heuristic engine:', err);
      content = generateSemanticContent(business, style, reference, inspectedRef);
    }
  } else {
    content = generateSemanticContent(business, style, reference, inspectedRef);
  }

  const projectId = `proj-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const htmlContent = renderStandaloneHtml(content, style, business, reference);

  return {
    id: projectId,
    businessId: business.id,
    businessName: business.name,
    category: business.category,
    style,
    content,
    logoUrl: business.logoUrl,
    htmlContent,
    reference,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'ready',
  };
}

async function generateWithGemini(
  business: Business,
  style: LandingPageStyle,
  apiKey: string
): Promise<LandingPageContent> {
  const prompt = `
Você é um Copywriter e Diretor de Arte sênior especialista em Landing Pages de Altíssima Conversão para negócios locais no Brasil.
Crie o conteúdo completo para uma landing page de alto padrão para:

Nome: ${business.name}
Categoria: ${business.category} (Chave: ${business.categoryKey})
Endereço: ${business.address}
Telefone/WhatsApp: ${business.phone || business.whatsapp || 'WhatsApp Comercial'}
Serviços: ${business.services.join(', ')}
Avaliação: ${business.rating ? `${business.rating} estrelas (${business.reviewCount} avaliações)` : 'Excelente reputação'}

Responda ESTRITAMENTE em formato JSON puro com a seguinte estrutura:
{
  "businessName": "${business.name}",
  "tagline": "Slogan de alto impacto",
  "layoutType": "${
    business.categoryKey === 'pizzaria' || business.categoryKey === 'restaurante'
      ? 'gastronomy'
      : business.categoryKey === 'barbearia'
      ? 'grooming_beauty'
      : business.categoryKey === 'odontologia' || business.categoryKey === 'estetica'
      ? 'health_clinic'
      : business.categoryKey === 'academia'
      ? 'fitness'
      : business.categoryKey === 'oficina'
      ? 'automotive'
      : business.categoryKey === 'petshop'
      ? 'pet_care'
      : business.categoryKey === 'imobiliaria'
      ? 'real_estate'
      : 'modern_business'
  }",
  "hero": {
    "headline": "Título chamativo e persuasivo",
    "subheadline": "Subtítulo explicando o valor e benefício",
    "ctaText": "Texto do botão principal (ex: Agendar Horário)",
    "ctaWhatsapp": true,
    "badge": "Destaque curto"
  },
  "about": {
    "title": "Sobre Nós",
    "story": "História e proposta de valor",
    "highlights": ["Destaque 1", "Destaque 2", "Destaque 3"]
  },
  "services": {
    "title": "Nossos Serviços",
    "subtitle": "Conheça nossas soluções",
    "items": [
      { "id": "s1", "title": "Serviço 1", "description": "Descrição detalhada com benefícios", "price": "R$ ..." }
    ]
  },
  "differentials": {
    "title": "Por que nos escolher",
    "items": [
      { "title": "Diferencial 1", "description": "Explicação persuasiva" }
    ]
  },
  "testimonials": {
    "title": "Depoimentos Reais",
    "items": [
      { "author": "Nome do Cliente", "role": "Cliente Frequente", "text": "Depoimento convincente e realista", "rating": 5 }
    ]
  }
}
`;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.7,
        },
      }),
    }
  );

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Gemini API error ${res.status}: ${errorText}`);
  }

  const data = await res.json();
  const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawText) throw new Error('No response from Gemini API');

  const cleanJson = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
  const parsed = JSON.parse(cleanJson);
  const { heroPhoto, aboutPhoto, galleryPhotos } = getCuratedPhotosForBusiness(business);

  // Return parsed blended with fallback semantic modules
  const fallback = generateSemanticContent(business, style);

  return {
    ...fallback,
    ...parsed,
    businessName: business.name,
    logoUrl: business.logoUrl,
    hero: {
      ...parsed.hero,
      backgroundImage: heroPhoto,
    },
    about: {
      ...parsed.about,
      image: aboutPhoto,
    },
    gallery: {
      title: 'Galeria e Espaço',
      images: galleryPhotos.map((url, idx) => ({
        url,
        caption: `${business.name} #${idx + 1}`,
      })),
    },
    location: {
      title: 'Onde Estamos & Horários',
      address: business.address,
      hours:
        business.openingHours && business.openingHours.length > 0
          ? business.openingHours
          : ['Segunda a Sexta: 08:30 às 19:00', 'Sábados: 09:00 às 15:00'],
      whatsapp: business.whatsapp || business.phone || '',
      phone: business.phone,
    },
    whatsappNumber: business.whatsapp || business.phone || '',
    instagramHandle: business.instagram,
  };
}

export function generateSemanticContent(
  business: Business,
  _style?: LandingPageStyle,
  _reference?: SiteReferenceInput,
  inspectedRef?: { title?: string; description?: string; headings?: string[] } | null
): LandingPageContent {
  const cat = business.categoryKey;

  let layoutType:
    | 'gastronomy'
    | 'health_clinic'
    | 'grooming_beauty'
    | 'fitness'
    | 'automotive'
    | 'real_estate'
    | 'pet_care'
    | 'modern_business' = 'modern_business';

  if (cat === 'pizzaria' || cat === 'restaurante') {
    layoutType = 'gastronomy';
  } else if (cat === 'barbearia') {
    layoutType = 'grooming_beauty';
  } else if (cat === 'odontologia' || cat === 'estetica') {
    layoutType = 'health_clinic';
  } else if (cat === 'academia') {
    layoutType = 'fitness';
  } else if (cat === 'oficina') {
    layoutType = 'automotive';
  } else if (cat === 'petshop') {
    layoutType = 'pet_care';
  } else if (cat === 'imobiliaria') {
    layoutType = 'real_estate';
  }

  const { heroPhoto, aboutPhoto, galleryPhotos } = getCuratedPhotosForBusiness(business);

  // High-converting copy & niche modules
  let headline = `Excelência e Padrão Superior em ${business.category}`;
  let subheadline = `Descubra um atendimento diferenciado, pontualidade rigorosa e soluções pensadas sob medida para você na ${business.name}.`;
  let ctaText = 'Falar no WhatsApp';
  let badge = 'Atendimento Premium';

  let cardapioItems: CardapioItem[] | undefined = undefined;
  let pricingPlans: PricingPlan[] | undefined = undefined;
  let faqItems: FaqItem[] | undefined = undefined;
  let specialBadges: string[] | undefined = undefined;
  let teamMembers: TeamMember[] | undefined = undefined;
  let propertyItems: PropertyItem[] | undefined = undefined;
  let serviceTable: ServiceTableItem[] | undefined = undefined;

  if (layoutType === 'gastronomy') {
    headline = cat === 'pizzaria'
      ? 'A Verdadeira Pizza Artesanal com Massa de Fermentação Lenta 48h'
      : 'Experiência Gastronômica Única, Saborosa e Memorável';
    subheadline = 'Ingredientes nobres selecionados, receitas de família e embalagem térmica lacrada para o seu pedido chegar quentinho e impecável.';
    ctaText = 'Fazer Pedido no WhatsApp • Entrega Rápida';
    badge = '⭐ 4.9 no Google • Forno a Lenha & Delivery Expresso';

    cardapioItems = [
      {
        id: 'cd-1',
        name: cat === 'pizzaria' ? 'Pizza Especial da Casa (Massa Fermentação 48h)' : 'Prato Especial do Chef',
        description: 'Molho de tomate pelado San Marzano, blend nobre de queijos, manjericão fresco e crosta crocante com alveolos perfeitos.',
        price: 'R$ 79,90',
        badge: '🔥 Mais Pedida',
        image: galleryPhotos[0],
      },
      {
        id: 'cd-2',
        name: cat === 'pizzaria' ? 'Pizza Quatro Queijos Premium com Mel Silvestre' : 'Corte Nobre com Risoto Trufado',
        description: 'Gorgonzola doce, parmesão curado 12 meses, muçarela especial e fios de mel artesanal.',
        price: 'R$ 84,90',
        badge: '🏆 Campeã de Avaliações',
        image: galleryPhotos[1],
      },
      {
        id: 'cd-3',
        name: cat === 'pizzaria' ? 'Combo Família: 1 Grande + 1 Broto Doce + Refri' : 'Combo Degustação Completo para Dois',
        description: 'A combinação ideal para reunir quem você gosta com economia e a melhor experiência culinária.',
        price: 'R$ 109,00',
        badge: '✨ Melhor Custo-Benefício',
        image: galleryPhotos[2],
      },
      {
        id: 'cd-4',
        name: 'Sobremesa Artesanal da Casa',
        description: 'Receita autoral exclusiva com chocolate nobre e finalização crocante.',
        price: 'R$ 29,90',
        badge: '🍫 Irresistível',
        image: galleryPhotos[0],
      },
    ];

    specialBadges = [
      '🛵 Entrega média em 35 a 45 min',
      '📦 Embalagem térmica lacrada',
      '🍕 Massa 100% digestiva e leve',
      '💳 Pix, Cartões e Vale-Refeição',
    ];
  } else if (layoutType === 'grooming_beauty') {
    headline = 'Cortes Modernos, Barba Alinhada e o Estilo que Você Merece';
    subheadline = 'Ambiente pensado para o homem contemporâneo. Cerveja gelada cortesia, barboterapia com toalha quente e os mestres da tesoura mais renomados da região.';
    ctaText = 'Agendar Horário no WhatsApp';
    badge = '💈 Tradição & Navalha Afiada • Desde 2018';

    serviceTable = [
      {
        name: 'Corte Degradê Executivo / Fade',
        duration: '45 min',
        price: 'R$ 55',
        description: 'Degradê na navalha ou shaver, lavagem especial e finalização com pomada matte importada.',
      },
      {
        name: 'Barboterapia com Toalha Quente',
        duration: '35 min',
        price: 'R$ 45',
        description: 'Esfoliação suave, toalha aromática aquecida, navalhete descartável e óleo nutritivo.',
      },
      {
        name: 'Combo Master (Cabelo + Barba + Sobrancelha)',
        duration: '1h 15m',
        price: 'R$ 85',
        description: 'A experiência completa de transformação com desconto especial de combo.',
      },
      {
        name: 'Pezinho & Acabamento Navalhado',
        duration: '20 min',
        price: 'R$ 25',
        description: 'Alinhamento rápido de contorno para manter o visual impecável no meio da semana.',
      },
      {
        name: 'Camuflagem de Grisalhos / Tonalização',
        duration: '30 min',
        price: 'R$ 60',
        description: 'Escurecimento sutil e natural dos fios brancos sem aspecto artificial.',
      },
    ];

    teamMembers = [
      {
        name: 'Rodrigo "Navalha" Santos',
        role: 'Mestre Barbeiro',
        specialty: 'Especialista em Degradê & Fade Americano',
        photo: galleryPhotos[0],
      },
      {
        name: 'Lucas Ferreira',
        role: 'Barbeiro Visagista',
        specialty: 'Alinhamento de Barba & Barboterapia',
        photo: galleryPhotos[1],
      },
      {
        name: 'Matheus Oliveira',
        role: 'Hair Stylist Masculino',
        specialty: 'Cortes Tesoura Clássicos & Texturizados',
        photo: galleryPhotos[2],
      },
    ];

    specialBadges = [
      '🍺 Chope gelado cortesia na chegada',
      '🎱 Mesa de sinuca & lounge relax',
      '❄️ Ambiente 100% climatizado',
      '🅿️ Vagas fáceis de estacionamento',
    ];
  } else if (cat === 'odontologia') {
    headline = 'O Sorriso dos Seus Sonhos com Tecnologia 3D e Zero Dor';
    subheadline = 'Clínica odontológica de alta precisão. Scanner intraoral digital sem massinha, implantes guiados e alinhadores invisíveis para recuperar sua total confiança.';
    ctaText = 'Agendar Avaliação sem Compromisso';
    badge = '🦷 Odontologia Digital • CRO-SP Responsável Ativo';

    faqItems = [
      {
        question: 'O procedimento de implante dentário dói?',
        answer: 'Absolutamente não. Utilizamos técnicas de anestesia local computadorizada e sedação leve para que todo o procedimento seja completamente indolor e seguro.',
      },
      {
        question: 'Como funciona o Scanner Intraoral 3D?',
        answer: 'Substituímos aquela massinha desconfortável por uma câmera 3D de alta definição que mapeia todos os seus dentes em minutos, gerando uma simulação digital instantânea do seu novo sorriso.',
      },
      {
        question: 'Quais as facilidades de pagamento?',
        answer: 'Oferecemos parcelamento facilitado em até 24x no cartão de crédito, boletos e condições especiais para tratamentos completos, além de nota para reembolso de convênio.',
      },
      {
        question: 'Em quanto tempo vejo os resultados do clareamento a laser?',
        answer: 'Na primeira sessão já é visível um clareamento de 3 a 5 tons, sem causar sensibilidade excessiva graças ao nosso gel dessensibilizante moderno.',
      },
    ];

    specialBadges = [
      '🔬 Scanner 3D intraoral sem moldagem',
      '🤍 Anestesia computadorizada indolor',
      '🛡️ Protocolo de biossegurança hospitalar',
      '💳 Parcelamento em até 24x',
    ];
  } else if (cat === 'estetica') {
    headline = 'Realce Sua Beleza Natural com Tratamentos Estéticos Avançados';
    subheadline = 'Harmonização facial delicada, protocolos corporais de alta performance e tecnologias médicas consagradas para o seu bem-estar e autoestima.';
    ctaText = 'Solicitar Consulta de Avaliação';
    badge = '✨ Estética Avançada & Cosmiatria';

    faqItems = [
      {
        question: 'A harmonização facial fica com aspecto artificial?',
        answer: 'Não. Nossa filosofia é a naturalidade: realizamos pequenas correções milimétricas respeitando as proporções únicas do seu rosto.',
      },
      {
        question: 'A depilação a laser dói?',
        answer: 'Nosso laser conta com ponteira resfriada a -5°C que protege a pele e reduz qualquer desconforto a um leve aquecimento suportável.',
      },
      {
        question: 'Quantas sessões de drenagem são indicadas?',
        answer: 'Na avaliação inicial montamos um protocolo personalizado de 5 a 10 sessões conforme seu objetivo (retenção de líquidos, pós-operatório ou remodelamento).',
      },
    ];

    specialBadges = [
      '🌟 Protocolos individuais sem padrão único',
      '❄️ Laser com resfriamento confortável',
      '🧖‍♀️ Sala VIP privativa e acolhedora',
    ];
  } else if (layoutType === 'fitness') {
    headline = 'Treine no Mais Alto Nível e Alcance o Físico que Sempre Quis';
    subheadline = 'Equipamentos importados de última geração, vestiários impecáveis e professores dedicados que montam seu treino e acompanham seu progresso de verdade.';
    ctaText = 'Garantir Passe Livre de 1 Dia Grátis';
    badge = '🔥 +1.200 Vidas Transformadas • Aberto 7 Dias por Semana';

    pricingPlans = [
      {
        name: 'Plano Start Flex',
        price: 'R$ 89',
        period: '/mês',
        features: [
          'Musculação completa sem limite de horário',
          'Vestiários com duchas quentes e armários',
          'Treino montado por aplicativo próprio',
          'Sem taxa de cancelamento abusiva',
        ],
      },
      {
        name: 'Plano VIP Black (Anual)',
        price: 'R$ 119',
        period: '/mês',
        features: [
          'Acesso total 7 dias por semana',
          'Todas as aulas coletivas (Spinning, Cross, Dança)',
          'Avaliação física por bioimpedância a cada 60 dias',
          'Cadeira de massagem pós-treino inclusa',
          'Acesso a 5 convites mensais para amigos',
        ],
        recommended: true,
      },
      {
        name: 'Plano Prime Sem Fidelidade',
        price: 'R$ 139',
        period: '/mês',
        features: [
          'Livre trânsito em todas as áreas e aulas',
          'Zero carência ou contrato de fidelidade',
          'Consultoria nutricional mensal inclusa',
          'Toalha de treino e armário exclusivo',
        ],
      },
    ];

    specialBadges = [
      '🏋️ +300m² de área com maquinário novo',
      '🚴 Sala de Spinning com som imersivo',
      '👥 Personal trainers de plantão na sala',
      '❄️ Climatização central constante',
    ];
  } else if (layoutType === 'automotive') {
    headline = 'Seu Veículo em Mãos Especializadas com Garantia e Honestidade';
    subheadline = 'Diagnóstico computadorizado de ponta, mecânicos certificados e transparência total: enviamos fotos e vídeos no seu WhatsApp antes de qualquer peça ser trocada.';
    ctaText = 'Pedir Orçamento Grátis no WhatsApp';
    badge = '🛡️ Garantia de 90 Dias ou 5.000 km em Peças e Mão de Obra';

    specialBadges = [
      '💻 Diagnóstico digital com scanner homologado',
      '🛡️ Garantia formal emitida em nota fiscal',
      '📷 Fotos e vídeos das peças enviados no WhatsApp',
      '💳 Parcelamento da revisão em até 10x sem juros',
    ];
  } else if (layoutType === 'pet_care') {
    headline = 'O Melhor Cuidado, Carinho e Saúde para o Seu Filho de 4 Patas';
    subheadline = 'Banho & tosa com cosméticos hipoalergênicos, toalhas esterilizadas individuais, consultas veterinárias carinhosas e o conforto do nosso Táxi Dog leva e traz.';
    ctaText = 'Agendar Banho / Consulta no WhatsApp';
    badge = '🐾 Pet Care com Amor • Ambiente sem Gaiolas de Estresse';

    faqItems = [
      {
        question: 'Os produtos usados no banho causam alergia?',
        answer: 'Utilizamos exclusivamente linhas veterinárias hipoalergênicas e dermatologicamente testadas, com água na temperatura ideal.',
      },
      {
        question: 'Como funciona o serviço de Táxi Dog?',
        answer: 'Buscamos e entregamos seu pet na sua residência em veículo climatizado com caixas de transporte higienizadas e seguras.',
      },
      {
        question: 'Os animais ficam presos em gaiolas?',
        answer: 'Não! Nosso espaço é livre de estresse, com cercadinhos amplos e área de recreação para que o pet se sinta seguro e tranquilo.',
      },
    ];

    specialBadges = [
      '🐶 Toalhas esterilizadas e lacradas individualmente',
      '🚕 Táxi Dog climatizado leva e traz',
      '🩺 Atendimento veterinário preventivo e emergencial',
      '❤️ Monitoramento carinhoso durante todo o processo',
    ];
  } else if (layoutType === 'real_estate') {
    headline = 'Os Imóveis Mais Exclusivos para Você Viver com Estilo e Conforto';
    subheadline = 'Assessoria imobiliária completa na compra, venda ou locação com segurança jurídica absoluta, fotos profissionais e discrição total.';
    ctaText = 'Falar com Consultor Exclusivo';
    badge = '🏡 Imóveis Selecionados & Alto Padrão';

    propertyItems = [
      {
        id: 'prop-1',
        title: 'Apartamento Alto Padrão com Varanda Gourmet',
        price: 'R$ 1.250.000',
        location: 'Bairro Nobre',
        specs: ['145 m²', '3 Suítes', '2 Vagas', 'Varanda com Churrasqueira'],
        image: galleryPhotos[0],
        badge: 'Oportunidade',
      },
      {
        id: 'prop-2',
        title: 'Casa Contemporânea em Condomínio Fechado',
        price: 'R$ 2.400.000',
        location: 'Condomínio Reserva',
        specs: ['320 m²', '4 Suítes', 'Piscina Aquecida', '4 Vagas'],
        image: galleryPhotos[1],
        badge: 'Destaque',
      },
      {
        id: 'prop-3',
        title: 'Studio Moderno Perfeito para Investimento',
        price: 'R$ 380.000',
        location: 'Centro / Universitário',
        specs: ['42 m²', '1 Dormitório', 'Totalmente Mobiliado', 'Alto Retorno Airbnb'],
        image: galleryPhotos[2],
        badge: 'Alta Rentabilidade',
      },
    ];
  }

  if (inspectedRef?.headings && inspectedRef.headings.length > 0 && !business.customHeadline) {
    headline = inspectedRef.headings[0];
  }
  if (inspectedRef?.description && !business.customSubheadline) {
    subheadline = inspectedRef.description;
  }

  const finalHeadline = business.customHeadline || headline;
  const finalSubheadline = business.customSubheadline || subheadline;
  const finalTagline = business.customSlogan || `Referência em ${business.category.toLowerCase()} na região`;

  const rawServicesList =
    business.customServices && business.customServices.length > 0
      ? business.customServices
      : business.services;

  const serviceItems = rawServicesList.map((svc, idx) => ({
    id: `svc-${idx + 1}`,
    title: svc,
    description: `Atendimento técnico minucioso realizado com insumos de primeira linha, pontualidade e foco absoluto na sua total satisfação e comodidade.`,
    price: layoutType === 'grooming_beauty' ? (idx === 0 ? 'R$ 55' : idx === 1 ? 'R$ 45' : undefined) : undefined,
  }));

  const rawDiffs =
    business.customDifferentials && business.customDifferentials.length > 0
      ? business.customDifferentials.map((d) => ({
          title: d.length > 30 ? d.slice(0, 30) + '...' : d,
          description: d,
        }))
      : [
          {
            title: 'Padrão Rigoroso de Qualidade',
            description: 'Equipamentos modernos e protocolos certificados garantem resultados duradouros e sem dores de cabeça.',
          },
          {
            title: 'Atendimento Próximo e Sem Esperas',
            description: 'Respeitamos seu tempo: trabalhamos com agenda precisa e equipe sempre pronta para te receber.',
          },
          {
            title: 'Facilidade Total pelo WhatsApp',
            description: 'Agende horários, tire dúvidas e solicite orçamentos diretamente com nossa equipe em poucos segundos.',
          },
        ];

  return {
    businessName: business.name,
    tagline: finalTagline,
    logoUrl: business.logoUrl,
    layoutType,
    cardapioItems,
    pricingPlans,
    faqItems,
    specialBadges,
    teamMembers,
    propertyItems,
    serviceTable,
    hero: {
      headline: finalHeadline,
      subheadline: finalSubheadline,
      ctaText,
      ctaWhatsapp: true,
      badge,
      backgroundImage: heroPhoto,
    },
    about: {
      title: `A História e o Compromisso da ${business.name}`,
      story:
        business.customAboutStory ||
        `Construída com base na confiança e no compromisso inabalável com a excelência, ${business.name} se consolidou como uma referência em ${business.category.toLowerCase()}. Combinamos experiência técnica comprovada, equipe atenciosa e uma infraestrutura moderna pensada para proporcionar a melhor experiência do primeiro contato ao pós-atendimento.`,
      highlights: [
        'Atendimento pontual com hora marcada e sem filas',
        'Profissionais experientes, atualizados e acolhedores',
        'Infraestrutura confortável e localização privilegiada',
      ],
      image: aboutPhoto,
    },
    services: {
      title: layoutType === 'gastronomy' ? 'Nosso Cardápio Selecionado' : 'Serviços & Especialidades',
      subtitle: `Conheça os principais serviços prestados por ${business.name}`,
      items: serviceItems,
    },
    differentials: {
      title: `Por que escolher ${business.name}?`,
      items: rawDiffs,
    },
    testimonials: {
      title: 'O que dizem os nossos clientes',
      items: [
        {
          author: 'Mariana Silva',
          role: 'Cliente Frequente',
          text: `Atendimento impecável do início ao fim! A equipe da ${business.name} foi super transparente e o resultado superou muito minhas expectativas. Recomendo para todos!`,
          rating: 5,
        },
        {
          author: 'Carlos Eduardo Ramos',
          role: 'Cliente Verificado',
          text: `Pontualidade rara hoje em dia e muita atenção aos detalhes. O ambiente é muito agradável e o serviço tem qualidade indiscutível.`,
          rating: 5,
        },
        {
          author: 'Patrícia Mendonça',
          role: 'Cliente',
          text: `Facilidade incrível de agendar pelo WhatsApp e atendimento muito cordial. Já virei cliente assídua!`,
          rating: 5,
        },
      ],
    },
    gallery: {
      title: 'Conheça nosso espaço e resultados',
      images: galleryPhotos.map((url, idx) => ({
        url,
        caption: `Ambiente e atendimento ${business.name} #${idx + 1}`,
      })),
    },
    location: {
      title: 'Localização & Contato',
      address: business.address,
      hours:
        business.openingHours && business.openingHours.length > 0
          ? business.openingHours
          : ['Segunda a Sexta: 08:30 às 19:00', 'Sábados: 09:00 às 15:00'],
      whatsapp: business.whatsapp || business.phone || '',
      phone: business.phone,
    },
    whatsappNumber: business.whatsapp || business.phone || '',
    instagramHandle: business.instagram,
  };
}

export function renderStandaloneHtml(
  content: LandingPageContent,
  style: LandingPageStyle,
  _business?: Business,
  reference?: SiteReferenceInput
): string {
  const cleanPhone = (content.whatsappNumber || '').replace(/\D/g, '');
  const waBase = cleanPhone.startsWith('55') ? cleanPhone : '55' + cleanPhone;
  const waLink = cleanPhone
    ? `https://wa.me/${waBase}?text=${encodeURIComponent(
        `Olá! Encontrei o site da ${content.businessName} e gostaria de mais informações.`
      )}`
    : '#contato';

  const radiusClass =
    style.buttonRadius === 'rounded-full'
      ? '9999px'
      : style.buttonRadius === 'rounded-xl'
      ? '16px'
      : style.buttonRadius === 'rounded-md'
      ? '8px'
      : '0px';

  const isDark = style.theme === 'dark';
  const bg = style.bgColor;
  const text = style.textColor;
  const primary = style.logoPalette?.primary || style.primaryColor;
  const accent = style.logoPalette?.accent || style.accentColor;
  const cardBg = isDark ? '#14161f' : '#ffffff';
  const cardBorder = isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0';
  const subtleText = isDark ? '#94a3b8' : '#64748b';
  const layout = content.layoutType || 'modern_business';
  const effectiveLogo = content.logoUrl || _business?.logoUrl;

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${content.businessName} | ${content.tagline}</title>
  <meta name="description" content="${content.hero.subheadline}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800&family=Cinzel:wght@600;700;800&family=Inter:wght@400;500;600;700;800&family=Montserrat:wght@400;500;600;700&family=Oswald:wght@500;600;700&family=Outfit:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,600;0,700;1,400&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    :root {
      --primary: ${primary};
      --accent: ${accent};
      --bg: ${bg};
      --text: ${text};
      --card-bg: ${cardBg};
      --card-border: ${cardBorder};
      --subtle: ${subtleText};
      --radius: ${radiusClass};
      --font-heading: ${style.fontHeading};
      --font-body: ${style.fontBody};
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html { scroll-behavior: smooth; font-family: var(--font-body); }
    body { background-color: var(--bg); color: var(--text); line-height: 1.6; }
    h1, h2, h3, h4, .brand-font { font-family: var(--font-heading); font-weight: 700; line-height: 1.15; }
    a { color: inherit; text-decoration: none; }
    
    .container { max-width: 1200px; margin: 0 auto; padding: 0 24px; }
    
    /* Buttons */
    .btn {
      display: inline-flex; align-items: center; justify-content: center; gap: 8px;
      padding: 14px 28px; font-weight: 700; border-radius: var(--radius);
      background-color: var(--primary); color: #ffffff; cursor: pointer;
      transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1); border: none; font-size: 15px;
      text-shadow: 0 1px 2px rgba(0,0,0,0.15); box-shadow: 0 4px 14px rgba(0,0,0,0.12);
    }
    .btn:hover { filter: brightness(1.12); transform: translateY(-2px); box-shadow: 0 10px 25px -4px rgba(0,0,0,0.3); }
    .btn-accent { background-color: var(--accent); }
    .btn-outline {
      background: transparent; border: 1.5px solid var(--card-border); color: var(--text);
      box-shadow: none;
    }
    .btn-outline:hover { background: ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'}; }
    
    /* Navbar */
    .navbar {
      position: sticky; top: 0; z-index: 1000;
      background: ${isDark ? 'rgba(12, 14, 20, 0.88)' : 'rgba(255, 255, 255, 0.92)'};
      backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
      border-bottom: 1px solid var(--card-border); padding: 16px 0;
    }
    .nav-wrapper { display: flex; align-items: center; justify-content: space-between; }
    .nav-logo { font-size: 22px; font-weight: 800; letter-spacing: -0.5px; display: flex; align-items: center; gap: 12px; }
    .nav-logo-img { max-height: 44px; max-width: 150px; width: auto; height: auto; object-fit: contain; border-radius: 6px; }
    .nav-links { display: flex; gap: 26px; align-items: center; }
    .nav-links a { font-size: 14px; font-weight: 500; color: var(--subtle); transition: color 0.2s; }
    .nav-links a:hover { color: var(--text); }
    
    /* Trust Pills & Badges */
    .badge {
      display: inline-flex; align-items: center; gap: 6px; padding: 6px 14px; border-radius: 9999px;
      background: ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)'};
      border: 1px solid var(--card-border);
      color: var(--primary); font-size: 12px; font-weight: 700;
      text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 20px;
    }
    
    /* Hero */
    .hero {
      position: relative; padding: 110px 0 90px; overflow: hidden;
      display: flex; align-items: center; min-height: 82vh;
    }
    .hero-bg {
      position: absolute; inset: 0; z-index: -1;
      background-image: linear-gradient(${isDark ? 'rgba(10,12,18,0.86), rgba(10,12,18,0.96)' : 'rgba(255,255,255,0.90), rgba(255,255,255,0.98)'}), url('${content.hero.backgroundImage}');
      background-size: cover; background-position: center;
    }
    .hero-title { font-size: clamp(34px, 5.2vw, 62px); margin-bottom: 20px; letter-spacing: -1.2px; max-width: 900px; }
    .hero-desc { font-size: clamp(16px, 1.8vw, 20px); color: var(--subtle); max-width: 700px; margin-bottom: 34px; line-height: 1.6; }
    
    /* Floating Review Badge */
    .review-pill {
      display: inline-flex; align-items: center; gap: 8px;
      background: ${isDark ? 'rgba(24, 27, 38, 0.9)' : 'rgba(255, 255, 255, 0.95)'};
      border: 1px solid var(--card-border); padding: 8px 16px; border-radius: 9999px;
      font-size: 13px; font-weight: 600; box-shadow: 0 4px 20px rgba(0,0,0,0.08);
      margin-bottom: 24px;
    }
    .stars { color: #f59e0b; letter-spacing: 1px; }

    /* Trust Strip */
    .trust-strip {
      background: ${isDark ? 'rgba(20,23,34,0.6)' : '#f8fafc'};
      border-top: 1px solid var(--card-border); border-bottom: 1px solid var(--card-border);
      padding: 22px 0;
    }
    .trust-grid { display: flex; flex-wrap: wrap; justify-content: space-around; gap: 20px; text-align: center; }
    .trust-item { font-size: 14px; font-weight: 600; display: flex; align-items: center; gap: 8px; color: var(--text); }
    
    /* Section Shared */
    .section { padding: 90px 0; }
    .section-header { text-align: center; max-width: 720px; margin: 0 auto 52px; }
    .section-title { font-size: clamp(28px, 3.8vw, 44px); margin-bottom: 16px; letter-spacing: -0.8px; }
    .section-subtitle { font-size: 16px; color: var(--subtle); line-height: 1.6; }
    
    .grid-services { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px; }
    .service-card {
      background: var(--card-bg); border: 1px solid var(--card-border);
      border-radius: var(--radius); padding: 32px; transition: transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease;
      display: flex; flex-direction: column; justify-content: space-between;
    }
    .service-card:hover { transform: translateY(-4px); border-color: var(--primary); box-shadow: 0 12px 30px rgba(0,0,0,0.12); }
    .service-card h3 { font-size: 20px; margin-bottom: 12px; }
    .service-card p { color: var(--subtle); font-size: 14px; line-height: 1.6; margin-bottom: 18px; }
    .service-price { font-size: 20px; font-weight: 800; color: var(--accent); }
    
    /* About */
    .about-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 56px; align-items: center; }
    .about-img { width: 100%; height: 440px; object-fit: cover; border-radius: var(--radius); border: 1px solid var(--card-border); }
    .highlights-list { list-style: none; margin-top: 24px; display: flex; flex-direction: column; gap: 14px; }
    .highlights-list li { display: flex; align-items: center; gap: 12px; font-weight: 600; font-size: 15px; }
    .highlights-list li::before {
      content: "✓"; display: inline-flex; align-items: center; justify-content: center;
      width: 22px; height: 22px; border-radius: 50%; background: var(--primary);
      color: #fff; font-size: 12px; font-weight: 900; flex-shrink: 0;
    }
    
    /* Differentials */
    .differentials-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 24px; }
    .diff-card {
      padding: 30px; background: var(--card-bg); border: 1px solid var(--card-border);
      border-radius: var(--radius);
    }
    .diff-card h4 { font-size: 18px; margin-bottom: 10px; color: var(--primary); }
    .diff-card p { font-size: 14px; color: var(--subtle); line-height: 1.6; }
    
    /* Testimonials */
    .testimonials-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 24px; }
    .testi-card {
      background: var(--card-bg); border: 1px solid var(--card-border);
      border-radius: var(--radius); padding: 30px; display: flex; flex-direction: column; justify-content: space-between;
    }
    .testi-stars { color: #f59e0b; margin-bottom: 12px; font-size: 17px; }
    .testi-quote { font-style: italic; margin-bottom: 18px; color: var(--text); font-size: 15px; line-height: 1.6; }
    .testi-author { font-weight: 700; font-size: 15px; }
    .testi-role { font-size: 12px; color: var(--subtle); }
    
    /* Barbershop Table */
    .service-table { width: 100%; border-collapse: collapse; }
    .table-row {
      display: flex; align-items: baseline; justify-content: space-between;
      padding: 16px 0; border-bottom: 1px dashed var(--card-border);
    }
    .table-name { font-size: 16px; font-weight: 700; }
    .table-desc { font-size: 13px; color: var(--subtle); margin-top: 4px; }
    .table-price { font-size: 18px; font-weight: 800; color: var(--primary); white-space: nowrap; margin-left: 20px; }
    
    /* Accordion FAQ */
    .faq-accordion { max-width: 860px; margin: 0 auto; display: flex; flex-direction: column; gap: 16px; }
    .faq-accordion-item {
      background: var(--card-bg); border: 1px solid var(--card-border);
      border-radius: var(--radius); overflow: hidden; transition: border-color 0.2s;
    }
    .faq-question {
      padding: 20px 24px; font-size: 16px; font-weight: 700; cursor: pointer;
      display: flex; justify-content: space-between; align-items: center; user-select: none;
    }
    .faq-question:hover { color: var(--primary); }
    .faq-icon { transition: transform 0.25s ease; font-size: 18px; }
    .faq-answer {
      display: none; padding: 0 24px 20px; font-size: 14px; color: var(--subtle); line-height: 1.6;
    }
    .faq-accordion-item.active .faq-answer { display: block; }
    .faq-accordion-item.active .faq-icon { transform: rotate(45deg); color: var(--primary); }
    
    /* Location & Hours */
    .location-box {
      background: var(--card-bg); border: 1px solid var(--card-border);
      border-radius: var(--radius); padding: 40px; display: grid; grid-template-columns: 1fr 1fr; gap: 40px;
    }
    .info-label { font-size: 11px; text-transform: uppercase; letter-spacing: 1.2px; color: var(--subtle); margin-bottom: 8px; font-weight: 700; }
    .info-val { font-size: 16px; font-weight: 600; margin-bottom: 20px; }
    
    /* Sticky Mobile Conversion Bar */
    .sticky-mobile-bar {
      display: none; position: fixed; bottom: 0; left: 0; right: 0; z-index: 99999;
      background: ${isDark ? 'rgba(12, 14, 20, 0.95)' : 'rgba(255, 255, 255, 0.96)'};
      backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
      border-top: 1px solid var(--card-border); padding: 12px 20px;
      box-shadow: 0 -8px 30px rgba(0,0,0,0.2);
      align-items: center; justify-content: space-between; gap: 12px;
    }
    .pulse-indicator {
      display: inline-block; width: 8px; height: 8px; border-radius: 50%;
      background: #10b981; box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
      animation: pulse 1.8s infinite;
    }
    @keyframes pulse {
      0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
      70% { box-shadow: 0 0 0 8px rgba(16, 185, 129, 0); }
      100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
    }
    
    /* Floating Desktop WhatsApp */
    .wa-float {
      position: fixed; bottom: 30px; right: 30px; z-index: 900;
      background: #25d366; color: white; width: 60px; height: 60px;
      border-radius: 50%; display: flex; align-items: center; justify-content: center;
      box-shadow: 0 10px 25px rgba(37, 211, 102, 0.45); font-size: 28px;
      transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .wa-float:hover { transform: scale(1.12); filter: brightness(1.05); }
    
    /* Footer */
    footer {
      border-top: 1px solid var(--card-border); padding: 48px 0; text-align: center;
      color: var(--subtle); font-size: 13px;
    }
    
    @media (max-width: 768px) {
      .nav-links { display: none; }
      .about-grid { grid-template-columns: 1fr; }
      .location-box { grid-template-columns: 1fr; padding: 24px; }
      .hero { padding: 85px 0 65px; min-height: 70vh; }
      .wa-float { display: none; }
      .sticky-mobile-bar { display: flex; }
      body { padding-bottom: 74px; }
    }
  </style>
</head>
<body>

  <!-- Reference Banner -->
  ${
    reference && (reference.url || reference.image)
      ? `
      <div style="background: rgba(37,99,235,0.12); border-bottom: 1px solid rgba(37,99,235,0.25); text-align: center; padding: 8px 16px; font-size: 12px; color: #93c5fd; font-weight: 600;">
        ✨ Modelo personalizado com inspiração visual em: <strong>${reference.mode === 'url' ? reference.url : 'Referência fornecida'}</strong>
      </div>
      `
      : ''
  }

  <!-- Sticky Mobile Bottom Bar -->
  <div class="sticky-mobile-bar">
    <div style="display: flex; align-items: center; gap: 10px;">
      ${
        effectiveLogo
          ? `<img src="${effectiveLogo}" alt="${content.businessName}" style="width: 32px; height: 32px; border-radius: 6px; object-fit: contain; background: ${isDark ? 'rgba(255,255,255,0.08)' : '#f1f5f9'}; padding: 2px; border: 1px solid var(--card-border);">`
          : '<span class="pulse-indicator"></span>'
      }
      <div>
        <div style="font-size: 11px; font-weight: 700; color: #10b981; text-transform: uppercase;">Aberto Agora</div>
        <div style="font-size: 13px; font-weight: 700; max-width: 140px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${content.businessName}</div>
      </div>
    </div>
    <a href="${waLink}" target="_blank" rel="noopener noreferrer" class="btn" style="padding: 10px 18px; font-size: 13px; background: #25d366; color: white;">
      💬 ${layout === 'gastronomy' ? 'Pedir no WhatsApp' : 'Falar no WhatsApp'}
    </a>
  </div>

  <!-- Desktop Floating WhatsApp -->
  <a href="${waLink}" target="_blank" rel="noopener noreferrer" class="wa-float" title="Falar no WhatsApp">
    💬
  </a>

  <!-- Header -->
  <header class="navbar">
    <div class="container nav-wrapper">
      <div class="nav-logo brand-font">
        ${effectiveLogo ? `<img src="${effectiveLogo}" alt="${content.businessName}" class="nav-logo-img">` : ''}
        <span>${content.businessName}</span>
      </div>
      <nav class="nav-links">
        ${layout === 'gastronomy' ? '<a href="#cardapio">Cardápio</a>' : ''}
        ${layout === 'grooming_beauty' ? '<a href="#tabela">Serviços & Preços</a>' : ''}
        ${layout === 'fitness' ? '<a href="#planos">Planos</a>' : ''}
        ${layout === 'real_estate' ? '<a href="#imoveis">Imóveis</a>' : ''}
        ${content.faqItems ? '<a href="#faq">Dúvidas</a>' : ''}
        <a href="#sobre">Sobre</a>
        <a href="#servicos">${layout === 'gastronomy' ? 'Especialidades' : 'Serviços'}</a>
        <a href="#depoimentos">Avaliações</a>
        <a href="#contato">Localização</a>
        <a href="${waLink}" target="_blank" rel="noopener noreferrer" class="btn" style="padding: 9px 20px; font-size: 13px;">
          ${layout === 'gastronomy' ? 'Cardápio / WhatsApp' : 'Agendar no WhatsApp'}
        </a>
      </nav>
    </div>
  </header>

  <!-- Hero Section -->
  <section class="hero">
    <div class="hero-bg"></div>
    <div class="container">
      <div class="review-pill">
        <span class="stars">★★★★★</span>
        <span>4.9 / 5.0 • Referência em Qualidade</span>
      </div>
      <br>
      <div class="badge">${content.hero.badge || 'Atendimento de Excelência'}</div>
      <h1 class="hero-title">${content.hero.headline}</h1>
      <p class="hero-desc">${content.hero.subheadline}</p>

      <div style="display: flex; gap: 14px; flex-wrap: wrap; margin-top: 10px;">
        <a href="${waLink}" target="_blank" rel="noopener noreferrer" class="btn">
          ${content.hero.ctaText} →
        </a>
        <a href="${layout === 'gastronomy' ? '#cardapio' : layout === 'grooming_beauty' ? '#tabela' : layout === 'fitness' ? '#planos' : '#servicos'}" class="btn btn-outline">
          ${layout === 'gastronomy' ? 'Ver Cardápio Completo' : layout === 'grooming_beauty' ? 'Ver Tabela de Cortes' : layout === 'fitness' ? 'Conhecer os Planos' : 'Conhecer Serviços'}
        </a>
      </div>
    </div>
  </section>

  <!-- Trust Strip Badges -->
  ${
    content.specialBadges && content.specialBadges.length > 0
      ? `
      <section class="trust-strip">
        <div class="container">
          <div class="trust-grid">
            ${content.specialBadges.map((b) => `<div class="trust-item"><span>✨</span> ${b}</div>`).join('')}
          </div>
        </div>
      </section>
      `
      : ''
  }

  <!-- SPECIALIZED SECTION: GASTRONOMY MENU HIGHLIGHTS -->
  ${
    layout === 'gastronomy' && content.cardapioItems && content.cardapioItems.length > 0
      ? `
      <section id="cardapio" class="section">
        <div class="container">
          <div class="section-header">
            <div class="badge">Cardápio & Delivery</div>
            <h2 class="section-title">Nossas Criações Mais Pedidas</h2>
            <p class="section-subtitle">Ingredientes frescos, preparo artesanal e entrega rápida e segura direto na sua porta</p>
          </div>
          <div class="grid-services">
            ${content.cardapioItems
              .map(
                (item) => `
              <div class="service-card" style="padding: 0; overflow: hidden; display: flex; flex-direction: column;">
                ${item.image ? `<img src="${item.image}" alt="${item.name}" style="width: 100%; height: 210px; object-fit: cover;">` : ''}
                <div style="padding: 24px; flex: 1; display: flex; flex-direction: column; justify-content: space-between;">
                  <div>
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                      <h3 style="font-size: 19px; margin: 0;">${item.name}</h3>
                      ${item.badge ? `<span style="font-size: 10px; font-weight: 800; background: var(--primary); color: white; padding: 3px 10px; border-radius: 9999px;">${item.badge}</span>` : ''}
                    </div>
                    <p style="font-size: 14px; color: var(--subtle); margin-bottom: 18px; line-height: 1.5;">${item.description}</p>
                  </div>
                  <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 16px; border-top: 1px solid var(--card-border);">
                    <span class="service-price">${item.price}</span>
                    <a href="https://wa.me/${waBase}?text=${encodeURIComponent(`Olá! Gostaria de pedir: ${item.name} da ${content.businessName}`)}" target="_blank" class="btn" style="padding: 9px 16px; font-size: 13px;">
                      Pedir este →
                    </a>
                  </div>
                </div>
              </div>
            `
              )
              .join('')}
          </div>
        </div>
      </section>

      <!-- 3-Step Delivery Steps -->
      <section style="background: ${isDark ? '#0e111a' : '#f8fafc'}; padding: 50px 0; border-top: 1px solid var(--card-border); border-bottom: 1px solid var(--card-border);">
        <div class="container">
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 24px; text-align: center;">
            <div style="padding: 24px; background: var(--card-bg); border: 1px solid var(--card-border); border-radius: var(--radius);">
              <div style="font-size: 32px; margin-bottom: 10px;">📋</div>
              <h4 style="font-size: 16px; margin-bottom: 6px;">1. Escolha seus itens</h4>
              <p style="font-size: 13px; color: var(--subtle);">Consulte nosso cardápio e selecione seus sabores favoritos.</p>
            </div>
            <div style="padding: 24px; background: var(--card-bg); border: 1px solid var(--card-border); border-radius: var(--radius);">
              <div style="font-size: 32px; margin-bottom: 10px;">💬</div>
              <h4 style="font-size: 16px; margin-bottom: 6px;">2. Envie no WhatsApp</h4>
              <p style="font-size: 13px; color: var(--subtle);">Atendimento direto e sem taxas escondidas de aplicativos.</p>
            </div>
            <div style="padding: 24px; background: var(--card-bg); border: 1px solid var(--card-border); border-radius: var(--radius);">
              <div style="font-size: 32px; margin-bottom: 10px;">🛵</div>
              <h4 style="font-size: 16px; margin-bottom: 6px;">3. Receba Quentinho</h4>
              <p style="font-size: 13px; color: var(--subtle);">Embalagem térmica lacrada com entrega rápida na sua casa.</p>
            </div>
          </div>
        </div>
      </section>
      `
      : ''
  }

  <!-- SPECIALIZED SECTION: BARBERSHOP SERVICE & PRICE TABLE -->
  ${
    layout === 'grooming_beauty' && content.serviceTable && content.serviceTable.length > 0
      ? `
      <section id="tabela" class="section">
        <div class="container">
          <div class="section-header">
            <div class="badge">Menu de Cortes & Cuidados</div>
            <h2 class="section-title">Serviços com Padrão de Barba & Tesoura</h2>
            <p class="section-subtitle">Escolha seu procedimento e agende seu horário com nossos mestres barbeiros</p>
          </div>
          <div style="max-width: 820px; margin: 0 auto; background: var(--card-bg); border: 1px solid var(--card-border); border-radius: var(--radius); padding: 32px;">
            ${content.serviceTable
              .map(
                (item) => `
              <div class="table-row">
                <div style="flex: 1;">
                  <div class="table-name">${item.name} <span style="font-size: 12px; font-weight: normal; color: var(--subtle);">(${item.duration})</span></div>
                  ${item.description ? `<div class="table-desc">${item.description}</div>` : ''}
                </div>
                <div class="table-price">${item.price}</div>
              </div>
            `
              )
              .join('')}
            <div style="text-align: center; margin-top: 28px;">
              <a href="${waLink}" target="_blank" class="btn">
                Agendar Horário com Hora Marcada →
              </a>
            </div>
          </div>
        </div>
      </section>
      `
      : ''
  }

  <!-- SPECIALIZED SECTION: BARBER TEAM -->
  ${
    layout === 'grooming_beauty' && content.teamMembers && content.teamMembers.length > 0
      ? `
      <section class="section" style="background: ${isDark ? '#0e111a' : '#f8fafc'};">
        <div class="container">
          <div class="section-header">
            <div class="badge">Nossos Especialistas</div>
            <h2 class="section-title">Os Barbeiros da Casa</h2>
            <p class="section-subtitle">Profissionais altamente treinados em técnicas clássicas e tendências internacionais</p>
          </div>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 24px;">
            ${content.teamMembers
              .map(
                (member) => `
              <div style="background: var(--card-bg); border: 1px solid var(--card-border); border-radius: var(--radius); overflow: hidden; text-align: center;">
                ${member.photo ? `<img src="${member.photo}" alt="${member.name}" style="width: 100%; height: 260px; object-fit: cover;">` : ''}
                <div style="padding: 24px;">
                  <h3 style="font-size: 18px; margin-bottom: 4px;">${member.name}</h3>
                  <div style="font-size: 13px; font-weight: 700; color: var(--primary); margin-bottom: 8px;">${member.role}</div>
                  <p style="font-size: 13px; color: var(--subtle);">${member.specialty}</p>
                </div>
              </div>
            `
              )
              .join('')}
          </div>
        </div>
      </section>
      `
      : ''
  }

  <!-- SPECIALIZED SECTION: FITNESS PRICING PLANS -->
  ${
    layout === 'fitness' && content.pricingPlans && content.pricingPlans.length > 0
      ? `
      <section id="planos" class="section">
        <div class="container">
          <div class="section-header">
            <div class="badge">Planos Transparentes</div>
            <h2 class="section-title">Escolha o Melhor Plano para Sua Evolução</h2>
            <p class="section-subtitle">Sem pegadinhas, sem taxas abusivas e com estrutura de primeiro mundo</p>
          </div>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(290px, 1fr)); gap: 28px; align-items: stretch;">
            ${content.pricingPlans
              .map(
                (p) => `
              <div class="service-card" style="display: flex; flex-direction: column; justify-content: space-between; position: relative; ${p.recommended ? 'border-color: var(--primary); box-shadow: 0 12px 35px rgba(220,38,38,0.2);' : ''}">
                ${p.recommended ? `<div style="position: absolute; top: -14px; right: 24px; background: var(--primary); color: white; padding: 4px 14px; border-radius: 9999px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">⭐ Mais Escolhido</div>` : ''}
                <div>
                  <h3 style="font-size: 22px; margin-bottom: 6px;">${p.name}</h3>
                  <div style="font-size: 36px; font-weight: 800; color: var(--primary); margin-bottom: 24px;">
                    ${p.price}<span style="font-size: 15px; color: var(--subtle); font-weight: 400;">${p.period}</span>
                  </div>
                  <ul style="list-style: none; display: flex; flex-direction: column; gap: 12px; margin-bottom: 30px;">
                    ${p.features.map((f) => `<li style="display: flex; align-items: center; gap: 10px; font-size: 14px;"><span style="color: var(--primary); font-weight: 800;">✓</span> ${f}</li>`).join('')}
                  </ul>
                </div>
                <a href="https://wa.me/${waBase}?text=${encodeURIComponent(`Olá! Quero me matricular no ${p.name} da ${content.businessName}`)}" target="_blank" class="btn" style="width: 100%; text-align: center;">
                  Matricular no WhatsApp →
                </a>
              </div>
            `
              )
              .join('')}
          </div>
        </div>
      </section>
      `
      : ''
  }

  <!-- SPECIALIZED SECTION: AUTOMOTIVE EMERGENCY SOS -->
  ${
    layout === 'automotive'
      ? `
      <section style="background: ${isDark ? '#1a1412' : '#fff7ed'}; border-top: 2px solid #f97316; border-bottom: 2px solid #f97316; padding: 36px 0;">
        <div class="container" style="display: flex; flex-direction: column; align-items: center; justify-content: space-between; gap: 20px; text-align: center;">
          <div>
            <div style="display: inline-block; font-size: 12px; font-weight: 800; color: #ea580c; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px;">🚨 Suporte Mecânico Rápido</div>
            <h3 style="font-size: 22px; font-weight: 800; margin-bottom: 6px;">Seu carro apresentou algum barulho, luz no painel ou pane?</h3>
            <p style="color: var(--subtle); font-size: 15px; max-width: 600px;">Fale diretamente com nosso mecânico responsável para diagnóstico prévio e agendamento de socorro.</p>
          </div>
          <a href="${waLink}" target="_blank" class="btn" style="background: #ea580c; color: white; white-space: nowrap; font-weight: 700;">
            Chamar Suporte Mecânico no WhatsApp
          </a>
        </div>
      </section>
      `
      : ''
  }

  <!-- SPECIALIZED SECTION: REAL ESTATE PROPERTIES -->
  ${
    layout === 'real_estate' && content.propertyItems && content.propertyItems.length > 0
      ? `
      <section id="imoveis" class="section">
        <div class="container">
          <div class="section-header">
            <div class="badge">Carteira Selecionada</div>
            <h2 class="section-title">Imóveis em Destaque</h2>
            <p class="section-subtitle">Opções selecionadas com alto padrão construtivo e excelente localização</p>
          </div>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 28px;">
            ${content.propertyItems
              .map(
                (prop) => `
              <div style="background: var(--card-bg); border: 1px solid var(--card-border); border-radius: var(--radius); overflow: hidden; display: flex; flex-direction: column;">
                <div style="position: relative;">
                  <img src="${prop.image}" alt="${prop.title}" style="width: 100%; height: 230px; object-fit: cover;">
                  ${prop.badge ? `<span style="position: absolute; top: 14px; left: 14px; background: var(--primary); color: white; padding: 4px 12px; border-radius: 9999px; font-size: 11px; font-weight: 700;">${prop.badge}</span>` : ''}
                </div>
                <div style="padding: 24px; flex: 1; display: flex; flex-direction: column; justify-content: space-between;">
                  <div>
                    <div style="font-size: 12px; font-weight: 700; color: var(--subtle); text-transform: uppercase; margin-bottom: 6px;">📍 ${prop.location}</div>
                    <h3 style="font-size: 19px; margin-bottom: 12px;">${prop.title}</h3>
                    <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 20px;">
                      ${prop.specs.map((s) => `<span style="font-size: 12px; background: ${isDark ? 'rgba(255,255,255,0.06)' : '#f1f5f9'}; padding: 4px 10px; border-radius: 6px; font-weight: 600;">${s}</span>`).join('')}
                    </div>
                  </div>
                  <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 16px; border-top: 1px solid var(--card-border);">
                    <div style="font-size: 22px; font-weight: 800; color: var(--primary);">${prop.price}</div>
                    <a href="https://wa.me/${waBase}?text=${encodeURIComponent(`Olá! Gostaria de detalhes sobre o imóvel: ${prop.title}`)}" target="_blank" class="btn" style="padding: 9px 16px; font-size: 13px;">
                      Agendar Visita →
                    </a>
                  </div>
                </div>
              </div>
            `
              )
              .join('')}
          </div>
        </div>
      </section>
      `
      : ''
  }

  <!-- About Section -->
  <section id="sobre" class="section" style="background: ${isDark ? '#0c0e14' : '#f8fafc'};">
    <div class="container">
      <div class="about-grid">
        <div>
          <div class="badge">Nossa Trajetória</div>
          <h2 class="section-title">${content.about.title}</h2>
          <p style="font-size: 16px; color: var(--subtle); margin-bottom: 24px; line-height: 1.7;">
            ${content.about.story}
          </p>
          <ul class="highlights-list">
            ${content.about.highlights.map((h) => `<li>${h}</li>`).join('')}
          </ul>
        </div>
        <div>
          <img src="${content.about.image}" alt="${content.businessName}" class="about-img">
        </div>
      </div>
    </div>
  </section>

  <!-- Services Section -->
  <section id="servicos" class="section">
    <div class="container">
      <div class="section-header">
        <div class="badge">Especialidades</div>
        <h2 class="section-title">${content.services.title}</h2>
        <p class="section-subtitle">${content.services.subtitle}</p>
      </div>
      <div class="grid-services">
        ${content.services.items
          .map(
            (item) => `
          <div class="service-card">
            <div>
              <h3>${item.title}</h3>
              <p>${item.description}</p>
            </div>
            <div>
              ${item.price ? `<div class="service-price" style="margin-bottom: 14px;">${item.price}</div>` : ''}
              <a href="${waLink}" target="_blank" style="display: inline-flex; align-items: center; gap: 6px; font-weight: 700; font-size: 14px; color: var(--primary);">
                Solicitar este serviço →
              </a>
            </div>
          </div>
        `
          )
          .join('')}
      </div>
    </div>
  </section>

  <!-- SPECIALIZED SECTION: INTERACTIVE ACCORDION FAQ -->
  ${
    content.faqItems && content.faqItems.length > 0
      ? `
      <section id="faq" class="section" style="background: ${isDark ? '#0c0e14' : '#f8fafc'};">
        <div class="container">
          <div class="section-header">
            <div class="badge">Dúvidas Frequentes</div>
            <h2 class="section-title">Perguntas Comuns dos Nossos Clientes</h2>
            <p class="section-subtitle">Transparência total e clareza antes de qualquer procedimento ou contratação</p>
          </div>
          <div class="faq-accordion">
            ${content.faqItems
              .map(
                (f, idx) => `
              <div class="faq-accordion-item ${idx === 0 ? 'active' : ''}">
                <div class="faq-question">
                  <span>${f.question}</span>
                  <span class="faq-icon">+</span>
                </div>
                <div class="faq-answer">
                  ${f.answer}
                </div>
              </div>
            `
              )
              .join('')}
          </div>
        </div>
      </section>
      `
      : ''
  }

  <!-- Differentials Section -->
  <section id="diferenciais" class="section">
    <div class="container">
      <div class="section-header">
        <div class="badge">Nossos Diferenciais</div>
        <h2 class="section-title">${content.differentials.title}</h2>
      </div>
      <div class="differentials-grid">
        ${content.differentials.items
          .map(
            (diff) => `
          <div class="diff-card">
            <h4>${diff.title}</h4>
            <p>${diff.description}</p>
          </div>
        `
          )
          .join('')}
      </div>
    </div>
  </section>

  <!-- Testimonials Section -->
  <section id="depoimentos" class="section" style="background: ${isDark ? '#0c0e14' : '#f8fafc'};">
    <div class="container">
      <div class="section-header">
        <div class="badge">Depoimentos Reais</div>
        <h2 class="section-title">${content.testimonials.title}</h2>
      </div>
      <div class="testimonials-grid">
        ${content.testimonials.items
          .map(
            (t) => `
          <div class="testi-card">
            <div>
              <div class="testi-stars">${'★'.repeat(t.rating)}</div>
              <p class="testi-quote">"${t.text}"</p>
            </div>
            <div>
              <div class="testi-author">${t.author}</div>
              <div class="testi-role">${t.role || 'Cliente'}</div>
            </div>
          </div>
        `
          )
          .join('')}
      </div>
    </div>
  </section>

  <!-- Location & Hours Section -->
  <section id="contato" class="section">
    <div class="container">
      <div class="section-header">
        <div class="badge">Venha nos Conhecer</div>
        <h2 class="section-title">${content.location.title}</h2>
      </div>
      <div class="location-box">
        <div>
          <div class="info-label">Endereço Completo</div>
          <div class="info-val">${content.location.address}</div>

          <div class="info-label">Horários de Atendimento</div>
          <div class="info-val" style="font-size: 14px; font-weight: normal; line-height: 1.8;">
            ${content.location.hours.map((h) => `<div>${h}</div>`).join('')}
          </div>
        </div>
        <div>
          <div class="info-label">Atendimento Direto</div>
          <div class="info-val">${content.location.whatsapp || content.location.phone || 'Atendimento via WhatsApp'}</div>

          <div style="margin-top: 24px;">
            <a href="${waLink}" target="_blank" rel="noopener noreferrer" class="btn" style="width: 100%;">
              Conversar no WhatsApp Agora →
            </a>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Footer -->
  <footer>
    <div class="container">
      ${
        effectiveLogo
          ? `<div style="margin-bottom: 16px;"><img src="${effectiveLogo}" alt="${content.businessName}" style="max-height: 42px; max-width: 160px; object-fit: contain;"></div>`
          : ''
      }
      <div style="font-weight: 800; font-size: 16px; margin-bottom: 8px;">${content.businessName}</div>
      <p style="margin-bottom: 12px; color: var(--subtle);">${content.location.address}</p>
      <p>© ${new Date().getFullYear()} ${content.businessName}. Todos os direitos reservados.</p>
    </div>
  </footer>

  <!-- Vanilla JS for Micro-Interactions -->
  <script>
    // Accordion FAQ Interactivity
    document.querySelectorAll('.faq-accordion-item').forEach(function(item) {
      var question = item.querySelector('.faq-question');
      if (question) {
        question.addEventListener('click', function() {
          var isActive = item.classList.contains('active');
          document.querySelectorAll('.faq-accordion-item').forEach(function(other) {
            other.classList.remove('active');
          });
          if (!isActive) {
            item.classList.add('active');
          }
        });
      }
    });
  </script>

</body>
</html>`;
}
