// settings.types.ts
// Strict interfaces for Settings feature across all 5 sections

export interface AccountSettingsData {
  displayName: string;
  username: string;
  email: string;
  phone: string;
  country: string;
  language: string;
  timezone: string;
  bio?: string;
  avatarUrl?: string;
}

export interface WorkspaceMember {
  id: string;
  userId: string;
  fullName: string;
  username: string;
  avatarUrl?: string;
  role: 'owner' | 'admin' | 'editor' | 'viewer';
  joinedAt: string;
}

export interface WorkspaceSettingsData {
  id: string;
  name: string;
  slug: string;
  ownerId: string;
  autoSave: boolean;
  autoRecovery: boolean;
  storageLimitBytes: number;
  members: WorkspaceMember[];
}

export interface NotificationSettingsData {
  desktop: boolean;
  email: boolean;
  updates: boolean;
  completion: boolean;
  marketing: boolean;
  teamActivity?: boolean;
}

export interface StorageBreakdown {
  rawVideosBytes: number;
  audioFilesBytes: number;
  imagesBytes: number;
  exportRendersBytes: number;
}

export interface StorageSummaryData {
  usedBytes: number;
  limitBytes: number;
  usedPercentage: number;
  assetCount: number;
  exportCount: number;
  breakdown: StorageBreakdown;
}

export interface SettingsSaveResult {
  success: boolean;
  message?: string;
  error?: string;
}
