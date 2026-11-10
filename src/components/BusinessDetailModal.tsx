'use client';

import { useEffect } from 'react';
import { Business } from '@/types';
import {
  X,
  Star,
  MapPin,
  Phone,
  MessageSquare,
  Globe,
  Clock,
  Sparkles,
  CheckCircle2,
  XCircle,
  Wand2,
} from 'lucide-react';

function InstagramIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

interface BusinessDetailModalProps {
  business: Business | null;
  onClose: () => void;
  onGenerateLandingPage: (business: Business) => void;
}

export default function BusinessDetailModal({
  business,
  onClose,
  onGenerateLandingPage,
}: BusinessDetailModalProps) {
  useEffect(() => {
    if (!business) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [business]);

  if (!business) return null;

  const isHigh = business.opportunityScore === 'high';

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-[#121215] border border-zinc-800 rounded-2xl shadow-2xl p-6 text-zinc-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-lg bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="pr-12 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
              {business.category}
            </span>
            <span
              className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                isHigh
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
              }`}
            >
              {isHigh ? 'Alta Oportunidade' : 'Média Oportunidade'}
            </span>
          </div>

          <h2 className="text-2xl font-bold tracking-tight text-white">{business.name}</h2>
          <div className="flex items-center gap-2 text-sm text-zinc-400 mt-1">
            <MapPin className="w-4 h-4 text-zinc-400" />
            <span>{business.address}</span>
          </div>
        </div>

        {/* AI Insight Highlight */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-blue-950/40 via-indigo-950/20 to-purple-950/30 border border-blue-800/40 mb-6">
          <div className="flex items-center gap-2 text-blue-400 font-semibold text-sm mb-1.5">
            <Sparkles className="w-4 h-4" />
            <span>Diagnóstico Comercial Inteligente</span>
          </div>
          <p className="text-sm text-zinc-200 leading-relaxed">
            {business.opportunityReason}
          </p>
        </div>

        {/* Grid: Overview Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Contact and Presences */}
          <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3">
              Canais de Contato
            </h4>
            <div className="space-y-2.5 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-zinc-400 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-zinc-400" /> Telefone:
                </span>
                <span className="font-medium text-zinc-200">
                  {business.phone || 'Não encontrado'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-zinc-400 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-emerald-400" /> WhatsApp:
                </span>
                <span className="font-medium text-emerald-400">
                  {business.whatsapp ? (
                    <a
                      href={`https://wa.me/${business.whatsapp.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="hover:underline"
                    >
                      {business.whatsapp}
                    </a>
                  ) : (
                    'Não encontrado'
                  )}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-zinc-400 flex items-center gap-2">
                  <InstagramIcon className="w-4 h-4 text-pink-400" /> Instagram:
                </span>
                <span className="font-medium text-zinc-200">
                  {business.instagram || 'Não encontrado'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-zinc-400 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-blue-400" /> Site Atual:
                </span>
                <span className="font-medium text-zinc-200">
                  {business.websiteUrl ? (
                    <a
                      href={business.websiteUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-400 hover:underline"
                    >
                      {business.websiteStatus === 'own_website'
                        ? 'Site Próprio'
                        : business.websiteStatus === 'directory_only'
                        ? 'Diretório / App'
                        : 'Rede Social'}
                    </a>
                  ) : (
                    <span className="text-rose-400 font-semibold">Sem site próprio</span>
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Ratings & Verification */}
          <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3">
              Reputação & Dados Verificados
            </h4>
            <div className="space-y-2.5 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-zinc-400 flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-400" /> Avaliação:
                </span>
                <span className="font-medium text-amber-400">
                  {business.rating ? `${business.rating} ★ (${business.reviewCount || 0} reviews)` : 'Sem avaliações'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-zinc-400 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-zinc-400" /> Horários:
                </span>
                <span className="font-medium text-zinc-200 text-xs">
                  {business.openingHours?.[0] || 'Seg-Sáb (Comercial)'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Ponto Físico:</span>
                <span className="flex items-center gap-1 text-xs">
                  {business.verifiedFields.hasPhysicalLocation ? (
                    <span className="text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Confirmado
                    </span>
                  ) : (
                    <span className="text-zinc-400 flex items-center gap-1">
                      <XCircle className="w-3.5 h-3.5" /> Não confirmado
                    </span>
                  )}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Presença Social:</span>
                <span className="flex items-center gap-1 text-xs">
                  {business.verifiedFields.hasSocial ? (
                    <span className="text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Ativa
                    </span>
                  ) : (
                    <span className="text-zinc-400 flex items-center gap-1">
                      <XCircle className="w-3.5 h-3.5" /> Inexistente
                    </span>
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Services to showcase */}
        <div className="mb-6">
          <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
            Serviços com Potencial para Landing Page
          </h4>
          <div className="flex flex-wrap gap-2">
            {business.services.map((svc, idx) => (
              <span
                key={idx}
                className="text-xs px-3 py-1.5 rounded-lg bg-zinc-800/80 border border-zinc-700/80 text-zinc-200"
              >
                {svc}
              </span>
            ))}
          </div>
        </div>

        {/* CTA Footer */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-medium text-sm transition-colors border border-zinc-800"
          >
            Fechar
          </button>

          <button
            onClick={() => {
              onClose();
              onGenerateLandingPage(business);
            }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm shadow-lg shadow-blue-600/30 transition-all hover:scale-[1.02]"
          >
            <Wand2 className="w-4 h-4" />
            <span>Gerar Landing Page com IA</span>
          </button>
        </div>
      </div>
    </div>
  );
}
