'use client';

import { useState, useEffect } from 'react';
import { Business, LandingPageProject, LandingPageStyle, StylePresetId, ReferenceMode, SiteReferenceInput } from '@/types';
import { STYLE_PRESETS } from '@/lib/constants';
import {
  Sparkles,
  MapPin,
  Phone,
  Building2,
  Tag,
  Clock,
  FileText,
  CheckCircle2,
  X,
  Loader2,
  Link2,
  Image as ImageIcon,
  LayoutTemplate,
  Upload,
  Trash2,
  Palette,
  Search,
} from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { extractColorsFromImageSrc, ExtractedBrandColors } from '@/lib/colorExtractor';

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

  // Inspiration reference options (by URL link or by photo/screenshot)
  const [refMode, setRefMode] = useState<ReferenceMode>('system_template');
  const [refUrl, setRefUrl] = useState('');
  const [refImage, setRefImage] = useState<string>('');
  const [refImageName, setRefImageName] = useState<string>('');

  // Logo & Brand Identity States
  const [logoUrl, setLogoUrl] = useState<string>('');
  const [logoSource, setLogoSource] = useState<'auto' | 'upload' | 'url' | null>(null);
  const [searchingLogo, setSearchingLogo] = useState(false);
  const [extractingColors, setExtractingColors] = useState(false);
  const [logoColors, setLogoColors] = useState<ExtractedBrandColors | null>(null);
  const [applyLogoColors, setApplyLogoColors] = useState(true);
  const [customPrimaryColor, setCustomPrimaryColor] = useState<string>('');
  const [customAccentColor, setCustomAccentColor] = useState<string>('');
  const [showLogoUrlInput, setShowLogoUrlInput] = useState(false);
  const [logoUrlInputValue, setLogoUrlInputValue] = useState('');

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

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) {
      toastError('A imagem deve ter no máximo 4MB.');
      return;
    }
    setRefImageName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      setRefImage(reader.result as string);
      toastSuccess('Foto/print de referência adicionada com sucesso!');
    };
    reader.readAsDataURL(file);
  }

  async function handleProcessLogo(url: string, source: 'auto' | 'upload' | 'url') {
    setLogoUrl(url);
    setLogoSource(source);
    setExtractingColors(true);
    try {
      const colors = await extractColorsFromImageSrc(url);
      setLogoColors(colors);
      setCustomPrimaryColor(colors.primary);
      setCustomAccentColor(colors.accent);
      toastSuccess('Logotipo e paleta de cores carregados!');
    } catch (err) {
      console.warn('Erro ao extrair cores da logo:', err);
    } finally {
      setExtractingColors(false);
    }
  }

  async function handleAutoSearchLogo() {
    if (!name.trim()) {
      toastError('Informe o nome do estabelecimento antes de buscar o logo.');
      return;
    }
    try {
      setSearchingLogo(true);
      const res = await fetch(
        `/api/logo/search?name=${encodeURIComponent(name.trim())}&city=${encodeURIComponent(initialData.city || '')}`
      );
      const data = await res.json();
      if (data.success && data.logoUrl) {
        toastSuccess('Logotipo oficial encontrado!');
        await handleProcessLogo(data.logoUrl, 'auto');
      } else {
        toastError(data.message || 'Logotipo não encontrado na busca web. Você pode fazer o upload da imagem.');
      }
    } catch (err: any) {
      toastError('Erro ao buscar logotipo. Tente fazer o upload do arquivo.');
    } finally {
      setSearchingLogo(false);
    }
  }

  function handleLogoFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toastError('O logotipo deve ter no máximo 5MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      handleProcessLogo(dataUrl, 'upload');
    };
    reader.readAsDataURL(file);
  }

  function handleManualLogoSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!logoUrlInputValue.trim()) return;
    handleProcessLogo(logoUrlInputValue.trim(), 'url');
    setShowLogoUrlInput(false);
  }

  function handleRemoveLogo() {
    setLogoUrl('');
    setLogoSource(null);
    setLogoColors(null);
    setCustomPrimaryColor('');
    setCustomAccentColor('');
    toastSuccess('Logotipo removido.');
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

      let effectiveStyle = selectedStyle;
      if (applyLogoColors && customPrimaryColor) {
        effectiveStyle = {
          ...selectedStyle,
          primaryColor: customPrimaryColor,
          accentColor: customAccentColor || selectedStyle.accentColor,
          isLogoCustomized: true,
          logoPalette: {
            primary: customPrimaryColor,
            accent: customAccentColor || selectedStyle.accentColor,
          },
        };
      }

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
        logoUrl: logoUrl.trim() || undefined,
      };

      const referencePayload: SiteReferenceInput = {
        mode: refMode,
        url: refMode === 'url' ? refUrl.trim() || undefined : undefined,
        image: refMode === 'image' ? refImage || undefined : undefined,
      };

      setLoadingStep('Gerando textos persuasivos e seções com IA...');

      const res = await fetch('/api/landing-pages/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          business: businessPayload,
          style: effectiveStyle,
          reference: referencePayload,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#121215] border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden my-2 sm:my-6 max-h-[94vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-zinc-800/80 bg-zinc-900/40 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">Criar Site para este Local</h2>
              <p className="text-[11px] sm:text-xs text-zinc-400">
                Personalize as informações ou use um site de inspiração para gerar uma landing page exclusiva.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body with Smooth Mobile Scrolling */}
        <form onSubmit={handleGenerate} className="p-4 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto flex-1">
          {/* Nome e Ramo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                Endereço do Local
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Ex: Rua Central, 1200 - Centro"
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-indigo-400" />
                Principais Serviços / Produtos (1 por linha)
              </label>
              <textarea
                rows={3}
                value={services}
                onChange={(e) => setServices(e.target.value)}
                placeholder={"Opção especial da casa\nAtendimento personalizado\nEntrega rápida e com qualidade"}
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
                placeholder={"Ambiente climatizado e acolhedor\nIngredientes frescos e de qualidade\nAtendimento rápido no WhatsApp"}
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

          {/* Logotipo & Identidade Visual */}
          <div className="p-3.5 sm:p-4 rounded-xl bg-gradient-to-b from-purple-950/20 to-zinc-900/60 border border-purple-500/20 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
                  <Palette className="w-3.5 h-3.5" />
                </div>
                <div>
                  <label className="text-xs font-bold text-white flex items-center gap-1.5">
                    Logotipo & Cores da Marca
                    <span className="text-[10px] font-normal text-purple-300 bg-purple-500/20 px-2 py-0.5 rounded-full border border-purple-500/30">
                      Novo
                    </span>
                  </label>
                  <p className="text-[11px] text-zinc-400">
                    O sistema busca a logo na web ou você pode enviar a imagem para pintar o site.
                  </p>
                </div>
              </div>
              {logoUrl && (
                <button
                  type="button"
                  onClick={handleRemoveLogo}
                  className="text-[11px] text-rose-400 hover:text-rose-300 flex items-center gap-1 transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                  Remover
                </button>
              )}
            </div>

            {/* Actions: Auto-search, File upload, or Direct URL */}
            {!logoUrl ? (
              <div className="space-y-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={handleAutoSearchLogo}
                    disabled={searchingLogo || !name.trim()}
                    className="flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/40 text-purple-200 text-xs font-semibold transition-all disabled:opacity-50"
                  >
                    {searchingLogo ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-400" />
                        <span>Buscando na Web...</span>
                      </>
                    ) : (
                      <>
                        <Search className="w-3.5 h-3.5 text-purple-400" />
                        <span>Buscar Logo Automaticamente</span>
                      </>
                    )}
                  </button>

                  <label className="flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs font-semibold transition-all cursor-pointer">
                    <Upload className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Fazer Upload (PNG, JPG, SVG)</span>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/svg+xml,image/webp"
                      onChange={handleLogoFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Option to paste URL */}
                {!showLogoUrlInput ? (
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => setShowLogoUrlInput(true)}
                      className="text-[11px] text-zinc-400 hover:text-zinc-300 underline"
                    >
                      Ou cole o link direto da imagem
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={logoUrlInputValue}
                      onChange={(e) => setLogoUrlInputValue(e.target.value)}
                      placeholder="https://exemplo.com/logo.png"
                      className="flex-1 px-3 py-1.5 bg-zinc-900 border border-zinc-700 rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                    <button
                      type="button"
                      onClick={handleManualLogoSubmit}
                      className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold rounded-lg"
                    >
                      Carregar
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowLogoUrlInput(false)}
                      className="px-2 py-1.5 text-zinc-400 hover:text-white text-xs"
                    >
                      Cancelar
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* Logo Loaded Preview & Extracted Palette */
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-zinc-900/90 border border-zinc-800">
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-14 rounded-lg bg-[radial-gradient(#444_1px,transparent_1px)] [background-size:8px_8px] border border-zinc-700/80 flex items-center justify-center p-1.5 shrink-0 overflow-hidden">
                      <img
                        src={logoUrl}
                        alt="Preview Logotipo"
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                        Logotipo Ativo
                        {logoSource === 'auto' && (
                          <span className="text-[10px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded font-normal">
                            Auto
                          </span>
                        )}
                        {logoSource === 'upload' && (
                          <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded font-normal">
                            Arquivo
                          </span>
                        )}
                        {logoSource === 'url' && (
                          <span className="text-[10px] bg-purple-500/20 text-purple-400 px-1.5 py-0.5 rounded font-normal">
                            Link
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-zinc-400">
                        {extractingColors ? 'Detectando cores...' : 'Cores da marca extraídas'}
                      </div>
                    </div>
                  </div>

                  {/* Extracted Colors Pickers */}
                  <div className="flex items-center gap-3 border-t sm:border-t-0 sm:border-l border-zinc-800 pt-2 sm:pt-0 sm:pl-3">
                    <div>
                      <div className="text-[10px] text-zinc-400 mb-1 font-medium">Primária</div>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="color"
                          value={customPrimaryColor || '#1d4ed8'}
                          onChange={(e) => setCustomPrimaryColor(e.target.value)}
                          className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
                        />
                        <span className="text-[11px] font-mono text-zinc-200 uppercase">
                          {customPrimaryColor || '#1d4ed8'}
                        </span>
                      </div>
                    </div>

                    <div>
                      <div className="text-[10px] text-zinc-400 mb-1 font-medium">Destaque</div>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="color"
                          value={customAccentColor || '#f59e0b'}
                          onChange={(e) => setCustomAccentColor(e.target.value)}
                          className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
                        />
                        <span className="text-[11px] font-mono text-zinc-200 uppercase">
                          {customAccentColor || '#f59e0b'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Toggle Apply Logo Colors */}
                <label className="flex items-center gap-2 cursor-pointer text-xs text-zinc-300">
                  <input
                    type="checkbox"
                    checked={applyLogoColors}
                    onChange={(e) => setApplyLogoColors(e.target.checked)}
                    className="rounded border-zinc-700 bg-zinc-900 text-purple-600 focus:ring-purple-500"
                  />
                  <span>
                    Aplicar cores da logo automaticamente ao site{' '}
                    <strong className="text-purple-300 font-semibold">(Recomendado)</strong>
                  </span>
                </label>
              </div>
            )}
          </div>

          {/* Estilo Visual Recomendado */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold text-zinc-300">
                Estilo Visual & Cores Recomendadas
              </label>
              <span className="text-[11px] text-amber-400 font-medium flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Recomendação automática pelo ramo
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

            {applyLogoColors && customPrimaryColor && (
              <div className="p-2.5 rounded-xl bg-purple-950/40 border border-purple-800/60 flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2 text-xs text-purple-200">
                  <Palette className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                  <span>
                    Paleta da logo sincronizada:{' '}
                    <strong style={{ color: customPrimaryColor }}>Primária</strong> e{' '}
                    <strong style={{ color: customAccentColor || '#f59e0b' }}>Destaque</strong>
                  </span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span
                    className="w-4 h-4 rounded-full border border-white/30 shadow"
                    style={{ backgroundColor: customPrimaryColor }}
                  />
                  {customAccentColor && (
                    <span
                      className="w-4 h-4 rounded-full border border-white/30 shadow"
                      style={{ backgroundColor: customAccentColor }}
                    />
                  )}
                </div>
              </div>
            )}

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

          {/* Modelo de Inspiração / Referência de Site */}
          <div className="pt-3 border-t border-zinc-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-zinc-200 flex items-center gap-1.5">
                <LayoutTemplate className="w-3.5 h-3.5 text-blue-400" />
                Modelo ou Inspiração de Site (Opcional)
              </label>
              <span className="text-[11px] text-zinc-400">Seguir link ou foto</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setRefMode('system_template')}
                className={`p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition-all ${
                  refMode === 'system_template'
                    ? 'border-blue-500 bg-blue-500/15 text-white ring-1 ring-blue-500'
                    : 'border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-white'
                }`}
              >
                <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-semibold truncate">Modelo do Sistema</div>
                  <div className="text-[10px] text-zinc-500 truncate">Exclusivo do ramo</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setRefMode('url')}
                className={`p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition-all ${
                  refMode === 'url'
                    ? 'border-blue-500 bg-blue-500/15 text-white ring-1 ring-blue-500'
                    : 'border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-white'
                }`}
              >
                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <Link2 className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-semibold truncate">Seguir Link (URL)</div>
                  <div className="text-[10px] text-zinc-500 truncate">Inspirar em site</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setRefMode('image')}
                className={`p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition-all ${
                  refMode === 'image'
                    ? 'border-blue-500 bg-blue-500/15 text-white ring-1 ring-blue-500'
                    : 'border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-white'
                }`}
              >
                <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
                  <ImageIcon className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-semibold truncate">Seguir Foto / Print</div>
                  <div className="text-[10px] text-zinc-500 truncate">Subir screenshot</div>
                </div>
              </button>
            </div>

            {refMode === 'url' && (
              <div className="p-3 bg-zinc-900/90 border border-zinc-700/80 rounded-xl space-y-2 animate-in fade-in duration-200">
                <label className="text-xs font-semibold text-zinc-300 block">
                  Link (URL) do Site que Você Quer Seguir como Modelo
                </label>
                <div className="relative">
                  <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
                  <input
                    type="url"
                    value={refUrl}
                    onChange={(e) => setRefUrl(e.target.value)}
                    placeholder="Ex: https://site-exemplo.com.br"
                    className="w-full pl-9 pr-3 py-2 bg-zinc-950 border border-zinc-700 rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <p className="text-[11px] text-zinc-400">
                  A IA analisa as chamadas, seções e proposta do site indicado para estruturar a página do estabelecimento.
                </p>
              </div>
            )}

            {refMode === 'image' && (
              <div className="p-3 bg-zinc-900/90 border border-zinc-700/80 rounded-xl space-y-2.5 animate-in fade-in duration-200">
                <label className="text-xs font-semibold text-zinc-300 block">
                  Print / Foto da Landing Page Modelo
                </label>
                {refImage ? (
                  <div className="flex items-center justify-between p-2.5 bg-zinc-950 border border-zinc-700 rounded-lg">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img src={refImage} alt="Referência" className="w-10 h-10 object-cover rounded border border-zinc-700 shrink-0" />
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-white truncate">{refImageName || 'Print modelo carregado'}</div>
                        <div className="text-[10px] text-emerald-400">Pronto para inspirar a IA</div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setRefImage('');
                        setRefImageName('');
                      }}
                      className="p-1.5 text-zinc-400 hover:text-red-400 rounded-lg transition-colors shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-zinc-700 rounded-xl hover:border-blue-500 cursor-pointer transition-colors bg-zinc-950/60">
                    <Upload className="w-5 h-5 text-zinc-400 mb-1" />
                    <span className="text-xs font-semibold text-zinc-300">Clique para enviar o print/screenshot</span>
                    <span className="text-[10px] text-zinc-500">PNG, JPG ou WEBP até 4MB</span>
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                )}
                <p className="text-[11px] text-zinc-400">
                  A IA se inspira no layout visual e diagramação da imagem enviada para montar o site.
                </p>
              </div>
            )}
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
