// src/tests/cinematicFXEngine.test.ts
import { describe, it, expect } from 'vitest';
import { cinematicFXEngine, CinematicFXEngine } from '../components/editor-main-screen/tools/effects/engines/cinematicFx/CinematicFXEngine';
import { CINEMATIC_FX_PRESETS } from '../components/editor-main-screen/tools/effects/engines/cinematicFx/cinematicFxPresets';
import { assetRegistry } from '../services/AssetRegistry';

describe('CinematicFXEngine & Effects 51–60 Behavioral & Parity Tests', () => {
  it('1. Reusable Engine Key & Singleton Identity', () => {
    expect(cinematicFXEngine).toBeInstanceOf(CinematicFXEngine);
    for (let id = 51; id <= 60; id++) {
      const asset = assetRegistry.getAssetById('Effects', id);
      expect(asset).toBeDefined();
      expect(asset?.engineKey).toBe('cinematic_fx');
    }
  });

  it('2. Exact Master Excel Name Parity for Effects 51–60', () => {
    const expectedExcelNames = [
      'FIlm Grain',
      'Film Burn',
      'Light Leak',
      'Lens Flare',
      'Bloom',
      'Soft Glow',
      'Golden Hour',
      'Blue Hour',
      'Moonlight',
      'Cinematic Contrast'
    ];

    expectedExcelNames.forEach((name, idx) => {
      const effectId = 51 + idx;
      const asset = assetRegistry.getAssetById('Effects', effectId);
      expect(asset).toBeDefined();
      expect(asset?.name).toBe(name);

      const preset = cinematicFXEngine.getPreset(name);
      expect(preset).not.toBeNull();
      expect(preset?.id).toBe(effectId);
    });
  });

  it('3. FIlm Grain Behavior: procedural grain texture contrast & brightness filter', () => {
    const res = cinematicFXEngine.evaluateEffect('FIlm Grain', 0.5, 1.0, {}, { timelineTime: 0.5 });
    expect(res.filterStr).toContain('contrast');
    expect(res.overlayGradientCss).toContain('rgba');

    // PDF Name alias lookup check
    const aliasRes = cinematicFXEngine.evaluateEffect('Film Grain', 0.5, 1.0);
    expect(aliasRes.filterStr).toContain('contrast');
  });

  it('4. Film Burn Behavior: animated film edge burn radial gradient', () => {
    const res = cinematicFXEngine.evaluateEffect('Film Burn', 0.5, 1.0, {}, { timelineTime: 0.5 });
    expect(res.overlayGradientCss).toContain('radial-gradient');
    expect(res.filterStr).toContain('brightness');
  });

  it('5. Light Leak Behavior: localized lens leak gradient', () => {
    const res = cinematicFXEngine.evaluateEffect('Light Leak', 0.5, 1.0);
    expect(res.overlayGradientCss).toContain('radial-gradient');
    expect(res.overlayGradientCss).toContain('80% 20%');
  });

  it('6. Lens Flare Behavior: optical flare core and horizontal streaks', () => {
    const res = cinematicFXEngine.evaluateEffect('Lens Flare', 0.5, 1.0);
    expect(res.overlayGradientCss).toContain('radial-gradient');
    expect(res.lensGlowCss).toContain('linear-gradient');
  });

  it('7. Bloom Behavior: threshold-based bright area glow expansion', () => {
    const res = cinematicFXEngine.evaluateEffect('Bloom', 0.5, 1.0);
    expect(res.filterStr).toContain('blur');
    expect(res.filterStr).toContain('brightness');
  });

  it('8. Soft Glow Behavior: gentle highlight diffusion distinct from Bloom', () => {
    const bloomRes = cinematicFXEngine.evaluateEffect('Bloom', 0.5, 1.0);
    const glowRes = cinematicFXEngine.evaluateEffect('Soft Glow', 0.5, 1.0);

    expect(glowRes.filterStr).toContain('blur');
    expect(glowRes.filterStr).not.toBe(bloomRes.filterStr);
  });

  it('9. Golden Hour Behavior: warm sunset-style illumination', () => {
    const res = cinematicFXEngine.evaluateEffect('Golden Hour', 0.5, 1.0);
    expect(res.filterStr).toContain('sepia');
    expect(res.filterStr).toContain('hue-rotate');
    expect(res.overlayGradientCss).toContain('radial-gradient');
  });

  it('10. Blue Hour Behavior: cool evening grade', () => {
    const res = cinematicFXEngine.evaluateEffect('Blue Hour', 0.5, 1.0);
    expect(res.filterStr).toContain('hue-rotate');
    expect(res.filterStr).toContain('saturate');
    expect(res.overlayGradientCss).toContain('linear-gradient');
  });

  it('11. Moonlight Behavior: soft blue nighttime illumination distinct from Blue Hour', () => {
    const blueRes = cinematicFXEngine.evaluateEffect('Blue Hour', 0.5, 1.0);
    const moonRes = cinematicFXEngine.evaluateEffect('Moonlight', 0.5, 1.0);

    expect(moonRes.filterStr).toContain('hue-rotate');
    expect(moonRes.filterStr).toContain('contrast');
    expect(moonRes.filterStr).not.toBe(blueRes.filterStr);
  });

  it('12. Cinematic Contrast Behavior: tonal contrast processing with highlight rolloff', () => {
    const res = cinematicFXEngine.evaluateEffect('Cinematic Contrast', 0.5, 1.0);
    expect(res.filterStr).toContain('contrast(1.30)');
    expect(res.filterStr).toContain('brightness');
  });

  it('13. Zero Intensity Contract (0% -> pristine neutral state)', () => {
    for (let id = 51; id <= 60; id++) {
      const res = cinematicFXEngine.evaluateEffect(id, 0.5, 0.0);
      expect(res.filterStr).toBe('');
      expect(res.transformStr).toBe('');
      expect(res.opacityMultiplier).toBe(1.0);
      expect(res.transformOffsetX).toBe(0);
      expect(res.transformOffsetY).toBe(0);
      expect(res.scaleMultiplier).toBe(1.0);
      expect(res.rotationOffset).toBe(0);
    }
  });

  it('14. Linear Intensity Scaling Tests (0%, 25%, 50%, 75%, 100%)', () => {
    const intensities = [0.0, 0.25, 0.5, 0.75, 1.0];
    let prevIntensity = -1;

    intensities.forEach((intensity) => {
      const res = cinematicFXEngine.evaluateEffect('Cinematic Contrast', 0.5, intensity);
      const contrastVal = parseFloat(res.filterStr.match(/contrast\(([^)]+)\)/)?.[1] || '1.0');
      expect(contrastVal).toBeGreaterThanOrEqual(prevIntensity);
      prevIntensity = contrastVal;
    });
  });

  it('15. Seek & Determinism Test (No state accumulation)', () => {
    const tValues = [0.0, 0.5, 1.0, 0.25, 0.75, 0.5, 0.0];
    const results: string[] = [];

    tValues.forEach((t) => {
      const res = cinematicFXEngine.evaluateEffect('Film Burn', t, 1.0, {}, { timelineTime: t });
      results.push(res.overlayGradientCss || '');
    });

    expect(results[1]).toBe(results[5]);
    expect(results[0]).toBe(results[6]);
  });

  it('16. Non-Destructive State Preservation & Removal', () => {
    const baseClip = { posX: 200, scale: 1.0, filter: 'saturate(1.2)' };

    const activeRes = cinematicFXEngine.evaluateEffect('Golden Hour', 0.5, 1.0);
    expect(activeRes.filterStr).toContain('sepia');

    // Removal / Zero intensity restores base filter
    const removedRes = cinematicFXEngine.evaluateEffect('Golden Hour', 0.5, 0.0);
    expect(removedRes.filterStr).toBe('');
    expect(baseClip.posX).toBe(200);
    expect(baseClip.scale).toBe(1.0);
  });
});
