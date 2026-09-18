import { AudioAsset, AudioClipRef, IAudioTrackManager } from './Audio.types';
import { generateAudioId } from './audio.utils';

export class AudioTrackManager implements IAudioTrackManager {
  createAudioClipFromAsset(
    asset: AudioAsset,
    playheadTime: number = 0,
    maxAllowedDuration?: number
  ): AudioClipRef {
    const rawDuration = asset.duration || 0;
    const finalDuration =
      typeof maxAllowedDuration === 'number' && maxAllowedDuration > 0
        ? Math.min(rawDuration, maxAllowedDuration)
        : rawDuration;

    return {
      id: generateAudioId('clip_audio'),
      name: asset.name,
      url: asset.url,
      timelineStart: Math.max(0, playheadTime),
      duration: finalDuration,
      startOffset: 0,
      baseDuration: rawDuration,
      playbackRate: 1,
      speed: 1,
      volume: 1,
      fadeIn: 0,
      fadeOut: 0,
      isMuted: false,
      isLocked: false,
      trackId: 'audio',
      type: 'audio',
      mediaType: 'audio',
      mediaId: asset.id,
      waveformData: asset.waveformData,
    };
  }

  addClipToTimeline<T extends AudioClipRef>(
    clips: T[],
    asset: AudioAsset,
    playheadTime: number = 0,
    selectedClipId?: string
  ): { updatedClips: T[]; createdClip: T } {
    // 1. Identify video clips on the timeline
    const videoClips = clips.filter(
      (c: any) =>
        c.trackId === 'video' ||
        c.type === 'video' ||
        c.mediaType === 'video' ||
        (!c.trackId && !c.type)
    );

    let selectedVideoClip: T | undefined;
    if (selectedClipId) {
      selectedVideoClip = clips.find((c) => c.id === selectedClipId);
    }

    if (!selectedVideoClip && videoClips.length > 0) {
      // Find selected clip, active clip, or first video clip
      selectedVideoClip =
        videoClips.find((c: any) => c.isSelected || c.active) || videoClips[0];
    }

    let targetStart = Math.max(0, playheadTime);

    // If playheadTime is 0 and there is a selected video clip, default to selected clip start,
    // otherwise use the playheadTime directly without truncating audio asset duration.
    if (playheadTime === 0 && selectedVideoClip) {
      targetStart = selectedVideoClip.timelineStart ?? (selectedVideoClip as any).start ?? 0;
    }

    const newClip = this.createAudioClipFromAsset(
      asset,
      targetStart
    ) as T;

    newClip.timelineStart = targetStart;
    (newClip as any).start = targetStart;

    // Do NOT shift, move, or push any existing clips
    const updatedClips = [...clips, newClip];
    return { updatedClips, createdClip: newClip };
  }
}

export const audioTrackManager = new AudioTrackManager();
