// src/services/tests/MoodyFilmPreset.test.ts
import { describe, it, expect } from 'vitest';
import { getCinematicFilterPreset } from '../../components/editor-main-screen/tools/filters/cinematic';
import { filterProcessor } from '../FilterProcessor';
import { filterRenderer } from '../FilterRenderer';

describe('Filter #6 — Moody Film (Rebuilt 10-Pass Processing Pipeline)', () => {
  it('should resolve moody_film preset recipe correctly', () => {
    const preset = getCinematicFilterPreset('moody_film');
    expect(preset).toBeDefined();
    expect(preset?.id).toBe('moody_film');
    expect(preset?.name).toBe('Moody Film');
    expect(preset?.adjustments.exposure).toBe(-4);
    expect(preset?.adjustments.contrast).toBe(14);
    expect(preset?.adjustments.highlights).toBe(-15);
    expect(preset?.adjustments.shadows).toBe(-10);
    expect(preset?.adjustments.saturation).toBe(-8);
    expect(preset?.adjustments.fade).toBe(2);
    expect(preset?.adjustments.clarity).toBe(4);
    expect(preset?.adjustments.skinProtection).toBe(true);
    expect(preset?.adjustments.moodyGrading).toBe(true);
  });

  it('should process multi-stage parameters linearly at 100% intensity', () => {
    const params = filterProcessor.process('moody_film', 1.0);
    expect(params.exposure).toBe(-4);
    expect(params.contrast).toBe(14);
    expect(params.highlights).toBe(-15);
    expect(params.shadows).toBe(-10);
    expect(params.saturation).toBe(-8);
    expect(params.fade).toBe(2);
    expect(params.clarity).toBe(4);
    expect(params.skinProtectionActive).toBe(true);
    expect(params.moodyGradingActive).toBe(true);
  });

  it('should scale linearly at 50% strength', () => {
    const params = filterProcessor.process('moody_film', 0.5);
    expect(params.exposure).toBe(-2);
    expect(params.contrast).toBe(7);
    expect(params.highlights).toBe(-7.5);
    expect(params.shadows).toBe(-5);
    expect(params.saturation).toBe(-4);
    expect(params.fade).toBe(1);
    expect(params.clarity).toBe(2);
  });

  it('should generate immediate visible CSS filter string with moody grading and film fade', () => {
    const params = filterProcessor.process('moody_film', 1.0);
    const cssFilter = filterProcessor.toCSSFilterString(params);

    expect(cssFilter).not.toBe('none');
    expect(cssFilter).toContain('brightness(0.984)');
    expect(cssFilter).toContain('contrast(1.148)');
    expect(cssFilter).toContain('saturate(0.920)');
    expect(cssFilter).toContain('hue-rotate(-4.8deg)');
    expect(cssFilter).toContain('sepia(0.006)');
  });

  it('should generate 1:1 FFmpeg filter graph string for export parity', () => {
    const spec = { filterId: 'moody_film', intensity: 1.0, opacity: 100, blendMode: 'normal' };
    const graphStr = filterRenderer.getFFmpegFilterGraphString(spec);
    expect(graphStr).toContain('eq=contrast=1.14:saturation=0.92');
    expect(graphStr).toContain('colorbalance=');
  });
});
