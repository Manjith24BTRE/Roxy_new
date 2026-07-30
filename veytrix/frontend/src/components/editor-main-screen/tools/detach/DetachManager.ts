import {
  TimelineClipRef,
  DetachOptions,
  DetachedAudioResult,
  DetachValidationResult,
  IDetachManager,
} from './detach.types';
import { validateDetach } from './validation';
import { AudioDetachService } from './AudioDetachService';
import { TimelineAudioManager } from './TimelineAudioManager';

export class DetachManager implements IDetachManager {
  private audioDetachService: AudioDetachService;
  private timelineAudioManager: TimelineAudioManager;

  constructor(
    audioDetachService = new AudioDetachService(),
    timelineAudioManager = new TimelineAudioManager()
  ) {
    this.audioDetachService = audioDetachService;
    this.timelineAudioManager = timelineAudioManager;
  }

  /**
   * Validates whether a clip is eligible for detaching audio.
   */
  public validate(
    clip: TimelineClipRef | null | undefined,
    clips: TimelineClipRef[] = []
  ): DetachValidationResult {
    return validateDetach(clip, clips);
  }

  /**
   * Asynchronously executes full Audio Detach or Re-attach toggle workflow.
   */
  public async detachAudioAsync<T extends TimelineClipRef>(
    clips: T[],
    clipId: string,
    options: DetachOptions = {}
  ): Promise<DetachedAudioResult<T> | null> {
    const { showToast } = options;
    const clipIndex = clips.findIndex((c) => c.id === clipId);

    if (clipIndex === -1) {
      if (showToast) showToast('Select a video clip to detach audio.');
      return null;
    }

    const sourceClip = clips[clipIndex];

    // TOGGLE CHECK: If audio is already detached or if selecting the detached audio clip, re-attach audio!
    if (sourceClip.isAudioDetached || sourceClip.audioDetached || sourceClip.embeddedAudioEnabled === false || sourceClip.isDetachedAudio) {
      const detachedClipId = sourceClip.isDetachedAudio ? sourceClip.id : sourceClip.detachedAudioId;
      if (detachedClipId) {
        const updatedClips = this.undoDetach(clips, detachedClipId);
        const restoredSource = updatedClips.find((c) => c.id === (sourceClip.sourceVideoId || sourceClip.id)) || sourceClip;
        if (showToast) {
          showToast(`Re-attached audio track to ${restoredSource.name}`);
        }
        return {
          updatedClips,
          detachedClip: sourceClip,
          sourceClip: restoredSource,
        };
      }
    }

    const validation = this.validate(sourceClip, clips);

    if (!validation.canDetach) {
      if (showToast) {
        showToast(validation.reason || "This video doesn't contain an audio track.");
      }
      return null;
    }

    // Async audio clip creation (FFmpeg extraction + waveform generation)
    const audioClip = await this.audioDetachService.createAudioClipFromVideoAsync(sourceClip, options);
    audioClip.trackId = 'audio';

    // Place audio clip into timeline and disable video's internal audio
    const updatedClips = this.timelineAudioManager.placeAudioClip(
      clips,
      audioClip,
      sourceClip.id
    );

    const updatedSourceClip = updatedClips.find((c) => c.id === sourceClip.id) || sourceClip;

    if (showToast) {
      showToast(`Detached audio track from ${sourceClip.name}`);
    }

    return {
      updatedClips,
      detachedClip: audioClip,
      sourceClip: updatedSourceClip,
    };
  }

  /**
   * Synchronous execution fallback for Audio Detach / Re-attach workflow.
   */
  public detachAudio<T extends TimelineClipRef>(
    clips: T[],
    clipId: string,
    options: DetachOptions = {}
  ): DetachedAudioResult<T> | null {
    const { showToast } = options;
    const clipIndex = clips.findIndex((c) => c.id === clipId);

    if (clipIndex === -1) {
      if (showToast) showToast('Select a video clip to detach audio.');
      return null;
    }

    const sourceClip = clips[clipIndex];

    if (sourceClip.isAudioDetached || sourceClip.audioDetached || sourceClip.embeddedAudioEnabled === false || sourceClip.isDetachedAudio) {
      const detachedClipId = sourceClip.isDetachedAudio ? sourceClip.id : sourceClip.detachedAudioId;
      if (detachedClipId) {
        const updatedClips = this.undoDetach(clips, detachedClipId);
        const restoredSource = updatedClips.find((c) => c.id === (sourceClip.sourceVideoId || sourceClip.id)) || sourceClip;
        if (showToast) {
          showToast(`Re-attached audio track to ${restoredSource.name}`);
        }
        return {
          updatedClips,
          detachedClip: sourceClip,
          sourceClip: restoredSource,
        };
      }
    }

    const validation = this.validate(sourceClip, clips);

    if (!validation.canDetach) {
      if (showToast) {
        showToast(validation.reason || "This video doesn't contain an audio track.");
      }
      return null;
    }

    const audioClip = this.audioDetachService.createAudioClipFromVideo(sourceClip, options);
    audioClip.trackId = 'audio';

    const updatedClips = this.timelineAudioManager.placeAudioClip(
      clips,
      audioClip,
      sourceClip.id
    );

    const updatedSourceClip = updatedClips.find((c) => c.id === sourceClip.id) || sourceClip;

    if (showToast) {
      showToast(`Detached audio track from ${sourceClip.name}`);
    }

    return {
      updatedClips,
      detachedClip: audioClip,
      sourceClip: updatedSourceClip,
    };
  }

  /**
   * Reverses an audio detach operation by restoring original video properties and removing the detached clip.
   */
  public undoDetach<T extends TimelineClipRef>(
    clips: T[],
    detachedClipId: string
  ): T[] {
    const detachedClip = clips.find((c) => c.id === detachedClipId);
    const sourceVideoId = detachedClip?.sourceVideoId;

    const filteredClips = clips.filter((c) => c.id !== detachedClipId);

    if (!sourceVideoId) {
      return filteredClips;
    }

    return filteredClips.map((c) => {
      if (c.id === sourceVideoId) {
        return {
          ...c,
          isAudioDetached: false,
          audioDetached: false,
          embeddedAudioEnabled: true,
          detachedAudioId: undefined,
          isMuted: false,
        };
      }
      return c;
    });
  }
}

export const detachManager = new DetachManager();
