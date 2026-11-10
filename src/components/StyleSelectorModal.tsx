'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Business, LandingPageStyle, StylePresetId } from '@/types';
import { STYLE_PRESETS, BUSINESS_CATEGORIES } from '@/lib/constants';
import {
  X,
  Sparkles,
  Palette,
  Check,
  Type,
  Sliders,
  Sun,
  Moon,
  ArrowRight,
  Wand2,
} from 'lucide-react';

interface StyleSelectorModalProps {
  business: Business | null;
  onClose: () => void;
  onConfirmGenerate: (business: Business, style: LandingPageStyle) => void;
  isGenerating?: boolean;
}

export default function StyleSelectorModal({
  business,
  onClose,
  onConfirmGenerate,
  isGenerating = false,
}: StyleSelectorModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!business) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [business]);

  // Determine initial style suggestion
  const matchedCat = business ? BUSINESS_CATEGORIES.find((c) => c.key === business.categoryKey) : null;
  const initialPresetId: StylePresetId = matchedCat ? matchedCat.recommendedStyle : 'modern-minimalist';

  const [selectedPresetId, setSelectedPresetId] = useState<StylePresetId>(initialPresetId);
  const [customStyle, setCustomStyle] = useState<LandingPageStyle>(STYLE_PRESETS[initialPresetId]);
  const [activeTab, setActiveTab] = useState<'presets' | 'customize'>('presets');

  function handleSelectPreset(presetId: StylePresetId) {
    setSelectedPresetId(presetId);
    setCustomStyle(STYLE_PRESETS[presetId]);
  }

  function handleAutoSuggestAI() {
    const recommended = matchedCat ? matchedCat.recommendedStyle : 'modern-minimalist';
    setSelectedPresetId(recommended);
    setCustomStyle(STYLE_PRESETS[recommended]);
  }

  if (!business || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div
        className="relative w-full max-w-3xl max-h-[92vh] overflow-y-auto bg-[#121215] border border-zinc-800 rounded-2xl shadow-2xl p-6 text-zinc-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isGenerating}
          className="absolute top-5 right-5 p-2 rounded-lg bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="pr-12 mb-6">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
              Personalização Visual
            </span>
            <span className="text-xs text-zinc-400">
              Estabelecimento: <strong className="text-zinc-200">{business.name}</strong>
            </span>
          </div>

          <h2 className="text-2xl font-bold tracking-tight text-white">
            Escolha o Estilo da Landing Page
          </h2>
          <p className="text-sm text-zinc-400 mt-1">
            Selecione uma identidade visual para que a IA estruture as cores, tipografia e tom de comunicação.
          </p>
        </div>

        {/* Smart AI Recommendation Banner */}
        <div className="flex items-center justify-between p-3.5 rounded-xl bg-gradient-to-r from-blue-950/40 via-indigo-950/30 to-zinc-900/40 border border-blue-800/40 mb-6">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-blue-300">
                Sugestão da IA para {business.category}:
              </div>
              <div className="text-xs text-zinc-300">
                O estilo <strong>{STYLE_PRESETS[initialPresetId]?.name}</strong> proporciona a maior taxa de conversão neste segmento.
              </div>
            </div>
          </div>

          <button
            onClick={handleAutoSuggestAI}
            className="shrink-0 text-xs font-semibold px-3 py-1.5 rounded-lg bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 border border-blue-500/40 transition-colors"
          >
            Aplicar Sugestão
          </button>
        </div>

        {/* Tabs: Presets vs Fine-tune */}
        <div className="flex border-b border-zinc-800 mb-6">
          <button
            onClick={() => setActiveTab('presets')}
            className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === 'presets'
                ? 'border-blue-500 text-white'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Estilos Visuais (8 Opções)
          </button>
          <button
            onClick={() => setActiveTab('customize')}
            className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'customize'
                ? 'border-blue-500 text-white'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Ajustes Finos (Cores & Fontes)</span>
          </button>
        </div>

        {/* Tab 1: Presets Grid */}
        {activeTab === 'presets' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 mb-6">
            {(Object.keys(STYLE_PRESETS) as StylePresetId[]).map((presetId) => {
              const preset = STYLE_PRESETS[presetId];
              const isSelected = selectedPresetId === presetId;

              return (
                <div
                  key={presetId}
                  onClick={() => handleSelectPreset(presetId)}
                  className={`relative p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-zinc-900 border-blue-500 shadow-lg shadow-blue-500/10 ring-1 ring-blue-500/50'
                      : 'bg-[#151518] border-zinc-800/80 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="font-bold text-sm text-zinc-100 flex items-center gap-2">
                      <span>{preset.name}</span>
                      {initialPresetId === presetId && (
                        <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                          Recomendado
                        </span>
                      )}
                    </div>
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-white">
                        <Check className="w-3 h-3" />
                      </div>
                    )}
                  </div>

                  <p className="text-xs text-zinc-400 mb-3 leading-relaxed">
                    {preset.description}
                  </p>

                  {/* Visual Palette Preview Bar */}
                  <div className="flex items-center justify-between pt-2 border-t border-zinc-800/80 text-[11px] text-zinc-400">
                    <div className="flex items-center gap-1.5">
                      <div
                        className="w-4 h-4 rounded-full border border-white/20"
                        style={{ backgroundColor: preset.primaryColor }}
                        title="Cor Primária"
                      />
                      <div
                        className="w-4 h-4 rounded-full border border-white/20"
                        style={{ backgroundColor: preset.accentColor }}
                        title="Cor de Destaque"
                      />
                      <div
                        className="w-4 h-4 rounded-full border border-white/20"
                        style={{ backgroundColor: preset.bgColor }}
                        title="Fundo"
                      />
                    </div>
                    <span className="text-zinc-400 text-[11px]">
                      {preset.theme === 'dark' ? 'Tema Escuro' : 'Tema Claro'} • {preset.fontHeading.split(',')[0]}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Tab 2: Fine-Tuning */}
        {activeTab === 'customize' && (
          <div className="space-y-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
                  Cor Primária
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={customStyle.primaryColor}
                    onChange={(e) =>
                      setCustomStyle({ ...customStyle, primaryColor: e.target.value })
                    }
                    className="w-9 h-9 rounded-lg bg-transparent border border-zinc-700 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={customStyle.primaryColor}
                    onChange={(e) =>
                      setCustomStyle({ ...customStyle, primaryColor: e.target.value })
                    }
                    className="flex-1 text-xs bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-2 text-zinc-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
                  Cor de Destaque / Ação
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={customStyle.accentColor}
                    onChange={(e) =>
                      setCustomStyle({ ...customStyle, accentColor: e.target.value })
                    }
                    className="w-9 h-9 rounded-lg bg-transparent border border-zinc-700 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={customStyle.accentColor}
                    onChange={(e) =>
                      setCustomStyle({ ...customStyle, accentColor: e.target.value })
                    }
                    className="flex-1 text-xs bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-2 text-zinc-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
                  Tema da Página
                </label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      setCustomStyle({
                        ...customStyle,
                        theme: 'dark',
                        bgColor: '#09090b',
                        textColor: '#fafafa',
                      })
                    }
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold border ${
                      customStyle.theme === 'dark'
                        ? 'bg-zinc-800 text-white border-blue-500'
                        : 'bg-zinc-900 text-zinc-400 border-zinc-800'
                    }`}
                  >
                    <Moon className="w-3.5 h-3.5" />
                    <span>Dark</span>
                  </button>
                  <button
                    onClick={() =>
                      setCustomStyle({
                        ...customStyle,
                        theme: 'light',
                        bgColor: '#ffffff',
                        textColor: '#18181b',
                      })
                    }
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold border ${
                      customStyle.theme === 'light'
                        ? 'bg-zinc-800 text-white border-blue-500'
                        : 'bg-zinc-900 text-zinc-400 border-zinc-800'
                    }`}
                  >
                    <Sun className="w-3.5 h-3.5" />
                    <span>Light</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
                  Estilo dos Botões
                </label>
                <select
                  value={customStyle.buttonRadius}
                  onChange={(e) =>
                    setCustomStyle({
                      ...customStyle,
                      buttonRadius: e.target.value as any,
                    })
                  }
                  className="w-full text-xs bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-200 focus:outline-none focus:border-blue-500"
                >
                  <option value="rounded-md">Arredondamento Padrão (8px)</option>
                  <option value="rounded-xl">Arredondamento Suave (16px)</option>
                  <option value="rounded-full">Pílula / Totalmente Redondo</option>
                  <option value="rounded-none">Reto / Angular (0px)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
                  Tipografia Principal
                </label>
                <select
                  value={customStyle.fontHeading}
                  onChange={(e) =>
                    setCustomStyle({
                      ...customStyle,
                      fontHeading: e.target.value,
                    })
                  }
                  className="w-full text-xs bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-200 focus:outline-none focus:border-blue-500"
                >
                  <option value="Inter, sans-serif">Inter (Moderna & Clean)</option>
                  <option value="Plus Jakarta Sans, sans-serif">Plus Jakarta Sans (Corporativa)</option>
                  <option value="Cinzel, serif">Cinzel (Premium Clássica)</option>
                  <option value="Oswald, sans-serif">Oswald (Urbana e Forte)</option>
                  <option value="Playfair Display, serif">Playfair Display (Luxo)</option>
                  <option value="Outfit, sans-serif">Outfit (Criativa)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Modal Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
          <button
            onClick={onClose}
            disabled={isGenerating}
            className="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-medium text-sm transition-colors border border-zinc-800"
          >
            Cancelar
          </button>

          <button
            onClick={() => onConfirmGenerate(business, customStyle)}
            disabled={isGenerating}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm shadow-lg shadow-blue-600/30 transition-all hover:scale-[1.02] disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Gerando com IA...</span>
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4" />
                <span>Gerar Landing Page Agora</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
