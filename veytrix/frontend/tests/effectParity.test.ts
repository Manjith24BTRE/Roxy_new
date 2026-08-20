import { describe, it, expect } from 'vitest';
import {
  resolveFrontendEffect,
  renderFrontendEffectFrame,
} from '../src/components/editor-main-screen/tools/effects/frontendEffectEngine';

describe('Phase 7 CapCut Filters & Effects Parity Tests', () => {
  it('1. EffectRegistry Resolution: resolves exact IDs and categories correctly', () => {
    const vhsEffect = resolveFrontendEffect({ id: 'vhs-retro-grain', category: 'film' });
    const shakeEffect = resolveFrontendEffect({ id: 'camera-shake-impact', category: 'motion' });

    expect(vhsEffect.id).toBe('vhs-retro-grain');
    expect(shakeEffect.category).toBe('motion');
  });

  it('2. Intensity Parameter Consumption: scales filter & transform magnitudes', () => {
    const lowConfig = resolveFrontendEffect({ id: 'camera-shake-impact', category: 'motion', intensity: 10 });
    const highConfig = resolveFrontendEffect({ id: 'camera-shake-impact', category: 'motion', intensity: 100 });

    const lowFrame = renderFrontendEffectFrame(lowConfig, 1.0);
    const highFrame = renderFrontendEffectFrame(highConfig, 1.0);

    expect(lowFrame.transform).not.toEqual(highFrame.transform);
    expect(lowFrame.filter).not.toEqual(highFrame.filter);
  });

  it('3. Speed & Time Parameter Consumption: alters animation state over time', () => {
    const config = resolveFrontendEffect({ id: 'lens-flare-anamorphic', category: 'light', speed: 2.0 });

    const frameT1 = renderFrontendEffectFrame(config, 0.5);
    const frameT2 = renderFrontendEffectFrame(config, 1.5);

    expect(frameT1.filter).not.toEqual(frameT2.filter);
  });

  it('4. Custom Parameters Consumption: adjusts color grading and film properties', () => {
    const baseColor = resolveFrontendEffect({
      id: 'color-grading-hdr',
      category: 'color',
      parameters: { saturation: 10, contrast: 10 },
    });
    const boostedColor = resolveFrontendEffect({
      id: 'color-grading-hdr',
      category: 'color',
      parameters: { saturation: 80, contrast: 50 },
    });

    const baseFrame = renderFrontendEffectFrame(baseColor, 0);
    const boostedFrame = renderFrontendEffectFrame(boostedColor, 0);

    expect(baseFrame.filter).not.toEqual(boostedFrame.filter);
  });

  it('5. Backward Compatibility: generic fallback handles unknown effects without throwing', () => {
    const unknown = resolveFrontendEffect('unknown-custom-effect-xyz');
    const frame = renderFrontendEffectFrame(unknown, 0);

    expect(frame).toBeDefined();
    expect(frame.opacity).toBe(1.0);
  });
});
