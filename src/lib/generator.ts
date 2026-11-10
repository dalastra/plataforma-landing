import { Business, LandingPageContent, LandingPageProject, LandingPageStyle } from '@/types';
import { STYLE_PRESETS } from './constants';

export async function generateLandingPageProject(
  business: Business,
  styleOverride?: LandingPageStyle,
  geminiApiKey?: string
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

  // Generate content using Gemini if key exists, otherwise use high-caliber semantic engine
  let content: LandingPageContent;
  if (geminiApiKey && geminiApiKey.trim().length > 10) {
    try {
      content = await generateWithGemini(business, style, geminiApiKey);
    } catch (err) {
      console.warn('Gemini generation failed, falling back to heuristic engine:', err);
      content = generateSemanticContent(business, style);
    }
  } else {
    content = generateSemanticContent(business, style);
  }

  const projectId = `proj-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const htmlContent = renderStandaloneHtml(content, style, business);

  return {
    id: projectId,
    businessId: business.id,
    businessName: business.name,
    category: business.category,
    style,
    content,
    htmlContent,
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
  style: LandingPageStyle
): LandingPageContent {
  const cat = business.categoryKey;
  let headline = `Excelência e Cuidado em ${business.category}`;
  let subheadline = `Descubra um padrão superior de atendimento e serviços especializados em ${business.name}. Agende pelo WhatsApp.`;
  let ctaText = 'Falar no WhatsApp';
  let badge = 'Atendimento Premium';

  if (cat === 'barbearia') {
    headline = 'Estilo, Precisão e Tradição para o Homem Moderno';
    subheadline = 'Cortes clássicos e modernos, barba terapia completa e um ambiente pensado para o seu momento de cuidado.';
    ctaText = 'Agendar Meu Horário';
    badge = 'Referência em Estilo Masculino';
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
  } else if (cat === 'academia') {
    headline = 'Supere Seus Limites e Conquiste Sua Melhor Versão';
    subheadline = 'Estrutura completa, acompanhamento profissional e treinos eficientes para você atingir seus objetivos.';
    ctaText = 'Agendar Treino Experimental';
    badge = 'Treinamento de Resultados';
  } else if (cat === 'restaurante' || cat === 'pizzaria') {
    headline = 'Sabor Inesquecível em Cada Detalhe e Ingrediente';
    subheadline = 'Receitas preparadas com paixão, produtos selecionados e uma experiência gastronômica memorável.';
    ctaText = 'Fazer Pedido / Reservar';
    badge = 'Gastronomia Artesanal';
  } else if (cat === 'oficina') {
    headline = 'Segurança e Alta Precisão para o Seu Veículo';
    subheadline = 'Diagnóstico computadorizado, mecânicos qualificados e transparência total em cada manutenção.';
    ctaText = 'Solicitar Orçamento Rápido';
    badge = 'Mecânica Especializada';
  } else if (cat === 'petshop') {
    headline = 'Todo o Amor, Carinho e Saúde que Seu Pet Merece';
    subheadline = 'Banho & tosa cuidadoso, atendimento veterinário de confiança e os melhores produtos para seu melhor amigo.';
    ctaText = 'Agendar Banho / Consulta';
    badge = 'Cuidado Pet Especializado';
  } else if (cat === 'imobiliaria') {
    headline = 'Os Imóveis Mais Exclusivos para Você Viver com Estilo';
    subheadline = 'Assessoria completa na compra, venda ou locação com transparência, segurança jurídica e discrição.';
    ctaText = 'Falar com um Consultor';
    badge = 'Imóveis Selecionados';
  }

  const serviceItems = business.services.map((svc, idx) => ({
    id: `svc-${idx + 1}`,
    title: svc,
    description: `Procedimento realizado com os mais altos padrões de qualidade, materiais de primeira linha e foco na sua total satisfação.`,
    price: cat === 'barbearia' ? (idx === 0 ? 'R$ 60' : idx === 1 ? 'R$ 45' : undefined) : undefined,
  }));

  return {
    businessName: business.name,
    tagline: `O melhor em ${business.category.toLowerCase()} na região`,
    hero: {
      headline,
      subheadline,
      ctaText,
      ctaWhatsapp: true,
      badge,
      backgroundImage: business.photos[0] || 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=1600&q=80',
    },
    about: {
      title: `Conheça a ${business.name}`,
      story: `Com dedicação contínua à excelência e ao atendimento humanizado, ${business.name} se destaca pela confiança conquistada junto aos clientes da região. Nosso compromisso é entregar resultados que superem expectativas, em um ambiente confortável e planejado para o seu conforto.`,
      highlights: [
        'Atendimento com hora marcada e sem esperas',
        'Profissionais experientes e altamente capacitados',
        'Localização de fácil acesso e estacionamento próximo',
      ],
      image: business.photos[1] || business.photos[0] || 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=800&q=80',
    },
    services: {
      title: 'Nossos Serviços e Especialidades',
      subtitle: `Conheça os principais procedimentos oferecidos por ${business.name}`,
      items: serviceItems,
    },
    differentials: {
      title: `Por que escolher ${business.name}?`,
      items: [
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
      ],
    },
    gallery: {
      title: 'Galeria & Experiência',
      images: business.photos.map((url, idx) => ({
        url,
        caption: `Experiência ${business.name} #${idx + 1}`,
      })),
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
  business: Business
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
      padding: 18px 0;
    }
    .nav-wrapper { display: flex; align-items: center; justify-content: space-between; }
    .nav-logo { font-size: 22px; font-weight: 800; letter-spacing: -0.5px; }
    .nav-links { display: flex; gap: 32px; align-items: center; }
    .nav-links a { font-size: 15px; font-weight: 500; color: var(--subtle); transition: color 0.2s; }
    .nav-links a:hover { color: var(--text); }
    
    /* Hero */
    .hero {
      position: relative; padding: 120px 0 100px; overflow: hidden;
      display: flex; align-items: center; min-height: 85vh;
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
    .hero-title { font-size: clamp(38px, 6vw, 68px); margin-bottom: 24px; letter-spacing: -1px; }
    .hero-desc { font-size: clamp(18px, 2.2vw, 22px); color: var(--subtle); max-width: 650px; margin-bottom: 36px; }
    
    /* Services */
    .section { padding: 90px 0; }
    .section-header { text-align: center; max-width: 700px; margin: 0 auto 50px; }
    .section-title { font-size: clamp(28px, 4vw, 42px); margin-bottom: 16px; }
    .section-subtitle { font-size: 17px; color: var(--subtle); }
    
    .grid-services { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px; }
    .service-card {
      background: var(--card-bg); border: 1px solid var(--card-border);
      border-radius: var(--radius); padding: 32px; transition: transform 0.25s, border-color 0.25s;
    }
    .service-card:hover { transform: translateY(-4px); border-color: var(--primary); }
    .service-card h3 { font-size: 20px; margin-bottom: 12px; }
    .service-card p { color: var(--subtle); font-size: 15px; margin-bottom: 16px; }
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
      padding: 28px; background: var(--card-bg); border: 1px solid var(--card-border);
      border-radius: var(--radius);
    }
    .diff-card h4 { font-size: 18px; margin-bottom: 10px; color: var(--primary); }
    .diff-card p { font-size: 14px; color: var(--subtle); }
    
    /* Testimonials */
    .testimonials-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 24px; }
    .testi-card {
      background: var(--card-bg); border: 1px solid var(--card-border);
      border-radius: var(--radius); padding: 28px;
    }
    .testi-stars { color: #f59e0b; margin-bottom: 12px; font-size: 16px; }
    .testi-quote { font-style: italic; margin-bottom: 16px; color: var(--text); }
    .testi-author { font-weight: 700; font-size: 15px; }
    .testi-role { font-size: 13px; color: var(--subtle); }
    
    /* Location & Hours */
    .location-box {
      background: var(--card-bg); border: 1px solid var(--card-border);
      border-radius: var(--radius); padding: 40px; display: grid; grid-template-columns: 1fr 1fr; gap: 36px;
    }
    .info-label { font-size: 13px; text-transform: uppercase; letter-spacing: 1px; color: var(--subtle); margin-bottom: 6px; }
    .info-val { font-size: 18px; font-weight: 600; margin-bottom: 20px; }
    
    /* Floating WhatsApp */
    .wa-float {
      position: fixed; bottom: 24px; right: 24px; z-index: 999;
      background: #25d366; color: white; width: 60px; height: 60px;
      border-radius: 50%; display: flex; align-items: center; justify-content: center;
      box-shadow: 0 10px 25px rgba(37, 211, 102, 0.4); font-size: 28px;
      transition: transform 0.2s ease;
    }
    .wa-float:hover { transform: scale(1.1); }
    
    /* Footer */
    footer {
      border-top: 1px solid var(--card-border); padding: 48px 0; text-align: center;
      color: var(--subtle); font-size: 14px;
    }
    
    @media (max-width: 768px) {
      .nav-links { display: none; }
      .about-grid { grid-template-columns: 1fr; }
      .location-box { grid-template-columns: 1fr; padding: 24px; }
    }
  </style>
</head>
<body>

  <!-- Floating WhatsApp -->
  <a href="${waLink}" target="_blank" rel="noopener noreferrer" class="wa-float" title="Falar no WhatsApp">
    💬
  </a>

  <!-- Header -->
  <header class="navbar">
    <div class="container nav-wrapper">
      <div class="nav-logo brand-font">${content.businessName}</div>
      <nav class="nav-links">
        <a href="#sobre">Sobre</a>
        <a href="#servicos">Serviços</a>
        <a href="#diferenciais">Diferenciais</a>
        <a href="#depoimentos">Avaliações</a>
        <a href="#contato">Localização</a>
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
      <div style="display: flex; gap: 16px; flex-wrap: wrap;">
        <a href="${waLink}" target="_blank" rel="noopener noreferrer" class="btn">
          ${content.hero.ctaText} →
        </a>
        <a href="#servicos" class="btn" style="background: transparent; border: 1px solid var(--card-border); color: var(--text);">
          Ver Nossos Serviços
        </a>
      </div>
    </div>
  </section>

  <!-- About Section -->
  <section id="sobre" class="section" style="background: ${isDark ? '#0c0c0e' : '#f9fafb'};">
    <div class="container">
      <div class="about-grid">
        <div>
          <div class="badge">Nossa Proposta</div>
          <h2 class="section-title">${content.about.title}</h2>
          <p style="font-size: 17px; color: var(--subtle); margin-bottom: 20px;">
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
            <a href="${waLink}" target="_blank" style="display: inline-block; margin-top: 16px; font-weight: 600; font-size: 14px; color: var(--primary);">
              Agendar serviço →
            </a>
          </div>
        `
          )
          .join('')}
      </div>
    </div>
  </section>

  <!-- Differentials Section -->
  <section id="diferenciais" class="section" style="background: ${isDark ? '#0c0c0e' : '#f9fafb'};">
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
          <div class="info-val" style="font-size: 15px; font-weight: normal;">
            ${content.location.hours.map((h) => `<div>${h}</div>`).join('')}
          </div>
        </div>
        <div>
          <div class="info-label">Contato Direto</div>
          <div class="info-val">${content.location.whatsapp || content.location.phone || 'Atendimento via WhatsApp'}</div>

          <div style="margin-top: 24px;">
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
      <p style="margin-bottom: 12px;">${content.location.address}</p>
      <p>© ${new Date().getFullYear()} ${content.businessName}. Todos os direitos reservados. Demonstração comercial desenvolvida com IA.</p>
    </div>
  </footer>

</body>
</html>`;
}
