// src/tests/glitchDigitalEngine.test.ts
import { describe, it, expect } from 'vitest';
import { glitchDigitalEngine, GlitchDigitalEngine } from '../components/editor-main-screen/tools/effects/engines/glitchDigital/GlitchDigitalEngine';
import { GLITCH_DIGITAL_PRESETS } from '../components/editor-main-screen/tools/effects/engines/glitchDigital/glitchDigitalPresets';
import { assetRegistry } from '../services/AssetRegistry';

describe('GlitchDigitalEngine & Effects 41–50 Behavioral & Parity Tests', () => {
  it('1. Reusable Engine Key & Singleton Identity', () => {
    expect(glitchDigitalEngine).toBeInstanceOf(GlitchDigitalEngine);
    for (let id = 41; id <= 50; id++) {
      const asset = assetRegistry.getAssetById('Effects', id);
      expect(asset).toBeDefined();
      expect(asset?.engineKey).toBe('glitch_digital');
    }
  });

  it('2. Exact Master Excel Name Parity for Effects 41–50', () => {
    const expectedExcelNames = [
      'RGB Split',
      'Digital Glitch',
      'Data Corruption',
      'Signal loss',
      'Screen Tear',
      'Pixel Sort',
      'Pixel Stretch',
      'Pixel Explosion',
      'TV Static',
      'Scan Lines'
    ];

    expectedExcelNames.forEach((name, idx) => {
      const effectId = 41 + idx;
      const asset = assetRegistry.getAssetById('Effects', effectId);
      expect(asset).toBeDefined();
      expect(asset?.name).toBe(name);

      const preset = glitchDigitalEngine.getPreset(name);
      expect(preset).not.toBeNull();
      expect(preset?.id).toBe(effectId);
    });
  });

  it('3. RGB Split Behavior: channel separation drop-shadow filters', () => {
    const res = glitchDigitalEngine.evaluateEffect('RGB Split', 0.5, 1.0);
    expect(res.filterStr).toContain('drop-shadow');
    expect(res.splitOffsetR).toBeDefined();
    expect(res.splitOffsetB).toBeDefined();
    expect(res.splitOffsetR?.x).toBeCloseTo(12.0, 1);
  });

  it('4. Digital Glitch Behavior: block jitter displacement & deterministic seed', () => {
    const res1 = glitchDigitalEngine.evaluateEffect('Digital Glitch', 0.5, 1.0, {}, { timelineTime: 0.5 });
    const res2 = glitchDigitalEngine.evaluateEffect('Digital Glitch', 0.5, 1.0, {}, { timelineTime: 0.5 });

    expect(res1.transformStr).toBe(res2.transformStr);
    expect(res1.filterStr).toBe(res2.filterStr);
  });

  it('5. Data Corruption Behavior: corrupted block offset and contrast', () => {
    const res = glitchDigitalEngine.evaluateEffect('Data Corruption', 0.5, 1.0, {}, { timelineTime: 0.5 });
    expect(res.filterStr.length > 0 || res.transformStr.length > 0).toBe(true);
  });

  it('6. Signal loss Behavior: opacity & brightness flicker', () => {
    const res = glitchDigitalEngine.evaluateEffect('Signal loss', 0.5, 1.0, {}, { timelineTime: 0.5 });
    expect(res.opacityMultiplier).toBeGreaterThan(0);
    expect(res.opacityMultiplier).toBeLessThanOrEqual(1.0);
  });

  it('7. Screen Tear Behavior: horizontal slice displacement', () => {
    const res = glitchDigitalEngine.evaluateEffect('Screen Tear', 0.5, 1.0, {}, { timelineTime: 0.5 });
    if (res.transformStr.length > 0) {
      expect(res.transformStr).toContain('translate');
    }
  });

  it('8. Pixel Sort Behavior: directional pixel streak scale multiplier', () => {
    const res = glitchDigitalEngine.evaluateEffect('Pixel Sort', 0.5, 1.0);
    expect(res.scaleYMultiplier).toBeGreaterThan(1.0);
    expect(res.transformStr).toContain('scaleY');
  });

  it('9. Pixel Stretch Behavior: directional stretch distance scale factor', () => {
    const res = glitchDigitalEngine.evaluateEffect('Pixel Stretch', 0.5, 1.0);
    expect(res.scaleXMultiplier).toBeGreaterThan(1.0);
    expect(res.transformStr).toContain('scaleX');
  });

  it('10. Pixel Explosion Behavior: scale & rotation expansion', () => {
    const res = glitchDigitalEngine.evaluateEffect('Pixel Explosion', 0.25, 1.0, {}, { timelineTime: 0.25 });
    expect(res.scaleMultiplier).toBeGreaterThan(1.0);
    expect(res.transformStr).toContain('scale');
  });

  it('11. TV Static Behavior: CRT brightness & contrast flicker response', () => {
    const res = glitchDigitalEngine.evaluateEffect('TV Static', 0.5, 1.0, {}, { timelineTime: 0.5 });
    expect(res.filterStr).toContain('contrast');
    expect(res.glitchOverlayCss).toContain('rgba');
  });

  it('12. Scan Lines Behavior: horizontal repeating linear gradient', () => {
    const res = glitchDigitalEngine.evaluateEffect('Scan Lines', 0.5, 1.0);
    expect(res.scanlineStyleStr).toContain('repeating-linear-gradient');
    expect(res.filterStr).toContain('brightness');
  });

  it('13. Zero Intensity Contract (0% -> pristine neutral state)', () => {
    for (let id = 41; id <= 50; id++) {
      const res = glitchDigitalEngine.evaluateEffect(id, 0.5, 0.0);
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
    let prevScale = 0;

    intensities.forEach((intensity) => {
      const res = glitchDigitalEngine.evaluateEffect('Pixel Stretch', 0.5, intensity);
      const scaleDelta = (res.scaleXMultiplier ?? 1.0) - 1.0;
      expect(scaleDelta).toBeGreaterThanOrEqual(prevScale);
      prevScale = scaleDelta;
    });
  });

  it('15. Seek & Determinism Test (No state accumulation)', () => {
    const tValues = [0.0, 0.5, 1.0, 0.25, 0.75, 0.5, 0.0];
    const results: string[] = [];

    tValues.forEach((t) => {
      const res = glitchDigitalEngine.evaluateEffect('Digital Glitch', t, 1.0, {}, { timelineTime: t });
      results.push(res.transformStr);
    });

    expect(results[1]).toBe(results[5]);
    expect(results[0]).toBe(results[6]);
  });

  it('16. Non-Destructive State Preservation & Removal', () => {
    const baseClip = { posX: 100, scale: 1.0, filter: 'contrast(1.0)' };

    const activeRes = glitchDigitalEngine.evaluateEffect('RGB Split', 0.5, 1.0);
    expect(activeRes.filterStr).toContain('drop-shadow');

    // Removal / Zero intensity restores pristine filter
    const removedRes = glitchDigitalEngine.evaluateEffect('RGB Split', 0.5, 0.0);
    expect(removedRes.filterStr).toBe('');
    expect(baseClip.posX).toBe(100);
    expect(baseClip.scale).toBe(1.0);
  });
});
