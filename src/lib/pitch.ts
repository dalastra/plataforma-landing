import { Business, CommercialPitch } from '@/types';

export function generateCommercialPitches(
  business: Business,
  demoUrl: string
): CommercialPitch {
  const name = business.name;
  const cat = business.category.toLowerCase();
  const insta = business.instagram ? ` (${business.instagram})` : '';

  // WhatsApp Message (clean formatting with asterisks for bold, natural tone, clear value proposition)
  const whatsappMessage = `Olá! Tudo bem? 👋

Estava conhecendo os principais estabelecimentos da região e encontrei o perfil da *${name}*${insta}.

Percebi o excelente trabalho que vocês realizam no segmento de ${cat}, com ótimas avaliações dos clientes, mas notei que vocês ainda não possuem um site próprio para apresentar os serviços, diferenciais e centralizar os agendamentos.

Como atuo no desenvolvimento de soluções digitais para negócios locais, tomei a liberdade de preparar uma demonstração prática de como poderia ficar uma landing page moderna e profissional para a *${name}*:

👉 *Acesse a demonstração aqui:* ${demoUrl}

A ideia dessa página é:
✅ Apresentar os principais serviços com visual moderno;
✅ Facilitar o agendamento direto pelo WhatsApp;
✅ Passar ainda mais credibilidade para novos clientes que pesquisam no Google.

Caso faça sentido para vocês, fico à disposição para conversarmos sem compromisso! O que achou da ideia?`;

  // Instagram DM Message (shorter, mobile-first, friendly, hook-oriented)
  const instagramMessage = `Olá pessoal da ${name}! Tudo bem por aí? ✨

Acompanhei o perfil de vocês aqui no Instagram e achei o trabalho excelente!

Notei que vocês ainda não possuem um site exclusivo para concentrar os serviços, horários e facilitar o contato dos clientes que chegam pelo direct.

Montei uma demonstração rápida e personalizada de como ficaria um site profissional para vocês:
🔗 ${demoUrl}

Dá uma olhada quando puder! Se acharem interessante, podemos conversar sem compromisso para ajustar aos detalhes de vocês. Um abraço!`;

  // Direct Message (straight to the point, focused on results and conversion)
  const directMessage = `Olá, responsável pela ${name}, tudo bem?

Notei que vocês oferecem excelentes serviços em ${cat}, porém ainda não possuem uma landing page oficial para converter quem pesquisa pelo negócio de vocês na internet.

Criei um modelo funcional exclusivo para vocês testarem:
${demoUrl}

Uma página como essa ajuda a filtrar dúvidas frequentes e aumenta em até 3x os contatos qualificados no WhatsApp.

Se tiver 5 minutos essa semana, podemos alinhar como colocar no ar para vocês!`;

  // Professional / Corporate Message (formal, respectful, analytical tone)
  const formalMessage = `Prezada equipe da ${name}, boa tarde.

Ao realizar um mapeamento de empresas de destaque no setor de ${cat} em nossa região, identifiquei a solidez e a boa reputação do seu negócio perante os clientes.

Identificamos também uma excelente oportunidade de crescimento: a criação de um endereço digital próprio (landing page de alta conversão) para consolidar a presença institucional da empresa e otimizar a captação de clientes.

Com o objetivo de demonstrar o valor prático dessa proposta, estruturamos uma versão de demonstração personalizada:
${demoUrl}

Coloco-me à inteira disposição para apresentar os benefícios comerciais dessa solução para a ${name}.

Atenciosamente.`;

  // Casual / Relaxed Message (warm, friendly, consultative)
  const casualMessage = `E aí, pessoal da ${name}! Tudo joia? 🚀

Passando aqui porque conheci o espaço de vocês e achei o trabalho de primeira!

Vi que a comunicação de vocês é ótima, mas senti falta de uma página rápida na internet para mostrar os serviços e facilitar quem quer agendar direto pelo WhatsApp.

Fiz um rascunho bem legal de demonstração para vocês darem uma olhada:
${demoUrl}

Ficou bem moderno e com a cara de vocês. Depois me contem o que acharam, beleza? Sem compromisso nenhum!`;

  return {
    businessName: name,
    whatsappMessage,
    instagramMessage,
    directMessage,
    formalMessage,
    casualMessage,
  };
}
