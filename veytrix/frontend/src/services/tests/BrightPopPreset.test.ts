// src/services/tests/BrightPopPreset.test.ts
import { describe, it, expect } from 'vitest';
import { getToneAdjustmentPreset, TONE_ADJUSTMENT_PRESETS } from '../../components/editor-main-screen/tools/filters/engines/toneAdjustment/toneAdjustmentPresets';
import { filterProcessor } from '../FilterProcessor';
import { filterRenderer } from '../FilterRenderer';

describe("Filter #11 — Bright Pop (Official Recipe & 12-Pass Social Content Grade)", () => {
  it('STEP 1: Verify preset definition and official recipe resolution', () => {
    const presetById = getToneAdjustmentPreset('bright_pop');
    const presetByNum = getToneAdjustmentPreset(11);
    const presetByStrNum = getToneAdjustmentPreset('11');
    const presetByName = getToneAdjustmentPreset('Bright Pop');

    expect(presetById).toBeDefined();
    expect(presetByNum).toBeDefined();
    expect(presetByStrNum).toBeDefined();
    expect(presetByName).toBeDefined();

    expect(presetById?.name).toBe('Bright Pop');
    expect(presetById?.params.exposure).toBe(0.08);
    expect(presetById?.params.contrast).toBe(0.06);
    expect(presetById?.params.highlights).toBe(-0.04);
    expect(presetById?.params.saturation).toBe(0.02);
    expect(presetById?.params.vibrance).toBe(0.08);
    expect(presetById?.params.clarity).toBe(0.02);
  });

  it('STEP 2: Verify parameter processing scaling at 0%, 50%, and 100% strength', () => {
    const at0 = filterProcessor.process('bright_pop', 0.0);
    expect(at0.exposure).toBe(0);
    expect(at0.contrast).toBe(0);
    expect(at0.highlights).toBe(0);
    expect(at0.saturation).toBe(0);

    const at50 = filterProcessor.process('bright_pop', 0.5);
    expect(at50.exposure).toBe(4);
    expect(at50.contrast).toBe(3);
    expect(at50.highlights).toBe(-2);
    expect(at50.saturation).toBe(1);

    const at100 = filterProcessor.process('bright_pop', 1.0);
    expect(at100.exposure).toBe(8);
    expect(at100.contrast).toBe(6);
    expect(at100.highlights).toBe(-4);
    expect(at100.saturation).toBe(2);
  });

  it('STEP 3: Verify 1:1 FFmpeg export filter graph string parity', () => {
    const spec = { filterId: 'bright_pop', intensity: 1.0, opacity: 100, blendMode: 'normal' };
    const graphStr = filterRenderer.getFFmpegFilterGraphString(spec);

    expect(graphStr).toContain('eq=');
    expect(graphStr).toContain('contrast=1.06');
    expect(graphStr).toContain('saturation=1.02');
  });
});
