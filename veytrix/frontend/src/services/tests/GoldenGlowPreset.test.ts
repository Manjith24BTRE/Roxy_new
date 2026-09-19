// src/services/tests/GoldenGlowPreset.test.ts
import { describe, it, expect } from 'vitest';
import { getToneAdjustmentPreset } from '../../components/editor-main-screen/tools/filters/engines/toneAdjustment/toneAdjustmentPresets';
import { filterProcessor } from '../FilterProcessor';
import { filterRenderer } from '../FilterRenderer';

describe("Filter #18 — Golden Glow (Official Recipe & 11-Pass Golden Hour Grade)", () => {
  it('STEP 1: Verify preset definition and official recipe resolution', () => {
    const presetById = getToneAdjustmentPreset('golden_glow');
    const presetByNum = getToneAdjustmentPreset(18);
    const presetByStrNum = getToneAdjustmentPreset('18');
    const presetByName = getToneAdjustmentPreset('GoldenGlow');

    expect(presetById).toBeDefined();
    expect(presetByNum).toBeDefined();
    expect(presetByStrNum).toBeDefined();
    expect(presetByName).toBeDefined();

    expect(presetById?.name).toBe('GoldenGlow');
    expect(presetById?.params.temperature).toBe(0.10);
    expect(presetById?.params.highlights).toBe(-0.06);
    expect(presetById?.params.exposure).toBe(0.03);
    expect(presetById?.params.glow).toBe(0.07);
    expect(presetById?.params.saturation).toBe(0.03);
  });

  it('STEP 2: Verify parameter processing scaling at 0%, 50%, and 100% strength', () => {
    const at0 = filterProcessor.process('golden_glow', 0.0);
    expect(at0.temperature).toBe(0);
    expect(at0.highlights).toBe(0);
    expect(at0.exposure).toBe(0);
    expect(at0.saturation).toBe(0);

    const at50 = filterProcessor.process('golden_glow', 0.5);
    expect(at50.temperature).toBe(5);
    expect(at50.highlights).toBe(-3);
    expect(at50.exposure).toBe(1.5);
    expect(at50.saturation).toBe(1.5);

    const at100 = filterProcessor.process('golden_glow', 1.0);
    expect(at100.temperature).toBe(10);
    expect(at100.highlights).toBe(-6);
    expect(at100.exposure).toBe(3);
    expect(at100.saturation).toBe(3);
  });

  it('STEP 3: Verify 1:1 FFmpeg export filter graph string parity', () => {
    const spec = { filterId: 'golden_glow', intensity: 1.0, opacity: 100, blendMode: 'normal' };
    const graphStr = filterRenderer.getFFmpegFilterGraphString(spec);

    expect(graphStr).toContain('colorbalance=');
    expect(graphStr).toContain('rs=0.05');
  });
});
