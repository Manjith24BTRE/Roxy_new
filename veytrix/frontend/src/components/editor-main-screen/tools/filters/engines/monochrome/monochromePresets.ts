// src/components/editor-main-screen/tools/filters/engines/monochrome/monochromePresets.ts

export interface MonochromeParams {
  redChannelWeight?: number;   // Luminance conversion red channel weight (0 to 1)
  greenChannelWeight?: number; // Luminance conversion green channel weight (0 to 1)
  blueChannelWeight?: number;  // Luminance conversion blue channel weight (0 to 1)
  contrast?: number;           // -1 to +1
  brightness?: number;         // -1 to +1
  blackPoint?: number;         // 0 to 1 (shadow clipping / lift)
  whitePoint?: number;         // 0 to 1 (highlight compression / boost)
  gamma?: number;              // 0.1 to 3.0 (gamma curve)
  highlights?: number;         // -1 to +1
  shadows?: number;            // -1 to +1
  fade?: number;               // 0 to 1 (matte film shadow lift)
  grain?: number;              // 0 to 1 (procedural film grain)
  vignette?: number;           // 0 to 1 (radial lens corner darkening)
  warmth?: number;             // -1 (cool selenium) to +1 (warm sepia)
  highlightTint?: [number, number, number]; // RGB tint array for highlights
  shadowTint?: [number, number, number];    // RGB tint array for shadows
  softness?: number;           // 0 to 1
  clarity?: number;            // -1 to +1
}

export interface MonochromePreset {
  id: number;
  presetKey: string;
  name: string;
  engineKey: 'MonochromeEngine';
  category: 'Black & White';
  description: string;
  params: MonochromeParams;
}

export const MONOCHROME_PRESETS: Record<string, MonochromePreset> = {
  pure_mono: {
    id: 32,
    presetKey: 'pure_mono',
    name: 'Pure Mono',
    engineKey: 'MonochromeEngine',
    category: 'Black & White',
    description: 'Clean neutral monochrome using channel mixing desaturation with balanced grayscale and slight contrast boost.',
    params: {
      redChannelWeight: 0.2126,
      greenChannelWeight: 0.7152,
      blueChannelWeight: 0.0722,
      contrast: 0.02,
    }
  },
  high_contrast_b_w: {
    id: 33,
    presetKey: 'high_contrast_b_w',
    name: 'High Contrast B/W',
    engineKey: 'MonochromeEngine',
    category: 'Black & White',
    description: 'Bold black-and-white with strong tonal separation, boosted highlights, and deep shadows avoiding facial detail loss.',
    params: {
      redChannelWeight: 0.40,
      greenChannelWeight: 0.50,
      blueChannelWeight: 0.10,
      contrast: 0.25,
      highlights: 0.03,
      shadows: -0.15,
    }
  },
  noir_b_w: {
    id: 34,
    presetKey: 'noir_b_w',
    name: 'Noir B/W',
    engineKey: 'MonochromeEngine',
    category: 'Black & White',
    description: 'Film-noir appearance with deep crushed shadows, bright specular highlights, and slight edge vignette.',
    params: {
      redChannelWeight: 0.35,
      greenChannelWeight: 0.50,
      blueChannelWeight: 0.15,
      contrast: 0.28,
      blackPoint: 0.12,
      highlights: 0.08,
      vignette: 0.15,
      grain: 0.08,
    }
  },
  soft_b_w: {
    id: 35,
    presetKey: 'soft_b_w',
    name: 'Soft B/W',
    engineKey: 'MonochromeEngine',
    category: 'Black & White',
    description: 'Gentle elegant monochrome avoiding a flat gray appearance with softened contrast and lifted shadows.',
    params: {
      redChannelWeight: 0.30,
      greenChannelWeight: 0.60,
      blueChannelWeight: 0.10,
      contrast: -0.08,
      highlights: -0.05,
      shadows: 0.07,
      softness: 0.05,
    }
  },
  platinum_b_w: {
    id: 36,
    presetKey: 'platinum_b_w',
    name: 'Platinum B/W',
    engineKey: 'MonochromeEngine',
    category: 'Black & White',
    description: 'Premium silver/platinum-style monochrome with refined tonal detail, subtle cool-neutral tint, and clarity.',
    params: {
      redChannelWeight: 0.25,
      greenChannelWeight: 0.65,
      blueChannelWeight: 0.10,
      contrast: 0.10,
      highlights: -0.08,
      shadows: 0.08,
      shadowTint: [0.92, 0.96, 1.00],
      clarity: 0.03,
      warmth: 0.05,
    }
  }
};

/**
 * Resolves a preset from asset ID or asset name or presetKey.
 */
export function getMonochromePreset(identifier: string | number): MonochromePreset | undefined {
  if (typeof identifier === 'number') {
    return Object.values(MONOCHROME_PRESETS).find((p) => p.id === identifier);
  }

  const idNum = Number(identifier);
  if (!isNaN(idNum) && idNum > 0) {
    const foundById = Object.values(MONOCHROME_PRESETS).find((p) => p.id === idNum);
    if (foundById) return foundById;
  }

  const key = identifier.toString().toLowerCase().trim();
  if (MONOCHROME_PRESETS[key]) return MONOCHROME_PRESETS[key];

  const normalizedKey = key.replace(/[^a-z0-9]/g, '_');
  if (MONOCHROME_PRESETS[normalizedKey]) return MONOCHROME_PRESETS[normalizedKey];

  return Object.values(MONOCHROME_PRESETS).find(
    (p) => p.name.toLowerCase() === key || p.presetKey.toLowerCase() === key
  );
}
