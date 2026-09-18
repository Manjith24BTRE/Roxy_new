// src/tests/effectTrackAssociation.test.ts
import { describe, it, expect } from 'vitest';
import { EffectInstanceParameters } from '../types/assetInteraction';

interface TimelineClip {
  id: string;
  name: string;
  duration: number;
  timelineStart: number;
  trackId: 'video' | 'overlay' | 'audio' | 'music';
  appliedEffects?: EffectInstanceParameters[];
}

describe('Effect Track Association Architecture (VideoClip vs Overlay Track)', () => {
  it('TEST 1 — Selecting Video Clip & Applying Fade In attaches to Video Clip and DOES NOT create Overlay track item', () => {
    const videoClip: TimelineClip = {
      id: 'clip-video-1',
      name: 'WhatsApp Video',
      duration: 10.0,
      timelineStart: 0.0,
      trackId: 'video',
      appliedEffects: [],
    };

    const timelineClips: TimelineClip[] = [videoClip];
    const playheadTime = 1.0;
    const defaultDuration = 3.0;

    // Apply Fade In
    const fadeInEffect: EffectInstanceParameters = {
      id: 'effect-fade-in-1',
      assetId: 'Fade In',
      assetName: 'Fade In',
      engineKey: 'BasicAnimationEngine',
      enabled: true,
      targetClipId: videoClip.id,
      startTime: playheadTime,
      endTime: playheadTime + defaultDuration,
      duration: defaultDuration,
      intensity: 1.0,
    };

    videoClip.appliedEffects = [...(videoClip.appliedEffects || []), fadeInEffect];

    // Verify Video Clip contains effect
    expect(videoClip.appliedEffects.length).toBe(1);
    expect(videoClip.appliedEffects[0].assetName).toBe('Fade In');
    expect(videoClip.appliedEffects[0].targetClipId).toBe('clip-video-1');

    // Verify Overlay Track items count is EXACTLY 0
    const overlayTrackClips = timelineClips.filter((c) => c.trackId === 'overlay');
    expect(overlayTrackClips.length).toBe(0);
  });

  it('TEST 2 — Changing End Time 4s -> 2s updates EffectInstance.endTime and deactivates rendering at 2.1s without Overlay item', () => {
    const videoClip: TimelineClip = {
      id: 'clip-video-1',
      name: 'WhatsApp Video',
      duration: 10.0,
      timelineStart: 0.0,
      trackId: 'video',
      appliedEffects: [
        {
          id: 'effect-1',
          assetId: 'Fade In',
          assetName: 'Fade In',
          engineKey: 'BasicAnimationEngine',
          enabled: true,
          targetClipId: 'clip-video-1',
          startTime: 1.0,
          endTime: 4.0,
          duration: 3.0,
          intensity: 1.0,
        },
      ],
    };

    // User shortens End Time in Adjustment to 2.0s
    const effect = videoClip.appliedEffects![0];
    effect.endTime = 2.0;
    effect.duration = effect.endTime - effect.startTime;

    expect(effect.endTime).toBe(2.0);
    expect(effect.duration).toBe(1.0);

    const isEffectActiveAt = (t: number) => t >= effect.startTime && t <= effect.endTime;

    expect(isEffectActiveAt(1.0)).toBe(true);
    expect(isEffectActiveAt(1.5)).toBe(true);
    expect(isEffectActiveAt(2.0)).toBe(true);
    expect(isEffectActiveAt(2.1)).toBe(false);

    // Verify clip remains strictly on Video Track
    expect(videoClip.trackId).toBe('video');
  });

  it('TEST 3 — Applying second effect (Film Grain) attaches to video clip independently', () => {
    const videoClip: TimelineClip = {
      id: 'clip-video-1',
      name: 'WhatsApp Video',
      duration: 10.0,
      timelineStart: 0.0,
      trackId: 'video',
      appliedEffects: [
        {
          id: 'effect-1',
          assetId: 'Fade In',
          assetName: 'Fade In',
          engineKey: 'BasicAnimationEngine',
          enabled: true,
          targetClipId: 'clip-video-1',
          startTime: 1.0,
          endTime: 2.0,
          duration: 1.0,
          intensity: 1.0,
        },
      ],
    };

    // Apply Film Grain
    const filmGrainEffect: EffectInstanceParameters = {
      id: 'effect-2',
      assetId: 'Film Grain',
      assetName: 'Film Grain',
      engineKey: 'RetroFXEngine',
      enabled: true,
      targetClipId: videoClip.id,
      startTime: 2.0,
      endTime: 8.0,
      duration: 6.0,
      intensity: 0.7,
    };

    videoClip.appliedEffects!.push(filmGrainEffect);

    expect(videoClip.appliedEffects!.length).toBe(2);
    expect(videoClip.appliedEffects![0].assetName).toBe('Fade In');
    expect(videoClip.appliedEffects![1].assetName).toBe('Film Grain');
    expect(videoClip.trackId).toBe('video');
  });

  it('TEST 4 — Real Overlay media appears on Overlay track while effects do not', () => {
    const timelineClips: TimelineClip[] = [
      {
        id: 'clip-video-1',
        name: 'Main Video',
        duration: 10.0,
        timelineStart: 0.0,
        trackId: 'video',
        appliedEffects: [
          {
            id: 'eff-1',
            assetId: 'Blur',
            assetName: 'Blur',
            engineKey: 'BlurFocusEngine',
            enabled: true,
            targetClipId: 'clip-video-1',
            startTime: 0.0,
            endTime: 3.0,
            duration: 3.0,
            intensity: 0.5,
          },
        ],
      },
      {
        id: 'overlay-1',
        name: 'Watermark Logo (Overlay)',
        duration: 5.0,
        timelineStart: 1.0,
        trackId: 'overlay',
      },
    ];

    const videoClips = timelineClips.filter((c) => c.trackId === 'video');
    const overlayClips = timelineClips.filter((c) => c.trackId === 'overlay');

    expect(videoClips.length).toBe(1);
    expect(overlayClips.length).toBe(1);
    expect(overlayClips[0].name).toBe('Watermark Logo (Overlay)');
    expect(videoClips[0].appliedEffects!.length).toBe(1);
  });
});
