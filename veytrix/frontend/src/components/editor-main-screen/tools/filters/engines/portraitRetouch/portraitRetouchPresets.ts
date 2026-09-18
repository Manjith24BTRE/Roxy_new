// src/components/editor-main-screen/tools/filters/engines/portraitRetouch/portraitRetouchPresets.ts

export interface PortraitRetouchParams {
  smooth?: number;          // 0 to 1 (skin bilateral/smoothing intensity)
  skinToneWarmth?: number;  // -1 to +1 (skin warmth tint)
  skinToneRosy?: number;    // -1 to +1 (skin rosy magenta tint)
  skinBrightness?: number;  // -1 to +1 (skin luminescence boost)
  eyeClarity?: number;      // -1 to +1 (eye/feature contrast sharpening)
  softFocus?: number;       // 0 to 1 (soft focus bloom diffusion)
  contrast?: number;        // -1 to +1
  highlights?: number;      // -1 to +1
  shadows?: number;         // -1 to +1
  vibrance?: number;        // -1 to +1
  saturation?: number;      // -1 to +1
  exposure?: number;        // -1 to +1
  glow?: number;            // 0 to 1 (glamour glow)
  vignette?: number;        // 0 to 1
  redSaturation?: number;   // -1 to +1 (red channel saturation adjustment)
  orangeRedLum?: number;    // -1 to +1 (orange/red channel luminance adjustment)
  claritySkin?: number;     // -1 to +1 (skin clarity softening/sharpening)
  clarityHair?: number;     // -1 to +1 (hair/edge clarity sharpening)
}

export interface PortraitRetouchPreset {
  id: number;
  presetKey: string;
  name: string;
  engineKey: 'PortraitRetouchEngine';
  category: 'Portrait';
  description: string;
  params: PortraitRetouchParams;
}

export const PORTRAIT_RETOUCH_PRESETS: Record<string, PortraitRetouchPreset> = {
  natural_skin: {
    id: 19,
    presetKey: 'natural_skin',
    name: 'Natural Skin',
    engineKey: 'PortraitRetouchEngine',
    category: 'Portrait',
    description: 'Realistic skin enhancement without an artificial beauty effect, preserving skin texture and color balance.',
    params: {
      exposure: 0.02,
      redSaturation: -0.02,
      claritySkin: -0.01,
      smooth: 0.12,
      skinToneWarmth: 0.02,
    }
  },
  beauty_soft: {
    id: 20,
    presetKey: 'beauty_soft',
    name: 'Beauty Soft',
    engineKey: 'PortraitRetouchEngine',
    category: 'Portrait',
    description: 'Gentle smoothing, brightness, and soft highlights while preserving facial detail and pores.',
    params: {
      exposure: 0.03,
      highlights: -0.08,
      smooth: 0.35,
      claritySkin: -0.08,
      saturation: 0.02,
      softFocus: 0.18,
    }
  },
  golden_skin: {
    id: 21,
    presetKey: 'golden_skin',
    name: 'Golden Skin',
    engineKey: 'PortraitRetouchEngine',
    category: 'Portrait',
    description: 'Warm sun-kissed skin with controlled golden highlights, protecting skin from turning orange.',
    params: {
      skinToneWarmth: 0.08,
      orangeRedLum: 0.03,
      highlights: -0.05,
      saturation: 0.03,
      smooth: 0.15,
    }
  },
  fashion_look: {
    id: 22,
    presetKey: 'fashion_look',
    name: 'Fashion Look',
    engineKey: 'PortraitRetouchEngine',
    category: 'Portrait',
    description: 'Polished editorial contrast and vibrant but controlled color while keeping skin tones neutral.',
    params: {
      contrast: 0.12,
      saturation: 0.05,
      eyeClarity: 0.05,
      highlights: -0.08,
      shadows: 0.04,
      smooth: 0.14,
    }
  },
  glamour_glow: {
    id: 23,
    presetKey: 'glamour_glow',
    name: 'Glamour Glow',
    engineKey: 'PortraitRetouchEngine',
    category: 'Portrait',
    description: 'Soft luminous portrait treatment with gentle bloom that does not obscure facial detail.',
    params: {
      exposure: 0.03,
      highlights: -0.10,
      glow: 0.10,
      claritySkin: -0.05,
      smooth: 0.25,
      saturation: 0.02,
    }
  },
  clean_portrait: {
    id: 24,
    presetKey: 'clean_portrait',
    name: 'Clean Portrait',
    engineKey: 'PortraitRetouchEngine',
    category: 'Portrait',
    description: 'Crisp, polished portrait with controlled color, avoiding excessive sharpening around hair and edges.',
    params: {
      contrast: 0.05,
      eyeClarity: 0.05,
      highlights: -0.06,
      shadows: 0.04,
      saturation: 0.01,
      smooth: 0.10,
    }
  },
  beauty_pro: {
    id: 25,
    presetKey: 'beauty_pro',
    name: 'Beauty Pro',
    engineKey: 'PortraitRetouchEngine',
    category: 'Portrait',
    description: 'Complete professional beauty treatment with face-aware smoothing, refined clarity, and subtle lighting.',
    params: {
      exposure: 0.02,
      smooth: 0.25,
      highlights: -0.08,
      claritySkin: -0.04,
      clarityHair: 0.03,
      saturation: 0.02,
    }
  }
};

/**
 * Resolves a preset from asset ID or asset name or presetKey.
 */
export function getPortraitRetouchPreset(identifier: string | number): PortraitRetouchPreset | undefined {
  if (typeof identifier === 'number') {
    return Object.values(PORTRAIT_RETOUCH_PRESETS).find((p) => p.id === identifier);
  }

  const idNum = Number(identifier);
  if (!isNaN(idNum) && idNum > 0) {
    const foundById = Object.values(PORTRAIT_RETOUCH_PRESETS).find((p) => p.id === idNum);
    if (foundById) return foundById;
  }

  const key = identifier.toString().toLowerCase().trim();
  if (PORTRAIT_RETOUCH_PRESETS[key]) return PORTRAIT_RETOUCH_PRESETS[key];

  const normalizedKey = key.replace(/[^a-z0-9]/g, '_');
  if (PORTRAIT_RETOUCH_PRESETS[normalizedKey]) return PORTRAIT_RETOUCH_PRESETS[normalizedKey];

  return Object.values(PORTRAIT_RETOUCH_PRESETS).find(
    (p) => p.name.toLowerCase() === key || p.presetKey.toLowerCase() === key
  );
}
