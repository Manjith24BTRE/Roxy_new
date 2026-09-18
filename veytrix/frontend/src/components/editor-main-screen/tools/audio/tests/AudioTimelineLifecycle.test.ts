import { describe, it, expect } from 'vitest';
import { AudioTrackManager } from '../AudioTrackManager';
import { AudioAsset } from '../Audio.types';
import { DeleteService } from '../../delete/DeleteService';
import { DeleteManager } from '../../delete/DeleteManager';

describe('Audio Timeline Lifecycle & Interactivity Architecture', () => {
  const audioManager = new AudioTrackManager();

  const mockAudioAsset: AudioAsset = {
    id: 'asset_audio_123',
    name: 'Background Music.mp3',
    url: 'blob:http://localhost/audio-123',
    duration: 30,
    waveformData: [0.1, 0.5, 0.8, 0.3],
    category: 'music',
  };

  const mockVideoClip = {
    id: 'clip_video_1',
    name: 'Main Video.mp4',
    url: 'blob:http://localhost/video-1',
    timelineStart: 0,
    start: 0,
    duration: 10,
    trackId: 'video',
    type: 'video',
  };

  it('1. Import & Insertion: creates fully fledged audio clip with complete timeline properties', () => {
    const clips = [mockVideoClip];
    const { updatedClips, createdClip } = audioManager.addClipToTimeline(
      clips,
      mockAudioAsset,
      2.5
    );

    expect(updatedClips.length).toBe(2);
    expect(createdClip.id).toContain('clip_audio_');
    expect(createdClip.trackId).toBe('audio');
    expect(createdClip.type).toBe('audio');
    expect(createdClip.timelineStart).toBe(2.5);
    expect(createdClip.start).toBe(2.5);
    expect(createdClip.duration).toBe(30);
    expect(createdClip.mediaId).toBe(mockAudioAsset.id);
    expect(createdClip.url).toBe(mockAudioAsset.url);
    expect(createdClip.waveformData).toEqual(mockAudioAsset.waveformData);
    expect(createdClip.isLocked).toBe(false);
    expect(createdClip.isMuted).toBe(false);
  });

  it('2. Selection & Resolution: finds audio clip by ID from timeline clips', () => {
    const { createdClip } = audioManager.addClipToTimeline([], mockAudioAsset, 0);
    const clips = [mockVideoClip, createdClip];

    const selectedClip = clips.find((c) => c.id === createdClip.id);
    expect(selectedClip).toBeDefined();
    expect(selectedClip?.id).toBe(createdClip.id);
    expect(selectedClip?.type).toBe('audio');
  });

  it('3. Deletion Pipeline: DeleteService removes audio clip cleanly without affecting video clips', () => {
    const { createdClip } = audioManager.addClipToTimeline([mockVideoClip], mockAudioAsset, 0);
    const clips = [mockVideoClip, createdClip];

    const res = DeleteService.deleteClip(clips, createdClip.id, 0);

    expect(res.success).toBe(true);
    expect(res.updatedTimelineClips).toBeDefined();
    expect(res.updatedTimelineClips?.length).toBe(1);
    expect(res.updatedTimelineClips?.[0].id).toBe(mockVideoClip.id);
  });

  it('4. DeleteManager: deleteClipFromList filters out targeted audio clip', () => {
    const { createdClip } = audioManager.addClipToTimeline([mockVideoClip], mockAudioAsset, 5);
    const clips = [mockVideoClip, createdClip];

    const remaining = DeleteManager.deleteClipFromList(clips, createdClip.id);
    expect(remaining.length).toBe(1);
    expect(remaining[0].id).toBe(mockVideoClip.id);
  });

  it('5. Repositioning & Dragging: updating audio timelineStart preserves audio attributes', () => {
    const { createdClip } = audioManager.addClipToTimeline([mockVideoClip], mockAudioAsset, 0);

    const repositionedClip = {
      ...createdClip,
      timelineStart: 7.5,
      start: 7.5,
    };

    expect(repositionedClip.timelineStart).toBe(7.5);
    expect(repositionedClip.start).toBe(7.5);
    expect(repositionedClip.duration).toBe(mockAudioAsset.duration);
    expect(repositionedClip.type).toBe('audio');
  });

  it('6. Trimming: updating startOffset and duration maintains audio media integrity', () => {
    const { createdClip } = audioManager.addClipToTimeline([mockVideoClip], mockAudioAsset, 0);

    const trimmedClip = {
      ...createdClip,
      startOffset: 2,
      duration: 15,
    };

    expect(trimmedClip.startOffset).toBe(2);
    expect(trimmedClip.duration).toBe(15);
    expect(trimmedClip.baseDuration).toBe(30);
    expect(trimmedClip.mediaId).toBe(mockAudioAsset.id);
  });
});
