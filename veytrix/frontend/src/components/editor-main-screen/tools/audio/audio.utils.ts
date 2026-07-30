export const SUPPORTED_AUDIO_EXTENSIONS = ['mp3', 'wav', 'aac', 'm4a', 'ogg', 'flac'];

export const SUPPORTED_AUDIO_MIMES = [
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'audio/wave',
  'audio/x-wav',
  'audio/aac',
  'audio/x-m4a',
  'audio/mp4',
  'audio/ogg',
  'audio/flac',
  'audio/x-flac'
];

export function getFileExtension(filename: string): string {
  if (!filename) return '';
  const parts = filename.split('.');
  return parts.length > 1 ? parts.pop()!.toLowerCase() : '';
}

export function isAudioExtensionSupported(ext: string): boolean {
  return SUPPORTED_AUDIO_EXTENSIONS.includes(ext.toLowerCase());
}

export function generateAudioId(prefix: string = 'audio'): string {
  const randomStr = Math.random().toString(36).substring(2, 9);
  return `${prefix}_${Date.now()}_${randomStr}`;
}

export function formatAudioDuration(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export async function readAudioDuration(fileOrUrl: File | Blob | string): Promise<number> {
  if (typeof window === 'undefined') return 5;

  return new Promise((resolve) => {
    const audio = new Audio();
    const url = typeof fileOrUrl === 'string' ? fileOrUrl : URL.createObjectURL(fileOrUrl);

    const cleanup = () => {
      audio.onloadedmetadata = null;
      audio.onerror = null;
      if (typeof fileOrUrl !== 'string') {
        URL.revokeObjectURL(url);
      }
    };

    audio.onloadedmetadata = () => {
      const dur = audio.duration;
      cleanup();
      resolve(isNaN(dur) || !isFinite(dur) ? 5 : dur);
    };

    audio.onerror = () => {
      cleanup();
      resolve(5);
    };

    audio.src = url;
  });
}
