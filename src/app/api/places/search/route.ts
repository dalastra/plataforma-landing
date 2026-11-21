import { NextRequest, NextResponse } from 'next/server';
import { geocodeLocation, searchPlacesOverpass } from '@/lib/places';
import { createClient } from '@/lib/supabase/server';
import { recordSearchHistory } from '@/lib/db';

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { radiusKm = 5, categoryKey = 'todos', query } = body;
    let { lat, lng } = body;

    let geocodeResult = null;

    if (query && typeof query === 'string' && query.trim().length > 0) {
      geocodeResult = await geocodeLocation(
        query.trim(),
        lat ? Number(lat) : undefined,
        lng ? Number(lng) : undefined
      );
      if (geocodeResult) {
        lat = geocodeResult.lat;
        lng = geocodeResult.lng;
      }
    }

    // Default to Center of Brazil (Brasília, DF) if no location could be derived
    if (!lat || !lng) {
      lat = -15.793889;
      lng = -47.882778;
      geocodeResult = {
        lat,
        lng,
        displayName: 'Brasília, DF, Brasil (Centro do Brasil)',
      };
    }

    const businesses = await searchPlacesOverpass(
      Number(lat),
      Number(lng),
      Number(radiusKm),
      categoryKey,
      query ? String(query).trim() : undefined
    );

    // Save search history in background if user is authenticated
    try {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const searchQueryText = query || geocodeResult?.displayName || `${lat}, ${lng}`;
        await recordSearchHistory(
          user.id,
          searchQueryText,
          Number(radiusKm),
          categoryKey ? [categoryKey] : [],
          businesses.length
        );
      }
    } catch (err) {
      console.warn('Could not record search history:', err);
    }

    return NextResponse.json({
      success: true,
      count: businesses.length,
      noWebsiteCount: businesses.filter((b) => b.websiteStatus !== 'own_website').length,
      center: { lat: Number(lat), lng: Number(lng) },
      geocode: geocodeResult,
      businesses,
    });
  } catch (error: any) {
    console.error('API /api/places/search error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao buscar estabelecimentos' },
      { status: 500 }
    );
  }
}

