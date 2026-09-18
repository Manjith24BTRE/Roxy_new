// src/tests/all50FiltersValidation.test.ts

import { describe, it, expect } from 'vitest';
import { assetRegistry } from '../services/AssetRegistry';
import {
  colorGradeEngine,
  toneAdjustmentEngine,
  portraitRetouchEngine,
  filmSimulationEngine,
  monochromeEngine,
  landscapeEnhanceEngine,
  neonGradeEngine,
  artisticFilterEngine
} from '../components/editor-main-screen/tools/filters';

describe('All 50 Filters Validation & Visual Differentiation Test Suite', () => {
  const allFilterAssets = assetRegistry.getAssetsByType('Filters');

  it('1. Catalog Totality: verifies exactly 50 Filters are present in AssetRegistry source of truth', () => {
    expect(allFilterAssets.length).toBe(50);
  });

  const expectedFilterCatalog = [
    // 1. CINEMATIC (1-10)
    { id: 1, name: 'Hollywood Gold', engineKey: 'ColorGradeEngine' },
    { id: 2, name: 'Cinematic LUT', engineKey: 'ColorGradeEngine' },
    { id: 3, name: 'Teal & Orange', engineKey: 'ColorGradeEngine' },
    { id: 4, name: 'Warm CInema', engineKey: 'ColorGradeEngine' },
    { id: 5, name: 'Cold Cinema', engineKey: 'ColorGradeEngine' },
    { id: 6, name: 'Moddy Film', engineKey: 'ColorGradeEngine' },
    { id: 7, name: 'Dream Cinema', engineKey: 'ColorGradeEngine' },
    { id: 8, name: 'Vinatage Cinema', engineKey: 'ColorGradeEngine' },
    { id: 9, name: 'HDR Film', engineKey: 'ColorGradeEngine' },
    { id: 10, name: "Director's Cut", engineKey: 'ColorGradeEngine' },

    // 2. LIGHTING & TONE (11-18)
    { id: 11, name: 'Bright Pop', engineKey: 'ToneAdjustmentEngine' },
    { id: 12, name: 'Deep Contrast', engineKey: 'ToneAdjustmentEngine' },
    { id: 13, name: 'Soft Contrast', engineKey: 'ToneAdjustmentEngine' },
    { id: 14, name: 'Matte Finish', engineKey: 'ToneAdjustmentEngine' },
    { id: 15, name: 'Fade Colour', engineKey: 'ToneAdjustmentEngine' },
    { id: 16, name: 'Natural Tone', engineKey: 'ToneAdjustmentEngine' },
    { id: 17, name: 'Dynamic Tone', engineKey: 'ToneAdjustmentEngine' },
    { id: 18, name: 'GoldenGlow', engineKey: 'ToneAdjustmentEngine' },

    // 3. PORTRAIT (19-25)
    { id: 19, name: 'Natural Skin', engineKey: 'PortraitRetouchEngine' },
    { id: 20, name: 'Beauty Soft', engineKey: 'PortraitRetouchEngine' },
    { id: 21, name: 'Golden Skin', engineKey: 'PortraitRetouchEngine' },
    { id: 22, name: 'Fashion Look', engineKey: 'PortraitRetouchEngine' },
    { id: 23, name: 'Glamour Glow', engineKey: 'PortraitRetouchEngine' },
    { id: 24, name: 'Clean Portrait', engineKey: 'PortraitRetouchEngine' },
    { id: 25, name: 'Beauty Pro', engineKey: 'PortraitRetouchEngine' },

    // 4. VINTAGE & RETRO (26-31)
    { id: 26, name: 'FIlm Grain', engineKey: 'FilmSimulationEngine' },
    { id: 27, name: 'Kodak Gold', engineKey: 'FilmSimulationEngine' },
    { id: 28, name: 'Fuji Classic', engineKey: 'FilmSimulationEngine' },
    { id: 29, name: 'VHS Classix', engineKey: 'FilmSimulationEngine' },
    { id: 30, name: 'Sepia', engineKey: 'FilmSimulationEngine' },
    { id: 31, name: 'Retro Film', engineKey: 'FilmSimulationEngine' },

    // 5. BLACK & WHITE (32-36)
    { id: 32, name: 'Pure Mono', engineKey: 'MonochromeEngine' },
    { id: 33, name: 'High Contrast B/W', engineKey: 'MonochromeEngine' },
    { id: 34, name: 'Noir B/W', engineKey: 'MonochromeEngine' },
    { id: 35, name: 'Soft B/W', engineKey: 'MonochromeEngine' },
    { id: 36, name: 'Platinum B/W', engineKey: 'MonochromeEngine' },

    // 6. NATURE & LANDSCAPE (37-41)
    { id: 37, name: 'Forest Green', engineKey: 'LandscapeEnhanceEngine' },
    { id: 38, name: 'Ocean Blue', engineKey: 'LandscapeEnhanceEngine' },
    { id: 39, name: 'Tropical Paradise', engineKey: 'LandscapeEnhanceEngine' },
    { id: 40, name: 'Autumn Leaves', engineKey: 'LandscapeEnhanceEngine' },
    { id: 41, name: 'Nature HDR', engineKey: 'LandscapeEnhanceEngine' },

    // 7. NEON & CYBER (42-45)
    { id: 42, name: 'Neon Blue', engineKey: 'NeonGradeEngine' },
    { id: 43, name: 'Neon Pink', engineKey: 'NeonGradeEngine' },
    { id: 44, name: 'Cyberpunk', engineKey: 'NeonGradeEngine' },
    { id: 45, name: 'Synthwave', engineKey: 'NeonGradeEngine' },

    // 8. CREATIVE & ARTISTIC (46-50)
    { id: 46, name: 'Oil Painting', engineKey: 'ArtisticFilterEngine' },
    { id: 47, name: 'Watercolor', engineKey: 'ArtisticFilterEngine' },
    { id: 48, name: 'Comic book', engineKey: 'ArtisticFilterEngine' },
    { id: 49, name: 'Pixel Art', engineKey: 'ArtisticFilterEngine' },
    { id: 50, name: 'Double Exposure', engineKey: 'ArtisticFilterEngine' }
  ];

  expectedFilterCatalog.forEach((item) => {
    it(`Filter ID ${item.id} (${item.name}): verifies exact Excel name, engine key, and 0%/100% intensity contract`, () => {
      const asset = assetRegistry.getAssetById('Filters', item.id);
      expect(asset).toBeDefined();
      expect(asset?.name).toBe(item.name);
      expect(asset?.engineKey).toBe(item.engineKey);

      let cssZero = 'none';
      let cssFull = '';

      switch (item.engineKey) {
        case 'ColorGradeEngine':
          cssZero = colorGradeEngine.getCSSFilterString(item.id, 0.0);
          cssFull = colorGradeEngine.getCSSFilterString(item.id, 1.0);
          break;
        case 'ToneAdjustmentEngine':
          cssZero = toneAdjustmentEngine.getCSSFilterString(item.id, 0.0);
          cssFull = toneAdjustmentEngine.getCSSFilterString(item.id, 1.0);
          break;
        case 'PortraitRetouchEngine':
          cssZero = portraitRetouchEngine.getCSSFilterString(item.id, 0.0);
          cssFull = portraitRetouchEngine.getCSSFilterString(item.id, 1.0);
          break;
        case 'FilmSimulationEngine':
          cssZero = filmSimulationEngine.getCSSFilterString(item.id, 0.0);
          cssFull = filmSimulationEngine.getCSSFilterString(item.id, 1.0);
          break;
        case 'MonochromeEngine':
          cssZero = monochromeEngine.getCSSFilterString(item.id, 0.0);
          cssFull = monochromeEngine.getCSSFilterString(item.id, 1.0);
          break;
        case 'LandscapeEnhanceEngine':
          cssZero = landscapeEnhanceEngine.getCSSFilterString(item.id, 0.0);
          cssFull = landscapeEnhanceEngine.getCSSFilterString(item.id, 1.0);
          break;
        case 'NeonGradeEngine':
          cssZero = neonGradeEngine.getCSSFilterString(item.id, 0.0);
          cssFull = neonGradeEngine.getCSSFilterString(item.id, 1.0);
          break;
        case 'ArtisticFilterEngine':
          cssZero = artisticFilterEngine.getCSSFilterString(item.id, 0.0);
          cssFull = artisticFilterEngine.getCSSFilterString(item.id, 1.0);
          break;
      }

      expect(cssZero).toBe('none');
      expect(cssFull).not.toBe('none');
      expect(cssFull.length).toBeGreaterThan(0);
    });
  });

  it('Visual Differentiation Test: verifies all 10 Cinematic filters yield distinct CSS filter configurations', () => {
    const outputs = new Set<string>();
    for (let id = 1; id <= 10; id++) {
      const css = colorGradeEngine.getCSSFilterString(id, 1.0);
      outputs.add(css);
    }
    expect(outputs.size).toBe(10);
  });

  it('Visual Differentiation Test: verifies all 8 Lighting & Tone filters yield distinct CSS filter configurations', () => {
    const outputs = new Set<string>();
    for (let id = 11; id <= 18; id++) {
      const css = toneAdjustmentEngine.getCSSFilterString(id, 1.0);
      outputs.add(css);
    }
    expect(outputs.size).toBe(8);
  });

  it('Visual Differentiation Test: verifies all 7 Portrait filters yield distinct CSS filter configurations', () => {
    const outputs = new Set<string>();
    for (let id = 19; id <= 25; id++) {
      const css = portraitRetouchEngine.getCSSFilterString(id, 1.0);
      outputs.add(css);
    }
    expect(outputs.size).toBe(7);
  });

  it('Visual Differentiation Test: verifies all 6 Vintage & Retro filters yield distinct CSS filter configurations', () => {
    const outputs = new Set<string>();
    for (let id = 26; id <= 31; id++) {
      const css = filmSimulationEngine.getCSSFilterString(id, 1.0);
      outputs.add(css);
    }
    expect(outputs.size).toBe(6);
  });

  it('Visual Differentiation Test: verifies all 5 Black & White filters yield distinct CSS filter configurations', () => {
    const outputs = new Set<string>();
    for (let id = 32; id <= 36; id++) {
      const css = monochromeEngine.getCSSFilterString(id, 1.0);
      outputs.add(css);
    }
    expect(outputs.size).toBe(5);
  });

  it('Visual Differentiation Test: verifies all 5 Nature & Landscape filters yield distinct CSS filter configurations', () => {
    const outputs = new Set<string>();
    for (let id = 37; id <= 41; id++) {
      const css = landscapeEnhanceEngine.getCSSFilterString(id, 1.0);
      outputs.add(css);
    }
    expect(outputs.size).toBe(5);
  });

  it('Visual Differentiation Test: verifies all 4 Neon & Cyber filters yield distinct CSS filter configurations', () => {
    const outputs = new Set<string>();
    for (let id = 42; id <= 45; id++) {
      const css = neonGradeEngine.getCSSFilterString(id, 1.0);
      outputs.add(css);
    }
    expect(outputs.size).toBe(4);
  });

  it('Visual Differentiation Test: verifies all 5 Creative & Artistic filters yield distinct CSS filter configurations', () => {
    const outputs = new Set<string>();
    for (let id = 46; id <= 50; id++) {
      const css = artisticFilterEngine.getCSSFilterString(id, 1.0);
      outputs.add(css);
    }
    expect(outputs.size).toBe(5);
  });
});
