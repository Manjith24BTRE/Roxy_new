import { AudioAsset, AudioClipRef, IAudioTrackManager } from './Audio.types';
import { generateAudioId } from './audio.utils';

export class AudioTrackManager implements IAudioTrackManager {
  createAudioClipFromAsset(asset: AudioAsset, playheadTime: number = 0): AudioClipRef {
    return {
      id: generateAudioId('clip_audio'),
      name: asset.name,
      url: asset.url,
      timelineStart: Math.max(0, playheadTime),
      duration: asset.duration,
      startOffset: 0,
      baseDuration: asset.duration,
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
      waveformData: asset.waveformData
    };
  }

  addClipToTimeline<T extends AudioClipRef>(
    clips: T[],
    asset: AudioAsset,
    playheadTime: number = 0
  ): { updatedClips: T[]; createdClip: T } {
    const newClip = this.createAudioClipFromAsset(asset, playheadTime) as T;

    // Check if playhead position overlaps with a locked clip on audio track
    const audioTrackId = 'audio';
    const targetStart = newClip.timelineStart;
    const targetEnd = targetStart + newClip.duration;

    let adjustedStart = targetStart;

    const lockedClipsOnTrack = clips.filter(
      (c) => (c.trackId === audioTrackId || c.type === 'audio') && c.isLocked
    );

    for (const locked of lockedClipsOnTrack) {
      const lStart = locked.timelineStart ?? locked.start ?? 0;
      const lEnd = lStart + locked.duration;

      // If starting inside a locked clip, shift right after locked clip
      if (adjustedStart >= lStart && adjustedStart < lEnd) {
        adjustedStart = lEnd;
      }
    }

    newClip.timelineStart = adjustedStart;
    if ('start' in newClip) {
      (newClip as any).start = adjustedStart;
    }

    const updatedClips = [...clips, newClip];
    return { updatedClips, createdClip: newClip };
  }
}

export const audioTrackManager = new AudioTrackManager();
