// src/tests/slideTransitionEngine.test.ts
import { describe, it, expect } from 'vitest';
import {
  slideTransitionEngine,
  SlideTransitionEngine,
} from '../components/editor-main-screen/tools/transitions/engines/slide/SlideTransitionEngine';
import { SLIDE_TRANSITION_PRESETS } from '../components/editor-main-screen/tools/transitions/engines/slide/slideTransitionPresets';
import { assetRegistry } from '../services/AssetRegistry';

describe('SlideTransitionEngine & 10 Transitions Behavioral & Parity Tests', () => {
  it('1. Reusable Engine Key & Singleton Identity', () => {
    expect(slideTransitionEngine).toBeInstanceOf(SlideTransitionEngine);
    const slideAssets = assetRegistry.getAssetsByType('Transitions').slice(30, 40);
    expect(slideAssets.length).toBe(10);
    slideAssets.forEach((asset) => {
      expect(asset.engineKey).toBe('SlideTransitionEngine');
    });
  });

  it('2. Exact Master Excel Name Parity for Transitions 31–40', () => {
    const expectedExcelNames = [
      'Slide Left',
      'Slide Right',
      'Slide Up',
      'Slide Down',
      'Push left ', // Note exact lowercase 'l' and trailing space from Excel
      'Push Right',
      'Push Up',
      'Push Down',
      'Diagonal Slide',
      'Perspective Push',
    ];

    expectedExcelNames.forEach((name, index) => {
      const id = index + 31;
      const asset = assetRegistry.getAssetById('Transitions', id);
      expect(asset).toBeDefined();
      expect(asset?.name).toBe(name);

      const def = slideTransitionEngine.getDefinition(name);
      expect(def).toBeDefined();
      expect(def?.id).toBe(id);
    });
  });

  it('3. Slide Left (ID 31) Leftward Screen-Space Motion', () => {
    const half = slideTransitionEngine.evaluateTransition('Slide Left', 0.5);
    expect(half.outgoingTransform).toContain('translate(-50');
    expect(half.incomingTransform).toContain('translate(50');
    expect(half.outgoingFilter).toContain('blur');

    const end = slideTransitionEngine.evaluateTransition('Slide Left', 1.0);
    expect(end.outgoingTransform).toContain('translate(-100');
  });

  it('4. Slide Right (ID 32) Rightward Screen-Space Motion', () => {
    const half = slideTransitionEngine.evaluateTransition('Slide Right', 0.5);
    expect(half.outgoingTransform).toContain('translate(50');
    expect(half.incomingTransform).toContain('translate(-50');
    expect(half.outgoingFilter).toContain('blur');

    const end = slideTransitionEngine.evaluateTransition('Slide Right', 1.0);
    expect(end.outgoingTransform).toContain('translate(100');
  });

  it('5. Slide Up (ID 33) Upward Vertical Motion', () => {
    const half = slideTransitionEngine.evaluateTransition('Slide Up', 0.5);
    expect(half.outgoingTransform).toContain('translate(0.00%, -50');
    expect(half.incomingTransform).toContain('translate(0.00%, 50');

    const end = slideTransitionEngine.evaluateTransition('Slide Up', 1.0);
    expect(end.outgoingTransform).toContain('translate(0.00%, -100');
  });

  it('6. Slide Down (ID 34) Downward Vertical Motion', () => {
    const half = slideTransitionEngine.evaluateTransition('Slide Down', 0.5);
    expect(half.outgoingTransform).toContain('translate(0.00%, 50');
    expect(half.incomingTransform).toContain('translate(0.00%, -50');

    const end = slideTransitionEngine.evaluateTransition('Slide Down', 1.0);
    expect(end.outgoingTransform).toContain('translate(0.00%, 100');
  });

  it('7. Push Left (ID 35) Contiguous Block Push (Zero Gap & Full Opacity)', () => {
    const mid = slideTransitionEngine.evaluateTransition('Push left ', 0.5);
    expect(mid.outgoingOpacity).toBe(1);
    expect(mid.incomingOpacity).toBe(1);
    expect(mid.outgoingTransform).toContain('translate(-50');
    expect(mid.incomingTransform).toContain('translate(50');
  });

  it('8. Push Right (ID 36) Rightward Synchronized Block Push', () => {
    const mid = slideTransitionEngine.evaluateTransition('Push Right', 0.5);
    expect(mid.outgoingOpacity).toBe(1);
    expect(mid.incomingOpacity).toBe(1);
    expect(mid.outgoingTransform).toContain('translate(50');
    expect(mid.incomingTransform).toContain('translate(-50');
  });

  it('9. Push Up (ID 37) Upward Synchronized Block Push', () => {
    const mid = slideTransitionEngine.evaluateTransition('Push Up', 0.5);
    expect(mid.outgoingOpacity).toBe(1);
    expect(mid.incomingOpacity).toBe(1);
    expect(mid.outgoingTransform).toContain('translate(0.00%, -50');
    expect(mid.incomingTransform).toContain('translate(0.00%, 50');
  });

  it('10. Push Down (ID 38) Downward Synchronized Block Push', () => {
    const mid = slideTransitionEngine.evaluateTransition('Push Down', 0.5);
    expect(mid.outgoingOpacity).toBe(1);
    expect(mid.incomingOpacity).toBe(1);
    expect(mid.outgoingTransform).toContain('translate(0.00%, 50');
    expect(mid.incomingTransform).toContain('translate(0.00%, -50');
  });

  it('11. Diagonal Slide (ID 39) Vector Diagonal Motion', () => {
    const mid = slideTransitionEngine.evaluateTransition('Diagonal Slide', 0.5);
    expect(mid.outgoingTransform).toContain('translate(-35');
    expect(mid.incomingTransform).toContain('translate(35');
    expect(mid.outgoingFilter).toContain('blur');
  });

  it('12. Perspective Push (ID 40) 3D Depth Push & Tilt', () => {
    const mid = slideTransitionEngine.evaluateTransition('Perspective Push', 0.5);
    expect(mid.outgoingTransform).toContain('perspective(800px)');
    expect(mid.outgoingTransform).toContain('rotateY');
    expect(mid.outgoingTransform).toContain('scale');
    expect(mid.incomingTransform).toContain('perspective(800px)');
    expect(mid.incomingTransform).toContain('rotateY');
    expect(mid.incomingTransform).toContain('scale');
  });

  it('13. Determinism & Timeline Seek Isolation Test', () => {
    const sampleProgress = 0.45;
    const firstEval = slideTransitionEngine.evaluateTransition('Slide Left', sampleProgress);

    for (let i = 0; i < 50; i++) {
      const repeatedEval = slideTransitionEngine.evaluateTransition('Slide Left', sampleProgress);
      expect(repeatedEval.outgoingTransform).toBe(firstEval.outgoingTransform);
      expect(repeatedEval.incomingTransform).toBe(firstEval.incomingTransform);
      expect(repeatedEval.outgoingFilter).toBe(firstEval.outgoingFilter);
    }
  });

  it('14. Structural Differentiation Test Across All 10 Slide Transitions', () => {
    const progressSteps = [0.0, 0.25, 0.5, 0.75, 1.0];
    const presets = Object.keys(SLIDE_TRANSITION_PRESETS);

    const transitionSignatures = presets.map((name) => {
      return progressSteps.map((p) => {
        const res = slideTransitionEngine.evaluateTransition(name, p);
        return `${res.outgoingOpacity.toFixed(2)}_${res.incomingOpacity.toFixed(2)}_${res.outgoingTransform || 'none'}_${res.outgoingFilter || 'none'}`;
      });
    });

    // Verify all 10 slide transitions produce distinct signatures across progress steps
    const uniqueSignatures = new Set(transitionSignatures.map((s) => s.join('|')));
    expect(uniqueSignatures.size).toBe(10);
  });

  it('15. Robustness & Safety Edge-Cases', () => {
    // Negative progress clamps to 0
    const neg = slideTransitionEngine.evaluateTransition('Slide Left', -1.5);
    expect(neg.outgoingOpacity).toBe(1);
    expect(neg.incomingOpacity).toBe(1);

    // Overflow progress clamps to 1
    const over = slideTransitionEngine.evaluateTransition('Slide Left', 3.5);
    expect(over.outgoingOpacity).toBe(1);
    expect(over.incomingOpacity).toBe(1);

    // NaN progress defaults safely
    const nanRes = slideTransitionEngine.evaluateTransition('Slide Left', NaN);
    expect(nanRes.outgoingOpacity).toBe(1);
    expect(nanRes.incomingOpacity).toBe(1);
  });
});
