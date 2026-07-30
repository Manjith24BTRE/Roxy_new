import { AudioAsset, IAudioImporter, ImportAudioOptions } from './Audio.types';
import { validateAudioFile } from './validation';
import { generateAudioId, getFileExtension, readAudioDuration } from './audio.utils';
import { waveformGenerator } from './WaveformGenerator';

export class AudioImporter implements IAudioImporter {
  async importAudioFile(file: File, options: ImportAudioOptions = {}): Promise<AudioAsset | null> {
    const validation = validateAudioFile(file);

    if (!validation.isValid) {
      if (options.showToast && validation.reason) {
        options.showToast(validation.reason);
      }
      return null;
    }

    try {
      const url = URL.createObjectURL(file);
      const ext = getFileExtension(file.name);
      const duration = await readAudioDuration(file);
      const waveformData = await waveformGenerator.generateWaveform(file);

      const asset: AudioAsset = {
        id: generateAudioId('asset_audio'),
        name: file.name,
        url,
        file,
        duration,
        format: ext.toUpperCase() || 'AUDIO',
        waveformData,
        icon: '🎵',
        size: file.size,
        createdAt: Date.now()
      };

      if (options.showToast) {
        options.showToast(`Imported "${file.name}"`);
      }

      return asset;
    } catch (err: any) {
      if (options.showToast) {
        options.showToast(err?.message || 'Failed to import audio file.');
      }
      return null;
    }
  }
}

export const audioImporter = new AudioImporter();
