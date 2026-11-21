import {
  Business,
  LandingPageContent,
  LandingPageProject,
  LandingPageStyle,
  SiteReferenceInput,
  CardapioItem,
  PricingPlan,
  FaqItem,
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
  const galleryPhotos = userPhotos.length >= 3 ? userPhotos : stock.gallery;

  return { heroPhoto, aboutPhoto, galleryPhotos };
}

// Safely inspect a reference website URL to extract title, description & section headers
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
  // Determine style
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
      : 'modern-minimalist');

  const style = styleOverride || STYLE_PRESETS[defaultStyleId] || STYLE_PRESETS['modern-minimalist'];

  // Inspect reference if URL mode
  let inspectedRef: { title?: string; description?: string; headings?: string[] } | null = null;
  if (reference?.mode === 'url' && reference.url) {
    inspectedRef = await inspectReferenceUrl(reference.url);
  }

  // Generate content using Gemini if key exists, otherwise use high-caliber semantic engine
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
Você é um Copywriter e Diretor de Arte especialista em Landing Pages de Alta Conversão para negócios locais no Brasil.
Crie o conteúdo completo para uma landing page profissional para o seguinte estabelecimento:

Nome: ${business.name}
Categoria: ${business.category}
Endereço: ${business.address}
Telefone/WhatsApp: ${business.phone || business.whatsapp || 'WhatsApp Comercial'}
Serviços: ${business.services.join(', ')}
Avaliação: ${business.rating ? `${business.rating} estrelas (${business.reviewCount} avaliações)` : 'Excelente reputação local'}
Estilo visual escolhido: ${style.name} (${style.description})

IMPORTANTE:
- Responda ESTRITAMENTE em formato JSON puro, sem markdown backticks adicionais.
- O tom deve ser profissional, convincente e adaptado ao segmento.
- Não invente dados inverídicos de contato. Use os dados informados.
- Estrutura necessária em JSON:
{
  "businessName": "${business.name}",
  "tagline": "Frase de impacto curta",
  "hero": {
    "headline": "Título chamativo e persuasivo",
    "subheadline": "Subtítulo explicando o valor e benefício",
    "ctaText": "Texto do botão principal (ex: Agendar Horário)",
    "ctaWhatsapp": true,
    "badge": "Destaque curto (ex: Referência na Região)"
  },
  "about": {
    "title": "Sobre Nós / Nossa História",
    "story": "Parágrafo contando o diferencial, tradição e qualidade do atendimento",
    "highlights": ["Diferencial 1", "Diferencial 2", "Diferencial 3"]
  },
  "services": {
    "title": "Nossos Serviços / Especialidades",
    "subtitle": "Conheça as opções que oferecemos para você",
    "items": [
      { "id": "s1", "title": "Serviço 1", "description": "Breve descrição do serviço" },
      { "id": "s2", "title": "Serviço 2", "description": "Breve descrição do serviço" },
      { "id": "s3", "title": "Serviço 3", "description": "Breve descrição do serviço" }
    ]
  },
  "differentials": {
    "title": "Por que nos escolher",
    "items": [
      { "title": "Profissionais Especializados", "description": "Equipe com constante atualização e padrão de excelência." },
      { "title": "Ambiente Acolhedor", "description": "Espaço moderno preparado para seu total conforto." },
      { "title": "Atendimento Ágil", "description": "Respostas rápidas e agendamento simplificado sem burocracia." }
    ]
  },
  "testimonials": {
    "title": "O que nossos clientes dizem",
    "items": [
      { "author": "Cliente Verificado", "role": "Cliente Frequente", "text": "Atendimento impecável! O cuidado e atenção aos detalhes fizeram toda a diferença.", "rating": 5 },
      { "author": "Morador da Região", "role": "Cliente", "text": "Super recomendo! Pontualidade, ambiente agradável e serviço de primeiríssima linha.", "rating": 5 }
    ]
  }
}
`;

  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.7,
      },
    }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Gemini API error ${res.status}: ${errorText}`);
  }

  const data = await res.json();
  const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawText) throw new Error('No response from Gemini API');

  const cleanJson = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
  const parsed = JSON.parse(cleanJson);

  // Blend with photos, location, and contacts
  return {
    ...parsed,
    businessName: business.name,
    hero: {
      ...parsed.hero,
      backgroundImage: business.photos[0] || '',
    },
    about: {
      ...parsed.about,
      image: business.photos[1] || business.photos[0] || '',
    },
    gallery: {
      title: 'Conheça nosso espaço e resultados',
      images: business.photos.map((url, idx) => ({
        url,
        caption: `Ambiente e atendimento ${business.name} #${idx + 1}`,
      })),
    },
    location: {
      title: 'Onde Estamos & Horários',
      address: business.address,
      hours: business.openingHours && business.openingHours.length > 0
        ? business.openingHours
        : ['Segunda a Sexta: 08:30 às 19:00', 'Sábado: 08:30 às 14:00'],
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
  reference?: SiteReferenceInput,
  inspectedRef?: { title?: string; description?: string; headings?: string[] } | null
): LandingPageContent {
  const cat = business.categoryKey;

  // Determine structural layout type to completely eliminate generic appearances
  let layoutType:
    | 'gastronomy'
    | 'health_clinic'
    | 'grooming_beauty'
    | 'fitness'
    | 'automotive'
    | 'real_estate'
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
  } else if (cat === 'imobiliaria') {
    layoutType = 'real_estate';
  }

  let headline = `Excelência e Cuidado em ${business.category}`;
  let subheadline = `Descubra um padrão superior de atendimento e serviços especializados em ${business.name}. Agende pelo WhatsApp.`;
  let ctaText = 'Falar no WhatsApp';
  let badge = 'Atendimento Premium';

  if (layoutType === 'grooming_beauty') {
    headline = 'Estilo, Precisão e Tradição para o Homem Moderno';
    subheadline = 'Cortes modernos, barboterapia com toalha quente e um ambiente exclusivo feito para o seu momento de cuidado.';
    ctaText = 'Agendar Meu Horário';
    badge = 'Barbearia de Alto Padrão';
  } else if (cat === 'odontologia') {
    headline = 'Seu Sorriso Mais Confiante, Saudável e Radiante';
    subheadline = 'Tecnologia odontológica de ponta, tratamentos humanizados e máxima dedicação à sua saúde bucal.';
    ctaText = 'Agendar Avaliação';
    badge = 'Odontologia Especializada';
  } else if (cat === 'estetica') {
    headline = 'Realce Sua Beleza Natural com Tratamentos Avançados';
    subheadline = 'Protocolos personalizados, tecnologia de última geração e procedimentos com foco no seu bem-estar.';
    ctaText = 'Solicitar Consulta';
    badge = 'Estética de Alta Performance';
  } else if (layoutType === 'fitness') {
    headline = 'Supere Seus Limites e Conquiste Sua Melhor Versão';
    subheadline = 'Estrutura completa, acompanhamento profissional e treinos eficientes para você atingir seus objetivos.';
    ctaText = 'Garantir Aula Experimental Grátis';
    badge = 'Treinamento de Resultados';
  } else if (layoutType === 'gastronomy') {
    headline = 'Sabor Inesquecível em Cada Detalhe e Ingrediente';
    subheadline = 'Receitas preparadas com paixão, produtos selecionados e uma experiência gastronômica memorável.';
    ctaText = 'Ver Cardápio & Pedir';
    badge = 'Gastronomia Artesanal & Delivery';
  } else if (layoutType === 'automotive') {
    headline = 'Segurança e Alta Precisão para o Seu Veículo';
    subheadline = 'Diagnóstico computadorizado, mecânicos qualificados e transparência total em cada manutenção.';
    ctaText = 'Solicitar Orçamento Rápido';
    badge = 'Mecânica Especializada';
  } else if (cat === 'petshop') {
    headline = 'Todo o Amor, Carinho e Saúde que Seu Pet Merece';
    subheadline = 'Banho & tosa cuidadoso, atendimento veterinário de confiança e os melhores produtos para seu melhor amigo.';
    ctaText = 'Agendar Banho / Consulta';
    badge = 'Cuidado Pet Especializado';
  } else if (layoutType === 'real_estate') {
    headline = 'Os Imóveis Mais Exclusivos para Você Viver com Estilo';
    subheadline = 'Assessoria completa na compra, venda ou locação com transparência, segurança jurídica e discrição.';
    ctaText = 'Falar com um Consultor';
    badge = 'Imóveis Selecionados';
  }

  // Enrich with reference if available
  if (inspectedRef?.headings && inspectedRef.headings.length > 0 && !business.customHeadline) {
    headline = inspectedRef.headings[0];
  }
  if (inspectedRef?.description && !business.customSubheadline) {
    subheadline = inspectedRef.description;
  }

  const finalHeadline = business.customHeadline || headline;
  const finalSubheadline = business.customSubheadline || subheadline;
  const finalTagline = business.customSlogan || `O melhor em ${business.category.toLowerCase()} na região`;

  const { heroPhoto, aboutPhoto, galleryPhotos } = getCuratedPhotosForBusiness(business);

  const rawServicesList = (business.customServices && business.customServices.length > 0)
    ? business.customServices
    : business.services;

  const serviceItems = rawServicesList.map((svc, idx) => ({
    id: `svc-${idx + 1}`,
    title: svc,
    description: `Atendimento de excelência com padrões rigorosos de qualidade, materiais de primeira linha e foco na sua total satisfação.`,
    price: layoutType === 'grooming_beauty' ? (idx === 0 ? 'R$ 60' : idx === 1 ? 'R$ 45' : undefined) : undefined,
  }));

  const rawDiffs = (business.customDifferentials && business.customDifferentials.length > 0)
    ? business.customDifferentials.map((d) => ({
        title: d.length > 30 ? d.slice(0, 30) + '...' : d,
        description: d,
      }))
    : [
        {
          title: 'Qualidade Garantida',
          description: 'Padrão rigoroso de qualidade em cada detalhe, equipamentos modernos e produtos homologados.',
        },
        {
          title: 'Atendimento Próximo e Humanizado',
          description: 'Ouvimos suas necessidades para indicar exatamente a solução mais eficiente para o seu caso.',
        },
        {
          title: 'Agendamento Direto no WhatsApp',
          description: 'Facilidade total para tirar dúvidas, consultar horários e confirmar seu atendimento em poucos cliques.',
        },
      ];

  // Specific high-conversion modules per layout
  let cardapioItems: CardapioItem[] | undefined = undefined;
  let pricingPlans: PricingPlan[] | undefined = undefined;
  let faqItems: FaqItem[] | undefined = undefined;
  let specialBadges: string[] | undefined = undefined;

  if (layoutType === 'gastronomy') {
    cardapioItems = [
      {
        id: 'cd-1',
        name: cat === 'pizzaria' ? 'Pizza Artesanal da Casa' : 'Prato Especial do Chef',
        description: 'Molho de tomate fresco, blend de queijos nobres e manjericão fresco no forno artesanal.',
        price: 'R$ 79,90',
        badge: 'Mais Pedido',
        image: galleryPhotos[0],
      },
      {
        id: 'cd-2',
        name: cat === 'pizzaria' ? 'Pizza Doce / Especial' : 'Especialidade À La Carte',
        description: 'Receita autoral exclusiva com ingredientes selecionados e ponto perfeito.',
        price: 'R$ 69,90',
        badge: 'Favorito',
        image: galleryPhotos[1],
      },
      {
        id: 'cd-3',
        name: 'Combo Família Completo',
        description: 'Acompanha porção artesanal crocante e refrigerante/suco natural.',
        price: 'R$ 98,00',
        badge: 'Super Oferta',
        image: galleryPhotos[2],
      },
    ];
  } else if (layoutType === 'fitness') {
    pricingPlans = [
      {
        name: 'Plano Básico',
        price: 'R$ 89',
        period: '/mês',
        features: ['Musculação completa', 'Vestiários higienizados', 'Horário flexível'],
      },
      {
        name: 'Plano VIP Black',
        price: 'R$ 129',
        period: '/mês',
        features: ['Livre acesso 7 dias por semana', 'Todas as aulas coletivas inclusas', 'Acompanhamento com Personal', 'Avaliação física bimestral'],
        recommended: true,
      },
      {
        name: 'Plano Anual Prime',
        price: 'R$ 109',
        period: '/mês',
        features: ['Melhor custo-benefício', 'Zero taxa de matrícula', 'Aulas de dança, funcional e luta', 'Cadeira de massagem inclusa'],
      },
    ];
  } else if (layoutType === 'health_clinic') {
    faqItems = [
      {
        question: 'Como funciona a primeira avaliação?',
        answer: 'Realizamos um exame clínico completo com tecnologia digital, entendendo suas queixas e apresentando um plano de tratamento personalizado e sem compromisso.',
      },
      {
        question: 'Os procedimentos são dolorosos?',
        answer: 'Priorizamos o seu conforto total com anestésicos modernos de ação rápida e técnicas minimamente invasivas para que você não sinta dor.',
      },
      {
        question: 'Quais as formas de pagamento facilitadas?',
        answer: 'Trabalhamos com parcelamento facilitado no cartão de crédito, boleto ou condições especiais à vista, além de recibos para reembolso em convênios.',
      },
      {
        question: 'Preciso agendar com antecedência?',
        answer: 'Sim, recomendamos enviar mensagem no WhatsApp para escolher o melhor dia e horário na nossa agenda sem espera na recepção.',
      },
    ];
  } else if (layoutType === 'automotive') {
    specialBadges = [
      'Garantia de 90 dias em peças e serviços',
      'Orçamento prévio sem surpresas',
      'Diagnóstico por scanner digital homologado',
      'Mecânicos especializados e certificados',
    ];
  }

  return {
    businessName: business.name,
    tagline: finalTagline,
    layoutType,
    cardapioItems,
    pricingPlans,
    faqItems,
    specialBadges,
    hero: {
      headline: finalHeadline,
      subheadline: finalSubheadline,
      ctaText,
      ctaWhatsapp: true,
      badge,
      backgroundImage: heroPhoto,
    },
    about: {
      title: `Conheça a ${business.name}`,
      story: business.customAboutStory || `Com dedicação contínua à excelência e ao atendimento humanizado, ${business.name} se destaca pela confiança conquistada junto aos clientes da região. Nosso compromisso é entregar resultados que superem expectativas, em um ambiente confortável e planejado para o seu conforto.`,
      highlights: [
        'Atendimento com hora marcada e sem esperas',
        'Profissionais experientes e altamente capacitados',
        'Localização de fácil acesso e estacionamento próximo',
      ],
      image: aboutPhoto,
    },
    services: {
      title: layoutType === 'gastronomy' ? 'Nosso Cardápio Selecionado' : 'Nossos Serviços e Especialidades',
      subtitle: `Conheça as principais opções oferecidas por ${business.name}`,
      items: serviceItems,
    },
    differentials: {
      title: `Por que escolher ${business.name}?`,
      items: rawDiffs,
    },
    testimonials: {
      title: 'Avaliações de Quem Já Conhece',
      items: [
        {
          author: 'Mariana Silva',
          role: 'Cliente Frequente',
          text: `Excelente atendimento! A equipe da ${business.name} é extremamente atenciosa e o resultado superou o que eu esperava. Vale cada centavo!`,
          rating: 5,
        },
        {
          author: 'Rodrigo Medeiros',
          role: 'Cliente',
          text: `Ambiente impecável e pontualidade no horário. Já recomendei para vários amigos e continuarei cliente fiel.`,
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
      hours: business.openingHours && business.openingHours.length > 0
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
  const waLink = cleanPhone
    ? `https://wa.me/${cleanPhone.startsWith('55') ? cleanPhone : '55' + cleanPhone}?text=${encodeURIComponent(
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
  const primary = style.primaryColor;
  const accent = style.accentColor;
  const cardBg = isDark ? '#18181b' : '#ffffff';
  const cardBorder = isDark ? '#27272a' : '#e4e4e7';
  const subtleText = isDark ? '#a1a1aa' : '#71717a';
  const layout = content.layoutType || 'modern_business';

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${content.businessName} | ${content.tagline}</title>
  <meta name="description" content="${content.hero.subheadline}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@500;700&family=Inter:wght@400;500;600;700;800&family=Montserrat:wght@400;600;700&family=Oswald:wght@500;700&family=Outfit:wght@400;600;700&family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap" rel="stylesheet">
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
    h1, h2, h3, h4, .brand-font { font-family: var(--font-heading); font-weight: 700; line-height: 1.2; }
    a { color: inherit; text-decoration: none; }
    
    .container { max-width: 1200px; margin: 0 auto; padding: 0 24px; }
    .btn {
      display: inline-flex; align-items: center; justify-content: center; gap: 8px;
      padding: 14px 28px; font-weight: 600; border-radius: var(--radius);
      background-color: var(--primary); color: #ffffff; cursor: pointer;
      transition: all 0.25s ease; border: none; font-size: 16px;
    }
    .btn:hover { filter: brightness(1.15); transform: translateY(-2px); box-shadow: 0 10px 25px -5px rgba(0,0,0,0.3); }
    .btn-accent { background-color: var(--accent); }
    
    /* Navbar */
    .navbar {
      position: sticky; top: 0; z-index: 100;
      background: ${isDark ? 'rgba(10, 10, 10, 0.85)' : 'rgba(255, 255, 255, 0.9)'};
      backdrop-filter: blur(12px); border-bottom: 1px solid var(--card-border);
      padding: 16px 0;
    }
    .nav-wrapper { display: flex; align-items: center; justify-content: space-between; }
    .nav-logo { font-size: 22px; font-weight: 800; letter-spacing: -0.5px; }
    .nav-links { display: flex; gap: 28px; align-items: center; }
    .nav-links a { font-size: 15px; font-weight: 500; color: var(--subtle); transition: color 0.2s; }
    .nav-links a:hover { color: var(--text); }
    
    /* Hero */
    .hero {
      position: relative; padding: 110px 0 90px; overflow: hidden;
      display: flex; align-items: center; min-height: 80vh;
    }
    .hero-bg {
      position: absolute; inset: 0; z-index: -1;
      background-image: linear-gradient(${isDark ? 'rgba(9,9,11,0.85), rgba(9,9,11,0.95)' : 'rgba(255,255,255,0.92), rgba(255,255,255,0.98)'}), url('${content.hero.backgroundImage}');
      background-size: cover; background-position: center;
    }
    .badge {
      display: inline-block; padding: 6px 14px; border-radius: 9999px;
      background: ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)'};
      color: var(--primary); font-size: 13px; font-weight: 700;
      text-transform: uppercase; letter-spacing: 1px; margin-bottom: 20px;
    }
    .hero-title { font-size: clamp(34px, 5.5vw, 64px); margin-bottom: 20px; letter-spacing: -1px; }
    .hero-desc { font-size: clamp(17px, 2vw, 21px); color: var(--subtle); max-width: 680px; margin-bottom: 32px; }
    
    /* Section Shared */
    .section { padding: 80px 0; }
    .section-header { text-align: center; max-width: 700px; margin: 0 auto 48px; }
    .section-title { font-size: clamp(28px, 4vw, 42px); margin-bottom: 16px; }
    .section-subtitle { font-size: 16px; color: var(--subtle); }
    
    .grid-services { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px; }
    .service-card {
      background: var(--card-bg); border: 1px solid var(--card-border);
      border-radius: var(--radius); padding: 30px; transition: transform 0.25s, border-color 0.25s;
    }
    .service-card:hover { transform: translateY(-4px); border-color: var(--primary); }
    .service-card h3 { font-size: 20px; margin-bottom: 12px; }
    .service-card p { color: var(--subtle); font-size: 14px; margin-bottom: 16px; line-height: 1.5; }
    .service-price { font-size: 18px; font-weight: 700; color: var(--accent); }
    
    /* About */
    .about-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 48px; align-items: center; }
    .about-img { width: 100%; height: 420px; object-fit: cover; border-radius: var(--radius); }
    .highlights-list { list-style: none; margin-top: 24px; display: flex; flex-direction: column; gap: 12px; }
    .highlights-list li { display: flex; align-items: center; gap: 10px; font-weight: 500; }
    .highlights-list li::before { content: "✓"; color: var(--primary); font-weight: 900; }
    
    /* Differentials */
    .differentials-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 24px; }
    .diff-card {
      padding: 26px; background: var(--card-bg); border: 1px solid var(--card-border);
      border-radius: var(--radius);
    }
    .diff-card h4 { font-size: 17px; margin-bottom: 8px; color: var(--primary); }
    .diff-card p { font-size: 14px; color: var(--subtle); }
    
    /* Testimonials */
    .testimonials-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 24px; }
    .testi-card {
      background: var(--card-bg); border: 1px solid var(--card-border);
      border-radius: var(--radius); padding: 26px;
    }
    .testi-stars { color: #f59e0b; margin-bottom: 10px; font-size: 16px; }
    .testi-quote { font-style: italic; margin-bottom: 14px; color: var(--text); font-size: 14px; }
    .testi-author { font-weight: 700; font-size: 15px; }
    .testi-role { font-size: 12px; color: var(--subtle); }
    
    /* Location & Hours */
    .location-box {
      background: var(--card-bg); border: 1px solid var(--card-border);
      border-radius: var(--radius); padding: 36px; display: grid; grid-template-columns: 1fr 1fr; gap: 32px;
    }
    .info-label { font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: var(--subtle); margin-bottom: 6px; font-weight: 700; }
    .info-val { font-size: 17px; font-weight: 600; margin-bottom: 18px; }
    
    /* Floating WhatsApp */
    .wa-float {
      position: fixed; bottom: 24px; right: 24px; z-index: 999;
      background: #25d366; color: white; width: 58px; height: 58px;
      border-radius: 50%; display: flex; align-items: center; justify-content: center;
      box-shadow: 0 10px 25px rgba(37, 211, 102, 0.4); font-size: 26px;
      transition: transform 0.2s ease;
    }
    .wa-float:hover { transform: scale(1.1); }
    
    /* Footer */
    footer {
      border-top: 1px solid var(--card-border); padding: 42px 0; text-align: center;
      color: var(--subtle); font-size: 13px;
    }
    
    @media (max-width: 768px) {
      .nav-links { display: none; }
      .about-grid { grid-template-columns: 1fr; }
      .location-box { grid-template-columns: 1fr; padding: 20px; }
      .hero { padding: 90px 0 70px; min-height: 70vh; }
    }
  </style>
</head>
<body>

  <!-- Reference Banner (if custom reference was supplied) -->
  ${
    reference && (reference.url || reference.image)
      ? `
      <div style="background: rgba(37,99,235,0.12); border-bottom: 1px solid rgba(37,99,235,0.25); text-align: center; padding: 7px 16px; font-size: 12px; color: #93c5fd; font-weight: 600;">
        ✨ Modelo personalizado com inspiração no site ou referência fornecida
      </div>
      `
      : ''
  }

  <!-- Floating WhatsApp -->
  <a href="${waLink}" target="_blank" rel="noopener noreferrer" class="wa-float" title="Falar no WhatsApp">
    💬
  </a>

  <!-- Header -->
  <header class="navbar">
    <div class="container nav-wrapper">
      <div class="nav-logo brand-font">${content.businessName}</div>
      <nav class="nav-links">
        ${layout === 'gastronomy' ? '<a href="#cardapio">Cardápio</a>' : ''}
        ${layout === 'fitness' ? '<a href="#planos">Planos</a>' : ''}
        ${layout === 'health_clinic' ? '<a href="#faq">Dúvidas Frequentes</a>' : ''}
        <a href="#sobre">Sobre</a>
        <a href="#servicos">${layout === 'gastronomy' ? 'Destaques' : 'Serviços'}</a>
        <a href="#diferenciais">Diferenciais</a>
        <a href="#depoimentos">Avaliações</a>
        <a href="#contato">Contato</a>
        <a href="${waLink}" target="_blank" rel="noopener noreferrer" class="btn btn-accent" style="padding: 8px 18px; font-size: 14px;">
          WhatsApp
        </a>
      </nav>
    </div>
  </header>

  <!-- Hero Section -->
  <section class="hero">
    <div class="hero-bg"></div>
    <div class="container">
      <div class="badge">${content.hero.badge || 'Atendimento Personalizado'}</div>
      <h1 class="hero-title">${content.hero.headline}</h1>
      <p class="hero-desc">${content.hero.subheadline}</p>

      ${
        layout === 'gastronomy'
          ? `
          <div style="display: flex; gap: 16px; flex-wrap: wrap; margin-bottom: 24px; font-size: 14px; font-weight: 600; color: var(--subtle);">
            <span>🛵 Delivery Expresso</span> • <span>📦 Embalagem Térmica</span> • <span>⏱️ 35–45 min</span>
          </div>
          `
          : layout === 'grooming_beauty'
          ? `
          <div style="display: flex; gap: 16px; flex-wrap: wrap; margin-bottom: 24px; font-size: 14px; font-weight: 600; color: var(--subtle);">
            <span>🍻 Cerveja Cortesia</span> • <span>❄️ Climatizado</span> • <span>✂️ Hora Marcada</span>
          </div>
          `
          : layout === 'health_clinic'
          ? `
          <div style="display: flex; gap: 16px; flex-wrap: wrap; margin-bottom: 24px; font-size: 14px; font-weight: 600; color: var(--subtle);">
            <span>🔬 Diagnóstico 3D</span> • <span>🤍 Sem Dor</span> • <span>🛡️ Biossegurança Rigorosa</span>
          </div>
          `
          : layout === 'fitness'
          ? `
          <div style="display: flex; gap: 16px; flex-wrap: wrap; margin-bottom: 24px; font-size: 14px; font-weight: 600; color: var(--subtle);">
            <span>💪 +300m² Área de Treino</span> • <span>🏋️ Aparelhos Modernos</span> • <span>👥 Personal Dedicado</span>
          </div>
          `
          : layout === 'automotive'
          ? `
          <div style="display: flex; gap: 16px; flex-wrap: wrap; margin-bottom: 24px; font-size: 14px; font-weight: 600; color: var(--subtle);">
            <span>🛡️ Garantia de 90 Dias</span> • <span>📋 Orçamento Transparente</span> • <span>💻 Scanner Digital</span>
          </div>
          `
          : ''
      }

      <div style="display: flex; gap: 14px; flex-wrap: wrap;">
        <a href="${waLink}" target="_blank" rel="noopener noreferrer" class="btn">
          ${content.hero.ctaText} →
        </a>
        <a href="${layout === 'gastronomy' ? '#cardapio' : layout === 'fitness' ? '#planos' : '#servicos'}" class="btn" style="background: transparent; border: 1px solid var(--card-border); color: var(--text);">
          ${layout === 'gastronomy' ? 'Ver Cardápio' : layout === 'fitness' ? 'Conhecer Planos' : 'Ver Serviços'}
        </a>
      </div>
    </div>
  </section>

  <!-- SPECIALIZED SECTION: GASTRONOMY MENU HIGHLIGHTS -->
  ${
    layout === 'gastronomy' && content.cardapioItems && content.cardapioItems.length > 0
      ? `
      <section id="cardapio" class="section">
        <div class="container">
          <div class="section-header">
            <div class="badge">Cardápio da Casa</div>
            <h2 class="section-title">Mais Pedidos & Especialidades</h2>
            <p class="section-subtitle">Peça diretamente pelo WhatsApp e receba quentinho em casa</p>
          </div>
          <div class="grid-services">
            ${content.cardapioItems
              .map(
                (item) => `
              <div class="service-card" style="padding: 0; overflow: hidden; display: flex; flex-direction: column;">
                ${item.image ? `<img src="${item.image}" alt="${item.name}" style="width: 100%; height: 200px; object-fit: cover;">` : ''}
                <div style="padding: 24px; flex: 1; display: flex; flex-direction: column; justify-content: space-between;">
                  <div>
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                      <h3 style="font-size: 18px; margin: 0;">${item.name}</h3>
                      ${item.badge ? `<span style="font-size: 10px; font-weight: 700; background: var(--primary); color: white; padding: 2px 8px; border-radius: 9999px;">${item.badge}</span>` : ''}
                    </div>
                    <p style="font-size: 13px; color: var(--subtle); margin-bottom: 16px;">${item.description}</p>
                  </div>
                  <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 14px; border-top: 1px solid var(--card-border);">
                    <span class="service-price" style="font-size: 20px;">${item.price}</span>
                    <a href="https://wa.me/${cleanPhone.startsWith('55') ? cleanPhone : '55' + cleanPhone}?text=${encodeURIComponent(`Olá! Gostaria de pedir: ${item.name} da ${content.businessName}`)}" target="_blank" class="btn" style="padding: 8px 14px; font-size: 13px;">
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

      <!-- Delivery Steps Banner -->
      <section style="background: ${isDark ? '#0c0c0e' : '#f9fafb'}; padding: 50px 0; border-top: 1px solid var(--card-border); border-bottom: 1px solid var(--card-border);">
        <div class="container">
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 20px; text-align: center;">
            <div style="padding: 20px; background: var(--card-bg); border: 1px solid var(--card-border); border-radius: var(--radius);">
              <div style="font-size: 28px; margin-bottom: 8px;">🍕</div>
              <h4 style="font-size: 15px; margin-bottom: 4px;">1. Escolha seus sabores</h4>
              <p style="font-size: 13px; color: var(--subtle);">Ingredientes selecionados e massa no ponto.</p>
            </div>
            <div style="padding: 20px; background: var(--card-bg); border: 1px solid var(--card-border); border-radius: var(--radius);">
              <div style="font-size: 28px; margin-bottom: 8px;">💬</div>
              <h4 style="font-size: 15px; margin-bottom: 4px;">2. Peça no WhatsApp</h4>
              <p style="font-size: 13px; color: var(--subtle);">Atendimento rápido sem filas ou intermediários.</p>
            </div>
            <div style="padding: 20px; background: var(--card-bg); border: 1px solid var(--card-border); border-radius: var(--radius);">
              <div style="font-size: 28px; margin-bottom: 8px;">🛵</div>
              <h4 style="font-size: 15px; margin-bottom: 4px;">3. Entrega Quentinha</h4>
              <p style="font-size: 13px; color: var(--subtle);">Embalagem térmica lacrada direto na sua mesa.</p>
            </div>
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
            <h2 class="section-title">Escolha o Melhor Plano para Seu Objetivo</h2>
            <p class="section-subtitle">Sem taxa de matrícula oculta e com cancelamento facilitado</p>
          </div>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px; align-items: stretch;">
            ${content.pricingPlans
              .map(
                (p) => `
              <div class="service-card" style="display: flex; flex-direction: column; justify-content: space-between; position: relative; ${p.recommended ? 'border-color: var(--primary); box-shadow: 0 10px 30px rgba(0,0,0,0.25);' : ''}">
                ${p.recommended ? `<div style="position: absolute; top: -12px; right: 24px; background: var(--primary); color: white; padding: 4px 12px; border-radius: 9999px; font-size: 11px; font-weight: 800; text-transform: uppercase;">⭐ Mais Escolhido</div>` : ''}
                <div>
                  <h3 style="font-size: 22px; margin-bottom: 6px;">${p.name}</h3>
                  <div style="font-size: 34px; font-weight: 800; color: var(--primary); margin-bottom: 20px;">
                    ${p.price}<span style="font-size: 15px; color: var(--subtle); font-weight: 400;">${p.period}</span>
                  </div>
                  <ul style="list-style: none; display: flex; flex-direction: column; gap: 10px; margin-bottom: 28px;">
                    ${p.features.map((f) => `<li style="display: flex; align-items: center; gap: 8px; font-size: 14px;"><span style="color: var(--primary); font-weight: 800;">✓</span> ${f}</li>`).join('')}
                  </ul>
                </div>
                <a href="https://wa.me/${cleanPhone.startsWith('55') ? cleanPhone : '55' + cleanPhone}?text=${encodeURIComponent(`Olá! Quero me matricular no ${p.name} da ${content.businessName}`)}" target="_blank" class="btn" style="width: 100%; text-align: center;">
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
      <section style="background: ${isDark ? '#1c1917' : '#fef2f2'}; border-top: 2px solid #ef4444; border-bottom: 2px solid #ef4444; padding: 36px 0;">
        <div class="container" style="display: flex; flex-direction: column; align-items: center; justify-content: space-between; gap: 20px; text-align: center;">
          <div>
            <div style="display: inline-block; font-size: 11px; font-weight: 800; color: #ef4444; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px;">🚨 Atendimento de Emergência</div>
            <h3 style="font-size: 22px; font-weight: 800; margin-bottom: 6px;">Precisando de socorro ou diagnóstico rápido?</h3>
            <p style="color: var(--subtle); font-size: 14px;">Chame nossa equipe técnica no WhatsApp para assistência imediata ou agendamento prioritário.</p>
          </div>
          <a href="${waLink}" target="_blank" class="btn" style="background: #dc2626; color: white; white-space: nowrap; font-weight: 700;">
            Chamar Suporte Mecânico no WhatsApp
          </a>
        </div>
      </section>
      `
      : ''
  }

  <!-- About Section -->
  <section id="sobre" class="section" style="background: ${isDark ? '#0c0c0e' : '#f9fafb'};">
    <div class="container">
      <div class="about-grid">
        <div>
          <div class="badge">Nossa Proposta</div>
          <h2 class="section-title">${content.about.title}</h2>
          <p style="font-size: 16px; color: var(--subtle); margin-bottom: 20px;">
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
            <h3>${item.title}</h3>
            <p>${item.description}</p>
            ${item.price ? `<div class="service-price">${item.price}</div>` : ''}
            <a href="${waLink}" target="_blank" style="display: inline-block; margin-top: 14px; font-weight: 600; font-size: 14px; color: var(--primary);">
              Agendar serviço →
            </a>
          </div>
        `
          )
          .join('')}
      </div>
    </div>
  </section>

  <!-- SPECIALIZED SECTION: HEALTH CLINIC FAQ -->
  ${
    layout === 'health_clinic' && content.faqItems && content.faqItems.length > 0
      ? `
      <section id="faq" class="section" style="background: ${isDark ? '#0c0c0e' : '#f9fafb'};">
        <div class="container">
          <div class="section-header">
            <div class="badge">Tire Suas Dúvidas</div>
            <h2 class="section-title">Perguntas Frequentes dos Pacientes</h2>
            <p class="section-subtitle">Transparência, acolhimento e segurança antes de qualquer procedimento</p>
          </div>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; max-width: 1000px; margin: 0 auto;">
            ${content.faqItems
              .map(
                (f) => `
              <div style="background: var(--card-bg); border: 1px solid var(--card-border); border-radius: var(--radius); padding: 22px;">
                <h4 style="font-size: 15px; margin-bottom: 8px; color: var(--primary); font-weight: 700;">❓ ${f.question}</h4>
                <p style="font-size: 13px; color: var(--subtle); line-height: 1.6;">${f.answer}</p>
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
  <section id="diferenciais" class="section" style="background: ${layout === 'health_clinic' ? 'transparent' : isDark ? '#0c0c0e' : '#f9fafb'};">
    <div class="container">
      <div class="section-header">
        <div class="badge">Vantagens</div>
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
  <section id="depoimentos" class="section">
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
            <div class="testi-stars">${'★'.repeat(t.rating)}</div>
            <p class="testi-quote">"${t.text}"</p>
            <div class="testi-author">${t.author}</div>
            <div class="testi-role">${t.role || 'Cliente'}</div>
          </div>
        `
          )
          .join('')}
      </div>
    </div>
  </section>

  <!-- Location & Hours Section -->
  <section id="contato" class="section" style="background: ${isDark ? '#0c0c0e' : '#f9fafb'};">
    <div class="container">
      <div class="section-header">
        <div class="badge">Visite-nos</div>
        <h2 class="section-title">${content.location.title}</h2>
      </div>
      <div class="location-box">
        <div>
          <div class="info-label">Endereço</div>
          <div class="info-val">${content.location.address}</div>

          <div class="info-label">Horários de Atendimento</div>
          <div class="info-val" style="font-size: 14px; font-weight: normal;">
            ${content.location.hours.map((h) => `<div>${h}</div>`).join('')}
          </div>
        </div>
        <div>
          <div class="info-label">Contato Direto</div>
          <div class="info-val">${content.location.whatsapp || content.location.phone || 'Atendimento via WhatsApp'}</div>

          <div style="margin-top: 20px;">
            <a href="${waLink}" target="_blank" rel="noopener noreferrer" class="btn" style="width: 100%;">
              Conversar no WhatsApp Agora
            </a>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Footer -->
  <footer>
    <div class="container">
      <div style="font-weight: 700; margin-bottom: 8px;">${content.businessName}</div>
      <p style="margin-bottom: 10px;">${content.location.address}</p>
      <p>© ${new Date().getFullYear()} ${content.businessName}. Todos os direitos reservados. Demonstração comercial desenvolvida com IA.</p>
    </div>
  </footer>

</body>
</html>`;
}
