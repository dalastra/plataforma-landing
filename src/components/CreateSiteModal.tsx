'use client';

import { useState } from 'react';
import { Business, LandingPageProject, LandingPageStyle, StylePresetId } from '@/types';
import { STYLE_PRESETS } from '@/lib/constants';
import { Sparkles, MapPin, Phone, Building2, Tag, Clock, FileText, CheckCircle2, X, Loader2 } from 'lucide-react';

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

export default function CreateSiteModal({
  isOpen,
  onClose,
  initialData,
  onSuccess,
}: CreateSiteModalProps) {
  if (!isOpen) return null;

  const [name, setName] = useState(initialData.name || '');
  const [categoryKey, setCategoryKey] = useState(initialData.categoryKey || 'pizzaria');
  const [address, setAddress] = useState(initialData.address || '');
  const [whatsapp, setWhatsapp] = useState(initialData.whatsapp || initialData.phone || '');
  const [slogan, setSlogan] = useState('');
  const [services, setServices] = useState('');
  const [differentials, setDifferentials] = useState('');
  const [hours, setHours] = useState('Segunda a Sábado das 09h às 19h');
  const [selectedStyleId, setSelectedStyleId] = useState<StylePresetId>('modern-minimalist');
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');

  const currentCategoryObj = CATEGORY_OPTIONS.find((c) => c.key === categoryKey) || CATEGORY_OPTIONS[0];

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      alert('Por favor, informe o nome do negócio.');
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
      onSuccess(data.project, businessPayload);
    } catch (err: any) {
      console.error('Error generating page:', err);
      alert(err.message || 'Erro ao gerar o site. Tente novamente.');
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
                onChange={(e) => setCategoryKey(e.target.value)}
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

          {/* Estilo Visual */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-2">
              Estilo Visual & Cores do Site
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {Object.values(STYLE_PRESETS).slice(0, 4).map((st: LandingPageStyle) => (
                <button
                  type="button"
                  key={st.id}
                  onClick={() => setSelectedStyleId(st.id)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    selectedStyleId === st.id
                      ? 'border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/10'
                      : 'border-zinc-800 bg-zinc-900/60 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: st.primaryColor }} />
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: st.accentColor }} />
                  </div>
                  <div className="font-semibold text-xs text-white truncate">{st.name}</div>
                  <div className="text-[10px] text-zinc-400 truncate">{st.description}</div>
                </button>
              ))}
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
