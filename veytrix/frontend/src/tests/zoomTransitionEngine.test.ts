// src/tests/zoomTransitionEngine.test.ts
import { describe, it, expect } from 'vitest';
import {
  zoomTransitionEngine,
  ZoomTransitionEngine,
} from '../components/editor-main-screen/tools/transitions/engines/zoom/ZoomTransitionEngine';
import { ZOOM_TRANSITION_PRESETS } from '../components/editor-main-screen/tools/transitions/engines/zoom/zoomTransitionPresets';
import { assetRegistry } from '../services/AssetRegistry';

describe('ZoomTransitionEngine & 10 Transitions Behavioral & Parity Tests', () => {
  it('1. Reusable Engine Key & Singleton Identity', () => {
    expect(zoomTransitionEngine).toBeInstanceOf(ZoomTransitionEngine);
    const zoomAssets = assetRegistry.getAssetsByType('Transitions').slice(20, 30);
    expect(zoomAssets.length).toBe(10);
    zoomAssets.forEach((asset) => {
      expect(asset.engineKey).toBe('ZoomTransitionEngine');
    });
  });

  it('2. Exact Master Excel Name Parity for Transitions 21–30', () => {
    const expectedExcelNames = [
      'Zoom In',
      'Zoom Out',
      'Hyper Zoom',
      'Elastic Zoom',
      'Bounce Zoom',
      'Pulse Zoom',
      'Center Zoom',
      'Corner Zoom',
      'Radial Zoom',
      'Velocity Zoom',
    ];

    expectedExcelNames.forEach((name, index) => {
      const id = index + 21;
      const asset = assetRegistry.getAssetById('Transitions', id);
      expect(asset).toBeDefined();
      expect(asset?.name).toBe(name);

      const def = zoomTransitionEngine.getDefinition(name);
      expect(def).toBeDefined();
      expect(def?.id).toBe(id);
    });
  });

  it('3. Zoom In (ID 21) Scale Enlargement Behavior', () => {
    const quarter = zoomTransitionEngine.evaluateTransition('Zoom In', 0.25);
    expect(quarter.outgoingTransform).toContain('scale');
    expect(quarter.outgoingTransformOrigin).toBe('50.0% 50.0%');

    const threeQuarter = zoomTransitionEngine.evaluateTransition('Zoom In', 0.75);
    expect(threeQuarter.incomingTransform).toContain('scale');
    expect(threeQuarter.incomingOpacity).toBeGreaterThan(0);
  });

  it('4. Zoom Out (ID 22) Scale Shrink Behavior', () => {
    const quarter = zoomTransitionEngine.evaluateTransition('Zoom Out', 0.25);
    expect(quarter.outgoingTransform).toContain('scale');
    expect(quarter.outgoingTransformOrigin).toBe('50.0% 50.0%');

    const threeQuarter = zoomTransitionEngine.evaluateTransition('Zoom Out', 0.75);
    expect(threeQuarter.incomingTransform).toContain('scale');
  });

  it('5. Hyper Zoom (ID 23) Ultra-Fast Surge & Heavy Motion Blur', () => {
    const mid = zoomTransitionEngine.evaluateTransition('Hyper Zoom', 0.5);
    expect(mid.outgoingFilter).toContain('blur');

    const quarter = zoomTransitionEngine.evaluateTransition('Hyper Zoom', 0.25);
    expect(quarter.outgoingTransform).toContain('scale');
  });

  it('6. Elastic Zoom (ID 24) Spring Elastic Scale Oscillation', () => {
    const quarter = zoomTransitionEngine.evaluateTransition('Elastic Zoom', 0.25);
    expect(quarter.outgoingTransform).toContain('scale');

    const threeQuarter = zoomTransitionEngine.evaluateTransition('Elastic Zoom', 0.75);
    expect(threeQuarter.incomingTransform).toContain('scale');
  });

  it('7. Bounce Zoom (ID 25) Damped Micro Bounce Oscillations', () => {
    const quarter = zoomTransitionEngine.evaluateTransition('Bounce Zoom', 0.25);
    expect(quarter.outgoingTransform).toContain('scale');

    const threeQuarter = zoomTransitionEngine.evaluateTransition('Bounce Zoom', 0.75);
    expect(threeQuarter.incomingTransform).toContain('scale');
  });

  it('8. Pulse Zoom (ID 26) Rhythmic Scale Pulses', () => {
    const quarter = zoomTransitionEngine.evaluateTransition('Pulse Zoom', 0.25);
    expect(quarter.outgoingTransform).toContain('scale');
    expect(quarter.incomingTransform).toContain('scale');
  });


  it('9. Center Zoom (ID 27) Pure Frame-Center Anchored Zoom', () => {
    const mid = zoomTransitionEngine.evaluateTransition('Center Zoom', 0.5);
    expect(mid.outgoingTransformOrigin).toBe('50.0% 50.0%');
    expect(mid.incomingTransformOrigin).toBe('50.0% 50.0%');
    expect(mid.outgoingTransform).toContain('scale');
  });

  it('10. Corner Zoom (ID 28) Screen Corner Focal Anchor', () => {
    const quarter = zoomTransitionEngine.evaluateTransition('Corner Zoom', 0.25);
    expect(quarter.outgoingTransformOrigin).toBe('0.0% 0.0%');
    expect(quarter.outgoingTransform).toContain('scale');
  });

  it('11. Radial Zoom (ID 29) Center Zoom with Defocus Blur', () => {
    const mid = zoomTransitionEngine.evaluateTransition('Radial Zoom', 0.5);
    expect(mid.outgoingFilter).toContain('blur');
    expect(mid.outgoingTransform).toContain('scale');
  });

  it('12. Velocity Zoom (ID 30) Cubic Acceleration Velocity Curve', () => {
    const mid = zoomTransitionEngine.evaluateTransition('Velocity Zoom', 0.5);
    expect(mid.outgoingFilter).toContain('blur');
    expect(mid.outgoingTransform).toContain('scale');
  });

  it('13. Determinism & Timeline Seek Isolation Test', () => {
    const sampleProgress = 0.42;
    const firstEval = zoomTransitionEngine.evaluateTransition('Hyper Zoom', sampleProgress);

    for (let i = 0; i < 50; i++) {
      const repeatedEval = zoomTransitionEngine.evaluateTransition('Hyper Zoom', sampleProgress);
      expect(repeatedEval.outgoingTransform).toBe(firstEval.outgoingTransform);
      expect(repeatedEval.incomingTransform).toBe(firstEval.incomingTransform);
      expect(repeatedEval.outgoingFilter).toBe(firstEval.outgoingFilter);
    }
  });

  it('14. Structural Differentiation Test Across All 10 Zoom Transitions', () => {
    const progressSteps = [0.0, 0.25, 0.5, 0.75, 1.0];
    const presets = Object.keys(ZOOM_TRANSITION_PRESETS);

    const transitionSignatures = presets.map((name) => {
      return progressSteps.map((p) => {
        const res = zoomTransitionEngine.evaluateTransition(name, p);
        return `${res.outgoingOpacity.toFixed(2)}_${res.incomingOpacity.toFixed(2)}_${res.outgoingTransform || 'none'}_${res.outgoingTransformOrigin || 'none'}_${res.outgoingFilter || 'none'}`;
      });
    });

    // Verify all 10 zoom transitions produce distinct signatures across progress steps
    const uniqueSignatures = new Set(transitionSignatures.map((s) => s.join('|')));
    expect(uniqueSignatures.size).toBe(10);
  });

  it('15. Robustness & Safety Edge-Cases', () => {
    // Negative progress clamps to 0
    const neg = zoomTransitionEngine.evaluateTransition('Zoom In', -1.5);
    expect(neg.outgoingOpacity).toBe(1);
    expect(neg.incomingOpacity).toBe(0);

    // Overflow progress clamps to 1
    const over = zoomTransitionEngine.evaluateTransition('Zoom In', 3.5);
    expect(over.outgoingOpacity).toBe(0);
    expect(over.incomingOpacity).toBe(1);

    // NaN progress defaults safely
    const nanRes = zoomTransitionEngine.evaluateTransition('Zoom In', NaN);
    expect(nanRes.outgoingOpacity).toBe(1);
    expect(nanRes.incomingOpacity).toBe(0);
  });
});
