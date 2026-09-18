// src/tests/distortionFXEngine.test.ts

import { describe, it, expect } from 'vitest';
import { distortionFXEngine, DistortionFXEngine } from '../components/editor-main-screen/tools/effects/engines/distortionFx/DistortionFXEngine';
import { DISTORTION_FX_PRESETS } from '../components/editor-main-screen/tools/effects/engines/distortionFx/distortionFxPresets';

describe('DistortionFXEngine & Effects 81–90 Behavioral & Parity Tests', () => {
  it('should instantiate as a singleton instance', () => {
    expect(distortionFXEngine).toBeInstanceOf(DistortionFXEngine);
    expect(DistortionFXEngine.getInstance()).toBe(distortionFXEngine);
  });

  const expectedCatalog = [
    { id: 81, name: 'Fish Eye', type: 'fishEye' },
    { id: 82, name: 'Wide Angle ', type: 'wideAngle' },
    { id: 83, name: 'Barrel Distortion', type: 'barrelDistortion' },
    { id: 84, name: 'Pincushion', type: 'pincushion' },
    { id: 85, name: 'Chromatic Aberration', type: 'chromaticAberration' },
    { id: 86, name: 'Prism', type: 'prism' },
    { id: 87, name: 'Glass Reflection', type: 'glassReflection' },
    { id: 88, name: 'Water Reflection ', type: 'waterReflection' },
    { id: 89, name: 'Ripple ', type: 'ripple' },
    { id: 90, name: 'Swirl', type: 'swirl' }
  ];

  expectedCatalog.forEach((item) => {
    it(`should resolve preset for ID ${item.id} (${item.name.trim()}) with exact Excel identity`, () => {
      const presetById = distortionFXEngine.getPreset(item.id);
      expect(presetById).not.toBeNull();
      expect(presetById?.id).toBe(item.id);
      expect(presetById?.name).toBe(item.name);
      expect(presetById?.type).toBe(item.type);

      const presetByName = distortionFXEngine.getPreset(item.name);
      expect(presetByName).not.toBeNull();
      expect(presetByName?.id).toBe(item.id);
    });
  });

  describe('Individual Effect Rendering & PDF Control Implementations', () => {
    it('81. Fish Eye - should render spherical radial bulge with scale correction', () => {
      const res = distortionFXEngine.evaluateEffect('Fish Eye', 0.5, 1.0);
      expect(res.transformStr).toContain('scale');
      expect(res.distortionOverlayCss).toContain('radial-gradient');
    });

    it('82. Wide Angle  - should render lateral fov expansion scale', () => {
      const res = distortionFXEngine.evaluateEffect('Wide Angle ', 0.5, 1.0);
      expect(res.transformStr).toContain('scale');
      expect(res.filterStr).toContain('contrast');
    });

    it('83. Barrel Distortion - should render convex optical barrel scale distortion', () => {
      const res = distortionFXEngine.evaluateEffect('Barrel Distortion', 0.5, 1.0);
      expect(res.transformStr).toContain('scale');
      expect(res.filterStr).toContain('contrast');
    });

    it('84. Pincushion - should render concave optical pincushion contraction scale', () => {
      const res = distortionFXEngine.evaluateEffect('Pincushion', 0.5, 1.0);
      expect(res.transformStr).toContain('scale');
      expect(res.scaleMultiplier).toBeLessThan(1.0);
    });

    it('85. Chromatic Aberration - should render channel separation drop-shadow offset', () => {
      const res = distortionFXEngine.evaluateEffect('Chromatic Aberration', 0.5, 1.0);
      expect(res.filterStr).toContain('drop-shadow');
      expect(res.chromaticOffsetPx).toBeGreaterThan(0);
    });

    it('86. Prism - should render multi-facet refraction spectrum gradient overlay', () => {
      const res = distortionFXEngine.evaluateEffect('Prism', 0.5, 1.0);
      expect(res.filterStr).toContain('drop-shadow');
      expect(res.distortionOverlayCss).toContain('linear-gradient');
    });

    it('87. Glass Reflection - should render diagonal glass mirror sheen overlay', () => {
      const res = distortionFXEngine.evaluateEffect('Glass Reflection', 0.5, 1.0);
      expect(res.distortionOverlayCss).toContain('linear-gradient');
    });

    it('88. Water Reflection  - should render horizontal water surface reflection gradient', () => {
      const res = distortionFXEngine.evaluateEffect('Water Reflection ', 0.5, 1.0, {}, { timelineTime: 1.0 });
      expect(res.distortionOverlayCss).toContain('linear-gradient');
    });

    it('89. Ripple  - should render animated concentric wave scale ripple', () => {
      const res = distortionFXEngine.evaluateEffect('Ripple ', 0.5, 1.0, {}, { timelineTime: 1.0 });
      expect(res.distortionOverlayCss).toContain('radial-gradient');
    });

    it('90. Swirl - should render rotational vortex rotation offset', () => {
      const res = distortionFXEngine.evaluateEffect('Swirl', 0.5, 1.0);
      expect(res.transformStr).toContain('rotate');
      expect(res.distortionOverlayCss).toContain('radial-gradient');
    });
  });

  describe('Non-Destructive Intensity & Zero Intensity Contract', () => {
    expectedCatalog.forEach(({ id, name }) => {
      it(`should produce exact pristine neutral state at 0% intensity for ID ${id} (${name.trim()})`, () => {
        const res = distortionFXEngine.evaluateEffect(id, 0.5, 0.0);
        expect(res.filterStr).toBe('');
        expect(res.transformStr).toBe('');
        expect(res.opacityMultiplier).toBe(1.0);
        expect(res.scaleMultiplier).toBe(1.0);
        expect(res.distortionOverlayCss).toBe('');
      });
    });

    it('should scale rendering smoothly across 0%, 25%, 50%, 75%, 100% intensity', () => {
      [0.0, 0.25, 0.5, 0.75, 1.0].forEach((intensity) => {
        const res = distortionFXEngine.evaluateEffect('Fish Eye', 0.5, intensity);
        expect(res.opacityMultiplier).toBe(1.0);
        expect(Number.isNaN(res.scaleMultiplier)).toBe(false);
      });
    });
  });

  describe('Control Parameter Verification', () => {
    it('changing parameters should alter rendered output', () => {
      const baseRes = distortionFXEngine.evaluateEffect('Swirl', 0.5, 1.0, { swirlAngle: 180 });
      const customRes = distortionFXEngine.evaluateEffect('Swirl', 0.5, 1.0, { swirlAngle: 360 });
      expect(baseRes.rotationOffset).not.toEqual(customRes.rotationOffset);
    });
  });

  describe('Deterministic Timeline Animation & Seeking', () => {
    it('should produce identical rendering when seeking back to t0 (t0 -> t1 -> t2 -> t0)', () => {
      const resA = distortionFXEngine.evaluateEffect('Ripple ', 0.1, 1.0, {}, { timelineTime: 0.5 });
      const resB = distortionFXEngine.evaluateEffect('Ripple ', 0.5, 1.0, {}, { timelineTime: 2.5 });
      const resA2 = distortionFXEngine.evaluateEffect('Ripple ', 0.1, 1.0, {}, { timelineTime: 0.5 });

      expect(resA).toEqual(resA2);
    });
  });

  describe('Remove & Reset Behavior', () => {
    it('should cleanly remove effect effects when reset to 0% intensity', () => {
      const activeRes = distortionFXEngine.evaluateEffect('Prism', 0.5, 1.0);
      expect(activeRes.filterStr).not.toBe('');

      const removedRes = distortionFXEngine.evaluateEffect('Prism', 0.5, 0.0);
      expect(removedRes.filterStr).toBe('');
      expect(removedRes.distortionOverlayCss).toBe('');
    });
  });
});
