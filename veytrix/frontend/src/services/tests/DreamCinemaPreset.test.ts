// src/services/tests/DreamCinemaPreset.test.ts
import { describe, it, expect } from 'vitest';
import { getCinematicFilterPreset } from '../../components/editor-main-screen/tools/filters/cinematic';
import { filterProcessor } from '../FilterProcessor';
import { filterRenderer } from '../FilterRenderer';

describe('Filter #7 — Dream Cinema (Luxury Commercial 10-Pass Pipeline)', () => {
  it('should resolve dream_cinema preset recipe correctly', () => {
    const preset = getCinematicFilterPreset('dream_cinema');
    expect(preset).toBeDefined();
    expect(preset?.id).toBe('dream_cinema');
    expect(preset?.name).toBe('Dream Cinema');
    expect(preset?.adjustments.contrast).toBe(-3);
    expect(preset?.adjustments.highlights).toBe(-12);
    expect(preset?.adjustments.shadows).toBe(10);
    expect(preset?.adjustments.saturation).toBe(-4);
    expect(preset?.adjustments.temperature).toBe(3);
    expect(preset?.adjustments.bloom).toBe(10);
    expect(preset?.adjustments.clarity).toBe(-2);
    expect(preset?.adjustments.skinProtection).toBe(true);
    expect(preset?.adjustments.dreamBloom).toBe(true);
  });

  it('should process multi-stage parameters linearly at 100% intensity', () => {
    const params = filterProcessor.process('dream_cinema', 1.0);
    expect(params.contrast).toBe(-3);
    expect(params.highlights).toBe(-12);
    expect(params.shadows).toBe(10);
    expect(params.saturation).toBe(-4);
    expect(params.temperature).toBe(3);
    expect(params.bloom).toBe(10);
    expect(params.clarity).toBe(-2);
    expect(params.skinProtectionActive).toBe(true);
    expect(params.dreamBloomActive).toBe(true);
  });

  it('should scale linearly at 50% strength', () => {
    const params = filterProcessor.process('dream_cinema', 0.5);
    expect(params.contrast).toBe(-1.5);
    expect(params.highlights).toBe(-6);
    expect(params.shadows).toBe(5);
    expect(params.saturation).toBe(-2);
    expect(params.temperature).toBe(1.5);
    expect(params.bloom).toBe(5);
    expect(params.clarity).toBe(-1);
  });

  it('should generate immediate visible CSS filter string with dream bloom and pastel warmth', () => {
    const params = filterProcessor.process('dream_cinema', 1.0);
    const cssFilter = filterProcessor.toCSSFilterString(params);

    expect(cssFilter).not.toBe('none');
    expect(cssFilter).toContain('contrast(0.966)');
    expect(cssFilter).toContain('saturate(0.960)');
    expect(cssFilter).toContain('hue-rotate(2.0deg)');
    expect(cssFilter).toContain('sepia(0.045)');
  });

  it('should generate 1:1 FFmpeg filter graph string for export parity', () => {
    const spec = { filterId: 'dream_cinema', intensity: 1.0, opacity: 100, blendMode: 'normal' };
    const graphStr = filterRenderer.getFFmpegFilterGraphString(spec);
    expect(graphStr).toContain('eq=contrast=0.97:saturation=0.96');
    expect(graphStr).toContain('colorbalance=');
  });
});
