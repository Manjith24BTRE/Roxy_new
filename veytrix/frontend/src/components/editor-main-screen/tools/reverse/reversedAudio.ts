/**
 * Web Audio API & HTML5 Audio Reversed Audio Engine for VEYTRIX Video Editor.
 * Generates reversed audio buffers and reversed WAV Blob URLs for 100% sync preview & export.
 */

export function audioBufferToWavBlob(buffer: AudioBuffer): Blob {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const format = 1; // 16-bit PCM
  const bitDepth = 16;
  const bytesPerSample = bitDepth / 8;
  const blockAlign = numChannels * bytesPerSample;

  const dataLength = buffer.length * blockAlign;
  const bufferLength = 44 + dataLength;

  const arrayBuffer = new ArrayBuffer(bufferLength);
  const view = new DataView(arrayBuffer);

  const writeString = (v: DataView, offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      v.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + dataLength, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, format, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitDepth, true);
  writeString(view, 36, 'data');
  view.setUint32(40, dataLength, true);

  let offset = 44;
  for (let i = 0; i < buffer.length; i++) {
    for (let channel = 0; channel < numChannels; channel++) {
      const sample = Math.max(-1, Math.min(1, buffer.getChannelData(channel)[i]));
      const intSample = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
      view.setInt16(offset, intSample, true);
      offset += 2;
    }
  }

  return new Blob([arrayBuffer], { type: 'audio/wav' });
}

class ReversedAudioEngine {
  private static instance: ReversedAudioEngine;
  private audioCtx: AudioContext | null = null;
  private bufferCache: Map<string, AudioBuffer> = new Map();
  private blobUrlCache: Map<string, string> = new Map();
  private activeSourceNode: AudioBufferSourceNode | null = null;
  private activeGainNode: GainNode | null = null;
  private activeAudioElement: HTMLAudioElement | null = null;
  private currentPlayingClipId: string | null = null;

  private constructor() {}

  public static getInstance(): ReversedAudioEngine {
    if (!ReversedAudioEngine.instance) {
      ReversedAudioEngine.instance = new ReversedAudioEngine();
    }
    return ReversedAudioEngine.instance;
  }

  private getAudioContext(): AudioContext {
    if (!this.audioCtx || this.audioCtx.state === 'closed') {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      this.audioCtx = new AudioCtxClass();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }
    return this.audioCtx;
  }

  private decodeAudioDataAsync(ctx: AudioContext, arrayBuffer: ArrayBuffer): Promise<AudioBuffer> {
    return new Promise((resolve, reject) => {
      const bufferCopy = arrayBuffer.slice(0);
      try {
        const promise = ctx.decodeAudioData(
          bufferCopy,
          (decoded) => resolve(decoded),
          (err) => reject(err)
        );
        if (promise && typeof (promise as any).then === 'function') {
          (promise as any).then(resolve).catch(reject);
        }
      } catch (e) {
        reject(e);
      }
    });
  }

  /**
   * Pre-load and reverse the audio buffer for a clip file or url asynchronously.
   */
  public async loadAndReverseAudio(clipId: string, mediaSource: File | Blob | string): Promise<AudioBuffer | null> {
    if (!mediaSource) return null;
    if (this.bufferCache.has(clipId)) {
      return this.bufferCache.get(clipId)!;
    }

    try {
      let arrayBuffer: ArrayBuffer;
      if (typeof mediaSource !== 'string' && mediaSource instanceof Blob) {
        arrayBuffer = await mediaSource.arrayBuffer();
      } else if (typeof mediaSource === 'string' && mediaSource.length > 0) {
        const response = await fetch(mediaSource);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        arrayBuffer = await response.arrayBuffer();
      } else {
        return null;
      }

      const ctx = this.getAudioContext();
      const decodedBuffer = await this.decodeAudioDataAsync(ctx, arrayBuffer);

      if (!decodedBuffer || decodedBuffer.numberOfChannels === 0) {
        return null;
      }

      // Create reversed copy of AudioBuffer
      const reversedBuffer = ctx.createBuffer(
        decodedBuffer.numberOfChannels,
        decodedBuffer.length,
        decodedBuffer.sampleRate
      );

      for (let channel = 0; channel < decodedBuffer.numberOfChannels; channel++) {
        const inputData = decodedBuffer.getChannelData(channel);
        const outputData = reversedBuffer.getChannelData(channel);
        const len = inputData.length;
        for (let i = 0; i < len; i++) {
          outputData[i] = inputData[len - 1 - i];
        }
      }

      this.bufferCache.set(clipId, reversedBuffer);

      return reversedBuffer;
    } catch (err) {
      console.warn('Could not decode or reverse audio buffer for clip:', clipId, err);
      return null;
    }
  }

  /**
   * Get cached reversed audio Blob URL for export/media players.
   */
  public getReversedAudioBlobUrl(clipId: string): string | null {
    return this.blobUrlCache.get(clipId) || null;
  }

  /**
   * Start playing reversed audio synchronized with relative local playhead time.
   */
  public async playReversedAudio(
    clipId: string,
    mediaSource: File | Blob | string,
    relativeTime: number,
    duration: number,
    volume: number = 0.8,
    speed: number = 1
  ): Promise<void> {
    if (!mediaSource) return;

    // If already playing this clip, update volume
    if (this.currentPlayingClipId === clipId && this.activeSourceNode) {
      this.setVolume(volume);
      return;
    }

    this.stopReversedAudio();

    let reversedBuffer = this.bufferCache.get(clipId);
    if (!reversedBuffer) {
      reversedBuffer = (await this.loadAndReverseAudio(clipId, mediaSource)) || undefined;
    }

    if (!reversedBuffer) return;

    const ctx = this.getAudioContext();
    if (ctx.state === 'suspended') {
      await ctx.resume().catch(() => {});
    }

    try {
      const source = ctx.createBufferSource();
      source.buffer = reversedBuffer;
      source.playbackRate.value = Math.max(0.25, Math.min(8, speed));

      const gain = ctx.createGain();
      gain.gain.value = Math.max(0, Math.min(1, volume));

      source.connect(gain);
      gain.connect(ctx.destination);

      // Reversed offset math: relativeTime from clip start maps to buffer offset
      const totalDuration = reversedBuffer.duration;
      const startOffset = Math.max(0, Math.min(totalDuration, (relativeTime / duration) * totalDuration));

      source.start(0, startOffset);

      this.activeSourceNode = source;
      this.activeGainNode = gain;
      this.currentPlayingClipId = clipId;

      source.onended = () => {
        if (this.currentPlayingClipId === clipId) {
          this.stopReversedAudio();
        }
      };
    } catch (err) {
      console.warn('Error starting reversed audio playback:', err);
    }
  }

  /**
   * Update gain/volume dynamically while playing.
   */
  public setVolume(volume: number): void {
    if (this.activeGainNode && this.audioCtx) {
      this.activeGainNode.gain.setValueAtTime(
        Math.max(0, Math.min(1, volume)),
        this.audioCtx.currentTime
      );
    }
  }

  /**
   * Stop reversed audio playback immediately.
   */
  public stopReversedAudio(): void {
    if (this.activeSourceNode) {
      try {
        this.activeSourceNode.stop();
        this.activeSourceNode.disconnect();
      } catch {}
      this.activeSourceNode = null;
    }
    if (this.activeGainNode) {
      try {
        this.activeGainNode.disconnect();
      } catch {}
      this.activeGainNode = null;
    }
    if (this.activeAudioElement) {
      try {
        this.activeAudioElement.pause();
      } catch {}
      this.activeAudioElement = null;
    }
    this.currentPlayingClipId = null;
  }
}

export const reversedAudioEngine = ReversedAudioEngine.getInstance();
