// src/components/editor-main-screen/tools/filters/engines/colorGrade/colorGradePresets.ts

export interface ColorGradeParams {
  exposure?: number;       // -1 to +1 (EV scale)
  contrast?: number;       // -1 to +1 (-100% to +100%)
  brightness?: number;     // -1 to +1 (-100% to +100%)
  saturation?: number;     // -1 to +1 (-100% to +100%)
  temperature?: number;    // -1 to +1 (cool blue to warm orange)
  tint?: number;           // -1 to +1 (green to magenta)
  highlights?: number;     // -1 to +1 (recover highlights or boost)
  shadows?: number;        // -1 to +1 (lift shadows or deepen)
  blacks?: number;         // -1 to +1 (crush or lift deep blacks)
  whites?: number;         // -1 to +1 (boost or drop bright whites)
  fade?: number;           // 0 to 1 (film style matte / lifted shadows)
  vibrance?: number;       // -1 to +1 (smart saturation adjustment)
  clarity?: number;        // -1 to +1 (midtone contrast boost/soften)
  grain?: number;          // 0 to 1 (subtle film grain overlay)
  vignette?: number;       // 0 to 1 (dark corner falloff)
  highlightHue?: number;   // 0 to 360 (degrees tint in highlights)
  shadowHue?: number;      // 0 to 360 (degrees tint in shadows)
  colorBalance?: number;   // -1 to +1 (shift midtone balance)
  glow?: number;           // 0 to 1 (bloom / soft dreamy glow factor)
}

export interface ColorGradePreset {
  id: number;
  presetKey: string;
  name: string;
  engineKey: 'ColorGradeEngine';
  category: 'Cinematic';
  description: string;
  params: ColorGradeParams;
}

export const COLOR_GRADE_PRESETS: Record<string, ColorGradePreset> = {
  hollywood_gold: {
    id: 1,
    presetKey: 'hollywood_gold',
    name: 'Hollywood Gold',
    engineKey: 'ColorGradeEngine',
    category: 'Cinematic',
    description: 'Warm blockbuster-style grade with rich golden highlights, protected skin tones, and controlled contrast.',
    params: {
      exposure: 0.03,
      contrast: 0.12,
      highlights: -0.08,
      shadows: 0.05,
      temperature: 0.10,
      saturation: 0.05,
      glow: 0.05,
      highlightHue: 42,
      shadowHue: 25,
      vignette: 0.10,
    }
  },
  cinematic_lut: {
    id: 2,
    presetKey: 'cinematic_lut',
    name: 'Cinematic LUT',
    engineKey: 'ColorGradeEngine',
    category: 'Cinematic',
    description: 'Balanced professional film-style grade with controlled color separation, neutral base, and dynamic range.',
    params: {
      contrast: 0.10,
      highlights: -0.12,
      shadows: 0.08,
      saturation: 0.04,
      temperature: 0.03,
      fade: 0.02,
      vignette: 0.08,
    }
  },
  teal_orange: {
    id: 3,
    presetKey: 'teal_orange',
    name: 'Teal & Orange',
    engineKey: 'ColorGradeEngine',
    category: 'Cinematic',
    description: 'Cinematic separation between cooler teal backgrounds and warmer orange midtones with skin protection.',
    params: {
      temperature: -0.02,
      contrast: 0.10,
      saturation: 0.04,
      shadowHue: 195,     // Teal cyan in shadows
      highlightHue: 35,   // Orange warm in midtones/highlights
      vignette: 0.12,
    }
  },
  warm_cinema: {
    id: 4,
    presetKey: 'warm_cinema',
    name: 'Warm CInema',
    engineKey: 'ColorGradeEngine',
    category: 'Cinematic',
    description: 'Warm amber atmosphere with soft highlights and natural contrast while maintaining neutral whites.',
    params: {
      temperature: 0.08,
      tint: 0.02,
      contrast: 0.07,
      highlights: -0.10,
      saturation: 0.03,
      vignette: 0.08,
    }
  },
  cold_cinema: {
    id: 5,
    presetKey: 'cold_cinema',
    name: 'Cold Cinema',
    engineKey: 'ColorGradeEngine',
    category: 'Cinematic',
    description: 'Cool blue/cyan cinematic appearance with crisp dramatic contrast and selective skin warmth preservation.',
    params: {
      temperature: -0.10,
      contrast: 0.10,
      highlights: -0.08,
      shadows: -0.03,
      saturation: 0.02,
      shadowHue: 210,
      vignette: 0.12,
    }
  },
  moody_film: {
    id: 6,
    presetKey: 'moody_film',
    name: 'Moddy Film',
    engineKey: 'ColorGradeEngine',
    category: 'Cinematic',
    description: 'Dark emotional film character with restrained color and preserved shadow detail.',
    params: {
      exposure: -0.04,
      contrast: 0.14,
      highlights: -0.15,
      shadows: -0.10,
      saturation: -0.08,
      fade: 0.02,
      vignette: 0.18,
    }
  },
  dream_cinema: {
    id: 7,
    presetKey: 'dream_cinema',
    name: 'Dream Cinema',
    engineKey: 'ColorGradeEngine',
    category: 'Cinematic',
    description: 'Soft pastel cinematic look with controlled dreamy bloom around bright edges.',
    params: {
      contrast: -0.03,
      highlights: -0.08,
      shadows: 0.08,
      saturation: -0.04,
      temperature: 0.03,
      glow: 0.10,
      vignette: 0.06,
    }
  },
  vintage_cinema: {
    id: 8,
    presetKey: 'vintage_cinema',
    name: 'Vinatage Cinema',
    engineKey: 'ColorGradeEngine',
    category: 'Cinematic',
    description: 'Faded film character with subtle resolution-aware analog grain, matte fade, and warmth.',
    params: {
      contrast: -0.05,
      saturation: -0.08,
      blacks: 0.06,
      temperature: 0.05,
      grain: 0.08,
      fade: 0.05,
      vignette: 0.14,
    }
  },
  hdr_film: {
    id: 9,
    presetKey: 'hdr_film',
    name: 'HDR Film',
    engineKey: 'ColorGradeEngine',
    category: 'Cinematic',
    description: 'Vivid cinematic grade with preserved highlight/shadow information without HDR halos or over-sharpening.',
    params: {
      highlights: -0.18,
      shadows: 0.15,
      clarity: 0.06,
      contrast: 0.08,
      saturation: 0.05,
      vignette: 0.08,
    }
  },
  directors_cut: {
    id: 10,
    presetKey: 'directors_cut',
    name: "Director's Cut",
    engineKey: 'ColorGradeEngine',
    category: 'Cinematic',
    description: 'Premium all-purpose film finish combining balanced grading, skin protection, and refined range.',
    params: {
      contrast: 0.09,
      highlights: -0.12,
      shadows: 0.08,
      saturation: 0.03,
      temperature: 0.02,
      clarity: 0.03,
      glow: 0.03,
      vignette: 0.10,
    }
  },
};

/**
 * Resolves a preset from asset ID or asset name or presetKey.
 */
export function getColorGradePreset(identifier: string | number): ColorGradePreset | undefined {
  if (typeof identifier === 'number') {
    return Object.values(COLOR_GRADE_PRESETS).find((p) => p.id === identifier);
  }

  const idNum = Number(identifier);
  if (!isNaN(idNum) && idNum > 0) {
    const foundById = Object.values(COLOR_GRADE_PRESETS).find((p) => p.id === idNum);
    if (foundById) return foundById;
  }

  const key = identifier.toString().toLowerCase().trim();
  if (COLOR_GRADE_PRESETS[key]) return COLOR_GRADE_PRESETS[key];

  const normalizedKey = key.replace(/[^a-z0-9]/g, '_');
  if (COLOR_GRADE_PRESETS[normalizedKey]) return COLOR_GRADE_PRESETS[normalizedKey];

  return Object.values(COLOR_GRADE_PRESETS).find(
    (p) => p.name.toLowerCase() === key || p.presetKey.toLowerCase() === key
  );
}
