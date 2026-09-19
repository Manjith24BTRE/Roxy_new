// src/services/tests/DeepContrastPreset.test.ts
import { describe, it, expect } from 'vitest';
import { getToneAdjustmentPreset } from '../../components/editor-main-screen/tools/filters/engines/toneAdjustment/toneAdjustmentPresets';
import { filterProcessor } from '../FilterProcessor';
import { filterRenderer } from '../FilterRenderer';

describe("Filter #12 — Deep Contrast (Official Recipe & 10-Pass Commercial Depth Grade)", () => {
  it('STEP 1: Verify preset definition and official recipe resolution', () => {
    const presetById = getToneAdjustmentPreset('deep_contrast');
    const presetByNum = getToneAdjustmentPreset(12);
    const presetByStrNum = getToneAdjustmentPreset('12');
    const presetByName = getToneAdjustmentPreset('Deep Contrast');

    expect(presetById).toBeDefined();
    expect(presetByNum).toBeDefined();
    expect(presetByStrNum).toBeDefined();
    expect(presetByName).toBeDefined();

    expect(presetById?.name).toBe('Deep Contrast');
    expect(presetById?.params.contrast).toBe(0.18);
    expect(presetById?.params.highlights).toBe(-0.06);
    expect(presetById?.params.shadows).toBe(-0.12);
    expect(presetById?.params.clarity).toBe(0.04);
  });

  it('STEP 2: Verify parameter processing scaling at 0%, 50%, and 100% strength', () => {
    const at0 = filterProcessor.process('deep_contrast', 0.0);
    expect(at0.contrast).toBe(0);
    expect(at0.highlights).toBe(0);
    expect(at0.shadows).toBe(0);

    const at50 = filterProcessor.process('deep_contrast', 0.5);
    expect(at50.contrast).toBe(9);
    expect(at50.highlights).toBe(-3);
    expect(at50.shadows).toBe(-6);

    const at100 = filterProcessor.process('deep_contrast', 1.0);
    expect(at100.contrast).toBe(18);
    expect(at100.highlights).toBe(-6);
    expect(at100.shadows).toBe(-12);
  });

  it('STEP 3: Verify 1:1 FFmpeg export filter graph string parity', () => {
    const spec = { filterId: 'deep_contrast', intensity: 1.0, opacity: 100, blendMode: 'normal' };
    const graphStr = filterRenderer.getFFmpegFilterGraphString(spec);

    expect(graphStr).toContain('eq=');
    expect(graphStr).toContain('contrast=1.18');
  });
});
