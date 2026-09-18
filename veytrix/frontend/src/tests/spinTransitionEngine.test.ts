// src/tests/spinTransitionEngine.test.ts
import { describe, it, expect } from 'vitest';
import {
  spinTransitionEngine,
  SpinTransitionEngine,
} from '../components/editor-main-screen/tools/transitions/engines/spin/SpinTransitionEngine';
import { SPIN_TRANSITION_PRESETS } from '../components/editor-main-screen/tools/transitions/engines/spin/spinTransitionPresets';
import { assetRegistry } from '../services/AssetRegistry';

describe('SpinTransitionEngine & 10 Transitions Behavioral & Parity Tests', () => {
  it('1. Reusable Engine Key & Singleton Identity', () => {
    expect(spinTransitionEngine).toBeInstanceOf(SpinTransitionEngine);
    const spinAssets = assetRegistry.getAssetsByType('Transitions').slice(40, 50);
    expect(spinAssets.length).toBe(10);
    spinAssets.forEach((asset) => {
      expect(asset.engineKey).toBe('SpinTransitionEngine');
    });
  });

  it('2. Exact Master Excel Name Parity for Transitions 41–50', () => {
    const expectedExcelNames = [
      'Spin Left',
      'Spin Right',
      '360 Rotate',
      '3D Flip',
      'Page Flip',
      'Barrel Roll',
      'Twist Rotate',
      'Helix Spin',
      'Cylinder Rotate',
      'Portal SPin', // Exact Excel spelling (capital 'P' in SPin)
    ];

    expectedExcelNames.forEach((name, index) => {
      const id = index + 41;
      const asset = assetRegistry.getAssetById('Transitions', id);
      expect(asset).toBeDefined();
      expect(asset?.name).toBe(name);

      const def = spinTransitionEngine.getDefinition(name);
      expect(def).toBeDefined();
      expect(def?.id).toBe(id);
    });
  });

  it('3. Spin Left (ID 41) Counterclockwise Rotation', () => {
    const half = spinTransitionEngine.evaluateTransition('Spin Left', 0.5);
    expect(half.outgoingTransform).toContain('rotate(');
    expect(half.outgoingTransform).toContain('-90');
    expect(half.outgoingFilter).toContain('blur');

    const end = spinTransitionEngine.evaluateTransition('Spin Left', 1.0);
    expect(end.outgoingTransform).toContain('-180');
  });

  it('4. Spin Right (ID 42) Clockwise Rotation', () => {
    const half = spinTransitionEngine.evaluateTransition('Spin Right', 0.5);
    expect(half.outgoingTransform).toContain('rotate(');
    expect(half.outgoingTransform).toContain('90');
    expect(half.outgoingFilter).toContain('blur');

    const end = spinTransitionEngine.evaluateTransition('Spin Right', 1.0);
    expect(end.outgoingTransform).toContain('180');
  });

  it('5. 360 Rotate (ID 43) Full 360 Degree Turn & Edge-Safe Scale', () => {
    const half = spinTransitionEngine.evaluateTransition('360 Rotate', 0.5);
    expect(half.outgoingTransform).toContain('rotate(');
    expect(half.outgoingTransform).toContain('180'); // Midpoint 180°
    expect(half.outgoingTransform).toContain('scale('); // Edge-safe scaling up

    const end = spinTransitionEngine.evaluateTransition('360 Rotate', 1.0);
    expect(end.outgoingTransform).toContain('360'); // Full 360° rotation
  });

  it('6. 3D Flip (ID 44) 3D Y-Axis Flip & Perspective', () => {
    const q1 = spinTransitionEngine.evaluateTransition('3D Flip', 0.25);
    expect(q1.outgoingOpacity).toBe(1);
    expect(q1.incomingOpacity).toBe(0);
    expect(q1.outgoingTransform).toContain('perspective(800px)');
    expect(q1.outgoingTransform).toContain('rotateY(');

    const q3 = spinTransitionEngine.evaluateTransition('3D Flip', 0.75);
    expect(q3.outgoingOpacity).toBe(0);
    expect(q3.incomingOpacity).toBe(1);
    expect(q3.incomingTransform).toContain('rotateY(');
  });

  it('7. Page Flip (ID 45) Left-Anchored Page Turn', () => {
    const q1 = spinTransitionEngine.evaluateTransition('Page Flip', 0.25);
    expect(q1.outgoingTransformOrigin).toBe('left center');
    expect(q1.outgoingTransform).toContain('perspective(1000px)');
    expect(q1.outgoingTransform).toContain('rotateY(');
    expect(q1.outgoingOpacity).toBe(1);

    const q3 = spinTransitionEngine.evaluateTransition('Page Flip', 0.75);
    expect(q3.incomingTransformOrigin).toBe('left center');
    expect(q3.incomingOpacity).toBe(1);
  });

  it('8. Barrel Roll (ID 46) Full Aircraft Z-Roll with Scale Dip', () => {
    const mid = spinTransitionEngine.evaluateTransition('Barrel Roll', 0.5);
    expect(mid.outgoingTransform).toContain('rotate(');
    expect(mid.outgoingTransform).toContain('180');
    expect(mid.outgoingTransform).toContain('scale(0.75'); // Roll distance flight dip
    expect(mid.outgoingFilter).toContain('blur');
  });

  it('9. Twist Rotate (ID 47) Spiral Squeeze & Twist Unwind', () => {
    const mid = spinTransitionEngine.evaluateTransition('Twist Rotate', 0.5);
    expect(mid.outgoingTransform).toContain('rotate(');
    expect(mid.outgoingTransform).toContain('scale(0.40'); // Twist core squeeze
    expect(mid.outgoingFilter).toContain('blur');
  });

  it('10. Helix Spin (ID 48) 3D Spiral Spin', () => {
    const mid = spinTransitionEngine.evaluateTransition('Helix Spin', 0.5);
    expect(mid.outgoingTransform).toContain('perspective(800px)');
    expect(mid.outgoingTransform).toContain('rotate3d(');
    expect(mid.outgoingTransform).toContain('scale(');
  });

  it('11. Cylinder Rotate (ID 49) Cylindrical Surface Roll & Shift', () => {
    const mid = spinTransitionEngine.evaluateTransition('Cylinder Rotate', 0.5);
    expect(mid.outgoingTransform).toContain('perspective(1200px)');
    expect(mid.outgoingTransform).toContain('translateX(');
    expect(mid.outgoingTransform).toContain('rotateY(');
  });

  it('12. Portal SPin (ID 50) Collapse & Expansion Spin', () => {
    const q1 = spinTransitionEngine.evaluateTransition('Portal SPin', 0.25);
    expect(q1.outgoingOpacity).toBe(1);
    expect(q1.incomingOpacity).toBe(0);
    expect(q1.outgoingTransform).toContain('perspective(600px)');
    expect(q1.outgoingTransform).toContain('rotate(');

    const q3 = spinTransitionEngine.evaluateTransition('Portal SPin', 0.75);
    expect(q3.outgoingOpacity).toBe(0);
    expect(q3.incomingOpacity).toBe(1);
    expect(q3.incomingTransform).toContain('rotate(');
  });

  it('13. Determinism & Timeline Seek Isolation Test', () => {
    const sampleProgress = 0.45;
    const firstEval = spinTransitionEngine.evaluateTransition('Spin Left', sampleProgress);

    for (let i = 0; i < 50; i++) {
      const repeatedEval = spinTransitionEngine.evaluateTransition('Spin Left', sampleProgress);
      expect(repeatedEval.outgoingTransform).toBe(firstEval.outgoingTransform);
      expect(repeatedEval.incomingTransform).toBe(firstEval.incomingTransform);
      expect(repeatedEval.outgoingFilter).toBe(firstEval.outgoingFilter);
    }
  });

  it('14. Structural Differentiation Test Across All 10 Spin Transitions', () => {
    const progressSteps = [0.0, 0.25, 0.5, 0.75, 1.0];
    const presets = [
      'Spin Left',
      'Spin Right',
      '360 Rotate',
      '3D Flip',
      'Page Flip',
      'Barrel Roll',
      'Twist Rotate',
      'Helix Spin',
      'Cylinder Rotate',
      'Portal SPin',
    ];

    const transitionSignatures = presets.map((name) => {
      return progressSteps.map((p) => {
        const res = spinTransitionEngine.evaluateTransition(name, p);
        return `${res.outgoingOpacity.toFixed(2)}_${res.incomingOpacity.toFixed(2)}_${res.outgoingTransform || 'none'}_${res.outgoingFilter || 'none'}`;
      });
    });

    // Verify all 10 spin transitions produce distinct signatures across progress steps
    const uniqueSignatures = new Set(transitionSignatures.map((s) => s.join('|')));
    expect(uniqueSignatures.size).toBe(10);
  });

  it('15. Robustness & Safety Edge-Cases', () => {
    // Negative progress clamps to 0
    const neg = spinTransitionEngine.evaluateTransition('Spin Left', -1.5);
    expect(neg.outgoingOpacity).toBe(1);
    expect(neg.incomingOpacity).toBe(0);

    // Overflow progress clamps to 1
    const over = spinTransitionEngine.evaluateTransition('Spin Left', 3.5);
    expect(over.outgoingOpacity).toBe(0);
    expect(over.incomingOpacity).toBe(1);

    // NaN progress defaults safely
    const nanRes = spinTransitionEngine.evaluateTransition('Spin Left', NaN);
    expect(nanRes.outgoingOpacity).toBe(1);
    expect(nanRes.incomingOpacity).toBe(0);
  });
});
