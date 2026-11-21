'use client';

import { useState, useEffect } from 'react';
import { Business, LandingPageProject, LandingPageStyle, StylePresetId } from '@/types';
import { STYLE_PRESETS } from '@/lib/constants';
import { Sparkles, MapPin, Phone, Building2, Tag, Clock, FileText, CheckCircle2, X, Loader2 } from 'lucide-react';
import { useToast } from '@/context/ToastContext';

interface CreateSiteModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData: {
    name?: string;
    category?: string;
    categoryKey?: string;
    address?: string;
    neighborhood?: string;
    city?: string;
    lat: number;
    lng: number;
    phone?: string;
    whatsapp?: string;
  };
  onSuccess: (project: LandingPageProject, business: Business) => void;
}

const CATEGORY_OPTIONS = [
  { key: 'pizzaria', name: 'Pizzaria / Hamburgueria', icon: '🍕' },
  { key: 'restaurante', name: 'Restaurante / Alimentação', icon: '🍽️' },
  { key: 'barbearia', name: 'Barbearia / Salão de Beleza', icon: '✂️' },
  { key: 'odontologia', name: 'Dentista / Odontologia', icon: '🦷' },
  { key: 'estetica', name: 'Clínica de Estética / Spa', icon: '✨' },
  { key: 'academia', name: 'Academia / Treinamento Físico', icon: '💪' },
  { key: 'oficina', name: 'Oficina Mecânica / Auto Center', icon: '🔧' },
  { key: 'petshop', name: 'Pet Shop / Veterinária', icon: '🐾' },
  { key: 'imobiliaria', name: 'Imobiliária / Corretores', icon: '🏠' },
  { key: 'servicos', name: 'Serviços Profissionais / Escritório', icon: '💼' },
  { key: 'comercio', name: 'Comércio / Loja Local', icon: '🛍️' },
  { key: 'outros', name: 'Outro Segmento', icon: '📍' },
];

export const CATEGORY_STYLE_RECOMMENDATIONS: Record<
  string,
  {
    recommendedStyleId: StylePresetId;
    tagLabel: string;
    explanation: string;
  }
> = {
  pizzaria: {
    recommendedStyleId: 'urban-bold',
    tagLabel: 'Indicado para Pizzarias & Burgers',
    explanation: 'Cores quentes e marcantes que despertam apetite e aumentam pedidos no WhatsApp.',
  },
  restaurante: {
    recommendedStyleId: 'modern-minimalist',
    tagLabel: 'Indicado para Restaurantes',
    explanation: 'Design sofisticado e limpo que valoriza fotografias de pratos e reservas.',
  },
  barbearia: {
    recommendedStyleId: 'urban-bold',
    tagLabel: 'Indicado para Barbearias',
    explanation: 'Estética escura, moderna e autêntica, ideal para o público de cuidados masculinos e estilo.',
  },
  odontologia: {
    recommendedStyleId: 'clean-commercial',
    tagLabel: 'Indicado para Odontologia',
    explanation: 'Visual clean em tons de azul e branco, transmitindo assepsia, credibilidade e acolhimento.',
  },
  estetica: {
    recommendedStyleId: 'premium-sophisticated',
    tagLabel: 'Indicado para Estética & Spa',
    explanation: 'Tons de dourado e acabamento nobre que valorizam procedimentos de alto padrão e auto-estima.',
  },
  academia: {
    recommendedStyleId: 'sports-energetic',
    tagLabel: 'Indicado para Academias & Treino',
    explanation: 'Visual eletrizante e dinâmico que motiva a matrícula imediata e transmite alta performance.',
  },
  oficina: {
    recommendedStyleId: 'corporate-elegant',
    tagLabel: 'Indicado para Oficinas & Auto',
    explanation: 'Estética sólida e profissional que passa total transparência e confiança mecânica.',
  },
  petshop: {
    recommendedStyleId: 'creative-playful',
    tagLabel: 'Indicado para Pet Shops',
    explanation: 'Tons amigáveis e acolhedores que transmitem carinho, cuidado animal e simpatia.',
  },
  imobiliaria: {
    recommendedStyleId: 'luxury-exclusive',
    tagLabel: 'Indicado para Imobiliárias',
    explanation: 'Visual de alto valor percebido com detalhes champanhe para imóveis de prestígio.',
  },
  servicos: {
    recommendedStyleId: 'clean-commercial',
    tagLabel: 'Indicado para Serviços Locais',
    explanation: 'Clareza imediata na proposta de valor e contato direto sem ruído visual.',
  },
  comercio: {
    recommendedStyleId: 'modern-minimalist',
    tagLabel: 'Indicado para Comércio Local',
    explanation: 'Estrutura direta focada em catálogo de produtos e vendas rápidas.',
  },
  outros: {
    recommendedStyleId: 'modern-minimalist',
    tagLabel: 'Estilo Recomendado',
    explanation: 'Design versátil com foco absoluto em conversão e usabilidade móvel.',
  },
};

export default function CreateSiteModal({
  isOpen,
  onClose,
  initialData,
  onSuccess,
}: CreateSiteModalProps) {
  const { success: toastSuccess, error: toastError } = useToast();
  const [name, setName] = useState(initialData.name || '');
  const [categoryKey, setCategoryKey] = useState(initialData.categoryKey || 'pizzaria');
  const [address, setAddress] = useState(initialData.address || '');
  const [whatsapp, setWhatsapp] = useState(initialData.whatsapp || initialData.phone || '');
  const [slogan, setSlogan] = useState('');
  const [services, setServices] = useState('');
  const [differentials, setDifferentials] = useState('');
  const [hours, setHours] = useState('Segunda a Sábado das 09h às 19h');
  const [selectedStyleId, setSelectedStyleId] = useState<StylePresetId>('urban-bold');
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');

  useEffect(() => {
    if (isOpen) {
      setName(initialData.name || '');
      const key = initialData.categoryKey || 'pizzaria';
      setCategoryKey(key);
      setAddress(initialData.address || '');
      setWhatsapp(initialData.whatsapp || initialData.phone || '');

      // Automatically recommend and pre-select the optimal style for this category
      const rec = CATEGORY_STYLE_RECOMMENDATIONS[key] || CATEGORY_STYLE_RECOMMENDATIONS['outros'];
      if (rec) {
        setSelectedStyleId(rec.recommendedStyleId);
      }
    }
  }, [isOpen, initialData]);

  function handleCategoryChange(newKey: string) {
    setCategoryKey(newKey);
    const rec = CATEGORY_STYLE_RECOMMENDATIONS[newKey] || CATEGORY_STYLE_RECOMMENDATIONS['outros'];
    if (rec) {
      setSelectedStyleId(rec.recommendedStyleId);
    }
  }

  if (!isOpen) return null;

  const currentCategoryObj = CATEGORY_OPTIONS.find((c) => c.key === categoryKey) || CATEGORY_OPTIONS[0];

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      toastError('Por favor, informe o nome do negócio.');
      return;
    }

    try {
      setLoading(true);
      setLoadingStep('Preparando estrutura e referências...');

      const selectedStyle = STYLE_PRESETS[selectedStyleId] || Object.values(STYLE_PRESETS)[0];

      // Format custom services list
      const parsedServices = services
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);

      // Format custom differentials list
      const parsedDiffs = differentials
        .split('\n')
        .map((d) => d.trim())
        .filter(Boolean);

      const businessPayload: Business = {
        id: `custom-map-${Date.now()}`,
        name: name.trim(),
        category: currentCategoryObj.name,
        categoryKey: currentCategoryObj.key,
        address: address.trim() || 'Endereço Local',
        neighborhood: initialData.neighborhood,
        city: initialData.city,
        lat: initialData.lat,
        lng: initialData.lng,
        phone: whatsapp.trim() || undefined,
        whatsapp: whatsapp.trim() || undefined,
        websiteStatus: 'none',
        openingHours: hours.trim() ? [hours.trim()] : undefined,
        photos: [],
        services: parsedServices.length > 0 ? parsedServices : [
          'Atendimento Especializado',
          'Produtos e Serviços Selecionados',
          'Suporte e Agendamento Simplificado',
        ],
        opportunityScore: 'high',
        opportunityReason: 'Landing page gerada a partir do mapa',
        verifiedFields: {
          hasPhysicalLocation: true,
          hasPhone: Boolean(whatsapp),
          hasSocial: false,
          hasReviews: false,
        },
        customHeadline: slogan.trim() || undefined,
        customSubheadline: `Conheça ${name.trim()} e tenha a melhor experiência em ${currentCategoryObj.name}. Entre em contato pelo WhatsApp.`,
        customSlogan: slogan.trim() || undefined,
        customServices: parsedServices.length > 0 ? parsedServices : undefined,
        customDifferentials: parsedDiffs.length > 0 ? parsedDiffs : undefined,
      };

      setLoadingStep('Gerando textos persuasivos e seções com IA...');

      const res = await fetch('/api/landing-pages/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          business: businessPayload,
          style: selectedStyle,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Erro ao gerar landing page');
      }

      setLoadingStep('Finalizando seu site...');
      toastSuccess('Landing page gerada com sucesso!', businessPayload.name);
      onSuccess(data.project, businessPayload);
    } catch (err: any) {
      console.error('Error generating page:', err);
      toastError(err.message || 'Erro ao gerar o site. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#121215] border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-800/80 bg-zinc-900/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Criar Site para este Local</h2>
              <p className="text-xs text-zinc-400">
                Personalize as informações abaixo e geraremos uma landing page profissional instantaneamente.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleGenerate} className="p-6 space-y-5">
          {/* Nome e Ramo */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-blue-400" />
                Nome do Negócio / Estabelecimento *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Pizzaria Fornalha de Ouro"
                className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-700/80 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-blue-400" />
                Segmento / Categoria *
              </label>
              <select
                value={categoryKey}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-700/80 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {CATEGORY_OPTIONS.map((opt) => (
                  <option key={opt.key} value={opt.key}>
                    {opt.icon} {opt.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Endereço e WhatsApp */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                Endereço do Local
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Ex: Rua do Retiro, 1200 - Jundiaí, SP"
                className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-700/80 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                WhatsApp / Telefone para Contato
              </label>
              <input
                type="text"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="Ex: (11) 99876-5432"
                className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-700/80 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Slogan ou Proposta */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Slogan ou Chamada Principal (Opcional)
            </label>
            <input
              type="text"
              value={slogan}
              onChange={(e) => setSlogan(e.target.value)}
              placeholder="Ex: A verdadeira pizza artesanal no forno a lenha"
              className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-700/80 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Serviços e Diferenciais */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-indigo-400" />
                Principais Serviços / Produtos (1 por linha)
              </label>
              <textarea
                rows={3}
                value={services}
                onChange={(e) => setServices(e.target.value)}
                placeholder={"Pizzas salgadas tradicionais e especiais\nPizzas doces artesanais\nBebidas e chopp artesanal\nDelivery rápido"}
                className="w-full px-3.5 py-2 bg-zinc-900 border border-zinc-700/80 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none font-sans"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
                Diferenciais do Estabelecimento (1 por linha)
              </label>
              <textarea
                rows={3}
                value={differentials}
                onChange={(e) => setDifferentials(e.target.value)}
                placeholder={"Ambiente climatizado e acolhedor\nIngredientes frescos e importados\nEstacionamento no local\nAtendimento rápido no WhatsApp"}
                className="w-full px-3.5 py-2 bg-zinc-900 border border-zinc-700/80 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none font-sans"
              />
            </div>
          </div>

          {/* Horário */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-zinc-400" />
              Horário de Funcionamento
            </label>
            <input
              type="text"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              placeholder="Ex: Terça a Domingo das 18h às 23h30"
              className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-700/80 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Estilo Visual Recomendado */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold text-zinc-300">
                Estilo Visual & Cores Recomendadas
              </label>
              <span className="text-[11px] text-amber-400 font-medium flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Definido automaticamente pelo ramo
              </span>
            </div>

            {/* Recommendation Explanation Pill */}
            {(() => {
              const rec = CATEGORY_STYLE_RECOMMENDATIONS[categoryKey] || CATEGORY_STYLE_RECOMMENDATIONS['outros'];
              return (
                <div className="p-3 rounded-xl bg-blue-950/40 border border-blue-800/60 flex items-start gap-2.5 mb-3">
                  <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <span className="font-bold text-blue-200">{rec.tagLabel}: </span>
                    <span className="text-zinc-300">{rec.explanation}</span>
                  </div>
                </div>
              );
            })()}

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {Object.values(STYLE_PRESETS).map((st: LandingPageStyle) => {
                const rec = CATEGORY_STYLE_RECOMMENDATIONS[categoryKey] || CATEGORY_STYLE_RECOMMENDATIONS['outros'];
                const isRecommended = st.id === rec.recommendedStyleId;
                const isSelected = selectedStyleId === st.id;

                return (
                  <button
                    type="button"
                    key={st.id}
                    onClick={() => setSelectedStyleId(st.id)}
                    className={`relative p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'border-blue-500 bg-blue-500/15 shadow-lg shadow-blue-500/10 ring-1 ring-blue-500'
                        : isRecommended
                        ? 'border-amber-500/40 bg-zinc-900/80 hover:border-amber-500/80'
                        : 'border-zinc-800 bg-zinc-900/60 hover:border-zinc-700'
                    }`}
                  >
                    {isRecommended && (
                      <div className="absolute -top-2.5 right-2 px-1.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-[9px] font-extrabold text-black uppercase tracking-wide shadow flex items-center gap-0.5">
                        ⭐ Indicado
                      </div>
                    )}
                    <div className="flex items-center gap-1.5 mb-2">
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-white/20 shadow-sm"
                        style={{ backgroundColor: st.primaryColor }}
                        title={`Primária: ${st.primaryColor}`}
                      />
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-white/20 shadow-sm"
                        style={{ backgroundColor: st.accentColor }}
                        title={`Destaque: ${st.accentColor}`}
                      />
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-white/20 shadow-sm"
                        style={{ backgroundColor: st.bgColor }}
                        title={`Fundo: ${st.bgColor}`}
                      />
                    </div>
                    <div className="font-semibold text-xs text-white truncate flex items-center justify-between">
                      <span>{st.name}</span>
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />}
                    </div>
                    <div className="text-[10px] text-zinc-400 line-clamp-2 mt-0.5">{st.description}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-zinc-800/80 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-500/25 transition-all"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>{loadingStep || 'Gerando site com IA...'}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-white" />
                  <span>Gerar Site com IA</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
