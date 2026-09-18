// src/tests/dissolveTransitionEngine.test.ts
import { describe, it, expect } from 'vitest';
import {
  dissolveTransitionEngine,
  DissolveTransitionEngine,
} from '../components/editor-main-screen/tools/transitions/engines/dissolve/DissolveTransitionEngine';
import { DISSOLVE_TRANSITION_PRESETS } from '../components/editor-main-screen/tools/transitions/engines/dissolve/dissolveTransitionPresets';
import {
  clampProgress,
  easedProgress,
  crossDissolve,
  dipToColor,
} from '../components/editor-main-screen/tools/transitions/engines/dissolve/dissolveTransitionUtils';
import { assetRegistry } from '../services/AssetRegistry';

describe('DissolveTransitionEngine & 10 Transitions Behavioral & Parity Tests', () => {
  it('1. Reusable Engine Key & Singleton Identity', () => {
    expect(dissolveTransitionEngine).toBeInstanceOf(DissolveTransitionEngine);
    const transitions = assetRegistry.getAssetsByType('Transitions').slice(0, 10);
    expect(transitions.length).toBe(10);
    transitions.forEach((asset) => {
      expect(asset.engineKey).toBe('DissolveTransitionEngine');
    });
  });

  it('2. Exact Master Excel Name Parity for Transitions 1–10', () => {
    const expectedExcelNames = [
      'Cross Dissolve',
      'Fade To Black',
      'Fade to Wight',
      'Dip to color',
      'Instant Cut',
      'Smooth Fade',
      'Flash Cut',
      'Soft Dissolve',
      'Blur Disslove',
      'Luma Fade',
    ];

    expectedExcelNames.forEach((name, index) => {
      const asset = assetRegistry.getAssetById('Transitions', index + 1);
      expect(asset).toBeDefined();
      expect(asset?.name).toBe(name);

      const def = dissolveTransitionEngine.getDefinition(name);
      expect(def).toBeDefined();
      expect(def?.id).toBe(index + 1);
    });
  });

  it('3. Cross Dissolve (ID 1) Linear Blend Behavior', () => {
    const start = dissolveTransitionEngine.evaluateTransition('Cross Dissolve', 0.0);
    expect(start.outgoingOpacity).toBeCloseTo(1.0, 3);
    expect(start.incomingOpacity).toBeCloseTo(0.0, 3);

    const mid = dissolveTransitionEngine.evaluateTransition('Cross Dissolve', 0.5);
    expect(mid.outgoingOpacity).toBeCloseTo(0.5, 3);
    expect(mid.incomingOpacity).toBeCloseTo(0.5, 3);

    const end = dissolveTransitionEngine.evaluateTransition('Cross Dissolve', 1.0);
    expect(end.outgoingOpacity).toBeCloseTo(0.0, 3);
    expect(end.incomingOpacity).toBeCloseTo(1.0, 3);
  });

  it('4. Fade To Black (ID 2) Two-Stage Black Hold Behavior', () => {
    const start = dissolveTransitionEngine.evaluateTransition('Fade To Black', 0.0);
    expect(start.outgoingOpacity).toBeCloseTo(1.0, 3);
    expect(start.incomingOpacity).toBeCloseTo(0.0, 3);
    expect(start.overlayOpacity ?? 0).toBeCloseTo(0.0, 3);

    const mid = dissolveTransitionEngine.evaluateTransition('Fade To Black', 0.5);
    expect(mid.outgoingOpacity).toBeCloseTo(0.0, 3);
    expect(mid.incomingOpacity).toBeCloseTo(0.0, 3);
    expect(mid.overlayColor).toBe('rgba(0, 0, 0, 1)');
    expect(mid.overlayOpacity).toBeCloseTo(1.0, 3);

    const end = dissolveTransitionEngine.evaluateTransition('Fade To Black', 1.0);
    expect(end.outgoingOpacity).toBeCloseTo(0.0, 3);
    expect(end.incomingOpacity).toBeCloseTo(1.0, 3);
    expect(end.overlayOpacity ?? 0).toBeCloseTo(0.0, 3);
  });

  it('5. Fade to Wight (ID 3) Two-Stage White Burst Behavior', () => {
    const start = dissolveTransitionEngine.evaluateTransition('Fade to Wight', 0.0);
    expect(start.outgoingOpacity).toBeCloseTo(1.0, 3);
    expect(start.incomingOpacity).toBeCloseTo(0.0, 3);

    const mid = dissolveTransitionEngine.evaluateTransition('Fade to Wight', 0.5);
    expect(mid.outgoingOpacity).toBeCloseTo(0.0, 3);
    expect(mid.incomingOpacity).toBeCloseTo(0.0, 3);
    expect(mid.overlayColor).toBe('rgba(255, 255, 255, 1)');
    expect(mid.overlayOpacity).toBeCloseTo(1.0, 3);

    const end = dissolveTransitionEngine.evaluateTransition('Fade to Wight', 1.0);
    expect(end.incomingOpacity).toBeCloseTo(1.0, 3);
  });

  it('6. Dip to color (ID 4) Solid Color Dip Behavior', () => {
    const mid = dissolveTransitionEngine.evaluateTransition('Dip to color', 0.5);
    expect(mid.overlayColor).toBe('#111827');
    expect(mid.overlayOpacity).toBeCloseTo(1.0, 3);
    expect(mid.outgoingOpacity).toBeCloseTo(0.0, 3);
    expect(mid.incomingOpacity).toBeCloseTo(0.0, 3);
  });

  it('7. Instant Cut (ID 5) Hard Step Cut Behavior (No Fade)', () => {
    const beforeCut = dissolveTransitionEngine.evaluateTransition('Instant Cut', 0.49);
    expect(beforeCut.outgoingOpacity).toBe(1);
    expect(beforeCut.incomingOpacity).toBe(0);

    const afterCut = dissolveTransitionEngine.evaluateTransition('Instant Cut', 0.51);
    expect(afterCut.outgoingOpacity).toBe(0);
    expect(afterCut.incomingOpacity).toBe(1);
  });

  it('8. Smooth Fade (ID 6) Cubic S-Curve Opacity Easing', () => {
    const resQuarter = dissolveTransitionEngine.evaluateTransition('Smooth Fade', 0.25);
    const expectedEased = easedProgress(0.25, 'smoothstep');
    expect(resQuarter.outgoingOpacity).toBeCloseTo(1 - expectedEased, 3);
    expect(resQuarter.incomingOpacity).toBeCloseTo(expectedEased, 3);
  });

  it('9. Flash Cut (ID 7) Light Burst Peak Behavior', () => {
    const mid = dissolveTransitionEngine.evaluateTransition('Flash Cut', 0.5);
    expect(mid.outgoingFilter).toContain('brightness');
    expect(mid.incomingFilter).toContain('brightness');
    expect(mid.overlayColor).toBe('rgba(255, 255, 255, 1)');
  });

  it('10. Soft Dissolve (ID 8) Sine Eased Calm Pacing', () => {
    const mid = dissolveTransitionEngine.evaluateTransition('Soft Dissolve', 0.5);
    expect(mid.outgoingOpacity).toBeCloseTo(0.5, 3);
    expect(mid.incomingOpacity).toBeCloseTo(0.5, 3);
  });

  it('11. Blur Disslove (ID 9) Synchronized Blur & Focus Behavior', () => {
    const quarter = dissolveTransitionEngine.evaluateTransition('Blur Disslove', 0.25);
    expect(quarter.outgoingFilter).toContain('blur');

    const threeQuarters = dissolveTransitionEngine.evaluateTransition('Blur Disslove', 0.75);
    expect(threeQuarters.incomingFilter).toContain('blur');
  });

  it('12. Luma Fade (ID 10) Luminance Threshold Reveal Behavior', () => {
    const mid = dissolveTransitionEngine.evaluateTransition('Luma Fade', 0.5);
    expect(mid.outgoingOpacity).toBeCloseTo(0.5, 3);
    expect(mid.incomingOpacity).toBeCloseTo(0.5, 3);
  });

  it('13. Pixel & Structural Differentiation Test Across All 10 Transitions', () => {
    const progressSteps = [0.0, 0.25, 0.5, 0.75, 1.0];
    const presets = Object.keys(DISSOLVE_TRANSITION_PRESETS);

    const transitionSignatures = presets.map((name) => {
      return progressSteps.map((p) => {
        const res = dissolveTransitionEngine.evaluateTransition(name, p);
        return `${res.outgoingOpacity.toFixed(2)}_${res.incomingOpacity.toFixed(2)}_${res.overlayColor || 'none'}_${res.outgoingFilter || 'none'}`;
      });
    });

    // Verify all 10 transitions produce distinct behavioral profiles across progress steps
    const uniqueSignatures = new Set(transitionSignatures.map((s) => s.join('|')));
    expect(uniqueSignatures.size).toBe(10);
  });

  it('14. Robustness & Safety Edge-Cases', () => {
    // Negative progress clamps to 0
    const neg = dissolveTransitionEngine.evaluateTransition('Cross Dissolve', -1.5);
    expect(neg.outgoingOpacity).toBe(1);
    expect(neg.incomingOpacity).toBe(0);

    // Overflow progress clamps to 1
    const over = dissolveTransitionEngine.evaluateTransition('Cross Dissolve', 3.5);
    expect(over.outgoingOpacity).toBe(0);
    expect(over.incomingOpacity).toBe(1);

    // NaN progress defaults safely
    const nanRes = dissolveTransitionEngine.evaluateTransition('Cross Dissolve', NaN);
    expect(nanRes.outgoingOpacity).toBe(1);
    expect(nanRes.incomingOpacity).toBe(0);
  });
});
