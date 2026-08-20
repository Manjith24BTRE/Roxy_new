import { useState, useCallback } from 'react';
import { useAuth } from '../../../context/AuthContext';
import {
  fetchAccountSettings,
  updateAccountSettings,
  fetchWorkspaceSettings,
  updateWorkspaceSettings,
  fetchNotificationSettings,
  updateNotificationSettings,
  fetchStorageSummary,
} from '../services/settings.service';
import { AccountSettingsData, NotificationSettingsData } from '../types/settings.types';

export interface ToastState {
  show: boolean;
  type: 'success' | 'error' | 'info';
  message: string;
}

export function useSettings() {
  const { userProfile, syncProfile, updateUserProfile } = useAuth();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [toast, setToast] = useState<ToastState>({ show: false, type: 'info', message: '' });

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ show: true, type, message });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 4000);
  }, []);

  const refreshSettings = useCallback(async () => {
    setIsLoading(true);
    try {
      await syncProfile();
      showToast('Settings refreshed.', 'info');
    } catch (err: any) {
      showToast(err?.message || 'Failed to refresh settings.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [syncProfile, showToast]);

  const saveAccount = useCallback(async (data: AccountSettingsData) => {
    setIsSaving(true);
    try {
      await updateAccountSettings(data);
      await updateUserProfile({
        display_name: data.displayName,
        username: data.username,
        email: data.email,
        phone: data.phone,
        country: data.country,
        language: data.language,
        timezone: data.timezone,
        bio: data.bio,
      });
      showToast('Account settings saved successfully!', 'success');
    } catch (err: any) {
      showToast(err?.message || 'Error saving account settings.', 'error');
    } finally {
      setIsSaving(false);
    }
  }, [updateUserProfile, showToast]);

  const saveWorkspace = useCallback(async (settings: { name?: string; autoSave?: boolean; autoRecovery?: boolean }) => {
    setIsSaving(true);
    try {
      await updateWorkspaceSettings(settings);
      await updateUserProfile({
        workspace_settings: {
          autoSave: settings.autoSave ?? true,
          autoRecovery: settings.autoRecovery ?? true,
        },
      });
      showToast('Workspace settings saved successfully!', 'success');
    } catch (err: any) {
      showToast(err?.message || 'Error saving workspace settings.', 'error');
    } finally {
      setIsSaving(false);
    }
  }, [updateUserProfile, showToast]);

  const saveNotifications = useCallback(async (settings: NotificationSettingsData) => {
    setIsSaving(true);
    try {
      await updateNotificationSettings(settings);
      await updateUserProfile({
        notification_settings: {
          desktop: settings.desktop,
          email: settings.email,
          updates: settings.updates,
          completion: settings.completion,
          marketing: settings.marketing,
        },
      });
      showToast('Notification preferences saved successfully!', 'success');
    } catch (err: any) {
      showToast(err?.message || 'Error saving notification preferences.', 'error');
    } finally {
      setIsSaving(false);
    }
  }, [updateUserProfile, showToast]);

  return {
    userProfile,
    isLoading,
    isSaving,
    toast,
    showToast,
    refreshSettings,
    saveAccount,
    saveWorkspace,
    saveNotifications,
    fetchAccountSettings,
    fetchWorkspaceSettings,
    fetchNotificationSettings,
    fetchStorageSummary,
  };
}

export default useSettings;
