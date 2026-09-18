// src/tests/blurFocusEngine.test.ts
import { describe, it, expect } from 'vitest';
import { blurFocusEngine, BlurFocusEngine } from '../components/editor-main-screen/tools/effects/engines/blurFocus/BlurFocusEngine';
import { BLUR_FOCUS_PRESETS } from '../components/editor-main-screen/tools/effects/engines/blurFocus/blurFocusPresets';
import { assetRegistry } from '../services/AssetRegistry';

describe('BlurFocusEngine & Effects 31–40 Behavioral & Parity Tests', () => {
  it('1. Reusable Engine Key & Singleton Identity', () => {
    expect(blurFocusEngine).toBeInstanceOf(BlurFocusEngine);
    for (let id = 31; id <= 40; id++) {
      const asset = assetRegistry.getAssetById('Effects', id);
      expect(asset).toBeDefined();
      expect(asset?.engineKey).toBe('blur_focus');
    }
  });

  it('2. Exact Master Excel Name Parity for Effects 31–40', () => {
    const expectedExcelNames = [
      'Gaussian Blur',
      'Motion blur',
      'Directional Blur',
      'Radial Blur',
      'Zoom Blur',
      'Lens Blur ',
      'Broken Blur',
      'Tilt Blur',
      'Focus Blur',
      'Background Blur'
    ];

    expectedExcelNames.forEach((name, idx) => {
      const effectId = 31 + idx;
      const asset = assetRegistry.getAssetById('Effects', effectId);
      expect(asset).toBeDefined();
      expect(asset?.name).toBe(name);

      const preset = blurFocusEngine.getPreset(name);
      expect(preset).not.toBeNull();
      expect(preset?.id).toBe(effectId);
    });
  });

  it('3. Gaussian Blur Behavior: blur radius scales linearly with intensity', () => {
    const res50 = blurFocusEngine.evaluateEffect('Gaussian Blur', 0.5, 0.5);
    const res100 = blurFocusEngine.evaluateEffect('Gaussian Blur', 0.5, 1.0);

    expect(res50.blurRadiusPx).toBeCloseTo(7.5, 1);
    expect(res100.blurRadiusPx).toBeCloseTo(15.0, 1);
    expect(res100.filterStr).toContain('blur(15.0px)');
  });

  it('4. Motion Blur Behavior: directional sample translation', () => {
    const res = blurFocusEngine.evaluateEffect('Motion blur', 0.5, 1.0);
    expect(res.blurRadiusPx).toBeGreaterThan(0);
    expect(res.filterStr).toContain('blur');
  });

  it('5. Directional Blur Behavior: directional vector offset', () => {
    const res = blurFocusEngine.evaluateEffect('Directional Blur', 0.5, 1.0);
    expect(res.blurRadiusPx).toBeGreaterThan(0);
    expect(res.transformStr).toContain('translate');
  });

  it('6. Radial Blur Behavior: radius-based radial blur', () => {
    const res = blurFocusEngine.evaluateEffect('Radial Blur', 0.5, 1.0);
    expect(res.blurRadiusPx).toBeCloseTo(20.0, 1);
    expect(res.filterStr).toContain('blur(20.0px)');
  });

  it('7. Zoom Blur Behavior: animated rushing zoom blur driven by timeline time', () => {
    const resT1 = blurFocusEngine.evaluateEffect('Zoom Blur', 0.25, 1.0, {}, { timelineTime: 0.25 });
    const resT2 = blurFocusEngine.evaluateEffect('Zoom Blur', 0.75, 1.0, {}, { timelineTime: 0.75 });

    expect(resT1.blurRadiusPx).toBeGreaterThan(0);
    expect(resT2.blurRadiusPx).toBeGreaterThan(0);
    expect(resT1.transformStr).toContain('scale');
  });

  it('8. Lens Blur Behavior: focus area mask generation', () => {
    const res = blurFocusEngine.evaluateEffect('Lens Blur ', 0.5, 1.0);
    expect(res.blurRadiusPx).toBeCloseTo(20.0, 1);
    expect(res.maskStyleStr).toContain('radial-gradient');
  });

  it('9. Bokeh Blur (Broken Blur) Behavior: brightness scaling', () => {
    const res = blurFocusEngine.evaluateEffect('Broken Blur', 0.5, 1.0);
    expect(res.blurRadiusPx).toBeCloseTo(25.0, 1);
    expect(res.filterStr).toContain('brightness(1.20)');

    // PDF Name alias lookup check
    const aliasRes = blurFocusEngine.evaluateEffect('Bokeh Blur', 0.5, 1.0);
    expect(aliasRes.blurRadiusPx).toBeCloseTo(25.0, 1);
  });

  it('10. Tilt Blur (Tilt Shift) Behavior: linear focus band mask', () => {
    const res = blurFocusEngine.evaluateEffect('Tilt Blur', 0.5, 1.0);
    expect(res.blurRadiusPx).toBeCloseTo(20.0, 1);
    expect(res.maskStyleStr).toContain('linear-gradient');

    // PDF Name alias lookup check
    const aliasRes = blurFocusEngine.evaluateEffect('Tilt Shift', 0.5, 1.0);
    expect(aliasRes.blurRadiusPx).toBeCloseTo(20.0, 1);
  });

  it('11. Focus Blur Behavior: sharp focus point with radial blur mask', () => {
    const res = blurFocusEngine.evaluateEffect('Focus Blur', 0.5, 1.0);
    expect(res.blurRadiusPx).toBeCloseTo(25.0, 1);
    expect(res.maskStyleStr).toContain('radial-gradient');
  });

  it('12. Background Blur Behavior: background softening mask preserving subject', () => {
    const res = blurFocusEngine.evaluateEffect('Background Blur', 0.5, 1.0);
    expect(res.blurRadiusPx).toBeCloseTo(25.0, 1);
    expect(res.maskStyleStr).toContain('radial-gradient');
  });

  it('13. Zero Intensity Contract (0% -> pristine neutral state)', () => {
    for (let id = 31; id <= 40; id++) {
      const res = blurFocusEngine.evaluateEffect(id, 0.5, 0.0);
      expect(res.blurRadiusPx).toBe(0);
      expect(res.filterStr).toBe('');
      expect(res.transformStr).toBe('');
      expect(res.opacityMultiplier).toBe(1.0);
    }
  });

  it('14. Linear Intensity Scaling Tests (0%, 25%, 50%, 75%, 100%)', () => {
    const intensities = [0.0, 0.25, 0.5, 0.75, 1.0];
    let prevRadius = -1;

    intensities.forEach((intensity) => {
      const res = blurFocusEngine.evaluateEffect('Gaussian Blur', 0.5, intensity);
      expect(res.blurRadiusPx).toBeGreaterThanOrEqual(prevRadius);
      prevRadius = res.blurRadiusPx;
    });
  });

  it('15. Seek & Determinism Test (No state accumulation)', () => {
    const tValues = [0.0, 0.5, 1.0, 0.25, 0.75, 0.5, 0.0];
    const results: number[] = [];

    tValues.forEach((t) => {
      const res = blurFocusEngine.evaluateEffect('Zoom Blur', t, 1.0, {}, { timelineTime: t });
      results.push(res.blurRadiusPx);
    });

    expect(results[1]).toBeCloseTo(results[5], 6);
    expect(results[0]).toBeCloseTo(results[6], 6);
  });

  it('16. Non-Destructive State Preservation & Removal', () => {
    const baseState = { filterStr: 'contrast(1.1)', transformStr: 'scale(1.0)' };

    const activeRes = blurFocusEngine.evaluateEffect('Gaussian Blur', 0.5, 1.0);
    const combinedFilter = [baseState.filterStr, activeRes.filterStr].filter(Boolean).join(' ');
    expect(combinedFilter).toBe('contrast(1.1) blur(15.0px)');

    // Removal / Zero intensity restores base filter
    const removedRes = blurFocusEngine.evaluateEffect('Gaussian Blur', 0.5, 0.0);
    const restoredFilter = [baseState.filterStr, removedRes.filterStr].filter(Boolean).join(' ');
    expect(restoredFilter).toBe('contrast(1.1)');
  });
});
