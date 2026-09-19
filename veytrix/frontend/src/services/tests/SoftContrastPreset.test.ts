// src/services/tests/SoftContrastPreset.test.ts
import { describe, it, expect } from 'vitest';
import { getToneAdjustmentPreset } from '../../components/editor-main-screen/tools/filters/engines/toneAdjustment/toneAdjustmentPresets';
import { filterProcessor } from '../FilterProcessor';
import { filterRenderer } from '../FilterRenderer';

describe("Filter #13 — Soft Contrast (Official Recipe & 10-Pass Luxury Beauty Grade)", () => {
  it('STEP 1: Verify preset definition and official recipe resolution', () => {
    const presetById = getToneAdjustmentPreset('soft_contrast');
    const presetByNum = getToneAdjustmentPreset(13);
    const presetByStrNum = getToneAdjustmentPreset('13');
    const presetByName = getToneAdjustmentPreset('Soft Contrast');

    expect(presetById).toBeDefined();
    expect(presetByNum).toBeDefined();
    expect(presetByStrNum).toBeDefined();
    expect(presetByName).toBeDefined();

    expect(presetById?.name).toBe('Soft Contrast');
    expect(presetById?.params.contrast).toBe(-0.10);
    expect(presetById?.params.highlights).toBe(-0.05);
    expect(presetById?.params.shadows).toBe(0.08);
    expect(presetById?.params.clarity).toBe(-0.02);
  });

  it('STEP 2: Verify parameter processing scaling at 0%, 50%, and 100% strength', () => {
    const at0 = filterProcessor.process('soft_contrast', 0.0);
    expect(at0.contrast).toBe(0);
    expect(at0.highlights).toBe(0);
    expect(at0.shadows).toBe(0);

    const at50 = filterProcessor.process('soft_contrast', 0.5);
    expect(at50.contrast).toBe(-5);
    expect(at50.highlights).toBe(-2.5);
    expect(at50.shadows).toBe(4);

    const at100 = filterProcessor.process('soft_contrast', 1.0);
    expect(at100.contrast).toBe(-10);
    expect(at100.highlights).toBe(-5);
    expect(at100.shadows).toBe(8);
  });

  it('STEP 3: Verify 1:1 FFmpeg export filter graph string parity', () => {
    const spec = { filterId: 'soft_contrast', intensity: 1.0, opacity: 100, blendMode: 'normal' };
    const graphStr = filterRenderer.getFFmpegFilterGraphString(spec);

    expect(graphStr).toContain('eq=');
    expect(graphStr).toContain('contrast=0.90');
  });
});
