// src/tests/cinematicGradeEngine.test.ts
import { describe, it, expect, beforeAll } from 'vitest';
import { assetRegistry } from '../services/AssetRegistry';
import {
  cinematicGradeEngine,
  CinematicGradeEngine,
} from '../components/editor-main-screen/tools/filters/engines/cinematic/cinematicGradeEngine';
import {
  CINEMATIC_PRESETS,
  getCinematicPreset,
} from '../components/editor-main-screen/tools/filters/engines/cinematic/cinematicGradePresets';

const EXPECTED_PRESET_NAMES = [
  'Hollywood Gold',
  'Cinematic LUT',
  'Teal & Orange',
  'Warm CInema',
  'Cold Cinema',
  'Moddy Film',
  'Dream Cinema',
  'Vinatage Cinema',
  'HDR Film',
  "Director's Cut",
];

describe('Cinematic Grade Reusable Engine & Catalog Tests', () => {
  beforeAll(() => {
    // Provide lightweight canvas mock for Node environment tests
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

  it('1. Exact Master Names Parity: resolves all 10 Cinematic filters from AssetRegistry', () => {
    const assets = assetRegistry.getAssetsByCategory('Filters', 'Cinematic');
    expect(assets.length).toBe(10);

    const assetNames = assets.map((a) => a.name);
    EXPECTED_PRESET_NAMES.forEach((expectedName) => {
      expect(assetNames).toContain(expectedName);
    });
  });

  it('2. Engine Key Resolution: verifies engineKey resolves to "ColorGradeEngine" for all 10 filters', () => {
    const assets = assetRegistry.getAssetsByCategory('Filters', 'Cinematic');
    assets.forEach((asset) => {
      expect(['ColorGradeEngine', 'cinematic_grade']).toContain(asset.engineKey);
    });
  });

  it('3. Singleton Engine Reuse: ensures only one instance of CinematicGradeEngine exists', () => {
    const instance1 = CinematicGradeEngine.getInstance();
    const instance2 = CinematicGradeEngine.getInstance();
    expect(instance1).toBe(instance2);
    expect(instance1).toBe(cinematicGradeEngine);
  });

  it('4. Preset Parameter Isolation: each of the 10 presets defines isolated parameters', () => {
    const presetKeys = Object.keys(CINEMATIC_PRESETS);
    expect(presetKeys.length).toBe(10);

    EXPECTED_PRESET_NAMES.forEach((name) => {
      const preset = getCinematicPreset(name);
      expect(preset).toBeDefined();
      expect(preset?.name).toBe(name);
      expect(preset?.params).toBeDefined();
      expect(Object.keys(preset!.params).length).toBeGreaterThan(0);
    });
  });

  it('5. Visibly Distinct Presets: verifies different presets generate distinct parameters and CSS filters', () => {
    const hollywoodCss = cinematicGradeEngine.getCSSFilterString('Hollywood Gold', 1.0);
    const coldCss = cinematicGradeEngine.getCSSFilterString('Cold Cinema', 1.0);
    const moddyCss = cinematicGradeEngine.getCSSFilterString('Moddy Film', 1.0);

    expect(hollywoodCss).not.toBe(coldCss);
    expect(coldCss).not.toBe(moddyCss);
  });

  it('6. Intensity Control: intensity 0 returns none / no-op, intensity 1 applies 100%', () => {
    const intensityZero = cinematicGradeEngine.getCSSFilterString('Hollywood Gold', 0);
    const intensityFull = cinematicGradeEngine.getCSSFilterString('Hollywood Gold', 1.0);
    const intensityHalf = cinematicGradeEngine.getCSSFilterString('Hollywood Gold', 0.5);

    expect(intensityZero).toBe('none');
    expect(intensityFull).not.toBe('none');
    expect(intensityHalf).not.toBe(intensityFull);
  });

  it('7. Frame Compatible Canvas Fallback: renders canvas frames without throwing', () => {
    const dummyCanvas = document.createElement('canvas') as any;
    dummyCanvas.width = 100;
    dummyCanvas.height = 100;

    const outputCanvas = cinematicGradeEngine.renderFrame(
      dummyCanvas,
      'hollywood_gold',
      0.8
    );
    expect(outputCanvas).toBeDefined();
  });
});
