'use client';

import { useEffect, useRef, useState } from 'react';
import { Business } from '@/types';
import { Layers, MapPin, Maximize2, Minimize2 } from 'lucide-react';

interface MapComponentProps {
  center: { lat: number; lng: number };
  businesses: Business[];
  selectedBusinessId?: string;
  onSelectBusiness?: (business: Business) => void;
  onMapClick?: (coords: { lat: number; lng: number }) => void;
  selectedCustomPin?: { lat: number; lng: number; label?: string } | null;
  radiusKm?: number;
}

export default function MapComponent({
  center,
  businesses,
  selectedBusinessId,
  onSelectBusiness,
  onMapClick,
  selectedCustomPin,
  radiusKm = 5,
}: MapComponentProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const tileLayerRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const customPinMarkerRef = useRef<any>(null);
  const circleRef = useRef<any>(null);

  const [mapType, setMapType] = useState<'roadmap' | 'satellite' | 'osm'>('roadmap');
  const [isFullscreen, setIsFullscreen] = useState(false);

  function toggleFullscreen() {
    setIsFullscreen(!isFullscreen);
    setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    }, 100);
  }

  // Change tile layer when mapType changes
  useEffect(() => {
    async function updateTileLayer() {
      if (!mapInstanceRef.current) return;
      const L = (await import('leaflet')).default;

      if (tileLayerRef.current) {
        tileLayerRef.current.remove();
      }

      let newLayer: any;
      if (mapType === 'roadmap') {
        newLayer = L.tileLayer('https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
          maxZoom: 20,
          subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
          attribution: '&copy; Google Maps',
        });
      } else if (mapType === 'satellite') {
        newLayer = L.tileLayer('https://{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', {
          maxZoom: 20,
          subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
          attribution: '&copy; Google Maps Satélite',
        });
      } else {
        newLayer = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; OpenStreetMap contributors',
        });
      }

      newLayer.addTo(mapInstanceRef.current);
      tileLayerRef.current = newLayer;
    }

    updateTileLayer();
  }, [mapType]);

  // Main Map Initialization and Updates
  useEffect(() => {
    let isMounted = true;

    async function initMap() {
      if (typeof window === 'undefined' || !mapContainerRef.current) return;
      const L = (await import('leaflet')).default;

      // Fix icon URLs
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      if (!mapInstanceRef.current && isMounted) {
        const map = L.map(mapContainerRef.current, {
          center: [center.lat, center.lng],
          zoom: 15,
          zoomControl: true,
          scrollWheelZoom: false,
        });

        // Enable wheel zoom on focus, disable on blur to protect mobile/page scrolling
        map.on('focus', () => map.scrollWheelZoom.enable());
        map.on('blur', () => map.scrollWheelZoom.disable());

        // Default Google Maps Roadmap layer
        const gLayer = L.tileLayer('https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
          maxZoom: 20,
          subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
          attribution: '&copy; Google Maps',
        }).addTo(map);

        tileLayerRef.current = gLayer;

        // Click anywhere to pick location
        map.on('click', (e: any) => {
          if (onMapClick) {
            onMapClick({ lat: e.latlng.lat, lng: e.latlng.lng });
          }
        });

        mapInstanceRef.current = map;
      }

      const map = mapInstanceRef.current;
      if (!map) return;

      map.setView([center.lat, center.lng], map.getZoom() || 15);

      // Clear existing POI markers
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];

      if (circleRef.current) {
        circleRef.current.remove();
      }

      // Add radius circle
      circleRef.current = L.circle([center.lat, center.lng], {
        radius: Math.min(radiusKm * 1000, 15000),
        color: '#2563eb',
        fillColor: '#3b82f6',
        fillOpacity: 0.05,
        weight: 1.5,
        dashArray: '4, 8',
      }).addTo(map);

      // Center marker
      const centerMarkerHtml = `
        <div style="
          width: 22px; height: 22px; background: #2563eb; border: 3px solid white;
          border-radius: 50%; box-shadow: 0 0 16px rgba(37,99,235,0.8);
          animation: pulse 2s infinite; display: flex; align-items: center; justify-content: center;
        ">
          <div style="width: 6px; height: 6px; background: white; border-radius: 50%;"></div>
        </div>
      `;
      const centerIcon = L.divIcon({
        className: 'custom-center-pin',
        html: centerMarkerHtml,
        iconSize: [22, 22],
        iconAnchor: [11, 11],
      });
      const userMarker = L.marker([center.lat, center.lng], { icon: centerIcon })
        .addTo(map)
        .bindPopup('<b>Centro da Busca / Sua Localização</b>');
      markersRef.current.push(userMarker);

      // Business markers on the map
      businesses.forEach((biz) => {
        const isSelected = biz.id === selectedBusinessId;
        const customMarkerHtml = `
          <div style="
            display: flex; align-items: center; justify-content: center;
            width: ${isSelected ? '38px' : '32px'};
            height: ${isSelected ? '38px' : '32px'};
            background: ${isSelected ? '#2563eb' : '#ea580c'};
            border: 2px solid #ffffff;
            border-radius: 50%;
            color: #ffffff; font-weight: bold; font-size: 14px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.35);
            cursor: pointer; transition: transform 0.15s ease-in-out;
          " title="${biz.name}">
            📍
          </div>
        `;

        const icon = L.divIcon({
          className: 'custom-biz-pin',
          html: customMarkerHtml,
          iconSize: isSelected ? [38, 38] : [32, 32],
          iconAnchor: isSelected ? [19, 19] : [16, 16],
        });

        const marker = L.marker([biz.lat, biz.lng], { icon }).addTo(map);

        const popupContent = `
          <div style="padding: 6px; font-family: system-ui, sans-serif; min-width: 210px; color: #18181b;">
            <div style="font-size: 15px; font-weight: 700; margin-bottom: 2px; line-height: 1.2;">
              ${biz.name}
            </div>
            <div style="font-size: 12px; color: #4b5563; margin-bottom: 4px;">
              ${biz.category}
            </div>
            <div style="font-size: 11px; color: #6b7280; margin-bottom: 10px;">
              ${biz.address}
            </div>
            <button id="btn-popup-${biz.id}" style="
              width: 100%; padding: 8px 12px; background: #2563eb; color: white;
              border: none; border-radius: 6px; font-size: 12px; font-weight: 700; cursor: pointer;
              box-shadow: 0 2px 6px rgba(37,99,235,0.3);
            ">
              ✨ Criar Site para este Local
            </button>
          </div>
        `;

        marker.bindPopup(popupContent);

        marker.on('popupopen', () => {
          const btn = document.getElementById(`btn-popup-${biz.id}`);
          if (btn) {
            btn.onclick = () => {
              if (onSelectBusiness) onSelectBusiness(biz);
            };
          }
        });

        marker.on('click', () => {
          if (onSelectBusiness) onSelectBusiness(biz);
        });

        markersRef.current.push(marker);
      });
    }

    initMap();

    return () => {
      isMounted = false;
    };
  }, [center, businesses, selectedBusinessId, radiusKm, onSelectBusiness, onMapClick]);

  // Handle selectedCustomPin (when user clicks anywhere on map)
  useEffect(() => {
    async function updateCustomPin() {
      if (!mapInstanceRef.current) return;
      const L = (await import('leaflet')).default;

      if (customPinMarkerRef.current) {
        customPinMarkerRef.current.remove();
        customPinMarkerRef.current = null;
      }

      if (selectedCustomPin) {
        const pinHtml = `
          <div style="
            display: flex; flex-direction: column; align-items: center; justify-content: center;
            transform: translateY(-24px);
          ">
            <div style="
              background: #ec4899; color: white; border: 2px solid white;
              padding: 4px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;
              white-space: nowrap; box-shadow: 0 4px 12px rgba(0,0,0,0.4);
            ">
              ${selectedCustomPin.label || 'Local Selecionado'}
            </div>
            <div style="
              width: 16px; height: 16px; background: #ec4899; border: 3px solid white;
              border-radius: 50%; box-shadow: 0 0 10px rgba(236,72,153,0.8); margin-top: 2px;
            "></div>
          </div>
        `;

        const icon = L.divIcon({
          className: 'custom-selected-pin',
          html: pinHtml,
          iconSize: [120, 48],
          iconAnchor: [60, 48],
        });

        const marker = L.marker([selectedCustomPin.lat, selectedCustomPin.lng], { icon })
          .addTo(mapInstanceRef.current);

        customPinMarkerRef.current = marker;
      }
    }

    updateCustomPin();
  }, [selectedCustomPin]);

  return (
    <div
      className={`relative isolate z-0 w-full overflow-hidden transition-all duration-200 border border-zinc-800 shadow-xl ${
        isFullscreen
          ? 'fixed inset-0 z-[99999] h-screen w-screen rounded-none bg-black'
          : 'h-full min-h-[500px] rounded-xl'
      }`}
    >
      {/* Map Controls (Layer Switcher & Fullscreen Toggle) */}
      <div className="absolute top-3 right-3 z-[1000] flex items-center gap-2">
        <div className="bg-zinc-950/90 backdrop-blur-md border border-zinc-700/80 rounded-lg p-1 flex items-center gap-1 shadow-lg">
          <button
            onClick={() => setMapType('roadmap')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
              mapType === 'roadmap'
                ? 'bg-blue-600 text-white shadow'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
            }`}
          >
            Google Mapa
          </button>
          <button
            onClick={() => setMapType('satellite')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
              mapType === 'satellite'
                ? 'bg-blue-600 text-white shadow'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
            }`}
          >
            Satélite
          </button>
          <button
            onClick={() => setMapType('osm')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
              mapType === 'osm'
                ? 'bg-blue-600 text-white shadow'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
            }`}
          >
            OSM
          </button>
        </div>

        <button
          onClick={toggleFullscreen}
          className="p-2 rounded-lg bg-zinc-950/90 hover:bg-zinc-900 border border-zinc-700/80 text-zinc-300 hover:text-white shadow-lg backdrop-blur-md transition-colors"
          title={isFullscreen ? 'Sair da tela cheia' : 'Expandir mapa em tela cheia'}
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>

      {/* Interactive Helper Banner */}
      <div className="absolute bottom-4 left-4 z-[1000] pointer-events-none hidden sm:flex items-center gap-2 bg-zinc-950/85 backdrop-blur-md border border-zinc-800/90 px-3 py-1.5 rounded-lg text-xs text-zinc-300 shadow-lg">
        <MapPin className="w-4 h-4 text-pink-400 animate-bounce" />
        <span>Clique em qualquer lugar no mapa ou num marcador para escolher o local</span>
      </div>

      <div ref={mapContainerRef} className="w-full h-full min-h-[500px]" />
    </div>
  );
}
