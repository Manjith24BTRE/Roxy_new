// src/services/tests/WarmCinemaPreset.test.ts
import { describe, it, expect } from 'vitest';
import { getCinematicFilterPreset } from '../../components/editor-main-screen/tools/filters/cinematic';
import { filterProcessor } from '../FilterProcessor';
import { filterRenderer } from '../FilterRenderer';

describe('Filter #4 — Warm Cinema (Rebuilt Multi-Stage Pipeline)', () => {
  it('should resolve warm_cinema preset recipe correctly', () => {
    const preset = getCinematicFilterPreset('warm_cinema');
    expect(preset).toBeDefined();
    expect(preset?.id).toBe('warm_cinema');
    expect(preset?.name).toBe('Warm Cinema');
    expect(preset?.adjustments.exposure).toBe(3);
    expect(preset?.adjustments.contrast).toBe(7);
    expect(preset?.adjustments.highlights).toBe(-10);
    expect(preset?.adjustments.shadows).toBe(3);
    expect(preset?.adjustments.temperature).toBe(8);
    expect(preset?.adjustments.tint).toBe(2);
    expect(preset?.adjustments.saturation).toBe(3);
    expect(preset?.adjustments.skinProtection).toBe(true);
    expect(preset?.adjustments.warmHighlightToning).toBe(true);
  });

  it('should process multi-stage parameters linearly at 100% intensity', () => {
    const params = filterProcessor.process('warm_cinema', 1.0);
    expect(params.exposure).toBe(3);
    expect(params.contrast).toBe(7);
    expect(params.highlights).toBe(-10);
    expect(params.shadows).toBe(3);
    expect(params.temperature).toBe(8);
    expect(params.tint).toBe(2);
    expect(params.skinProtectionActive).toBe(true);
    expect(params.warmHighlightToningActive).toBe(true);
    // Saturation is 3 * 0.85 = 2.55 due to skin protection
    expect(params.saturation).toBeCloseTo(2.55);
  });

  it('should scale linearly at 50% strength', () => {
    const params = filterProcessor.process('warm_cinema', 0.5);
    expect(params.exposure).toBe(1.5);
    expect(params.contrast).toBe(3.5);
    expect(params.highlights).toBe(-5);
    expect(params.shadows).toBe(1.5);
    expect(params.temperature).toBe(4);
    expect(params.tint).toBe(1);
  });

  it('should generate immediate visible CSS filter string with warm highlight toning', () => {
    const params = filterProcessor.process('warm_cinema', 1.0);
    const cssFilter = filterProcessor.toCSSFilterString(params);

    expect(cssFilter).not.toBe('none');
    expect(cssFilter).toContain('brightness(1.012)');
    expect(cssFilter).toContain('contrast(1.070)');
    expect(cssFilter).toContain('saturate(1.026)');
    expect(cssFilter).toContain('hue-rotate(2.2deg)');
    expect(cssFilter).toContain('sepia(0.120)');
  });

  it('should generate 1:1 FFmpeg filter graph string for export parity', () => {
    const spec = { filterId: 'warm_cinema', intensity: 1.0, opacity: 100, blendMode: 'normal' };
    const graphStr = filterRenderer.getFFmpegFilterGraphString(spec);
    expect(graphStr).toContain('eq=contrast=1.07:saturation=1.03');
    expect(graphStr).toContain('colorbalance=');
  });
});
