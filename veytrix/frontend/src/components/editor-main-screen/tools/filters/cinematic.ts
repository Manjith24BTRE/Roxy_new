// src/components/editor-main-screen/tools/filters/cinematic.ts

export interface CinematicFilterAdjustmentSpec {
  exposure?: number;       // -100 to +100
  contrast?: number;       // -100 to +100
  brightness?: number;     // -100 to +100
  saturation?: number;     // -100 to +100
  hue?: number;            // -180 to +180
  temperature?: number;    // -100 to +100
  tint?: number;           // -100 to +100
  highlights?: number;     // -100 to +100
  shadows?: number;        // -100 to +100
  fade?: number;           // 0 to 100
  grain?: number;          // 0 to 100
  bloom?: number;          // 0 to 100
  clarity?: number;        // -100 to +100
  vibrance?: number;       // -100 to +100
  skinProtection?: boolean;
  resolutionGrain?: boolean;
  tealOrangeSplit?: boolean;
  warmHighlightToning?: boolean;
  coolShadowToning?: boolean;
  moodyGrading?: boolean;
  dreamBloom?: boolean;
  vintageEmulation?: boolean;
  hdrRecovery?: boolean;
}

export interface CinematicFilterPreset {
  id: string;
  name: string;
  category: string;
  description: string;
  adjustments: CinematicFilterAdjustmentSpec;
}

export const CINEMATIC_FILTER_PRESETS: Record<string, CinematicFilterPreset> = {
  hollywood_gold: {
    id: 'hollywood_gold',
    name: 'Hollywood Gold',
    category: 'Cinematic',
    description: 'Classic filmic warmth with rich midtones and smooth highlight rolloff.',
    adjustments: {
      exposure: 3,
      contrast: 12,
      highlights: -8,
      shadows: 5,
      temperature: 10,
      saturation: 5,
      bloom: 3,
      skinProtection: true,
    },
  },
  cinematic_lut: {
    id: 'cinematic_lut',
    name: 'Cinematic LUT',
    category: 'Cinematic',
    description: 'Clean balanced filmic base grade with open shadows, controlled highlights, and natural skin tones.',
    adjustments: {
      exposure: 0,
      contrast: 10,
      brightness: 0,
      highlights: -12,
      shadows: 8,
      saturation: 4,
      temperature: 3,
      skinProtection: true,
    },
  },
  teal_orange: {
    id: 'teal_orange',
    name: 'Teal & Orange',
    category: 'Cinematic',
    description: 'Blockbuster color separation with teal shadows and warm orange skin tones.',
    adjustments: {
      exposure: 0,
      contrast: 12,
      saturation: 6,
      vibrance: 8,
      temperature: -3,
      tint: -2,
      shadows: -22,
      highlights: 16,
      skinProtection: true,
      tealOrangeSplit: true,
    },
  },
  warm_cinema: {
    id: 'warm_cinema',
    name: 'Warm Cinema',
    category: 'Cinematic',
    description: 'Warm amber cinematic atmosphere with soft highlights, gentle contrast, and natural skin warmth.',
    adjustments: {
      exposure: 3,
      contrast: 7,
      highlights: -10,
      shadows: 3,
      temperature: 8,
      tint: 2,
      saturation: 3,
      skinProtection: true,
      warmHighlightToning: true,
    },
  },
  cold_cinema: {
    id: 'cold_cinema',
    name: 'Cold Cinema',
    category: 'Cinematic',
    description: 'Crisp, dramatic cold grade with blue-cyan shadows, silver highlights, and protected skin tones.',
    adjustments: {
      exposure: 0,
      contrast: 12,
      highlights: -8,
      shadows: -5,
      temperature: -15,
      tint: -3,
      saturation: 2,
      clarity: 8,
      skinProtection: true,
      coolShadowToning: true,
    },
  },
  moody_film: {
    id: 'moody_film',
    name: 'Moody Film',
    category: 'Cinematic',
    description: 'Emotional, atmospheric film grade with rich luma depth, soft highlight rolloff, and protected skin tones.',
    adjustments: {
      exposure: -4,
      contrast: 14,
      highlights: -15,
      shadows: -10,
      saturation: -8,
      fade: 2,
      clarity: 4,
      skinProtection: true,
      moodyGrading: true,
    },
  },
  dream_cinema: {
    id: 'dream_cinema',
    name: 'Dream Cinema',
    category: 'Cinematic',
    description: 'Luxury romantic atmosphere with silky highlight rolloff, open shadows, pastel tones, and controlled bloom.',
    adjustments: {
      contrast: -3,
      highlights: -12,
      shadows: 10,
      saturation: -4,
      temperature: 3,
      bloom: 10,
      clarity: -2,
      skinProtection: true,
      dreamBloom: true,
    },
  },
  vintage_cinema: {
    id: 'vintage_cinema',
    name: 'Vintage Cinema',
    category: 'Cinematic',
    description: 'Authentic Kodak 1970s analog film stock emulation with warm fade and resolution-aware grain.',
    adjustments: {
      contrast: -5,
      saturation: -8,
      shadows: 6,
      temperature: 5,
      grain: 8,
      fade: 5,
      highlights: -6,
      skinProtection: true,
      resolutionGrain: true,
      vintageEmulation: true,
    },
  },
  hdr_film: {
    id: 'hdr_film',
    name: 'HDR Film',
    category: 'Cinematic',
    description: 'Maximum dynamic range with highlight rolloff, shadow recovery, local contrast, and HDR color science.',
    adjustments: {
      highlights: -18,
      shadows: 15,
      clarity: 6,
      contrast: 8,
      saturation: 5,
      skinProtection: true,
      hdrRecovery: true,
    },
  },
  directors_cut: {
    id: 'directors_cut',
    name: "Director's Cut",
    category: 'Cinematic',
    description: 'The ultimate balanced cinematic master grade with filmic contrast, highlight rolloff, subtle warmth, and skin protection.',
    adjustments: {
      contrast: 9,
      highlights: -12,
      shadows: 8,
      saturation: 3,
      temperature: 2,
      clarity: 3,
      bloom: 3,
      skinProtection: true,
      warmHighlightToning: true,
    },
  },
};

/**
 * Resolves a cinematic preset from presetId or name.
 */
export function getCinematicFilterPreset(identifier: string | number): CinematicFilterPreset | undefined {
  const numId = Number(identifier);
  if (!isNaN(numId) && numId >= 1 && numId <= 10) {
    const presetMap: Record<number, string> = {
      1: 'hollywood_gold',
      2: 'cinematic_lut',
      3: 'teal_orange',
      4: 'warm_cinema',
      5: 'cold_cinema',
      6: 'moody_film',
      7: 'dream_cinema',
      8: 'vintage_cinema',
      9: 'hdr_film',
      10: 'directors_cut',
    };
    const key = presetMap[numId];
    if (key && CINEMATIC_FILTER_PRESETS[key]) return CINEMATIC_FILTER_PRESETS[key];
  }

  const rawStr = String(identifier).trim();
  const key = rawStr.toLowerCase().replace(/[^a-z0-9]/g, '_');
  if (CINEMATIC_FILTER_PRESETS[key]) {
    return CINEMATIC_FILTER_PRESETS[key];
  }

  const cleanKey = rawStr.toLowerCase().replace(/['']/g, '').replace(/[^a-z0-9]/g, '_');
  if (CINEMATIC_FILTER_PRESETS[cleanKey]) {
    return CINEMATIC_FILTER_PRESETS[cleanKey];
  }

  const aliasMap: Record<string, string> = {
    'directors_cut': 'directors_cut',
    'director_s_cut': 'directors_cut',
    'directorscut': 'directors_cut',
    'moddy_film': 'moody_film',
    'moody_film': 'moody_film',
    'vinatage_cinema': 'vintage_cinema',
    'vintage_cinema': 'vintage_cinema',
  };
  if (aliasMap[key] && CINEMATIC_FILTER_PRESETS[aliasMap[key]]) {
    return CINEMATIC_FILTER_PRESETS[aliasMap[key]];
  }
  if (aliasMap[cleanKey] && CINEMATIC_FILTER_PRESETS[aliasMap[cleanKey]]) {
    return CINEMATIC_FILTER_PRESETS[aliasMap[cleanKey]];
  }

  return Object.values(CINEMATIC_FILTER_PRESETS).find(
    (p) => p.name.toLowerCase() === rawStr.toLowerCase() ||
           p.id.toLowerCase() === rawStr.toLowerCase() ||
           p.id.toLowerCase() === key ||
           p.id.toLowerCase() === cleanKey
  );
}
