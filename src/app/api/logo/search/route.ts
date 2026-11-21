import { NextRequest, NextResponse } from 'next/server';

// Known national and regional brand logos for instant high-fidelity resolution
const POPULAR_BR_BRANDS: Record<string, string> = {
  'smart fit': 'https://upload.wikimedia.org/wikipedia/commons/4/4e/Smart_Fit_logo.png',
  'bluefit': 'https://bluefit.com.br/assets/img/logo-bluefit.png',
  'cacau show': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/Cacau_Show_logo.svg/800px-Cacau_Show_logo.svg.png',
  'o boticario': 'https://upload.wikimedia.org/wikipedia/pt/thumb/d/d6/Logo_O_Botic%C3%A1rio.png/800px-Logo_O_Botic%C3%A1rio.png',
  'boticario': 'https://upload.wikimedia.org/wikipedia/pt/thumb/d/d6/Logo_O_Botic%C3%A1rio.png/800px-Logo_O_Botic%C3%A1rio.png',
  'subway': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Subway_2016_logo.svg/800px-Subway_2016_logo.svg.png',
  'mcdonald': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/McDonald%27s_Golden_Arches.svg/800px-McDonald%27s_Golden_Arches.svg.png',
  'burger king': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/Burger_King_logo_%281999%29.svg/800px-Burger_King_logo_%281999%29.svg.png',
  'habib': 'https://upload.wikimedia.org/wikipedia/pt/thumb/6/6f/Logotipo_do_Habib%27s.png/800px-Logotipo_do_Habib%27s.png',
  'droga raia': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Droga_Raia_logo.png/800px-Droga_Raia_logo.png',
  'drogasil': 'https://upload.wikimedia.org/wikipedia/pt/thumb/4/43/Logotipo_Drogasil.png/800px-Logotipo_Drogasil.png',
  'chilli beans': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Chilli_Beans_logo.svg/800px-Chilli_Beans_logo.svg.png',
  'ortobom': 'https://upload.wikimedia.org/wikipedia/pt/thumb/7/7b/Ortobom_logo.png/800px-Ortobom_logo.png',
  'cobrecom': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Cobrecom_logo.png/800px-Cobrecom_logo.png',
  'pizzahut': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/Pizza_Hut_logo.svg/800px-Pizza_Hut_logo.svg.png',
  'dominos': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/74/Dominos_pizza_logo.svg/800px-Dominos_pizza_logo.svg.png',
  'spoleto': 'https://upload.wikimedia.org/wikipedia/pt/thumb/b/b3/Spoleto_logo.png/800px-Spoleto_logo.png',
  'giraffas': 'https://upload.wikimedia.org/wikipedia/pt/thumb/6/6f/Giraffas_logo.png/800px-Giraffas_logo.png',
};

export async function GET(req: NextRequest) {
  try {
    const name = req.nextUrl.searchParams.get('name') || '';
    const city = req.nextUrl.searchParams.get('city') || '';
    const website = req.nextUrl.searchParams.get('website') || '';

    if (!name.trim()) {
      return NextResponse.json({ success: false, error: 'Nome não informado' }, { status: 400 });
    }

    const cleanName = name.trim().toLowerCase();

    // 1. Check known brands first
    for (const [key, logoUrl] of Object.entries(POPULAR_BR_BRANDS)) {
      if (cleanName.includes(key)) {
        return NextResponse.json({
          success: true,
          logoUrl,
          source: 'brand_database',
        });
      }
    }

    // 2. If website domain is present, extract from Clearbit / Google Favicon or website HTML
    if (website && (website.startsWith('http') || website.includes('.'))) {
      try {
        const cleanDomain = website
          .toLowerCase()
          .replace(/^https?:\/\//, '')
          .replace(/^www\./, '')
          .split('/')[0];

        // Check Clearbit Logo
        const clearbitUrl = `https://logo.clearbit.com/${cleanDomain}`;
        const checkClearbit = await fetch(clearbitUrl, {
          method: 'HEAD',
          signal: AbortSignal.timeout(2000),
        });
        if (checkClearbit.ok) {
          return NextResponse.json({
            success: true,
            logoUrl: clearbitUrl,
            source: 'clearbit',
          });
        }

        // Try Google 128px high-res favicon
        const googleFavicon = `https://www.google.com/s2/favicons?domain=${cleanDomain}&sz=128`;
        const checkFavicon = await fetch(googleFavicon, {
          method: 'HEAD',
          signal: AbortSignal.timeout(2000),
        });
        if (checkFavicon.ok) {
          return NextResponse.json({
            success: true,
            logoUrl: googleFavicon,
            source: 'google_favicon',
          });
        }
      } catch (err) {
        console.warn('Error checking domain favicon:', err);
      }
    }

    // 3. Search the web for logo via DuckDuckGo
    try {
      const searchQuery = encodeURIComponent(`"${name}" ${city} logo png`);
      const searchUrl = `https://html.duckduckgo.com/html/?q=${searchQuery}`;
      const searchRes = await fetch(searchUrl, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          Accept: 'text/html,application/xhtml+xml',
        },
        signal: AbortSignal.timeout(3000),
      });

      if (searchRes.ok) {
        const html = await searchRes.text();

        // Search for direct image URLs inside links or snippet
        const imgMatches = html.match(
          /https?:\/\/[^"'\s<>]+\.(?:png|svg|webp|jpg|jpeg)(?:\?[^"'\s<>]*)?/gi
        );

        if (imgMatches && imgMatches.length > 0) {
          // Filter candidate URLs: prefer png/svg, avoid duckduckgo assets
          const valid = imgMatches.filter(
            (u) =>
              !u.includes('duckduckgo.com') &&
              !u.includes('yandex') &&
              !u.includes('icon') &&
              (u.endsWith('.png') || u.endsWith('.svg') || u.endsWith('.webp') || u.includes('logo'))
          );

          if (valid.length > 0) {
            return NextResponse.json({
              success: true,
              logoUrl: valid[0],
              source: 'web_search',
              candidates: valid.slice(0, 4),
            });
          }
        }
      }
    } catch (err) {
      console.warn('Error in web search for logo:', err);
    }

    // 4. Return helpful fallback: Google Favicon on search or null
    return NextResponse.json({
      success: false,
      message: 'Nenhum logo encontrado automaticamente. Você pode fazer o upload da imagem ou colar um link.',
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Erro ao buscar logo' },
      { status: 500 }
    );
  }
}
