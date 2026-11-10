const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://reyltwmuowdrseixfbhf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJleWx0d211b3dkcnNlaXhmYmhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM1NjY3MTAsImV4cCI6MjEwOTE0MjcxMH0.Gx0_QXf5V-gxtp5TQ9hoZ5fq4xzZ19fcNkkjMvM1C-o';

async function seedDemoData() {
  const supabase = createClient(supabaseUrl, supabaseKey);
  const { data: signInData } = await supabase.auth.signInWithPassword({
    email: 'demo@leadcraft.com',
    password: 'Demo@123456',
  });

  if (!signInData?.user) {
    console.error('Failed to authenticate demo user');
    return;
  }

  const userId = signInData.user.id;
  console.log('Seeding demo data for userId:', userId);

  // Business 1
  const biz1 = {
    id: 'biz-demo-navalha',
    user_id: userId,
    name: 'Barbearia Navalha de Ouro',
    category: 'Barbearias e Salões de Beleza',
    category_key: 'barbearia',
    address: 'Rua das Palmeiras, 342 - Centro',
    phone: '(11) 98765-4321',
    whatsapp: '5511987654321',
    instagram: '@navalhadouro.oficial',
    website_status: 'none',
    rating: 4.8,
    review_count: 142,
    lat: -23.554,
    lng: -46.635,
    opportunity_score: 'high',
    opportunity_reason: 'Sem site próprio identificado, forte presença no Instagram e alta nota dos clientes.',
    collected_data: {
      photos: ['https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=800&q=80'],
      services: ['Corte Degradê & Fade', 'Barba Terapia com Toalha Quente', 'Tratamento Capilar'],
    },
  };
  await supabase.from('businesses').upsert(biz1);

  // Lead 1
  await supabase.from('leads').upsert({
    id: 'lead-demo-1',
    user_id: userId,
    business_id: 'biz-demo-navalha',
    project_id: 'proj-demo-navalha',
    status: 'landing_page_created',
    notes: 'Demonstração gerada no estilo Urbano e Ousado. Pronta para abordagem no WhatsApp.',
    is_favorite: true,
  });

  // Landing Page 1
  await supabase.from('landing_pages').upsert({
    id: 'proj-demo-navalha',
    user_id: userId,
    business_id: 'biz-demo-navalha',
    project_name: 'Barbearia Navalha de Ouro',
    category: 'Barbearias e Salões de Beleza',
    style_id: 'urban-bold',
    style_config: {
      id: 'urban-bold',
      name: 'Urbano e Ousado',
      description: 'Preto marcante, toques neon ou âmbar, tipografia pesada e energia contemporânea.',
      theme: 'dark',
      primaryColor: '#18181b',
      secondaryColor: '#f59e0b',
      accentColor: '#f97316',
      bgColor: '#09090b',
      textColor: '#fafafa',
      fontHeading: 'Oswald, sans-serif',
      fontBody: 'Inter, sans-serif',
      buttonRadius: 'rounded-md',
      minimalismLevel: 3,
    },
    content: {
      businessName: 'Barbearia Navalha de Ouro',
      tagline: 'O melhor em barbearia na região',
      hero: {
        headline: 'Estilo, Precisão e Tradição para o Homem Moderno',
        subheadline: 'Cortes clássicos e modernos, barba terapia completa e um ambiente pensado para o seu cuidado.',
        ctaText: 'Agendar Meu Horário',
        ctaWhatsapp: true,
        badge: 'Referência em Estilo Masculino',
        backgroundImage: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=1600&q=80',
      },
      about: {
        title: 'Conheça a Barbearia Navalha de Ouro',
        story: 'Com dedicação contínua à excelência e ao atendimento humanizado, a Barbearia Navalha de Ouro se destaca pela confiança conquistada junto aos clientes da região.',
        highlights: [
          'Atendimento com hora marcada e sem esperas',
          'Barba terapia com toalha quente e óleos essenciais',
          'Ambiente climatizado e cerveja cortesia',
        ],
        image: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=800&q=80',
      },
      services: {
        title: 'Nossos Serviços e Especialidades',
        subtitle: 'Conheça os principais procedimentos',
        items: [
          { id: 's1', title: 'Corte Degradê & Fade', description: 'Acabamento perfeito na tesoura e máquina.' },
          { id: 's2', title: 'Barba Terapia com Toalha Quente', description: 'Hidratação profunda e lâmina afiada.' },
          { id: 's3', title: 'Tratamento Capilar', description: 'Revitalização e produtos homologados.' },
        ],
      },
      differentials: {
        title: 'Por que escolher a Barbearia Navalha de Ouro?',
        items: [
          { title: 'Qualidade Garantida', description: 'Padrão rigoroso de higiene e ferramentas esterilizadas.' },
          { title: 'Atendimento Próximo', description: 'Profissionais que ouvem o que você realmente quer.' },
          { title: 'Agendamento Direto no WhatsApp', description: 'Facilidade total para confirmar seu horário.' },
        ],
      },
      gallery: {
        title: 'Galeria & Experiência',
        images: [
          { url: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=800&q=80', caption: 'Ambiente' },
          { url: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=800&q=80', caption: 'Corte' },
        ],
      },
      testimonials: {
        title: 'Avaliações de Quem Já Conhece',
        items: [
          { author: 'Guilherme Santos', role: 'Cliente Frequente', text: 'Melhor corte da região, pontualidade impecável.', rating: 5 },
          { author: 'Marcelo Ribeiro', role: 'Cliente', text: 'A barba terapia relaxa de verdade. Atendimento nota 10!', rating: 5 },
        ],
      },
      location: {
        title: 'Localização & Contato',
        address: 'Rua das Palmeiras, 342 - Centro',
        hours: ['Segunda a Sábado: 09:00 às 20:00'],
        whatsapp: '5511987654321',
      },
      whatsappNumber: '5511987654321',
    },
    demo_url: '/preview/proj-demo-navalha',
    status: 'ready',
  });

  // Business 2
  const biz2 = {
    id: 'biz-demo-odonto',
    user_id: userId,
    name: 'Dra. Camila Toledo Odontologia',
    category: 'Clínicas Odontológicas',
    category_key: 'odontologia',
    address: 'Av. Paulista, 1200 - Conjunto 84',
    phone: '(11) 97654-3210',
    whatsapp: '5511976543210',
    instagram: '@dracamilatoledo.odonto',
    website_status: 'none',
    rating: 4.9,
    review_count: 98,
    lat: -23.565,
    lng: -46.652,
    opportunity_score: 'high',
    opportunity_reason: 'Excelente reputação na região, atende procedimentos estéticos odontológicos e não possui site institucional.',
    collected_data: {
      photos: ['https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=800&q=80'],
      services: ['Invisalign Doctor', 'Clareamento a Laser', 'Lentes em Resina Composta'],
    },
  };
  await supabase.from('businesses').upsert(biz2);

  // Lead 2
  await supabase.from('leads').upsert({
    id: 'lead-demo-2',
    user_id: userId,
    business_id: 'biz-demo-odonto',
    status: 'contacted',
    notes: 'Mensagem de abordagem enviada via WhatsApp em 10/11.',
    is_favorite: true,
  });

  console.log('✓ Dados de demonstração semeados com sucesso!');
}

seedDemoData().catch(console.error);
