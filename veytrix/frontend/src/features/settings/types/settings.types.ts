// settings.types.ts
// Strict interfaces for Settings feature (Phase 1A: Account Settings)

export interface AccountSettingsData {
  displayName: string;
  username: string;
  email: string;
  phone: string;
  country: string;
  language: string;
  timezone: string;
  avatarUrl?: string;
}

export interface SettingsSaveResult {
  success: boolean;
  message?: string;
  error?: string;
}
