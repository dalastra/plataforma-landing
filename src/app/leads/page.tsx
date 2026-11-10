'use client';

import { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Plus,
  Bookmark,
  Calendar,
  MessageSquare,
  FileText,
  Trash2,
  ExternalLink,
  ChevronRight,
  Sparkles,
  CheckCircle2,
  XCircle,
  MoreVertical,
} from 'lucide-react';
import { Lead, LeadStatus, LandingPageProject } from '@/types';
import LandingPageEditorModal from '@/components/LandingPageEditorModal';

const STATUS_COLUMNS: { id: LeadStatus; label: string; color: string }[] = [
  { id: 'new', label: 'Novo Lead', color: 'border-zinc-700 text-zinc-300' },
  { id: 'analyzed', label: 'Analisado', color: 'border-blue-500/40 text-blue-400' },
  { id: 'landing_page_created', label: 'LP Criada', color: 'border-indigo-500/40 text-indigo-400' },
  { id: 'contacted', label: 'Abordado', color: 'border-amber-500/40 text-amber-400' },
  { id: 'negotiating', label: 'Em Negociação', color: 'border-purple-500/40 text-purple-400' },
  { id: 'won', label: 'Fechado 🎉', color: 'border-emerald-500/40 text-emerald-400' },
  { id: 'lost', label: 'Não Interessado', color: 'border-rose-500/30 text-rose-400' },
];

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [projects, setProjects] = useState<LandingPageProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterFavorites, setFilterFavorites] = useState(false);

  // Notes editing state
  const [editingLeadId, setEditingLeadId] = useState<string | null>(null);
  const [noteInput, setNoteInput] = useState('');

  // Active Project for Editor preview
  const [activeProject, setActiveProject] = useState<LandingPageProject | null>(null);
  const [activeBusiness, setActiveBusiness] = useState<any>(null);

  useEffect(() => {
    loadLeadsAndProjects();
  }, []);

  async function loadLeadsAndProjects() {
    try {
      setLoading(true);
      const [resLeads, resProjects] = await Promise.all([
        fetch('/api/leads'),
        fetch('/api/projects'),
      ]);
      const dataLeads = await resLeads.json();
      const dataProjects = await resProjects.json();

      if (dataLeads.success) setLeads(dataLeads.leads);
      if (dataProjects.success) setProjects(dataProjects.projects);
    } catch (err) {
      console.error('Error loading leads:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusChange(leadId: string, newStatus: LeadStatus) {
    try {
      const res = await fetch('/api/leads', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: leadId, status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setLeads(leads.map((l) => (l.id === leadId ? data.lead : l)));
      }
    } catch (err) {
      console.error('Error updating status:', err);
    }
  }

  async function handleToggleFavorite(lead: Lead) {
    try {
      const res = await fetch('/api/leads', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: lead.id, isFavorite: !lead.isFavorite }),
      });
      const data = await res.json();
      if (data.success) {
        setLeads(leads.map((l) => (l.id === lead.id ? data.lead : l)));
      }
    } catch (err) {
      console.error('Error updating favorite:', err);
    }
  }

  async function handleSaveNote(leadId: string) {
    try {
      const res = await fetch('/api/leads', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: leadId,
          notes: noteInput,
          lastContactDate: new Date().toISOString(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setLeads(leads.map((l) => (l.id === leadId ? data.lead : l)));
        setEditingLeadId(null);
      }
    } catch (err) {
      console.error('Error updating note:', err);
    }
  }

  async function handleDeleteLead(leadId: string) {
    if (!confirm('Deseja realmente remover este lead?')) return;
    try {
      const res = await fetch(`/api/leads?id=${leadId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setLeads(leads.filter((l) => l.id !== leadId));
      }
    } catch (err) {
      console.error('Error deleting lead:', err);
    }
  }

  function handleOpenProject(projectId: string, business: any) {
    const proj = projects.find((p) => p.id === projectId);
    if (proj) {
      setActiveProject(proj);
      setActiveBusiness(business);
    } else {
      alert('Projeto não encontrado.');
    }
  }

  const filteredLeads = leads.filter((l) => {
    if (filterFavorites && !l.isFavorite) return false;
    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase();
      const matchName = l.business.name.toLowerCase().includes(q);
      const matchCat = l.business.category.toLowerCase().includes(q);
      if (!matchName && !matchCat) return false;
    }
    return true;
  });

  return (
    <div className="p-6 md:p-8 max-w-[1700px] mx-auto w-full space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
              Pipeline Comercial
            </span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            Gerenciamento de Leads (CRM)
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Acompanhe o funil de prospecção, registre observações, datas de contato e acesse as landing pages geradas.
          </p>
        </div>

        {/* Search & Favorites Toggle */}
        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por lead ou segmento..."
              className="w-full pl-9 pr-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <button
            onClick={() => setFilterFavorites(!filterFavorites)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
              filterFavorites
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" fill={filterFavorites ? 'currentColor' : 'none'} />
            <span>Favoritos</span>
          </button>
        </div>
      </div>

      {/* Kanban Board Layout */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 text-zinc-500 text-sm">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-3" />
          <span>Carregando pipeline de vendas...</span>
        </div>
      ) : leads.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-[#121215] border border-zinc-800 text-zinc-400">
          <Users className="w-10 h-10 mx-auto mb-3 text-zinc-600" />
          <h3 className="text-base font-bold text-zinc-200">Nenhum lead cadastrado ainda</h3>
          <p className="text-xs text-zinc-500 mt-1 max-w-md mx-auto">
            Quando você gera uma landing page para um negócio local na aba <strong>Encontrar Negócios</strong>, o lead é automaticamente registrado no seu CRM.
          </p>
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-6 no-scrollbar min-h-[650px]">
          {STATUS_COLUMNS.map((col) => {
            const columnLeads = filteredLeads.filter((l) => l.status === col.id);

            return (
              <div
                key={col.id}
                className="w-80 shrink-0 flex flex-col rounded-2xl bg-[#111114] border border-zinc-800/80 shadow-lg overflow-hidden"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between p-3.5 bg-[#0e0e11] border-b border-zinc-800/80">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold ${col.color}`}>{col.label}</span>
                  </div>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400">
                    {columnLeads.length}
                  </span>
                </div>

                {/* Column Cards Container */}
                <div className="flex-1 p-3 space-y-3 overflow-y-auto max-h-[75vh]">
                  {columnLeads.length === 0 ? (
                    <div className="p-6 text-center text-[12px] text-zinc-600 border border-dashed border-zinc-800/60 rounded-xl">
                      Nenhum lead
                    </div>
                  ) : (
                    columnLeads.map((lead) => {
                      const biz = lead.business;
                      const hasProject = Boolean(lead.projectId);

                      return (
                        <div
                          key={lead.id}
                          className="p-3.5 rounded-xl bg-[#16161a] border border-zinc-800/80 hover:border-zinc-700 transition-all shadow-sm space-y-2.5"
                        >
                          {/* Top Row: Category and Favorite */}
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                              {biz.category}
                            </span>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleToggleFavorite(lead)}
                                className={`p-1 rounded text-zinc-500 hover:text-amber-400 ${
                                  lead.isFavorite ? 'text-amber-400' : ''
                                }`}
                              >
                                <Bookmark className="w-3.5 h-3.5" fill={lead.isFavorite ? 'currentColor' : 'none'} />
                              </button>
                              <button
                                onClick={() => handleDeleteLead(lead.id)}
                                className="p-1 rounded text-zinc-600 hover:text-rose-400"
                                title="Excluir lead"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Business Name */}
                          <div>
                            <h4 className="font-bold text-sm text-white line-clamp-1">{biz.name}</h4>
                            <p className="text-[11px] text-zinc-400 mt-0.5 line-clamp-1">{biz.address}</p>
                          </div>

                          {/* WhatsApp / Contact Status */}
                          <div className="text-[11px] text-zinc-300 flex items-center gap-1.5">
                            <MessageSquare className="w-3 h-3 text-emerald-400" />
                            <span>{biz.whatsapp || biz.phone || 'Sem telefone registrado'}</span>
                          </div>

                          {/* Project Link Badge */}
                          {hasProject ? (
                            <button
                              onClick={() => handleOpenProject(lead.projectId!, biz)}
                              className="w-full flex items-center justify-between p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold hover:bg-indigo-500/20 transition-colors"
                            >
                              <span className="flex items-center gap-1.5">
                                <Sparkles className="w-3.5 h-3.5" />
                                Ver Landing Page
                              </span>
                              <ExternalLink className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <div className="text-[11px] text-zinc-500 italic">
                              Landing page ainda não gerada
                            </div>
                          )}

                          {/* Notes Preview or Editor */}
                          <div className="pt-2 border-t border-zinc-800/80 text-xs">
                            {editingLeadId === lead.id ? (
                              <div className="space-y-2">
                                <textarea
                                  rows={2}
                                  value={noteInput}
                                  onChange={(e) => setNoteInput(e.target.value)}
                                  placeholder="Adicionar anotação comercial..."
                                  className="w-full p-2 text-xs bg-zinc-900 border border-zinc-700 rounded-lg text-zinc-200"
                                />
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    onClick={() => setEditingLeadId(null)}
                                    className="px-2 py-1 text-[11px] text-zinc-400 hover:text-zinc-200"
                                  >
                                    Cancelar
                                  </button>
                                  <button
                                    onClick={() => handleSaveNote(lead.id)}
                                    className="px-2.5 py-1 text-[11px] bg-blue-600 text-white rounded font-semibold"
                                  >
                                    Salvar
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div
                                onClick={() => {
                                  setEditingLeadId(lead.id);
                                  setNoteInput(lead.notes || '');
                                }}
                                className="cursor-pointer group flex items-start justify-between text-zinc-400 hover:text-zinc-200"
                              >
                                <span className="line-clamp-2 text-[11px]">
                                  {lead.notes || '+ Adicionar anotação / histórico...'}
                                </span>
                                <FileText className="w-3 h-3 text-zinc-500 group-hover:text-blue-400 shrink-0 ml-1 mt-0.5" />
                              </div>
                            )}
                          </div>

                          {/* Quick Status Mover */}
                          <div className="pt-2 border-t border-zinc-800/80">
                            <select
                              value={lead.status}
                              onChange={(e) => handleStatusChange(lead.id, e.target.value as LeadStatus)}
                              className="w-full py-1 px-2 text-[11px] bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-300 font-medium focus:outline-none"
                            >
                              {STATUS_COLUMNS.map((s) => (
                                <option key={s.id} value={s.id}>
                                  Mover para: {s.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Editor Modal for Previewing Project */}
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
