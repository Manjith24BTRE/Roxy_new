// useSettings.ts
// Primary hook for managing settings state, loading, saving, toast notifications, and AuthContext sync.

import { useState, useCallback } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { fetchAccountSettings, fetchProfileSettings } from '../services/settings.service';
import { AccountSettingsData, ProfileSettingsData } from '../types/settings.types';

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
      await updateUserProfile({
        display_name: data.displayName,
        username: data.username,
        email: data.email,
        phone: data.phone,
        country: data.country,
        language: data.language,
        timezone: data.timezone,
      });
      showToast('Account settings saved successfully!', 'success');
    } catch (err: any) {
      showToast(err?.message || 'Error saving account settings.', 'error');
    } finally {
      setIsSaving(false);
    }
  }, [updateUserProfile, showToast]);

  const saveProfile = useCallback(async (data: ProfileSettingsData) => {
    setIsSaving(true);
    try {
      await updateUserProfile({
        bio: data.bio,
        occupation: data.occupation,
        company: data.company,
        website: data.website,
        portfolio: data.portfolio,
        social_links: data.socialLinks,
        socialLinks: data.socialLinks,
      });
      showToast('Public profile saved successfully!', 'success');
    } catch (err: any) {
      showToast(err?.message || 'Error saving public profile.', 'error');
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
    saveProfile,
    fetchAccountSettings,
    fetchProfileSettings,
  };
}

export default useSettings;
