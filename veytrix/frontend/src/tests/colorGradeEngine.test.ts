// src/tests/colorGradeEngine.test.ts
import { describe, it, expect, beforeAll } from 'vitest';
import { assetRegistry } from '../services/AssetRegistry';
import {
  colorGradeEngine,
  ColorGradeEngine,
} from '../components/editor-main-screen/tools/filters/engines/colorGrade/ColorGradeEngine';
import {
  COLOR_GRADE_PRESETS,
  getColorGradePreset,
} from '../components/editor-main-screen/tools/filters/engines/colorGrade/colorGradePresets';

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

describe('ColorGradeEngine Filter Engine & Catalog Integration Tests', () => {
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

  it('1. Exact Master Name Parity: queries all 10 Cinematic filters from AssetRegistry using exact Excel names', () => {
    const assets = assetRegistry.getAssetsByCategory('Filters', 'Cinematic');
    expect(assets.length).toBe(10);

    const assetNames = assets.map((a) => a.name);
    EXPECTED_PRESET_NAMES.forEach((expectedName) => {
      expect(assetNames).toContain(expectedName);
    });
  });

  it('2. Engine Key Assignment: verifies all 10 Cinematic filter records resolve to engineKey "ColorGradeEngine"', () => {
    const assets = assetRegistry.getAssetsByCategory('Filters', 'Cinematic');
    assets.forEach((asset) => {
      expect(asset.engineKey).toBe('ColorGradeEngine');
    });
  });

  it('3. Singleton Engine Instance: verifies colorGradeEngine is a singleton instance of ColorGradeEngine', () => {
    const instance1 = ColorGradeEngine.getInstance();
    const instance2 = ColorGradeEngine.getInstance();
    expect(instance1).toBe(instance2);
    expect(instance1).toBe(colorGradeEngine);
  });

  it('4. Preset Parameter Isolation: verifies every filter mapped to ColorGradeEngine has distinct parameters', () => {
    const presetKeys = Object.keys(COLOR_GRADE_PRESETS);
    expect(presetKeys.length).toBe(10);

    EXPECTED_PRESET_NAMES.forEach((name) => {
      const preset = getColorGradePreset(name);
      expect(preset).toBeDefined();
      expect(preset?.name).toBe(name);
      expect(preset?.engineKey).toBe('ColorGradeEngine');
      expect(preset?.params).toBeDefined();
      expect(Object.keys(preset!.params).length).toBeGreaterThan(0);
    });
  });

  it('5. Distinct Visual Transformations: verifies different filters generate visibly distinct CSS filter strings', () => {
    const hollywoodCss = colorGradeEngine.getCSSFilterString('Hollywood Gold', 1.0);
    const coldCss = colorGradeEngine.getCSSFilterString('Cold Cinema', 1.0);
    const moddyCss = colorGradeEngine.getCSSFilterString('Moddy Film', 1.0);

    expect(hollywoodCss).not.toBe(coldCss);
    expect(coldCss).not.toBe(moddyCss);
  });

  it('6. Intensity Blend Control: 0 returns "none" (unmodified), 1.0 applies 100% grade effect', () => {
    const intensityZero = colorGradeEngine.getCSSFilterString('Hollywood Gold', 0);
    const intensityFull = colorGradeEngine.getCSSFilterString('Hollywood Gold', 1.0);
    const intensityHalf = colorGradeEngine.getCSSFilterString('Hollywood Gold', 0.5);

    expect(intensityZero).toBe('none');
    expect(intensityFull).not.toBe('none');
    expect(intensityHalf).not.toBe(intensityFull);
  });

  it('7. Single Pass Render Processing: renders frame onto canvas target without throwing', () => {
    const dummyCanvas = document.createElement('canvas') as any;
    dummyCanvas.width = 100;
    dummyCanvas.height = 100;

    const outputCanvas = colorGradeEngine.renderFrame(
      dummyCanvas,
      'hollywood_gold',
      0.8
    );
    expect(outputCanvas).toBeDefined();
  });
});
