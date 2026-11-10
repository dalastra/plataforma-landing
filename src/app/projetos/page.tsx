'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FolderGit2,
  Search,
  ExternalLink,
  Download,
  Copy,
  Trash2,
  Edit3,
  Sparkles,
  Calendar,
  Check,
  Compass,
} from 'lucide-react';
import { LandingPageProject, Business } from '@/types';
import LandingPageEditorModal from '@/components/LandingPageEditorModal';

export default function ProjetosPage() {
  const [projects, setProjects] = useState<LandingPageProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Editor Modal
  const [activeProject, setActiveProject] = useState<LandingPageProject | null>(null);
  const [activeBusiness, setActiveBusiness] = useState<any>(null);

  useEffect(() => {
    loadProjects();
  }, []);

  async function loadProjects() {
    try {
      setLoading(true);
      const res = await fetch('/api/projects');
      const data = await res.json();
      if (data.success) {
        setProjects(data.projects);
      }
    } catch (err) {
      console.error('Error loading projects:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteProject(id: string) {
    if (!confirm('Deseja realmente excluir este projeto de landing page?')) return;
    try {
      const res = await fetch(`/api/projects?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setProjects(projects.filter((p) => p.id !== id));
      }
    } catch (err) {
      console.error('Error deleting project:', err);
    }
  }

  async function handleDuplicateProject(proj: LandingPageProject) {
    try {
      const duplicated: LandingPageProject = {
        ...proj,
        id: `proj-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        businessName: `${proj.businessName} (Cópia)`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(duplicated),
      });
      const data = await res.json();
      if (data.success) {
        setProjects([data.project, ...projects]);
      }
    } catch (err) {
      console.error('Error duplicating project:', err);
    }
  }

  function handleCopyLink(id: string) {
    const url = `${window.location.origin}/preview/${id}`;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  function handleOpenEditor(proj: LandingPageProject) {
    setActiveProject(proj);
    setActiveBusiness({
      id: proj.businessId,
      name: proj.businessName,
      category: proj.category,
      categoryKey: 'geral',
      address: proj.content.location.address || 'Endereço comercial',
      lat: -23.55,
      lng: -46.63,
      whatsapp: proj.content.whatsappNumber,
      phone: proj.content.location.phone,
      instagram: proj.content.instagramHandle,
      websiteStatus: 'none',
      photos: [proj.content.hero.backgroundImage || ''],
      services: proj.content.services.items.map((i) => i.title),
      opportunityScore: 'high',
      opportunityReason: 'Landing page gerada pronta.',
      verifiedFields: { hasPhysicalLocation: true, hasPhone: true, hasSocial: true, hasReviews: true },
    });
  }

  const filteredProjects = projects.filter((p) => {
    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase();
      return (
        p.businessName.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.style.name.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto w-full space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              Repositório de Demonstrações
            </span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            Meus Projetos de Landing Pages
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Todas as páginas geradas permanecem salvas para edição contínua, apresentação ao vivo e exportação em ZIP.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por estabelecimento ou estilo..."
            className="w-full pl-9 pr-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Grid of Projects */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 text-zinc-500 text-sm">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-3" />
          <span>Carregando seus projetos...</span>
        </div>
      ) : projects.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-[#121215] border border-zinc-800 text-zinc-400">
          <FolderGit2 className="w-10 h-10 mx-auto mb-3 text-zinc-600" />
          <h3 className="text-base font-bold text-zinc-200">Nenhuma landing page gerada ainda</h3>
          <p className="text-xs text-zinc-500 mt-1 mb-4">
            Vá até a aba <strong>Encontrar Negócios</strong> ou <strong>Oportunidades</strong> e clique em "Gerar Landing Page com IA".
          </p>
          <Link
            href="/descoberta"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Mapear Estabelecimentos</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProjects.map((proj) => {
            const isCopied = copiedId === proj.id;

            return (
              <div
                key={proj.id}
                className="group relative flex flex-col justify-between p-5 rounded-2xl bg-[#121215] border border-zinc-800 hover:border-zinc-700 transition-all shadow-md hover:shadow-xl"
              >
                <div>
                  {/* Top Bar: Category & Date */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      {proj.category}
                    </span>
                    <span className="text-[11px] text-zinc-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(proj.createdAt).toLocaleDateString('pt-BR')}
                    </span>
                  </div>

                  {/* Title & Tagline */}
                  <h3 className="font-bold text-lg text-white mb-1 group-hover:text-blue-400 transition-colors line-clamp-1">
                    {proj.businessName}
                  </h3>
                  <p className="text-xs text-zinc-400 line-clamp-2 mb-3">
                    {proj.content.hero.headline}
                  </p>

                  {/* Visual Style Indicator */}
                  <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/80 mb-4 text-xs space-y-1.5">
                    <div className="flex items-center justify-between text-zinc-300">
                      <span className="text-zinc-500 text-[11px]">Estilo Visual:</span>
                      <strong className="text-zinc-200">{proj.style.name}</strong>
                    </div>
                    <div className="flex items-center justify-between text-zinc-300">
                      <span className="text-zinc-500 text-[11px]">Tema:</span>
                      <span>{proj.style.theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2 pt-3 border-t border-zinc-800/80">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenEditor(proj)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-md transition-all hover:scale-[1.01]"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Abrir Editor & Pitch</span>
                    </button>

                    <a
                      href={`/preview/${proj.id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 transition-colors"
                      title="Visualizar em Nova Aba"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-1 text-xs">
                    <button
                      onClick={() => handleCopyLink(proj.id)}
                      className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800/80 transition-colors"
                    >
                      {isCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{isCopied ? 'Link Copiado' : 'Copiar Link'}</span>
                    </button>

                    <a
                      href={`/api/export/${proj.id}`}
                      download
                      className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800/80 transition-colors"
                      title="Baixar ZIP HTML/CSS/JS completo"
                    >
                      <Download className="w-3 h-3" />
                      <span>Baixar ZIP</span>
                    </a>

                    <button
                      onClick={() => handleDuplicateProject(proj)}
                      className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800/80 transition-colors"
                      title="Duplicar projeto"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleDeleteProject(proj.id)}
                      className="p-1.5 rounded-lg bg-zinc-900 hover:bg-rose-950 text-zinc-500 hover:text-rose-400 border border-zinc-800/80 transition-colors"
                      title="Excluir projeto"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Editor Modal */}
      {activeProject && (
        <LandingPageEditorModal
          project={activeProject}
          business={activeBusiness}
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
