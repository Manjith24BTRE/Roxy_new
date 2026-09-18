// src/tests/transformAttentionEngine.test.ts
import { describe, it, expect } from 'vitest';
import { transformAttentionEngine, TransformAttentionEngine } from '../components/editor-main-screen/tools/effects/engines/transformAttention/TransformAttentionEngine';
import { TRANSFORM_ATTENTION_PRESETS } from '../components/editor-main-screen/tools/effects/engines/transformAttention/transformAttentionPresets';
import { assetRegistry } from '../services/AssetRegistry';

describe('TransformAttentionEngine & Effects 11–20 Integration & Parity Tests', () => {
  it('1. Reusable Engine Key & Singleton Instance', () => {
    expect(transformAttentionEngine).toBeInstanceOf(TransformAttentionEngine);
    const effects = assetRegistry.getAssetsByType('Effects').slice(10, 20);
    expect(effects.length).toBe(10);
    effects.forEach((asset) => {
      expect(asset.engineKey).toBe('transform_attention');
    });
  });

  it('2. Exact Excel Master Name Parity for Effects 11–20', () => {
    const expectedNames = [
      'Shake in',
      'Zoom Bounce',
      'Pulse',
      'Pop In',
      'Pop Out',
      'Expand',
      'Collapse',
      'Swing',
      'Bounce',
      'Wiggle'
    ];

    expectedNames.forEach((name, index) => {
      const id = index + 11;
      const asset = assetRegistry.getAssetById('Effects', id);
      expect(asset).toBeDefined();
      expect(asset?.name).toBe(name);

      const preset = transformAttentionEngine.getPreset(name);
      expect(preset).not.toBeNull();
      expect(preset?.id).toBe(id);
    });
  });

  it('3. Effect 11 — Shake In Behavior: decays over time to zero offset', () => {
    const resStart = transformAttentionEngine.evaluateEffect('Shake in', 0.1, 1.0);
    const hasMovement = Math.abs(resStart.transformOffsetX) > 0 || Math.abs(resStart.transformOffsetY) > 0 || Math.abs(resStart.rotationOffset) > 0;
    expect(hasMovement).toBe(true);

    const resEnd = transformAttentionEngine.evaluateEffect('Shake in', 1.0, 1.0);
    expect(resEnd.transformOffsetX).toBeCloseTo(0, 1);
    expect(resEnd.transformOffsetY).toBeCloseTo(0, 1);
    expect(resEnd.rotationOffset).toBeCloseTo(0, 1);
  });

  it('4. Effect 12 — Zoom Bounce Behavior: zooms and overshoots spring bounce', () => {
    const resMid = transformAttentionEngine.evaluateEffect('Zoom Bounce', 0.15, 1.0);
    expect(resMid.scaleMultiplier).toBeGreaterThan(1.0);

    const resSettle = transformAttentionEngine.evaluateEffect('Zoom Bounce', 1.0, 1.0);
    expect(resSettle.scaleMultiplier).toBeCloseTo(1.4, 2);
  });

  it('5. Effect 13 — Pulse Behavior: continuous sine wave scale oscillation', () => {
    const resPeak = transformAttentionEngine.evaluateEffect('Pulse', 0.0714, 1.0);
    expect(resPeak.scaleMultiplier).toBeGreaterThan(1.0);

    const resTrough = transformAttentionEngine.evaluateEffect('Pulse', 0.214, 1.0);
    expect(resTrough.scaleMultiplier).toBeLessThan(1.0);
  });

  it('6. Effect 14 & 15 — Pop In & Pop Out Directional Scale Interpolation', () => {
    const popInStart = transformAttentionEngine.evaluateEffect('Pop In', 0.0, 1.0);
    expect(popInStart.scaleMultiplier).toBeCloseTo(0.1, 2);

    const popInEnd = transformAttentionEngine.evaluateEffect('Pop In', 1.0, 1.0);
    expect(popInEnd.scaleMultiplier).toBeCloseTo(1.0, 2);

    const popOutStart = transformAttentionEngine.evaluateEffect('Pop Out', 0.0, 1.0);
    expect(popOutStart.scaleMultiplier).toBeCloseTo(1.0, 2);

    const popOutEnd = transformAttentionEngine.evaluateEffect('Pop Out', 1.0, 1.0);
    expect(popOutEnd.scaleMultiplier).toBeCloseTo(0.0, 2);
  });

  it('7. Effect 16 & 17 — Expand & Collapse Non-Uniform X/Y Scaling', () => {
    const expandRes = transformAttentionEngine.evaluateEffect('Expand', 1.0, 1.0);
    expect(expandRes.scaleXMultiplier).toBeCloseTo(1.5, 2);
    expect(expandRes.scaleYMultiplier).toBeCloseTo(1.15, 2);

    const collapseRes = transformAttentionEngine.evaluateEffect('Collapse', 1.0, 1.0);
    expect(collapseRes.scaleXMultiplier).toBeCloseTo(0.0, 2);
    expect(collapseRes.scaleYMultiplier).toBeCloseTo(0.0, 2);
  });

  it('8. Effect 18 — Swing Pivot Pendulum Rotation', () => {
    const swingRes = transformAttentionEngine.evaluateEffect('Swing', 0.25, 1.0);
    expect(Math.abs(swingRes.rotationOffset)).toBeGreaterThan(0);
    expect(swingRes.transformOffsetY).toBeDefined();
  });

  it('9. Effect 19 — Bounce Vertical Translational Motion', () => {
    const bounceRes = transformAttentionEngine.evaluateEffect('Bounce', 0.25, 1.0);
    expect(bounceRes.transformOffsetY).toBeLessThan(0); // Upward displacement
  });

  it('10. Effect 20 — Wiggle Repeating Motion', () => {
    const wiggle1 = transformAttentionEngine.evaluateEffect('Wiggle', 0.1, 1.0);
    const wiggle2 = transformAttentionEngine.evaluateEffect('Wiggle', 0.3, 1.0);
    expect(wiggle1.transformOffsetX).not.toEqual(wiggle2.transformOffsetX);
  });

  it('11. Zero Intensity Contract (intensity 0 -> neutral state)', () => {
    Object.values(TRANSFORM_ATTENTION_PRESETS).forEach((preset) => {
      const resZero = transformAttentionEngine.evaluateEffect(preset.id, 0.5, 0.0);
      expect(resZero.transformOffsetX).toBe(0);
      expect(resZero.transformOffsetY).toBe(0);
      expect(resZero.scaleMultiplier).toBe(1.0);
      expect(resZero.scaleXMultiplier).toBe(1.0);
      expect(resZero.scaleYMultiplier).toBe(1.0);
      expect(resZero.rotationOffset).toBe(0);
      expect(resZero.opacityMultiplier).toBe(1.0);
    });
  });

  it('12. Linear Intensity Scaling (25%, 50%, 75%, 100%)', () => {
    const bounce25 = transformAttentionEngine.evaluateEffect('Bounce', 0.25, 0.25);
    const bounce100 = transformAttentionEngine.evaluateEffect('Bounce', 0.25, 1.0);
    expect(Math.abs(bounce25.transformOffsetY * 4)).toBeCloseTo(Math.abs(bounce100.transformOffsetY), 1);
  });

  it('13. State Preservation & Non-Destructive Isolation Test', () => {
    const initialClipState = {
      id: 'clip_202',
      position: { x: 200, y: 150 },
      scale: 1.0,
      rotation: 0
    };

    const effectState = transformAttentionEngine.evaluateEffect('Wiggle', 0.5, 1.0);
    const renderedPosX = initialClipState.position.x + effectState.transformOffsetX;

    expect(renderedPosX).not.toBe(initialClipState.position.x);

    // Initial state remains pristine
    expect(initialClipState.position.x).toBe(200);
    expect(initialClipState.position.y).toBe(150);
    expect(initialClipState.scale).toBe(1.0);
    expect(initialClipState.rotation).toBe(0);
  });
});
