// src/services/tests/ColdCinemaPreset.test.ts
import { describe, it, expect } from 'vitest';
import { getCinematicFilterPreset } from '../../components/editor-main-screen/tools/filters/cinematic';
import { filterProcessor } from '../FilterProcessor';
import { filterRenderer } from '../FilterRenderer';

describe('Filter #5 — Cold Cinema (Completely Rebuilt Distinct Pipeline)', () => {
  it('should resolve cold_cinema preset recipe correctly', () => {
    const preset = getCinematicFilterPreset('cold_cinema');
    expect(preset).toBeDefined();
    expect(preset?.id).toBe('cold_cinema');
    expect(preset?.name).toBe('Cold Cinema');
    expect(preset?.adjustments.exposure).toBe(0);
    expect(preset?.adjustments.contrast).toBe(12);
    expect(preset?.adjustments.highlights).toBe(-8);
    expect(preset?.adjustments.shadows).toBe(-5);
    expect(preset?.adjustments.temperature).toBe(-15);
    expect(preset?.adjustments.tint).toBe(-3);
    expect(preset?.adjustments.saturation).toBe(2);
    expect(preset?.adjustments.clarity).toBe(8);
    expect(preset?.adjustments.skinProtection).toBe(true);
    expect(preset?.adjustments.coolShadowToning).toBe(true);
  });

  it('should process multi-stage parameters linearly at 100% intensity', () => {
    const params = filterProcessor.process('cold_cinema', 1.0);
    expect(params.contrast).toBe(12);
    expect(params.highlights).toBe(-8);
    expect(params.shadows).toBe(-5);
    expect(params.temperature).toBe(-15);
    expect(params.tint).toBe(-3);
    expect(params.clarity).toBe(8);
    expect(params.skinProtectionActive).toBe(true);
    expect(params.coolShadowToningActive).toBe(true);
    // Saturation is 2 * 0.85 = 1.7 due to skin protection
    expect(params.saturation).toBeCloseTo(1.7);
  });

  it('should scale linearly at 50% strength', () => {
    const params = filterProcessor.process('cold_cinema', 0.5);
    expect(params.contrast).toBe(6);
    expect(params.highlights).toBe(-4);
    expect(params.shadows).toBe(-2.5);
    expect(params.temperature).toBe(-7.5);
    expect(params.tint).toBe(-1.5);
    expect(params.clarity).toBe(4);
  });

  it('should generate immediate visible CSS filter string with distinct cool shadow toning and clarity', () => {
    const params = filterProcessor.process('cold_cinema', 1.0);
    const cssFilter = filterProcessor.toCSSFilterString(params);

    expect(cssFilter).not.toBe('none');
    expect(cssFilter).toContain('contrast(1.136)');
    expect(cssFilter).toContain('saturate(1.017)');
    expect(cssFilter).toContain('hue-rotate(-22.5deg)');
  });

  it('should generate 1:1 FFmpeg filter graph string for export parity', () => {
    const spec = { filterId: 'cold_cinema', intensity: 1.0, opacity: 100, blendMode: 'normal' };
    const graphStr = filterRenderer.getFFmpegFilterGraphString(spec);
    expect(graphStr).toContain('eq=contrast=1.12:saturation=1.02');
    expect(graphStr).toContain('colorbalance=');
  });
});
