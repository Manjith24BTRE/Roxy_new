import { describe, it, expect } from 'vitest';
import {
  evaluateFrontendEasing,
  resolveFrontendTransition,
  renderFrontendTransitionFrame,
} from '../src/components/editor-main-screen/tools/transitions/frontendTransitionEngine';

describe('Phase 5.1 Frontend Preview / Export Parity Tests', () => {
  it('1. Easing Engine: modifies progress curve correctly', () => {
    const tInput = 0.25;
    const linear = evaluateFrontendEasing(tInput, 'linear');
    const easeIn = evaluateFrontendEasing(tInput, 'ease_in');
    const easeOut = evaluateFrontendEasing(tInput, 'ease_out');
    const bounce = evaluateFrontendEasing(tInput, 'bounce');

    expect(linear).toBe(0.25);
    expect(easeIn).toBeCloseTo(0.015625, 4);
    expect(easeOut).toBeCloseTo(0.578125, 4);
    expect(bounce).not.toBe(linear);
  });

  it('2. Intensity Parameter: scales transform and filter magnitudes', () => {
    const lowIntensityConfig = resolveFrontendTransition({
      id: 'glitch-rgb-shift',
      intensity: 10,
    });
    const highIntensityConfig = resolveFrontendTransition({
      id: 'glitch-rgb-shift',
      intensity: 100,
    });

    const frameLow = renderFrontendTransitionFrame(lowIntensityConfig, 0.5);
    const frameHigh = renderFrontendTransitionFrame(highIntensityConfig, 0.5);

    expect(frameLow.sceneA.transform).not.toEqual(frameHigh.sceneA.transform);
    expect(frameLow.sceneA.filter).not.toEqual(frameHigh.sceneA.filter);
  });

  it('3. Motion Blur: toggling motion blur adds velocity blur filters', () => {
    const noBlurConfig = resolveFrontendTransition({
      id: 'whip-pan-left-premium',
      motionBlur: false,
      intensity: 50,
    });
    const withBlurConfig = resolveFrontendTransition({
      id: 'whip-pan-left-premium',
      motionBlur: true,
      intensity: 50,
    });

    const frameNoBlur = renderFrontendTransitionFrame(noBlurConfig, 0.5);
    const frameWithBlur = renderFrontendTransitionFrame(withBlurConfig, 0.5);

    expect(frameNoBlur.sceneA.filter).not.toEqual(frameWithBlur.sceneA.filter);
  });

  it('4. Direction Parameter: alters direction of CSS transforms', () => {
    const leftConfig = resolveFrontendTransition({
      id: 'whip-pan',
      direction: 'left',
    });
    const rightConfig = resolveFrontendTransition({
      id: 'whip-pan',
      direction: 'right',
    });

    const frameLeft = renderFrontendTransitionFrame(leftConfig, 0.5);
    const frameRight = renderFrontendTransitionFrame(rightConfig, 0.5);

    expect(frameLeft.sceneA.transform).toContain('translateX');
    expect(frameRight.sceneA.transform).toContain('translateX');
    expect(frameLeft.sceneA.transform).not.toEqual(frameRight.sceneA.transform);
  });

  it('5. Custom Parameters: preset parameters alter preview frame properties', () => {
    const baseConfig = resolveFrontendTransition({
      id: 'glitch-rgb-shift',
      parameters: { rgbShift: 1.0, noiseAmount: 1.0 },
    });
    const modifiedConfig = resolveFrontendTransition({
      id: 'glitch-rgb-shift',
      parameters: { rgbShift: 3.0, noiseAmount: 2.5 },
    });

    const baseFrame = renderFrontendTransitionFrame(baseConfig, 0.5);
    const modFrame = renderFrontendTransitionFrame(modifiedConfig, 0.5);

    expect(baseFrame.sceneA.transform).not.toEqual(modFrame.sceneA.transform);
    expect(baseFrame.sceneA.filter).not.toEqual(modFrame.sceneA.filter);
  });

  it('6. Transition Registry Parity: preserves catalog preset parameters and categories', () => {
    const fadePreset = resolveFrontendTransition('cross-dissolve-premium');
    const cameraPreset = resolveFrontendTransition('whip-pan-left-premium');
    const glitchPreset = resolveFrontendTransition('glitch-rgb-shift');
    const lightPreset = resolveFrontendTransition('flash-bloom-pro');
    const burnPreset = resolveFrontendTransition('film-burn-pro');
    const threedPreset = resolveFrontendTransition('cube-3d-transition');

    expect(fadePreset.renderer).toBe('fade');
    expect(cameraPreset.renderer).toBe('whip-pan');
    expect(glitchPreset.renderer).toBe('glitch');
    expect(lightPreset.renderer).toBe('fade-white');
    expect(burnPreset.renderer).toBe('light-burn');
    expect(threedPreset.renderer).toBe('cube-3d');
  });
});
