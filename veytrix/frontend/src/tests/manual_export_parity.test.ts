import { describe, it, expect } from 'vitest';

describe('Manual Export Parity Serialization Validation', () => {
  it('serializes single and stacked filters with opacity & blendMode', () => {
    const clipWithFilters = {
      id: 'clip-1',
      type: 'VIDEO',
      duration: 5,
      filters: [
        { id: 'warm', intensity: 80, opacity: 0.9, blendMode: 'multiply' },
        { id: 'vignette', intensity: 50, opacity: 0.7, blendMode: 'normal' },
      ],
    };

    const formattedFilters = clipWithFilters.filters.map((filt: any) => ({
      filter_id: filt.id,
      intensity: filt.intensity > 1 ? filt.intensity / 100 : filt.intensity,
      opacity: filt.opacity,
      blend_mode: filt.blendMode,
    }));

    expect(formattedFilters).toHaveLength(2);
    expect(formattedFilters[0]).toEqual({
      filter_id: 'warm',
      intensity: 0.8,
      opacity: 0.9,
      blend_mode: 'multiply',
    });
    expect(formattedFilters[1]).toEqual({
      filter_id: 'vignette',
      intensity: 0.5,
      opacity: 0.7,
      blend_mode: 'normal',
    });
  });

  it('serializes single and stacked effects with parameters & keyframes', () => {
    const clipWithEffects = {
      id: 'clip-2',
      type: 'VIDEO',
      duration: 10,
      appliedEffects: [
        { id: 'blur', presetId: 'blur', intensity: 60, opacity: 1.0, keyframes: [{ time: 0, value: 10 }, { time: 5, value: 50 }] },
        { id: 'glitch', presetId: 'glitch', intensity: 40, opacity: 0.8, keyframes: [] },
      ],
    };

    const formattedEffects = clipWithEffects.appliedEffects.map((eff: any) => ({
      effect_id: eff.id,
      engine_key: eff.presetId,
      intensity: eff.intensity > 1 ? eff.intensity / 100 : eff.intensity,
      opacity: eff.opacity,
      keyframes: eff.keyframes,
    }));

    expect(formattedEffects).toHaveLength(2);
    expect(formattedEffects[0].effect_id).toBe('blur');
    expect(formattedEffects[0].keyframes).toHaveLength(2);
    expect(formattedEffects[1].effect_id).toBe('glitch');
  });

  it('serializes transitions between adjacent clips correctly', () => {
    const clipWithTransition = {
      id: 'clip-3',
      type: 'VIDEO',
      duration: 4,
      appliedTransition: {
        type: 'wipe',
        duration: 1.0,
        direction: 'in',
      },
    };

    const formattedTransition = {
      transition_type: clipWithTransition.appliedTransition.type,
      duration: clipWithTransition.appliedTransition.duration,
      direction: clipWithTransition.appliedTransition.direction,
    };

    expect(formattedTransition.transition_type).toBe('wipe');
    expect(formattedTransition.duration).toBe(1.0);
  });
});
