// src/services/tests/ModularFilterEngine.test.ts
import { describe, it, expect } from 'vitest';
import { CinematicComposer } from '../../components/editor-main-screen/tools/filters/engines/cinematic/CinematicComposer';
import { filterProcessor } from '../FilterProcessor';
import { filterRenderer } from '../FilterRenderer';

describe('Modular Filter Engine & Filter Composition Architecture', () => {
  const composer = CinematicComposer.getInstance();

  it('should compile distinct composed GLSL fragment shaders for each cinematic filter', () => {
    const warmShader = composer.getFragmentShaderSource('warm_cinema');
    const coldShader = composer.getFragmentShaderSource('cold_cinema');
    const moodyShader = composer.getFragmentShaderSource('moody_film');
    const dreamShader = composer.getFragmentShaderSource('dream_cinema');
    const vintageShader = composer.getFragmentShaderSource('vintage_cinema');

    // Warm Cinema Composition: WhiteBalance, ContrastCurve, HighlightRolloff, SkinProtection
    expect(warmShader).toContain('applyWhiteBalance');
    expect(warmShader).toContain('applyContrastCurve');
    expect(warmShader).toContain('applyHighlightRolloff');
    expect(warmShader).not.toContain('applyGrain');
    expect(warmShader).not.toContain('applyBloom');

    // Cold Cinema Composition: WhiteBalance, SplitTone, HighlightRolloff, Clarity, SkinProtection
    expect(coldShader).toContain('applyWhiteBalance');
    expect(coldShader).toContain('applySplitTone');
    expect(coldShader).toContain('applyClarity');
    expect(coldShader).not.toContain('applyGrain');

    // Moody Film Composition: ContrastCurve, ShadowCompression, FilmDensity, AtmosphericDepth, SkinProtection
    expect(moodyShader).toContain('applyContrastCurve');
    expect(moodyShader).toContain('applyShadowCompression');
    expect(moodyShader).toContain('applyFilmDensity');
    expect(moodyShader).toContain('applyAtmosphericDepth');
    expect(moodyShader).not.toContain('applyBloom');

    // Dream Cinema Composition: Bloom, PastelColor, HighlightRolloff, AtmosphericDepth, SkinProtection
    expect(dreamShader).toContain('applyBloom');
    expect(dreamShader).toContain('applyPastelColor');
    expect(dreamShader).toContain('applyHighlightRolloff');

    // Vintage Cinema Composition: Grain, FilmFade, KodakColor, HighlightRolloff, FilmDensity, SkinProtection
    expect(vintageShader).toContain('applyGrain');
    expect(vintageShader).toContain('applyFilmFade');
    expect(vintageShader).toContain('applyKodakColor');
    expect(vintageShader).toContain('u_time'); // Frame-randomized animated grain seed
  });

  it('should generate matching FFmpeg filter graph with animated noise for Vintage Cinema', () => {
    const spec = { filterId: 'vintage_cinema', intensity: 1.0, opacity: 100, blendMode: 'normal' };
    const graphStr = filterRenderer.getFFmpegFilterGraphString(spec);

    expect(graphStr).toContain('eq=contrast=0.95:saturation=0.92');
    expect(graphStr).toContain('noise=alls=8:allf=t+u'); // Time-animated noise for export parity
  });
});
