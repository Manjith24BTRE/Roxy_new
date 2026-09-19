// src/services/tests/DirectorsCutDiagnosticPipeline.test.ts
import { describe, it, expect } from 'vitest';
import { getCinematicFilterPreset } from '../../components/editor-main-screen/tools/filters/cinematic';
import { filterProcessor } from '../FilterProcessor';
import { filterRenderer } from '../FilterRenderer';
import { CinematicComposer } from '../../components/editor-main-screen/tools/filters/engines/cinematic/CinematicComposer';

describe("Filter #10 — Director's Cut Diagnostic Execution Trace", () => {
  it('STEP 1: Verify filter selection and preset resolution for all identifier variants', () => {
    const fromId = getCinematicFilterPreset('directors_cut');
    const fromNum = getCinematicFilterPreset(10);
    const fromStrNum = getCinematicFilterPreset('10');
    const fromName = getCinematicFilterPreset("Director's Cut");
    const fromCleanKey = getCinematicFilterPreset('director_s_cut');

    expect(fromId).toBeDefined();
    expect(fromNum).toBeDefined();
    expect(fromStrNum).toBeDefined();
    expect(fromName).toBeDefined();
    expect(fromCleanKey).toBeDefined();

    expect(fromId?.id).toBe('directors_cut');
    expect(fromNum?.id).toBe('directors_cut');
    expect(fromStrNum?.id).toBe('directors_cut');
    expect(fromName?.id).toBe('directors_cut');
    expect(fromCleanKey?.id).toBe('directors_cut');
  });

  it('STEP 2: Verify strength scaling (0% -> baseline, 50% -> half, 100% -> full)', () => {
    const at0 = filterProcessor.process('directors_cut', 0.0);
    expect(at0.contrast).toBe(0);
    expect(at0.highlights).toBe(0);
    expect(at0.shadows).toBe(0);

    const at50 = filterProcessor.process('directors_cut', 0.5);
    expect(at50.contrast).toBe(4.5);
    expect(at50.highlights).toBe(-6);
    expect(at50.shadows).toBe(4);

    const at100 = filterProcessor.process('directors_cut', 1.0);
    expect(at100.contrast).toBe(9);
    expect(at100.highlights).toBe(-12);
    expect(at100.shadows).toBe(8);
  });

  it('STEP 3: Verify composed GLSL fragment shader execution graph', () => {
    const composer = CinematicComposer.getInstance();
    const shader = composer.getFragmentShaderSource('directors_cut');

    expect(shader).toContain('applyWhiteBalance');
    expect(shader).toContain('applyContrastCurve');
    expect(shader).toContain('applyHighlightRolloff');
    expect(shader).toContain('applyShadowCompression');
    expect(shader).toContain('applyClarity');
    expect(shader).toContain('applyBloom');
    expect(shader).toContain('applyFilmDensity');
    expect(shader).toContain('applyAtmosphericDepth');
    expect(shader).toContain('applySkinProtection');
  });

  it('STEP 4: Verify Diagnostic Extreme Test (Saturation +200%, Contrast +100%, Temp +50)', () => {
    const diagAdjustments = {
      ...filterProcessor.process('directors_cut', 1.0),
      contrast: 100,
      saturation: 200,
      temperature: 50,
      whites: 0,
      blacks: 0,
      clarity: 3,
      gamma: 1.0,
      vibrance: 0,
      sharpen: 0,
      hue: 0,
      exposure: 0,
      brightness: 0,
      fade: 0,
      vignette: 0,
      grain: 0,
      highlights: -12,
      shadows: 8,
      tint: 0,
    };
    const diagParams = filterProcessor.process('directors_cut', 1.0, diagAdjustments);
    expect(diagParams.contrast).toBe(109);
    expect(diagParams.saturation).toBeGreaterThan(150);
    expect(diagParams.temperature).toBe(52);
  });

  it('STEP 5: Verify 1:1 FFmpeg export graph parity for Director Cut master grade', () => {
    const spec = { filterId: 'directors_cut', intensity: 1.0, opacity: 100, blendMode: 'normal' };
    const graphStr = filterRenderer.getFFmpegFilterGraphString(spec);

    expect(graphStr).toContain('eq=contrast=1.09:saturation=1.03');
    expect(graphStr).toContain('colorbalance=rs=0.03:bs=-0.01');
  });
});
