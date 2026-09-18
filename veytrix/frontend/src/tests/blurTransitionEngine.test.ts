// src/tests/blurTransitionEngine.test.ts
import { describe, it, expect } from 'vitest';
import {
  blurTransitionEngine,
  BlurTransitionEngine,
} from '../components/editor-main-screen/tools/transitions/engines/blur/BlurTransitionEngine';
import { BLUR_TRANSITION_PRESETS } from '../components/editor-main-screen/tools/transitions/engines/blur/blurTransitionPresets';
import { assetRegistry } from '../services/AssetRegistry';

describe('BlurTransitionEngine & 10 Transitions Behavioral & Parity Tests', () => {
  it('1. Reusable Engine Key & Singleton Identity', () => {
    expect(blurTransitionEngine).toBeInstanceOf(BlurTransitionEngine);
    const blurAssets = assetRegistry.getAssetsByType('Transitions').slice(50, 60);
    expect(blurAssets.length).toBe(10);
    blurAssets.forEach((asset) => {
      expect(asset.engineKey).toBe('BlurTransitionEngine');
    });
  });

  it('2. Exact Master Excel Name Parity for Transitions 51–60', () => {
    const expectedExcelNames = [
      'Motion Blur',
      'Gaussian Blur',
      'Directional Blur',
      'Radial Blur',
      'Lens Blur ', // Trailing space in Excel
      'Broken Blur', // PDF #56 Bokeh Blur, Excel title identity Broken Blur
      'Blur Flash',
      'Blur Stretch',
      'Blur Tunnel ', // Trailing space in Excel
      'Cinematic Blur',
    ];

    expectedExcelNames.forEach((name, index) => {
      const id = index + 51;
      const asset = assetRegistry.getAssetById('Transitions', id);
      expect(asset).toBeDefined();
      expect(asset?.name).toBe(name);

      const def = blurTransitionEngine.getDefinition(name);
      expect(def).toBeDefined();
      expect(def?.id).toBe(id);
    });
  });

  it('3. Motion Blur (ID 51) Directional Velocity Blur & Horizontal Motion Stretch', () => {
    const half = blurTransitionEngine.evaluateTransition('Motion Blur', 0.5);
    expect(half.outgoingFilter).toContain('blur(');
    expect(half.outgoingTransform).toContain('scaleX(');
  });

  it('4. Gaussian Blur (ID 52) Isotropic Blur Peak & Resolution', () => {
    const zero = blurTransitionEngine.evaluateTransition('Gaussian Blur', 0.0);
    expect(zero.outgoingFilter).toBe('');

    const half = blurTransitionEngine.evaluateTransition('Gaussian Blur', 0.5);
    expect(half.outgoingFilter).toContain('blur(');

    const end = blurTransitionEngine.evaluateTransition('Gaussian Blur', 1.0);
    expect(end.incomingFilter).toBe('');
  });

  it('5. Directional Blur (ID 53) 45° Angle Sampling Translation', () => {
    const half = blurTransitionEngine.evaluateTransition('Directional Blur', 0.5);
    expect(half.outgoingFilter).toContain('blur(');
    expect(half.outgoingTransform).toContain('translate(');
  });

  it('6. Radial Blur (ID 54) Center Radial Scaling & Origin', () => {
    const half = blurTransitionEngine.evaluateTransition('Radial Blur', 0.5);
    expect(half.outgoingFilter).toContain('blur(');
    expect(half.outgoingTransform).toContain('scale(');
    expect(half.outgoingTransformOrigin).toBe('50.0% 50.0%');
  });

  it('7. Lens Blur (ID 55) Defocus Contrast Boost', () => {
    const half = blurTransitionEngine.evaluateTransition('Lens Blur ', 0.5);
    expect(half.outgoingFilter).toContain('blur(');
    expect(half.outgoingFilter).toContain('contrast(110%)');
  });

  it('8. Broken Blur (ID 56) High Contrast Bokeh Circle Scatter', () => {
    const half = blurTransitionEngine.evaluateTransition('Broken Blur', 0.5);
    expect(half.outgoingFilter).toContain('blur(');
    expect(half.outgoingFilter).toContain('contrast(125%)');
    expect(half.outgoingFilter).toContain('brightness(110%)');
  });

  it('9. Blur Flash (ID 57) White Glow Overlay Peak', () => {
    const half = blurTransitionEngine.evaluateTransition('Blur Flash', 0.5);
    expect(half.outgoingFilter).toContain('blur(');
    expect(half.overlayColor).toBe('#ffffff');
    expect(half.overlayOpacity).toBeGreaterThan(0.5);
  });

  it('10. Blur Stretch (ID 58) Stretch Scale & Directional Blur', () => {
    const half = blurTransitionEngine.evaluateTransition('Blur Stretch', 0.5);
    expect(half.outgoingFilter).toContain('blur(');
    expect(half.outgoingTransform).toContain('scaleX(');
  });

  it('11. Blur Tunnel (ID 59) Tunnel Zoom Out & In', () => {
    const half = blurTransitionEngine.evaluateTransition('Blur Tunnel ', 0.5);
    expect(half.outgoingFilter).toContain('blur(');
    expect(half.outgoingTransform).toContain('scale(');
    expect(half.incomingTransform).toContain('scale(');
  });

  it('12. Cinematic Blur (ID 60) Warm Cinematic Glow & Defocus', () => {
    const half = blurTransitionEngine.evaluateTransition('Cinematic Blur', 0.5);
    expect(half.outgoingFilter).toContain('blur(');
    expect(half.overlayColor).toBe('#fff6e5');
    expect(half.overlayOpacity).toBeGreaterThan(0.1);
  });

  it('13. No Cumulative Blur Test across Multiple Frame Evaluates', () => {
    const progress = 0.5;
    const eval1 = blurTransitionEngine.evaluateTransition('Gaussian Blur', progress);
    const eval2 = blurTransitionEngine.evaluateTransition('Gaussian Blur', progress);
    const eval10 = blurTransitionEngine.evaluateTransition('Gaussian Blur', progress);

    expect(eval1.outgoingFilter).toBe(eval2.outgoingFilter);
    expect(eval2.outgoingFilter).toBe(eval10.outgoingFilter);
  });

  it('14. Structural Differentiation Test Across All 10 Blur Transitions', () => {
    const progressSteps = [0.0, 0.25, 0.5, 0.75, 1.0];
    const presets = [
      'Motion Blur',
      'Gaussian Blur',
      'Directional Blur',
      'Radial Blur',
      'Lens Blur ',
      'Broken Blur',
      'Blur Flash',
      'Blur Stretch',
      'Blur Tunnel ',
      'Cinematic Blur',
    ];

    const transitionSignatures = presets.map((name) => {
      return progressSteps.map((p) => {
        const res = blurTransitionEngine.evaluateTransition(name, p);
        return `${res.outgoingOpacity.toFixed(2)}_${res.incomingOpacity.toFixed(2)}_${res.outgoingTransform || 'none'}_${res.outgoingFilter || 'none'}_${res.overlayColor || 'none'}`;
      });
    });

    // Verify all 10 blur transitions produce distinct signatures across progress steps
    const uniqueSignatures = new Set(transitionSignatures.map((s) => s.join('|')));
    expect(uniqueSignatures.size).toBe(10);
  });

  it('15. Robustness & Safety Edge-Cases', () => {
    // Negative progress clamps to 0
    const neg = blurTransitionEngine.evaluateTransition('Gaussian Blur', -1.5);
    expect(neg.outgoingOpacity).toBe(1);
    expect(neg.outgoingFilter).toBe('');

    // Overflow progress clamps to 1
    const over = blurTransitionEngine.evaluateTransition('Gaussian Blur', 3.5);
    expect(over.incomingOpacity).toBe(1);
    expect(over.incomingFilter).toBe('');

    // NaN progress defaults safely
    const nanRes = blurTransitionEngine.evaluateTransition('Gaussian Blur', NaN);
    expect(nanRes.outgoingOpacity).toBe(1);
    expect(nanRes.outgoingFilter).toBe('');
  });
});
