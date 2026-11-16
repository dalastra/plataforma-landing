'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import {
  MapPin,
  Search,
  Crosshair,
  Sparkles,
  SlidersHorizontal,
  Layers,
  ArrowRight,
  Building2,
  CheckCircle2,
} from 'lucide-react';
import { Business, LandingPageProject } from '@/types';
import { BUSINESS_CATEGORIES } from '@/lib/constants';
import BusinessCard from '@/components/BusinessCard';
import BusinessDetailModal from '@/components/BusinessDetailModal';
import CreateSiteModal from '@/components/CreateSiteModal';
import LandingPageEditorModal from '@/components/LandingPageEditorModal';

// Dynamically import MapComponent to prevent SSR issues with Leaflet
const MapComponent = dynamic(() => import('@/components/MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[500px] rounded-xl bg-[#121215] border border-zinc-800 flex items-center justify-center text-zinc-500 text-sm">
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <span>Carregando Google Maps interativo...</span>
      </div>
    </div>
  ),
});

export default function DescobertaPage() {
  const [center, setCenter] = useState({ lat: -23.1857, lng: -46.8978 }); // Default to Jundiaí / SP
  const [searchQuery, setSearchQuery] = useState('Rua do Retiro, Jundiaí');
  const [radiusKm, setRadiusKm] = useState<number>(3);
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');

  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [userLocationName, setUserLocationName] = useState<string>('Rua do Retiro, Jundiaí');

  // Selected Custom Pin (clicked on map)
  const [selectedPin, setSelectedPin] = useState<{
    lat: number;
    lng: number;
    name: string;
    address: string;
    neighborhood?: string;
    city?: string;
    phone?: string;
  } | null>(null);

  // Modals state
  const [detailBusiness, setDetailBusiness] = useState<Business | null>(null);
  const [createModalData, setCreateModalData] = useState<{
    isOpen: boolean;
    name?: string;
    category?: string;
    categoryKey?: string;
    address?: string;
    neighborhood?: string;
    city?: string;
    lat: number;
    lng: number;
    phone?: string;
    whatsapp?: string;
  } | null>(null);

  const [activeProject, setActiveProject] = useState<LandingPageProject | null>(null);
  const [activeBusiness, setActiveBusiness] = useState<Business | null>(null);

  // Search places & geocode
  async function handleSearch(lat?: number, lng?: number, queryOverride?: string) {
    try {
      setLoading(true);
      const targetLat = lat !== undefined ? lat : center.lat;
      const targetLng = lng !== undefined ? lng : center.lng;
      const targetQuery = queryOverride !== undefined ? queryOverride : searchQuery;

      const res = await fetch('/api/places/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lat: targetLat,
          lng: targetLng,
          query: targetQuery,
          radiusKm,
          categoryKey: selectedCategory,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setBusinesses(data.businesses || []);
        if (data.center) {
          setCenter(data.center);
        }
        if (data.geocode?.displayName) {
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
    const timer = setTimeout(() => {
      handleSearch();
    }, 0);
    return () => clearTimeout(timer);
  }, [radiusKm, selectedCategory]);

  // Handle map click anywhere (reverse geocode & drop pin)
  async function handleMapClick(coords: { lat: number; lng: number }) {
    try {
      // Set tentative pin immediately for responsive feel
      setSelectedPin({
        lat: coords.lat,
        lng: coords.lng,
        name: 'Local Selecionado no Mapa',
        address: 'Buscando endereço...',
      });

      const res = await fetch(`/api/places/reverse?lat=${coords.lat}&lng=${coords.lng}`);
      const data = await res.json();

      if (data.success) {
        setSelectedPin({
          lat: coords.lat,
          lng: coords.lng,
          name: data.name || 'Local Selecionado',
          address: data.address || `${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}`,
          neighborhood: data.neighborhood,
          city: data.city,
        });
      }
    } catch (err) {
      console.error('Error reverse geocoding:', err);
    }
  }

  // Handle click on business marker or card
  function handleSelectBusiness(biz: Business) {
    setSelectedPin({
      lat: biz.lat,
      lng: biz.lng,
      name: biz.name,
      address: biz.address,
      neighborhood: biz.neighborhood,
      city: biz.city,
      phone: biz.whatsapp || biz.phone,
    });

    setCreateModalData({
      isOpen: true,
      name: biz.name,
      category: biz.category,
      categoryKey: biz.categoryKey,
      address: biz.address,
      neighborhood: biz.neighborhood,
      city: biz.city,
      lat: biz.lat,
      lng: biz.lng,
      phone: biz.phone,
      whatsapp: biz.whatsapp || biz.phone,
    });
  }

  // Open creation modal from selected pin
  function handleOpenCreateFromPin() {
    if (!selectedPin) return;
    setCreateModalData({
      isOpen: true,
      name: selectedPin.name === 'Local Selecionado no Mapa' ? '' : selectedPin.name,
      address: selectedPin.address === 'Buscando endereço...' ? '' : selectedPin.address,
      neighborhood: selectedPin.neighborhood,
      city: selectedPin.city,
      lat: selectedPin.lat,
      lng: selectedPin.lng,
      phone: selectedPin.phone,
      whatsapp: selectedPin.phone,
    });
  }

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
        alert('Não foi possível obter a sua localização. Você pode digitar sua cidade, rua ou bairro manualmente.');
      },
      { timeout: 10000 }
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-[1600px] mx-auto w-full space-y-5">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
            <span className="p-2 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
              🗺️
            </span>
            Google Maps & Criador de Sites
          </h1>
          <p className="text-xs md:text-sm text-zinc-400 mt-1">
            Escolha qualquer local no mapa ou busque pelo endereço. A partir das informações que você fornecer, o sistema gera o site completo com IA.
          </p>
        </div>
      </div>

      {/* Search Bar & Controls */}
      <div className="p-4 rounded-2xl bg-[#121215] border border-zinc-800 shadow-xl space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
          {/* Text Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Buscar endereço, rua, bairro, cidade ou comércio..."
              className="w-full pl-10 pr-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Current Location Button */}
          <button
            onClick={handleUseCurrentLocation}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white text-xs font-semibold transition-colors shrink-0"
          >
            <Crosshair className="w-3.5 h-3.5 text-blue-400" />
            <span>Usar meu GPS</span>
          </button>

          {/* Radius Selector */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-zinc-400 font-medium">Raio:</span>
            <select
              value={radiusKm}
              onChange={(e) => setRadiusKm(Number(e.target.value))}
              className="bg-zinc-900 border border-zinc-800 text-zinc-200 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-blue-500 font-medium"
            >
              <option value={1}>1 km</option>
              <option value={3}>3 km</option>
              <option value={5}>5 km</option>
              <option value={10}>10 km</option>
            </select>
          </div>

          {/* Search Trigger Button */}
          <button
            onClick={() => handleSearch()}
            disabled={loading}
            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-blue-500/20 shrink-0"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Search className="w-3.5 h-3.5" />
            )}
            <span>Buscar no Mapa</span>
          </button>
        </div>

        {/* Current Active Location Display */}
        <div className="flex items-center gap-2 text-xs text-zinc-400 pt-1">
          <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span className="font-semibold text-zinc-300">Localização ativa:</span>
          <span className="truncate">{userLocationName}</span>
        </div>
      </div>

      {/* Selected Location Action Banner (When user clicks on map) */}
      {selectedPin && (
        <div className="p-4 rounded-xl bg-gradient-to-r from-blue-900/40 via-indigo-900/30 to-pink-900/20 border border-blue-500/40 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in duration-300">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-600/30 shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-blue-300 uppercase tracking-wide">
                Local Selecionado no Mapa
              </div>
              <div className="text-sm sm:text-base font-bold text-white">
                {selectedPin.name}
              </div>
              <div className="text-xs text-zinc-300">
                {selectedPin.address}
              </div>
            </div>
          </div>

          <button
            onClick={handleOpenCreateFromPin}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-blue-600/30 transition-all hover:scale-[1.02] shrink-0"
          >
            <Sparkles className="w-4 h-4 text-white" />
            <span>Criar Site para este Local</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Interactive Map */}
      <div className="w-full h-[550px] relative">
        <MapComponent
          center={center}
          businesses={businesses}
          radiusKm={radiusKm}
          onSelectBusiness={handleSelectBusiness}
          onMapClick={handleMapClick}
          selectedCustomPin={
            selectedPin
              ? {
                  lat: selectedPin.lat,
                  lng: selectedPin.lng,
                  label: selectedPin.name,
                }
              : null
          }
        />
      </div>

      {/* Nearby Establishments Section */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-blue-400" />
            <h2 className="text-base font-bold text-white">
              Estabelecimentos ao Redor ({businesses.length})
            </h2>
          </div>
          <span className="text-xs text-zinc-500">
            Clique em qualquer local ou marcador no mapa para criar o site
          </span>
        </div>

        {businesses.length === 0 && !loading && (
          <div className="p-8 text-center bg-[#121215] border border-zinc-800 rounded-xl text-zinc-400">
            Nenhum estabelecimento listado nesta coordenada. Você pode clicar em qualquer lugar do mapa para escolher o ponto exato e criar o site.
          </div>
        )}

        {businesses.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {businesses.slice(0, 18).map((biz) => (
              <div
                key={biz.id}
                className="p-4 rounded-xl bg-[#121215] border border-zinc-800 hover:border-zinc-700 transition-all flex flex-col justify-between gap-3 shadow-md"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-bold text-sm text-white line-clamp-1">{biz.name}</h3>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700 shrink-0">
                      {biz.category}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 line-clamp-2">{biz.address}</p>
                  {(biz.phone || biz.whatsapp) && (
                    <p className="text-xs text-emerald-400 mt-1 font-medium">
                      📱 {biz.whatsapp || biz.phone}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-zinc-800/80">
                  <button
                    onClick={() => {
                      setCenter({ lat: biz.lat, lng: biz.lng });
                      setSelectedPin({
                        lat: biz.lat,
                        lng: biz.lng,
                        name: biz.name,
                        address: biz.address,
                        phone: biz.whatsapp || biz.phone,
                      });
                    }}
                    className="flex-1 py-1.5 px-3 text-xs font-semibold rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 transition-colors"
                  >
                    Ver no Mapa
                  </button>

                  <button
                    onClick={() => handleSelectBusiness(biz)}
                    className="flex-1 py-1.5 px-3 flex items-center justify-center gap-1.5 text-xs font-bold rounded-lg bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/20 transition-all hover:scale-[1.02]"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Criar Site</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Site Modal (Formulário Inteligente com Informações do Negócio) */}
      {createModalData?.isOpen && (
        <CreateSiteModal
          isOpen={createModalData.isOpen}
          onClose={() => setCreateModalData(null)}
          initialData={createModalData}
          onSuccess={(project: LandingPageProject, business: Business) => {
            setCreateModalData(null);
            setActiveBusiness(business);
            setActiveProject(project);
          }}
        />
      )}

      {/* Landing Page Editor Modal */}
      {activeProject && activeBusiness && (
        <LandingPageEditorModal
          project={activeProject}
          business={activeBusiness}
          onClose={() => {
            setActiveProject(null);
            setActiveBusiness(null);
          }}
          onUpdateProject={(updated: LandingPageProject) => setActiveProject(updated)}
        />
      )}
    </div>
  );
}
