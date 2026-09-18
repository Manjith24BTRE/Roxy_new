// src/components/editor-main-screen/tools/filters/engines/filmSimulation/filmSimulationPresets.ts

export interface FilmSimulationParams {
  colorTemperature?: number;  // -1 (cool) to +1 (warm)
  colorTint?: number;         // -1 (green) to +1 (magenta)
  contrast?: number;          // -1 to +1
  blackLift?: number;         // 0 to 1 (faded shadows / lifted blacks curve)
  highlightRolloff?: number;  // 0 to 1 (soft highlight compression)
  saturation?: number;        // -1 to +1
  fade?: number;              // 0 to 1 (matte film fade)
  filmGrain?: number;         // 0 to 1 (coarse grain intensity)
  fineGrain?: number;         // 0 to 1 (micro grain intensity)
  vignette?: number;          // 0 to 1 (vignette dark corners)
  highlightTint?: [number, number, number]; // RGB tint array for highlights
  shadowTint?: [number, number, number];    // RGB tint array for shadows
  halationGlow?: number;      // 0 to 1 (reddish highlight halation & glow)
  sepiaMix?: number;          // 0 to 1 (monochrome sepia tone shift)
  vhsAberration?: number;     // 0 to 1 (RGB split & scanline artifact feel)
  vhsScanlines?: number;      // 0 to 1 (scanline artifact density)
  sharpness?: number;         // -1 to +1 (softness / sharpening)
  yellowOrangeRichness?: number; // 0 to 1
  greensMuted?: number;       // 0 to 1
  softness?: number;          // 0 to 1
  highlights?: number;        // -1 to +1
  filmFlicker?: number;       // 0 to 1 (subtle luminance fluctuation)
}

export interface FilmSimulationPreset {
  id: number;
  presetKey: string;
  name: string;
  engineKey: 'FilmSimulationEngine';
  category: 'Vintage & Retro';
  description: string;
  params: FilmSimulationParams;
}

export const FILM_SIMULATION_PRESETS: Record<string, FilmSimulationPreset> = {
  film_grain: {
    id: 26,
    presetKey: 'film_grain',
    name: 'FIlm Grain',
    engineKey: 'FilmSimulationEngine',
    category: 'Vintage & Retro',
    description: 'Analog film texture with fine resolution-aware grain, optional slight fade, and no major exposure shift.',
    params: {
      fineGrain: 0.12,
      filmGrain: 0.10,
      fade: 0.03,
      contrast: 0.0,
      saturation: 0.0,
    }
  },
  kodak_gold: {
    id: 27,
    presetKey: 'kodak_gold',
    name: 'Kodak Gold',
    engineKey: 'FilmSimulationEngine',
    category: 'Vintage & Retro',
    description: 'Warm photographic film character with golden color, yellow/orange richness, organic grain, and protected skin tones.',
    params: {
      colorTemperature: 0.07,
      contrast: 0.06,
      saturation: 0.04,
      yellowOrangeRichness: 0.05,
      filmGrain: 0.04,
      fineGrain: 0.04,
      vignette: 0.08,
    }
  },
  fuji_classic: {
    id: 28,
    presetKey: 'fuji_classic',
    name: 'Fuji Classic',
    engineKey: 'FilmSimulationEngine',
    category: 'Vintage & Retro',
    description: 'Soft classic film palette with balanced greens, restrained saturation, subtle warmth, and analog grain.',
    params: {
      contrast: 0.03,
      saturation: -0.02,
      greensMuted: 0.05,
      colorTemperature: 0.02,
      filmGrain: 0.04,
      fineGrain: 0.03,
      vignette: 0.06,
    }
  },
  vhs_classic: {
    id: 29,
    presetKey: 'vhs_classic',
    name: 'VHS Classix',
    engineKey: 'FilmSimulationEngine',
    category: 'Vintage & Retro',
    description: 'Analog videotape character with softness, slight chroma shift, scanline noise effect, and period artifacts.',
    params: {
      saturation: -0.05,
      sharpness: -0.08,
      vhsAberration: 0.25,
      vhsScanlines: 0.20,
      blackLift: 0.10,
      softness: 0.08,
    }
  },
  sepia: {
    id: 30,
    presetKey: 'sepia',
    name: 'Sepia',
    engineKey: 'FilmSimulationEngine',
    category: 'Vintage & Retro',
    description: 'Warm brown monochrome inspired by antique photography with precise sepia tone mapping and grain.',
    params: {
      saturation: -1.0,
      sepiaMix: 1.0,
      contrast: 0.04,
      highlights: -0.05,
      filmGrain: 0.03,
    }
  },
  retro_film: {
    id: 31,
    presetKey: 'retro_film',
    name: 'Retro Film',
    engineKey: 'FilmSimulationEngine',
    category: 'Vintage & Retro',
    description: 'Complete retro package combining matte fade, warmth, fine grain, and subtle softness.',
    params: {
      saturation: -0.08,
      contrast: -0.05,
      blackLift: 0.07,
      colorTemperature: 0.05,
      filmGrain: 0.08,
      softness: 0.02,
      fade: 0.05,
    }
  }
};

/**
 * Resolves a preset from asset ID or asset name or presetKey.
 */
export function getFilmSimulationPreset(identifier: string | number): FilmSimulationPreset | undefined {
  if (typeof identifier === 'number') {
    return Object.values(FILM_SIMULATION_PRESETS).find((p) => p.id === identifier);
  }

  const idNum = Number(identifier);
  if (!isNaN(idNum) && idNum > 0) {
    const foundById = Object.values(FILM_SIMULATION_PRESETS).find((p) => p.id === idNum);
    if (foundById) return foundById;
  }

  const key = identifier.toString().toLowerCase().trim();
  if (FILM_SIMULATION_PRESETS[key]) return FILM_SIMULATION_PRESETS[key];

  const normalizedKey = key.replace(/[^a-z0-9]/g, '_');
  if (FILM_SIMULATION_PRESETS[normalizedKey]) return FILM_SIMULATION_PRESETS[normalizedKey];

  return Object.values(FILM_SIMULATION_PRESETS).find(
    (p) => p.name.toLowerCase() === key || p.presetKey.toLowerCase() === key
  );
}
