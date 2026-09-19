// src/services/tests/HDRFilmPreset.test.ts
import { describe, it, expect } from 'vitest';
import { getCinematicFilterPreset } from '../../components/editor-main-screen/tools/filters/cinematic';
import { filterProcessor } from '../FilterProcessor';
import { filterRenderer } from '../FilterRenderer';
import { CinematicComposer } from '../../components/editor-main-screen/tools/filters/engines/cinematic/CinematicComposer';

describe('Filter #9 — HDR Film (Official Recipe & 14-Pass Modular Pipeline)', () => {
  it('should resolve hdr_film preset recipe correctly', () => {
    const preset = getCinematicFilterPreset('hdr_film');
    expect(preset).toBeDefined();
    expect(preset?.id).toBe('hdr_film');
    expect(preset?.name).toBe('HDR Film');
    expect(preset?.adjustments.highlights).toBe(-18);
    expect(preset?.adjustments.shadows).toBe(15);
    expect(preset?.adjustments.clarity).toBe(6);
    expect(preset?.adjustments.contrast).toBe(8);
    expect(preset?.adjustments.saturation).toBe(5);
    expect(preset?.adjustments.skinProtection).toBe(true);
    expect(preset?.adjustments.hdrRecovery).toBe(true);
  });

  it('should process multi-stage parameters linearly at 100% intensity', () => {
    const params = filterProcessor.process('hdr_film', 1.0);
    expect(params.highlights).toBeCloseTo(-21.6); // Dynamic recovery math -18 * 1.2
    expect(params.shadows).toBeCloseTo(18.75);     // Dynamic recovery math 15 * 1.25
    expect(params.clarity).toBe(6);
    expect(params.contrast).toBe(8);
    expect(params.saturation).toBeCloseTo(4.25); // Skin protection math 5 * 0.85
    expect(params.skinProtectionActive).toBe(true);
    expect(params.hdrRecoveryActive).toBe(true);
  });

  it('should compile composed GLSL fragment shader with HDR Tone Mapping & Color Science', () => {
    const composer = CinematicComposer.getInstance();
    const shader = composer.getFragmentShaderSource('hdr_film');

    expect(shader).toContain('applyHDRToneMapping');
    expect(shader).toContain('applyClarity');
    expect(shader).toContain('applyContrastCurve');
    expect(shader).toContain('applyHDRColorScience');
    expect(shader).toContain('applySkinProtection');
  });

  it('should generate 1:1 FFmpeg filter graph string for export parity', () => {
    const spec = { filterId: 'hdr_film', intensity: 1.0, opacity: 100, blendMode: 'normal' };
    const graphStr = filterRenderer.getFFmpegFilterGraphString(spec);

    expect(graphStr).toContain('eq=contrast=1.08:saturation=1.04');
  });
});
