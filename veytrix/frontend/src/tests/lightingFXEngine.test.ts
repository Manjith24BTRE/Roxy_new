// src/tests/lightingFXEngine.test.ts

import { describe, it, expect } from 'vitest';
import { lightingFXEngine, LightingFXEngine } from '../components/editor-main-screen/tools/effects/engines/lightingFx/LightingFXEngine';
import { LIGHTING_FX_PRESETS } from '../components/editor-main-screen/tools/effects/engines/lightingFx/lightingFxPresets';

describe('LightingFXEngine & Effects 71–80 Behavioral & Parity Tests', () => {
  it('should instantiate as a singleton instance', () => {
    expect(lightingFXEngine).toBeInstanceOf(LightingFXEngine);
    expect(LightingFXEngine.getInstance()).toBe(lightingFXEngine);
  });

  const expectedCatalog = [
    { id: 71, name: 'Sun GLow', type: 'sunGlow' },
    { id: 72, name: 'Sun Rays', type: 'sunRays' },
    { id: 73, name: 'God Rays', type: 'godRays' },
    { id: 74, name: 'Spotlight', type: 'spotlight' },
    { id: 75, name: 'Studio Light', type: 'studioLight' },
    { id: 76, name: 'Ring Light', type: 'ringLight' },
    { id: 77, name: 'FIll Light', type: 'fillLight' },
    { id: 78, name: 'Rim Light', type: 'rimLight' },
    { id: 79, name: 'Neon Glow', type: 'neonGlow' },
    { id: 80, name: 'Volumetric Light', type: 'volumetricLight' }
  ];

  expectedCatalog.forEach((item) => {
    it(`should resolve preset for ID ${item.id} (${item.name}) with exact Excel identity`, () => {
      const presetById = lightingFXEngine.getPreset(item.id);
      expect(presetById).not.toBeNull();
      expect(presetById?.id).toBe(item.id);
      expect(presetById?.name).toBe(item.name);
      expect(presetById?.type).toBe(item.type);

      const presetByName = lightingFXEngine.getPreset(item.name);
      expect(presetByName).not.toBeNull();
      expect(presetByName?.id).toBe(item.id);
    });
  });

  describe('Individual Effect Rendering & PDF Control Implementations', () => {
    it('71. Sun GLow - should render radial warm bloom & brightness boost', () => {
      const res = lightingFXEngine.evaluateEffect('Sun GLow', 0.5, 1.0);
      expect(res.filterStr).toContain('brightness');
      expect(res.radialGlowCss).toContain('radial-gradient');
    });

    it('72. Sun Rays - should render volumetric rays with deterministic flicker', () => {
      const res1 = lightingFXEngine.evaluateEffect('Sun Rays', 0.5, 1.0, {}, { timelineTime: 1.0 });
      expect(res1.filterStr).toContain('brightness');
      expect(res1.lightingOverlayCss).toContain('linear-gradient');
    });

    it('73. God Rays - should render piercing high-contrast light shafts', () => {
      const res = lightingFXEngine.evaluateEffect('God Rays', 0.5, 1.0);
      expect(res.filterStr).toContain('brightness');
      expect(res.filterStr).toContain('contrast');
      expect(res.lightingOverlayCss).toContain('linear-gradient');
    });

    it('74. Spotlight - should render focused beam with surrounding dimming', () => {
      const res = lightingFXEngine.evaluateEffect('Spotlight', 0.5, 1.0);
      expect(res.radialGlowCss).toContain('radial-gradient');
    });

    it('75. Studio Light - should render key & fill studio illumination gradient', () => {
      const res = lightingFXEngine.evaluateEffect('Studio Light', 0.5, 1.0);
      expect(res.filterStr).toContain('brightness');
      expect(res.lightingOverlayCss).toContain('linear-gradient');
    });

    it('76. Ring Light - should render halo ring light gradient around subject', () => {
      const res = lightingFXEngine.evaluateEffect('Ring Light', 0.5, 1.0);
      expect(res.radialGlowCss).toContain('radial-gradient');
    });

    it('77. FIll Light - should lift shadows and apply ambient warmth', () => {
      const res = lightingFXEngine.evaluateEffect('FIll Light', 0.5, 1.0);
      expect(res.filterStr).toContain('brightness');
      expect(res.filterStr).toContain('contrast');
    });

    it('78. Rim Light - should render high contrast rim edge glow filter', () => {
      const res = lightingFXEngine.evaluateEffect('Rim Light', 0.5, 1.0);
      expect(res.filterStr).toContain('drop-shadow');
    });

    it('79. Neon Glow - should render vibrant neon drop-shadow bloom with brightness boost', () => {
      const res = lightingFXEngine.evaluateEffect('Neon Glow', 0.5, 1.0, {}, { timelineTime: 1.0 });
      expect(res.filterStr).toContain('drop-shadow');
      expect(res.filterStr).toContain('saturate');
    });

    it('80. Volumetric Light - should render 3D atmospheric light scattering overlay', () => {
      const res = lightingFXEngine.evaluateEffect('Volumetric Light', 0.5, 1.0);
      expect(res.filterStr).toContain('brightness');
      expect(res.radialGlowCss).toContain('radial-gradient');
    });
  });

  describe('Non-Destructive Intensity & Zero Intensity Contract', () => {
    expectedCatalog.forEach(({ id, name }) => {
      it(`should produce exact pristine neutral state at 0% intensity for ID ${id} (${name})`, () => {
        const res = lightingFXEngine.evaluateEffect(id, 0.5, 0.0);
        expect(res.filterStr).toBe('');
        expect(res.transformStr).toBe('');
        expect(res.opacityMultiplier).toBe(1.0);
        expect(res.lightingOverlayCss).toBe('');
        expect(res.radialGlowCss).toBe('');
      });
    });

    it('should scale rendering smoothly across 0%, 25%, 50%, 75%, 100% intensity', () => {
      [0.0, 0.25, 0.5, 0.75, 1.0].forEach((intensity) => {
        const res = lightingFXEngine.evaluateEffect('Sun GLow', 0.5, intensity);
        expect(res.opacityMultiplier).toBe(1.0);
        expect(Number.isNaN(res.scaleMultiplier)).toBe(false);
      });
    });
  });

  describe('Deterministic Timeline Animation & Seeking', () => {
    it('should produce identical rendering when seeking back to t0 (t0 -> t1 -> t2 -> t0)', () => {
      const resA = lightingFXEngine.evaluateEffect('Sun Rays', 0.1, 1.0, {}, { timelineTime: 0.5 });
      const resB = lightingFXEngine.evaluateEffect('Sun Rays', 0.5, 1.0, {}, { timelineTime: 2.5 });
      const resC = lightingFXEngine.evaluateEffect('Sun Rays', 0.9, 1.0, {}, { timelineTime: 4.0 });
      const resA2 = lightingFXEngine.evaluateEffect('Sun Rays', 0.1, 1.0, {}, { timelineTime: 0.5 });

      expect(resA).toEqual(resA2);
      expect(resA.filterStr).not.toEqual(resB.filterStr);
    });
  });

  describe('Remove & Reset Behavior', () => {
    it('should cleanly remove effect effects when reset to 0% intensity', () => {
      const activeRes = lightingFXEngine.evaluateEffect('God Rays', 0.5, 1.0);
      expect(activeRes.filterStr).not.toBe('');

      const removedRes = lightingFXEngine.evaluateEffect('God Rays', 0.5, 0.0);
      expect(removedRes.filterStr).toBe('');
      expect(removedRes.lightingOverlayCss).toBe('');
    });
  });
});
