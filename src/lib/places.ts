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
): Promise<{ hasWebsite: boolean; url?: string; checked: boolean }> {
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

    if (!res.ok) return { hasWebsite: false, checked: false };
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
        return { hasWebsite: true, url: 'https://' + clean, checked: true };
      }
    }

    // Search engine answered but returned no results at all => inconclusive (probably blocked)
    return { hasWebsite: false, checked: domains.length > 0 };
  } catch {
    return { hasWebsite: false, checked: false };
  }
}

export async function geocodeLocation(
  query: string,
  userLat?: number,
  userLng?: number
): Promise<GeocodeResult | null> {
  try {
    const encoded = encodeURIComponent(query);

    // If proximity coordinates provided, try Photon first (instant and strongly proximity-biased)
    if (userLat && userLng) {
      try {
        const photonUrl = `https://photon.komoot.io/api/?q=${encoded}&lat=${userLat}&lon=${userLng}&limit=3`;
        const photonRes = await fetch(photonUrl, {
          headers: { 'User-Agent': 'LeadCraftAI/2.0 (ncamposdalastra@gmail.com)' },
          signal: AbortSignal.timeout(3000),
        });
        if (photonRes.ok) {
          const photonData = await photonRes.json();
          const first = photonData?.features?.[0];
          if (first && first.geometry?.coordinates) {
            const [pLng, pLat] = first.geometry.coordinates;
            const p = first.properties || {};
            const displayName = [p.name, p.locality || p.district, p.city, p.state, p.country]
              .filter(Boolean)
              .join(', ');
            return {
              lat: pLat,
              lng: pLng,
              displayName: displayName || query,
            };
          }
        }
      } catch {
        // Fall back to Nominatim
      }
    }

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
  'clínica',
  'farmácia',
  'supermercado',
  'mercado',
  'açougue',
  'hamburgueria',
  'sorveteria',
  'bar',
  'loja de roupas',
  'estética',
  'escola',
  'curso',
  'imobiliária',
  'contabilidade',
  'advocacia',
  'floricultura',
  'material de construção',
  'ótica',
  'lava rápido',
  'borracharia',
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
  keywordsToSearch = keywordsToSearch.slice(0, 14);
  let rateLimited = false;
  const chunkSize = 1; // Nominatim policy: max ~1 request/second
  for (let i = 0; i < keywordsToSearch.length; i += chunkSize) {
    if (rateLimited) break;
    const chunk = keywordsToSearch.slice(i, i + chunkSize);
    const promises = chunk.map(async (keyword) => {
      try {
        await new Promise((r) => setTimeout(r, 1100));
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          keyword
        )}&viewbox=${viewbox}&bounded=1&limit=40&addressdetails=1&extratags=1`;

        const res = await fetch(url, {
          headers: {
            'User-Agent': 'LeadCraftAI/2.0 (ncamposdalastra@gmail.com)',
          },
          signal: AbortSignal.timeout(5000),
        });

        if (res.status === 429) rateLimited = true;
        if (!res.ok) return { keyword, items: [] as any[] };
        const items = await res.json();
        return { keyword, items: Array.isArray(items) ? items : [] };
      } catch {
        return { keyword, items: [] as any[] };
      }
    });

    const chunkResults = await Promise.all(promises);

    for (const { keyword: foundByKeyword, items } of chunkResults) {
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
        let matchedCat: CategoryDefinition =
          BUSINESS_CATEGORIES.find((c) => c.key === 'outros') || BUSINESS_CATEGORIES[BUSINESS_CATEGORIES.length - 1];
        if (categoryKey && categoryKey !== 'todos') {
          const found = BUSINESS_CATEGORIES.find((c) => c.key === categoryKey);
          if (found) matchedCat = found;
        } else {
          // Category = the segment whose search term found this place
          const kw = foundByKeyword.toLowerCase();
          for (const [catK, keys] of Object.entries(BROAD_COMMERCIAL_TERMS)) {
            if (keys.some((k) => k.toLowerCase() === kw)) {
              const f = BUSINESS_CATEGORIES.find((c) => c.key === catK);
              if (f) {
                matchedCat = f;
                break;
              }
            }
          }
          if (kw === 'restaurante' || kw === 'churrascaria' || kw === 'lanchonete' || kw === 'cafeteria' || kw === 'padaria' || kw === 'bar' || kw === 'sorveteria') {
            matchedCat = BUSINESS_CATEGORIES.find((c) => c.key === 'restaurante') || matchedCat;
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
    'https://overpass.openstreetmap.fr/api/interpreter',
    'https://z.overpass-api.de/api/interpreter',
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
  const toCheck = businesses.slice(0, 60);
  const remaining = businesses.slice(60);

  const batchSize = 10;
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
      const noSiteStatus = (biz.instagram || biz.facebook ? 'social_only' : 'none') as WebsiteStatus;
      if (deepCheck.hasWebsite && deepCheck.url) {
        return {
          ...biz,
          websiteStatus: 'own_website' as WebsiteStatus,
          websiteUrl: deepCheck.url,
          opportunityScore: 'low' as OpportunityLevel,
          opportunityReason: `Já possui site próprio encontrado na web: ${deepCheck.url}`,
        };
      }
      if (deepCheck.checked) {
        return {
          ...biz,
          websiteStatus: noSiteStatus,
          websiteUrl: undefined,
          opportunityScore: 'high' as OpportunityLevel,
          opportunityReason: 'Verificado na web: NÃO possui site próprio (apenas redes/guias). Ótima oportunidade para landing page!',
        };
      }
      // Search engine could not confirm: keep what the map data says, flagged as not confirmed
      return {
        ...biz,
        websiteStatus: biz.websiteStatus === 'none' || biz.websiteStatus === 'social_only' ? biz.websiteStatus : ('unconfirmed' as WebsiteStatus),
        opportunityReason: biz.opportunityReason || 'Sem site nos dados do mapa (não foi possível confirmar na web).',
      };
    });

    const resolved = await Promise.all(chunkPromises);
    verifiedBatch.push(...resolved);
  }

  return [...verifiedBatch, ...remaining];
}

// 2b. Generic Overpass: EVERY named commercial POI (shop/amenity/office/craft/leisure) around the point
async function searchPlacesOverpassGeneric(
  lat: number,
  lng: number,
  radiusKm: number,
  categoryKey?: string
): Promise<Business[]> {
  const deltaLat = Math.min(Math.max(radiusKm, 1), 15) / 111;
  const deltaLng = deltaLat / Math.max(0.1, Math.cos((lat * Math.PI) / 180));
  const south = lat - deltaLat;
  const north = lat + deltaLat;
  const west = lng - deltaLng;
  const east = lng + deltaLng;
  const bbox = `[bbox:${south.toFixed(5)},${west.toFixed(5)},${north.toFixed(5)},${east.toFixed(5)}]`;

  const amenities =
    'restaurant|cafe|fast_food|bar|pub|ice_cream|food_court|dentist|clinic|doctors|veterinary|pharmacy|car_wash|car_rental|driving_school|language_school|music_school|nightclub|studio|coworking_space|bank';

  const overpassQuery = `
    [out:json][timeout:15]${bbox};
    (
      nwr["shop"]["name"];
      nwr["amenity"~"^(${amenities})$"]["name"];
      nwr["office"]["name"];
      nwr["craft"]["name"];
      nwr["leisure"~"^(fitness_centre|sports_centre|dance)$"]["name"];
      nwr["healthcare"]["name"];
    );
    out center 400;
  `;

  const mirrors = [
    'https://overpass.openstreetmap.fr/api/interpreter',
    'https://z.overpass-api.de/api/interpreter',
    'https://overpass-api.de/api/interpreter',
    'https://overpass.kumi.systems/api/interpreter',
    'https://overpass.private.coffee/api/interpreter',
  ];

  const fallbackCat =
    BUSINESS_CATEGORIES.find((c) => c.key === 'outros') || BUSINESS_CATEGORIES[BUSINESS_CATEGORIES.length - 1];

  const runMirror = async (mirror: string): Promise<Business[]> => {
  for (const _once of [0]) {
    try {
      const res = await fetch(mirror, {
        method: 'POST',
        body: new URLSearchParams({ data: overpassQuery }).toString(),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'LeadCraftAI/2.0 (ncamposdalastra@gmail.com)',
        },
        signal: AbortSignal.timeout(18000),
      });
      if (!res.ok) continue;
      const data = await res.json();
      const elements = Array.isArray(data.elements) ? data.elements : [];
      if (elements.length === 0) continue;

      const out: Business[] = [];
      for (const el of elements) {
        const tags = el.tags || {};
        const name = tags.name || tags['name:pt'] || tags.brand;
        if (!name) continue;
        const itemLat = el.lat || el.center?.lat;
        const itemLng = el.lon || el.center?.lon;
        if (!itemLat || !itemLng) continue;

        let matched: CategoryDefinition = fallbackCat;
        for (const cat of BUSINESS_CATEGORIES) {
          if (cat.osmTags.some((t) => t.values.includes(tags[t.key]))) {
            matched = cat;
            break;
          }
        }
        if (categoryKey && categoryKey !== 'todos' && matched.key !== categoryKey) continue;

        let rawWebsite = tags.website || tags['contact:website'] || tags.url;
        let rawInstagram = tags['contact:instagram'] || tags.instagram;
        let rawFacebook = tags['contact:facebook'] || tags.facebook;
        if (rawWebsite && isAggregatorOrSocial(rawWebsite)) {
          if (rawWebsite.includes('instagram.com') && !rawInstagram) rawInstagram = rawWebsite;
          if (rawWebsite.includes('facebook.com') && !rawFacebook) rawFacebook = rawWebsite;
          rawWebsite = undefined;
        }
        const rawPhone = tags.phone || tags['contact:phone'] || tags['contact:mobile'];
        const street = tags['addr:street']
          ? `${tags['addr:street']}${tags['addr:housenumber'] ? ', ' + tags['addr:housenumber'] : ''}`
          : '';
        const suburb = tags['addr:suburb'] || tags['addr:neighbourhood'] || '';
        const city = tags['addr:city'] || '';

        out.push(
          analyzeOpportunity({
            id: `osm-${el.type || 'node'}-${el.id}`,
            name: String(name).trim(),
            category: matched.name,
            categoryKey: matched.key,
            address: [street, suburb, city].filter(Boolean).join(' - ') || 'Endereço não informado no mapa',
            neighborhood: suburb || undefined,
            city: city || undefined,
            lat: itemLat,
            lng: itemLng,
            distanceKm: calculateDistanceKm(lat, lng, itemLat, itemLng),
            phone: rawPhone,
            whatsapp: tags['contact:whatsapp'] || tags.whatsapp || rawPhone,
            instagram: rawInstagram,
            facebook: rawFacebook,
            rawWebsite,
            openingHours: tags.opening_hours ? [tags.opening_hours] : undefined,
          })
        );
      }
      if (out.length > 0) return out;
    } catch {
      // mirror failed
    }
  }
  return [];
  };

  // Race all mirrors in parallel: first one that answers with data wins
  return new Promise<Business[]>((resolve) => {
    let pending = mirrors.length;
    const done = () => {
      pending -= 1;
      if (pending === 0) resolve([]);
    };
    mirrors.forEach((m) =>
      runMirror(m)
        .then((r) => (r.length > 0 ? resolve(r) : done()))
        .catch(done)
    );
  });
}

// Short-lived cache: avoids hammering public OSM services on repeated identical searches
const SEARCH_CACHE = new Map<string, { at: number; data: Business[] }>();

// Main Discovery Function: 100% Real Live Places with Deep Website Verification
export async function searchPlacesOverpass(
  lat: number,
  lng: number,
  radiusKm: number,
  categoryKey?: string,
  streetQuery?: string
): Promise<Business[]> {
  const cacheKey = `${lat.toFixed(3)}|${lng.toFixed(3)}|${radiusKm}|${categoryKey || 'todos'}|${(streetQuery || '').toLowerCase()}`;
  const cached = SEARCH_CACHE.get(cacheKey);
  if (cached && Date.now() - cached.at < 10 * 60 * 1000) {
    return cached.data;
  }

  // Run ALL sources in parallel and merge: we want every establishment around the user
  const [googleResults, nominatimResults, overpassGeneric, overpassTagged] = await Promise.all([
    searchPlacesGoogle(lat, lng, radiusKm, categoryKey).catch(() => [] as Business[]),
    searchPlacesNominatim(lat, lng, radiusKm, categoryKey, streetQuery).catch(() => [] as Business[]),
    searchPlacesOverpassGeneric(lat, lng, radiusKm, categoryKey).catch(() => [] as Business[]),
    searchPlacesOverpassEngine(lat, lng, radiusKm, categoryKey).catch(() => [] as Business[]),
  ]);

  const rawBusinesses: Business[] = [];
  const seen: Business[] = [];
  const norm = (s: string) =>
    s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '');

  // Priority: sources with richer data first
  for (const source of [googleResults, overpassTagged, overpassGeneric, nominatimResults]) {
    for (const b of source) {
      const key = norm(b.name);
      const dup = seen.some(
        (s) => norm(s.name) === key && calculateDistanceKm(s.lat, s.lng, b.lat, b.lng) < 0.3
      );
      if (dup) continue;
      seen.push(b);
      rawBusinesses.push(b);
    }
  }

  // If strictly nothing found in a tiny radius, expand slightly (up to 12km)
  if (rawBusinesses.length === 0 && radiusKm < 12) {
    const expanded = await searchPlacesNominatim(lat, lng, 12, categoryKey, streetQuery);
    rawBusinesses.push(...expanded);
  }

  if (rawBusinesses.length === 0) {
    return [];
  }

  // Deep Website Verification: verify if establishments really have or don't have an own website
  const verifiedBusinesses = await enrichWithDeepWebsiteVerification(rawBusinesses);

  // Sort businesses: NO WEBSITE ALWAYS FIRST!
  const finalList = sortBusinesses(verifiedBusinesses);
  SEARCH_CACHE.set(cacheKey, { at: Date.now(), data: finalList });
  return finalList;
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




