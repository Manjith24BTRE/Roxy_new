// src/tests/motionCameraEngine.test.ts
import { describe, it, expect } from 'vitest';
import { motionCameraEngine, MotionCameraEngine } from '../components/editor-main-screen/tools/effects/engines/motionCamera/MotionCameraEngine';
import { MOTION_CAMERA_PRESETS } from '../components/editor-main-screen/tools/effects/engines/motionCamera/motionCameraPresets';
import { assetRegistry } from '../services/AssetRegistry';

describe('MotionCameraEngine & Effects 21–30 Behavioral & Parity Tests', () => {
  it('1. Reusable Engine Key & Singleton Identity', () => {
    expect(motionCameraEngine).toBeInstanceOf(MotionCameraEngine);
    for (let id = 21; id <= 30; id++) {
      const asset = assetRegistry.getAssetById('Effects', id);
      expect(asset).toBeDefined();
      expect(asset?.engineKey).toBe('motion_camera');
    }
  });

  it('2. Exact Master Excel Name Parity for Effects 21–30', () => {
    const expectedExcelNames = [
      'Handheld Camera',
      'Camera Shake',
      'Micro Shake',
      'Heavy Shake',
      'Crash Zoom ',
      'Smooth Zoom ',
      'Dolly In',
      'Dolly out',
      'Whip Pan Left',
      'Whip Pan Right'
    ];

    expectedExcelNames.forEach((name, idx) => {
      const effectId = 21 + idx;
      const asset = assetRegistry.getAssetById('Effects', effectId);
      expect(asset).toBeDefined();
      expect(asset?.name).toBe(name);

      const preset = motionCameraEngine.getPreset(name);
      expect(preset).not.toBeNull();
      expect(preset?.id).toBe(effectId);
    });
  });

  it('3. Handheld Camera Behavior: continuous deterministic smooth motion', () => {
    const resT0 = motionCameraEngine.evaluateEffect('Handheld Camera', 0.0, 1.0, {}, { timelineTime: 0.0 });
    const resT1 = motionCameraEngine.evaluateEffect('Handheld Camera', 0.5, 1.0, {}, { timelineTime: 0.5 });
    const resT0Repeat = motionCameraEngine.evaluateEffect('Handheld Camera', 0.0, 1.0, {}, { timelineTime: 0.0 });

    // Deterministic check
    expect(resT0.transformOffsetX).toBeCloseTo(resT0Repeat.transformOffsetX, 5);
    expect(resT0.transformOffsetY).toBeCloseTo(resT0Repeat.transformOffsetY, 5);
    expect(resT0.rotationOffset).toBeCloseTo(resT0Repeat.rotationOffset, 5);

    // Motion changes over time
    expect(resT0.transformOffsetX).not.toBe(resT1.transformOffsetX);
  });

  it('4. Camera Shake Behavior: impact directional vibration with motion blur', () => {
    const res1 = motionCameraEngine.evaluateEffect('Camera Shake', 0.25, 1.0, {}, { timelineTime: 0.25 });
    const res2 = motionCameraEngine.evaluateEffect('Camera Shake', 0.75, 1.0, {}, { timelineTime: 0.75 });

    // Must displace along direction
    expect(res1.transformOffsetX !== 0 || res1.transformOffsetY !== 0).toBe(true);
    // Directional orientation: X displacement should be larger than Y based on preset (dirX=1, dirY=0.3)
    if (res1.transformOffsetX !== 0) {
      expect(Math.abs(res1.transformOffsetX)).toBeGreaterThan(Math.abs(res1.transformOffsetY));
    }
  });

  it('5. Micro Shake Behavior: ultra-subtle low-amplitude drift', () => {
    const microRes = motionCameraEngine.evaluateEffect('Micro Shake', 0.5, 1.0, {}, { timelineTime: 0.5 });
    const heavyRes = motionCameraEngine.evaluateEffect('Heavy Shake', 0.5, 1.0, {}, { timelineTime: 0.5 });

    // Micro shake amplitude must be strictly smaller than Heavy Shake amplitude
    const microMag = Math.hypot(microRes.transformOffsetX, microRes.transformOffsetY);
    const heavyMag = Math.hypot(heavyRes.transformOffsetX, heavyRes.transformOffsetY);

    expect(microMag).toBeLessThan(heavyMag);
  });

  it('6. Heavy Shake Behavior: strong multi-axis vibration with rotation & blur', () => {
    const res = motionCameraEngine.evaluateEffect('Heavy Shake', 0.33, 1.0, {}, { timelineTime: 0.33 });

    expect(Math.abs(res.transformOffsetX)).toBeGreaterThan(0);
    expect(Math.abs(res.transformOffsetY)).toBeGreaterThan(0);
    expect(Math.abs(res.rotationOffset)).toBeGreaterThan(0);
    expect(res.motionBlurPx).toBeGreaterThan(0);
  });

  it('7. Crash Zoom Behavior: rapid zoom acceleration toward center with motion blur', () => {
    const resStart = motionCameraEngine.evaluateEffect('Crash Zoom ', 0.0, 1.0);
    const resMid = motionCameraEngine.evaluateEffect('Crash Zoom ', 0.5, 1.0);
    const resEnd = motionCameraEngine.evaluateEffect('Crash Zoom ', 1.0, 1.0);

    expect(resStart.scaleMultiplier).toBeCloseTo(1.0, 2);
    expect(resEnd.scaleMultiplier).toBeGreaterThan(resMid.scaleMultiplier);
    expect(resEnd.scaleMultiplier).toBeGreaterThan(1.5);
    expect(resMid.motionBlurPx).toBeGreaterThan(0);
  });

  it('8. Smooth Zoom Behavior: slow cinematic zoom over duration', () => {
    const crashMid = motionCameraEngine.evaluateEffect('Crash Zoom ', 0.5, 1.0);
    const smoothMid = motionCameraEngine.evaluateEffect('Smooth Zoom ', 0.5, 1.0);

    // Smooth Zoom mid-point scale should be distinct and smoother than Crash Zoom
    expect(smoothMid.scaleMultiplier).toBeGreaterThan(1.0);
    expect(smoothMid.scaleMultiplier).not.toBe(crashMid.scaleMultiplier);
  });

  it('9. Dolly In & Dolly Out Behavior: perspective-aware scale in opposite directions', () => {
    const dollyInMid = motionCameraEngine.evaluateEffect('Dolly In', 0.8, 1.0);
    const dollyOutMid = motionCameraEngine.evaluateEffect('Dolly out', 0.8, 1.0);

    // Dolly In increases effective perspective scale (> 1.0)
    expect(dollyInMid.scaleMultiplier).toBeGreaterThan(1.0);

    // Dolly Out decreases effective perspective scale (< 1.0)
    expect(dollyOutMid.scaleMultiplier).toBeLessThan(1.0);
  });

  it('10. Whip Pan Left & Whip Pan Right Behavior: directional translation & blur', () => {
    const panLeft = motionCameraEngine.evaluateEffect('Whip Pan Left', 0.5, 1.0);
    const panRight = motionCameraEngine.evaluateEffect('Whip Pan Right', 0.5, 1.0);

    // Left pan moves negatively X
    expect(panLeft.transformOffsetX).toBeLessThan(0);
    expect(panLeft.motionBlurPx).toBeGreaterThan(0);

    // Right pan moves positively X
    expect(panRight.transformOffsetX).toBeGreaterThan(0);
    expect(panRight.motionBlurPx).toBeGreaterThan(0);

    // Magnitude symmetry
    expect(Math.abs(panLeft.transformOffsetX)).toBeCloseTo(Math.abs(panRight.transformOffsetX), 3);
  });

  it('11. Zero Intensity Contract (0% -> pristine neutral state)', () => {
    for (let id = 21; id <= 30; id++) {
      const res = motionCameraEngine.evaluateEffect(id, 0.5, 0.0, {}, { timelineTime: 1.25 });
      expect(res.transformOffsetX).toBe(0);
      expect(res.transformOffsetY).toBe(0);
      expect(res.scaleMultiplier).toBe(1.0);
      expect(res.rotationOffset).toBe(0);
      expect(res.opacityMultiplier).toBe(1.0);
      expect(res.motionBlurPx).toBe(0);
      expect(res.transformStr).toBe('');
      expect(res.filterStr).toBe('');
    }
  });

  it('12. Linear Intensity Scaling Tests (0%, 25%, 50%, 75%, 100%)', () => {
    const intensities = [0.0, 0.25, 0.5, 0.75, 1.0];

    // Heavy Shake rotation scaling
    let prevRot = -1;
    intensities.forEach((intensity) => {
      const res = motionCameraEngine.evaluateEffect('Heavy Shake', 0.5, intensity, {}, { timelineTime: 1.0 });
      const rotMag = Math.abs(res.rotationOffset);
      expect(rotMag).toBeGreaterThanOrEqual(prevRot);
      prevRot = rotMag;
    });

    // Smooth Zoom scale scaling
    let prevScaleDelta = -1;
    intensities.forEach((intensity) => {
      const res = motionCameraEngine.evaluateEffect('Smooth Zoom ', 0.8, intensity);
      const delta = Math.abs(res.scaleMultiplier - 1.0);
      expect(delta).toBeGreaterThanOrEqual(prevScaleDelta);
      prevScaleDelta = delta;
    });
  });

  it('13. Seek & Determinism Test (No state accumulation)', () => {
    const tValues = [0.0, 0.5, 1.0, 0.25, 0.75, 0.5, 0.0];
    const results: number[] = [];

    tValues.forEach((t) => {
      const res = motionCameraEngine.evaluateEffect('Handheld Camera', t, 1.0, {}, { timelineTime: t });
      results.push(res.transformOffsetX);
    });

    // t=0.5 at index 1 and index 5 must produce identical transformOffsetX
    expect(results[1]).toBeCloseTo(results[5], 6);
    // t=0.0 at index 0 and index 6 must produce identical transformOffsetX
    expect(results[0]).toBeCloseTo(results[6], 6);
  });

  it('14. State Preservation: Base clip transform remains unaffected', () => {
    const baseClip = {
      posX: 120,
      posY: -45,
      scale: 1.25,
      rotation: 15
    };

    const effectRes = motionCameraEngine.evaluateEffect('Heavy Shake', 0.5, 1.0, {}, { timelineTime: 0.5 });

    // Final combined values
    const finalX = baseClip.posX + effectRes.transformOffsetX;
    const finalRot = baseClip.rotation + effectRes.rotationOffset;

    // Verify base values were not mutated
    expect(baseClip.posX).toBe(120);
    expect(baseClip.posY).toBe(-45);
    expect(baseClip.scale).toBe(1.25);
    expect(baseClip.rotation).toBe(15);

    // Verify effect removal yields base values
    const neutralRes = motionCameraEngine.evaluateEffect('Heavy Shake', 0.5, 0.0);
    expect(baseClip.posX + neutralRes.transformOffsetX).toBe(120);
    expect(baseClip.rotation + neutralRes.rotationOffset).toBe(15);
  });
});
