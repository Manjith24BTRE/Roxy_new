// src/services/tests/FadeColorsPreset.test.ts
import { describe, it, expect } from 'vitest';
import { getToneAdjustmentPreset } from '../../components/editor-main-screen/tools/filters/engines/toneAdjustment/toneAdjustmentPresets';
import { filterProcessor } from '../FilterProcessor';
import { filterRenderer } from '../FilterRenderer';

describe("Filter #15 — Fade Colors (Official Recipe & 10-Pass Faded Print Grade)", () => {
  it('STEP 1: Verify preset definition and official recipe resolution', () => {
    const presetById = getToneAdjustmentPreset('fade_colors');
    const presetByNum = getToneAdjustmentPreset(15);
    const presetByStrNum = getToneAdjustmentPreset('15');
    const presetByName = getToneAdjustmentPreset('Fade Colour');

    expect(presetById).toBeDefined();
    expect(presetByNum).toBeDefined();
    expect(presetByStrNum).toBeDefined();
    expect(presetByName).toBeDefined();

    expect(presetById?.name).toBe('Fade Colour');
    expect(presetById?.params.contrast).toBe(-0.08);
    expect(presetById?.params.saturation).toBe(-0.12);
    expect(presetById?.params.blacks).toBe(0.09);
    expect(presetById?.params.highlights).toBe(-0.04);
  });

  it('STEP 2: Verify parameter processing scaling at 0%, 50%, and 100% strength', () => {
    const at0 = filterProcessor.process('fade_colors', 0.0);
    expect(at0.contrast).toBe(0);
    expect(at0.highlights).toBe(0);
    expect(at0.saturation).toBe(0);

    const at50 = filterProcessor.process('fade_colors', 0.5);
    expect(at50.contrast).toBe(-4);
    expect(at50.highlights).toBe(-2);
    expect(at50.saturation).toBe(-6);

    const at100 = filterProcessor.process('fade_colors', 1.0);
    expect(at100.contrast).toBe(-8);
    expect(at100.highlights).toBe(-4);
    expect(at100.saturation).toBe(-12);
  });

  it('STEP 3: Verify 1:1 FFmpeg export filter graph string parity', () => {
    const spec = { filterId: 'fade_colors', intensity: 1.0, opacity: 100, blendMode: 'normal' };
    const graphStr = filterRenderer.getFFmpegFilterGraphString(spec);

    expect(graphStr).toContain('eq=');
    expect(graphStr).toContain('contrast=0.92');
    expect(graphStr).toContain('saturation=0.88');
  });
});
