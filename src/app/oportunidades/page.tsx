'use client';

import { useState, useEffect } from 'react';
import {
  Sparkles,
  Search,
  Filter,
  Star,
  MapPin,
  Globe,
  SlidersHorizontal,
  Compass,
} from 'lucide-react';
import { Business, LandingPageProject, OpportunityLevel } from '@/types';
import { BUSINESS_CATEGORIES } from '@/lib/constants';
import BusinessCard from '@/components/BusinessCard';
import BusinessDetailModal from '@/components/BusinessDetailModal';
import StyleSelectorModal from '@/components/StyleSelectorModal';
import LandingPageEditorModal from '@/components/LandingPageEditorModal';

export default function OportunidadesPage() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [opportunityTab, setOpportunityTab] = useState<'all' | OpportunityLevel>('all');
  const [selectedCategory, setSelectedCategory] = useState('todos');
  const [minRating, setMinRating] = useState<number>(0);
  const [maxDistance, setMaxDistance] = useState<number>(20);
  const [websiteFilter, setWebsiteFilter] = useState<'all' | 'no_website' | 'has_website'>('no_website');

  // Modals state
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [styleModalBusiness, setStyleModalBusiness] = useState<Business | null>(null);
  const [activeProject, setActiveProject] = useState<LandingPageProject | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [favoriteBizIds, setFavoriteBizIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function loadUserLeads() {
      try {
        const res = await fetch('/api/leads');
        const data = await res.json();
        if (data.success && data.leads) {
          const ids = new Set<string>(data.leads.map((l: any) => l.businessId));
          setFavoriteBizIds(ids);
        }
      } catch (err) {
        console.error('Error fetching user leads:', err);
      }
    }
    loadUserLeads();
  }, []);

  async function handleToggleFavorite(biz: Business) {
    const isCurrentlyFav = favoriteBizIds.has(biz.id);
    const newSet = new Set(favoriteBizIds);
    if (isCurrentlyFav) {
      newSet.delete(biz.id);
    } else {
      newSet.add(biz.id);
    }
    setFavoriteBizIds(newSet);

    try {
      if (!isCurrentlyFav) {
        await fetch('/api/leads', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            businessId: biz.id,
            business: biz,
            status: 'new',
            isFavorite: true,
            notes: 'Salvo a partir do painel de oportunidades.',
          }),
        });
      }
    } catch (err) {
      console.error('Error saving lead bookmark:', err);
    }
  }

  useEffect(() => {
    async function loadOpportunities() {
      try {
        setLoading(true);
        const res = await fetch('/api/places/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: 'São Paulo, SP', radiusKm: 10 }),
        });
        const data = await res.json();
        if (data.success) {
          setBusinesses(data.businesses);
        }
      } catch (err) {
        console.error('Failed to load opportunities:', err);
      } finally {
        setLoading(false);
      }
    }

    loadOpportunities();
  }, []);

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
        setStyleModalBusiness(null);
        setActiveProject(data.project);
      } else {
        alert(data.error || 'Erro ao gerar landing page');
      }
    } catch (err) {
      console.error('Generation error:', err);
      alert('Erro de conexão');
    } finally {
      setIsGenerating(false);
    }
  }

  // Filter application
  const filtered = businesses.filter((b) => {
    // Opportunity Level tab
    if (opportunityTab !== 'all' && b.opportunityScore !== opportunityTab) return false;

    // Search query
    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase();
      const matchName = b.name.toLowerCase().includes(q);
      const matchCat = b.category.toLowerCase().includes(q);
      const matchAddress = b.address.toLowerCase().includes(q);
      if (!matchName && !matchCat && !matchAddress) return false;
    }

    // Category
    if (selectedCategory !== 'todos' && b.categoryKey !== selectedCategory) return false;

    // Minimum rating
    if (minRating > 0 && (b.rating || 0) < minRating) return false;

    // Distance
    if (b.distanceKm !== undefined && b.distanceKm > maxDistance) return false;

    // Website filter
    if (websiteFilter === 'no_website' && b.websiteStatus === 'own_website') return false;
    if (websiteFilter === 'has_website' && b.websiteStatus !== 'own_website') return false;

    return true;
  });

  const highCount = businesses.filter((b) => b.opportunityScore === 'high').length;
  const medCount = businesses.filter((b) => b.opportunityScore === 'medium').length;
  const lowCount = businesses.filter((b) => b.opportunityScore === 'low').length;

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto w-full space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
              Análise Preditiva de Conversão
            </span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            Painel de Oportunidades
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Estabelecimentos triados e classificados pela IA com base em presença digital, avaliações e potencial para contratação.
          </p>
        </div>
      </div>

      {/* Tabs: Alta, Média, Baixa Oportunidade */}
      <div className="flex flex-wrap items-center gap-2 border-b border-zinc-800 pb-3">
        <button
          onClick={() => setOpportunityTab('all')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            opportunityTab === 'all'
              ? 'bg-zinc-800 text-white shadow-sm'
              : 'text-zinc-400 hover:text-white bg-zinc-900/60'
          }`}
        >
          <span>Todas as Oportunidades</span>
          <span className="px-1.5 py-0.5 rounded-full bg-zinc-700 text-[10px] text-zinc-200">
            {businesses.length}
          </span>
        </button>

        <button
          onClick={() => setOpportunityTab('high')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            opportunityTab === 'high'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
              : 'text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 border border-emerald-500/20'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Alta Oportunidade</span>
          <span className="px-1.5 py-0.5 rounded-full bg-emerald-950 text-[10px] text-emerald-300 font-bold">
            {highCount}
          </span>
        </button>

        <button
          onClick={() => setOpportunityTab('medium')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            opportunityTab === 'medium'
              ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/20'
              : 'text-amber-400 hover:text-amber-300 bg-amber-500/10 border border-amber-500/20'
          }`}
        >
          <span>Média Oportunidade</span>
          <span className="px-1.5 py-0.5 rounded-full bg-amber-950 text-[10px] text-amber-300 font-bold">
            {medCount}
          </span>
        </button>

        <button
          onClick={() => setOpportunityTab('low')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            opportunityTab === 'low'
              ? 'bg-zinc-700 text-white'
              : 'text-zinc-400 hover:text-zinc-300 bg-zinc-900/60 border border-zinc-800'
          }`}
        >
          <span>Baixa Oportunidade</span>
          <span className="px-1.5 py-0.5 rounded-full bg-zinc-800 text-[10px] text-zinc-400">
            {lowCount}
          </span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 p-4 rounded-xl bg-[#121215] border border-zinc-800">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filtrar por nome ou endereço..."
            className="w-full pl-9 pr-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Category */}
        <div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full py-2 px-3 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-zinc-300 focus:outline-none focus:border-blue-500"
          >
            <option value="todos">Todas as Categorias</option>
            {BUSINESS_CATEGORIES.map((c) => (
              <option key={c.key} value={c.key}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Website Filter */}
        <div>
          <select
            value={websiteFilter}
            onChange={(e) => setWebsiteFilter(e.target.value as any)}
            className="w-full py-2 px-3 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-zinc-300 focus:outline-none focus:border-blue-500"
          >
            <option value="no_website">Apenas Sem Site Próprio</option>
            <option value="all">Todos os Status de Site</option>
            <option value="has_website">Apenas Com Site Próprio</option>
          </select>
        </div>

        {/* Rating Minimum */}
        <div>
          <select
            value={minRating}
            onChange={(e) => setMinRating(Number(e.target.value))}
            className="w-full py-2 px-3 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-zinc-300 focus:outline-none focus:border-blue-500"
          >
            <option value={0}>Qualquer Avaliação</option>
            <option value={4.0}>Mínimo 4.0 ★</option>
            <option value={4.5}>Mínimo 4.5 ★ (Alta Reputação)</option>
            <option value={4.8}>Mínimo 4.8 ★ (Excepcional)</option>
          </select>
        </div>
      </div>

      {/* Grid of Opportunity Cards */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 text-zinc-500 text-sm">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-3" />
          <span>Carregando oportunidades qualificadas...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-[#121215] border border-zinc-800 text-zinc-400">
          <Compass className="w-10 h-10 mx-auto mb-3 text-zinc-600" />
          <h3 className="text-base font-bold text-zinc-200">Nenhuma oportunidade com esses filtros</h3>
          <p className="text-xs text-zinc-500 mt-1">Ajuste os filtros de avaliação, categoria ou status do site.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((biz) => (
            <BusinessCard
              key={biz.id}
              business={biz}
              isFavorite={favoriteBizIds.has(biz.id)}
              onToggleFavorite={handleToggleFavorite}
              onSelect={(b) => setSelectedBusiness(b)}
              onGenerateLandingPage={(b) => setStyleModalBusiness(b)}
            />
          ))}
        </div>
      )}

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
          }}
        />
      )}
    </div>
  );
}
