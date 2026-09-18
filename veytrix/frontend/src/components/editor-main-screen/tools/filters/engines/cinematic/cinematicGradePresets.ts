// src/components/editor-main-screen/tools/filters/engines/cinematic/cinematicGradePresets.ts

export interface CinematicGradeParams {
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

export interface CinematicPreset {
  id: number;
  presetKey: string;
  name: string;
  description: string;
  params: CinematicGradeParams;
}

export const CINEMATIC_PRESETS: Record<string, CinematicPreset> = {
  hollywood_gold: {
    id: 1,
    presetKey: 'hollywood_gold',
    name: 'Hollywood Gold',
    description: 'Warm cinematic highlights, slightly lifted shadows, controlled contrast, subtle golden skin tones.',
    params: {
      temperature: 0.32,
      tint: 0.08,
      contrast: 0.18,
      saturation: 0.06,
      highlights: -0.08,
      shadows: 0.10,
      fade: 0.04,
      highlightHue: 42,
      shadowHue: 25,
      vignette: 0.15,
      vibrance: 0.10,
    }
  },
  cinematic_lut: {
    id: 2,
    presetKey: 'cinematic_lut',
    name: 'Cinematic LUT',
    description: 'Balanced cinematic color grade with film-like contrast, controlled saturation and subtle highlight rolloff.',
    params: {
      exposure: 0.02,
      contrast: 0.22,
      saturation: -0.06,
      temperature: 0.05,
      highlights: -0.12,
      shadows: 0.06,
      blacks: -0.04,
      fade: 0.05,
      vignette: 0.12,
      clarity: 0.08,
    }
  },
  teal_orange: {
    id: 3,
    presetKey: 'teal_orange',
    name: 'Teal & Orange',
    description: 'Teal/cyan influence in shadows and orange/warm influence in skin and highlights. Keep the effect tasteful and avoid oversaturation.',
    params: {
      temperature: 0.14,
      tint: -0.05,
      contrast: 0.24,
      saturation: 0.08,
      highlights: 0.06,
      shadows: -0.08,
      shadowHue: 195,     // Teal cyan
      highlightHue: 35,   // Orange warm
      colorBalance: 0.05,
      vignette: 0.22,
    }
  },
  warm_cinema: {
    id: 4,
    presetKey: 'warm_cinema',
    name: 'Warm CInema',
    description: 'Warm overall temperature with cinematic contrast and slightly softened highlights.',
    params: {
      temperature: 0.40,
      tint: 0.06,
      contrast: 0.14,
      saturation: 0.10,
      highlights: -0.16,
      shadows: 0.08,
      fade: 0.03,
      vignette: 0.10,
    }
  },
  cold_cinema: {
    id: 5,
    presetKey: 'cold_cinema',
    name: 'Cold Cinema',
    description: 'Cool blue/cyan temperature, restrained saturation, deeper cinematic shadows.',
    params: {
      temperature: -0.38,
      tint: -0.10,
      contrast: 0.25,
      saturation: -0.16,
      shadows: -0.12,
      blacks: -0.06,
      highlights: 0.08,
      shadowHue: 210, // Cool blue
      vignette: 0.18,
    }
  },
  moddy_film: {
    id: 6,
    presetKey: 'moddy_film',
    name: 'Moddy Film',
    description: 'Moody/dark cinematic appearance with deeper shadows, reduced saturation and controlled highlights.',
    params: {
      temperature: -0.12,
      contrast: 0.30,
      saturation: -0.32,
      exposure: -0.05,
      shadows: -0.20,
      blacks: -0.12,
      highlights: -0.18,
      vignette: 0.38,
      fade: 0.02,
    }
  },
  dream_cinema: {
    id: 7,
    presetKey: 'dream_cinema',
    name: 'Dream Cinema',
    description: 'Soft cinematic appearance with slightly lifted blacks, gentle contrast, warm highlights and subtle glow.',
    params: {
      temperature: 0.18,
      tint: 0.04,
      contrast: -0.12,
      highlights: -0.22,
      shadows: 0.18,
      fade: 0.14,
      glow: 0.30,
      saturation: 0.06,
      vignette: 0.08,
    }
  },
  vinatage_cinema: {
    id: 8,
    presetKey: 'vinatage_cinema',
    name: 'Vinatage Cinema',
    description: 'Vintage cinematic tone with warm color shift, faded contrast, slightly muted saturation and subtle film character.',
    params: {
      temperature: 0.30,
      tint: 0.12,
      contrast: -0.08,
      saturation: -0.22,
      fade: 0.20,
      grain: 0.15,
      vignette: 0.25,
      shadowHue: 45,
    }
  },
  hdr_film: {
    id: 9,
    presetKey: 'hdr_film',
    name: 'HDR Film',
    description: 'Controlled dynamic range enhancement, stronger local contrast, recovered highlights and deeper shadows without producing an artificial HDR appearance.',
    params: {
      contrast: 0.32,
      clarity: 0.30,
      highlights: -0.28,
      shadows: 0.24,
      saturation: 0.12,
      vibrance: 0.18,
      blacks: -0.05,
      whites: 0.08,
      vignette: 0.14,
    }
  },
  directors_cut: {
    id: 10,
    presetKey: 'directors_cut',
    name: "Director's Cut",
    description: 'Premium cinematic grade combining controlled contrast, subtle color separation, restrained saturation and film-style highlight rolloff.',
    params: {
      temperature: 0.08,
      tint: 0.02,
      contrast: 0.26,
      saturation: -0.12,
      highlights: -0.15,
      shadows: 0.10,
      shadowHue: 200,
      highlightHue: 38,
      fade: 0.06,
      vignette: 0.16,
      clarity: 0.12,
    }
  },
};

/**
 * Resolves a preset from asset ID or asset name or presetKey.
 */
export function getCinematicPreset(identifier: string | number): CinematicPreset | undefined {
  if (typeof identifier === 'number') {
    return Object.values(CINEMATIC_PRESETS).find((p) => p.id === identifier);
  }
  const key = identifier.toString().toLowerCase().trim();
  if (CINEMATIC_PRESETS[key]) return CINEMATIC_PRESETS[key];
  
  const normalizedKey = key.replace(/[^a-z0-9]/g, '_');
  if (CINEMATIC_PRESETS[normalizedKey]) return CINEMATIC_PRESETS[normalizedKey];

  return Object.values(CINEMATIC_PRESETS).find(
    (p) => p.name.toLowerCase() === key || p.presetKey.toLowerCase() === key
  );
}
