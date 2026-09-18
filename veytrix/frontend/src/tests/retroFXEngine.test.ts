// src/tests/retroFXEngine.test.ts

import { describe, it, expect } from 'vitest';
import { retroFXEngine, RetroFXEngine } from '../components/editor-main-screen/tools/effects/engines/retroFx/RetroFXEngine';
import { RETRO_FX_PRESETS } from '../components/editor-main-screen/tools/effects/engines/retroFx/retroFxPresets';

describe('RetroFXEngine & Effects 91–100 Behavioral & Parity Tests', () => {
  it('should instantiate as a singleton instance', () => {
    expect(retroFXEngine).toBeInstanceOf(RetroFXEngine);
    expect(RetroFXEngine.getInstance()).toBe(retroFXEngine);
  });

  const expectedCatalog = [
    { id: 91, name: 'Vintage FIlm', type: 'vintageFilm' },
    { id: 92, name: 'Super 8 Film', type: 'super8Film' },
    { id: 93, name: '16mm Film', type: 'film16mm' },
    { id: 94, name: '35mm Film', type: 'film35mm' },
    { id: 95, name: 'Silent Film', type: 'silentFilm' },
    { id: 96, name: 'Sepia FIlm', type: 'sepiaFilm' },
    { id: 97, name: 'Old Photograpgh', type: 'oldPhotograph' },
    { id: 98, name: 'Color Isolation', type: 'colorIsolation' },
    { id: 99, name: 'Double Exposure', type: 'doubleExposure' },
    { id: 100, name: 'Kaleidoscope', type: 'kaleidoscope' }
  ];

  expectedCatalog.forEach((item) => {
    it(`should resolve preset for ID ${item.id} (${item.name}) with exact Excel identity`, () => {
      const presetById = retroFXEngine.getPreset(item.id);
      expect(presetById).not.toBeNull();
      expect(presetById?.id).toBe(item.id);
      expect(presetById?.name).toBe(item.name);
      expect(presetById?.type).toBe(item.type);

      const presetByName = retroFXEngine.getPreset(item.name);
      expect(presetByName).not.toBeNull();
      expect(presetByName?.id).toBe(item.id);
    });
  });

  describe('Individual Effect Rendering & PDF Control Implementations', () => {
    it('91. Vintage FIlm - should render warm aged film grade, lifted blacks & vignette', () => {
      const res = retroFXEngine.evaluateEffect('Vintage FIlm', 0.5, 1.0);
      expect(res.filterStr).toContain('sepia');
      expect(res.retroOverlayCss).toContain('radial-gradient');
    });

    it('92. Super 8 Film - should render coarse 8mm grain, gate flicker & vertical jitter', () => {
      const res = retroFXEngine.evaluateEffect('Super 8 Film', 0.5, 1.0, {}, { timelineTime: 1.0 });
      expect(res.filterStr).toContain('brightness');
      expect(res.dustOverlayCss).toContain('linear-gradient');
    });

    it('93. 16mm Film - should render organic 16mm film stock with halation glow', () => {
      const res = retroFXEngine.evaluateEffect('16mm Film', 0.5, 1.0);
      expect(res.filterStr).toContain('drop-shadow');
      expect(res.retroOverlayCss).toContain('radial-gradient');
    });

    it('94. 35mm Film - should render theatrical film contrast & fine grain response', () => {
      const res = retroFXEngine.evaluateEffect('35mm Film', 0.5, 1.0);
      expect(res.filterStr).toContain('contrast');
      expect(res.retroOverlayCss).toContain('radial-gradient');
    });

    it('95. Silent Film - should render high-contrast 1920s B&W, scratches & shutter flicker', () => {
      const res = retroFXEngine.evaluateEffect('Silent Film', 0.5, 1.0, {}, { timelineTime: 1.0 });
      expect(res.filterStr).toContain('grayscale');
      expect(res.dustOverlayCss).toContain('linear-gradient');
    });

    it('96. Sepia FIlm - should render warm antique brown monochrome tone & fine grain', () => {
      const res = retroFXEngine.evaluateEffect('Sepia FIlm', 0.5, 1.0);
      expect(res.filterStr).toContain('sepia');
    });

    it('97. Old Photograpgh - should render paper degradation, dust specks & faded colors', () => {
      const res = retroFXEngine.evaluateEffect('Old Photograpgh', 0.5, 1.0, {}, { timelineTime: 1.0 });
      expect(res.filterStr).toContain('brightness');
      expect(res.dustOverlayCss).toContain('radial-gradient');
    });

    it('98. Color Isolation - should desaturate background while preserving color focus', () => {
      const res = retroFXEngine.evaluateEffect('Color Isolation', 0.5, 1.0);
      expect(res.filterStr).toContain('saturate');
    });

    it('99. Double Exposure - should render dual-layer artistic gradient blend overlay', () => {
      const res = retroFXEngine.evaluateEffect('Double Exposure', 0.5, 1.0);
      expect(res.filterStr).toContain('contrast');
      expect(res.retroOverlayCss).toContain('linear-gradient');
    });

    it('100. Kaleidoscope - should render optical mandala mirror scale & rotation', () => {
      const res = retroFXEngine.evaluateEffect('Kaleidoscope', 0.5, 1.0);
      expect(res.transformStr).toContain('scale');
      expect(res.transformStr).toContain('rotate');
      expect(res.retroOverlayCss).toContain('radial-gradient');
    });
  });

  describe('Non-Destructive Intensity & Zero Intensity Contract', () => {
    expectedCatalog.forEach(({ id, name }) => {
      it(`should produce exact pristine neutral state at 0% intensity for ID ${id} (${name})`, () => {
        const res = retroFXEngine.evaluateEffect(id, 0.5, 0.0);
        expect(res.filterStr).toBe('');
        expect(res.transformStr).toBe('');
        expect(res.opacityMultiplier).toBe(1.0);
        expect(res.scaleMultiplier).toBe(1.0);
        expect(res.retroOverlayCss).toBe('');
        expect(res.dustOverlayCss).toBe('');
      });
    });

    it('should scale rendering smoothly across 0%, 25%, 50%, 75%, 100% intensity', () => {
      [0.0, 0.25, 0.5, 0.75, 1.0].forEach((intensity) => {
        const res = retroFXEngine.evaluateEffect('Vintage FIlm', 0.5, intensity);
        expect(res.opacityMultiplier).toBe(1.0);
        expect(Number.isNaN(res.scaleMultiplier)).toBe(false);
      });
    });
  });

  describe('Control Parameter Verification', () => {
    it('changing parameters should alter rendered output', () => {
      const baseRes = retroFXEngine.evaluateEffect('Super 8 Film', 0.5, 1.0, { grain: 0.2 });
      const customRes = retroFXEngine.evaluateEffect('Super 8 Film', 0.5, 1.0, { grain: 0.9 });
      expect(baseRes.filterStr).not.toEqual(customRes.filterStr);
    });
  });

  describe('Deterministic Timeline Animation & Seeking', () => {
    it('should produce identical rendering when seeking back to t0 (t0 -> t1 -> t2 -> t0)', () => {
      const resA = retroFXEngine.evaluateEffect('Silent Film', 0.1, 1.0, {}, { timelineTime: 0.5 });
      const resB = retroFXEngine.evaluateEffect('Silent Film', 0.5, 1.0, {}, { timelineTime: 2.5 });
      const resA2 = retroFXEngine.evaluateEffect('Silent Film', 0.1, 1.0, {}, { timelineTime: 0.5 });

      expect(resA).toEqual(resA2);
    });
  });

  describe('Remove & Reset Behavior', () => {
    it('should cleanly remove effect effects when reset to 0% intensity', () => {
      const activeRes = retroFXEngine.evaluateEffect('Silent Film', 0.5, 1.0);
      expect(activeRes.filterStr).not.toBe('');

      const removedRes = retroFXEngine.evaluateEffect('Silent Film', 0.5, 0.0);
      expect(removedRes.filterStr).toBe('');
      expect(removedRes.dustOverlayCss).toBe('');
    });
  });
});
