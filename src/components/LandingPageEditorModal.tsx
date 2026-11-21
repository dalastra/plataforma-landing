'use client';

import { useState, useEffect, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { LandingPageProject, Business, CommercialPitch, StylePresetId, HeroLayoutType, CardStyleType } from '@/types';
import { generateCommercialPitches } from '@/lib/pitch';
import { renderStandaloneHtml } from '@/lib/generator';
import { STYLE_PRESETS } from '@/lib/constants';
import { useToast } from '@/context/ToastContext';
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
  Upload,
  Trash2,
  Search,
  Loader2,
} from 'lucide-react';
import { extractColorsFromImageSrc } from '@/lib/colorExtractor';

interface LandingPageEditorModalProps {
  project: LandingPageProject | null;
  business: Business;
  onClose: () => void;
  onUpdateProject: (updated: LandingPageProject) => void;
}

const emptySubscribe = () => () => {};

export default function LandingPageEditorModal(props: LandingPageEditorModalProps) {
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

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
  const { success: toastSuccess, error: toastError } = useToast();

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  const [activeTab, setActiveTab] = useState<'preview' | 'edit' | 'style' | 'pitch'>('preview');
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [pitchVariant, setPitchVariant] = useState<'whatsapp' | 'instagram' | 'direct' | 'formal' | 'casual'>('whatsapp');
  const [copiedPitch, setCopiedPitch] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [deployingVercel, setDeployingVercel] = useState(false);
  const [vercelDeployError, setVercelDeployError] = useState<string | null>(null);

  // Custom Domain State
  const [showDomainModal, setShowDomainModal] = useState(false);
  const [domainInput, setDomainInput] = useState(project.customDomain || '');
  const [domainLoading, setDomainLoading] = useState(false);
  const [domainFeedback, setDomainFeedback] = useState<{ ok: boolean; msg: string; dns?: any } | null>(null);

  // Visual Inline Edit Mode
  const [inlineEditActive, setInlineEditActive] = useState(false);

  // Local state for live editable content
  const [content, setContent] = useState(project.content);
  const [style, setStyle] = useState(project.style);
  const [searchingLogo, setSearchingLogo] = useState(false);
  const [extractingColors, setExtractingColors] = useState(false);

  const previewUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/preview/${project.id}`
    : `/preview/${project.id}`;

  const pitches: CommercialPitch = generateCommercialPitches(business, previewUrl);

  // Live updated HTML
  const currentHtml = renderStandaloneHtml(content, style, business);

  async function handleEditorLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      setExtractingColors(true);
      try {
        const colors = await extractColorsFromImageSrc(dataUrl);
        setContent((prev) => ({ ...prev, logoUrl: dataUrl }));
        setStyle((prev) => ({
          ...prev,
          primaryColor: colors.primary,
          accentColor: colors.accent,
          isLogoCustomized: true,
          logoPalette: {
            primary: colors.primary,
            accent: colors.accent,
          },
        }));
        toastSuccess('Logotipo atualizado e cores extraídas!');
      } catch (err) {
        console.warn('Erro ao extrair cores:', err);
      } finally {
        setExtractingColors(false);
      }
    };
    reader.readAsDataURL(file);
  }

  async function handleEditorAutoSearchLogo() {
    try {
      setSearchingLogo(true);
      const res = await fetch(
        `/api/logo/search?name=${encodeURIComponent(business.name)}&city=${encodeURIComponent(business.city || '')}`
      );
      const data = await res.json();
      if (data.success && data.logoUrl) {
        setExtractingColors(true);
        const colors = await extractColorsFromImageSrc(data.logoUrl);
        setContent((prev) => ({ ...prev, logoUrl: data.logoUrl }));
        setStyle((prev) => ({
          ...prev,
          primaryColor: colors.primary,
          accentColor: colors.accent,
          isLogoCustomized: true,
          logoPalette: {
            primary: colors.primary,
            accent: colors.accent,
          },
        }));
        toastSuccess('Logotipo oficial encontrado e cores sincronizadas!');
      } else {
        toastError('Nenhum logotipo encontrado automaticamente na busca.');
      }
    } catch {
      toastError('Erro ao buscar logotipo.');
    } finally {
      setSearchingLogo(false);
      setExtractingColors(false);
    }
  }

  function handleEditorRemoveLogo() {
    setContent((prev) => ({ ...prev, logoUrl: undefined }));
    toastSuccess('Logotipo removido.');
  }

  async function handleSaveEdits() {
    if (!project) return;
    const updated: LandingPageProject = {
      ...project,
      id: project.id,
      businessId: project.businessId,
      businessName: project.businessName,
      category: project.category,
      createdAt: project.createdAt,
      status: project.status,
      content,
      style,
      logoUrl: content.logoUrl,
      htmlContent: currentHtml,
      updatedAt: new Date().toISOString(),
    };
    onUpdateProject(updated);
    try {
      await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
      toastSuccess('Alterações salvas e sincronizadas!');
    } catch (err) {
      console.warn('Erro ao sincronizar projeto na nuvem:', err);
      toastSuccess('Alterações salvas na sessão.');
    }
  }

  function handleCopy(text: string, isPitch = false) {
    navigator.clipboard.writeText(text);
    if (isPitch) {
      setCopiedPitch(true);
      setTimeout(() => setCopiedPitch(false), 2000);
      toastSuccess('Mensagem de abordagem copiada!');
    } else {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
      toastSuccess('Link da demonstração copiado!');
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

  async function handleConnectDomain(e: React.FormEvent) {
    e.preventDefault();
    if (!domainInput.trim()) return;
    try {
      setDomainLoading(true);
      setDomainFeedback(null);
      const res = await fetch('/api/vercel/domains', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: project.id,
          domainName: domainInput.trim(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setDomainFeedback({
          ok: true,
          msg: data.message,
          dns: data.dnsRecords,
        });
        const updated = {
          ...project,
          customDomain: data.domain,
        };
        onUpdateProject(updated);
      } else {
        setDomainFeedback({ ok: false, msg: data.error || 'Erro ao registrar domínio.' });
      }
    } catch (err: any) {
      setDomainFeedback({ ok: false, msg: err.message || 'Erro de comunicação.' });
    } finally {
      setDomainLoading(false);
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
              onClick={() => setActiveTab('style')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'style'
                  ? 'bg-zinc-800 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Palette className="w-3.5 h-3.5" />
              <span>Design & Estilo</span>
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
              <>
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

                <button
                  type="button"
                  onClick={() => setShowDomainModal(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs font-semibold transition-colors"
                  title="Vincular domínio próprio (ex: www.cliente.com.br)"
                >
                  <span>🌐</span>
                  <span>{project.customDomain ? project.customDomain : 'Vincular Domínio'}</span>
                </button>
              </>
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

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setInlineEditActive(!inlineEditActive)}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                      inlineEditActive
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                        : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
                    }`}
                    title="Permite clicar diretamente em qualquer texto na página para editar"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>{inlineEditActive ? 'Modo Edição Ativo (clique no texto)' : 'Edição Visual Inline'}</span>
                  </button>

                  <div className="text-xs text-zinc-400 hidden lg:block">
                    {viewMode === 'desktop' ? '100% Fluido' : 'Simulador iPhone / Android'}
                  </div>
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
                    srcDoc={
                      inlineEditActive
                        ? currentHtml.replace('<body>', '<body contenteditable="true" style="outline: none;">')
                        : currentHtml
                    }
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

                {/* Logo & Brand Identity */}
                <div className="p-3.5 rounded-xl bg-gradient-to-b from-purple-950/20 to-zinc-900 border border-purple-500/20 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Palette className="w-4 h-4 text-purple-400" />
                      <span className="text-xs font-bold text-white">Logotipo & Paleta de Cores da Marca</span>
                    </div>
                    {content.logoUrl && (
                      <button
                        type="button"
                        onClick={handleEditorRemoveLogo}
                        className="text-[11px] text-rose-400 hover:text-rose-300 flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        Remover
                      </button>
                    )}
                  </div>

                  {content.logoUrl ? (
                    <div className="flex items-center justify-between gap-3 p-2.5 rounded-lg bg-zinc-900 border border-zinc-800">
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-12 rounded bg-[radial-gradient(#444_1px,transparent_1px)] [background-size:6px_6px] border border-zinc-700 flex items-center justify-center p-1 overflow-hidden shrink-0">
                          <img src={content.logoUrl} alt="Logo" className="max-h-full max-w-full object-contain" />
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-white">Logotipo Ativo</div>
                          <div className="text-[10px] text-zinc-400">
                            {extractingColors ? 'Detectando cores...' : 'Exibida no topo e rodapé'}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <label className="text-[11px] px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 cursor-pointer flex items-center gap-1">
                          <Upload className="w-3 h-3" />
                          Trocar
                          <input
                            type="file"
                            accept="image/png,image/jpeg,image/svg+xml,image/webp"
                            onChange={handleEditorLogoUpload}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={handleEditorAutoSearchLogo}
                        disabled={searchingLogo}
                        className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/40 text-purple-200 text-xs font-semibold"
                      >
                        {searchingLogo ? <Loader2 className="w-3 h-3 animate-spin text-purple-400" /> : <Search className="w-3 h-3 text-purple-400" />}
                        Buscar na Web
                      </button>
                      <label className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 text-xs font-semibold cursor-pointer">
                        <Upload className="w-3 h-3" />
                        Upload Logo
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/svg+xml,image/webp"
                          onChange={handleEditorLogoUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  )}

                  {/* Color Adjusters */}
                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-zinc-800/80">
                    <div>
                      <label className="block text-[11px] text-zinc-400 mb-1">Cor Primária (Botões & Destaques)</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={style.primaryColor}
                          onChange={(e) =>
                            setStyle({
                              ...style,
                              primaryColor: e.target.value,
                              logoPalette: {
                                primary: e.target.value,
                                accent: style.accentColor,
                              },
                            })
                          }
                          className="w-7 h-7 rounded cursor-pointer border-0 bg-transparent"
                        />
                        <span className="text-xs font-mono text-zinc-300 uppercase">{style.primaryColor}</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] text-zinc-400 mb-1">Cor Secundária / Acento</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={style.accentColor}
                          onChange={(e) =>
                            setStyle({
                              ...style,
                              accentColor: e.target.value,
                              logoPalette: {
                                primary: style.primaryColor,
                                accent: e.target.value,
                              },
                            })
                          }
                          className="w-7 h-7 rounded cursor-pointer border-0 bg-transparent"
                        />
                        <span className="text-xs font-mono text-zinc-300 uppercase">{style.accentColor}</span>
                      </div>
                    </div>
                  </div>
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

                  <div>
                    <label className="block text-xs text-zinc-400 mb-1 flex items-center justify-between">
                      <span>Imagem de Fundo do Hero (URL)</span>
                      {content.hero.backgroundImage && (
                        <span className="text-[10px] text-blue-400">Prévia ativa</span>
                      )}
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="url"
                        placeholder="https://images.unsplash.com/... ou link de foto real"
                        value={content.hero.backgroundImage || ''}
                        onChange={(e) =>
                          setContent({
                            ...content,
                            hero: { ...content.hero, backgroundImage: e.target.value },
                          })
                        }
                        className="flex-1 text-xs bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-zinc-100 placeholder:text-zinc-600"
                      />
                      {content.hero.backgroundImage && (
                        <div className="w-9 h-9 rounded-lg border border-zinc-700 overflow-hidden shrink-0 bg-zinc-800 shadow">
                          <img
                            src={content.hero.backgroundImage}
                            alt="Hero"
                            className="w-full h-full object-cover"
                            onError={(e: any) => { e.currentTarget.style.display = 'none'; }}
                          />
                        </div>
                      )}
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
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1 flex items-center justify-between">
                      <span>Foto da Seção Sobre (URL)</span>
                      {content.about.image && (
                        <span className="text-[10px] text-blue-400">Prévia ativa</span>
                      )}
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="url"
                        placeholder="https://images.unsplash.com/... ou link de foto real"
                        value={content.about.image || ''}
                        onChange={(e) =>
                          setContent({
                            ...content,
                            about: { ...content.about, image: e.target.value },
                          })
                        }
                        className="flex-1 text-xs bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-zinc-100 placeholder:text-zinc-600"
                      />
                      {content.about.image && (
                        <div className="w-9 h-9 rounded-lg border border-zinc-700 overflow-hidden shrink-0 bg-zinc-800 shadow">
                          <img
                            src={content.about.image}
                            alt="Sobre"
                            className="w-full h-full object-cover"
                            onError={(e: any) => { e.currentTarget.style.display = 'none'; }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Location & Contacts */}
                <div className="space-y-3 pt-4 border-t border-zinc-800/80">
                  <div className="text-xs font-bold uppercase tracking-wider text-blue-400">
                    Contatos & WhatsApp
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1">WhatsApp de Atendimento (com DDD)</label>
                    <input
                      type="text"
                      placeholder="Ex: 11999998888"
                      value={content.whatsappNumber || ''}
                      onChange={(e) =>
                        setContent({
                          ...content,
                          whatsappNumber: e.target.value,
                        })
                      }
                      className="w-full text-xs bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-zinc-100 placeholder:text-zinc-600"
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

                {/* Specialized Module: Menu / Cardapio */}
                {content.cardapioItems && content.cardapioItems.length > 0 && (
                  <div className="space-y-3 pt-4 border-t border-zinc-800/80">
                    <div className="text-xs font-bold uppercase tracking-wider text-amber-400">
                      Cardápio & Itens de Destaque
                    </div>
                    {content.cardapioItems.map((item, idx) => (
                      <div key={item.id || idx} className="p-3 bg-zinc-900/60 rounded-lg border border-zinc-800 space-y-2">
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={item.name}
                            onChange={(e) => {
                              const list = [...(content.cardapioItems || [])];
                              list[idx].name = e.target.value;
                              setContent({ ...content, cardapioItems: list });
                            }}
                            className="flex-1 text-xs font-bold bg-zinc-900 border border-zinc-800 rounded p-1.5 text-zinc-100"
                          />
                          <input
                            type="text"
                            value={item.price}
                            onChange={(e) => {
                              const list = [...(content.cardapioItems || [])];
                              list[idx].price = e.target.value;
                              setContent({ ...content, cardapioItems: list });
                            }}
                            className="w-24 text-xs font-mono font-bold bg-zinc-900 border border-zinc-800 rounded p-1.5 text-amber-400 text-right"
                          />
                        </div>
                        <textarea
                          rows={2}
                          value={item.description}
                          onChange={(e) => {
                            const list = [...(content.cardapioItems || [])];
                            list[idx].description = e.target.value;
                            setContent({ ...content, cardapioItems: list });
                          }}
                          className="w-full text-xs bg-zinc-900 border border-zinc-800 rounded p-1.5 text-zinc-300"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* Testimonials */}
                <div className="space-y-3 pt-4 border-t border-zinc-800/80">
                  <div className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                    Avaliações de Clientes
                  </div>
                  {content.testimonials.items.map((testi, idx) => (
                    <div key={idx} className="p-3 bg-zinc-900/60 rounded-lg border border-zinc-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <input
                          type="text"
                          value={testi.author}
                          onChange={(e) => {
                            const list = [...content.testimonials.items];
                            list[idx].author = e.target.value;
                            setContent({ ...content, testimonials: { ...content.testimonials, items: list } });
                          }}
                          className="text-xs font-bold bg-zinc-900 border border-zinc-800 rounded p-1.5 text-zinc-100 flex-1 mr-2"
                        />
                        <span className="text-amber-400 text-xs">★★★★★</span>
                      </div>
                      <textarea
                        rows={2}
                        value={testi.text}
                        onChange={(e) => {
                          const list = [...content.testimonials.items];
                          list[idx].text = e.target.value;
                          setContent({ ...content, testimonials: { ...content.testimonials, items: list } });
                        }}
                        className="w-full text-xs bg-zinc-900 border border-zinc-800 rounded p-1.5 text-zinc-300"
                      />
                    </div>
                  ))}
                </div>

                {/* SEO & Social Share Settings */}
                <div className="space-y-3 pt-4 border-t border-zinc-800/80">
                  <div className="text-xs font-bold uppercase tracking-wider text-purple-400">
                    SEO & Compartilhamento Social (WhatsApp / Google)
                  </div>
                  <div>
                    <label className="block text-[11px] text-zinc-400 mb-1">Título da Página (Meta Title)</label>
                    <input
                      type="text"
                      value={content.businessName}
                      onChange={(e) => setContent({ ...content, businessName: e.target.value })}
                      className="w-full text-xs bg-zinc-900 border border-zinc-800 rounded p-2 text-zinc-100"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-zinc-400 mb-1">Slogan / Tagline Comercial</label>
                    <input
                      type="text"
                      value={content.tagline}
                      onChange={(e) => setContent({ ...content, tagline: e.target.value })}
                      className="w-full text-xs bg-zinc-900 border border-zinc-800 rounded p-2 text-zinc-100"
                    />
                  </div>
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

          {/* TAB: VISUAL DESIGN & STYLE CONTROLS */}
          {activeTab === 'style' && (
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-[#0c0c0e]">
              <div className="w-full md:w-1/2 p-6 overflow-y-auto space-y-6 border-r border-zinc-800">
                <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                  <div>
                    <h3 className="font-bold text-base text-white">Direção de Arte & Estilo</h3>
                    <p className="text-xs text-zinc-400">Personalize a identidade visual e o layout desta página</p>
                  </div>
                  <button
                    onClick={handleSaveEdits}
                    className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md transition-colors"
                  >
                    Salvar Estilo
                  </button>
                </div>

                {/* Archetype / Preset selector */}
                <div className="space-y-3">
                  <label className="block text-xs font-bold uppercase tracking-wider text-blue-400">
                    Arquétipos Visuais Profissionais
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.values(STYLE_PRESETS).map((p) => {
                      const isSelected = style.id === p.id;
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => {
                            setStyle({
                              ...style,
                              id: p.id,
                              name: p.name,
                              description: p.description,
                              primaryColor: p.primaryColor,
                              secondaryColor: p.secondaryColor,
                              accentColor: p.accentColor,
                              bgColor: p.bgColor,
                              textColor: p.textColor,
                              fontHeading: p.fontHeading,
                              fontBody: p.fontBody,
                              buttonRadius: p.buttonRadius,
                              theme: p.theme,
                            });
                          }}
                          className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between gap-2 ${
                            isSelected
                              ? 'bg-blue-600/15 border-blue-500 text-white shadow-md'
                              : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs">{p.name}</span>
                            <div className="flex items-center gap-1">
                              <span className="w-3 h-3 rounded-full border border-black/30" style={{ backgroundColor: p.primaryColor }} />
                              <span className="w-3 h-3 rounded-full border border-black/30" style={{ backgroundColor: p.accentColor }} />
                            </div>
                          </div>
                          <span className="text-[10px] text-zinc-400 line-clamp-2">{p.description}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Hero Layout & Structure */}
                <div className="space-y-3 pt-3 border-t border-zinc-800">
                  <label className="block text-xs font-bold uppercase tracking-wider text-blue-400">
                    Composição da Primeira Dobra (Hero)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'split-right', label: 'Split Moderno', desc: 'Texto à esquerda + Foto e Card Flutuante' },
                      { id: 'card-overlay', label: 'Card c/ WhatsApp', desc: 'Caixa de contato direto sobreposta' },
                      { id: 'editorial-clean', label: 'Editorial Revista', desc: 'Composição minimalista centralizada' },
                      { id: 'centered', label: 'Centralizado Focado', desc: 'Chamada imponente de alta conversão' },
                    ].map((item) => {
                      const isCurrent = (style.heroLayout || content.heroLayout || 'split-right') === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            setStyle({ ...style, heroLayout: item.id as HeroLayoutType });
                            setContent({ ...content, heroLayout: item.id as HeroLayoutType });
                          }}
                          className={`p-3 rounded-xl border text-left transition-all ${
                            isCurrent
                              ? 'bg-purple-600/15 border-purple-500 text-white'
                              : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                          }`}
                        >
                          <div className="font-bold text-xs mb-1">{item.label}</div>
                          <div className="text-[10px] text-zinc-400">{item.desc}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Theme & Cards Style */}
                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-zinc-800">
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1.5 font-semibold">Tema Geral</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setStyle({ ...style, theme: 'dark', bgColor: '#0a0c10', textColor: '#f8fafc' })}
                        className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all ${
                          style.theme === 'dark'
                            ? 'bg-zinc-800 border-white text-white'
                            : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                        }`}
                      >
                        🌙 Dark
                      </button>
                      <button
                        type="button"
                        onClick={() => setStyle({ ...style, theme: 'light', bgColor: '#ffffff', textColor: '#0f172a' })}
                        className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all ${
                          style.theme === 'light'
                            ? 'bg-white border-blue-500 text-black'
                            : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                        }`}
                      >
                        ☀️ Light
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-zinc-400 mb-1.5 font-semibold">Acabamento dos Cards</label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {[
                        { id: 'glass', label: 'Glass' },
                        { id: 'solid', label: 'Sólido' },
                        { id: 'bordered', label: 'Bordas' },
                      ].map((c) => {
                        const isCurrent = (style.cardStyle || 'glass') === c.id;
                        return (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => setStyle({ ...style, cardStyle: c.id as CardStyleType })}
                            className={`py-2 px-1 rounded-lg text-xs font-bold border text-center transition-all ${
                              isCurrent
                                ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                                : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                            }`}
                          >
                            {c.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Typography Selector */}
                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-zinc-800">
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1 font-semibold">Tipografia de Títulos</label>
                    <select
                      value={style.fontHeading}
                      onChange={(e) => setStyle({ ...style, fontHeading: e.target.value })}
                      className="w-full text-xs bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-zinc-100"
                    >
                      <option value="Outfit, sans-serif">Outfit (Moderna & Equilibrada)</option>
                      <option value="Montserrat, sans-serif">Montserrat (Geométrica & Elegante)</option>
                      <option value="Playfair Display, serif">Playfair Display (Editorial Clássica)</option>
                      <option value="Cinzel, serif">Cinzel (Luxuosa & Romana)</option>
                      <option value="Barlow Condensed, sans-serif">Barlow Condensed (Esportiva & Impacto)</option>
                      <option value="Plus Jakarta Sans, sans-serif">Plus Jakarta Sans (Tecnológica & Alta Conversão)</option>
                      <option value="Inter, sans-serif">Inter (Clara & Minimalista)</option>
                      <option value="Sora, sans-serif">Sora (Autoritária & Robusta)</option>
                      <option value="Oswald, sans-serif">Oswald (Masculina & Forte)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs text-zinc-400 mb-1 font-semibold">Curvatura dos Botões</label>
                    <select
                      value={style.buttonRadius}
                      onChange={(e) => setStyle({ ...style, buttonRadius: e.target.value as any })}
                      className="w-full text-xs bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-zinc-100"
                    >
                      <option value="rounded-none">Reto / Sharp (0px)</option>
                      <option value="rounded-md">Suave (8px)</option>
                      <option value="rounded-xl">Moderno (16px)</option>
                      <option value="rounded-full">Pílula Arredondada (9999px)</option>
                    </select>
                  </div>
                </div>

                {/* Color Pickers */}
                <div className="p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-3">
                  <div className="text-xs font-bold text-zinc-200">Paleta de Cores Manual</div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <span className="block text-[11px] text-zinc-400 mb-1">Primária (Botão)</span>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={style.primaryColor}
                          onChange={(e) => setStyle({ ...style, primaryColor: e.target.value })}
                          className="w-7 h-7 rounded cursor-pointer border-0 bg-transparent"
                        />
                        <span className="text-[11px] font-mono text-zinc-300 uppercase">{style.primaryColor}</span>
                      </div>
                    </div>

                    <div>
                      <span className="block text-[11px] text-zinc-400 mb-1">Acento (Preços)</span>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={style.accentColor}
                          onChange={(e) => setStyle({ ...style, accentColor: e.target.value })}
                          className="w-7 h-7 rounded cursor-pointer border-0 bg-transparent"
                        />
                        <span className="text-[11px] font-mono text-zinc-300 uppercase">{style.accentColor}</span>
                      </div>
                    </div>

                    <div>
                      <span className="block text-[11px] text-zinc-400 mb-1">Fundo da Página</span>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={style.bgColor}
                          onChange={(e) => setStyle({ ...style, bgColor: e.target.value })}
                          className="w-7 h-7 rounded cursor-pointer border-0 bg-transparent"
                        />
                        <span className="text-[11px] font-mono text-zinc-300 uppercase">{style.bgColor}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Side Live Mini-Preview */}
              <div className="hidden md:flex flex-1 p-4 bg-[#050507] items-center justify-center overflow-hidden">
                <div className="w-full h-full rounded-xl overflow-hidden border border-zinc-800 shadow-2xl bg-white">
                  <iframe
                    title="Live Style Preview"
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

      {/* Connect Custom Domain Modal */}
      {showDomainModal && (
        <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="relative w-full max-w-md bg-[#121215] border border-zinc-800 rounded-2xl p-6 shadow-2xl text-zinc-100">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-base text-white">Vincular Domínio Próprio</h3>
                <p className="text-xs text-zinc-400">Publicação direta na conta Vercel</p>
              </div>
              <button
                type="button"
                onClick={() => setShowDomainModal(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-zinc-300 mb-4 leading-relaxed">
              Informe o domínio que o cliente comprou (ex: <code>www.barbeariasilva.com.br</code> ou <code>pizzariaroma.com.br</code>). O LeadCraft AI registrará o domínio no projeto Vercel para você.
            </p>

            <form onSubmit={handleConnectDomain} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Nome do Domínio
                </label>
                <input
                  type="text"
                  value={domainInput}
                  onChange={(e) => setDomainInput(e.target.value)}
                  placeholder="www.seusite.com.br"
                  required
                  className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>

              {domainFeedback && (
                <div
                  className={`p-3.5 rounded-xl border text-xs space-y-2 ${
                    domainFeedback.ok
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                      : 'bg-rose-500/10 border-rose-500/20 text-rose-300'
                  }`}
                >
                  <div className="font-semibold">{domainFeedback.msg}</div>
                  {domainFeedback.dns && (
                    <div className="space-y-1.5 pt-2 border-t border-emerald-500/20 text-[11px] font-mono">
                      <div className="text-zinc-400 font-sans font-medium">Configure no Registro.br / DNS:</div>
                      <div className="p-2 rounded bg-black/40 border border-zinc-800">
                        <div>Tipo A: @ → <strong>{domainFeedback.dns.typeA.value}</strong></div>
                        <div>CNAME: www → <strong>{domainFeedback.dns.cname.value}</strong></div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDomainModal(false)}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-semibold border border-zinc-800 transition-colors"
                >
                  Fechar
                </button>
                <button
                  type="submit"
                  disabled={domainLoading}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md shadow-blue-600/30 disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  {domainLoading ? (
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <span>Salvar & Vincular</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
