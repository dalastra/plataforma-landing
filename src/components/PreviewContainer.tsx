'use client';

import { useEffect, useState } from 'react';
import { Sparkles, MessageCircle, Eye, ChevronUp, ChevronDown, CheckCircle2 } from 'lucide-react';
import { LandingPageProject } from '@/types';

interface PreviewContainerProps {
  project: LandingPageProject;
}

export default function PreviewContainer({ project }: PreviewContainerProps) {
  const [bannerVisible, setBannerVisible] = useState(true);
  const [viewsCount, setViewsCount] = useState<number>(project.demoViewsCount || 1);

  useEffect(() => {
    // Fire tracking beacon
    fetch('/api/preview/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectId: project.id }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.viewsCount) {
          setViewsCount(data.viewsCount);
        }
      })
      .catch((err) => console.error('Tracking beacon error:', err));
  }, [project.id]);

  const proposalWhatsAppText = encodeURIComponent(
    `Olá! Vi a demonstração da landing page criada para a *${project.businessName}* no LeadCraft e gostaria de colocar este site no ar com meu domínio próprio e WhatsApp.`
  );

  return (
    <div className="relative min-h-screen w-full bg-white text-zinc-900">
      {/* Floating Presentation Banner */}
      {bannerVisible ? (
        <div className="sticky top-0 z-[99999] w-full bg-gradient-to-r from-zinc-950 via-zinc-900 to-blue-950 text-white px-4 py-2.5 border-b border-blue-500/30 shadow-2xl flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 font-bold uppercase tracking-wider text-[10px]">
              <Sparkles className="w-3 h-3" />
              Demonstração Exclusiva
            </span>
            <span className="font-semibold text-zinc-200">
              Proposta sob medida para <strong className="text-white">{project.businessName}</strong>
            </span>
            <span className="hidden md:inline-flex items-center gap-1 text-[11px] text-zinc-400 pl-2 border-l border-zinc-700">
              <Eye className="w-3 h-3 text-emerald-400" />
              {viewsCount} {viewsCount === 1 ? 'visualização' : 'visualizações'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={`https://wa.me/?text=${proposalWhatsAppText}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs transition-all shadow-md shadow-emerald-500/20 hover:scale-[1.02]"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Quero Este Site no Ar</span>
            </a>

            <button
              onClick={() => setBannerVisible(false)}
              className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
              title="Ocultar barra de apresentação"
            >
              <ChevronUp className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setBannerVisible(true)}
          className="fixed top-3 right-3 z-[99999] flex items-center gap-1 px-3 py-1.5 rounded-full bg-black/85 hover:bg-black text-white text-xs font-semibold backdrop-blur-md border border-zinc-700 shadow-xl transition-all"
        >
          <Sparkles className="w-3.5 h-3.5 text-blue-400" />
          <span>Ver Proposta</span>
          <ChevronDown className="w-3.5 h-3.5" />
        </button>
      )}

      {/* Render Clean Project Landing Page */}
      <div
        dangerouslySetInnerHTML={{ __html: project.htmlContent || '' }}
        className="w-full"
      />
    </div>
  );
}
