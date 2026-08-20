import { describe, it, expect, beforeEach } from 'vitest';
import { validateFreeze } from '../validation';
import { timelineFreezeManager } from '../TimelineFreezeManager';
import { freezeFrameGenerator } from '../FreezeFrameGenerator';
import {
  DEFAULT_FREEZE_DURATION,
  calculateSourceFrameTime,
  isFreezeClip,
  findClipAtPlayhead,
  generateFreezeClipId,
  generatePostFreezeClipId,
  deepCloneArray
} from '../freeze.utils';
import { TimelineClipRef } from '../freeze.types';

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function makeClip(overrides: Partial<TimelineClipRef> = {}): TimelineClipRef {
  return {
    id: 'clip-1',
    name: 'Test Video.mp4',
    url: 'blob:http://localhost/test-video',
    timelineStart: 0,
    start: 0,
    duration: 10,
    baseDuration: 10,
    startOffset: 0,
    playbackRate: 1,
    trackId: 'video',
    type: 'video',
    mediaType: 'video',
    thumbnails: ['thumb1.jpg', 'thumb2.jpg'],
    isLocked: false,
    isMuted: false,
    ...overrides
  };
}

function getVideoClips(clips: TimelineClipRef[]): TimelineClipRef[] {
  return clips.filter(
    (c) => c.trackId !== 'audio' && c.trackId !== 'music' && c.type !== 'audio' && !c.isDetachedAudio
  );
}

function getTotalDuration(clips: TimelineClipRef[]): number {
  const videoClips = getVideoClips(clips);
  return videoClips.reduce((max, clip) => {
    const start = clip.timelineStart ?? clip.start ?? 0;
    return Math.max(max, start + clip.duration);
  }, 0);
}

// ─── TESTS ────────────────────────────────────────────────────────────────────

describe('Freeze Frame Engine', () => {
  let clip: TimelineClipRef;

  beforeEach(() => {
    clip = makeClip();
  });

  // TEST 1: Freeze at beginning of clip
  it('TEST 1: should freeze at the beginning of a clip', () => {
    const result = timelineFreezeManager.applyFreezeFrame([clip], clip.id, 0);
    expect(result).not.toBeNull();
    if (!result) return;

    const videoClips = getVideoClips(result.updatedClips);
    // At the start: freeze + original clip (no zero-duration Part A)
    expect(videoClips.length).toBe(2);

    const freezeClip = videoClips.find((c) => c.isFreezeFrame);
    expect(freezeClip).toBeDefined();
    expect(freezeClip!.duration).toBe(DEFAULT_FREEZE_DURATION);

    // The remaining video should have the full original duration
    const videoAfter = videoClips.find((c) => !c.isFreezeFrame);
    expect(videoAfter).toBeDefined();
    expect(videoAfter!.duration).toBe(10);
  });

  // TEST 2: Freeze in middle of clip
  it('TEST 2: should freeze in the middle of a clip', () => {
    const playheadTime = 5;
    const result = timelineFreezeManager.applyFreezeFrame([clip], clip.id, playheadTime);
    expect(result).not.toBeNull();
    if (!result) return;

    const videoClips = getVideoClips(result.updatedClips);
    // Middle: Part A + Freeze + Part B
    expect(videoClips.length).toBe(3);

    const partA = videoClips[0];
    const freeze = videoClips[1];
    const partB = videoClips[2];

    expect(partA.duration).toBeCloseTo(5, 2);
    expect(freeze.isFreezeFrame).toBe(true);
    expect(freeze.duration).toBe(DEFAULT_FREEZE_DURATION);
    expect(partB.duration).toBeCloseTo(5, 2);
  });

  // TEST 3: Freeze near end of clip
  it('TEST 3: should freeze near the end of a clip', () => {
    const playheadTime = 9.5;
    const result = timelineFreezeManager.applyFreezeFrame([clip], clip.id, playheadTime);
    expect(result).not.toBeNull();
    if (!result) return;

    const videoClips = getVideoClips(result.updatedClips);
    expect(videoClips.length).toBe(3);

    const partA = videoClips[0];
    const freeze = videoClips[1];
    const partB = videoClips[2];

    expect(partA.duration).toBeCloseTo(9.5, 2);
    expect(freeze.isFreezeFrame).toBe(true);
    expect(freeze.duration).toBe(DEFAULT_FREEZE_DURATION);
    expect(partB.duration).toBeCloseTo(0.5, 2);
  });

  // TEST 4: Freeze exactly at clip end
  it('TEST 4: should freeze at the exact end of a clip', () => {
    const playheadTime = 10;
    const result = timelineFreezeManager.applyFreezeFrame([clip], clip.id, playheadTime);
    expect(result).not.toBeNull();
    if (!result) return;

    const videoClips = getVideoClips(result.updatedClips);
    // At end: Part A (full original) + Freeze (no zero-duration Part B)
    expect(videoClips.length).toBe(2);

    const freeze = videoClips.find((c) => c.isFreezeFrame);
    expect(freeze).toBeDefined();
    expect(freeze!.duration).toBe(DEFAULT_FREEZE_DURATION);

    const videoBefore = videoClips.find((c) => !c.isFreezeFrame);
    expect(videoBefore).toBeDefined();
    expect(videoBefore!.duration).toBe(10);
  });

  // TEST 5: Multiple freezes in one clip
  it('TEST 5: should support multiple freezes in one clip', () => {
    // First freeze at 3 seconds
    const result1 = timelineFreezeManager.applyFreezeFrame([clip], clip.id, 3);
    expect(result1).not.toBeNull();
    if (!result1) return;

    // Second freeze at 8 seconds (adjusted for the 2s freeze insertion)
    // After first freeze: [0-3] + [3-5 freeze] + [5-12]
    // To freeze at original 8s position, we need to account for the 2s shift
    const videoClips1 = getVideoClips(result1.updatedClips);
    const partB = videoClips1.find((c) => !c.isFreezeFrame && (c.timelineStart ?? 0) > 3);
    expect(partB).toBeDefined();

    // Second freeze on Part B
    const result2 = timelineFreezeManager.applyFreezeFrame(
      result1.updatedClips,
      partB!.id,
      partB!.timelineStart! + 2
    );
    expect(result2).not.toBeNull();
    if (!result2) return;

    const freezeClips = getVideoClips(result2.updatedClips).filter((c) => c.isFreezeFrame);
    expect(freezeClips.length).toBe(2);
  });

  // TEST 6: Freeze after clip has been split
  it('TEST 6: should freeze a clip that was already split', () => {
    const splitClipA = makeClip({ id: 'split-a', duration: 5, timelineStart: 0, start: 0 });
    const splitClipB = makeClip({
      id: 'split-b',
      duration: 5,
      timelineStart: 5,
      start: 5,
      startOffset: 5,
      name: 'Test Video.mp4 (Part 2)'
    });

    const result = timelineFreezeManager.applyFreezeFrame(
      [splitClipA, splitClipB],
      splitClipB.id,
      7
    );
    expect(result).not.toBeNull();
    if (!result) return;

    const freezeClip = getVideoClips(result.updatedClips).find((c) => c.isFreezeFrame);
    expect(freezeClip).toBeDefined();
    expect(freezeClip!.duration).toBe(DEFAULT_FREEZE_DURATION);
  });

  // TEST 7: Freeze on a trimmed clip (with startOffset)
  it('TEST 7: should freeze a trimmed clip correctly', () => {
    const trimmedClip = makeClip({
      duration: 6,
      baseDuration: 6,
      startOffset: 3 // trimmed 3 seconds from the beginning
    });

    const result = timelineFreezeManager.applyFreezeFrame([trimmedClip], trimmedClip.id, 2);
    expect(result).not.toBeNull();
    if (!result) return;

    const freeze = getVideoClips(result.updatedClips).find((c) => c.isFreezeFrame);
    expect(freeze).toBeDefined();
    expect(freeze!.freezeSourceTime).toBeCloseTo(5, 2); // 3 (offset) + 2 (playhead) = 5
  });

  // TEST 8: No video under playhead
  it('TEST 8: should return null when no video clip exists under playhead', () => {
    const audioClip: TimelineClipRef = makeClip({ id: 'audio-1', trackId: 'audio', type: 'audio' });
    const result = timelineFreezeManager.applyFreezeFrame([audioClip], audioClip.id, 5);
    expect(result).toBeNull();
  });

  // TEST 9: Empty timeline
  it('TEST 9: should return null for empty timeline', () => {
    const result = timelineFreezeManager.applyFreezeFrame([], 'nonexistent', 5);
    expect(result).toBeNull();
  });

  // TEST 10: Undo Freeze — data structure produces correct before/after states
  it('TEST 10: should produce data that supports undo', () => {
    const originalClips = [makeClip()];
    const originalClipsCopy = JSON.parse(JSON.stringify(originalClips));

    const result = timelineFreezeManager.applyFreezeFrame(originalClips, clip.id, 5);
    expect(result).not.toBeNull();

    // Original clips array should not be mutated
    expect(originalClips).toEqual(originalClipsCopy);

    // updatedClips should differ from original
    expect(result!.updatedClips.length).toBeGreaterThan(originalClips.length);
  });

  // TEST 11: Redo Freeze — applying the same operation should produce consistent results
  it('TEST 11: should produce consistent results for redo', () => {
    const result1 = timelineFreezeManager.applyFreezeFrame([makeClip()], clip.id, 5);
    const result2 = timelineFreezeManager.applyFreezeFrame([makeClip()], clip.id, 5);

    expect(result1).not.toBeNull();
    expect(result2).not.toBeNull();

    // Both should produce the same number of clips
    expect(result1!.updatedClips.length).toBe(result2!.updatedClips.length);

    // Both freeze clips should have the same duration
    expect(result1!.freezeClip.duration).toBe(result2!.freezeClip.duration);
  });

  // TEST 12: Freeze duration = exactly 2 seconds
  it('TEST 12: should create a freeze clip with exactly 2.000 seconds duration', () => {
    const result = timelineFreezeManager.applyFreezeFrame([clip], clip.id, 5);
    expect(result).not.toBeNull();
    if (!result) return;

    expect(result.freezeClip.duration).toBe(2.0);
    expect(result.freezeClip.baseDuration).toBe(2.0);
    expect(DEFAULT_FREEZE_DURATION).toBe(2.0);
  });

  // TEST 13: Original media file is not modified
  it('TEST 13: should not modify the original clip object', () => {
    const originalClip = makeClip();
    const originalUrl = originalClip.url;
    const originalDuration = originalClip.duration;
    const originalName = originalClip.name;
    const originalId = originalClip.id;

    timelineFreezeManager.applyFreezeFrame([originalClip], originalClip.id, 5);

    // Original clip reference should be unchanged
    expect(originalClip.url).toBe(originalUrl);
    expect(originalClip.duration).toBe(originalDuration);
    expect(originalClip.name).toBe(originalName);
    expect(originalClip.id).toBe(originalId);
  });

  // TEST 14: Timeline has no gap after Freeze
  it('TEST 14: should have no timeline gap after freeze', () => {
    const result = timelineFreezeManager.applyFreezeFrame([clip], clip.id, 5);
    expect(result).not.toBeNull();
    if (!result) return;

    const videoClips = getVideoClips(result.updatedClips).sort(
      (a, b) => (a.timelineStart ?? 0) - (b.timelineStart ?? 0)
    );

    // Check continuity: each clip starts where the previous one ends
    for (let i = 1; i < videoClips.length; i++) {
      const prevEnd = (videoClips[i - 1].timelineStart ?? 0) + videoClips[i - 1].duration;
      const currStart = videoClips[i].timelineStart ?? 0;
      expect(currStart).toBeCloseTo(prevEnd, 2);
    }

    // Total duration should be original + freeze duration
    const totalDuration = getTotalDuration(result.updatedClips);
    expect(totalDuration).toBeCloseTo(clip.duration + DEFAULT_FREEZE_DURATION, 2);
  });

  // TEST 15: Validation edge cases
  describe('TEST 15: Validation edge cases', () => {
    it('should reject null clip', () => {
      const result = validateFreeze(null, 5);
      expect(result.canFreeze).toBe(false);
    });

    it('should reject locked clip', () => {
      const lockedClip = makeClip({ isLocked: true });
      const result = validateFreeze(lockedClip, 5);
      expect(result.canFreeze).toBe(false);
    });

    it('should reject audio clip', () => {
      const audioClip = makeClip({ trackId: 'audio' });
      const result = validateFreeze(audioClip, 5);
      expect(result.canFreeze).toBe(false);
    });

    it('should reject playhead before clip', () => {
      const result = validateFreeze(clip, -5);
      expect(result.canFreeze).toBe(false);
    });

    it('should reject playhead after clip', () => {
      const result = validateFreeze(clip, 15);
      expect(result.canFreeze).toBe(false);
    });

    it('should allow playhead at exact clip start', () => {
      const result = validateFreeze(clip, 0);
      expect(result.canFreeze).toBe(true);
    });

    it('should allow playhead at exact clip end', () => {
      const result = validateFreeze(clip, 10);
      expect(result.canFreeze).toBe(true);
    });

    it('should reject clip with zero duration', () => {
      const zeroDurClip = makeClip({ duration: 0 });
      const result = validateFreeze(zeroDurClip, 0);
      expect(result.canFreeze).toBe(false);
    });

    it('should reject detached audio clip', () => {
      const detachedAudio = makeClip({ isDetachedAudio: true } as any);
      const result = validateFreeze(detachedAudio, 5);
      expect(result.canFreeze).toBe(false);
    });
  });
});

// ─── UTILITY TESTS ────────────────────────────────────────────────────────────

describe('Freeze Frame Utilities', () => {
  it('isFreezeClip should identify freeze clips', () => {
    expect(isFreezeClip(null)).toBe(false);
    expect(isFreezeClip(undefined)).toBe(false);
    expect(isFreezeClip(makeClip())).toBe(false);
    expect(isFreezeClip(makeClip({ isFreezeFrame: true }))).toBe(true);
    expect(isFreezeClip(makeClip({ type: 'freeze' }))).toBe(true);
  });

  it('calculateSourceFrameTime should account for startOffset and playback rate', () => {
    const clip = makeClip({ startOffset: 2, playbackRate: 2 });
    const sourceTime = calculateSourceFrameTime(clip, 3);
    // startOffset(2) + relativePlayhead(3) * rate(2) = 8
    expect(sourceTime).toBeCloseTo(8, 2);
  });

  it('findClipAtPlayhead should locate the video clip at the given time', () => {
    const clips = [
      makeClip({ id: 'v1', duration: 5, timelineStart: 0 }),
      makeClip({ id: 'v2', duration: 5, timelineStart: 5 }),
      makeClip({ id: 'a1', duration: 10, timelineStart: 0, trackId: 'audio', type: 'audio' })
    ];

    expect(findClipAtPlayhead(clips, 2)?.id).toBe('v1');
    expect(findClipAtPlayhead(clips, 7)?.id).toBe('v2');
    expect(findClipAtPlayhead(clips, 15)).toBeNull();
    expect(findClipAtPlayhead([], 5)).toBeNull();
  });

  it('generateFreezeClipId should generate unique IDs', () => {
    const id1 = generateFreezeClipId('source');
    const id2 = generateFreezeClipId('source');
    expect(id1).not.toBe(id2);
    expect(id1).toContain('freeze');
  });

  it('deepCloneArray should produce independent copies', () => {
    const original = [{ a: 1, b: { c: 2 } }];
    const clone = deepCloneArray(original);
    clone[0].b.c = 99;
    expect(original[0].b.c).toBe(2);
  });
});

// ─── FREEZE FRAME GENERATOR TESTS ────────────────────────────────────────────

describe('FreezeFrameGenerator', () => {
  it('should create a freeze clip with correct metadata', () => {
    const source = makeClip();
    const freeze = freezeFrameGenerator.createFreezeClip(source, 3.5, 2.0, 'data:image/png;base64,abc');

    expect(freeze.isFreezeFrame).toBe(true);
    expect(freeze.duration).toBe(2.0);
    expect(freeze.baseDuration).toBe(2.0);
    expect(freeze.freezeSourceTime).toBe(3.5);
    expect(freeze.type).toBe('image');
    expect(freeze.mediaType).toBe('image');
    expect(freeze.url).toBe('data:image/png;base64,abc');
    expect(freeze.thumbnails).toEqual(['data:image/png;base64,abc']);
    expect(freeze.sourceClipId).toBe(source.id);
    expect(freeze.playbackRate).toBe(1);
    expect(freeze.startOffset).toBe(0);
    expect(freeze.isMuted).toBe(true);
    expect(freeze.isReversed).toBe(false);
  });

  it('should ensure thumbnails is always a valid array', () => {
    const source = makeClip({ thumbnails: undefined });
    const freeze = freezeFrameGenerator.createFreezeClip(source, 0, 2.0, 'data:image/png;base64,x');
    expect(Array.isArray(freeze.thumbnails)).toBe(true);
    expect(freeze.thumbnails!.length).toBeGreaterThan(0);
  });

  it('should generate unique IDs for each freeze clip', () => {
    const source = makeClip();
    const freeze1 = freezeFrameGenerator.createFreezeClip(source, 1, 2.0);
    const freeze2 = freezeFrameGenerator.createFreezeClip(source, 2, 2.0);
    expect(freeze1.id).not.toBe(freeze2.id);
  });
});
