// src/tests/portraitRetouchEngine.test.ts
import { describe, it, expect, beforeAll } from 'vitest';
import { assetRegistry } from '../services/AssetRegistry';
import {
  portraitRetouchEngine,
  PortraitRetouchEngine,
} from '../components/editor-main-screen/tools/filters/engines/portraitRetouch/PortraitRetouchEngine';
import {
  PORTRAIT_RETOUCH_PRESETS,
  getPortraitRetouchPreset,
} from '../components/editor-main-screen/tools/filters/engines/portraitRetouch/portraitRetouchPresets';

const EXPECTED_PORTRAIT_ASSETS = [
  { id: 19, name: 'Natural Skin' },
  { id: 20, name: 'Beauty Soft' },
  { id: 21, name: 'Golden Skin' },
  { id: 22, name: 'Fashion Look' },
  { id: 23, name: 'Glamour Glow' },
  { id: 24, name: 'Clean Portrait' },
  { id: 25, name: 'Beauty Pro' },
];

describe('PortraitRetouchEngine Filter Engine & Catalog Integration Tests', () => {
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

  it('1. Registry Mapping: all 7 Portrait filters resolve to engineKey "PortraitRetouchEngine"', () => {
    const assets = assetRegistry.getAssetsByCategory('Filters', 'Portrait');
    expect(assets.length).toBe(7);

    assets.forEach((asset) => {
      expect(asset.engineKey).toBe('PortraitRetouchEngine');
      expect(asset.type).toBe('Filters');
      expect(asset.category).toBe('Portrait');
    });
  });

  it('2. Name Integrity: verifies UI asset.name matches exact verbatim Excel strings', () => {
    EXPECTED_PORTRAIT_ASSETS.forEach((item) => {
      const asset = assetRegistry.getAssetById('Filters', item.id);
      expect(asset).toBeDefined();
      expect(asset?.name).toBe(item.name);
    });
  });

  it('3. Stable Excel Asset ID: presets associate directly with Excel IDs (19-25)', () => {
    EXPECTED_PORTRAIT_ASSETS.forEach((item) => {
      const preset = getPortraitRetouchPreset(item.id);
      expect(preset).toBeDefined();
      expect(preset?.id).toBe(item.id);
      expect(preset?.name).toBe(item.name);
      expect(preset?.engineKey).toBe('PortraitRetouchEngine');
    });
  });

  it('4. Preset Parameter Isolation: each filter has an independent visual parameter configuration', () => {
    const presetKeys = Object.keys(PORTRAIT_RETOUCH_PRESETS);
    expect(presetKeys.length).toBe(7);

    const naturalSkin = getPortraitRetouchPreset(19);
    const beautySoft = getPortraitRetouchPreset(20);
    const goldenSkin = getPortraitRetouchPreset(21);
    const fashionLook = getPortraitRetouchPreset(22);

    expect(beautySoft?.params.smooth).toBeGreaterThan(naturalSkin?.params.smooth || 0);
    expect(goldenSkin?.params.skinToneWarmth).toBeGreaterThan(fashionLook?.params.skinToneWarmth || 0);
    expect(fashionLook?.params.contrast).toBeGreaterThan(beautySoft?.params.contrast || 0);
  });

  it('5. Singleton Engine Reuse: verifies portraitRetouchEngine is a singleton instance', () => {
    const instance1 = PortraitRetouchEngine.getInstance();
    const instance2 = PortraitRetouchEngine.getInstance();
    expect(instance1).toBe(instance2);
    expect(instance1).toBe(portraitRetouchEngine);
  });

  it('6. Intensity Testing (0%, 25%, 50%, 75%, 100%): intensity 0 returns "none", 1.0 applies 100%', () => {
    const intensity0 = portraitRetouchEngine.getCSSFilterString(19, 0.0);
    const intensity25 = portraitRetouchEngine.getCSSFilterString(19, 0.25);
    const intensity50 = portraitRetouchEngine.getCSSFilterString(19, 0.50);
    const intensity75 = portraitRetouchEngine.getCSSFilterString(19, 0.75);
    const intensity100 = portraitRetouchEngine.getCSSFilterString(19, 1.0);

    expect(intensity0).toBe('none');
    expect(intensity25).not.toBe(intensity0);
    expect(intensity50).not.toBe(intensity25);
    expect(intensity75).not.toBe(intensity50);
    expect(intensity100).not.toBe(intensity75);
  });

  it('7. Filter Switching & Non-Cumulative Processing: switching filters evaluates only target filter', () => {
    const filterA = portraitRetouchEngine.getCSSFilterString('Natural Skin', 1.0);
    const filterB = portraitRetouchEngine.getCSSFilterString('Golden Skin', 1.0);
    const filterC = portraitRetouchEngine.getCSSFilterString('Beauty Soft', 1.0);
    const removed = portraitRetouchEngine.getCSSFilterString('Natural Skin', 0.0);

    expect(filterA).not.toBe(filterB);
    expect(filterB).not.toBe(filterC);
    expect(removed).toBe('none');
  });

  it('8. Single Pass Render Processing: renders frame onto canvas target without throwing', () => {
    const dummyCanvas = document.createElement('canvas') as any;
    dummyCanvas.width = 100;
    dummyCanvas.height = 100;

    const outputCanvas = portraitRetouchEngine.renderFrame(
      dummyCanvas,
      'natural_skin',
      0.8
    );
    expect(outputCanvas).toBeDefined();
  });
});
