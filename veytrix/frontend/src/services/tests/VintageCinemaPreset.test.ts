// src/services/tests/VintageCinemaPreset.test.ts
import { describe, it, expect } from 'vitest';
import { getCinematicFilterPreset } from '../../components/editor-main-screen/tools/filters/cinematic';
import { filterProcessor } from '../FilterProcessor';
import { filterRenderer } from '../FilterRenderer';

describe('Filter #8 — Vintage Cinema (Official Recipe & 14-Pass Pipeline)', () => {
  it('should resolve vintage_cinema preset recipe correctly', () => {
    const preset = getCinematicFilterPreset('vintage_cinema');
    expect(preset).toBeDefined();
    expect(preset?.id).toBe('vintage_cinema');
    expect(preset?.name).toBe('Vintage Cinema');
    expect(preset?.adjustments.contrast).toBe(-5);
    expect(preset?.adjustments.saturation).toBe(-8);
    expect(preset?.adjustments.shadows).toBe(6);
    expect(preset?.adjustments.temperature).toBe(5);
    expect(preset?.adjustments.grain).toBe(8);
    expect(preset?.adjustments.fade).toBe(5);
    expect(preset?.adjustments.highlights).toBe(-6);
    expect(preset?.adjustments.skinProtection).toBe(true);
    expect(preset?.adjustments.resolutionGrain).toBe(true);
    expect(preset?.adjustments.vintageEmulation).toBe(true);
  });

  it('should process multi-stage parameters linearly at 100% intensity', () => {
    const params = filterProcessor.process('vintage_cinema', 1.0);
    expect(params.contrast).toBe(-5);
    expect(params.saturation).toBe(-8);
    expect(params.shadows).toBe(6);
    expect(params.temperature).toBe(5);
    expect(params.grain).toBe(8);
    expect(params.fade).toBe(5);
    expect(params.highlights).toBe(-6);
    expect(params.skinProtectionActive).toBe(true);
    expect(params.resolutionGrainActive).toBe(true);
    expect(params.vintageEmulationActive).toBe(true);
  });

  it('should scale linearly at 50% strength', () => {
    const params = filterProcessor.process('vintage_cinema', 0.5);
    expect(params.contrast).toBe(-2.5);
    expect(params.saturation).toBe(-4);
    expect(params.shadows).toBe(3);
    expect(params.temperature).toBe(2.5);
    expect(params.grain).toBe(4);
    expect(params.fade).toBe(2.5);
    expect(params.highlights).toBe(-3);
  });

  it('should scale grain dynamically for resolution awareness (1080p baseline)', () => {
    const params1080p = filterProcessor.process('vintage_cinema', 1.0, undefined, 1920, 1080);
    expect(params1080p.grain).toBe(8);

    const params4K = filterProcessor.process('vintage_cinema', 1.0, undefined, 3840, 2160);
    expect(params4K.grain).toBe(16); // Scaled for 4K canvas
  });

  it('should generate immediate visible CSS filter string with Kodak warmth and film fade', () => {
    const params = filterProcessor.process('vintage_cinema', 1.0);
    const cssFilter = filterProcessor.toCSSFilterString(params);

    expect(cssFilter).not.toBe('none');
    expect(cssFilter).toContain('contrast(0.950)');
    expect(cssFilter).toContain('saturate(0.920)');
    expect(cssFilter).toContain('hue-rotate(4.5deg)');
    expect(cssFilter).toContain('sepia(0.090)');
  });

  it('should generate 1:1 FFmpeg filter graph string for export parity', () => {
    const spec = { filterId: 'vintage_cinema', intensity: 1.0, opacity: 100, blendMode: 'normal' };
    const graphStr = filterRenderer.getFFmpegFilterGraphString(spec);
    expect(graphStr).toContain('eq=contrast=0.95:saturation=0.92');
    expect(graphStr).toContain('colorbalance=');
  });
});
