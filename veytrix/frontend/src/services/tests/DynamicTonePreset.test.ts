// src/services/tests/DynamicTonePreset.test.ts
import { describe, it, expect } from 'vitest';
import { getToneAdjustmentPreset } from '../../components/editor-main-screen/tools/filters/engines/toneAdjustment/toneAdjustmentPresets';
import { filterProcessor } from '../FilterProcessor';
import { filterRenderer } from '../FilterRenderer';

describe("Filter #17 — Dynamic Tone (Official Recipe & 11-Pass Auto Enhancement Grade)", () => {
  it('STEP 1: Verify preset definition and official recipe resolution', () => {
    const presetById = getToneAdjustmentPreset('dynamic_tone');
    const presetByNum = getToneAdjustmentPreset(17);
    const presetByStrNum = getToneAdjustmentPreset('17');
    const presetByName = getToneAdjustmentPreset('Dynamic Tone');

    expect(presetById).toBeDefined();
    expect(presetByNum).toBeDefined();
    expect(presetByStrNum).toBeDefined();
    expect(presetByName).toBeDefined();

    expect(presetById?.name).toBe('Dynamic Tone');
    expect(presetById?.params.exposure).toBe(0.03);
    expect(presetById?.params.contrast).toBe(0.08);
    expect(presetById?.params.highlights).toBe(-0.08);
    expect(presetById?.params.shadows).toBe(0.06);
    expect(presetById?.params.saturation).toBe(0.05);
    expect(presetById?.params.vibrance).toBe(0.04);
    expect(presetById?.params.clarity).toBe(0.02);
  });

  it('STEP 2: Verify parameter processing scaling at 0%, 50%, and 100% strength', () => {
    const at0 = filterProcessor.process('dynamic_tone', 0.0);
    expect(at0.exposure).toBe(0);
    expect(at0.contrast).toBe(0);
    expect(at0.highlights).toBe(0);
    expect(at0.shadows).toBe(0);
    expect(at0.saturation).toBe(0);

    const at50 = filterProcessor.process('dynamic_tone', 0.5);
    expect(at50.exposure).toBe(1.5);
    expect(at50.contrast).toBe(4);
    expect(at50.highlights).toBe(-4);
    expect(at50.shadows).toBe(3);
    expect(at50.saturation).toBe(2.5);

    const at100 = filterProcessor.process('dynamic_tone', 1.0);
    expect(at100.exposure).toBe(3);
    expect(at100.contrast).toBe(8);
    expect(at100.highlights).toBe(-8);
    expect(at100.shadows).toBe(6);
    expect(at100.saturation).toBe(5);
  });

  it('STEP 3: Verify 1:1 FFmpeg export filter graph string parity', () => {
    const spec = { filterId: 'dynamic_tone', intensity: 1.0, opacity: 100, blendMode: 'normal' };
    const graphStr = filterRenderer.getFFmpegFilterGraphString(spec);

    expect(graphStr).toContain('eq=');
    expect(graphStr).toContain('contrast=1.08');
    expect(graphStr).toContain('saturation=1.05');
  });
});
