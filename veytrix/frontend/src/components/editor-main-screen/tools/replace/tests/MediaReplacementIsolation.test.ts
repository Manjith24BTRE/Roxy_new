import { describe, it, expect } from 'vitest';

export interface TimelineClip {
  id: string;
  mediaId: string;
  type: 'video' | 'audio' | 'image' | 'freeze_frame';
  trackId: string;
  url: string;
  name: string;
  thumbnails?: string[];
  thumbnailUrl?: string;
  posterFrame?: string;
  previewFrame?: string;
  videoFrame?: string;
  videoMetadata?: any;
  duration: number;
  baseDuration?: number;
  isDetachedAudio?: boolean;
}

export function replaceMediaInClips(
  timelineClips: TimelineClip[],
  targetClipId: string,
  newMedia: { mediaId: string; url: string; name: string; thumbnails: string[]; duration?: number }
): TimelineClip[] {
  const targetClip = timelineClips.find(c => c.id === targetClipId || c.mediaId === targetClipId);
  if (!targetClip) return timelineClips;

  const newBaseDuration = newMedia.duration || targetClip.baseDuration || targetClip.duration || 5;

  return timelineClips.map((clip) => {
    const isAudioClip = clip.trackId === 'audio' || clip.trackId === 'music' || clip.type === 'audio' || clip.isDetachedAudio;
    const isLinkedAudio = isAudioClip && (
      (clip as any).sourceVideoId === targetClip.id ||
      (clip as any).sourceVideoClipId === targetClip.id ||
      (targetClip as any).detachedAudioId === clip.id
    );

    if (clip.id === targetClip.id) {
      if (isAudioClip) {
        const { thumbnails, thumbnailUrl, posterFrame, previewFrame, videoFrame, videoMetadata, ...rest } = clip;
        return {
          ...rest,
          type: 'audio',
          trackId: clip.trackId || 'audio',
          mediaId: newMedia.mediaId,
          url: newMedia.url,
          name: newMedia.name,
          baseDuration: newBaseDuration,
          duration: Math.min(clip.duration, newBaseDuration)
        };
      }

      return {
        ...clip,
        type: clip.type || 'video',
        trackId: clip.trackId || 'video',
        mediaId: newMedia.mediaId,
        url: newMedia.url,
        name: newMedia.name,
        thumbnails: newMedia.thumbnails && newMedia.thumbnails.length > 0 ? newMedia.thumbnails : clip.thumbnails,
        baseDuration: newBaseDuration,
        duration: Math.min(clip.duration, newBaseDuration)
      };
    }

    if (isLinkedAudio) {
      const { thumbnails, thumbnailUrl, posterFrame, previewFrame, videoFrame, videoMetadata, ...cleanAudioClip } = clip;
      return {
        ...cleanAudioClip,
        type: 'audio',
        trackId: clip.trackId || 'audio',
        mediaId: newMedia.mediaId,
        url: newMedia.url,
        name: `${newMedia.name} (Audio)`,
        baseDuration: newBaseDuration,
        duration: Math.min(clip.duration, newBaseDuration)
      };
    }

    if (isAudioClip) {
      const { thumbnails, thumbnailUrl, posterFrame, previewFrame, videoFrame, videoMetadata, ...cleanAudioClip } = clip;
      return {
        ...cleanAudioClip,
        type: 'audio',
        trackId: clip.trackId || 'audio'
      };
    }

    return clip;
  });
}

describe('Media Replacement Isolation', () => {
  it('should update video clip metadata on replace while leaving audio clips strictly audio and thumbnail-free', () => {
    const initialClips: TimelineClip[] = [
      {
        id: 'clip-video-1',
        mediaId: 'media-v1',
        type: 'video',
        trackId: 'video',
        url: 'blob:video1',
        name: 'Video 1.mp4',
        thumbnails: ['v1_thumb1.jpg', 'v1_thumb2.jpg'],
        duration: 10
      },
      {
        id: 'clip-audio-1',
        mediaId: 'media-v1',
        type: 'audio',
        trackId: 'audio',
        url: 'blob:audio1',
        name: 'Extracted Audio 1.wav',
        isDetachedAudio: true,
        duration: 10
      }
    ];

    const replacementMedia = {
      mediaId: 'media-v2',
      url: 'blob:video2',
      name: 'Replacement Video.mp4',
      thumbnails: ['v2_thumb1.jpg', 'v2_thumb2.jpg', 'v2_thumb3.jpg'],
      duration: 15
    };

    const updatedClips = replaceMediaInClips(initialClips, 'clip-video-1', replacementMedia);

    const videoClip = updatedClips.find(c => c.id === 'clip-video-1')!;
    const audioClip = updatedClips.find(c => c.id === 'clip-audio-1')!;

    // Video clip checks
    expect(videoClip.mediaId).toBe('media-v2');
    expect(videoClip.url).toBe('blob:video2');
    expect(videoClip.type).toBe('video');
    expect(videoClip.thumbnails).toEqual(['v2_thumb1.jpg', 'v2_thumb2.jpg', 'v2_thumb3.jpg']);

    // Audio clip checks
    expect(audioClip.type).toBe('audio');
    expect(audioClip.trackId).toBe('audio');
    expect(audioClip.thumbnails).toBeUndefined();
    expect(audioClip.thumbnailUrl).toBeUndefined();
    expect(audioClip.posterFrame).toBeUndefined();
  });

  it('should update linked extracted audio clip mediaId and url when parent video is replaced', () => {
    const initialClips: TimelineClip[] = [
      {
        id: 'clip-video-1',
        mediaId: 'media-v1',
        type: 'video',
        trackId: 'video',
        url: 'blob:video1',
        name: 'Video 1.mp4',
        duration: 10
      },
      {
        id: 'clip-audio-1',
        mediaId: 'media-v1',
        type: 'audio',
        trackId: 'audio',
        url: 'blob:video1',
        name: 'Video 1.mp4 (Audio)',
        isDetachedAudio: true,
        sourceVideoId: 'clip-video-1',
        duration: 10
      }
    ];

    const replacementMedia = {
      mediaId: 'media-v2',
      url: 'blob:video2',
      name: 'New Source.mp4',
      thumbnails: ['thumb.jpg'],
      duration: 12
    };

    const updatedClips = replaceMediaInClips(initialClips, 'clip-video-1', replacementMedia);
    const audioClip = updatedClips.find(c => c.id === 'clip-audio-1')!;

    expect(audioClip.mediaId).toBe('media-v2');
    expect(audioClip.url).toBe('blob:video2');
    expect(audioClip.type).toBe('audio');
    expect(audioClip.thumbnails).toBeUndefined();
  });

  it('should strictly preserve audio type if audio clip itself is replaced', () => {
    const initialClips: TimelineClip[] = [
      {
        id: 'clip-audio-1',
        mediaId: 'media-a1',
        type: 'audio',
        trackId: 'audio',
        url: 'blob:audio1',
        name: 'Song 1.mp3',
        duration: 20
      }
    ];

    const replacementAudio = {
      mediaId: 'media-a2',
      url: 'blob:audio2',
      name: 'Song 2.mp3',
      thumbnails: ['accidental_video_thumb.jpg'],
      duration: 25
    };

    const updatedClips = replaceMediaInClips(initialClips, 'clip-audio-1', replacementAudio);
    const audioClip = updatedClips[0];

    expect(audioClip.type).toBe('audio');
    expect(audioClip.trackId).toBe('audio');
    expect(audioClip.mediaId).toBe('media-a2');
    expect(audioClip.url).toBe('blob:audio2');
    expect(audioClip.thumbnails).toBeUndefined();
  });
});
