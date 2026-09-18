// src/tests/monochromeEngine.test.ts
import { describe, it, expect, beforeAll } from 'vitest';
import { assetRegistry } from '../services/AssetRegistry';
import {
  monochromeEngine,
  MonochromeEngine,
} from '../components/editor-main-screen/tools/filters/engines/monochrome/MonochromeEngine';
import {
  MONOCHROME_PRESETS,
  getMonochromePreset,
} from '../components/editor-main-screen/tools/filters/engines/monochrome/monochromePresets';

const EXPECTED_MONO_ASSETS = [
  { id: 32, name: 'Pure Mono' },
  { id: 33, name: 'High Contrast B/W' },
  { id: 34, name: 'Noir B/W' },
  { id: 35, name: 'Soft B/W' },
  { id: 36, name: 'Platinum B/W' },
];

describe('MonochromeEngine Filter Engine & Catalog Integration Tests', () => {
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

  it('1. Registry Mapping: all 5 Black & White filters resolve to engineKey "MonochromeEngine"', () => {
    const assets = assetRegistry.getAssetsByCategory('Filters', 'Black & White');
    expect(assets.length).toBe(5);

    assets.forEach((asset) => {
      expect(asset.engineKey).toBe('MonochromeEngine');
      expect(asset.type).toBe('Filters');
      expect(asset.category).toBe('Black & White');
    });
  });

  it('2. Name Integrity: verifies UI asset.name matches exact verbatim Excel strings (Pure Mono, High Contrast B/W, Noir B/W, Soft B/W, Platinum B/W)', () => {
    EXPECTED_MONO_ASSETS.forEach((item) => {
      const asset = assetRegistry.getAssetById('Filters', item.id);
      expect(asset).toBeDefined();
      expect(asset?.name).toBe(item.name);
    });
  });

  it('3. Stable Excel Asset ID: presets associate directly with Excel IDs (32-36)', () => {
    EXPECTED_MONO_ASSETS.forEach((item) => {
      const preset = getMonochromePreset(item.id);
      expect(preset).toBeDefined();
      expect(preset?.id).toBe(item.id);
      expect(preset?.name).toBe(item.name);
      expect(preset?.engineKey).toBe('MonochromeEngine');
    });
  });

  it('4. Preset Parameter Isolation: each filter has distinct channel weights, contrast, and grain', () => {
    const presetKeys = Object.keys(MONOCHROME_PRESETS);
    expect(presetKeys.length).toBe(5);

    const pureMono = getMonochromePreset(32);
    const highContrast = getMonochromePreset(33);
    const noir = getMonochromePreset(34);
    const soft = getMonochromePreset(35);
    const platinum = getMonochromePreset(36);

    expect(highContrast?.params.contrast).toBeGreaterThan(pureMono?.params.contrast || 0);
    expect(highContrast?.params.redChannelWeight).toBeGreaterThan(pureMono?.params.redChannelWeight || 0);
    expect(noir?.params.grain).toBeGreaterThan(0);
    expect(soft?.params.contrast).toBeLessThan(0);
    expect(platinum?.params.warmth).toBeGreaterThan(0);
  });

  it('5. Singleton Engine Reuse: verifies monochromeEngine is a singleton instance', () => {
    const instance1 = MonochromeEngine.getInstance();
    const instance2 = MonochromeEngine.getInstance();
    expect(instance1).toBe(instance2);
    expect(instance1).toBe(monochromeEngine);
  });

  it('6. Intensity Testing (0%, 25%, 50%, 75%, 100%): intensity 0 returns "none", 1.0 applies 100%', () => {
    const intensity0 = monochromeEngine.getCSSFilterString(32, 0.0);
    const intensity25 = monochromeEngine.getCSSFilterString(32, 0.25);
    const intensity50 = monochromeEngine.getCSSFilterString(32, 0.50);
    const intensity75 = monochromeEngine.getCSSFilterString(32, 0.75);
    const intensity100 = monochromeEngine.getCSSFilterString(32, 1.0);

    expect(intensity0).toBe('none');
    expect(intensity25).not.toBe(intensity0);
    expect(intensity50).not.toBe(intensity25);
    expect(intensity75).not.toBe(intensity50);
    expect(intensity100).not.toBe(intensity75);
  });

  it('7. Filter Switching & Non-Cumulative Processing: switching filters evaluates only target filter', () => {
    const filterA = monochromeEngine.getCSSFilterString('Pure Mono', 1.0);
    const filterB = monochromeEngine.getCSSFilterString('High Contrast B/W', 1.0);
    const filterC = monochromeEngine.getCSSFilterString('Noir B/W', 1.0);
    const removed = monochromeEngine.getCSSFilterString('Pure Mono', 0.0);

    expect(filterA).not.toBe(filterB);
    expect(filterB).not.toBe(filterC);
    expect(removed).toBe('none');
  });

  it('8. Single Pass Render Processing: renders frame onto canvas target without throwing', () => {
    const dummyCanvas = document.createElement('canvas') as any;
    dummyCanvas.width = 100;
    dummyCanvas.height = 100;

    const outputCanvas = monochromeEngine.renderFrame(
      dummyCanvas,
      'pure_mono',
      0.8
    );
    expect(outputCanvas).toBeDefined();
  });
});
