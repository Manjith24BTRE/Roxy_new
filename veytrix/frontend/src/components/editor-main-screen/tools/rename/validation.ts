import { RenameValidationResult } from './rename.types';

/**
 * Validates a proposed clip name.
 * Trims leading/trailing whitespace, prevents empty names, supports unicode/hyphens/underscores/etc.
 */
export function validateClipName(rawName: string): RenameValidationResult {
  if (typeof rawName !== 'string') {
    return { isValid: false, sanitizedName: '', error: 'Name must be a valid string' };
  }

  const sanitizedName = rawName.trim();

  if (sanitizedName.length === 0) {
    return { isValid: false, sanitizedName: '', error: 'Clip name cannot be empty' };
  }

  if (sanitizedName.length > 255) {
    return {
      isValid: false,
      sanitizedName: sanitizedName.substring(0, 255),
      error: 'Clip name cannot exceed 255 characters',
    };
  }

  return {
    isValid: true,
    sanitizedName,
  };
}
