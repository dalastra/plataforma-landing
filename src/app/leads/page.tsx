'use client';

import { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Bookmark,
  Calendar,
  MessageSquare,
  FileText,
  Trash2,
  ExternalLink,
  Sparkles,
  TrendingUp,
  DollarSign,
  Eye,
  Download,
  LayoutGrid,
  List,
  CheckCircle2,
  XCircle,
  Phone,
  ArrowRight,
  Plus,
} from 'lucide-react';
import { Lead, LeadStatus, LandingPageProject } from '@/types';
import LandingPageEditorModal from '@/components/LandingPageEditorModal';

const CRM_STAGES: { id: LeadStatus; label: string; badgeColor: string; headerBorder: string }[] = [
  { id: 'new', label: '1. Novos Mapeados', badgeColor: 'bg-zinc-800 text-zinc-300 border-zinc-700', headerBorder: 'border-t-zinc-600' },
  { id: 'landing_page_created', label: '2. Demo Criada', badgeColor: 'bg-blue-500/15 text-blue-400 border-blue-500/30', headerBorder: 'border-t-blue-500' },
  { id: 'contacted', label: '3. Abordagem Enviada', badgeColor: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30', headerBorder: 'border-t-indigo-500' },
  { id: 'demo_viewed', label: '4. Visualizou Demo 👁️', badgeColor: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40', headerBorder: 'border-t-emerald-500' },
  { id: 'negotiating', label: '5. Em Negociação', badgeColor: 'bg-amber-500/15 text-amber-400 border-amber-500/30', headerBorder: 'border-t-amber-500' },
  { id: 'won', label: '6. Fechado 🎉', badgeColor: 'bg-green-500/20 text-green-300 border-green-500/40', headerBorder: 'border-t-green-500' },
  { id: 'lost', label: '7. Perdido', badgeColor: 'bg-rose-500/15 text-rose-400 border-rose-500/30', headerBorder: 'border-t-rose-500' },
];

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [projects, setProjects] = useState<LandingPageProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterFavorites, setFilterFavorites] = useState(false);
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');

  // Edit deal value modal / state
  const [editingValueLead, setEditingValueLead] = useState<Lead | null>(null);
  const [dealValueInput, setDealValueInput] = useState<string>('');

  // Edit note state
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

  async function handleSaveDealValue(leadId: string) {
    const num = parseFloat(dealValueInput.replace(/[^\d.,]/g, '').replace(',', '.'));
    const val = isNaN(num) ? 0 : num;

    try {
      const res = await fetch('/api/leads', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: leadId, dealValue: val }),
      });
      const data = await res.json();
      if (data.success) {
        setLeads(leads.map((l) => (l.id === leadId ? data.lead : l)));
        setEditingValueLead(null);
      }
    } catch (err) {
      console.error('Error saving deal value:', err);
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

  // Filtered leads
  const filteredLeads = leads.filter((l) => {
    if (filterFavorites && !l.isFavorite) return false;
    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase();
      const matchName = l.business?.name?.toLowerCase().includes(q);
      const matchCat = l.business?.category?.toLowerCase().includes(q);
      if (!matchName && !matchCat) return false;
    }
    return true;
  });

  // KPI calculations
  const totalLeadsCount = leads.length;
  const pipelineValue = leads
    .filter((l) => l.status !== 'lost' && l.status !== 'won')
    .reduce((sum, l) => sum + (l.dealValue || 0), 0);
  const wonValue = leads
    .filter((l) => l.status === 'won')
    .reduce((sum, l) => sum + (l.dealValue || 0), 0);
  const viewedDemosCount = leads.filter((l) => (l.demoViewsCount || 0) > 0).length;

  return (
    <div className="p-4 md:p-8 max-w-[1700px] mx-auto w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
              Pipeline Comercial & CRM
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
            Funil de Prospecção & Vendas
          </h1>
          <p className="text-xs md:text-sm text-zinc-400 mt-1">
            Gerencie o avanço de cada oportunidade, acompanhe visualizações de demonstrações e controle seu pipeline financeiro.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Export Button */}
          <a
            href="/api/leads/export"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 hover:text-white border border-zinc-800 text-xs font-semibold transition-colors"
            title="Exportar todos os leads para planilha Excel/CSV"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Exportar Excel / CSV</span>
          </a>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-zinc-900 p-1 rounded-xl border border-zinc-800">
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === 'kanban' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
              }`}
              title="Visualização em Quadro Kanban"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Kanban</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === 'table' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
              }`}
              title="Visualização em Tabela Detalhada"
            >
              <List className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Tabela</span>
            </button>
          </div>

          {/* Search Input */}
          <div className="relative w-48 sm:w-60">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar lead ou categoria..."
              className="w-full pl-9 pr-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-[#121215] border border-zinc-800/80 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Total de Leads</div>
            <div className="text-2xl font-bold text-white mt-0.5">{totalLeadsCount}</div>
            <div className="text-[11px] text-zinc-400 mt-1">Negócios mapeados</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#121215] border border-zinc-800/80 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Pipeline Aberto</div>
            <div className="text-2xl font-bold text-emerald-400 mt-0.5">
              R$ {pipelineValue.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
            </div>
            <div className="text-[11px] text-zinc-400 mt-1">Em negociação ativa</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-600/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#121215] border border-zinc-800/80 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Demos Visualizadas</div>
            <div className="text-2xl font-bold text-purple-400 mt-0.5">{viewedDemosCount}</div>
            <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Leads engajados com a demo
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-600/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
            <Eye className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#121215] border border-zinc-800/80 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Contratos Fechados</div>
            <div className="text-2xl font-bold text-green-400 mt-0.5">
              R$ {wonValue.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
            </div>
            <div className="text-[11px] text-green-400/80 mt-1">Faturamento consolidado</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-green-600/10 border border-green-500/20 text-green-400 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Content: Kanban vs Table */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 text-zinc-500 text-sm">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-3" />
          <span>Carregando pipeline de vendas...</span>
        </div>
      ) : filteredLeads.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-[#121215] border border-zinc-800 text-zinc-400">
          <Users className="w-10 h-10 mx-auto mb-3 text-zinc-600" />
          <h3 className="text-base font-bold text-zinc-200">Nenhum lead encontrado</h3>
          <p className="text-xs text-zinc-500 mt-1">
            Vá até a aba <strong>Encontrar Negócios</strong> para mapear estabelecimentos e salvá-los no seu funil comercial.
          </p>
        </div>
      ) : viewMode === 'kanban' ? (
        /* KANBAN BOARD VIEW */
        <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-thin">
          {CRM_STAGES.map((col) => {
            const stageLeads = filteredLeads.filter((l) => {
              if (col.id === 'demo_viewed') {
                return l.status === 'demo_viewed' || ((l.demoViewsCount || 0) > 0 && l.status !== 'won' && l.status !== 'lost');
              }
              return l.status === col.id;
            });

            return (
              <div
                key={col.id}
                className="w-80 shrink-0 flex flex-col rounded-2xl bg-[#121215] border border-zinc-800 overflow-hidden shadow-md"
              >
                {/* Column Header */}
                <div className={`p-3.5 bg-[#0e0e11] border-b border-zinc-800 border-t-2 ${col.headerBorder} flex items-center justify-between`}>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-zinc-200">{col.label}</span>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 font-semibold">
                      {stageLeads.length}
                    </span>
                  </div>
                </div>

                {/* Cards Container */}
                <div className="flex-1 p-3 space-y-3 overflow-y-auto max-h-[calc(100vh-320px)]">
                  {stageLeads.map((lead) => {
                    const phone = lead.business?.whatsapp || lead.business?.phone || '';
                    const cleanPhone = phone.replace(/\D/g, '');
                    const waUrl = cleanPhone
                      ? `https://wa.me/${cleanPhone.startsWith('55') ? cleanPhone : '55' + cleanPhone}`
                      : null;

                    return (
                      <div
                        key={lead.id}
                        className="p-3.5 rounded-xl bg-zinc-900/90 border border-zinc-800/80 hover:border-zinc-700 transition-all shadow-sm space-y-2.5 group"
                      >
                        {/* Card Header: Category & Favorite */}
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 line-clamp-1">
                            {lead.business?.category}
                          </span>
                          <button
                            onClick={() => handleToggleFavorite(lead)}
                            className={`p-1 rounded-md transition-colors ${
                              lead.isFavorite ? 'text-amber-400' : 'text-zinc-600 hover:text-zinc-400'
                            }`}
                          >
                            <Bookmark className="w-3.5 h-3.5" fill={lead.isFavorite ? 'currentColor' : 'none'} />
                          </button>
                        </div>

                        {/* Business Name */}
                        <div>
                          <h4 className="font-bold text-sm text-zinc-100 group-hover:text-blue-400 transition-colors line-clamp-1">
                            {lead.business?.name}
                          </h4>
                          <p className="text-[11px] text-zinc-400 line-clamp-1 mt-0.5">
                            {lead.business?.address}
                          </p>
                        </div>

                        {/* Views Alert Badge if demo was opened */}
                        {(lead.demoViewsCount || 0) > 0 && (
                          <div className="p-2 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-[11px] flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                              <Eye className="w-3.5 h-3.5" />
                              <span className="font-bold">{lead.demoViewsCount}x visualizou</span>
                            </div>
                            {lead.lastDemoViewedAt && (
                              <span className="text-[10px] text-emerald-400/80">
                                {new Date(lead.lastDemoViewedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            )}
                          </div>
                        )}

                        {/* Deal Value Pill */}
                        <div className="flex items-center justify-between pt-1 border-t border-zinc-800/60 text-xs">
                          <span className="text-zinc-400 text-[11px]">Proposta:</span>
                          <button
                            onClick={() => {
                              setEditingValueLead(lead);
                              setDealValueInput(String(lead.dealValue || ''));
                            }}
                            className="font-bold text-emerald-400 hover:underline text-xs flex items-center gap-1"
                            title="Editar valor estimado da proposta"
                          >
                            <span>R$ {(lead.dealValue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 0 })}</span>
                            <span className="text-[10px] text-zinc-500 font-normal">✎</span>
                          </button>
                        </div>

                        {/* Stage Selector & Quick Actions */}
                        <div className="flex items-center justify-between gap-1.5 pt-2 border-t border-zinc-800/60">
                          <select
                            value={lead.status}
                            onChange={(e) => handleStatusChange(lead.id, e.target.value as LeadStatus)}
                            className="flex-1 text-[11px] bg-zinc-950 border border-zinc-800 rounded-lg px-2 py-1 text-zinc-300 focus:outline-none focus:border-blue-500 cursor-pointer"
                          >
                            {CRM_STAGES.map((s) => (
                              <option key={s.id} value={s.id}>
                                {s.label}
                              </option>
                            ))}
                          </select>

                          {waUrl && (
                            <a
                              href={waUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 transition-colors"
                              title="Abrir WhatsApp"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                            </a>
                          )}

                          {lead.projectId && (
                            <button
                              onClick={() => handleOpenProject(lead.projectId!, lead.business)}
                              className="p-1.5 rounded-lg bg-blue-500/15 hover:bg-blue-500/30 text-blue-400 border border-blue-500/30 transition-colors"
                              title="Abrir Demonstração & Editor"
                            >
                              <FileText className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="rounded-2xl bg-[#121215] border border-zinc-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-zinc-800 bg-[#0e0e11] text-zinc-400 font-semibold uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4">Estabelecimento</th>
                  <th className="py-3 px-4">Categoria</th>
                  <th className="py-3 px-4">Status no Funil</th>
                  <th className="py-3 px-4">Proposta</th>
                  <th className="py-3 px-4">Visualizações</th>
                  <th className="py-3 px-4">Contato</th>
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/80 text-zinc-200">
                {filteredLeads.map((lead) => {
                  const phone = lead.business?.whatsapp || lead.business?.phone || '';
                  const cleanPhone = phone.replace(/\D/g, '');
                  const waUrl = cleanPhone
                    ? `https://wa.me/${cleanPhone.startsWith('55') ? cleanPhone : '55' + cleanPhone}`
                    : null;

                  return (
                    <tr key={lead.id} className="hover:bg-zinc-900/50 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-white text-sm">{lead.business?.name}</div>
                        <div className="text-[11px] text-zinc-400 line-clamp-1">{lead.business?.address}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-zinc-800 text-zinc-300 font-medium">
                          {lead.business?.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <select
                          value={lead.status}
                          onChange={(e) => handleStatusChange(lead.id, e.target.value as LeadStatus)}
                          className="text-xs bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1 text-zinc-200 focus:outline-none"
                        >
                          {CRM_STAGES.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => {
                            setEditingValueLead(lead);
                            setDealValueInput(String(lead.dealValue || ''));
                          }}
                          className="font-bold text-emerald-400 hover:underline"
                        >
                          R$ {(lead.dealValue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
                        </button>
                      </td>
                      <td className="py-3.5 px-4">
                        {(lead.demoViewsCount || 0) > 0 ? (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold text-[11px]">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            {lead.demoViewsCount}x
                          </span>
                        ) : (
                          <span className="text-zinc-600 text-[11px]">Não aberta</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        {waUrl ? (
                          <a
                            href={waUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-emerald-400 hover:underline font-medium text-xs"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>{phone}</span>
                          </a>
                        ) : (
                          <span className="text-zinc-500 text-xs">{phone || 'Sem telefone'}</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {lead.projectId && (
                            <button
                              onClick={() => handleOpenProject(lead.projectId!, lead.business)}
                              className="p-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 border border-blue-500/30 text-xs font-semibold"
                              title="Abrir Landing Page"
                            >
                              <FileText className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteLead(lead.id)}
                            className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-950/40"
                            title="Remover Lead"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit Deal Value Modal */}
      {editingValueLead && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-sm bg-[#121215] border border-zinc-800 rounded-2xl p-6 shadow-2xl text-zinc-100">
            <h3 className="font-bold text-base text-white mb-1">
              Valor da Proposta (R$)
            </h3>
            <p className="text-xs text-zinc-400 mb-4">
              Defina o valor do contrato para <strong>{editingValueLead.business?.name}</strong>.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveDealValue(editingValueLead.id);
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Valor em Reais (R$)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-xs font-bold">R$</span>
                  <input
                    type="number"
                    step="50"
                    value={dealValueInput}
                    onChange={(e) => setDealValueInput(e.target.value)}
                    placeholder="1200"
                    autoFocus
                    required
                    className="w-full pl-9 pr-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-zinc-100 font-bold focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingValueLead(null)}
                  className="flex-1 py-2 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-semibold border border-zinc-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/30"
                >
                  Salvar Valor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Editor Modal Preview */}
      {activeProject && (
        <LandingPageEditorModal
          project={activeProject}
          business={activeBusiness || { id: activeProject.businessId, name: activeProject.businessName }}
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
