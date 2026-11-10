'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { LandingPageProject, Business, CommercialPitch } from '@/types';
import { generateCommercialPitches } from '@/lib/pitch';
import { renderStandaloneHtml } from '@/lib/generator';
import {
  X,
  Smartphone,
  Monitor,
  ExternalLink,
  Download,
  Copy,
  Check,
  Send,
  MessageSquare,
  Sparkles,
  Edit3,
  RefreshCw,
  Palette,
  Eye,
  Share2,
} from 'lucide-react';

interface LandingPageEditorModalProps {
  project: LandingPageProject | null;
  business: Business;
  onClose: () => void;
  onUpdateProject: (updated: LandingPageProject) => void;
}

export default function LandingPageEditorModal(props: LandingPageEditorModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!props.project || !mounted) return null;

  return createPortal(
    <LandingPageEditorInner
      project={props.project}
      business={props.business}
      onClose={props.onClose}
      onUpdateProject={props.onUpdateProject}
    />,
    document.body
  );
}

function LandingPageEditorInner({
  project,
  business,
  onClose,
  onUpdateProject,
}: {
  project: LandingPageProject;
  business: Business;
  onClose: () => void;
  onUpdateProject: (updated: LandingPageProject) => void;
}) {
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  const [activeTab, setActiveTab] = useState<'preview' | 'edit' | 'pitch'>('preview');
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [pitchVariant, setPitchVariant] = useState<'whatsapp' | 'instagram' | 'direct' | 'formal' | 'casual'>('whatsapp');
  const [copiedPitch, setCopiedPitch] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [deployingVercel, setDeployingVercel] = useState(false);
  const [vercelDeployError, setVercelDeployError] = useState<string | null>(null);

  // Local state for live editable content
  const [content, setContent] = useState(project.content);
  const [style, setStyle] = useState(project.style);

  const previewUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/preview/${project.id}`
    : `/preview/${project.id}`;

  const pitches: CommercialPitch = generateCommercialPitches(business, previewUrl);

  // Live updated HTML
  const currentHtml = renderStandaloneHtml(content, style, business);

  function handleSaveEdits() {
    if (!project) return;
    const updated: LandingPageProject = {
      id: project.id,
      businessId: project.businessId,
      businessName: project.businessName,
      category: project.category,
      createdAt: project.createdAt,
      status: project.status,
      content,
      style,
      htmlContent: currentHtml,
      updatedAt: new Date().toISOString(),
    };
    onUpdateProject(updated);
  }

  function handleCopy(text: string, isPitch = false) {
    navigator.clipboard.writeText(text);
    if (isPitch) {
      setCopiedPitch(true);
      setTimeout(() => setCopiedPitch(false), 2000);
    } else {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  }

  async function handleDeployToVercel() {
    if (!project) return;
    try {
      setDeployingVercel(true);
      setVercelDeployError(null);

      const res = await fetch('/api/vercel/deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: project.id,
          htmlContent: currentHtml,
        }),
      });

      const data = await res.json();
      if (data.success && data.url) {
        const updated: LandingPageProject = {
          ...project,
          vercelUrl: data.url,
          status: 'ready',
          updatedAt: new Date().toISOString(),
        };
        onUpdateProject(updated);
      } else {
        setVercelDeployError(data.error || 'Falha ao publicar na Vercel.');
      }
    } catch (err: any) {
      setVercelDeployError(err.message || 'Erro ao conectar à API de deploy.');
    } finally {
      setDeployingVercel(false);
    }
  }

  const selectedPitchText =
    pitchVariant === 'whatsapp'
      ? pitches.whatsappMessage
      : pitchVariant === 'instagram'
      ? pitches.instagramMessage
      : pitchVariant === 'direct'
      ? pitches.directMessage
      : pitchVariant === 'formal'
      ? pitches.formalMessage
      : pitches.casualMessage;

  const cleanPhone = (business.whatsapp || business.phone || '').replace(/\D/g, '');
  const directWaOutreachUrl = cleanPhone
    ? `https://wa.me/${cleanPhone.startsWith('55') ? cleanPhone : '55' + cleanPhone}?text=${encodeURIComponent(
        selectedPitchText
      )}`
    : null;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-2 md:p-4 bg-black/85 backdrop-blur-md">
      <div
        className="relative w-full max-w-7xl h-[95vh] flex flex-col bg-[#0e0e11] border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden text-zinc-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-800 bg-[#121215]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-sm text-white flex items-center gap-2">
                <span>{project.businessName}</span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 font-normal">
                  {style.name}
                </span>
              </div>
              <div className="text-[11px] text-zinc-400">
                Landing Page Gerada & Pronta para Apresentação
              </div>
            </div>
          </div>

          {/* Mode Tabs (Preview / Edit / Approach Message) */}
          <div className="flex items-center gap-1 bg-zinc-900 p-1 rounded-xl border border-zinc-800">
            <button
              onClick={() => setActiveTab('preview')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'preview'
                  ? 'bg-zinc-800 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Preview</span>
            </button>

            <button
              onClick={() => setActiveTab('edit')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'edit'
                  ? 'bg-zinc-800 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Editor & Textos</span>
            </button>

            <button
              onClick={() => setActiveTab('pitch')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'pitch'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Mensagem Comercial</span>
            </button>
          </div>

          {/* Top Right Quick Actions */}
          <div className="flex items-center gap-2">
            {project.vercelUrl ? (
              <a
                href={project.vercelUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-400 text-xs font-semibold transition-colors"
                title="Abrir página publicada na Vercel"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 1155 1000">
                  <path d="m577.3 0 577.4 1000H0z" />
                </svg>
                <span>No ar na Vercel</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            ) : (
              <button
                type="button"
                onClick={handleDeployToVercel}
                disabled={deployingVercel}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-zinc-200 text-black text-xs font-bold transition-all shadow-sm disabled:opacity-50"
                title="Publicar na sua conta da Vercel"
              >
                {deployingVercel ? (
                  <div className="w-3.5 h-3.5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                ) : (
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 1155 1000">
                    <path d="m577.3 0 577.4 1000H0z" />
                  </svg>
                )}
                <span>{deployingVercel ? 'Publicando...' : 'Publicar na Vercel'}</span>
              </button>
            )}

            <button
              onClick={() => handleCopy(previewUrl)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white text-xs font-medium transition-colors"
              title="Copiar Link da Demonstração"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedLink ? 'Copiado!' : 'Copiar Link'}</span>
            </button>

            <a
              href={`/api/export/${project.id}`}
              download
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white text-xs font-medium transition-colors"
              title="Baixar ZIP completo do projeto"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Baixar ZIP</span>
            </a>

            <a
              href={previewUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-300 text-xs font-medium transition-colors"
              title="Abrir em Nova Aba"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Nova Aba</span>
            </a>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {vercelDeployError && (
          <div className="px-5 py-2.5 bg-rose-950/40 border-b border-rose-800/40 text-rose-300 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-bold">Aviso Vercel:</span>
              <span>{vercelDeployError}</span>
            </div>
            <a
              href="/configuracoes"
              target="_blank"
              className="underline hover:text-white font-medium ml-2"
            >
              Configurar Minha Vercel
            </a>
          </div>
        )}

        {/* Modal Main Body */}
        <div className="flex-1 flex overflow-hidden">
          {/* TAB 1: PREVIEW */}
          {activeTab === 'preview' && (
            <div className="flex-1 flex flex-col bg-[#09090b]">
              {/* Responsive Switcher Bar */}
              <div className="flex items-center justify-between px-6 py-2 border-b border-zinc-800 bg-[#0c0c0e]">
                <div className="text-xs text-zinc-400">
                  Modo de Exibição Responsivo
                </div>

                <div className="flex items-center gap-1 bg-zinc-900 p-1 rounded-lg border border-zinc-800">
                  <button
                    onClick={() => setViewMode('desktop')}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium transition-colors ${
                      viewMode === 'desktop'
                        ? 'bg-zinc-800 text-white shadow-sm'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <Monitor className="w-3.5 h-3.5" />
                    <span>Desktop</span>
                  </button>
                  <button
                    onClick={() => setViewMode('mobile')}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium transition-colors ${
                      viewMode === 'mobile'
                        ? 'bg-zinc-800 text-white shadow-sm'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>Mobile (390px)</span>
                  </button>
                </div>

                <div className="text-xs text-zinc-400">
                  {viewMode === 'desktop' ? '100% Fluido' : 'Simulador iPhone / Android'}
                </div>
              </div>

              {/* Iframe Container */}
              <div className="flex-1 flex items-center justify-center p-4 overflow-hidden bg-[#050507]">
                <div
                  className={`h-full transition-all duration-300 rounded-xl overflow-hidden border border-zinc-800 shadow-2xl bg-white ${
                    viewMode === 'mobile' ? 'w-[390px] max-w-full' : 'w-full'
                  }`}
                >
                  <iframe
                    title="Landing Page Preview"
                    srcDoc={currentHtml}
                    className="w-full h-full border-0"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: LIVE TEXT & CONTENT EDITOR */}
          {activeTab === 'edit' && (
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-[#0c0c0e]">
              {/* Form Controls Column */}
              <div className="w-full md:w-1/2 p-6 overflow-y-auto space-y-6 border-r border-zinc-800">
                <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                  <h3 className="font-bold text-base text-white">Editar Seções & Conteúdo</h3>
                  <button
                    onClick={handleSaveEdits}
                    className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md transition-colors"
                  >
                    Salvar Alterações
                  </button>
                </div>

                {/* Hero Section Editing */}
                <div className="space-y-3">
                  <div className="text-xs font-bold uppercase tracking-wider text-blue-400">
                    Seção Principal (Hero)
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1">Título Principal (Headline)</label>
                    <input
                      type="text"
                      value={content.hero.headline}
                      onChange={(e) =>
                        setContent({
                          ...content,
                          hero: { ...content.hero, headline: e.target.value },
                        })
                      }
                      className="w-full text-xs bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-zinc-100"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1">Subtítulo Comercial</label>
                    <textarea
                      rows={2}
                      value={content.hero.subheadline}
                      onChange={(e) =>
                        setContent({
                          ...content,
                          hero: { ...content.hero, subheadline: e.target.value },
                        })
                      }
                      className="w-full text-xs bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-zinc-100"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-zinc-400 mb-1">Texto do Botão (CTA)</label>
                      <input
                        type="text"
                        value={content.hero.ctaText}
                        onChange={(e) =>
                          setContent({
                            ...content,
                            hero: { ...content.hero, ctaText: e.target.value },
                          })
                        }
                        className="w-full text-xs bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-zinc-100"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-zinc-400 mb-1">Badge de Destaque</label>
                      <input
                        type="text"
                        value={content.hero.badge || ''}
                        onChange={(e) =>
                          setContent({
                            ...content,
                            hero: { ...content.hero, badge: e.target.value },
                          })
                        }
                        className="w-full text-xs bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-zinc-100"
                      />
                    </div>
                  </div>
                </div>

                {/* About Section Editing */}
                <div className="space-y-3 pt-4 border-t border-zinc-800/80">
                  <div className="text-xs font-bold uppercase tracking-wider text-blue-400">
                    Seção Sobre Nós
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1">Título da Seção</label>
                    <input
                      type="text"
                      value={content.about.title}
                      onChange={(e) =>
                        setContent({
                          ...content,
                          about: { ...content.about, title: e.target.value },
                        })
                      }
                      className="w-full text-xs bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-zinc-100"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1">História / Apresentação</label>
                    <textarea
                      rows={3}
                      value={content.about.story}
                      onChange={(e) =>
                        setContent({
                          ...content,
                          about: { ...content.about, story: e.target.value },
                        })
                      }
                      className="w-full text-xs bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-zinc-100"
                    />
                  </div>
                </div>

                {/* Services Editing */}
                <div className="space-y-3 pt-4 border-t border-zinc-800/80">
                  <div className="text-xs font-bold uppercase tracking-wider text-blue-400">
                    Serviços & Procedimentos
                  </div>
                  {content.services.items.map((svc, idx) => (
                    <div key={idx} className="p-3 bg-zinc-900/60 rounded-lg border border-zinc-800 space-y-2">
                      <input
                        type="text"
                        value={svc.title}
                        onChange={(e) => {
                          const items = [...content.services.items];
                          items[idx].title = e.target.value;
                          setContent({ ...content, services: { ...content.services, items } });
                        }}
                        className="w-full text-xs font-bold bg-zinc-900 border border-zinc-800 rounded p-1.5 text-zinc-100"
                      />
                      <textarea
                        rows={2}
                        value={svc.description}
                        onChange={(e) => {
                          const items = [...content.services.items];
                          items[idx].description = e.target.value;
                          setContent({ ...content, services: { ...content.services, items } });
                        }}
                        className="w-full text-xs bg-zinc-900 border border-zinc-800 rounded p-1.5 text-zinc-300"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Side Live Mini-Preview */}
              <div className="hidden md:flex flex-1 p-4 bg-[#050507] items-center justify-center overflow-hidden">
                <div className="w-full h-full rounded-xl overflow-hidden border border-zinc-800 shadow-2xl bg-white">
                  <iframe
                    title="Live Edit Preview"
                    srcDoc={currentHtml}
                    className="w-full h-full border-0"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: COMMERCIAL APPROACH MESSAGE GENERATOR */}
          {activeTab === 'pitch' && (
            <div className="flex-1 p-6 md:p-8 overflow-y-auto bg-[#0a0a0c]">
              <div className="max-w-3xl mx-auto">
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Abordagem Comercial Pronta
                    </span>
                    <span className="text-xs text-zinc-400">
                      Personalizada para <strong>{business.name}</strong>
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold tracking-tight text-white">
                    Mensagem de Contato Estratégico
                  </h3>
                  <p className="text-sm text-zinc-400 mt-1">
                    Esta mensagem foi gerada com base nos dados reais do estabelecimento, explicando com clareza o benefício da landing page sem parecer spam.
                  </p>
                </div>

                {/* Pitch Variants Selector */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {[
                    { id: 'whatsapp', label: 'WhatsApp', icon: MessageSquare },
                    { id: 'instagram', label: 'Instagram DM', icon: Send },
                    { id: 'direct', label: 'Direta e Objetiva', icon: Sparkles },
                    { id: 'formal', label: 'Profissional / Corporativa', icon: Share2 },
                    { id: 'casual', label: 'Descontraída e Amigável', icon: RefreshCw },
                  ].map((variant) => {
                    const isSelected = pitchVariant === variant.id;
                    const Icon = variant.icon;

                    return (
                      <button
                        key={variant.id}
                        onClick={() => setPitchVariant(variant.id as any)}
                        className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
                          isSelected
                            ? 'bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-600/20'
                            : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white hover:border-zinc-700'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span>{variant.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Message Box */}
                <div className="relative p-6 rounded-2xl bg-[#121215] border border-zinc-800 shadow-xl mb-6">
                  <div className="flex items-center justify-between pb-3 mb-4 border-b border-zinc-800/80">
                    <div className="text-xs font-semibold text-zinc-400 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                      Texto pronto para envio manual
                    </div>
                    <button
                      onClick={() => handleCopy(selectedPitchText, true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-200 transition-colors"
                    >
                      {copiedPitch ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Copiado!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copiar Texto</span>
                        </>
                      )}
                    </button>
                  </div>

                  <pre className="whitespace-pre-wrap font-sans text-sm text-zinc-200 leading-relaxed">
                    {selectedPitchText}
                  </pre>
                </div>

                {/* Action Buttons: Direct WhatsApp opening */}
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  {directWaOutreachUrl ? (
                    <a
                      href={directWaOutreachUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm shadow-lg shadow-emerald-600/20 transition-all hover:scale-[1.01]"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>Abrir conversa no WhatsApp ({business.whatsapp || business.phone})</span>
                    </a>
                  ) : (
                    <div className="w-full sm:w-auto flex-1 p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-400 text-center">
                      Número de WhatsApp direto não confirmado. Copie o texto e envie pelas redes sociais ou direct do estabelecimento.
                    </div>
                  )}

                  <button
                    onClick={() => handleCopy(previewUrl)}
                    className="w-full sm:w-auto px-5 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-semibold text-sm border border-zinc-800 transition-colors"
                  >
                    Copiar Apenas o Link da Demo
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
