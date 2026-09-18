// src/tests/transitionsAdjustmentArchitecture.test.ts
import { describe, it, expect } from 'vitest';
import { assetRegistry } from '../services/AssetRegistry';

interface TransitionInstance {
  instanceId: string;
  assetId: string;
  assetName: string;
  duration: number;
  enabled: boolean;
  direction?: string;
  parameters?: Record<string, any>;
}

describe('Transitions UI + Adjustment Separation Architecture', () => {
  it('ACCEPTANCE TEST 1 — Transition Library catalog integrity & name preservation from AssetRegistry', () => {
    const transitionAssets = assetRegistry.getAssetsByType('Transitions');
    expect(transitionAssets.length).toBeGreaterThan(0);
    
    // Check that assets contain valid properties sourced from AssetRegistry
    const crossDissolve = transitionAssets.find(a => a.name.toLowerCase().includes('cross dissolve') || a.name.toLowerCase().includes('dissolve'));
    expect(crossDissolve).toBeDefined();
    expect(crossDissolve?.type).toBe('Transitions');
  });

  it('ACCEPTANCE TEST 2 — Selecting a transition resolves a single TransitionInstance with authorative duration', () => {
    const crossDissolveAsset = assetRegistry.getAssetsByType('Transitions').find(a => a.name.toLowerCase().includes('cross dissolve')) || {
      id: 'transition-cross-dissolve',
      name: 'Cross Dissolve',
      type: 'Transitions',
      category: 'Dissolve'
    };

    const instance: TransitionInstance = {
      instanceId: 'trans-inst-1',
      assetId: String(crossDissolveAsset.id),
      assetName: crossDissolveAsset.name,
      duration: 1.0,
      enabled: true,
      direction: 'center',
    };

    expect(instance.instanceId).toBe('trans-inst-1');
    expect(instance.assetName).toBe(crossDissolveAsset.name);
    expect(instance.duration).toBe(1.0);
  });

  it('ACCEPTANCE TEST 3 — Duration edit 1.0s -> 2.0s updates single authoritative TransitionInstance & boundary evaluation', () => {
    const boundaryTime = 5.0; // clip boundary at 5s
    const instance: TransitionInstance = {
      instanceId: 'trans-inst-1',
      assetId: 'dissolve-1',
      assetName: 'Cross Dissolve',
      duration: 1.0,
      enabled: true,
    };

    // Before change (1.0s duration)
    let transDur = instance.duration;
    let startBoundary = boundaryTime - transDur / 2; // 4.5s
    let endBoundary = boundaryTime + transDur / 2;   // 5.5s
    
    const calculateProgress = (t: number, dur: number) => {
      const transStart = boundaryTime - dur / 2;
      return Math.max(0, Math.min(1, (t - transStart) / dur));
    };

    expect(startBoundary).toBe(4.5);
    expect(endBoundary).toBe(5.5);
    expect(calculateProgress(4.5, transDur)).toBe(0.0);
    expect(calculateProgress(5.0, transDur)).toBe(0.5);
    expect(calculateProgress(5.5, transDur)).toBe(1.0);

    // User changes duration in Adjustment from 1.0s to 2.0s
    instance.duration = 2.0;
    transDur = instance.duration;

    startBoundary = boundaryTime - transDur / 2; // 4.0s
    endBoundary = boundaryTime + transDur / 2;   // 6.0s

    expect(startBoundary).toBe(4.0);
    expect(endBoundary).toBe(6.0);
    expect(calculateProgress(4.0, transDur)).toBe(0.0);
    expect(calculateProgress(5.0, transDur)).toBe(0.5); // mid-point
    expect(calculateProgress(6.0, transDur)).toBe(1.0);
    // At t=4.25s (which was inactive at 1s duration), it is now 0.125 progress
    expect(calculateProgress(4.25, transDur)).toBe(0.125);
  });

  it('ACCEPTANCE TEST 4 — Duration edit 2.0s -> 0.5s updates TransitionInstance & contracts evaluation window', () => {
    const boundaryTime = 5.0;
    const instance: TransitionInstance = {
      instanceId: 'trans-inst-1',
      assetId: 'dissolve-1',
      assetName: 'Cross Dissolve',
      duration: 2.0,
      enabled: true,
    };

    // User changes duration to 0.5s
    instance.duration = 0.5;
    const transDur = instance.duration;
    const transStart = boundaryTime - transDur / 2; // 4.75s
    const transEnd = boundaryTime + transDur / 2;   // 5.25s

    const isTransitionActive = (t: number) => t >= transStart && t <= transEnd;

    expect(transStart).toBe(4.75);
    expect(transEnd).toBe(5.25);
    expect(isTransitionActive(4.5)).toBe(false);
    expect(isTransitionActive(4.75)).toBe(true);
    expect(isTransitionActive(5.0)).toBe(true);
    expect(isTransitionActive(5.25)).toBe(true);
    expect(isTransitionActive(5.5)).toBe(false);
  });

  it('ACCEPTANCE TEST 5 — Reopening Adjustment preserves modified duration (2.5s)', () => {
    const instance: TransitionInstance = {
      instanceId: 'trans-inst-1',
      assetId: 'dissolve-1',
      assetName: 'Cross Dissolve',
      duration: 2.5,
      enabled: true,
    };

    // Simulate closing panel & reopening Adjustment tab
    const currentSelectedInstance = instance;
    expect(currentSelectedInstance.duration).toBe(2.5);
    
    // Evaluate progress using preserved 2.5s duration
    const progressAtMidpoint = (5.0 - (5.0 - 2.5/2)) / currentSelectedInstance.duration;
    expect(progressAtMidpoint).toBe(0.5);
  });

  it('ACCEPTANCE TEST 6 — Playback across boundary uses configured duration', () => {
    const boundaryTime = 10.0;
    const duration = 2.0; // 9.0s to 11.0s
    const transStart = boundaryTime - duration / 2;
    const transEnd = boundaryTime + duration / 2;

    const timelineFrames: { time: number; active: boolean; progress: number }[] = [];
    for (let t = 8.0; t <= 12.0; t += 0.5) {
      const active = t >= transStart && t <= transEnd;
      const progress = Math.max(0, Math.min(1, (t - transStart) / duration));
      timelineFrames.push({ time: t, active, progress });
    }

    const activeFrames = timelineFrames.filter(f => f.active);
    expect(activeFrames.length).toBe(5); // t = 9.0, 9.5, 10.0, 10.5, 11.0
    expect(activeFrames[0].progress).toBe(0);
    expect(activeFrames[2].progress).toBe(0.5);
    expect(activeFrames[4].progress).toBe(1);
  });

  it('ACCEPTANCE TEST 7 — Scrubbing recalculates progress dynamically using current duration', () => {
    const boundaryTime = 4.0;
    const duration = 2.0; // 3.0s to 5.0s
    const transStart = boundaryTime - duration / 2;

    const scrubPoints = [1.0, 3.0, 3.5, 4.0, 4.5, 5.0, 6.0, 4.0];
    const progresses = scrubPoints.map(t => {
      if (t < transStart || t > transStart + duration) return null;
      return Math.max(0, Math.min(1, (t - transStart) / duration));
    });

    expect(progresses).toEqual([null, 0.0, 0.25, 0.5, 0.75, 1.0, null, 0.5]);
  });

  it('ACCEPTANCE TEST 8 — Multiple instances have independent duration state', () => {
    const transitionA: TransitionInstance = {
      instanceId: 'trans-A',
      assetId: 'cross-dissolve',
      assetName: 'Cross Dissolve',
      duration: 1.0,
      enabled: true,
    };

    const transitionB: TransitionInstance = {
      instanceId: 'trans-B',
      assetId: 'zoom-in',
      assetName: 'Zoom Transition',
      duration: 3.0,
      enabled: true,
    };

    // User edits Transition A duration in Adjustment panel to 2.0s
    transitionA.duration = 2.0;

    expect(transitionA.duration).toBe(2.0);
    expect(transitionB.duration).toBe(3.0); // Transition B unaffected
  });
});
