// src/services/tests/CinematicFilterCollection.test.ts
import { describe, it, expect } from 'vitest';
import { CINEMATIC_FILTER_PRESETS, getCinematicFilterPreset } from '../../components/editor-main-screen/tools/filters/cinematic';
import { filterProcessor } from '../FilterProcessor';
import { filterRenderer } from '../FilterRenderer';

describe('Cinematic Filter Collection & FilterProcessor', () => {
  it('should export all 10 cinematic filter presets in registry', () => {
    const keys = Object.keys(CINEMATIC_FILTER_PRESETS);
    expect(keys).toHaveLength(10);
    expect(keys).toContain('hollywood_gold');
    expect(keys).toContain('cinematic_lut');
    expect(keys).toContain('teal_orange');
    expect(keys).toContain('warm_cinema');
    expect(keys).toContain('cold_cinema');
    expect(keys).toContain('moody_film');
    expect(keys).toContain('dream_cinema');
    expect(keys).toContain('vintage_cinema');
    expect(keys).toContain('hdr_film');
    expect(keys).toContain('directors_cut');
  });

  it('should resolve preset from getCinematicFilterPreset function', () => {
    const preset = getCinematicFilterPreset('Hollywood Gold');
    expect(preset).toBeDefined();
    expect(preset?.id).toBe('hollywood_gold');
    expect(preset?.category).toBe('Cinematic');
    expect(preset?.adjustments.skinProtection).toBe(true);
  });

  it('should linearly interpolate values based on intensity factor', () => {
    // Hollywood Gold preset has contrast: 12
    const at100 = filterProcessor.process('hollywood_gold', 1.0);
    expect(at100.contrast).toBe(12);

    // Intensity 50% -> contrast should be 6
    const at50 = filterProcessor.process('hollywood_gold', 0.5);
    expect(at50.contrast).toBe(6);

    // Intensity 0% -> contrast should be 0
    const at0 = filterProcessor.process('hollywood_gold', 0.0);
    expect(at0.contrast).toBe(0);
  });

  it('should apply skin protection for Hollywood Gold, Teal & Orange, Warm Cinema, and Director Cut', () => {
    const hollywood = filterProcessor.process('hollywood_gold', 1.0);
    expect(hollywood.skinProtectionActive).toBe(true);

    const tealOrange = filterProcessor.process('teal_orange', 1.0);
    expect(tealOrange.skinProtectionActive).toBe(true);

    const warmCinema = filterProcessor.process('warm_cinema', 1.0);
    expect(warmCinema.skinProtectionActive).toBe(true);

    const directorsCut = filterProcessor.process('directors_cut', 1.0);
    expect(directorsCut.skinProtectionActive).toBe(true);

    const coldCinema = filterProcessor.process('cold_cinema', 1.0);
    expect(coldCinema.skinProtectionActive).toBe(true);
  });

  it('should apply resolution-aware grain for Vintage Cinema', () => {
    const at1080p = filterProcessor.process('vintage_cinema', 1.0, undefined, 1920, 1080);
    expect(at1080p.resolutionGrainActive).toBe(true);
    expect(at1080p.grain).toBe(8);

    const at4K = filterProcessor.process('vintage_cinema', 1.0, undefined, 3840, 2160);
    expect(at4K.grain).toBeGreaterThan(8);
  });

  it('should apply highlight/shadow recovery for HDR Film', () => {
    const hdr = filterProcessor.process('hdr_film', 1.0);
    expect(hdr.hdrRecoveryActive).toBe(true);
    // Preset has highlights -18 -> recovered to -21.6
    expect(hdr.highlights).toBeCloseTo(-21.6);
  });

  it('should generate identical FFmpeg export string via FilterRenderer single source of truth', () => {
    const spec = { filterId: 'hollywood_gold', intensity: 1.0, opacity: 100, blendMode: 'normal' };
    const graphStr = filterRenderer.getFFmpegFilterGraphString(spec);
    expect(graphStr).toContain('eq=contrast=1.12');
  });
});
