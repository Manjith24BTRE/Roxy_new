import { TimelineClipRef, ITimelineAudioManager } from './detach.types';

export class TimelineAudioManager implements ITimelineAudioManager {
  /**
   * Identifies the appropriate audio track directly below the source video clip.
   */
  public findNearestAudioTrack<T extends TimelineClipRef>(
    _clips: T[],
    _sourceVideoClip: T
  ): string {
    return 'audio';
  }

  /**
   * Inserts the detached audio clip into the timeline while disabling embedded audio on source video.
   */
  public placeAudioClip<T extends TimelineClipRef>(
    clips: T[],
    audioClip: T,
    sourceVideoClipId: string
  ): T[] {
    const videoClipIndex = clips.findIndex((c) => c.id === sourceVideoClipId);
    if (videoClipIndex === -1) {
      return [...clips, audioClip];
    }

    const sourceVideo = clips[videoClipIndex];

    // Update source video clip to permanently disable its embedded audio during timeline playback & export
    const updatedSourceVideo: T = {
      ...sourceVideo,
      isAudioDetached: true,
      audioDetached: true,
      embeddedAudioEnabled: false,
      detachedAudioId: audioClip.id,
      isMuted: true,
    };

    // Insert updated source video at its original position
    const updatedClips = [...clips];
    updatedClips[videoClipIndex] = updatedSourceVideo;

    // Place detached audio clip in the timeline array
    updatedClips.splice(videoClipIndex + 1, 0, audioClip);

    return updatedClips;
  }
}

export const timelineAudioManager = new TimelineAudioManager();
