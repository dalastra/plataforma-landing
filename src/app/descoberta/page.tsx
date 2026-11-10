'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import {
  Compass,
  MapPin,
  Search,
  Crosshair,
  Filter,
  Sparkles,
  SlidersHorizontal,
  ChevronDown,
  Layers,
} from 'lucide-react';
import { Business, LandingPageProject } from '@/types';
import { BUSINESS_CATEGORIES } from '@/lib/constants';
import BusinessCard from '@/components/BusinessCard';
import BusinessDetailModal from '@/components/BusinessDetailModal';
import StyleSelectorModal from '@/components/StyleSelectorModal';
import LandingPageEditorModal from '@/components/LandingPageEditorModal';

// Dynamically import MapComponent to prevent SSR issues with Leaflet
const MapComponent = dynamic(() => import('@/components/MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[450px] rounded-xl bg-[#121215] border border-zinc-800 flex items-center justify-center text-zinc-500 text-sm">
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <span>Carregando mapa interativo...</span>
      </div>
    </div>
  ),
});

export default function DescobertaPage() {
  const [center, setCenter] = useState({ lat: -23.55052, lng: -46.633308 });
  const [searchQuery, setSearchQuery] = useState('São Paulo, SP');
  const [radiusKm, setRadiusKm] = useState<number>(5);
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');
  const [filterOpportunity, setFilterOpportunity] = useState<string>('todos');
  const [filterNoWebsite, setFilterNoWebsite] = useState<boolean>(false);

  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [userLocationName, setUserLocationName] = useState<string>('São Paulo, SP, Brasil');
  const [favoriteBizIds, setFavoriteBizIds] = useState<Set<string>>(new Set());

  // Load existing user leads to sync favorites
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
        // Save to leads in DB
        await fetch('/api/leads', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            businessId: biz.id,
            business: biz,
            status: 'new',
            isFavorite: true,
            notes: 'Salvo a partir da busca de estabelecimentos.',
          }),
        });
      }
    } catch (err) {
      console.error('Error saving lead bookmark:', err);
    }
  }

  // Modals state
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [styleModalBusiness, setStyleModalBusiness] = useState<Business | null>(null);
  const [activeProject, setActiveProject] = useState<LandingPageProject | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Search places
  async function handleSearch(lat?: number, lng?: number, queryOverride?: string) {
    try {
      setLoading(true);
      const res = await fetch('/api/places/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lat: lat || center.lat,
          lng: lng || center.lng,
          query: queryOverride !== undefined ? queryOverride : searchQuery,
          radiusKm,
          categoryKey: selectedCategory,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setBusinesses(data.businesses);
        if (data.center) {
          setCenter(data.center);
        }
        if (data.geocode) {
          setUserLocationName(data.geocode.displayName);
        }
      }
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setLoading(false);
    }
  }

  // Initial load
  useEffect(() => {
    handleSearch();
  }, [radiusKm, selectedCategory]);

  // Request browser GPS position
  function handleUseCurrentLocation() {
    if (!navigator.geolocation) {
      alert('Geolocalização não é suportada pelo seu navegador.');
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const newLat = pos.coords.latitude;
        const newLng = pos.coords.longitude;
        setCenter({ lat: newLat, lng: newLng });
        setSearchQuery('');
        setUserLocationName('Sua localização atual');
        handleSearch(newLat, newLng, '');
      },
      (err) => {
        setLoading(false);
        console.warn('Geolocation error:', err);
        alert('Não foi possível obter a sua localização. Você pode digitar sua cidade ou bairro manualmente.');
      },
      { timeout: 10000 }
    );
  }

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
      alert('Erro ao comunicar com a IA');
    } finally {
      setIsGenerating(false);
    }
  }

  // Filtered list
  const filteredBusinesses = businesses.filter((b) => {
    if (filterOpportunity !== 'todos' && b.opportunityScore !== filterOpportunity) return false;
    if (filterNoWebsite && b.websiteStatus === 'own_website') return false;
    return true;
  });

  return (
    <div className="p-4 md:p-6 max-w-[1600px] mx-auto w-full space-y-5">
      {/* Search Bar & Geolocation Controls */}
      <div className="p-4 rounded-2xl bg-[#121215] border border-zinc-800 shadow-xl space-y-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
          {/* Text Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Digite uma cidade, bairro ou endereço (ex: Moema, São Paulo ou Copacabana, RJ)..."
              className="w-full pl-10 pr-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Current Location Button */}
          <button
            onClick={handleUseCurrentLocation}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white text-xs font-semibold transition-colors shrink-0"
            title="Usar GPS do dispositivo"
          >
            <Crosshair className="w-4 h-4 text-blue-400" />
            <span>Usar Minha Localização</span>
          </button>

          {/* Radius Selector */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-xs text-zinc-400 font-medium pl-1">Raio:</span>
            {[1, 3, 5, 10, 20].map((r) => (
              <button
                key={r}
                onClick={() => setRadiusKm(r)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  radiusKm === r
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-zinc-200'
                }`}
              >
                {r} km
              </button>
            ))}
          </div>

          {/* Search Trigger Button */}
          <button
            onClick={() => handleSearch()}
            disabled={loading}
            className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-md shadow-blue-600/25 transition-all shrink-0 disabled:opacity-50"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
            <span>Buscar Negócios</span>
          </button>
        </div>

        {/* Category Pills Slider */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 no-scrollbar text-xs">
          <button
            onClick={() => setSelectedCategory('todos')}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all ${
              selectedCategory === 'todos'
                ? 'bg-zinc-800 text-white border border-zinc-700'
                : 'text-zinc-400 hover:text-zinc-200 bg-zinc-900/60 border border-zinc-800/80'
            }`}
          >
            Todas as Categorias
          </button>

          {BUSINESS_CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.key;
            return (
              <button
                key={cat.key}
                onClick={() => setSelectedCategory(cat.key)}
                className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200 bg-zinc-900/60 border border-zinc-800/80'
                }`}
              >
                {cat.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Split Layout: Map on Top/Left, Results on Bottom/Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 h-[calc(100vh-250px)] min-h-[600px]">
        {/* Left: Interactive Map */}
        <div
          className={`lg:col-span-7 flex flex-col h-full rounded-2xl overflow-hidden bg-[#121215] border border-zinc-800 shadow-xl relative isolate z-0 transition-all duration-300 ${
            selectedBusiness || styleModalBusiness || activeProject
              ? 'opacity-0 invisible pointer-events-none select-none scale-95'
              : 'opacity-100 visible pointer-events-auto scale-100'
          }`}
        >
          <div className="flex items-center justify-between px-4 py-2.5 bg-[#0c0c0e] border-b border-zinc-800">
            <div className="flex items-center gap-2 text-xs text-zinc-300 font-medium">
              <MapPin className="w-3.5 h-3.5 text-blue-400" />
              <span className="truncate max-w-[350px]">{userLocationName}</span>
            </div>
            <div className="text-[11px] text-zinc-500">
              Raio de busca: <strong>{radiusKm} km</strong>
            </div>
          </div>
          <div className="flex-1 relative isolate">
            <MapComponent
              center={center}
              businesses={filteredBusinesses}
              selectedBusinessId={selectedBusiness?.id}
              onSelectBusiness={(b) => setSelectedBusiness(b)}
              radiusKm={radiusKm}
            />
          </div>
        </div>

        {/* Right: Opportunities List & Quick Filters */}
        <div className="lg:col-span-5 flex flex-col h-full rounded-2xl bg-[#121215] border border-zinc-800 shadow-xl overflow-hidden">
          {/* Filter Bar Header */}
          <div className="p-4 border-b border-zinc-800 bg-[#0c0c0e] space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-white">Resultados Mapeados</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/20 font-semibold">
                  {filteredBusinesses.length}
                </span>
              </div>

              {/* Opportunity Filter Dropdown */}
              <select
                value={filterOpportunity}
                onChange={(e) => setFilterOpportunity(e.target.value)}
                className="text-xs bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-1 text-zinc-300 focus:outline-none"
              >
                <option value="todos">Todas as Oportunidades</option>
                <option value="high">Apenas Alta Oportunidade</option>
                <option value="medium">Apenas Média Oportunidade</option>
                <option value="low">Baixa Oportunidade</option>
              </select>
            </div>

            {/* Quick Toggle: Sem Site */}
            <label className="flex items-center gap-2 text-xs text-zinc-400 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={filterNoWebsite}
                onChange={(e) => setFilterNoWebsite(e.target.checked)}
                className="rounded border-zinc-700 bg-zinc-900 text-blue-600 focus:ring-0"
              />
              <span>Ocultar negócios que já possuem site próprio</span>
            </label>
          </div>

          {/* Scrollable Cards Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-64 text-zinc-500 text-sm">
                <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-2" />
                <span>Mapeando estabelecimentos e analisando IA...</span>
              </div>
            ) : filteredBusinesses.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center p-6 text-zinc-500 text-sm">
                <Compass className="w-8 h-8 mb-2 opacity-50" />
                <p className="font-medium text-zinc-400">Nenhum estabelecimento encontrado com esses filtros.</p>
                <p className="text-xs text-zinc-600 mt-1">Tente aumentar o raio de busca ou selecionar outra categoria.</p>
              </div>
            ) : (
              filteredBusinesses.map((biz) => (
                <BusinessCard
                  key={biz.id}
                  business={biz}
                  isFavorite={favoriteBizIds.has(biz.id)}
                  onToggleFavorite={handleToggleFavorite}
                  onSelect={(b) => setSelectedBusiness(b)}
                  onGenerateLandingPage={(b) => setStyleModalBusiness(b)}
                />
              ))
            )}
          </div>
        </div>
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
          }}
        />
      )}
    </div>
  );
}
