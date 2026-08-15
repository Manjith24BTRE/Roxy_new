// settings.service.ts
// Service layer for the settings feature using authenticated Supabase & backend requests.

import { apiRequest } from '../../../lib/api';
import { supabase } from '../../../lib/supabase';
import { UserProfileData } from '../../../context/AuthContext';
import {
  AccountSettingsData,
  WorkspaceSettingsData,
  NotificationSettingsData,
  StorageSummaryData,
  SettingsSaveResult,
} from '../types/settings.types';

// --- 1. ACCOUNT SETTINGS ---
export async function fetchAccountSettings(): Promise<AccountSettingsData> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    return {
      displayName: profile?.full_name || profile?.display_name || user.user_metadata?.full_name || 'Mavros Member',
      username: profile?.username || user.user_metadata?.username || 'mavros_member',
      email: user.email || 'member@mavros.in',
      phone: profile?.phone || user.user_metadata?.phone || '+91 98765 43210',
      country: profile?.country || user.user_metadata?.country || 'India',
      language: profile?.language || user.user_metadata?.language || 'English (US)',
      timezone: profile?.timezone || user.user_metadata?.timezone || 'UTC+5:30 (IST)',
      bio: profile?.bio || user.user_metadata?.bio || '',
      avatarUrl: profile?.avatar_url || user.user_metadata?.avatar_url || undefined,
    };
  } catch {
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
      bio: p.bio || '',
      avatarUrl: p.avatar_url || undefined,
    };
  }
}

export async function updateAccountSettings(data: Partial<AccountSettingsData>): Promise<SettingsSaveResult> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from('profiles')
        .update({
          display_name: data.displayName,
          username: data.username,
          phone: data.phone,
          country: data.country,
          language: data.language,
          timezone: data.timezone,
          bio: data.bio,
          avatar_url: data.avatarUrl,
        })
        .eq('user_id', user.id);

      await supabase.auth.updateUser({
        data: {
          full_name: data.displayName,
          username: data.username,
          phone: data.phone,
          country: data.country,
          language: data.language,
          timezone: data.timezone,
          bio: data.bio,
          avatar_url: data.avatarUrl,
        },
      });
    }

    return { success: true, message: 'Account settings saved successfully.' };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to save account settings.' };
  }
}

// --- 2. WORKSPACE SETTINGS ---
export async function fetchWorkspaceSettings(): Promise<WorkspaceSettingsData> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data: wm } = await supabase
      .from('workspace_members')
      .select('workspace_id, role')
      .eq('user_id', user.id)
      .maybeSingle();

    if (wm) {
      const { data: ws } = await supabase
        .from('workspaces')
        .select('*')
        .eq('id', wm.workspace_id)
        .maybeSingle();

      const { data: members } = await supabase
        .from('workspace_members')
        .select('id, user_id, role, joined_at')
        .eq('workspace_id', wm.workspace_id);

      const formattedMembers = await Promise.all((members || []).map(async (m) => {
        const { data: p } = await supabase.from('profiles').select('display_name, username, avatar_url').eq('user_id', m.user_id).maybeSingle();
        return {
          id: m.id,
          userId: m.user_id,
          fullName: p?.display_name || 'Team Member',
          username: p?.username || 'member',
          avatarUrl: p?.avatar_url || undefined,
          role: m.role as any,
          joinedAt: m.joined_at,
        };
      }));

      return {
        id: ws?.id || 'ws-default',
        name: ws?.name || "Personal Workspace",
        slug: ws?.slug || "workspace-default",
        ownerId: ws?.owner_id || user.id,
        autoSave: ws?.settings?.auto_save ?? true,
        autoRecovery: ws?.settings?.auto_recovery ?? true,
        storageLimitBytes: ws?.storage_limit_bytes || 10737418240,
        members: formattedMembers,
      };
    }
  } catch {}

  return {
    id: 'ws-default',
    name: 'Personal Workspace',
    slug: 'workspace-default',
    ownerId: 'owner-id',
    autoSave: true,
    autoRecovery: true,
    storageLimitBytes: 10737418240,
    members: [],
  };
}

export async function updateWorkspaceSettings(data: { name?: string; autoSave?: boolean; autoRecovery?: boolean }): Promise<SettingsSaveResult> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: wm } = await supabase
        .from('workspace_members')
        .select('workspace_id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (wm) {
        const updatePayload: any = {};
        if (data.name !== undefined) updatePayload.name = data.name;
        if (data.autoSave !== undefined || data.autoRecovery !== undefined) {
          updatePayload.settings = {
            auto_save: data.autoSave ?? true,
            auto_recovery: data.autoRecovery ?? true,
          };
        }
        await supabase.from('workspaces').update(updatePayload).eq('id', wm.workspace_id);
      }
    }
    return { success: true, message: 'Workspace settings saved successfully.' };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to save workspace settings.' };
  }
}

// --- 3. NOTIFICATION SETTINGS ---
export async function fetchNotificationSettings(): Promise<NotificationSettingsData> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: notif } = await supabase
        .from('user_notification_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (notif) {
        return {
          desktop: notif.push_notifications ?? true,
          email: notif.email_notifications ?? true,
          updates: notif.product_updates ?? true,
          completion: notif.export_completion_notifications ?? true,
          marketing: notif.marketing_emails ?? false,
          teamActivity: notif.team_activity_notifications ?? true,
        };
      }
    }
  } catch {}

  return {
    desktop: true,
    email: true,
    updates: true,
    completion: true,
    marketing: false,
    teamActivity: true,
  };
}

export async function updateNotificationSettings(data: NotificationSettingsData): Promise<SettingsSaveResult> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('user_notification_settings').upsert({
        user_id: user.id,
        push_notifications: data.desktop,
        email_notifications: data.email,
        product_updates: data.updates,
        export_completion_notifications: data.completion,
        marketing_emails: data.marketing,
        team_activity_notifications: data.teamActivity ?? true,
      }, { onConflict: 'user_id' });
    }
    return { success: true, message: 'Notification preferences saved successfully.' };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to save notification preferences.' };
  }
}

// --- 4. STORAGE SUMMARY ---
export async function fetchStorageSummary(): Promise<StorageSummaryData> {
  try {
    const res = await apiRequest<{ success: boolean; data: StorageSummaryData }>('/settings/storage/summary');
    if (res?.success && res.data) {
      return res.data;
    }
  } catch {}

  return {
    usedBytes: 0,
    limitBytes: 10737418240,
    usedPercentage: 0,
    assetCount: 0,
    exportCount: 0,
    breakdown: {
      rawVideosBytes: 0,
      audioFilesBytes: 0,
      imagesBytes: 0,
      exportRendersBytes: 0,
    },
  };
}
