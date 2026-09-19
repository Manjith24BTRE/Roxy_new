// src/services/tests/TealOrangePreset.test.ts
import { describe, it, expect } from 'vitest';
import { getCinematicFilterPreset } from '../../components/editor-main-screen/tools/filters/cinematic';
import { filterProcessor } from '../FilterProcessor';
import { filterRenderer } from '../FilterRenderer';

describe('Filter #3 — Teal & Orange', () => {
  it('should resolve teal_orange preset recipe correctly', () => {
    const preset = getCinematicFilterPreset('teal_orange');
    expect(preset).toBeDefined();
    expect(preset?.id).toBe('teal_orange');
    expect(preset?.name).toBe('Teal & Orange');
    expect(preset?.adjustments.contrast).toBe(12);
    expect(preset?.adjustments.saturation).toBe(6);
    expect(preset?.adjustments.temperature).toBe(-3);
    expect(preset?.adjustments.shadows).toBe(-22);
    expect(preset?.adjustments.highlights).toBe(16);
    expect(preset?.adjustments.skinProtection).toBe(true);
    expect(preset?.adjustments.tealOrangeSplit).toBe(true);
  });

  it('should process parameters linearly at 100% intensity', () => {
    const params = filterProcessor.process('teal_orange', 1.0);
    expect(params.contrast).toBe(12);
    expect(params.temperature).toBe(-3);
    expect(params.shadows).toBe(-22);
    expect(params.highlights).toBe(16);
    expect(params.skinProtectionActive).toBe(true);
    expect(params.tealOrangeSplitActive).toBe(true);
    // Saturation is 6 * 0.85 = 5.1 due to skin protection
    expect(params.saturation).toBeCloseTo(5.1);
  });

  it('should scale split-toning linearly at 50% strength', () => {
    const params = filterProcessor.process('teal_orange', 0.5);
    expect(params.contrast).toBe(6);
    expect(params.temperature).toBe(-1.5);
    expect(params.shadows).toBe(-11);
    expect(params.highlights).toBe(8);
  });

  it('should generate immediate visible CSS filter string for live video preview', () => {
    const params = filterProcessor.process('teal_orange', 1.0);
    const cssFilter = filterProcessor.toCSSFilterString(params);

    expect(cssFilter).not.toBe('none');
    expect(cssFilter).toContain('contrast(1.120)');
    expect(cssFilter).toContain('saturate(1.051)');
    expect(cssFilter).toContain('hue-rotate(-7.8deg)');
  });

  it('should generate 1:1 FFmpeg filter graph string for export parity', () => {
    const spec = { filterId: 'teal_orange', intensity: 1.0, opacity: 100, blendMode: 'normal' };
    const graphStr = filterRenderer.getFFmpegFilterGraphString(spec);
    expect(graphStr).toContain('eq=contrast=1.12:saturation=1.05');
    expect(graphStr).toContain('colorbalance=');
  });
});
