import { IWaveformGenerator } from './Audio.types';

export class WaveformGenerator implements IWaveformGenerator {
  /**
   * Generates normalized peak values (0.1 to 1.0) for audio waveform visualization.
   */
  async generateWaveform(fileOrUrl: File | Blob | string, numPeaks: number = 40): Promise<number[]> {
    if (typeof window === 'undefined') {
      return this.generateFallbackPeaks(numPeaks);
    }

    try {
      let arrayBuffer: ArrayBuffer;

      if (typeof fileOrUrl !== 'string' && fileOrUrl instanceof Blob) {
        arrayBuffer = await fileOrUrl.arrayBuffer();
      } else if (typeof fileOrUrl === 'string') {
        const response = await fetch(fileOrUrl);
        arrayBuffer = await response.arrayBuffer();
      } else {
        return this.generateFallbackPeaks(numPeaks);
      }

      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioCtxClass();

      const decodedBuffer = await new Promise<AudioBuffer>((resolve, reject) => {
        audioCtx.decodeAudioData(
          arrayBuffer,
          (buffer) => resolve(buffer),
          (err) => reject(err)
        );
      });

      const channelData = decodedBuffer.getChannelData(0);
      const step = Math.floor(channelData.length / numPeaks);
      const peaks: number[] = [];

      for (let i = 0; i < numPeaks; i++) {
        const start = i * step;
        let max = 0;
        for (let j = 0; j < step; j += 10) {
          const val = Math.abs(channelData[start + j] || 0);
          if (val > max) max = val;
        }
        peaks.push(Math.max(0.15, Math.min(1.0, max)));
      }

      audioCtx.close().catch(() => {});
      return peaks;
    } catch {
      return this.generateFallbackPeaks(numPeaks);
    }
  }

  private generateFallbackPeaks(count: number): number[] {
    const peaks: number[] = [];
    for (let i = 0; i < count; i++) {
      peaks.push(Math.max(0.2, Math.min(0.9, Math.sin(i * 0.5) * 0.4 + 0.5)));
    }
    return peaks;
  }
}

export const waveformGenerator = new WaveformGenerator();
