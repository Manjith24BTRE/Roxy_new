// src/tests/toneAdjustmentEngine.test.ts
import { describe, it, expect, beforeAll } from 'vitest';
import { assetRegistry } from '../services/AssetRegistry';
import {
  toneAdjustmentEngine,
  ToneAdjustmentEngine,
} from '../components/editor-main-screen/tools/filters/engines/toneAdjustment/ToneAdjustmentEngine';
import {
  TONE_ADJUSTMENT_PRESETS,
  getToneAdjustmentPreset,
} from '../components/editor-main-screen/tools/filters/engines/toneAdjustment/toneAdjustmentPresets';

const EXPECTED_TONE_ASSETS = [
  { id: 11, name: 'Bright Pop' },
  { id: 12, name: 'Deep Contrast' },
  { id: 13, name: 'Soft Contrast' },
  { id: 14, name: 'Matte Finish' },
  { id: 15, name: 'Fade Colour' },
  { id: 16, name: 'Natural Tone' },
  { id: 17, name: 'Dynamic Tone' },
  { id: 18, name: 'GoldenGlow' },
];

describe('ToneAdjustmentEngine Filter Engine & Catalog Integration Tests', () => {
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

  it('1. Registry Mapping: all 8 Lighting & Tone filters resolve to engineKey "ToneAdjustmentEngine"', () => {
    const assets = assetRegistry.getAssetsByCategory('Filters', 'Lighting & Tone');
    expect(assets.length).toBe(8);

    assets.forEach((asset) => {
      expect(asset.engineKey).toBe('ToneAdjustmentEngine');
      expect(asset.type).toBe('Filters');
      expect(asset.category).toBe('Lighting & Tone');
    });
  });

  it('2. Name Integrity: verifies UI asset.name matches exact verbatim Excel strings', () => {
    EXPECTED_TONE_ASSETS.forEach((item) => {
      const asset = assetRegistry.getAssetById('Filters', item.id);
      expect(asset).toBeDefined();
      expect(asset?.name).toBe(item.name);
    });
  });

  it('3. Stable Excel Asset ID: presets associate directly with Excel IDs (11-18)', () => {
    EXPECTED_TONE_ASSETS.forEach((item) => {
      const preset = getToneAdjustmentPreset(item.id);
      expect(preset).toBeDefined();
      expect(preset?.id).toBe(item.id);
      expect(preset?.name).toBe(item.name);
      expect(preset?.engineKey).toBe('ToneAdjustmentEngine');
    });
  });

  it('4. Preset Parameter Isolation: each filter has an independent visual parameter configuration', () => {
    const presetKeys = Object.keys(TONE_ADJUSTMENT_PRESETS);
    expect(presetKeys.length).toBe(8);

    const brightPop = getToneAdjustmentPreset(11);
    const deepContrast = getToneAdjustmentPreset(12);
    const fadeColour = getToneAdjustmentPreset(15);

    expect(brightPop?.params.contrast).not.toEqual(deepContrast?.params.contrast);
    expect(fadeColour?.params.saturation).toBeLessThan(0);
    expect(brightPop?.params.vibrance).toBeGreaterThan(0);
  });

  it('5. Singleton Engine Reuse: verifies toneAdjustmentEngine is a singleton instance', () => {
    const instance1 = ToneAdjustmentEngine.getInstance();
    const instance2 = ToneAdjustmentEngine.getInstance();
    expect(instance1).toBe(instance2);
    expect(instance1).toBe(toneAdjustmentEngine);
  });

  it('6. Intensity Testing (0%, 25%, 50%, 75%, 100%): intensity 0 returns "none", 1.0 applies 100%', () => {
    const intensity0 = toneAdjustmentEngine.getCSSFilterString(11, 0.0);
    const intensity25 = toneAdjustmentEngine.getCSSFilterString(11, 0.25);
    const intensity50 = toneAdjustmentEngine.getCSSFilterString(11, 0.50);
    const intensity75 = toneAdjustmentEngine.getCSSFilterString(11, 0.75);
    const intensity100 = toneAdjustmentEngine.getCSSFilterString(11, 1.0);

    expect(intensity0).toBe('none');
    expect(intensity25).not.toBe(intensity0);
    expect(intensity50).not.toBe(intensity25);
    expect(intensity75).not.toBe(intensity50);
    expect(intensity100).not.toBe(intensity75);
  });

  it('7. Filter Switching & Non-Cumulative Processing: switching filters evaluates only target filter', () => {
    const filterA = toneAdjustmentEngine.getCSSFilterString('Bright Pop', 1.0);
    const filterB = toneAdjustmentEngine.getCSSFilterString('Deep Contrast', 1.0);
    const filterC = toneAdjustmentEngine.getCSSFilterString('Fade Colour', 1.0);
    const removed = toneAdjustmentEngine.getCSSFilterString('Bright Pop', 0.0);

    expect(filterA).not.toBe(filterB);
    expect(filterB).not.toBe(filterC);
    expect(removed).toBe('none');
  });

  it('8. Single Pass Render Processing: renders frame onto canvas target without throwing', () => {
    const dummyCanvas = document.createElement('canvas') as any;
    dummyCanvas.width = 100;
    dummyCanvas.height = 100;

    const outputCanvas = toneAdjustmentEngine.renderFrame(
      dummyCanvas,
      'bright_pop',
      0.8
    );
    expect(outputCanvas).toBeDefined();
  });
});
