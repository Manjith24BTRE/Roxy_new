// src/services/tests/NaturalTonePreset.test.ts
import { describe, it, expect } from 'vitest';
import { getToneAdjustmentPreset } from '../../components/editor-main-screen/tools/filters/engines/toneAdjustment/toneAdjustmentPresets';
import { filterProcessor } from '../FilterProcessor';
import { filterRenderer } from '../FilterRenderer';

describe("Filter #16 — Natural Tone (Official Recipe & 10-Pass Corrective Grade)", () => {
  it('STEP 1: Verify preset definition and official recipe resolution', () => {
    const presetById = getToneAdjustmentPreset('natural_tone');
    const presetByNum = getToneAdjustmentPreset(16);
    const presetByStrNum = getToneAdjustmentPreset('16');
    const presetByName = getToneAdjustmentPreset('Natural Tone');

    expect(presetById).toBeDefined();
    expect(presetByNum).toBeDefined();
    expect(presetByStrNum).toBeDefined();
    expect(presetByName).toBeDefined();

    expect(presetById?.name).toBe('Natural Tone');
    expect(presetById?.params.contrast).toBe(0.02);
    expect(presetById?.params.saturation).toBe(0.01);
    expect(presetById?.params.exposure).toBe(0.0);
    expect(presetById?.params.temperature).toBe(0.0);
    expect(presetById?.params.tint).toBe(0.0);
  });

  it('STEP 2: Verify parameter processing scaling at 0%, 50%, and 100% strength', () => {
    const at0 = filterProcessor.process('natural_tone', 0.0);
    expect(at0.contrast).toBe(0);
    expect(at0.saturation).toBe(0);

    const at50 = filterProcessor.process('natural_tone', 0.5);
    expect(at50.contrast).toBe(1);
    expect(at50.saturation).toBe(0.5);

    const at100 = filterProcessor.process('natural_tone', 1.0);
    expect(at100.contrast).toBe(2);
    expect(at100.saturation).toBe(1);
  });

  it('STEP 3: Verify 1:1 FFmpeg export filter graph string parity', () => {
    const spec = { filterId: 'natural_tone', intensity: 1.0, opacity: 100, blendMode: 'normal' };
    const graphStr = filterRenderer.getFFmpegFilterGraphString(spec);

    expect(graphStr).toContain('eq=');
    expect(graphStr).toContain('contrast=1.02');
    expect(graphStr).toContain('saturation=1.01');
  });
});
