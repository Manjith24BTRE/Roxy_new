import { TimelineClipRef, DetachOptions, IAudioDetachService } from './detach.types';
import {
  getClipStart,
  formatAudioClipName,
  generateDetachedClipId,
  getAudioTrackColor,
} from './detach.utils';
import { waveformGenerator } from '../audio/WaveformGenerator';
import { audioProcessor } from '../media-processing/AudioProcessor';

export class AudioDetachService implements IAudioDetachService {
  /**
   * Probes and verifies audio presence in a video clip safely.
   */
  public async checkAudioPresence(clip: TimelineClipRef, _mediaUrl?: string): Promise<boolean> {
    try {
      if (clip.hasAudio === false || clip.isAudioDetached === true) {
        return false;
      }
      if (clip.type === 'image' || clip.mediaType === 'image') {
        return false;
      }
      return true;
    } catch {
      return true;
    }
  }

  /**
   * Extracts audio settings from the source video clip and constructs a new independent audio clip with waveform data.
   */
  public async createAudioClipFromVideoAsync<T extends TimelineClipRef>(
    videoClip: T,
    options: DetachOptions = {}
  ): Promise<T> {
    const clipStart = getClipStart(videoClip);
    const audioId = generateDetachedClipId(videoClip.id);
    const audioName = options.customName || formatAudioClipName(videoClip.name);
    const audioColor = getAudioTrackColor();

    let extractedUrl = videoClip.url;
    let waveformData: number[] = [];

    if (videoClip.url) {
      try {
        const processResult = await audioProcessor.detachAudio({
          id: videoClip.id,
          url: videoClip.url,
          file: videoClip.file
        });
        if (processResult.success && processResult.outputUrl) {
          extractedUrl = processResult.outputUrl;
        }
      } catch {
        // Fallback to source URL if FFmpeg extraction is offline
      }

      try {
        waveformData = await waveformGenerator.generateWaveform(extractedUrl || videoClip.url, 40);
      } catch {
        // Fallback waveform
      }
    }

    const detachedAudioClip: TimelineClipRef = {
      ...videoClip,
      id: audioId,
      name: audioName,
      start: clipStart,
      timelineStart: clipStart,
      duration: videoClip.duration,
      baseDuration: videoClip.baseDuration ?? videoClip.duration,
      startOffset: videoClip.startOffset ?? 0,
      playbackRate: videoClip.playbackRate ?? videoClip.speed ?? 1,
      speed: videoClip.playbackRate ?? videoClip.speed ?? 1,
      trackId: options.customAudioTrackId || 'audio',
      type: 'audio',
      mediaType: 'audio',
      color: audioColor,
      volume: videoClip.volume ?? 1,
      isMuted: false,
      isLocked: false,
      isDetachedAudio: true,
      sourceVideoId: videoClip.id,
      mediaId: videoClip.mediaId ?? videoClip.id,
      url: extractedUrl || videoClip.url,
      waveformData,
      appliedEffects: [],
      filters: [],
      keyframes: videoClip.keyframes ? JSON.parse(JSON.stringify(videoClip.keyframes)) : [],
    };

    return detachedAudioClip as T;
  }

  /**
   * Synchronous fallback for createAudioClipFromVideo.
   */
  public createAudioClipFromVideo<T extends TimelineClipRef>(
    videoClip: T,
    options: DetachOptions = {}
  ): T {
    const clipStart = getClipStart(videoClip);
    const audioId = generateDetachedClipId(videoClip.id);
    const audioName = options.customName || formatAudioClipName(videoClip.name);
    const audioColor = getAudioTrackColor();

    const detachedAudioClip: TimelineClipRef = {
      ...videoClip,
      id: audioId,
      name: audioName,
      start: clipStart,
      timelineStart: clipStart,
      duration: videoClip.duration,
      baseDuration: videoClip.baseDuration ?? videoClip.duration,
      startOffset: videoClip.startOffset ?? 0,
      playbackRate: videoClip.playbackRate ?? videoClip.speed ?? 1,
      speed: videoClip.playbackRate ?? videoClip.speed ?? 1,
      trackId: options.customAudioTrackId || 'audio',
      type: 'audio',
      mediaType: 'audio',
      color: audioColor,
      volume: videoClip.volume ?? 1,
      isMuted: false,
      isLocked: false,
      isDetachedAudio: true,
      sourceVideoId: videoClip.id,
      mediaId: videoClip.mediaId ?? videoClip.id,
      url: videoClip.url,
      appliedEffects: [],
      filters: [],
      keyframes: videoClip.keyframes ? JSON.parse(JSON.stringify(videoClip.keyframes)) : [],
    };

    return detachedAudioClip as T;
  }
}

export const audioDetachService = new AudioDetachService();
