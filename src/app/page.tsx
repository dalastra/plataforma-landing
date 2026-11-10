'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Compass,
  Sparkles,
  Users,
  FolderGit2,
  TrendingUp,
  MapPin,
  ArrowRight,
  CheckCircle,
  ExternalLink,
  Wand2,
} from 'lucide-react';
import { Business, LandingPageProject, Lead } from '@/types';
import BusinessCard from '@/components/BusinessCard';
import StyleSelectorModal from '@/components/StyleSelectorModal';
import LandingPageEditorModal from '@/components/LandingPageEditorModal';
import BusinessDetailModal from '@/components/BusinessDetailModal';
import { useAuth } from '@/context/AuthContext';

export default function DashboardPage() {
  const { user, profile } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [projects, setProjects] = useState<LandingPageProject[]>([]);
  const [recentOpportunities, setRecentOpportunities] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [styleModalBusiness, setStyleModalBusiness] = useState<Business | null>(null);
  const [activeProject, setActiveProject] = useState<LandingPageProject | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);

        // Fetch user's real leads and projects
        const [resLeads, resProjects] = await Promise.all([
          fetch('/api/leads'),
          fetch('/api/projects'),
        ]);

        const dataLeads = await resLeads.json();
        const dataProjects = await resProjects.json();

        if (dataLeads.success) setLeads(dataLeads.leads || []);
        if (dataProjects.success) setProjects(dataProjects.projects || []);

        // Fetch local opportunities nearby for discovery preview
        const resPlaces = await fetch('/api/places/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: 'São Paulo, SP', radiusKm: 5 }),
        });
        const dataPlaces = await resPlaces.json();
        if (dataPlaces.success) {
          setRecentOpportunities(dataPlaces.businesses.slice(0, 4));
        }
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, [user]);

  async function handleConfirmGenerate(business: Business, style: any) {
    try {
      setIsGenerating(true);
      const res = await fetch('/api/landing-pages/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ business, style }),
      });
      const data = await res.json();
      if (data.success) {
        setProjects([data.project, ...projects]);
        // Also refresh leads
        const resLeads = await fetch('/api/leads');
        const dataLeads = await resLeads.json();
        if (dataLeads.success) setLeads(dataLeads.leads || []);

        setStyleModalBusiness(null);
        setActiveProject(data.project);
      } else {
        alert(data.error || 'Erro ao gerar landing page');
      }
    } catch (err) {
      console.error('Generation error:', err);
      alert('Erro de conexão ao gerar landing page.');
    } finally {
      setIsGenerating(false);
    }
  }

  // Calculate real metrics strictly from authenticated user's data
  const totalLeadsCount = leads.length;
  const highOpportunitiesCount = leads.filter(
    (l) => l.business?.opportunityScore === 'high'
  ).length;
  const projectsCount = projects.length;
  const leadsContactedCount = leads.filter((l) =>
    ['contacted', 'negotiating', 'won'].includes(l.status)
  ).length;
  const wonCount = leads.filter((l) => l.status === 'won').length;

  const greetingName = profile?.full_name || user?.email?.split('@')[0] || 'Gestor';

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto w-full space-y-8 animate-in fade-in duration-300">
      {/* Top Banner & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-zinc-800/80">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Painel Individual • {greetingName}
            </span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            Prospecção & Landing Pages com IA
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Encontre negócios locais sem site próprio, analise oportunidades e gere páginas de alta conversão para fechar contratos.
          </p>
        </div>

        <Link
          href="/descoberta"
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm shadow-lg shadow-blue-600/25 transition-all hover:scale-[1.02]"
        >
          <Compass className="w-4 h-4" />
          <span>Iniciar Nova Prospecção</span>
        </Link>
      </div>

      {/* Metrics Row (Calculated from authenticated user) */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div className="p-4 rounded-xl bg-[#121215] border border-zinc-800">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-medium">Meus Leads</span>
            <Users className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-white">{totalLeadsCount}</div>
          <div className="text-[11px] text-zinc-500 mt-1">Cadastrados no seu CRM</div>
        </div>

        <div className="p-4 rounded-xl bg-[#121215] border border-zinc-800">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-medium">Alta Oportunidade</span>
            <Sparkles className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400">{highOpportunitiesCount}</div>
          <div className="text-[11px] text-zinc-500 mt-1">Negócios sem site ativo</div>
        </div>

        <div className="p-4 rounded-xl bg-[#121215] border border-zinc-800">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-medium">Landing Pages</span>
            <FolderGit2 className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-white">{projectsCount}</div>
          <div className="text-[11px] text-zinc-500 mt-1">Geradas e salvas</div>
        </div>

        <div className="p-4 rounded-xl bg-[#121215] border border-zinc-800">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-medium">Abordagens</span>
            <TrendingUp className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-white">{leadsContactedCount}</div>
          <div className="text-[11px] text-zinc-500 mt-1">Em negociação / contato</div>
        </div>

        <div className="p-4 rounded-xl bg-[#121215] border border-zinc-800 col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-medium">Convertidos</span>
            <CheckCircle className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400">{wonCount}</div>
          <div className="text-[11px] text-zinc-500 mt-1">Contratos fechados</div>
        </div>
      </div>

      {/* Section: Top Opportunities Nearby */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Oportunidades Próximas para Prospecção
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Negócios locais com boa reputação comercial, sem site próprio identificado.
            </p>
          </div>

          <Link
            href="/oportunidades"
            className="flex items-center gap-1.5 text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors"
          >
            <span>Ver todas as oportunidades</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recentOpportunities.map((biz) => (
            <BusinessCard
              key={biz.id}
              business={biz}
              onSelect={(b) => setSelectedBusiness(b)}
              onGenerateLandingPage={(b) => setStyleModalBusiness(b)}
            />
          ))}
        </div>
      </div>

      {/* Section: User's Recent Projects */}
      <div className="pt-4 border-t border-zinc-800/80">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Minhas Landing Pages Geradas
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Projetos exclusivos da sua conta disponíveis para demonstração e download.
            </p>
          </div>

          {projects.length > 0 && (
            <Link
              href="/projetos"
              className="flex items-center gap-1.5 text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors"
            >
              <span>Ver todos os projetos ({projects.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>

        {projects.length === 0 ? (
          <div className="p-8 rounded-2xl bg-[#121215] border border-zinc-800 text-center text-zinc-400">
            <FolderGit2 className="w-8 h-8 mx-auto mb-2 text-zinc-600" />
            <p className="text-sm font-semibold text-zinc-300">Você ainda não gerou nenhuma landing page.</p>
            <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto mb-4">
              Selecione um estabelecimento acima ou faça uma busca na aba <strong>Encontrar Negócios</strong> para gerar sua primeira página.
            </p>
            <Link
              href="/descoberta"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Explorar Negócios Locais</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {projects.slice(0, 3).map((proj) => (
              <div
                key={proj.id}
                className="p-4 rounded-xl bg-[#121215] border border-zinc-800 hover:border-zinc-700 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      {proj.category}
                    </span>
                    <span className="text-[11px] text-zinc-500">
                      {new Date(proj.createdAt).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <h3 className="font-bold text-base text-white mb-1 line-clamp-1">
                    {proj.businessName}
                  </h3>
                  <p className="text-xs text-zinc-400 mb-4">
                    Estilo: {proj.style.name}
                  </p>
                </div>

                <div className="flex items-center gap-2 pt-3 border-t border-zinc-800/80">
                  <button
                    onClick={() => {
                      const matchedBiz = recentOpportunities.find((b) => b.id === proj.businessId) || {
                        id: proj.businessId,
                        name: proj.businessName,
                        category: proj.category,
                        categoryKey: 'geral',
                        address: 'Endereço comercial',
                        lat: -23.55,
                        lng: -46.63,
                        websiteStatus: 'none',
                        photos: [],
                        services: [],
                        opportunityScore: 'high',
                        opportunityReason: 'Landing page gerada pronta.',
                        verifiedFields: { hasPhysicalLocation: true, hasPhone: true, hasSocial: true, hasReviews: true },
                      };
                      setActiveProject(proj);
                      setSelectedBusiness(matchedBiz as any);
                    }}
                    className="flex-1 text-center py-2 text-xs font-semibold rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 transition-colors"
                  >
                    Abrir Editor
                  </button>

                  <a
                    href={`/preview/${proj.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-lg bg-blue-600/15 text-blue-400 hover:bg-blue-600/30 transition-colors"
                    title="Ver página"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <BusinessDetailModal
        business={selectedBusiness}
        onClose={() => setSelectedBusiness(null)}
        onGenerateLandingPage={(b) => {
          setSelectedBusiness(null);
          setStyleModalBusiness(b);
        }}
      />

      <StyleSelectorModal
        business={styleModalBusiness}
        onClose={() => setStyleModalBusiness(null)}
        onConfirmGenerate={handleConfirmGenerate}
        isGenerating={isGenerating}
      />

      {activeProject && (
        <LandingPageEditorModal
          project={activeProject}
          business={
            selectedBusiness || {
              id: activeProject.businessId,
              name: activeProject.businessName,
              category: activeProject.category,
              categoryKey: 'geral',
              address: 'Endereço comercial',
              lat: -23.55,
              lng: -46.63,
              websiteStatus: 'none',
              photos: [],
              services: [],
              opportunityScore: 'high',
              opportunityReason: 'Landing page gerada sob medida.',
              verifiedFields: { hasPhysicalLocation: true, hasPhone: true, hasSocial: true, hasReviews: true },
            }
          }
          onClose={() => setActiveProject(null)}
          onUpdateProject={(updated) => {
            setActiveProject(updated);
            setProjects(projects.map((p) => (p.id === updated.id ? updated : p)));
          }}
        />
      )}
    </div>
  );
}
