// src/services/tests/CinematicLutPreset.test.ts
import { describe, it, expect } from 'vitest';
import { getCinematicFilterPreset } from '../../components/editor-main-screen/tools/filters/cinematic';
import { filterProcessor } from '../FilterProcessor';
import { filterRenderer } from '../FilterRenderer';

describe('Filter #2 — Cinematic LUT', () => {
  it('should resolve cinematic_lut preset recipe correctly', () => {
    const preset = getCinematicFilterPreset('cinematic_lut');
    expect(preset).toBeDefined();
    expect(preset?.id).toBe('cinematic_lut');
    expect(preset?.name).toBe('Cinematic LUT');
    expect(preset?.adjustments.contrast).toBe(10);
    expect(preset?.adjustments.highlights).toBe(-12);
    expect(preset?.adjustments.shadows).toBe(8);
    expect(preset?.adjustments.saturation).toBe(4);
    expect(preset?.adjustments.temperature).toBe(3);
    expect(preset?.adjustments.skinProtection).toBe(true);
  });

  it('should process parameters linearly at 100% intensity', () => {
    const params = filterProcessor.process('cinematic_lut', 1.0);
    expect(params.contrast).toBe(10);
    expect(params.highlights).toBe(-12);
    expect(params.shadows).toBe(8);
    expect(params.temperature).toBe(3);
    expect(params.skinProtectionActive).toBe(true);
    // Saturation is 4 * 0.85 = 3.4 due to skin protection
    expect(params.saturation).toBeCloseTo(3.4);
  });

  it('should scale linearly at 50% strength', () => {
    const params = filterProcessor.process('cinematic_lut', 0.5);
    expect(params.contrast).toBe(5);
    expect(params.highlights).toBe(-6);
    expect(params.shadows).toBe(4);
    expect(params.temperature).toBe(1.5);
  });

  it('should generate immediate visible CSS filter string for live video preview', () => {
    const params = filterProcessor.process('cinematic_lut', 1.0);
    const cssFilter = filterProcessor.toCSSFilterString(params);

    expect(cssFilter).not.toBe('none');
    expect(cssFilter).toContain('contrast(1.100)');
    expect(cssFilter).toContain('saturate(1.034)');
    expect(cssFilter).toContain('sepia(0.045)');
  });

  it('should generate 1:1 FFmpeg filter graph string for export parity', () => {
    const spec = { filterId: 'cinematic_lut', intensity: 1.0, opacity: 100, blendMode: 'normal' };
    const graphStr = filterRenderer.getFFmpegFilterGraphString(spec);
    expect(graphStr).toContain('eq=contrast=1.10:saturation=1.03');
    expect(graphStr).toContain('colorbalance=');
  });
});
