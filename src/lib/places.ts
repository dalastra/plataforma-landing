import { Business, OpportunityLevel, WebsiteStatus } from '@/types';
import { BUSINESS_CATEGORIES, CategoryDefinition } from './constants';
import { analyzeOpportunity } from './enricher';

export interface GeocodeResult {
  lat: number;
  lng: number;
  displayName: string;
}

// Common directories, portals, aggregators, social networks and marketplaces that are NOT a business's own website
export const DIRECTORY_DOMAINS = [
  'gov.br', 'facebook.com', 'fb.me', 'instagram.com', 'instagr.am', 'linkedin.com',
  'twitter.com', 'x.com', 'tiktok.com', 'youtube.com', 'linktr.ee', 'beacons.ai',
  'ifood.com.br', 'anota.ai', 'cardapioweb.com', 'cardapio.menu', 'ola.click',
  'placedigger.com', 'restaurantguru.com', 'tripadvisor.com', 'apontador.com.br',
  'guiamais.com.br', 'telelistas.net', 'solutudo.com.br', 'kekanto.com.br',
  'cnpj.biz', 'casadosdados.com.br', 'econodata.com.br', 'consultas.plus',
  'jusbrasil.com.br', 'google.com', 'yelp.com', 'foursquare.com', 'listamais.com.br',
  'planetabrasileiro.com', 'imovelweb.com.br', 'zapimoveis.com.br', 'vivareal.com.br',
  'paginasamarelas.com.br', 'tudocomercio.com.br', 'encontrajundiai.com.br',
  'encontrasaopaulo.com.br', 'encontracampinas.com.br', 'waze.com', 'mapquest.com',
  'bing.com', 'reclameaqui.com.br', 'whatsapp.com', 'wa.me', 'findglocal.com',
  'cybo.com', 'hotfrog.com.br', 'cylex.com.br'
];

export function isAggregatorOrSocial(url?: string): boolean {
  if (!url) return false;
  const lower = url.toLowerCase();
  return DIRECTORY_DOMAINS.some((d) => lower.includes(d));
}

// Verifies if a detected domain actually belongs to the business name (own domain)
export function isBusinessOwnDomain(domain: string, businessName: string): boolean {
  if (!domain) return false;
  const cleanDomain = domain.toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
  const rootDomain = cleanDomain.split('.')[0].replace(/[^a-z0-9]/g, '');

  const genericWords = new Set([
    'restaurante', 'barbearia', 'pizzaria', 'clinica', 'academia', 'oficina',
    'loja', 'salao', 'centro', 'estetica', 'petshop', 'vet', 'auto', 'mecanica',
    'comercio', 'servicos', 'instituto', 'espaco', 'studio', 'bar', 'lanches',
    'padaria', 'emporio', 'churrascaria', 'boutique', 'consultorio'
  ]);

  const businessWords = businessName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !genericWords.has(w));

  if (businessWords.length === 0) {
    return businessName.toLowerCase().split(/\s+/).some((w) => w.length > 3 && rootDomain.includes(w));
  }

  return businessWords.some((word) => rootDomain.includes(word));
}

// Performs a deep web search verification to see if a business really has an official own website
export async function verifyBusinessWebsiteDeep(
  name: string,
  city?: string
): Promise<{ hasWebsite: boolean; url?: string }> {
  try {
    const query = encodeURIComponent(`"${name}" ${city || ''}`);
    const url = `https://html.duckduckgo.com/html/?q=${query}`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml',
      },
      signal: AbortSignal.timeout(3500),
    });

    if (!res.ok) return { hasWebsite: false };
    const html = await res.text();
    const urlMatches = html.match(/class="result__url"[^>]*>([^<]+)</g) || [];
    const domains = urlMatches.map((m) => {
      const match = m.match(/>([^<]+)</);
      return match ? match[1].trim() : '';
    });

    for (const d of domains) {
      const clean = d.toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
      const isDir = DIRECTORY_DOMAINS.some((ign) => clean.includes(ign));
      if (!isDir && isBusinessOwnDomain(clean, name)) {
        return { hasWebsite: true, url: 'https://' + clean };
      }
    }

    return { hasWebsite: false };
  } catch {
    return { hasWebsite: false };
  }
}

export async function geocodeLocation(
  query: string,
  userLat?: number,
  userLng?: number
): Promise<GeocodeResult | null> {
  try {
    const encoded = encodeURIComponent(query);
    let viewboxParam = '';

    // If proximity coordinates provided, bias geocoding towards user's regional area
    if (userLat && userLng) {
      const delta = 1.0; // ~100km radius
      viewboxParam = `&viewbox=${(userLng - delta).toFixed(4)},${(userLat + delta).toFixed(4)},${(userLng + delta).toFixed(4)},${(userLat - delta).toFixed(4)}`;
    }

    const url = `https://nominatim.openstreetmap.org/search?q=${encoded}&format=json&addressdetails=1&limit=5&countrycodes=br${viewboxParam}`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'PlataformaLandingProspector/2.0 (ncamposdalastra@gmail.com)',
      },
      next: { revalidate: 3600 },
    });

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        // If proximity provided, pick closest item
        let best = data[0];
        if (userLat && userLng && data.length > 1) {
          let minDistance = Infinity;
          for (const item of data) {
            const d = calculateDistanceKm(userLat, userLng, parseFloat(item.lat), parseFloat(item.lon));
            if (d < minDistance) {
              minDistance = d;
              best = item;
            }
          }
        }

        return {
          lat: parseFloat(best.lat),
          lng: parseFloat(best.lon),
          displayName: best.display_name,
        };
      }
    }

    // Fallback global without viewbox
    const fallbackUrl = `https://nominatim.openstreetmap.org/search?q=${encoded}&format=json&limit=1&countrycodes=br`;
    const fallbackRes = await fetch(fallbackUrl, {
      headers: { 'User-Agent': 'PlataformaLandingProspector/2.0 (ncamposdalastra@gmail.com)' },
    });
    if (fallbackRes.ok) {
      const data = await fallbackRes.json();
      if (Array.isArray(data) && data.length > 0) {
        return {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon),
          displayName: data[0].display_name,
        };
      }
    }

    return null;
  } catch (err) {
    console.error('Geocoding error:', err);
    return null;
  }
}

// Haversine formula to compute distance in km
export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
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

const BROAD_COMMERCIAL_TERMS: Record<string, string[]> = {
  barbearia: ['barbearia', 'salão de beleza', 'cabeleireiro', 'estética', 'manicure'],
  estetica: ['estética', 'clínica de estética', 'depilação', 'spa', 'massagem'],
  odontologia: ['dentista', 'odontologia', 'consultório odontológico', 'clínica odontológica'],
  academia: ['academia', 'crossfit', 'pilates', 'estúdio personal', 'fitness'],
  restaurante: ['restaurante', 'churrascaria', 'bistrô', 'buffet', 'comida caseira'],
  pizzaria: ['pizzaria', 'hamburgueria', 'lanches', 'pastelaria', 'esfiharia'],
  oficina: ['oficina mecânica', 'auto center', 'auto elétrica', 'funilaria', 'troca de óleo', 'lava rápido'],
  petshop: ['pet shop', 'veterinária', 'clínica veterinária', 'banho e tosa', 'agropecuária'],
  imobiliaria: ['imobiliária', 'corretor de imóveis', 'venda de imóveis'],
  escola: ['escola particular', 'curso de idiomas', 'colégio', 'berçário'],
  servicos: ['contabilidade', 'advocacia', 'gráfica rápida', 'coworking', 'assistência técnica'],
};

// All key local commerce queries for broad coverage
const ALL_CATEGORIES_EXPANDED = [
  'restaurante',
  'pizzaria',
  'churrascaria',
  'lanchonete',
  'barbearia',
  'salão de beleza',
  'dentista',
  'clínica odontológica',
  'academia',
  'oficina mecânica',
  'auto center',
  'pet shop',
  'veterinária',
  'padaria',
  'cafeteria',
  'clínica'
];

// 1. Live Real POI search via OpenStreetMap Nominatim with street and category expansion
async function searchPlacesNominatim(
  lat: number,
  lng: number,
  radiusKm: number,
  categoryKey?: string,
  streetQuery?: string
): Promise<Business[]> {
  const radius = Math.max(radiusKm, 1.5);
  const latDelta = radius / 111;
  const lonDelta = radius / (111 * Math.cos((lat * Math.PI) / 180));

  const minLon = lng - lonDelta;
  const maxLon = lng + lonDelta;
  const minLat = lat - latDelta;
  const maxLat = lat + latDelta;
  const viewbox = `${minLon.toFixed(6)},${maxLat.toFixed(6)},${maxLon.toFixed(6)},${minLat.toFixed(6)}`;

  let keywordsToSearch: string[] = [];

  // If a specific street was searched (e.g. "Rua do Retiro"), include the street term specifically!
  if (streetQuery && streetQuery.toLowerCase().includes('rua') || streetQuery?.toLowerCase().includes('av')) {
    const cleanStreet = streetQuery.replace(/,\s*[a-zA-Z\s]+$/, '').trim();
    keywordsToSearch.push(cleanStreet);
  }

  if (categoryKey && categoryKey !== 'todos' && BROAD_COMMERCIAL_TERMS[categoryKey]) {
    keywordsToSearch.push(...BROAD_COMMERCIAL_TERMS[categoryKey]);
  } else {
    keywordsToSearch.push(...ALL_CATEGORIES_EXPANDED);
  }

  const results: Business[] = [];
  const seenNames = new Set<string>();

  // Run in chunks of 4 concurrent requests
  const chunkSize = 4;
  for (let i = 0; i < keywordsToSearch.length; i += chunkSize) {
    const chunk = keywordsToSearch.slice(i, i + chunkSize);
    const promises = chunk.map(async (keyword) => {
      try {
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          keyword
        )}&viewbox=${viewbox}&bounded=1&limit=25&addressdetails=1&extratags=1`;

        const res = await fetch(url, {
          headers: {
            'User-Agent': 'LeadCraftAI/2.0 (ncamposdalastra@gmail.com)',
          },
          signal: AbortSignal.timeout(5000),
        });

        if (!res.ok) return [];
        const items = await res.json();
        return Array.isArray(items) ? items : [];
      } catch {
        return [];
      }
    });

    const chunkResults = await Promise.all(promises);

    for (const items of chunkResults) {
      for (const item of items) {
        const name = item.name || (item.display_name ? item.display_name.split(',')[0] : null);
        if (!name || name.trim().length < 2) continue;

        // Skip highways or pure road segments without commerce
        if (item.class === 'highway' || item.class === 'boundary' || item.type === 'residential') {
          continue;
        }

        const normalizedName = name.trim().toLowerCase();
        if (seenNames.has(normalizedName)) continue;
        seenNames.add(normalizedName);

        const itemLat = parseFloat(item.lat);
        const itemLng = parseFloat(item.lon);
        if (isNaN(itemLat) || isNaN(itemLng)) continue;

        const dist = calculateDistanceKm(lat, lng, itemLat, itemLng);

        // Category determination
        let matchedCat = BUSINESS_CATEGORIES[0];
        if (categoryKey && categoryKey !== 'todos') {
          const found = BUSINESS_CATEGORIES.find((c) => c.key === categoryKey);
          if (found) matchedCat = found;
        } else {
          for (const [catK, keys] of Object.entries(BROAD_COMMERCIAL_TERMS)) {
            if (keys.some((k) => normalizedName.includes(k) || (item.type && item.type.includes(k)))) {
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
        let rawWebsite = extratags.website || extratags['contact:website'] || extratags.url;
        let rawInstagram = extratags['contact:instagram'] || extratags.instagram;
        let rawFacebook = extratags['contact:facebook'] || extratags.facebook;

        // Check if rawWebsite is actually an aggregator, directory or social link
        if (rawWebsite && isAggregatorOrSocial(rawWebsite)) {
          if (rawWebsite.includes('instagram.com') && !rawInstagram) rawInstagram = rawWebsite;
          if (rawWebsite.includes('facebook.com') && !rawFacebook) rawFacebook = rawWebsite;
          rawWebsite = undefined; // Not an own website!
        }

        const analyzed = analyzeOpportunity({
          id: `osm-${item.osm_type || 'node'}-${item.osm_id || item.place_id}`,
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

  const categoriesToQuery = selectedCat ? [selectedCat] : BUSINESS_CATEGORIES.slice(0, 6);
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
    [out:json][timeout:8];
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
          'User-Agent': 'LeadCraftAI/2.0 (ncamposdalastra@gmail.com)',
        },
        signal: AbortSignal.timeout(6000),
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

        let rawWebsite = tags.website || tags['contact:website'] || tags.url;
        let rawInstagram = tags['contact:instagram'] || tags.instagram;
        let rawFacebook = tags['contact:facebook'] || tags.facebook;
        const rawPhone = tags.phone || tags['contact:phone'];
        const rawWhatsapp = tags['contact:whatsapp'] || tags.whatsapp || rawPhone;

        if (rawWebsite && isAggregatorOrSocial(rawWebsite)) {
          if (rawWebsite.includes('instagram.com') && !rawInstagram) rawInstagram = rawWebsite;
          if (rawWebsite.includes('facebook.com') && !rawFacebook) rawFacebook = rawWebsite;
          rawWebsite = undefined;
        }

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
    const keyword = categoryKey && categoryKey !== 'todos' && BROAD_COMMERCIAL_TERMS[categoryKey]
      ? BROAD_COMMERCIAL_TERMS[categoryKey][0]
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

// Applies deep website verification to confirm whether each business has an own website or NOT
async function enrichWithDeepWebsiteVerification(businesses: Business[]): Promise<Business[]> {
  // Check up to top 20 businesses in parallel batches of 5
  const toCheck = businesses.slice(0, 20);
  const remaining = businesses.slice(20);

  const batchSize = 5;
  const verifiedBatch: Business[] = [];

  for (let i = 0; i < toCheck.length; i += batchSize) {
    const chunk = toCheck.slice(i, i + batchSize);
    const chunkPromises = chunk.map(async (biz) => {
      // If already has verified own website from OSM/Google, check if it's real
      if (biz.websiteStatus === 'own_website' && biz.websiteUrl) {
        if (isAggregatorOrSocial(biz.websiteUrl) || !isBusinessOwnDomain(biz.websiteUrl, biz.name)) {
          // It was actually a directory or portal!
          return {
            ...biz,
            websiteStatus: (biz.instagram || biz.whatsapp ? 'social_only' : 'none') as WebsiteStatus,
            websiteUrl: undefined,
            opportunityScore: 'high' as OpportunityLevel,
            opportunityReason: 'Sem site próprio confirmado (possui apenas catálogo/redes). Excelente oportunidade!',
          };
        }
        return biz;
      }

      // If no website or only social, perform deep Google/web check
      const deepCheck = await verifyBusinessWebsiteDeep(biz.name, biz.city || biz.neighborhood);
      if (deepCheck.hasWebsite && deepCheck.url) {
        return {
          ...biz,
          websiteStatus: 'own_website' as WebsiteStatus,
          websiteUrl: deepCheck.url,
          opportunityScore: 'low' as OpportunityLevel,
          opportunityReason: 'Empresa já possui website próprio ativo encontrado na web.',
        };
      } else {
        return {
          ...biz,
          websiteStatus: (biz.instagram || biz.whatsapp ? 'social_only' : 'none') as WebsiteStatus,
          websiteUrl: undefined,
          opportunityScore: 'high' as OpportunityLevel,
          opportunityReason: 'Verificado na Web: NÃO possui site próprio. Máximo potencial para venda de landing page!',
        };
      }
    });

    const resolved = await Promise.all(chunkPromises);
    verifiedBatch.push(...resolved);
  }

  return [...verifiedBatch, ...remaining];
}

// Main Discovery Function: 100% Real Live Places with Deep Website Verification
export async function searchPlacesOverpass(
  lat: number,
  lng: number,
  radiusKm: number,
  categoryKey?: string,
  streetQuery?: string
): Promise<Business[]> {
  let rawBusinesses: Business[] = [];

  // Strategy 1: Google Places if key configured
  const googleResults = await searchPlacesGoogle(lat, lng, radiusKm, categoryKey);
  if (googleResults.length > 0) {
    rawBusinesses = googleResults;
  }

  // Strategy 2: Fast live Nominatim POI search with bounded viewbox + street support
  if (rawBusinesses.length < 5) {
    const nominatimResults = await searchPlacesNominatim(lat, lng, radiusKm, categoryKey, streetQuery);
    if (nominatimResults.length > 0) {
      // Merge unique
      const ids = new Set(rawBusinesses.map((b) => b.name.toLowerCase()));
      for (const n of nominatimResults) {
        if (!ids.has(n.name.toLowerCase())) {
          rawBusinesses.push(n);
          ids.add(n.name.toLowerCase());
        }
      }
    }
  }

  // Strategy 3: Overpass multi-mirrors
  if (rawBusinesses.length < 5) {
    const overpassResults = await searchPlacesOverpassEngine(lat, lng, radiusKm, categoryKey);
    if (overpassResults.length > 0) {
      const ids = new Set(rawBusinesses.map((b) => b.name.toLowerCase()));
      for (const o of overpassResults) {
        if (!ids.has(o.name.toLowerCase())) {
          rawBusinesses.push(o);
          ids.add(o.name.toLowerCase());
        }
      }
    }
  }

  // Strategy 4: If strictly no POIs found in a tiny radius, expand radius slightly (up to 12km)
  if (rawBusinesses.length === 0 && radiusKm < 12) {
    const expandedNominatim = await searchPlacesNominatim(lat, lng, 12, categoryKey, streetQuery);
    if (expandedNominatim.length > 0) {
      rawBusinesses = expandedNominatim;
    }
  }

  if (rawBusinesses.length === 0) {
    return [];
  }

  // Deep Website Verification: verify if establishments really have or don't have an own website
  const verifiedBusinesses = await enrichWithDeepWebsiteVerification(rawBusinesses);

  // Sort businesses: NO WEBSITE ALWAYS FIRST!
  return sortBusinesses(verifiedBusinesses);
}

export function sortBusinesses(businesses: Business[]): Business[] {
  return businesses.sort((a, b) => {
    // 1. Businesses without website come first
    const aHasNoSite = a.websiteStatus !== 'own_website';
    const bHasNoSite = b.websiteStatus !== 'own_website';
    if (aHasNoSite && !bHasNoSite) return -1;
    if (!aHasNoSite && bHasNoSite) return 1;

    // 2. High opportunity score first
    const priority: Record<OpportunityLevel, number> = { high: 3, medium: 2, low: 1 };
    const scoreDiff = priority[b.opportunityScore] - priority[a.opportunityScore];
    if (scoreDiff !== 0) return scoreDiff;

    // 3. Closest distance
    return (a.distanceKm || 0) - (b.distanceKm || 0);
  });
}
