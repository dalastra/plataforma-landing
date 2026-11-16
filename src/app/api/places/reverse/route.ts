import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');

    if (!lat || !lng) {
      return NextResponse.json({ success: false, error: 'Coordenadas não informadas' }, { status: 400 });
    }

    const nLat = parseFloat(lat);
    const nLng = parseFloat(lng);

    // 1. Try Photon reverse first
    try {
      const photonRes = await fetch(
        `https://photon.komoot.io/reverse?lat=${nLat}&lon=${nLng}`,
        {
          headers: { 'User-Agent': 'LeadCraftAI/2.0 (ncamposdalastra@gmail.com)' },
          signal: AbortSignal.timeout(3000),
        }
      );
      if (photonRes.ok) {
        const data = await photonRes.json();
        const feat = data?.features?.[0];
        if (feat && feat.properties) {
          const p = feat.properties;
          const street = p.street || p.name || '';
          const houseNumber = p.housenumber ? `, ${p.housenumber}` : '';
          const suburb = p.district || p.locality || '';
          const city = p.city || '';
          const state = p.state || '';
          const fullAddress = [
            street ? `${street}${houseNumber}` : '',
            suburb,
            city,
            state,
          ].filter(Boolean).join(' - ') || 'Local no mapa';

          const placeName = p.name || street || 'Estabelecimento / Local';

          return NextResponse.json({
            success: true,
            name: placeName,
            address: fullAddress,
            street,
            neighborhood: suburb,
            city,
            state,
            lat: nLat,
            lng: nLng,
          });
        }
      }
    } catch {
      // Fallback to Nominatim
    }

    // 2. Nominatim reverse fallback
    const nomRes = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${nLat}&lon=${nLng}&format=json&addressdetails=1`,
      {
        headers: { 'User-Agent': 'LeadCraftAI/2.0 (ncamposdalastra@gmail.com)' },
        signal: AbortSignal.timeout(4000),
      }
    );

    if (nomRes.ok) {
      const nomData = await nomRes.json();
      const addr = nomData.address || {};
      const street = addr.road || addr.street || addr.pedestrian || addr.footway || '';
      const number = addr.house_number ? `, ${addr.house_number}` : '';
      const suburb = addr.suburb || addr.neighbourhood || addr.city_district || '';
      const city = addr.city || addr.town || addr.municipality || '';
      const state = addr.state || '';
      const fullAddress = [
        street ? `${street}${number}` : '',
        suburb,
        city,
        state,
      ].filter(Boolean).join(' - ') || nomData.display_name || 'Local no mapa';

      const placeName = nomData.name || (addr.shop || addr.amenity || addr.building || street || 'Local no mapa');

      return NextResponse.json({
        success: true,
        name: placeName,
        address: fullAddress,
        street,
        neighborhood: suburb,
        city,
        state,
        lat: nLat,
        lng: nLng,
      });
    }

    return NextResponse.json({
      success: true,
      name: 'Local no Mapa',
      address: `Coordenadas: ${nLat.toFixed(5)}, ${nLng.toFixed(5)}`,
      lat: nLat,
      lng: nLng,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Erro no reverse geocode' },
      { status: 500 }
    );
  }
}
