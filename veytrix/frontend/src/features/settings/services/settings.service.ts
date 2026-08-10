// settings.service.ts
// Service layer for the settings feature using authenticated backend requests.

import { apiRequest } from '../../../lib/api';
import { UserProfileData } from '../../../context/AuthContext';
import { AccountSettingsData, ProfileSettingsData, SettingsSaveResult } from '../types/settings.types';

export async function fetchAccountSettings(): Promise<AccountSettingsData> {
  const res = await apiRequest<{ success: boolean; profile?: UserProfileData; user?: UserProfileData }>('/auth/me');
  const p: Partial<UserProfileData> = res?.profile || res?.user || {};
  return {
    displayName: p.display_name || p.full_name || 'Mavros Member',
    username: p.username || 'mavros_member',
    email: p.email || 'member@mavros.in',
    phone: p.phone || '+91 98765 43210',
    country: p.country || 'India',
    language: p.language || 'English (US)',
    timezone: p.timezone || 'UTC+5:30 (IST)',
    avatarUrl: p.avatar_url || undefined,
  };
}

export async function updateAccountSettings(data: Partial<AccountSettingsData>): Promise<SettingsSaveResult> {
  try {
    const payload = {
      display_name: data.displayName,
      username: data.username,
      email: data.email,
      phone: data.phone,
      country: data.country,
      language: data.language,
      timezone: data.timezone,
    };
    await apiRequest<{ success: boolean }>('/auth/me/profile', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    return { success: true, message: 'Account settings saved successfully.' };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to save account settings.' };
  }
}

export async function fetchProfileSettings(): Promise<ProfileSettingsData> {
  const res = await apiRequest<{ success: boolean; profile?: UserProfileData; user?: UserProfileData }>('/auth/me');
  const p: Partial<UserProfileData> = res?.profile || res?.user || {};
  const socials = p.social_links || p.socialLinks || {};
  return {
    bio: p.bio || 'Video editing enthusiast & content creator.',
    occupation: p.occupation || 'Creative Director',
    company: p.company || 'Mavros Tech Pvt Ltd',
    website: p.website || 'https://mavros.in',
    portfolio: p.portfolio || 'https://portfolio.mavros.in',
    socialLinks: {
      linkedin: socials.linkedin || 'https://linkedin.com/in/mavros',
      instagram: socials.instagram || 'https://instagram.com/mavros',
      twitter: socials.twitter || 'https://twitter.com/mavros',
    },
  };
}

export async function updateProfileSettings(data: Partial<ProfileSettingsData>): Promise<SettingsSaveResult> {
  try {
    const payload = {
      bio: data.bio,
      occupation: data.occupation,
      company: data.company,
      website: data.website,
      portfolio: data.portfolio,
      social_links: data.socialLinks,
    };
    await apiRequest<{ success: boolean }>('/auth/me/profile', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    return { success: true, message: 'Public profile saved successfully.' };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to save public profile.' };
  }
}
