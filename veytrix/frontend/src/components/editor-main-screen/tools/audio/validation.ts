import { AudioValidationResult } from './Audio.types';
import { getFileExtension, isAudioExtensionSupported, SUPPORTED_AUDIO_MIMES } from './audio.utils';

export function validateAudioFile(file: File | null | undefined): AudioValidationResult {
  if (!file) {
    return { isValid: false, reason: 'No file selected.' };
  }

  const ext = getFileExtension(file.name);
  const type = file.type?.toLowerCase() || '';

  const isExtValid = isAudioExtensionSupported(ext);
  const isMimeValid = SUPPORTED_AUDIO_MIMES.some((m) => type.includes(m.replace('audio/', '')));

  if (!isExtValid && !isMimeValid) {
    return { isValid: false, reason: 'Unsupported audio format.' };
  }

  return { isValid: true };
}
