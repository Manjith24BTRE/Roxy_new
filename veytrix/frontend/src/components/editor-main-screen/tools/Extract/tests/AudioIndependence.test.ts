import { describe, test, expect } from 'vitest';
import { AudioDetachService } from '../AudioDetachService';
import { TimelineSplitManager } from '../../split/TimelineSplitManager';
import { DeleteManager } from '../../delete/DeleteManager';
import { ClipReorderUtils } from '../../overlap/clipReorderUtils';

describe('Audio Detach & Timeline Independence Verification', () => {
  const detachService = new AudioDetachService();

  const mockVideoClip = {
    id: 'video-clip-1',
    name: 'Sample Video.mp4',
    url: 'https://example.com/video.mp4',
    trackId: 'video',
    type: 'video',
    mediaType: 'video',
    mediaId: 'media-video-1',
    start: 0,
    timelineStart: 0,
    duration: 10,
    baseDuration: 10,
    startOffset: 0,
    volume: 1,
    isMuted: false,
    hasAudio: true,
    keyframes: [{ id: 'kf1', time: 2, properties: { opacity: 0.8 } }],
    appliedEffects: [{ id: 'eff1', type: 'blur' }],
    filters: [{ id: 'flt1', name: 'grayscale' }],
  };

  test('1. Audio Extraction creates a 100% independent clip object with unique mediaId and deep clones', () => {
    const audioClip = detachService.createAudioClipFromVideo(mockVideoClip as any);

    expect(audioClip.id).not.toEqual(mockVideoClip.id);
    expect(audioClip.mediaId).not.toEqual(mockVideoClip.mediaId);
    expect(audioClip.type).toEqual('audio');
    expect(audioClip.isDetachedAudio).toBe(true);
    expect((audioClip as any).linkedToVideo).toBe(false);

    // Verify object references are distinct
    expect(audioClip).not.toBe(mockVideoClip);
    expect(audioClip.keyframes).not.toBe(mockVideoClip.keyframes);
    expect(audioClip.appliedEffects).not.toBe(mockVideoClip.appliedEffects);
    expect(audioClip.filters).not.toBe(mockVideoClip.filters);
  });

  test('2. Splitting video clip does NOT split extracted audio clip', () => {
    const audioClip = detachService.createAudioClipFromVideo(mockVideoClip as any);
    const timelineClips = [mockVideoClip, audioClip];

    const splitResult = TimelineSplitManager.executeTimelineSplit(timelineClips, mockVideoClip.id, 5);
    expect(splitResult.success).toBe(true);

    const updatedClips = splitResult.updatedTimelineClips;
    // Should have left video part, right video part, and single UNTOUCHED audio clip
    const audioClipsInTimeline = updatedClips.filter((c) => c.type === 'audio' || c.isDetachedAudio);
    expect(audioClipsInTimeline.length).toBe(1);
    expect(audioClipsInTimeline[0].duration).toBe(10);
  });

  test('3. Splitting audio clip does NOT split original video clip', () => {
    const audioClip = detachService.createAudioClipFromVideo(mockVideoClip as any);
    const timelineClips = [mockVideoClip, audioClip];

    const splitResult = TimelineSplitManager.executeTimelineSplit(timelineClips, audioClip.id, 5);
    expect(splitResult.success).toBe(true);

    const updatedClips = splitResult.updatedTimelineClips;
    // Video clip must remain 10s and un-split
    const videoClipsInTimeline = updatedClips.filter((c) => c.type === 'video');
    expect(videoClipsInTimeline.length).toBe(1);
    expect(videoClipsInTimeline[0].duration).toBe(10);
  });

  test('4. Deleting video clip does NOT delete extracted audio clip', () => {
    const audioClip = detachService.createAudioClipFromVideo(mockVideoClip as any);
    const timelineClips = [mockVideoClip, audioClip];

    const remaining = DeleteManager.deleteClipFromList(timelineClips, mockVideoClip.id);
    expect(remaining.length).toBe(1);
    expect(remaining[0].id).toBe(audioClip.id);
  });

  test('5. Deleting audio clip does NOT delete original video clip', () => {
    const audioClip = detachService.createAudioClipFromVideo(mockVideoClip as any);
    const timelineClips = [mockVideoClip, audioClip];

    const remaining = DeleteManager.deleteClipFromList(timelineClips, audioClip.id);
    expect(remaining.length).toBe(1);
    expect(remaining[0].id).toBe(mockVideoClip.id);
  });

  test('6. Recalculate Clip Sequence preserves audio clip custom position and duration', () => {
    const audioClip = detachService.createAudioClipFromVideo(mockVideoClip as any);
    // Trim audio clip to 4 seconds
    audioClip.duration = 4;
    audioClip.timelineStart = 2;

    const timelineClips = [mockVideoClip, audioClip];
    const recalculated = ClipReorderUtils.recalculateClipSequence(timelineClips);

    const recalculatedAudio = recalculated.find((c) => c.id === audioClip.id);
    expect(recalculatedAudio.duration).toBe(4);
    expect(recalculatedAudio.timelineStart).toBe(2);
  });
});
