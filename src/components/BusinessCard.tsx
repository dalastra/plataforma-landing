'use client';

import { Business } from '@/types';
import {
  Star,
  MapPin,
  Phone,
  MessageSquare,
  Globe,
  Sparkles,
  ArrowRight,
  Bookmark,
  Share2,
} from 'lucide-react';

function InstagramIcon({ className = 'w-3 h-3' }: { className?: string }) {
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

interface BusinessCardProps {
  business: Business;
  onSelect: (business: Business) => void;
  onGenerateLandingPage: (business: Business) => void;
  onToggleFavorite?: (business: Business) => void;
  isFavorite?: boolean;
}

export default function BusinessCard({
  business,
  onSelect,
  onGenerateLandingPage,
  onToggleFavorite,
  isFavorite = false,
}: BusinessCardProps) {
  const isHigh = business.opportunityScore === 'high';
  const isMedium = business.opportunityScore === 'medium';

  // Format website status label
  const websiteBadge = (() => {
    switch (business.websiteStatus) {
      case 'none':
        return { label: 'Sem site', color: 'bg-rose-500/10 text-rose-400 border-rose-500/20' };
      case 'social_only':
        return { label: 'Apenas Redes Sociais', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' };
      case 'directory_only':
        return { label: 'Apenas Diretório / Delivery', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' };
      case 'own_website':
        return { label: 'Possui Site Próprio', color: 'bg-zinc-800 text-zinc-400 border-zinc-700' };
      default:
        return { label: 'Não Confirmado', color: 'bg-zinc-800 text-zinc-400 border-zinc-700' };
    }
  })();

  const opportunityBadge = isHigh
    ? { label: 'Alta Oportunidade', bg: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' }
    : isMedium
    ? { label: 'Média Oportunidade', bg: 'bg-amber-500/15 text-amber-400 border-amber-500/30' }
    : { label: 'Baixa Oportunidade', bg: 'bg-zinc-800 text-zinc-400 border-zinc-700' };

  return (
    <div className="group relative flex flex-col justify-between bg-[#121215] hover:bg-[#16161a] border border-zinc-800 hover:border-zinc-700 rounded-xl p-5 transition-all duration-200 shadow-sm hover:shadow-xl">
      <div>
        {/* Top Badges & Actions */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <span
              className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${opportunityBadge.bg}`}
            >
              {isHigh && <Sparkles className="w-3 h-3 text-emerald-400" />}
              {opportunityBadge.label}
            </span>
            <span
              className={`inline-flex items-center text-[10px] font-medium px-2 py-0.5 rounded-full border ${websiteBadge.color}`}
            >
              {websiteBadge.label}
            </span>
          </div>

          {onToggleFavorite && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(business);
              }}
              className={`p-1.5 rounded-lg border transition-colors ${
                isFavorite
                  ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-zinc-200 hover:border-zinc-700'
              }`}
              title={isFavorite ? 'Remover dos favoritos' : 'Salvar como lead favorito'}
            >
              <Bookmark className="w-4 h-4" fill={isFavorite ? 'currentColor' : 'none'} />
            </button>
          )}
        </div>

        {/* Business Title & Category */}
        <div className="cursor-pointer" onClick={() => onSelect(business)}>
          <h3 className="font-bold text-lg text-zinc-100 group-hover:text-blue-400 transition-colors line-clamp-1">
            {business.name}
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5 mb-2 font-medium">
            {business.category}
          </p>
        </div>

        {/* Rating and Distance */}
        <div className="flex items-center gap-3 text-xs text-zinc-400 mb-3">
          {business.rating ? (
            <div className="flex items-center gap-1 text-amber-400 font-semibold">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              <span>{business.rating.toFixed(1)}</span>
              {business.reviewCount && (
                <span className="text-zinc-400 font-normal">({business.reviewCount} avaliações)</span>
              )}
            </div>
          ) : (
            <span className="text-zinc-400">Sem avaliações registradas</span>
          )}

          {business.distanceKm !== undefined && (
            <div className="flex items-center gap-1 text-zinc-400 ml-auto">
              <MapPin className="w-3.5 h-3.5 text-zinc-400" />
              <span>{business.distanceKm} km</span>
            </div>
          )}
        </div>

        {/* Address */}
        <div className="flex items-start gap-1.5 text-xs text-zinc-400 mb-3 line-clamp-1">
          <MapPin className="w-3.5 h-3.5 shrink-0 text-zinc-400 mt-0.5" />
          <span>{business.address}</span>
        </div>

        {/* Verified Channels (Icons) */}
        <div className="flex items-center gap-2 mb-4">
          {business.whatsapp || business.phoneType === 'mobile_whatsapp' ? (
            <a
              href={`https://wa.me/${(business.whatsapp || business.phone || '').replace(/\D/g, '')}`}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-md bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25 font-semibold transition-colors"
              title="WhatsApp Celular verificado"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <MessageSquare className="w-3 h-3" />
              <span>WhatsApp Celular</span>
            </a>
          ) : business.phone ? (
            <span className="inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-md bg-zinc-800 text-zinc-300 border border-zinc-700">
              <Phone className="w-3 h-3 text-zinc-400" />
              <span>{business.phoneType === 'landline' ? 'Tel. Fixo: ' : ''}{business.phone}</span>
            </span>
          ) : (
            <span className="text-[11px] text-zinc-500">Tel: não encontrado</span>
          )}

          {business.instagram && (
            <span className="inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-md bg-pink-500/10 text-pink-400 border border-pink-500/20">
              <InstagramIcon className="w-3 h-3" />
              <span className="max-w-[110px] truncate">{business.instagram}</span>
            </span>
          )}

          {business.websiteUrl && (
            <a
              href={business.websiteUrl}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-md bg-zinc-800 text-blue-400 border border-zinc-700 hover:text-blue-300"
              title="Abrir link externo"
            >
              <Globe className="w-3 h-3" />
              <span>Link</span>
            </a>
          )}
        </div>

        {/* AI Justification Box */}
        <div className="p-3 rounded-lg bg-zinc-950/60 border border-zinc-800/80 mb-4 text-xs">
          <div className="flex items-center gap-1.5 text-blue-400 font-semibold mb-1 text-[11px]">
            <Sparkles className="w-3 h-3" />
            <span>Análise da IA:</span>
          </div>
          <p className="text-zinc-300 text-[12px] leading-relaxed line-clamp-3">
            "{business.opportunityReason}"
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 pt-2 border-t border-zinc-800/80">
        <button
          onClick={() => onSelect(business)}
          className="flex-1 px-3 py-2 text-xs font-semibold rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 transition-colors"
        >
          Ver Detalhes
        </button>

        <button
          onClick={() => onGenerateLandingPage(business)}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/20 transition-all hover:scale-[1.02]"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Gerar Landing Page</span>
        </button>
      </div>
    </div>
  );
}
