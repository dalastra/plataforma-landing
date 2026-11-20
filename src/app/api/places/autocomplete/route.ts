import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q');
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');

    if (!q || q.trim().length < 2) {
      return NextResponse.json({ success: true, suggestions: [] });
    }

    const encoded = encodeURIComponent(q.trim());
    let proximity = '';
    if (lat && lng) {
      proximity = `&lat=${lat}&lon=${lng}`;
    }

    const url = `https://photon.komoot.io/api/?q=${encoded}&limit=6${proximity}`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'LeadCraftAI/2.0 (ncamposdalastra@gmail.com)' },
      signal: AbortSignal.timeout(3500),
    });

    if (!res.ok) {
      return NextResponse.json({ success: true, suggestions: [] });
    }

    const data = await res.json();
    const features = Array.isArray(data.features) ? data.features : [];

    const suggestions = features.map((feat: any) => {
      const p = feat.properties || {};
      const [lon, featLat] = feat.geometry?.coordinates || [0, 0];

      const parts = [
        p.name,
        p.street && p.street !== p.name ? p.street : null,
        p.district || p.locality,
        p.city,
        p.state,
      ].filter(Boolean);

      return {
        label: parts.join(', '),
        name: p.name || 'Local',
        city: p.city || '',
        state: p.state || '',
        lat: featLat,
        lng: lon,
      };
    });

    return NextResponse.json({ success: true, suggestions });
  } catch (error: any) {
    return NextResponse.json({ success: true, suggestions: [] });
  }
}
