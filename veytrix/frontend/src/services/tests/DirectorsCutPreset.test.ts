// src/services/tests/DirectorsCutPreset.test.ts
import { describe, it, expect } from 'vitest';
import { getCinematicFilterPreset } from '../../components/editor-main-screen/tools/filters/cinematic';
import { filterProcessor } from '../FilterProcessor';
import { filterRenderer } from '../FilterRenderer';
import { CinematicComposer } from '../../components/editor-main-screen/tools/filters/engines/cinematic/CinematicComposer';

describe("Filter #10 — Director's Cut (Official Recipe & 16-Pass Master Grade)", () => {
  it('should resolve directors_cut preset recipe correctly', () => {
    const preset = getCinematicFilterPreset('directors_cut');
    expect(preset).toBeDefined();
    expect(preset?.id).toBe('directors_cut');
    expect(preset?.name).toBe("Director's Cut");
    expect(preset?.adjustments.contrast).toBe(9);
    expect(preset?.adjustments.highlights).toBe(-12);
    expect(preset?.adjustments.shadows).toBe(8);
    expect(preset?.adjustments.saturation).toBe(3);
    expect(preset?.adjustments.temperature).toBe(2);
    expect(preset?.adjustments.clarity).toBe(3);
    expect(preset?.adjustments.bloom).toBe(3);
    expect(preset?.adjustments.skinProtection).toBe(true);
    expect(preset?.adjustments.warmHighlightToning).toBe(true);
  });

  it('should process multi-stage parameters linearly at 100% intensity', () => {
    const params = filterProcessor.process('directors_cut', 1.0);
    expect(params.contrast).toBe(9);
    expect(params.highlights).toBe(-12);
    expect(params.shadows).toBe(8);
    expect(params.saturation).toBeCloseTo(2.55); // Skin protection scaling 3 * 0.85
    expect(params.temperature).toBe(2);
    expect(params.clarity).toBe(3);
    expect(params.bloom).toBe(3);
    expect(params.skinProtectionActive).toBe(true);
    expect(params.warmHighlightToningActive).toBe(true);
  });

  it('should compile composed GLSL fragment shader for master grade', () => {
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

  it('should generate 1:1 FFmpeg filter graph string for export parity', () => {
    const spec = { filterId: 'directors_cut', intensity: 1.0, opacity: 100, blendMode: 'normal' };
    const graphStr = filterRenderer.getFFmpegFilterGraphString(spec);

    expect(graphStr).toContain('eq=contrast=1.09:saturation=1.03');
    expect(graphStr).toContain('colorbalance=rs=0.03:bs=-0.01');
  });
});
