// src/components/editor-main-screen/tools/filters/engines/toneAdjustment/toneAdjustmentPresets.ts

export interface ToneAdjustmentParams {
  exposure?: number;       // -1 to +1 (EV scale)
  brightness?: number;     // -1 to +1 (-100% to +100%)
  contrast?: number;       // -1 to +1 (-100% to +100%)
  highlights?: number;     // -1 to +1 (recover highlights or boost)
  shadows?: number;        // -1 to +1 (lift shadows or deepen)
  whites?: number;         // -1 to +1 (boost or drop bright whites)
  blacks?: number;         // -1 to +1 (crush or lift deep blacks)
  gamma?: number;          // 0.2 to 2.2 (midtone gamma curve)
  midtones?: number;       // -1 to +1 (midtone gain)
  temperature?: number;    // -1 to +1 (cool blue to warm orange)
  tint?: number;           // -1 to +1 (green to magenta)
  vibrance?: number;       // -1 to +1 (smart saturation adjustment)
  saturation?: number;     // -1 to +1 (-100% to +100%)
  fade?: number;           // 0 to 1 (film style matte / lifted shadows)
  vignette?: number;       // 0 to 1 (dark corner falloff)
  glow?: number;           // 0 to 1 (soft glow factor)
  clarity?: number;        // -1 to +1 (midtone contrast)
}

export interface ToneAdjustmentPreset {
  id: number;
  presetKey: string;
  name: string;
  engineKey: 'ToneAdjustmentEngine';
  category: 'Lighting & Tone';
  description: string;
  params: ToneAdjustmentParams;
}

export const TONE_ADJUSTMENT_PRESETS: Record<string, ToneAdjustmentPreset> = {
  bright_pop: {
    id: 11,
    presetKey: 'bright_pop',
    name: 'Bright Pop',
    engineKey: 'ToneAdjustmentEngine',
    category: 'Lighting & Tone',
    description: 'Bright, energetic enhancement for social content avoiding highlight clipping.',
    params: {
      exposure: 0.08,
      contrast: 0.06,
      highlights: -0.04,
      saturation: 0.06,
      vibrance: 0.06,
    }
  },
  deep_contrast: {
    id: 12,
    presetKey: 'deep_contrast',
    name: 'Deep Contrast',
    engineKey: 'ToneAdjustmentEngine',
    category: 'Lighting & Tone',
    description: 'Strong tonal separation and visual depth with monitored shadow clipping.',
    params: {
      contrast: 0.18,
      highlights: -0.06,
      shadows: -0.12,
      clarity: 0.04,
    }
  },
  soft_contrast: {
    id: 13,
    presetKey: 'soft_contrast',
    name: 'Soft Contrast',
    engineKey: 'ToneAdjustmentEngine',
    category: 'Lighting & Tone',
    description: 'Smooth, gentle tonal range preserving micro-contrast for clarity without a flat image.',
    params: {
      contrast: -0.10,
      highlights: -0.05,
      shadows: 0.08,
      clarity: -0.02,
    }
  },
  matte_finish: {
    id: 14,
    presetKey: 'matte_finish',
    name: 'Matte Finish',
    engineKey: 'ToneAdjustmentEngine',
    category: 'Lighting & Tone',
    description: 'Lifted blacks and reduced contrast for a modern matte grade without a washed-out image.',
    params: {
      contrast: -0.12,
      blacks: 0.12,
      highlights: -0.06,
      saturation: -0.04,
    }
  },
  fade_colors: {
    id: 15,
    presetKey: 'fade_colors',
    name: 'Fade Colour',
    engineKey: 'ToneAdjustmentEngine',
    category: 'Lighting & Tone',
    description: 'Subtle aged/faded print character with lifted blacks and softened contrast.',
    params: {
      contrast: -0.08,
      saturation: -0.12,
      blacks: 0.09,
      highlights: -0.04,
    }
  },
  natural_tone: {
    id: 16,
    presetKey: 'natural_tone',
    name: 'Natural Tone',
    engineKey: 'ToneAdjustmentEngine',
    category: 'Lighting & Tone',
    description: 'Corrective preset prioritizing neutrality over style to move footage toward realistic color.',
    params: {
      exposure: 0.0,
      temperature: 0.0,
      tint: 0.0,
      contrast: 0.02,
      saturation: 0.01,
    }
  },
  dynamic_tone: {
    id: 17,
    presetKey: 'dynamic_tone',
    name: 'Dynamic Tone',
    engineKey: 'ToneAdjustmentEngine',
    category: 'Lighting & Tone',
    description: 'Balanced enhancement of brightness, contrast, saturation, and color for broad compatibility.',
    params: {
      exposure: 0.03,
      contrast: 0.08,
      highlights: -0.08,
      shadows: 0.06,
      saturation: 0.05,
    }
  },
  golden_glow: {
    id: 18,
    presetKey: 'golden_glow',
    name: 'GoldenGlow',
    engineKey: 'ToneAdjustmentEngine',
    category: 'Lighting & Tone',
    description: 'Warm golden illumination with soft highlights protecting skin tones and bright yellow objects.',
    params: {
      temperature: 0.10,
      highlights: -0.06,
      exposure: 0.03,
      glow: 0.07,
      saturation: 0.03,
    }
  }
};

/**
 * Resolves a preset from asset ID or asset name or presetKey.
 */
export function getToneAdjustmentPreset(identifier: string | number): ToneAdjustmentPreset | undefined {
  if (typeof identifier === 'number') {
    return Object.values(TONE_ADJUSTMENT_PRESETS).find((p) => p.id === identifier);
  }

  const idNum = Number(identifier);
  if (!isNaN(idNum) && idNum > 0) {
    const foundById = Object.values(TONE_ADJUSTMENT_PRESETS).find((p) => p.id === idNum);
    if (foundById) return foundById;
  }

  const key = identifier.toString().toLowerCase().trim();
  if (TONE_ADJUSTMENT_PRESETS[key]) return TONE_ADJUSTMENT_PRESETS[key];

  const normalizedKey = key.replace(/[^a-z0-9]/g, '_');
  if (TONE_ADJUSTMENT_PRESETS[normalizedKey]) return TONE_ADJUSTMENT_PRESETS[normalizedKey];

  return Object.values(TONE_ADJUSTMENT_PRESETS).find(
    (p) => p.name.toLowerCase() === key || p.presetKey.toLowerCase() === key
  );
}
