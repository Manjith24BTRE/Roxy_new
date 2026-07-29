export interface RenameValidationResult {
  isValid: boolean;
  sanitizedName: string;
  error?: string;
}

export interface RenameResult<T = any> {
  success: boolean;
  updatedClips: T[];
  oldName?: string;
  newName?: string;
  message?: string;
}

export interface RenameOptions {
  showToast?: (message: string) => void;
}

export interface RenameDialogProps {
  isOpen: boolean;
  currentName: string;
  onRename: (newName: string) => void;
  onCancel: () => void;
}
