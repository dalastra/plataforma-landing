export interface ExtractedBrandColors {
  primary: string;
  accent: string;
  secondary: string;
  isLightLogo: boolean;
  palette: string[];
}

export function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => {
    const hex = Math.max(0, Math.min(255, Math.round(n))).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export function rgbToHsl(
  r: number,
  g: number,
  b: number
): { h: number; s: number; l: number } {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return { h: h * 360, s, l };
}

export function hslToHex(h: number, s: number, l: number): string {
  h = ((h % 360) + 360) % 360;
  s = Math.max(0, Math.min(1, s));
  l = Math.max(0, Math.min(1, l));

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0,
    g = 0,
    b = 0;

  if (h >= 0 && h < 60) {
    r = c;
    g = x;
    b = 0;
  } else if (h >= 60 && h < 120) {
    r = x;
    g = c;
    b = 0;
  } else if (h >= 120 && h < 180) {
    r = 0;
    g = c;
    b = x;
  } else if (h >= 180 && h < 240) {
    r = 0;
    g = x;
    b = c;
  } else if (h >= 240 && h < 300) {
    r = x;
    g = 0;
    b = c;
  } else {
    r = c;
    g = 0;
    b = x;
  }

  return rgbToHex((r + m) * 255, (g + m) * 255, (b + m) * 255);
}

export function getDefaultColors(): ExtractedBrandColors {
  return {
    primary: '#1d4ed8',
    accent: '#f59e0b',
    secondary: '#1e293b',
    isLightLogo: false,
    palette: ['#1d4ed8', '#f59e0b', '#0f172a', '#e2e8f0'],
  };
}

export function extractColorsFromImageData(
  data: Uint8ClampedArray | number[]
): ExtractedBrandColors {
  const colorBuckets = new Map<
    string,
    { r: number; g: number; b: number; count: number; h: number; s: number; l: number }
  >();

  let totalValidPixels = 0;
  let lightPixels = 0;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];

    // Ignore transparent pixels
    if (a < 50) continue;

    const { h, s, l } = rgbToHsl(r, g, b);
    totalValidPixels++;

    if (l > 0.6) {
      lightPixels++;
    }

    // Skip extreme near-white (background in JPG logos)
    if (l > 0.92 && s < 0.12) continue;

    // Quantize into 5-bit color space (32 values per channel)
    const qr = Math.floor(r / 16) * 16;
    const qg = Math.floor(g / 16) * 16;
    const qb = Math.floor(b / 16) * 16;
    const key = `${qr},${qg},${qb}`;

    const existing = colorBuckets.get(key);
    if (existing) {
      existing.count++;
    } else {
      colorBuckets.set(key, { r: qr, g: qg, b: qb, count: 1, h, s, l });
    }
  }

  if (colorBuckets.size === 0) {
    return getDefaultColors();
  }

  const buckets = Array.from(colorBuckets.values());

  // Score colors based on vibrancy (saturation, pleasant lightness, and frequency)
  const scored = buckets.map((bucket) => {
    const frequency = bucket.count / totalValidPixels;
    // Reward vibrant colors (saturation between 0.35 and 1.0)
    const satScore = bucket.s * 2.2;
    // Reward colors with balanced luminance (not too dark, not washed out)
    const lumScore = 1.0 - Math.abs(bucket.l - 0.45) * 1.5;
    // Slight bonus if it's very frequent, but don't let a huge neutral background win
    const freqScore = Math.min(frequency, 0.4) * 1.2;

    const score = satScore * 1.8 + lumScore * 1.2 + freqScore;
    return { ...bucket, score };
  });

  // Sort descending by score
  scored.sort((a, b) => b.score - a.score);

  const topColor = scored[0];
  const primaryHex = rgbToHex(topColor.r, topColor.g, topColor.b);

  // Find a distinct second color for accent
  let accentColor = scored.find((c) => {
    const hueDiff = Math.abs(c.h - topColor.h);
    const lumDiff = Math.abs(c.l - topColor.l);
    return (hueDiff > 35 && hueDiff < 325) || lumDiff > 0.35;
  });

  let accentHex: string;
  if (accentColor) {
    accentHex = rgbToHex(accentColor.r, accentColor.g, accentColor.b);
  } else {
    // Generate a complementary or split-complementary vibrant accent
    accentHex = hslToHex(topColor.h + 180, Math.max(topColor.s, 0.6), 0.5);
  }

  // Tertiary / secondary
  const secondaryColor = scored.find(
    (c) =>
      rgbToHex(c.r, c.g, c.b) !== primaryHex && rgbToHex(c.r, c.g, c.b) !== accentHex
  );
  const secondaryHex = secondaryColor
    ? rgbToHex(secondaryColor.r, secondaryColor.g, secondaryColor.b)
    : hslToHex(topColor.h + 30, Math.min(topColor.s * 0.7, 0.4), 0.2);

  const isLightLogo = totalValidPixels > 0 && lightPixels / totalValidPixels > 0.65;

  const palette = [
    primaryHex,
    accentHex,
    secondaryHex,
    rgbToHex(
      Math.max(0, topColor.r - 40),
      Math.max(0, topColor.g - 40),
      Math.max(0, topColor.b - 40)
    ),
  ];

  return {
    primary: primaryHex,
    accent: accentHex,
    secondary: secondaryHex,
    isLightLogo,
    palette,
  };
}

// Client-side extraction using HTML5 Canvas
export async function extractColorsFromImageSrc(
  src: string
): Promise<ExtractedBrandColors> {
  if (typeof window === 'undefined') {
    return getDefaultColors();
  }

  return new Promise((resolve) => {
    const img = new Image();
    // Try CORS anonymous
    img.crossOrigin = 'Anonymous';

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve(getDefaultColors());

        const w = 64;
        const h = 64;
        canvas.width = w;
        canvas.height = h;
        ctx.drawImage(img, 0, 0, w, h);

        const imageData = ctx.getImageData(0, 0, w, h);
        const result = extractColorsFromImageData(imageData.data);
        resolve(result);
      } catch (err) {
        console.warn('Canvas color extraction error, falling back to proxy:', err);
        // Fallback to proxy if CORS blocked canvas
        extractViaProxy(src).then(resolve);
      }
    };

    img.onerror = () => {
      // Fallback via proxy
      extractViaProxy(src).then(resolve);
    };

    img.src = src;
  });
}

async function extractViaProxy(src: string): Promise<ExtractedBrandColors> {
  try {
    if (src.startsWith('data:')) return getDefaultColors();
    const proxyUrl = `/api/logo/proxy?url=${encodeURIComponent(src)}`;
    const res = await fetch(proxyUrl);
    if (!res.ok) return getDefaultColors();
    const blob = await res.blob();
    const objectUrl = URL.createObjectURL(blob);

    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            URL.revokeObjectURL(objectUrl);
            return resolve(getDefaultColors());
          }
          canvas.width = 64;
          canvas.height = 64;
          ctx.drawImage(img, 0, 0, 64, 64);
          const imageData = ctx.getImageData(0, 0, 64, 64);
          URL.revokeObjectURL(objectUrl);
          resolve(extractColorsFromImageData(imageData.data));
        } catch {
          URL.revokeObjectURL(objectUrl);
          resolve(getDefaultColors());
        }
      };
      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        resolve(getDefaultColors());
      };
      img.src = objectUrl;
    });
  } catch {
    return getDefaultColors();
  }
}
