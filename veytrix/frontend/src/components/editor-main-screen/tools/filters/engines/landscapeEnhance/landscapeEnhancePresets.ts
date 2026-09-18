// src/components/editor-main-screen/tools/filters/engines/landscapeEnhance/landscapeEnhancePresets.ts

export interface LandscapeEnhanceParams {
  foliageGreenBoost?: number;  // 0 to 1 (target green foliage saturation & luminance boost)
  skyBlueBoost?: number;      // 0 to 1 (target cyan/blue sky & water depth boost)
  warmth?: number;            // -1 (cool mountain) to +1 (warm sunset)
  vibrance?: number;          // -1 to +1 (selective saturation)
  saturation?: number;        // -1 to +1
  contrast?: number;          // -1 to +1
  brightness?: number;        // -1 to +1
  highlights?: number;        // -1 to +1
  shadows?: number;           // -1 to +1
  clarityDehaze?: number;     // 0 to 1 (midtone micro-contrast atmospheric clarity)
  hdrToneMap?: number;        // 0 to 1 (shadow recovery & highlight compression)
  autumnShift?: number;       // 0 to 1 (shift green hues toward warm golden autumn leaves)
  aquaTropicalShift?: number; // 0 to 1 (shift blues toward vibrant turquoise/cyan)
  vignette?: number;          // 0 to 1 (radial lens corner falloff)
  greenLum?: number;          // 0 to 1 (green channel luminance boost)
  blueLum?: number;           // 0 to 1 (blue channel luminance boost)
  yellowBoost?: number;       // 0 to 1
  redBoost?: number;          // 0 to 1
}

export interface LandscapeEnhancePreset {
  id: number;
  presetKey: string;
  name: string;
  engineKey: 'LandscapeEnhanceEngine';
  category: 'Nature & Landscape';
  description: string;
  params: LandscapeEnhanceParams;
}

export const LANDSCAPE_ENHANCE_PRESETS: Record<string, LandscapeEnhancePreset> = {
  forest_green: {
    id: 37,
    presetKey: 'forest_green',
    name: 'Forest Green',
    engineKey: 'LandscapeEnhanceEngine',
    category: 'Nature & Landscape',
    description: 'Deep rich natural greens for vegetation while protecting skin tones if people are present.',
    params: {
      foliageGreenBoost: 0.10,
      greenLum: 0.03,
      contrast: 0.07,
      shadows: 0.04,
      vignette: 0.06,
    }
  },
  ocean_blue: {
    id: 38,
    presetKey: 'ocean_blue',
    name: 'Ocean Blue',
    engineKey: 'LandscapeEnhanceEngine',
    category: 'Nature & Landscape',
    description: 'Clear blue/aqua enhancement for water and sky, avoiding clipping blue channels.',
    params: {
      skyBlueBoost: 0.10,
      blueLum: 0.04,
      contrast: 0.05,
      warmth: -0.02,
      vignette: 0.08,
    }
  },
  tropical_paradise: {
    id: 39,
    presetKey: 'tropical_paradise',
    name: 'Tropical Paradise',
    engineKey: 'LandscapeEnhanceEngine',
    category: 'Nature & Landscape',
    description: 'Vibrant tropical greens, blues, and warm sunlight while maintaining natural skin and sky.',
    params: {
      foliageGreenBoost: 0.10,
      aquaTropicalShift: 0.08,
      yellowBoost: 0.05,
      saturation: 0.07,
      highlights: -0.05,
    }
  },
  autumn_leaves: {
    id: 40,
    presetKey: 'autumn_leaves',
    name: 'Autumn Leaves',
    engineKey: 'LandscapeEnhanceEngine',
    category: 'Nature & Landscape',
    description: 'Warm seasonal red, orange, and yellow enhancement while avoiding turning skin excessively orange.',
    params: {
      redBoost: 0.08,
      autumnShift: 0.10,
      yellowBoost: 0.07,
      warmth: 0.05,
      contrast: 0.05,
    }
  },
  nature_hdr: {
    id: 41,
    presetKey: 'nature_hdr',
    name: 'Nature HDR',
    engineKey: 'LandscapeEnhanceEngine',
    category: 'Nature & Landscape',
    description: 'Landscape detail with enhanced dynamic range, shadow recovery, and highlight preservation without HDR halos.',
    params: {
      highlights: -0.18,
      shadows: 0.16,
      clarityDehaze: 0.07,
      saturation: 0.05,
      contrast: 0.07,
      hdrToneMap: 0.15,
    }
  }
};

/**
 * Resolves a preset from asset ID or asset name or presetKey.
 */
export function getLandscapeEnhancePreset(identifier: string | number): LandscapeEnhancePreset | undefined {
  if (typeof identifier === 'number') {
    return Object.values(LANDSCAPE_ENHANCE_PRESETS).find((p) => p.id === identifier);
  }

  const idNum = Number(identifier);
  if (!isNaN(idNum) && idNum > 0) {
    const foundById = Object.values(LANDSCAPE_ENHANCE_PRESETS).find((p) => p.id === idNum);
    if (foundById) return foundById;
  }

  const key = identifier.toString().toLowerCase().trim();
  if (LANDSCAPE_ENHANCE_PRESETS[key]) return LANDSCAPE_ENHANCE_PRESETS[key];

  const normalizedKey = key.replace(/[^a-z0-9]/g, '_');
  if (LANDSCAPE_ENHANCE_PRESETS[normalizedKey]) return LANDSCAPE_ENHANCE_PRESETS[normalizedKey];

  return Object.values(LANDSCAPE_ENHANCE_PRESETS).find(
    (p) => p.name.toLowerCase() === key || p.presetKey.toLowerCase() === key
  );
}
