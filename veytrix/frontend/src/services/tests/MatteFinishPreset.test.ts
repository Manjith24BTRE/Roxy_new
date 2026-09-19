// src/services/tests/MatteFinishPreset.test.ts
import { describe, it, expect } from 'vitest';
import { getToneAdjustmentPreset } from '../../components/editor-main-screen/tools/filters/engines/toneAdjustment/toneAdjustmentPresets';
import { filterProcessor } from '../FilterProcessor';
import { filterRenderer } from '../FilterRenderer';

describe("Filter #14 — Matte Finish (Official Recipe & 11-Pass Modern Editorial Grade)", () => {
  it('STEP 1: Verify preset definition and official recipe resolution', () => {
    const presetById = getToneAdjustmentPreset('matte_finish');
    const presetByNum = getToneAdjustmentPreset(14);
    const presetByStrNum = getToneAdjustmentPreset('14');
    const presetByName = getToneAdjustmentPreset('Matte Finish');

    expect(presetById).toBeDefined();
    expect(presetByNum).toBeDefined();
    expect(presetByStrNum).toBeDefined();
    expect(presetByName).toBeDefined();

    expect(presetById?.name).toBe('Matte Finish');
    expect(presetById?.params.contrast).toBe(-0.12);
    expect(presetById?.params.blacks).toBe(0.12);
    expect(presetById?.params.highlights).toBe(-0.06);
    expect(presetById?.params.saturation).toBe(-0.04);
  });

  it('STEP 2: Verify parameter processing scaling at 0%, 50%, and 100% strength', () => {
    const at0 = filterProcessor.process('matte_finish', 0.0);
    expect(at0.contrast).toBe(0);
    expect(at0.highlights).toBe(0);
    expect(at0.saturation).toBe(0);

    const at50 = filterProcessor.process('matte_finish', 0.5);
    expect(at50.contrast).toBe(-6);
    expect(at50.highlights).toBe(-3);
    expect(at50.saturation).toBe(-2);

    const at100 = filterProcessor.process('matte_finish', 1.0);
    expect(at100.contrast).toBe(-12);
    expect(at100.highlights).toBe(-6);
    expect(at100.saturation).toBe(-4);
  });

  it('STEP 3: Verify 1:1 FFmpeg export filter graph string parity', () => {
    const spec = { filterId: 'matte_finish', intensity: 1.0, opacity: 100, blendMode: 'normal' };
    const graphStr = filterRenderer.getFFmpegFilterGraphString(spec);

    expect(graphStr).toContain('eq=');
    expect(graphStr).toContain('contrast=0.88');
    expect(graphStr).toContain('saturation=0.96');
  });
});
