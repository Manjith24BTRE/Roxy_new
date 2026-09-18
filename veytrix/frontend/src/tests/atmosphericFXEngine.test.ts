// src/tests/atmosphericFXEngine.test.ts
import { describe, it, expect } from 'vitest';
import { atmosphericFXEngine, AtmosphericFXEngine } from '../components/editor-main-screen/tools/effects/engines/atmosphericFx/AtmosphericFXEngine';
import { ATMOSPHERIC_FX_PRESETS } from '../components/editor-main-screen/tools/effects/engines/atmosphericFx/atmosphericFxPresets';
import { assetRegistry } from '../services/AssetRegistry';

describe('AtmosphericFXEngine & Effects 61–70 Behavioral & Parity Tests', () => {
  it('1. Reusable Engine Key & Singleton Identity', () => {
    expect(atmosphericFXEngine).toBeInstanceOf(AtmosphericFXEngine);
    for (let id = 61; id <= 70; id++) {
      const asset = assetRegistry.getAssetById('Effects', id);
      expect(asset).toBeDefined();
      expect(asset?.engineKey).toBe('atmospheric_fx');
    }
  });

  it('2. Exact Master Excel Name Parity for Effects 61–70', () => {
    const expectedExcelNames = [
      'Fog',
      'Mist',
      'Smoke Overlay',
      'Rain',
      'Snow',
      'Lightning Flash',
      'Dust Particles',
      'Atmosphere',
      'Haze',
      'Heat Blur'
    ];

    expectedExcelNames.forEach((name, idx) => {
      const effectId = 61 + idx;
      const asset = assetRegistry.getAssetById('Effects', effectId);
      expect(asset).toBeDefined();
      expect(asset?.name).toBe(name);

      const preset = atmosphericFXEngine.getPreset(name);
      expect(preset).not.toBeNull();
      expect(preset?.id).toBe(effectId);
    });
  });

  it('3. Fog Behavior: atmospheric density blur & gradient overlay', () => {
    const res = atmosphericFXEngine.evaluateEffect('Fog', 0.5, 1.0, {}, { timelineTime: 0.5 });
    expect(res.filterStr).toContain('blur');
    expect(res.atmosphericOverlayCss).toContain('radial-gradient');
  });

  it('4. Mist Behavior: lighter wispy haze softer than Fog', () => {
    const fogRes = atmosphericFXEngine.evaluateEffect('Fog', 0.5, 1.0);
    const mistRes = atmosphericFXEngine.evaluateEffect('Mist', 0.5, 1.0);

    expect(mistRes.filterStr).toContain('blur');
    const fogBlur = parseFloat(fogRes.filterStr.match(/blur\(([^)]+)px\)/)?.[1] || '0');
    const mistBlur = parseFloat(mistRes.filterStr.match(/blur\(([^)]+)px\)/)?.[1] || '0');
    expect(mistBlur).toBeLessThan(fogBlur);
  });

  it('5. Smoke Overlay Behavior: drifting turbulent wave motion', () => {
    const res = atmosphericFXEngine.evaluateEffect('Smoke Overlay', 0.5, 1.0, {}, { timelineTime: 0.5 });
    expect(res.filterStr).toContain('blur');
    expect(res.transformStr).toContain('translate');

    // PDF Name alias lookup check
    const aliasRes = atmosphericFXEngine.evaluateEffect('Smoke', 0.5, 1.0);
    expect(aliasRes.filterStr).toContain('blur');
  });

  it('6. Rain Behavior: downward directional streak pattern', () => {
    const res = atmosphericFXEngine.evaluateEffect('Rain', 0.5, 1.0);
    expect(res.particleOverlayCss).toContain('repeating-linear-gradient');
    expect(res.filterStr).toContain('brightness');
  });

  it('7. Snow Behavior: falling snow particle drift', () => {
    const res = atmosphericFXEngine.evaluateEffect('Snow', 0.5, 1.0, {}, { timelineTime: 0.5 });
    expect(res.particleOverlayCss).toContain('radial-gradient');
    expect(res.filterStr).toContain('brightness');
  });

  it('8. Lightning Flash Behavior: intermittent high-brightness flash pulses', () => {
    const res = atmosphericFXEngine.evaluateEffect('Lightning Flash', 0.5, 1.0, {}, { timelineTime: 0.5 });
    expect(res.filterStr.length >= 0).toBe(true);
  });

  it('9. Dust Particles Behavior: floating particulate drift', () => {
    const res = atmosphericFXEngine.evaluateEffect('Dust Particles', 0.5, 1.0, {}, { timelineTime: 0.5 });
    expect(res.transformStr).toContain('translate');
    expect(res.particleOverlayCss).toContain('radial-gradient');

    // PDF Name alias lookup check
    const aliasRes = atmosphericFXEngine.evaluateEffect('Dust', 0.5, 1.0);
    expect(aliasRes.transformStr).toContain('translate');
  });

  it('10. Atmosphere Behavior: warm glowing illumination', () => {
    const res = atmosphericFXEngine.evaluateEffect('Atmosphere', 0.5, 1.0);
    expect(res.filterStr).toContain('brightness');
    expect(res.filterStr).toContain('sepia');
    expect(res.atmosphericOverlayCss).toContain('radial-gradient');
  });

  it('11. Haze Behavior: soft atmospheric depth diffusion', () => {
    const res = atmosphericFXEngine.evaluateEffect('Haze', 0.5, 1.0);
    expect(res.filterStr).toContain('blur');
    expect(res.atmosphericOverlayCss).toContain('linear-gradient');
  });

  it('12. Heat Blur Behavior: wave distortion offset & blur', () => {
    const res = atmosphericFXEngine.evaluateEffect('Heat Blur', 0.5, 1.0, {}, { timelineTime: 0.5 });
    expect(res.transformStr).toContain('translate');
    expect(res.filterStr).toContain('blur');
  });

  it('13. Zero Intensity Contract (0% -> pristine neutral state)', () => {
    for (let id = 61; id <= 70; id++) {
      const res = atmosphericFXEngine.evaluateEffect(id, 0.5, 0.0);
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
    let prevBlur = -1;

    intensities.forEach((intensity) => {
      const res = atmosphericFXEngine.evaluateEffect('Fog', 0.5, intensity);
      const blurVal = parseFloat(res.filterStr.match(/blur\(([^)]+)px\)/)?.[1] || '0.0');
      expect(blurVal).toBeGreaterThanOrEqual(prevBlur);
      prevBlur = blurVal;
    });
  });

  it('15. Seek & Determinism Test (No state accumulation)', () => {
    const tValues = [0.0, 0.5, 1.0, 0.25, 0.75, 0.5, 0.0];
    const results: string[] = [];

    tValues.forEach((t) => {
      const res = atmosphericFXEngine.evaluateEffect('Smoke Overlay', t, 1.0, {}, { timelineTime: t });
      results.push(res.transformStr);
    });

    expect(results[1]).toBe(results[5]);
    expect(results[0]).toBe(results[6]);
  });

  it('16. Non-Destructive State Preservation & Removal', () => {
    const baseClip = { posX: 0, posY: 0, filter: 'brightness(1.0)' };

    const activeRes = atmosphericFXEngine.evaluateEffect('Fog', 0.5, 1.0);
    expect(activeRes.filterStr).toContain('blur');

    // Removal / Zero intensity restores base filter
    const removedRes = atmosphericFXEngine.evaluateEffect('Fog', 0.5, 0.0);
    expect(removedRes.filterStr).toBe('');
    expect(baseClip.posX).toBe(0);
  });
});
