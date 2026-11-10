'use client';

import { useState, useEffect } from 'react';
import {
  Settings,
  Key,
  Sparkles,
  MapPin,
  Check,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { AppSettings } from '@/types';

export default function ConfiguracoesPage() {
  const [settings, setSettings] = useState<AppSettings>({
    geminiApiKey: '',
    googlePlacesApiKey: '',
    provider: 'gemini',
    mapProvider: 'osm',
    userCity: 'São Paulo, SP',
    defaultRadiusKm: 5,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Connection tests
  const [testingGemini, setTestingGemini] = useState(false);
  const [geminiStatus, setGeminiStatus] = useState<{ ok: boolean; msg: string } | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    try {
      setLoading(true);
      const res = await fetch('/api/settings');
      const data = await res.json();
      if (data.success && data.settings) {
        setSettings(data.settings);
      }
    } catch (err) {
      console.error('Error loading settings:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveSettings(e?: React.FormEvent) {
    if (e) e.preventDefault();
    try {
      setSaving(true);
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (data.success) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Error saving settings:', err);
    } finally {
      setSaving(false);
    }
  }

  async function handleTestGemini() {
    if (!settings.geminiApiKey || settings.geminiApiKey.trim().length < 8) {
      setGeminiStatus({ ok: false, msg: 'Insira uma chave da Gemini API válida antes de testar.' });
      return;
    }

    try {
      setTestingGemini(true);
      setGeminiStatus(null);

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${settings.geminiApiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: 'Responda apenas com a palavra OK' }] }],
          }),
        }
      );

      if (res.ok) {
        setGeminiStatus({ ok: true, msg: 'Conexão com a Google Gemini API validada com sucesso!' });
      } else {
        const err = await res.text();
        setGeminiStatus({ ok: false, msg: `Erro de validação (${res.status}): Verifique se a chave está correta.` });
      }
    } catch (err: any) {
      setGeminiStatus({ ok: false, msg: `Falha na requisição: ${err.message}` });
    } finally {
      setTestingGemini(false);
    }
  }

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto w-full space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="pb-4 border-b border-zinc-800">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
            Ambiente & APIs
          </span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">
          Configurações da Plataforma
        </h1>
        <p className="text-sm text-zinc-400 mt-1">
          Configure as integrações com os modelos de IA, serviços de geolocalização e preferências da sua prospecção.
        </p>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* Gemini API Key Box */}
        <div className="p-6 rounded-2xl bg-[#121215] border border-zinc-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white">Google Gemini API</h3>
                <p className="text-xs text-zinc-400">
                  Responsável pela redação dos títulos, textos persuasivos e adaptação ao segmento.
                </p>
              </div>
            </div>

            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 text-xs font-semibold text-purple-400 hover:text-purple-300 transition-colors"
            >
              <span>Obter chave gratuita</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Chave de API (Gemini API Key)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="password"
                value={settings.geminiApiKey}
                onChange={(e) => setSettings({ ...settings, geminiApiKey: e.target.value })}
                placeholder="AIzaSy..."
                className="flex-1 px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-purple-500 font-mono"
              />
              <button
                type="button"
                onClick={handleTestGemini}
                disabled={testingGemini}
                className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold border border-zinc-700 transition-colors shrink-0 disabled:opacity-50"
              >
                {testingGemini ? 'Testando...' : 'Testar Conexão'}
              </button>
            </div>
          </div>

          {/* Connection status message */}
          {geminiStatus && (
            <div
              className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                geminiStatus.ok
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                  : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
              }`}
            >
              {geminiStatus.ok ? <Check className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
              <span>{geminiStatus.msg}</span>
            </div>
          )}

          <div className="text-[11px] text-zinc-500 leading-relaxed bg-zinc-950/60 p-3 rounded-xl border border-zinc-800/80">
            💡 <strong>Dica importante:</strong> Se você não informar uma chave da Gemini API, a plataforma utilizará automaticamente o <strong>Motor Semântico Local Integrado</strong>, gerando landing pages completas e responsivas sem nenhuma dependência externa!
          </div>
        </div>

        {/* Places API & Geolocation Box */}
        <div className="p-6 rounded-2xl bg-[#121215] border border-zinc-800 shadow-xl space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Serviço de Mapeamento & Estabelecimentos</h3>
              <p className="text-xs text-zinc-400">
                Defina os provedores para localização e busca de negócios comerciais.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Provedor de Busca de Negócios
              </label>
              <select
                value={settings.mapProvider}
                onChange={(e) => setSettings({ ...settings, mapProvider: e.target.value as any })}
                className="w-full py-2.5 px-3 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-200 focus:outline-none focus:border-blue-500"
              >
                <option value="osm">OpenStreetMap & Overpass (Ativo & Sem custos)</option>
                <option value="google">Google Places API (Requer chave)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Cidade Padrão Inicial
              </label>
              <input
                type="text"
                value={settings.userCity}
                onChange={(e) => setSettings({ ...settings, userCity: e.target.value })}
                placeholder="Ex: São Paulo, SP ou Rio de Janeiro, RJ"
                className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {settings.mapProvider === 'google' && (
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Google Places API Key
              </label>
              <input
                type="password"
                value={settings.googlePlacesApiKey}
                onChange={(e) => setSettings({ ...settings, googlePlacesApiKey: e.target.value })}
                placeholder="AIzaSy..."
                className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-100 font-mono focus:outline-none"
              />
            </div>
          )}
        </div>

        {/* Save Bar */}
        <div className="flex items-center justify-between pt-2">
          {savedSuccess ? (
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold">
              <Check className="w-4 h-4" />
              <span>Configurações salvas com sucesso!</span>
            </div>
          ) : (
            <div className="text-xs text-zinc-500">
              As credenciais ficam protegidas no backend e são lidas por variáveis de ambiente ou arquivo local seguro.
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-md shadow-blue-600/30 transition-all hover:scale-[1.01] disabled:opacity-50"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <ShieldCheck className="w-4 h-4" />
            )}
            <span>Salvar Preferências</span>
          </button>
        </div>
      </form>
    </div>
  );
}
