// src/tests/neonGradeEngine.test.ts
import { describe, it, expect, beforeAll } from 'vitest';
import { assetRegistry } from '../services/AssetRegistry';
import {
  neonGradeEngine,
  NeonGradeEngine,
} from '../components/editor-main-screen/tools/filters/engines/neonGrade/NeonGradeEngine';
import {
  NEON_GRADE_PRESETS,
  getNeonGradePreset,
} from '../components/editor-main-screen/tools/filters/engines/neonGrade/neonGradePresets';

const EXPECTED_NEON_ASSETS = [
  { id: 42, name: 'Neon Blue' },
  { id: 43, name: 'Neon Pink' },
  { id: 44, name: 'Cyberpunk' },
  { id: 45, name: 'Synthwave' },
];

describe('NeonGradeEngine Filter Engine & Catalog Integration Tests', () => {
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

  it('1. Registry Mapping: all 4 Neon & Cyber filters resolve to engineKey "NeonGradeEngine"', () => {
    const assets = assetRegistry.getAssetsByCategory('Filters', 'Neon & Cyber');
    expect(assets.length).toBe(4);

    assets.forEach((asset) => {
      expect(asset.engineKey).toBe('NeonGradeEngine');
      expect(asset.type).toBe('Filters');
      expect(asset.category).toBe('Neon & Cyber');
    });
  });

  it('2. Name Integrity: verifies UI asset.name matches exact verbatim Excel strings (Neon Blue, Neon Pink, Cyberpunk, Synthwave)', () => {
    EXPECTED_NEON_ASSETS.forEach((item) => {
      const asset = assetRegistry.getAssetById('Filters', item.id);
      expect(asset).toBeDefined();
      expect(asset?.name).toBe(item.name);
    });
  });

  it('3. Stable Excel Asset ID: presets associate directly with Excel IDs (42-45)', () => {
    EXPECTED_NEON_ASSETS.forEach((item) => {
      const preset = getNeonGradePreset(item.id);
      expect(preset).toBeDefined();
      expect(preset?.id).toBe(item.id);
      expect(preset?.name).toBe(item.name);
      expect(preset?.engineKey).toBe('NeonGradeEngine');
    });
  });

  it('4. Preset Parameter Isolation: each filter has distinct hue boosts, glow, and chromatic parameters', () => {
    const presetKeys = Object.keys(NEON_GRADE_PRESETS);
    expect(presetKeys.length).toBe(4);

    const neonBlue = getNeonGradePreset(42);
    const neonPink = getNeonGradePreset(43);
    const cyberpunk = getNeonGradePreset(44);
    const synthwave = getNeonGradePreset(45);

    expect(neonBlue?.params.cyanElectricBoost).toBeGreaterThan(0);
    expect(neonPink?.params.magentaPinkBoost).toBeGreaterThan(0);
    expect(cyberpunk?.params.chromaticOffset).toBeGreaterThan(0);
    expect(synthwave?.params.purpleVioletBoost).toBeGreaterThan(0);
  });

  it('5. Singleton Engine Reuse: verifies neonGradeEngine is a singleton instance', () => {
    const instance1 = NeonGradeEngine.getInstance();
    const instance2 = NeonGradeEngine.getInstance();
    expect(instance1).toBe(instance2);
    expect(instance1).toBe(neonGradeEngine);
  });

  it('6. Intensity Testing (0%, 25%, 50%, 75%, 100%): intensity 0 returns "none", 1.0 applies 100%', () => {
    const intensity0 = neonGradeEngine.getCSSFilterString(42, 0.0);
    const intensity25 = neonGradeEngine.getCSSFilterString(42, 0.25);
    const intensity50 = neonGradeEngine.getCSSFilterString(42, 0.50);
    const intensity75 = neonGradeEngine.getCSSFilterString(42, 0.75);
    const intensity100 = neonGradeEngine.getCSSFilterString(42, 1.0);

    expect(intensity0).toBe('none');
    expect(intensity25).not.toBe(intensity0);
    expect(intensity50).not.toBe(intensity25);
    expect(intensity75).not.toBe(intensity50);
    expect(intensity100).not.toBe(intensity75);
  });

  it('7. Filter Switching & Non-Cumulative Processing: switching filters evaluates only target filter', () => {
    const filterA = neonGradeEngine.getCSSFilterString('Neon Blue', 1.0);
    const filterB = neonGradeEngine.getCSSFilterString('Neon Pink', 1.0);
    const filterC = neonGradeEngine.getCSSFilterString('Cyberpunk', 1.0);
    const removed = neonGradeEngine.getCSSFilterString('Neon Blue', 0.0);

    expect(filterA).not.toBe(filterB);
    expect(filterB).not.toBe(filterC);
    expect(removed).toBe('none');
  });

  it('8. Single Pass Render Processing: renders frame onto canvas target without throwing', () => {
    const dummyCanvas = document.createElement('canvas') as any;
    dummyCanvas.width = 100;
    dummyCanvas.height = 100;

    const outputCanvas = neonGradeEngine.renderFrame(
      dummyCanvas,
      'neon_blue',
      0.8
    );
    expect(outputCanvas).toBeDefined();
  });
});
