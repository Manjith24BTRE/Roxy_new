// src/components/editor-main-screen/tools/filters/engines/artisticFilter/artisticFilterPresets.ts

export interface ArtisticFilterParams {
  posterizeLevels?: number;     // 0 to 1 (color quantization/banding level)
  edgeStrength?: number;        // 0 to 1 (Sobel edge extraction intensity for outlines)
  smoothingBilateral?: number;  // 0 to 1 (painterly color smoothing blur)
  watercolorDiffusion?: number; // 0 to 1 (soft pigment wash & paper texture blend)
  pixelateResolution?: number; // 0 to 1 (UV grid quantization pixel size)
  doubleExposureBlend?: number; // 0 to 1 (dual luminance ghost inversion blend ~35-55%)
  contrast?: number;            // -1 to +1
  brightness?: number;          // -1 to +1
  saturation?: number;          // -1 to +1
  vignette?: number;            // 0 to 1 (radial lens corner falloff)
}

export interface ArtisticFilterPreset {
  id: number;
  presetKey: string;
  name: string;
  engineKey: 'ArtisticFilterEngine';
  category: 'Creative & Artistic';
  description: string;
  params: ArtisticFilterParams;
}

export const ARTISTIC_FILTER_PRESETS: Record<string, ArtisticFilterPreset> = {
  oil_painting: {
    id: 46,
    presetKey: 'oil_painting',
    name: 'Oil Painting',
    engineKey: 'ArtisticFilterEngine',
    category: 'Creative & Artistic',
    description: 'Painterly transformation with visible brush-like texture, color smoothing, and impasto diffusion.',
    params: {
      smoothingBilateral: 0.58,
      posterizeLevels: 0.42,
      saturation: 0.25,
      contrast: 0.15,
      vignette: 0.12,
    }
  },
  watercolor: {
    id: 47,
    presetKey: 'watercolor',
    name: 'Watercolor',
    engineKey: 'ArtisticFilterEngine',
    category: 'Creative & Artistic',
    description: 'Soft watercolor texture with blended color transitions, pigment diffusion, and edge softness.',
    params: {
      watercolorDiffusion: 0.62,
      smoothingBilateral: 0.45,
      saturation: 0.02,
      contrast: -0.05,
    }
  },
  comic_book: {
    id: 48,
    presetKey: 'comic_book',
    name: 'Comic book',
    engineKey: 'ArtisticFilterEngine',
    category: 'Creative & Artistic',
    description: 'Bold outlines, flat vibrant colors, and graphic contrast using resolution-aware edge detection.',
    params: {
      edgeStrength: 0.68,
      posterizeLevels: 0.60,
      saturation: 0.10,
      contrast: 0.18,
    }
  },
  pixel_art: {
    id: 49,
    presetKey: 'pixel_art',
    name: 'Pixel Art',
    engineKey: 'ArtisticFilterEngine',
    category: 'Creative & Artistic',
    description: 'Pixelated visual treatment with reduced-resolution blocks, consistent grid structure, and hardened edges.',
    params: {
      pixelateResolution: 0.58,
      posterizeLevels: 0.48,
      contrast: 0.18,
    }
  },
  double_exposure: {
    id: 50,
    presetKey: 'double_exposure',
    name: 'Double Exposure',
    engineKey: 'ArtisticFilterEngine',
    category: 'Creative & Artistic',
    description: 'Two-layer photographic blend with controlled ~35–55% transparency, composition, and ghosting.',
    params: {
      doubleExposureBlend: 0.45,
      contrast: 0.10,
      vignette: 0.20,
    }
  }
};

/**
 * Resolves a preset from asset ID or asset name or presetKey.
 */
export function getArtisticFilterPreset(identifier: string | number): ArtisticFilterPreset | undefined {
  if (typeof identifier === 'number') {
    return Object.values(ARTISTIC_FILTER_PRESETS).find((p) => p.id === identifier);
  }

  const idNum = Number(identifier);
  if (!isNaN(idNum) && idNum > 0) {
    const foundById = Object.values(ARTISTIC_FILTER_PRESETS).find((p) => p.id === idNum);
    if (foundById) return foundById;
  }

  const key = identifier.toString().toLowerCase().trim();
  if (ARTISTIC_FILTER_PRESETS[key]) return ARTISTIC_FILTER_PRESETS[key];

  const normalizedKey = key.replace(/[^a-z0-9]/g, '_');
  if (ARTISTIC_FILTER_PRESETS[normalizedKey]) return ARTISTIC_FILTER_PRESETS[normalizedKey];

  return Object.values(ARTISTIC_FILTER_PRESETS).find(
    (p) => p.name.toLowerCase() === key || p.presetKey.toLowerCase() === key
  );
}
