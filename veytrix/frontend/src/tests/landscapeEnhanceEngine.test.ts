// src/tests/landscapeEnhanceEngine.test.ts
import { describe, it, expect, beforeAll } from 'vitest';
import { assetRegistry } from '../services/AssetRegistry';
import {
  landscapeEnhanceEngine,
  LandscapeEnhanceEngine,
} from '../components/editor-main-screen/tools/filters/engines/landscapeEnhance/LandscapeEnhanceEngine';
import {
  LANDSCAPE_ENHANCE_PRESETS,
  getLandscapeEnhancePreset,
} from '../components/editor-main-screen/tools/filters/engines/landscapeEnhance/landscapeEnhancePresets';

const EXPECTED_LANDSCAPE_ASSETS = [
  { id: 37, name: 'Forest Green' },
  { id: 38, name: 'Ocean Blue' },
  { id: 39, name: 'Tropical Paradise' },
  { id: 40, name: 'Autumn Leaves' },
  { id: 41, name: 'Nature HDR' },
];

describe('LandscapeEnhanceEngine Filter Engine & Catalog Integration Tests', () => {
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

  it('1. Registry Mapping: all 5 Nature & Landscape filters resolve to engineKey "LandscapeEnhanceEngine"', () => {
    const assets = assetRegistry.getAssetsByCategory('Filters', 'Nature & Landscape');
    expect(assets.length).toBe(5);

    assets.forEach((asset) => {
      expect(asset.engineKey).toBe('LandscapeEnhanceEngine');
      expect(asset.type).toBe('Filters');
      expect(asset.category).toBe('Nature & Landscape');
    });
  });

  it('2. Name Integrity: verifies UI asset.name matches exact verbatim Excel strings (Forest Green, Ocean Blue, Tropical Paradise, Autumn Leaves, Nature HDR)', () => {
    EXPECTED_LANDSCAPE_ASSETS.forEach((item) => {
      const asset = assetRegistry.getAssetById('Filters', item.id);
      expect(asset).toBeDefined();
      expect(asset?.name).toBe(item.name);
    });
  });

  it('3. Stable Excel Asset ID: presets associate directly with Excel IDs (37-41)', () => {
    EXPECTED_LANDSCAPE_ASSETS.forEach((item) => {
      const preset = getLandscapeEnhancePreset(item.id);
      expect(preset).toBeDefined();
      expect(preset?.id).toBe(item.id);
      expect(preset?.name).toBe(item.name);
      expect(preset?.engineKey).toBe('LandscapeEnhanceEngine');
    });
  });

  it('4. Preset Parameter Isolation: each filter has distinct color-range boosts, warmth, dehaze, and HDR parameters', () => {
    const presetKeys = Object.keys(LANDSCAPE_ENHANCE_PRESETS);
    expect(presetKeys.length).toBe(5);

    const forestGreen = getLandscapeEnhancePreset(37);
    const oceanBlue = getLandscapeEnhancePreset(38);
    const tropicalParadise = getLandscapeEnhancePreset(39);
    const autumnLeaves = getLandscapeEnhancePreset(40);
    const natureHdr = getLandscapeEnhancePreset(41);

    expect(forestGreen?.params.foliageGreenBoost).toBeGreaterThan(oceanBlue?.params.foliageGreenBoost || 0);
    expect(oceanBlue?.params.skyBlueBoost).toBeGreaterThan(forestGreen?.params.skyBlueBoost || 0);
    expect(tropicalParadise?.params.aquaTropicalShift).toBeGreaterThan(0);
    expect(autumnLeaves?.params.autumnShift).toBeGreaterThan(0);
    expect(natureHdr?.params.hdrToneMap).toBeGreaterThan(forestGreen?.params.hdrToneMap || 0);
  });

  it('5. Singleton Engine Reuse: verifies landscapeEnhanceEngine is a singleton instance', () => {
    const instance1 = LandscapeEnhanceEngine.getInstance();
    const instance2 = LandscapeEnhanceEngine.getInstance();
    expect(instance1).toBe(instance2);
    expect(instance1).toBe(landscapeEnhanceEngine);
  });

  it('6. Intensity Testing (0%, 25%, 50%, 75%, 100%): intensity 0 returns "none", 1.0 applies 100%', () => {
    const intensity0 = landscapeEnhanceEngine.getCSSFilterString(37, 0.0);
    const intensity25 = landscapeEnhanceEngine.getCSSFilterString(37, 0.25);
    const intensity50 = landscapeEnhanceEngine.getCSSFilterString(37, 0.50);
    const intensity75 = landscapeEnhanceEngine.getCSSFilterString(37, 0.75);
    const intensity100 = landscapeEnhanceEngine.getCSSFilterString(37, 1.0);

    expect(intensity0).toBe('none');
    expect(intensity25).not.toBe(intensity0);
    expect(intensity50).not.toBe(intensity25);
    expect(intensity75).not.toBe(intensity50);
    expect(intensity100).not.toBe(intensity75);
  });

  it('7. Filter Switching & Non-Cumulative Processing: switching filters evaluates only target filter', () => {
    const filterA = landscapeEnhanceEngine.getCSSFilterString('Forest Green', 1.0);
    const filterB = landscapeEnhanceEngine.getCSSFilterString('Ocean Blue', 1.0);
    const filterC = landscapeEnhanceEngine.getCSSFilterString('Autumn Leaves', 1.0);
    const removed = landscapeEnhanceEngine.getCSSFilterString('Forest Green', 0.0);

    expect(filterA).not.toBe(filterB);
    expect(filterB).not.toBe(filterC);
    expect(removed).toBe('none');
  });

  it('8. Single Pass Render Processing: renders frame onto canvas target without throwing', () => {
    const dummyCanvas = document.createElement('canvas') as any;
    dummyCanvas.width = 100;
    dummyCanvas.height = 100;

    const outputCanvas = landscapeEnhanceEngine.renderFrame(
      dummyCanvas,
      'forest_green',
      0.8
    );
    expect(outputCanvas).toBeDefined();
  });
});
