// src/components/editor-main-screen/tools/filters/engines/neonGrade/neonGradePresets.ts

export interface NeonGradeParams {
  cyanElectricBoost?: number;   // 0 to 1 (electric cyan/blue hue boost & saturation)
  magentaPinkBoost?: number;    // 0 to 1 (hot magenta/pink hue boost & saturation)
  purpleVioletBoost?: number;   // 0 to 1 (deep purple/violet shadow shift)
  redPinkBoost?: number;        // 0 to 1 (red/pink saturation boost)
  tealShadows?: number;         // 0 to 1 (teal shadow boost)
  magentaHighlights?: number;   // 0 to 1 (magenta highlight boost)
  highlightTint?: [number, number, number]; // RGB tint array for highlights
  shadowTint?: [number, number, number];    // RGB tint array for shadows
  neonGlowIntensity?: number;  // 0 to 1 (luminous highlight bloom/glow approximation)
  chromaticOffset?: number;     // 0 to 1 (subtle RGB channel split/aberration feel)
  contrast?: number;            // -1 to +1
  brightness?: number;          // -1 to +1
  blackPoint?: number;          // 0 to 1 (deep black shadow crush/lift)
  saturation?: number;          // -1 to +1
  vignette?: number;            // 0 to 1 (radial lens corner falloff)
  warmth?: number;              // -1 to +1
  shadows?: number;             // -1 to +1
}

export interface NeonGradePreset {
  id: number;
  presetKey: string;
  name: string;
  engineKey: 'NeonGradeEngine';
  category: 'Neon & Cyber';
  description: string;
  params: NeonGradeParams;
}

export const NEON_GRADE_PRESETS: Record<string, NeonGradePreset> = {
  neon_blue: {
    id: 42,
    presetKey: 'neon_blue',
    name: 'Neon Blue',
    engineKey: 'NeonGradeEngine',
    category: 'Neon & Cyber',
    description: 'Electric blue illumination and glow with strongest bloom around bright sources.',
    params: {
      cyanElectricBoost: 0.20,
      warmth: -0.08,
      contrast: 0.12,
      neonGlowIntensity: 0.10,
      highlightTint: [0.10, 0.75, 1.00],
      shadowTint: [0.05, 0.08, 0.28],
    }
  },
  neon_pink: {
    id: 43,
    presetKey: 'neon_pink',
    name: 'Neon Pink',
    engineKey: 'NeonGradeEngine',
    category: 'Neon & Cyber',
    description: 'Pink/magenta neon atmosphere with bloom, preventing skin from becoming uniformly pink.',
    params: {
      magentaPinkBoost: 0.18,
      redPinkBoost: 0.15,
      contrast: 0.10,
      neonGlowIntensity: 0.10,
      shadows: -0.05,
      highlightTint: [1.00, 0.20, 0.70],
    }
  },
  cyberpunk: {
    id: 44,
    presetKey: 'cyberpunk',
    name: 'Cyberpunk',
    engineKey: 'NeonGradeEngine',
    category: 'Neon & Cyber',
    description: 'Teal/magenta cyber grade with deep shadows, selective color mapping, and neon glow.',
    params: {
      tealShadows: 0.15,
      magentaHighlights: 0.12,
      contrast: 0.18,
      saturation: 0.08,
      neonGlowIntensity: 0.07,
      chromaticOffset: 0.15,
      shadowTint: [0.00, 0.45, 0.55],
      highlightTint: [0.95, 0.10, 0.65],
    }
  },
  synthwave: {
    id: 45,
    presetKey: 'synthwave',
    name: 'Synthwave',
    engineKey: 'NeonGradeEngine',
    category: 'Neon & Cyber',
    description: 'Retro-futuristic pink/purple/blue gradient with soft bloom, avoiding highlight clipping.',
    params: {
      purpleVioletBoost: 0.15,
      magentaPinkBoost: 0.12,
      cyanElectricBoost: 0.10,
      contrast: 0.12,
      neonGlowIntensity: 0.08,
      shadowTint: [0.25, 0.05, 0.45],
    }
  }
};

/**
 * Resolves a preset from asset ID or asset name or presetKey.
 */
export function getNeonGradePreset(identifier: string | number): NeonGradePreset | undefined {
  if (typeof identifier === 'number') {
    return Object.values(NEON_GRADE_PRESETS).find((p) => p.id === identifier);
  }

  const idNum = Number(identifier);
  if (!isNaN(idNum) && idNum > 0) {
    const foundById = Object.values(NEON_GRADE_PRESETS).find((p) => p.id === idNum);
    if (foundById) return foundById;
  }

  const key = identifier.toString().toLowerCase().trim();
  if (NEON_GRADE_PRESETS[key]) return NEON_GRADE_PRESETS[key];

  const normalizedKey = key.replace(/[^a-z0-9]/g, '_');
  if (NEON_GRADE_PRESETS[normalizedKey]) return NEON_GRADE_PRESETS[normalizedKey];

  return Object.values(NEON_GRADE_PRESETS).find(
    (p) => p.name.toLowerCase() === key || p.presetKey.toLowerCase() === key
  );
}
