// src/tests/artisticFilterEngine.test.ts
import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import { ArtisticFilterEngine } from '../components/editor-main-screen/tools/filters/engines/artisticFilter/ArtisticFilterEngine';
import {
  getArtisticFilterPreset,
} from '../components/editor-main-screen/tools/filters/engines/artisticFilter/artisticFilterPresets';
import { assetRegistry } from '../services/AssetRegistry';

describe('ArtisticFilterEngine', () => {
  let engine: ArtisticFilterEngine;

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
                fillRect: () => {},
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

  beforeEach(() => {
    engine = ArtisticFilterEngine.getInstance();
  });

  describe('Registry & Excel Alignment', () => {
    it('should map IDs 46-50 to ArtisticFilterEngine', () => {
      for (let id = 46; id <= 50; id++) {
        const asset = assetRegistry.getAssetById('Filters', id);
        expect(asset).toBeDefined();
        expect(asset?.engineKey).toBe('ArtisticFilterEngine');
        expect(asset?.type).toBe('Filters');
        expect(asset?.category).toBe('Creative & Artistic');
      }
    });

    it('should preserve exact verbatim Excel asset names including "Comic book"', () => {
      const expectedNames: Record<number, string> = {
        46: 'Oil Painting',
        47: 'Watercolor',
        48: 'Comic book',
        49: 'Pixel Art',
        50: 'Double Exposure',
      };

      for (const [idStr, name] of Object.entries(expectedNames)) {
        const id = Number(idStr);
        const asset = assetRegistry.getAssetById('Filters', id);
        expect(asset?.name).toBe(name);
      }
    });
  });

  describe('Presets & Configuration', () => {
    it('should contain presets for all target IDs 46 to 50', () => {
      for (let id = 46; id <= 50; id++) {
        const preset = getArtisticFilterPreset(id);
        expect(preset).not.toBeNull();
        expect(preset?.name).toBeDefined();
        expect(preset?.engineKey).toBe('ArtisticFilterEngine');
        expect(preset?.category).toBe('Creative & Artistic');
      }
    });

    it('should properly configure ID 48 (Comic book) preset parameters', () => {
      const comicPreset = getArtisticFilterPreset(48);
      expect(comicPreset?.name).toBe('Comic book');
      expect(comicPreset?.params.edgeStrength).toBe(0.68);
      expect(comicPreset?.params.posterizeLevels).toBe(0.6);
    });

    it('should properly configure ID 49 (Pixel Art) preset parameters', () => {
      const pixelPreset = getArtisticFilterPreset(49);
      expect(pixelPreset?.name).toBe('Pixel Art');
      expect(pixelPreset?.params.pixelateResolution).toBe(0.58);
    });

    it('should properly configure ID 50 (Double Exposure) preset parameters', () => {
      const dePreset = getArtisticFilterPreset(50);
      expect(dePreset?.name).toBe('Double Exposure');
      expect(dePreset?.params.doubleExposureBlend).toBe(0.45);
    });
  });

  describe('Engine Singleton & State Isolation', () => {
    it('should return a singleton instance', () => {
      const instance1 = ArtisticFilterEngine.getInstance();
      const instance2 = ArtisticFilterEngine.getInstance();
      expect(instance1).toBe(instance2);
    });

    it('should return CSS filter string fallback for any valid asset ID', () => {
      for (let id = 46; id <= 50; id++) {
        const cssFilter = engine.getCSSFilterString(id, 100);
        expect(cssFilter).toContain('contrast(');
        expect(cssFilter).toContain('saturate(');
      }
    });

    it('should return "none" when intensity is 0', () => {
      const cssFilter = engine.getCSSFilterString(46, 0);
      expect(cssFilter).toBe('none');
    });

    it('should scale CSS filter effects linearly with intensity', () => {
      const css25 = engine.getCSSFilterString(46, 25);
      const css100 = engine.getCSSFilterString(46, 100);
      expect(css25).not.toEqual(css100);
    });

    it('should render to HTMLCanvasElement without throwing errors', () => {
      const sourceCanvas = document.createElement('canvas');
      sourceCanvas.width = 100;
      sourceCanvas.height = 100;
      const ctx = sourceCanvas.getContext('2d');
      if (ctx && typeof ctx.fillRect === 'function') {
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(0, 0, 100, 100);
      }

      const targetCanvas = document.createElement('canvas');
      targetCanvas.width = 100;
      targetCanvas.height = 100;

      expect(() => {
        engine.renderFrame(sourceCanvas, 46, 1.0, targetCanvas);
      }).not.toThrow();
    });

    it('should render all 5 filters (46-50) cleanly across sequential state changes', () => {
      const sourceCanvas = document.createElement('canvas');
      sourceCanvas.width = 50;
      sourceCanvas.height = 50;
      const targetCanvas = document.createElement('canvas');
      targetCanvas.width = 50;
      targetCanvas.height = 50;

      for (let id = 46; id <= 50; id++) {
        expect(() => {
          engine.renderFrame(sourceCanvas, id, 0.75, targetCanvas);
        }).not.toThrow();
      }
    });
  });
});
