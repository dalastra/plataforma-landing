import { Business, OpportunityLevel } from '@/types';
import { BUSINESS_CATEGORIES, CategoryDefinition } from './constants';
import { analyzeOpportunity } from './enricher';

export interface GeocodeResult {
  lat: number;
  lng: number;
  displayName: string;
}

export async function geocodeLocation(query: string): Promise<GeocodeResult | null> {
  try {
    const encoded = encodeURIComponent(query);
    const url = `https://nominatim.openstreetmap.org/search?q=${encoded}&format=json&addressdetails=1&limit=1&countrycodes=br`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'PlataformaLandingProspector/1.0 (ncamposdalastra@gmail.com)',
      },
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      // Try global if BR fails
      const fallbackUrl = `https://nominatim.openstreetmap.org/search?q=${encoded}&format=json&limit=1`;
      const fallbackRes = await fetch(fallbackUrl, {
        headers: { 'User-Agent': 'PlataformaLandingProspector/1.0 (ncamposdalastra@gmail.com)' },
      });
      if (!fallbackRes.ok) return null;
      const data = await fallbackRes.json();
      if (!data || data.length === 0) return null;
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
        displayName: data[0].display_name,
      };
    }

    const data = await res.json();
    if (!data || data.length === 0) return null;
    return {
      lat: parseFloat(data[0].lat),
      lng: parseFloat(data[0].lon),
      displayName: data[0].display_name,
    };
  } catch (err) {
    console.error('Geocoding error:', err);
    return null;
  }
}

// Haversine formula to compute distance in km
export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

const CATEGORY_SEARCH_KEYWORDS: Record<string, string[]> = {
  barbearia: ['barbearia', 'salão de beleza', 'cabeleireiro'],
  estetica: ['estética', 'clínica de estética', 'depilação laser', 'spa'],
  odontologia: ['dentista', 'odontologia', 'consultório odontológico', 'clínica odontológica'],
  academia: ['academia', 'crossfit', 'pilates', 'personal trainer', 'fitness'],
  restaurante: ['restaurante', 'churrascaria', 'bistrô', 'buffet'],
  pizzaria: ['pizzaria', 'hamburgueria', 'lanches'],
  oficina: ['oficina mecânica', 'auto center', 'auto elétrica', 'funilaria'],
  petshop: ['pet shop', 'veterinária', 'clínica veterinária', 'banho e tosa'],
  imobiliaria: ['imobiliária', 'corretor de imóveis', 'venda de imóveis'],
  escola: ['escola particular', 'curso de idiomas', 'colégio', 'berçário'],
  servicos: ['contabilidade', 'advocacia', 'gráfica rápida', 'coworking'],
};

// 1. Live Real POI search via OpenStreetMap Nominatim
async function searchPlacesNominatim(
  lat: number,
  lng: number,
  radiusKm: number,
  categoryKey?: string
): Promise<Business[]> {
  const radius = Math.max(radiusKm, 1);
  const latDelta = radius / 111;
  const lonDelta = radius / (111 * Math.cos((lat * Math.PI) / 180));

  const minLon = lng - lonDelta;
  const maxLon = lng + lonDelta;
  const minLat = lat - latDelta;
  const maxLat = lat + latDelta;
  const viewbox = `${minLon.toFixed(6)},${maxLat.toFixed(6)},${maxLon.toFixed(6)},${minLat.toFixed(6)}`;

  let keywordsToSearch: string[] = [];
  if (categoryKey && categoryKey !== 'todos' && CATEGORY_SEARCH_KEYWORDS[categoryKey]) {
    keywordsToSearch = CATEGORY_SEARCH_KEYWORDS[categoryKey].slice(0, 2);
  } else {
    keywordsToSearch = ['barbearia', 'restaurante', 'dentista', 'academia', 'oficina mecânica', 'pet shop'];
  }

  const results: Business[] = [];
  const seenIds = new Set<string>();

  for (const keyword of keywordsToSearch) {
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        keyword
      )}&viewbox=${viewbox}&bounded=1&limit=15&addressdetails=1&extratags=1`;

      const res = await fetch(url, {
        headers: {
          'User-Agent': 'PlataformaLandingProspector/1.0 (ncamposdalastra@gmail.com)',
        },
        signal: AbortSignal.timeout(6000),
      });

      if (!res.ok) continue;

      const items = await res.json();
      if (!Array.isArray(items)) continue;

      for (const item of items) {
        const id = `osm-${item.osm_type || 'node'}-${item.osm_id || item.place_id}`;
        if (seenIds.has(id)) continue;
        seenIds.add(id);

        const name = item.name || (item.display_name ? item.display_name.split(',')[0] : null);
        if (!name || name.trim().length < 2) continue;

        const itemLat = parseFloat(item.lat);
        const itemLng = parseFloat(item.lon);
        if (isNaN(itemLat) || isNaN(itemLng)) continue;

        const dist = calculateDistanceKm(lat, lng, itemLat, itemLng);

        // Match category
        let matchedCat = BUSINESS_CATEGORIES[0];
        if (categoryKey && categoryKey !== 'todos') {
          const found = BUSINESS_CATEGORIES.find((c) => c.key === categoryKey);
          if (found) matchedCat = found;
        } else {
          for (const [catK, keys] of Object.entries(CATEGORY_SEARCH_KEYWORDS)) {
            if (keys.some((k) => name.toLowerCase().includes(k) || (item.type && item.type.includes(k)))) {
              const f = BUSINESS_CATEGORIES.find((c) => c.key === catK);
              if (f) {
                matchedCat = f;
                break;
              }
            }
          }
        }

        const addr = item.address || {};
        const road = addr.road || addr.pedestrian || addr.street || '';
        const houseNum = addr.house_number ? `, ${addr.house_number}` : '';
        const suburb = addr.suburb || addr.neighbourhood || addr.city_district || '';
        const city = addr.city || addr.town || addr.municipality || 'Região Metropolitana';
        const formattedAddress = [road ? `${road}${houseNum}` : '', suburb, city].filter(Boolean).join(' - ') || item.display_name;

        const extratags = item.extratags || {};
        const rawPhone = extratags['contact:phone'] || extratags.phone || extratags['contact:mobile'];
        const rawWhatsapp = extratags['contact:whatsapp'] || extratags.whatsapp || rawPhone;
        const rawWebsite = extratags.website || extratags['contact:website'] || extratags.url;
        const rawInstagram = extratags['contact:instagram'] || extratags.instagram;
        const rawFacebook = extratags['contact:facebook'] || extratags.facebook;

        const analyzed = analyzeOpportunity({
          id,
          name: name.trim(),
          category: matchedCat.name,
          categoryKey: matchedCat.key,
          address: formattedAddress,
          neighborhood: suburb || undefined,
          city: city || undefined,
          lat: itemLat,
          lng: itemLng,
          distanceKm: dist,
          phone: rawPhone,
          whatsapp: rawWhatsapp,
          instagram: rawInstagram,
          facebook: rawFacebook,
          rawWebsite,
          openingHours: extratags.opening_hours ? [extratags.opening_hours] : undefined,
        });

        results.push(analyzed);
      }
    } catch {
      // Ignore individual keyword failure and continue
    }
  }

  return results;
}

// 2. Overpass API search across multi-mirrors
async function searchPlacesOverpassEngine(
  lat: number,
  lng: number,
  radiusKm: number,
  categoryKey?: string
): Promise<Business[]> {
  const radiusMeters = Math.min(radiusKm * 1000, 25000);
  const selectedCat = categoryKey && categoryKey !== 'todos'
    ? BUSINESS_CATEGORIES.find((c) => c.key === categoryKey)
    : null;

  const categoriesToQuery = selectedCat ? [selectedCat] : BUSINESS_CATEGORIES.slice(0, 5);
  const queries: string[] = [];

  for (const cat of categoriesToQuery) {
    for (const tag of cat.osmTags) {
      for (const val of tag.values) {
        queries.push(`node["${tag.key}"="${val}"](around:${radiusMeters},${lat},${lng});`);
        queries.push(`way["${tag.key}"="${val}"](around:${radiusMeters},${lat},${lng});`);
      }
    }
  }

  const overpassQuery = `
    [out:json][timeout:10];
    (
      ${queries.slice(0, 10).join('\n')}
    );
    out center 35;
  `;

  const mirrors = [
    'https://overpass.kumi.systems/api/interpreter',
    'https://overpass-api.de/api/interpreter',
  ];

  for (const mirror of mirrors) {
    try {
      const body = new URLSearchParams({ data: overpassQuery }).toString();
      const res = await fetch(mirror, {
        method: 'POST',
        body,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'PlataformaLanding/1.0 (ncamposdalastra@gmail.com)',
        },
        signal: AbortSignal.timeout(8000),
      });

      if (!res.ok) continue;

      const data = await res.json();
      const elements = data.elements || [];
      if (!Array.isArray(elements) || elements.length === 0) continue;

      const businesses: Business[] = [];
      for (const el of elements) {
        const tags = el.tags || {};
        const name = tags.name || tags['name:pt'] || tags.brand;
        if (!name) continue;

        const itemLat = el.lat || (el.center && el.center.lat);
        const itemLng = el.lon || (el.center && el.center.lon);
        if (!itemLat || !itemLng) continue;

        const dist = calculateDistanceKm(lat, lng, itemLat, itemLng);

        let matchedCategory = BUSINESS_CATEGORIES[0];
        for (const cat of BUSINESS_CATEGORIES) {
          let found = false;
          for (const tag of cat.osmTags) {
            if (tag.values.includes(tags[tag.key])) {
              matchedCategory = cat;
              found = true;
              break;
            }
          }
          if (found) break;
        }

        const rawWebsite = tags.website || tags['contact:website'] || tags.url;
        const rawInstagram = tags['contact:instagram'] || tags.instagram;
        const rawFacebook = tags['contact:facebook'] || tags.facebook;
        const rawPhone = tags.phone || tags['contact:phone'];
        const rawWhatsapp = tags['contact:whatsapp'] || tags.whatsapp || rawPhone;

        const addrStreet = tags['addr:street']
          ? `${tags['addr:street']}${tags['addr:housenumber'] ? ', ' + tags['addr:housenumber'] : ''}`
          : '';
        const addrSuburb = tags['addr:suburb'] || tags['addr:neighbourhood'] || '';
        const addrCity = tags['addr:city'] || '';
        const formattedAddress = [addrStreet, addrSuburb, addrCity].filter(Boolean).join(' - ') || 'Endereço registrado';

        const analyzed = analyzeOpportunity({
          id: `osm-${el.id}`,
          name: name.trim(),
          category: matchedCategory.name,
          categoryKey: matchedCategory.key,
          address: formattedAddress,
          neighborhood: addrSuburb || undefined,
          city: addrCity || undefined,
          lat: itemLat,
          lng: itemLng,
          distanceKm: dist,
          phone: rawPhone,
          whatsapp: rawWhatsapp,
          instagram: rawInstagram,
          facebook: rawFacebook,
          rawWebsite,
          openingHours: tags.opening_hours ? [tags.opening_hours] : undefined,
        });

        businesses.push(analyzed);
      }

      if (businesses.length > 0) {
        return businesses;
      }
    } catch {
      // Continue to next mirror
    }
  }

  return [];
}

// 3. Google Places API (when API key is provided)
async function searchPlacesGoogle(
  lat: number,
  lng: number,
  radiusKm: number,
  categoryKey?: string
): Promise<Business[]> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY;
  if (!apiKey) return [];

  try {
    const radiusMeters = Math.min(radiusKm * 1000, 50000);
    const keyword = categoryKey && categoryKey !== 'todos' && CATEGORY_SEARCH_KEYWORDS[categoryKey]
      ? CATEGORY_SEARCH_KEYWORDS[categoryKey][0]
      : 'comercio local';

    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radiusMeters}&keyword=${encodeURIComponent(
      keyword
    )}&key=${apiKey}&language=pt-BR`;

    const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
    if (!res.ok) return [];

    const data = await res.json();
    const results = data.results || [];
    const businesses: Business[] = [];

    for (const place of results) {
      if (!place.name) continue;
      const itemLat = place.geometry?.location?.lat;
      const itemLng = place.geometry?.location?.lng;
      if (!itemLat || !itemLng) continue;

      const dist = calculateDistanceKm(lat, lng, itemLat, itemLng);
      const cat = (categoryKey && categoryKey !== 'todos' && BUSINESS_CATEGORIES.find((c) => c.key === categoryKey)) || BUSINESS_CATEGORIES[0];

      const analyzed = analyzeOpportunity({
        id: `google-${place.place_id}`,
        name: place.name,
        category: cat.name,
        categoryKey: cat.key,
        address: place.vicinity || 'Endereço local',
        lat: itemLat,
        lng: itemLng,
        distanceKm: dist,
        rating: place.rating,
        reviewCount: place.user_ratings_total,
      });

      businesses.push(analyzed);
    }

    return businesses;
  } catch (err) {
    console.warn('Google Places API search failed:', err);
    return [];
  }
}

// Main Discovery Function: 100% Real Live Places
export async function searchPlacesOverpass(
  lat: number,
  lng: number,
  radiusKm: number,
  categoryKey?: string
): Promise<Business[]> {
  // Strategy 1: Google Places if key configured
  const googleResults = await searchPlacesGoogle(lat, lng, radiusKm, categoryKey);
  if (googleResults.length > 0) {
    return sortBusinesses(googleResults);
  }

  // Strategy 2: Fast live Nominatim POI search with bounded viewbox
  const nominatimResults = await searchPlacesNominatim(lat, lng, radiusKm, categoryKey);
  if (nominatimResults.length > 0) {
    return sortBusinesses(nominatimResults);
  }

  // Strategy 3: Overpass multi-mirrors
  const overpassResults = await searchPlacesOverpassEngine(lat, lng, radiusKm, categoryKey);
  if (overpassResults.length > 0) {
    return sortBusinesses(overpassResults);
  }

  // Strategy 4: If strictly no POIs found in a tiny radius, expand radius slightly (up to 15km)
  if (radiusKm < 15) {
    const expandedNominatim = await searchPlacesNominatim(lat, lng, 15, categoryKey);
    if (expandedNominatim.length > 0) {
      return sortBusinesses(expandedNominatim);
    }
  }

  // If still nothing, return empty array (NO FAKE DATA)
  return [];
}

export function sortBusinesses(businesses: Business[]): Business[] {
  const priority: Record<OpportunityLevel, number> = { high: 3, medium: 2, low: 1 };
  return businesses.sort((a, b) => {
    const scoreDiff = priority[b.opportunityScore] - priority[a.opportunityScore];
    if (scoreDiff !== 0) return scoreDiff;
    return (a.distanceKm || 0) - (b.distanceKm || 0);
  });
}
