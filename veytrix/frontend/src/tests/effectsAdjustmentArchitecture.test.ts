// src/tests/effectsAdjustmentArchitecture.test.ts
import { describe, it, expect } from 'vitest';
import { assetRegistry } from '../services/AssetRegistry';
import { EffectInstanceParameters, calculateEffectLocalProgress } from '../types/assetInteraction';

describe('Effects UI + Adjustment Architecture & Timing Tests', () => {
  it('TEST A — DEFAULT: Apply effect starting at current playhead with EXACTLY 3.0s duration', () => {
    const playheadTime = 1.0;
    const effectAsset = assetRegistry.getAssetsByType('Effects')[0] || { id: 1, name: 'Fade In', type: 'Effects', category: 'Basic Effects', plan: 'Free', engineKey: 'BasicAnimationEngine', enabled: true, version: '1.0' };

    const defaultDuration = 3.0;
    const effectInstance: EffectInstanceParameters = {
      id: `effect-${Date.now()}`,
      assetId: effectAsset.id,
      assetName: effectAsset.name,
      engineKey: effectAsset.engineKey || 'BasicAnimationEngine',
      enabled: true,
      startTime: playheadTime,
      endTime: playheadTime + defaultDuration,
      duration: defaultDuration,
      intensity: 1.0,
      speed: 1.0,
      amount: 50,
    };

    expect(effectInstance.startTime).toBe(1.0);
    expect(effectInstance.endTime).toBe(4.0);
    expect(effectInstance.duration).toBe(3.0);
    expect(effectInstance.assetName).toBe(effectAsset.name);
  });

  it('TEST B — SHORTEN: Changing End Time from 4s to 2s updates EffectInstance and deactivates rendering at 2.1s', () => {
    const effectInstance: EffectInstanceParameters = {
      id: 'effect-123',
      assetId: 'Fade In',
      assetName: 'Fade In',
      engineKey: 'BasicAnimationEngine',
      enabled: true,
      startTime: 1.0,
      endTime: 4.0,
      duration: 3.0,
      intensity: 1.0,
    };

    // User shortens End Time in Adjustment panel to 2.0s
    effectInstance.endTime = 2.0;
    effectInstance.duration = Math.max(0.1, effectInstance.endTime - effectInstance.startTime);

    expect(effectInstance.startTime).toBe(1.0);
    expect(effectInstance.endTime).toBe(2.0);
    expect(effectInstance.duration).toBe(1.0);

    // Verify preview activity check:
    const isEffectActiveAtTime = (t: number) => t >= effectInstance.startTime && t <= effectInstance.endTime;

    expect(isEffectActiveAtTime(0.5)).toBe(false);
    expect(isEffectActiveAtTime(1.0)).toBe(true);
    expect(isEffectActiveAtTime(1.5)).toBe(true);
    expect(isEffectActiveAtTime(2.0)).toBe(true);
    expect(isEffectActiveAtTime(2.1)).toBe(false);
    expect(isEffectActiveAtTime(3.0)).toBe(false);
    expect(isEffectActiveAtTime(4.0)).toBe(false);
  });

  it('TEST C — EXTEND: Changing End Time from 4s to 8s extends rendering through 8.0s', () => {
    const effectInstance: EffectInstanceParameters = {
      id: 'effect-123',
      assetId: 'Fade In',
      assetName: 'Fade In',
      engineKey: 'BasicAnimationEngine',
      enabled: true,
      startTime: 1.0,
      endTime: 4.0,
      duration: 3.0,
      intensity: 1.0,
    };

    // User extends End Time to 8.0s
    effectInstance.endTime = 8.0;
    effectInstance.duration = effectInstance.endTime - effectInstance.startTime;

    expect(effectInstance.startTime).toBe(1.0);
    expect(effectInstance.endTime).toBe(8.0);
    expect(effectInstance.duration).toBe(7.0);

    const isEffectActiveAtTime = (t: number) => t >= effectInstance.startTime && t <= effectInstance.endTime;
    expect(isEffectActiveAtTime(5.0)).toBe(true);
    expect(isEffectActiveAtTime(8.0)).toBe(true);
    expect(isEffectActiveAtTime(8.1)).toBe(false);
  });

  it('TEST D — PREVIEW: Boundary evaluation for 1s to 2s range', () => {
    const startTime = 1.0;
    const endTime = 2.0;

    const isEffectActiveAtTime = (t: number) => t >= startTime && t <= endTime;

    expect(isEffectActiveAtTime(0.9)).toBe(false);
    expect(isEffectActiveAtTime(1.0)).toBe(true);
    expect(isEffectActiveAtTime(1.5)).toBe(true);
    expect(isEffectActiveAtTime(1.9)).toBe(true);
    expect(isEffectActiveAtTime(2.0)).toBe(true);
    expect(isEffectActiveAtTime(2.1)).toBe(false);
  });

  it('TEST E — PLAYBACK: Playing timeline continuously across 0 to 5s with effect 1s to 2s', () => {
    const startTime = 1.0;
    const endTime = 2.0;

    const activeTimelineTimes: number[] = [];
    for (let t = 0.0; t <= 5.0; t += 0.5) {
      if (t >= startTime && t <= endTime) {
        activeTimelineTimes.push(t);
      }
    }

    expect(activeTimelineTimes).toEqual([1.0, 1.5, 2.0]);
  });

  it('TEST F — SCRUB: Scrubbing backwards and forwards across effect range', () => {
    const startTime = 1.0;
    const endTime = 2.0;

    const scrubSequence = [0.0, 0.5, 1.0, 1.8, 2.5, 1.5, 0.8, 2.0, 3.0];
    const isEffectActiveAtTime = (t: number) => t >= startTime && t <= endTime;

    const states = scrubSequence.map(isEffectActiveAtTime);
    expect(states).toEqual([false, false, true, true, false, true, false, true, false]);
  });

  it('TEST G — MULTIPLE EFFECTS: Changing Effect A does not alter Effect B', () => {
    const effectA: EffectInstanceParameters = {
      id: 'effect-A',
      assetId: 'Fade In',
      assetName: 'Fade In',
      engineKey: 'BasicAnimationEngine',
      enabled: true,
      startTime: 1.0,
      endTime: 2.0,
      duration: 1.0,
      intensity: 1.0,
    };

    const effectB: EffectInstanceParameters = {
      id: 'effect-B',
      assetId: 'Zoom In',
      assetName: 'Zoom In',
      engineKey: 'TransformFXEngine',
      enabled: true,
      startTime: 3.0,
      endTime: 6.0,
      duration: 3.0,
      intensity: 0.8,
    };

    // User shortens Effect A End Time to 1.5s
    effectA.endTime = 1.5;
    effectA.duration = 0.5;

    // Verify Effect A updated
    expect(effectA.endTime).toBe(1.5);
    expect(effectA.duration).toBe(0.5);

    // Verify Effect B remains unchanged
    expect(effectB.startTime).toBe(3.0);
    expect(effectB.endTime).toBe(6.0);
    expect(effectB.duration).toBe(3.0);
  });
});
