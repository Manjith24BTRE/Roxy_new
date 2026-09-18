// src/tests/filmSimulationEngine.test.ts
import { describe, it, expect, beforeAll } from 'vitest';
import { assetRegistry } from '../services/AssetRegistry';
import {
  filmSimulationEngine,
  FilmSimulationEngine,
} from '../components/editor-main-screen/tools/filters/engines/filmSimulation/FilmSimulationEngine';
import {
  FILM_SIMULATION_PRESETS,
  getFilmSimulationPreset,
} from '../components/editor-main-screen/tools/filters/engines/filmSimulation/filmSimulationPresets';

const EXPECTED_FILM_ASSETS = [
  { id: 26, name: 'FIlm Grain' },
  { id: 27, name: 'Kodak Gold' },
  { id: 28, name: 'Fuji Classic' },
  { id: 29, name: 'VHS Classix' },
  { id: 30, name: 'Sepia' },
  { id: 31, name: 'Retro Film' },
];

describe('FilmSimulationEngine Filter Engine & Catalog Integration Tests', () => {
  beforeAll(() => {
    // Provide lightweight canvas mock for Node environment vitest runs
    if (typeof globalThis.document === 'undefined') {
      (globalThis as any).document = {
        createElement: (tag: string) => {
          if (tag === 'canvas') {
            return {
              width: 100,
              height: 100,
              getContext: () => ({
                drawImage: () => {},
                getImageData: () => ({
                  data: new Uint8ClampedArray(40000),
                }),
                putImageData: () => {},
              }),
            };
          }
          return {};
        },
      };
    }
  });

  it('1. Registry Mapping: all 6 Vintage & Retro filters resolve to engineKey "FilmSimulationEngine"', () => {
    const assets = assetRegistry.getAssetsByCategory('Filters', 'Vintage & Retro');
    expect(assets.length).toBe(6);

    assets.forEach((asset) => {
      expect(asset.engineKey).toBe('FilmSimulationEngine');
      expect(asset.type).toBe('Filters');
      expect(asset.category).toBe('Vintage & Retro');
    });
  });

  it('2. Name Integrity: verifies UI asset.name matches exact verbatim Excel strings (e.g. FIlm Grain, VHS Classix)', () => {
    EXPECTED_FILM_ASSETS.forEach((item) => {
      const asset = assetRegistry.getAssetById('Filters', item.id);
      expect(asset).toBeDefined();
      expect(asset?.name).toBe(item.name);
    });
  });

  it('3. Stable Excel Asset ID: presets associate directly with Excel IDs (26-31)', () => {
    EXPECTED_FILM_ASSETS.forEach((item) => {
      const preset = getFilmSimulationPreset(item.id);
      expect(preset).toBeDefined();
      expect(preset?.id).toBe(item.id);
      expect(preset?.name).toBe(item.name);
      expect(preset?.engineKey).toBe('FilmSimulationEngine');
    });
  });

  it('4. Preset Parameter Isolation: each filter has an independent film parameter configuration', () => {
    const presetKeys = Object.keys(FILM_SIMULATION_PRESETS);
    expect(presetKeys.length).toBe(6);

    const filmGrain = getFilmSimulationPreset(26);
    const kodakGold = getFilmSimulationPreset(27);
    const fujiClassic = getFilmSimulationPreset(28);
    const vhsClassix = getFilmSimulationPreset(29);
    const sepia = getFilmSimulationPreset(30);

    expect(filmGrain?.params.filmGrain).toBeGreaterThan(fujiClassic?.params.filmGrain || 0);
    expect(kodakGold?.params.colorTemperature).toBeGreaterThan(fujiClassic?.params.colorTemperature || 0);
    expect(sepia?.params.sepiaMix).toBeGreaterThan(0.8);
    expect(vhsClassix?.params.vhsAberration).toBeGreaterThan(0);
  });

  it('5. Singleton Engine Reuse: verifies filmSimulationEngine is a singleton instance', () => {
    const instance1 = FilmSimulationEngine.getInstance();
    const instance2 = FilmSimulationEngine.getInstance();
    expect(instance1).toBe(instance2);
    expect(instance1).toBe(filmSimulationEngine);
  });

  it('6. Intensity Testing (0%, 25%, 50%, 75%, 100%): intensity 0 returns "none", 1.0 applies 100%', () => {
    const intensity0 = filmSimulationEngine.getCSSFilterString(27, 0.0);
    const intensity25 = filmSimulationEngine.getCSSFilterString(27, 0.25);
    const intensity50 = filmSimulationEngine.getCSSFilterString(27, 0.50);
    const intensity75 = filmSimulationEngine.getCSSFilterString(27, 0.75);
    const intensity100 = filmSimulationEngine.getCSSFilterString(27, 1.0);

    expect(intensity0).toBe('none');
    expect(intensity25).not.toBe(intensity0);
    expect(intensity50).not.toBe(intensity25);
    expect(intensity75).not.toBe(intensity50);
    expect(intensity100).not.toBe(intensity75);
  });

  it('7. Filter Switching & Non-Cumulative Processing: switching filters evaluates only target filter', () => {
    const filterA = filmSimulationEngine.getCSSFilterString('Kodak Gold', 1.0);
    const filterB = filmSimulationEngine.getCSSFilterString('Fuji Classic', 1.0);
    const filterC = filmSimulationEngine.getCSSFilterString('Sepia', 1.0);
    const removed = filmSimulationEngine.getCSSFilterString('Kodak Gold', 0.0);

    expect(filterA).not.toBe(filterB);
    expect(filterB).not.toBe(filterC);
    expect(removed).toBe('none');
  });

  it('8. Single Pass Render Processing: renders frame onto canvas target without throwing', () => {
    const dummyCanvas = document.createElement('canvas') as any;
    dummyCanvas.width = 100;
    dummyCanvas.height = 100;

    const outputCanvas = filmSimulationEngine.renderFrame(
      dummyCanvas,
      'kodak_gold',
      0.8
    );
    expect(outputCanvas).toBeDefined();
  });
});
