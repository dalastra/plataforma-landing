'use client';

import { useEffect, useRef } from 'react';
import { Business } from '@/types';

interface MapComponentProps {
  center: { lat: number; lng: number };
  businesses: Business[];
  selectedBusinessId?: string;
  onSelectBusiness?: (business: Business) => void;
  radiusKm?: number;
}

export default function MapComponent({
  center,
  businesses,
  selectedBusinessId,
  onSelectBusiness,
  radiusKm = 5,
}: MapComponentProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const circleRef = useRef<any>(null);

  useEffect(() => {
    let isMounted = true;

    async function initMap() {
      if (typeof window === 'undefined' || !mapContainerRef.current) return;

      const L = (await import('leaflet')).default;

      // Ensure default icons work correctly in bundlers
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      if (!mapInstanceRef.current && isMounted) {
        const map = L.map(mapContainerRef.current, {
          center: [center.lat, center.lng],
          zoom: 14,
          zoomControl: true,
        });

        // OpenStreetMap clean basemap without API key watermarks
        L.tileLayer(
          'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
          {
            attribution:
              '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 19,
          }
        ).addTo(map);

        mapInstanceRef.current = map;
      }

      const map = mapInstanceRef.current;
      if (!map) return;

      map.setView([center.lat, center.lng], map.getZoom() || 14);

      // Clear existing markers
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];

      if (circleRef.current) {
        circleRef.current.remove();
      }

      // Add radius circle around user/searched center
      circleRef.current = L.circle([center.lat, center.lng], {
        radius: radiusKm * 1000,
        color: '#3b82f6',
        fillColor: '#3b82f6',
        fillOpacity: 0.08,
        weight: 1.5,
        dashArray: '4, 8',
      }).addTo(map);

      // User Center Marker
      const centerMarkerHtml = `
        <div style="
          width: 20px; height: 20px; background: #3b82f6; border: 3px solid white;
          border-radius: 50%; box-shadow: 0 0 15px rgba(59,130,246,0.8);
          animation: pulse 2s infinite;
        "></div>
      `;
      const centerIcon = L.divIcon({
        className: 'custom-center-pin',
        html: centerMarkerHtml,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });
      const userMarker = L.marker([center.lat, center.lng], { icon: centerIcon })
        .addTo(map)
        .bindPopup('<b>Você está aqui</b> (Centro da busca)');
      markersRef.current.push(userMarker);

      // Business markers
      businesses.forEach((biz) => {
        const isSelected = biz.id === selectedBusinessId;
        const isHigh = biz.opportunityScore === 'high';
        const isMed = biz.opportunityScore === 'medium';
        const pinColor = isHigh ? '#10b981' : isMed ? '#f59e0b' : '#64748b';

        const customMarkerHtml = `
          <div style="
            display: flex; align-items: center; justify-content: center;
            width: ${isSelected ? '36px' : '30px'};
            height: ${isSelected ? '36px' : '30px'};
            background: ${pinColor};
            border: 2px solid ${isSelected ? '#ffffff' : '#09090b'};
            border-radius: 50%;
            color: #ffffff; font-weight: bold; font-size: 11px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.4);
            cursor: pointer; transition: transform 0.2s;
          ">
            ${isHigh ? '⭐' : '📍'}
          </div>
        `;

        const icon = L.divIcon({
          className: 'custom-biz-pin',
          html: customMarkerHtml,
          iconSize: isSelected ? [36, 36] : [30, 30],
          iconAnchor: isSelected ? [18, 18] : [15, 15],
        });

        const marker = L.marker([biz.lat, biz.lng], { icon }).addTo(map);

        const popupContent = `
          <div style="padding: 4px; font-family: sans-serif; min-width: 200px;">
            <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: ${pinColor}; margin-bottom: 2px;">
              ${biz.opportunityScore === 'high' ? 'Alta Oportunidade' : biz.opportunityScore === 'medium' ? 'Média Oportunidade' : 'Baixa Oportunidade'}
            </div>
            <div style="font-size: 14px; font-weight: 700; color: #18181b; margin-bottom: 4px;">
              ${biz.name}
            </div>
            <div style="font-size: 12px; color: #52525b; margin-bottom: 6px;">
              ${biz.category}
            </div>
            <div style="font-size: 11px; color: #71717a; margin-bottom: 8px;">
              ${biz.address}
            </div>
            <button id="btn-popup-${biz.id}" style="
              width: 100%; padding: 6px 12px; background: #2563eb; color: white;
              border: none; border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer;
            ">
              Selecionar Negócio
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
  }, [center, businesses, selectedBusinessId, radiusKm, onSelectBusiness]);

  return (
    <div className="relative isolate z-0 w-full h-full min-h-[400px] rounded-xl overflow-hidden border border-zinc-800 shadow-inner">
      <div ref={mapContainerRef} className="w-full h-full" />
    </div>
  );
}
