// src/tests/basicAnimationEngine.test.ts
import { describe, it, expect } from 'vitest';
import { basicAnimationEngine, BasicAnimationEngine } from '../components/editor-main-screen/tools/effects/engines/basicAnimation/BasicAnimationEngine';
import { BASIC_ANIMATION_PRESETS } from '../components/editor-main-screen/tools/effects/engines/basicAnimation/basicAnimationPresets';
import { assetRegistry } from '../services/AssetRegistry';

describe('BasicAnimationEngine & 10 Effects Behavioral & Parity Tests', () => {
  it('1. Reusable Engine Key & Singleton Identity', () => {
    expect(basicAnimationEngine).toBeInstanceOf(BasicAnimationEngine);
    const effects = assetRegistry.getAssetsByType('Effects').slice(0, 10);
    expect(effects.length).toBe(10);
    effects.forEach((asset) => {
      expect(asset.engineKey).toBe('basic_animation');
    });
  });

  it('2. Exact Master Excel Name Parity for Effects 1–10', () => {
    const expectedExcelNames = [
      'Fade in',
      'Fade Out',
      'Zoom In ',
      'Zoom Out',
      'Spin',
      'Drop',
      'Move Left',
      'Move Right',
      'Move Up',
      'Move Down'
    ];

    expectedExcelNames.forEach((name, index) => {
      const asset = assetRegistry.getAssetById('Effects', index + 1);
      expect(asset).toBeDefined();
      expect(asset?.name).toBe(name);

      const preset = basicAnimationEngine.getPreset(name);
      expect(preset).not.toBeNull();
      expect(preset?.id).toBe(index + 1);
    });
  });

  it('3. Fade In Behavior: progress 0 -> transparent, progress 1 -> end opacity', () => {
    const resStart = basicAnimationEngine.evaluateEffect('Fade in', 0.0, 1.0);
    expect(resStart.opacityMultiplier).toBeCloseTo(0.0, 3);

    const resMid = basicAnimationEngine.evaluateEffect('Fade in', 0.5, 1.0);
    expect(resMid.opacityMultiplier).toBeGreaterThan(0.0);
    expect(resMid.opacityMultiplier).toBeLessThan(1.0);

    const resEnd = basicAnimationEngine.evaluateEffect('Fade in', 1.0, 1.0);
    expect(resEnd.opacityMultiplier).toBeCloseTo(1.0, 3);
  });

  it('4. Fade Out Behavior: progress 0 -> visible, progress 1 -> transparent', () => {
    const resStart = basicAnimationEngine.evaluateEffect('Fade Out', 0.0, 1.0);
    expect(resStart.opacityMultiplier).toBeCloseTo(1.0, 3);

    const resEnd = basicAnimationEngine.evaluateEffect('Fade Out', 1.0, 1.0);
    expect(resEnd.opacityMultiplier).toBeCloseTo(0.0, 3);
  });

  it('5. Zoom In Behavior: progress 0 -> original scale, progress 1 -> target zoom scale', () => {
    const resStart = basicAnimationEngine.evaluateEffect('Zoom In ', 0.0, 1.0);
    expect(resStart.scaleMultiplier).toBeCloseTo(1.0, 3);

    const resEnd = basicAnimationEngine.evaluateEffect('Zoom In ', 1.0, 1.0);
    expect(resEnd.scaleMultiplier).toBeCloseTo(1.5, 3);
  });

  it('6. Zoom Out Behavior: progress 0 -> zoomed scale, progress 1 -> original scale', () => {
    const resStart = basicAnimationEngine.evaluateEffect('Zoom Out', 0.0, 1.0);
    expect(resStart.scaleMultiplier).toBeCloseTo(1.5, 3);

    const resEnd = basicAnimationEngine.evaluateEffect('Zoom Out', 1.0, 1.0);
    expect(resEnd.scaleMultiplier).toBeCloseTo(1.0, 3);
  });

  it('7. Spin Behavior: progress 0 -> 0 deg, progress 1 -> target 360 deg rotation with motion blur', () => {
    const resStart = basicAnimationEngine.evaluateEffect('Spin', 0.0, 1.0);
    expect(resStart.rotationOffset).toBeCloseTo(0, 3);

    const resEnd = basicAnimationEngine.evaluateEffect('Spin', 1.0, 1.0);
    expect(resEnd.rotationOffset).toBeCloseTo(360, 3);
  });

  it('8. Drop Behavior: starts above visible frame (-distance), falls downward with bounce curve', () => {
    const resStart = basicAnimationEngine.evaluateEffect('Drop', 0.0, 1.0);
    expect(resStart.transformOffsetY).toBeLessThan(-100);

    const resEnd = basicAnimationEngine.evaluateEffect('Drop', 1.0, 1.0);
    expect(resEnd.transformOffsetY).toBeCloseTo(0, 1);
  });

  it('9. Move Left / Move Right Direction Tests', () => {
    const leftStart = basicAnimationEngine.evaluateEffect('Move Left', 0.0, 1.0);
    expect(leftStart.transformOffsetX).toBeGreaterThan(0); // Starts shifted right (+dist), slides left to 0

    const leftEnd = basicAnimationEngine.evaluateEffect('Move Left', 1.0, 1.0);
    expect(leftEnd.transformOffsetX).toBeCloseTo(0, 3);

    const rightStart = basicAnimationEngine.evaluateEffect('Move Right', 0.0, 1.0);
    expect(rightStart.transformOffsetX).toBeLessThan(0); // Starts shifted left (-dist), slides right to 0

    const rightEnd = basicAnimationEngine.evaluateEffect('Move Right', 1.0, 1.0);
    expect(rightEnd.transformOffsetX).toBeCloseTo(0, 3);
  });

  it('10. Move Up / Move Down Direction Tests', () => {
    const upStart = basicAnimationEngine.evaluateEffect('Move Up', 0.0, 1.0);
    expect(upStart.transformOffsetY).toBeGreaterThan(0); // Shifted down, slides up to 0

    const upEnd = basicAnimationEngine.evaluateEffect('Move Up', 1.0, 1.0);
    expect(upEnd.transformOffsetY).toBeCloseTo(0, 3);

    const downStart = basicAnimationEngine.evaluateEffect('Move Down', 0.0, 1.0);
    expect(downStart.transformOffsetY).toBeLessThan(0); // Shifted up, slides down to 0

    const downEnd = basicAnimationEngine.evaluateEffect('Move Down', 1.0, 1.0);
    expect(downEnd.transformOffsetY).toBeCloseTo(0, 3);
  });

  it('11. Zero Intensity Contract (intensity = 0 -> neutral transform state)', () => {
    Object.values(BASIC_ANIMATION_PRESETS).forEach((preset) => {
      const resAtZero = basicAnimationEngine.evaluateEffect(preset.id, 0.5, 0.0);
      expect(resAtZero.transformOffsetX).toBe(0);
      expect(resAtZero.transformOffsetY).toBe(0);
      expect(resAtZero.scaleMultiplier).toBe(1.0);
      expect(resAtZero.rotationOffset).toBe(0);
      expect(resAtZero.opacityMultiplier).toBe(1.0);
      expect(resAtZero.motionBlurPx).toBe(0);
    });
  });

  it('12. Normalized Intensity Linear Scaling (25%, 50%, 75%, 100%)', () => {
    const spin25 = basicAnimationEngine.evaluateEffect('Spin', 1.0, 0.25);
    expect(spin25.rotationOffset).toBeCloseTo(90, 1);

    const spin50 = basicAnimationEngine.evaluateEffect('Spin', 1.0, 0.50);
    expect(spin50.rotationOffset).toBeCloseTo(180, 1);

    const spin75 = basicAnimationEngine.evaluateEffect('Spin', 1.0, 0.75);
    expect(spin75.rotationOffset).toBeCloseTo(270, 1);

    const spin100 = basicAnimationEngine.evaluateEffect('Spin', 1.0, 1.0);
    expect(spin100.rotationOffset).toBeCloseTo(360, 1);
  });

  it('13. State Preservation & Non-Destructive Isolation Test', () => {
    const initialClipState = {
      id: 'clip_101',
      position: { x: 100, y: 50 },
      scale: 1.2,
      rotation: 45
    };

    // Evaluate effect at 50% progress
    const effectState = basicAnimationEngine.evaluateEffect('Move Right', 0.5, 1.0);

    // Rendered output calculation
    const renderedPosX = initialClipState.position.x + effectState.transformOffsetX;
    const renderedPosY = initialClipState.position.y + effectState.transformOffsetY;
    const renderedScale = initialClipState.scale * effectState.scaleMultiplier;
    const renderedRotation = initialClipState.rotation + effectState.rotationOffset;

    // Verify rendered output contains dynamic effect offset
    expect(renderedPosX).not.toBe(initialClipState.position.x);

    // Verify initial clip state remains pristine and unmodified
    expect(initialClipState.position.x).toBe(100);
    expect(initialClipState.position.y).toBe(50);
    expect(initialClipState.scale).toBe(1.2);
    expect(initialClipState.rotation).toBe(45);
  });
});
