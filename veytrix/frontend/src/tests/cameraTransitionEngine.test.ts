// src/tests/cameraTransitionEngine.test.ts
import { describe, it, expect } from 'vitest';
import {
  cameraTransitionEngine,
  CameraTransitionEngine,
} from '../components/editor-main-screen/tools/transitions/engines/camera/CameraTransitionEngine';
import { CAMERA_TRANSITION_PRESETS } from '../components/editor-main-screen/tools/transitions/engines/camera/cameraTransitionPresets';
import { assetRegistry } from '../services/AssetRegistry';

describe('CameraTransitionEngine & 10 Transitions Behavioral & Parity Tests', () => {
  it('1. Reusable Engine Key & Singleton Identity', () => {
    expect(cameraTransitionEngine).toBeInstanceOf(CameraTransitionEngine);
    const cameraAssets = assetRegistry.getAssetsByType('Transitions').slice(10, 20);
    expect(cameraAssets.length).toBe(10);
    cameraAssets.forEach((asset) => {
      expect(asset.engineKey).toBe('CameraTransitionEngine');
    });
  });

  it('2. Exact Master Excel Name Parity for Transitions 11–20', () => {
    const expectedExcelNames = [
      'Handheld Transition',
      'Camera Shake',
      'Crash Zoom',
      'Snap Zoom',
      'Dolly Zoom',
      'Pull In',
      'Pull Out',
      'Orbit Camera',
      'Whip Pan Left',
      'Whip Pan Right ', // Note exact trailing space from Excel
    ];

    expectedExcelNames.forEach((name, index) => {
      const id = index + 11;
      const asset = assetRegistry.getAssetById('Transitions', id);
      expect(asset).toBeDefined();
      expect(asset?.name).toBe(name);

      const def = cameraTransitionEngine.getDefinition(name);
      expect(def).toBeDefined();
      expect(def?.id).toBe(id);
    });
  });

  it('3. Handheld Transition (ID 11) Deterministic Organic Wobble', () => {
    const mid = cameraTransitionEngine.evaluateTransition('Handheld Transition', 0.5);
    expect(mid.outgoingTransform).toContain('translate');
    expect(mid.outgoingTransform).toContain('rotate');
    expect(mid.outgoingOpacity).toBeCloseTo(0.5, 3);
    expect(mid.incomingOpacity).toBeCloseTo(0.5, 3);
  });

  it('4. Camera Shake (ID 12) Midpoint Peak Vibration & Blur', () => {
    const mid = cameraTransitionEngine.evaluateTransition('Camera Shake', 0.5);
    expect(mid.outgoingTransform).toContain('translate');
    expect(mid.outgoingFilter).toContain('blur');

    const start = cameraTransitionEngine.evaluateTransition('Camera Shake', 0.0);
    expect(start.outgoingFilter).toBe('');
  });

  it('5. Crash Zoom (ID 13) Rapid Scale Surge & Motion Blur', () => {
    const quarter = cameraTransitionEngine.evaluateTransition('Crash Zoom', 0.25);
    expect(quarter.outgoingTransform).toContain('scale');
    expect(quarter.outgoingFilter).toContain('blur');

    const threeQuarter = cameraTransitionEngine.evaluateTransition('Crash Zoom', 0.75);
    expect(threeQuarter.incomingTransform).toContain('scale');
    expect(threeQuarter.incomingFilter).toContain('blur');
  });

  it('6. Snap Zoom (ID 14) Spring Overshoot Bounce Scale', () => {
    const quarter = cameraTransitionEngine.evaluateTransition('Snap Zoom', 0.25);
    expect(quarter.outgoingTransform).toContain('scale');
    expect(quarter.outgoingOpacity).toBe(1);
    expect(quarter.incomingOpacity).toBe(0);

    const threeQuarter = cameraTransitionEngine.evaluateTransition('Snap Zoom', 0.75);
    expect(threeQuarter.incomingTransform).toContain('scale');
    expect(threeQuarter.incomingOpacity).toBe(1);
  });

  it('7. Dolly Zoom (ID 15) Reverse Zoom Perspective Compression', () => {
    const mid = cameraTransitionEngine.evaluateTransition('Dolly Zoom', 0.5);
    expect(mid.outgoingTransform).toContain('perspective(800px)');
    expect(mid.incomingTransform).toContain('perspective(800px)');
    expect(mid.outgoingTransform).toContain('scale');
  });

  it('8. Pull In (ID 16) Forward Scene Travel', () => {
    const mid = cameraTransitionEngine.evaluateTransition('Pull In', 0.5);
    expect(mid.outgoingTransform).toContain('scale');
    expect(mid.incomingTransform).toContain('scale');
  });

  it('9. Pull Out (ID 17) Backward Scene Pull', () => {
    const mid = cameraTransitionEngine.evaluateTransition('Pull Out', 0.5);
    expect(mid.outgoingTransform).toContain('scale');
    expect(mid.incomingTransform).toContain('scale');
  });

  it('10. Orbit Camera (ID 18) 3D Perspective Rotation Orbit', () => {
    const mid = cameraTransitionEngine.evaluateTransition('Orbit Camera', 0.5);
    expect(mid.outgoingTransform).toContain('perspective(1000px)');
    expect(mid.outgoingTransform).toContain('rotateY');
    expect(mid.incomingTransform).toContain('perspective(1000px)');
    expect(mid.incomingTransform).toContain('rotateY');
  });

  it('11. Whip Pan Left (ID 19) Horizontal Left Sweep & Blur', () => {
    const quarter = cameraTransitionEngine.evaluateTransition('Whip Pan Left', 0.25);
    expect(quarter.outgoingTransform).toContain('translate');
    expect(quarter.outgoingTransform).toContain('%');
    expect(quarter.outgoingFilter).toContain('blur');

    const threeQuarter = cameraTransitionEngine.evaluateTransition('Whip Pan Left', 0.75);
    expect(threeQuarter.incomingTransform).toContain('translate');
    expect(threeQuarter.incomingFilter).toContain('blur');
  });

  it('12. Whip Pan Right (ID 20) Horizontal Right Sweep & Blur', () => {
    const quarter = cameraTransitionEngine.evaluateTransition('Whip Pan Right ', 0.25);
    expect(quarter.outgoingTransform).toContain('translate');
    expect(quarter.outgoingTransform).toContain('%');
    expect(quarter.outgoingFilter).toContain('blur');
  });

  it('13. Determinism & Timeline Seek Isolation Test', () => {
    const sampleProgress = 0.375;
    const firstEval = cameraTransitionEngine.evaluateTransition('Handheld Transition', sampleProgress);

    for (let i = 0; i < 50; i++) {
      const repeatedEval = cameraTransitionEngine.evaluateTransition('Handheld Transition', sampleProgress);
      expect(repeatedEval.outgoingTransform).toBe(firstEval.outgoingTransform);
      expect(repeatedEval.incomingTransform).toBe(firstEval.incomingTransform);
      expect(repeatedEval.outgoingFilter).toBe(firstEval.outgoingFilter);
    }
  });

  it('14. Structural Differentiation Test Across All 10 Camera Transitions', () => {
    const progressSteps = [0.0, 0.25, 0.5, 0.75, 1.0];
    const presets = Object.keys(CAMERA_TRANSITION_PRESETS);

    const transitionSignatures = presets.map((name) => {
      return progressSteps.map((p) => {
        const res = cameraTransitionEngine.evaluateTransition(name, p);
        return `${res.outgoingOpacity.toFixed(2)}_${res.incomingOpacity.toFixed(2)}_${res.outgoingTransform || 'none'}_${res.outgoingFilter || 'none'}`;
      });
    });

    // Verify all 10 camera transitions produce distinct signatures across progress steps
    const uniqueSignatures = new Set(transitionSignatures.map((s) => s.join('|')));
    expect(uniqueSignatures.size).toBe(10);
  });

  it('15. Robustness & Safety Edge-Cases', () => {
    // Negative progress clamps to 0
    const neg = cameraTransitionEngine.evaluateTransition('Camera Shake', -1.5);
    expect(neg.outgoingOpacity).toBe(1);
    expect(neg.incomingOpacity).toBe(0);

    // Overflow progress clamps to 1
    const over = cameraTransitionEngine.evaluateTransition('Camera Shake', 3.5);
    expect(over.outgoingOpacity).toBe(0);
    expect(over.incomingOpacity).toBe(1);

    // NaN progress defaults safely
    const nanRes = cameraTransitionEngine.evaluateTransition('Camera Shake', NaN);
    expect(nanRes.outgoingOpacity).toBe(1);
    expect(nanRes.incomingOpacity).toBe(0);
  });
});
