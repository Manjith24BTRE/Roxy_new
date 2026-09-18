import { supabase, supabaseAdmin } from '../lib/supabase';

export interface UnifiedNotification {
  id: string;
  userId?: string | null;
  title: string;
  message: string;
  type: 'announcement' | 'support_resolved' | 'credit_added' | 'credit_deducted' | 'security_alert' | 'system_maintenance' | 'general';
  priority?: string;
  isRead: boolean;
  createdAt: string;
  actionUrl?: string | null;
  metadata?: Record<string, any>;
}

const READ_STORAGE_KEY = 'veytrix_read_notification_ids';

const getStoredReadIds = (): Set<string> => {
  try {
    const storage = typeof window !== 'undefined' ? window.localStorage : (globalThis as any).localStorage;
    if (storage) {
      const raw = storage.getItem(READ_STORAGE_KEY);
      return raw ? new Set(JSON.parse(raw)) : new Set();
    }
  } catch {
    // fallback
  }
  return new Set();
};

const storeReadId = (id: string) => {
  try {
    const storage = typeof window !== 'undefined' ? window.localStorage : (globalThis as any).localStorage;
    if (storage) {
      const current = getStoredReadIds();
      current.add(id);
      storage.setItem(READ_STORAGE_KEY, JSON.stringify(Array.from(current)));
    }
  } catch (err) {
    console.warn('Failed to store read notification state:', err);
  }
};

export const unifiedNotificationService = {
  /**
   * Aggregates notifications from public.notifications, public.support_notifications,
   * and active public.platform_announcements.
   */
  async getNotifications(userId?: string): Promise<UnifiedNotification[]> {
    const readIds = getStoredReadIds();
    const results: UnifiedNotification[] = [];

    try {
      // 1. Fetch from public.notifications
      let notifQuery = supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (userId) {
        notifQuery = notifQuery.or(`user_id.eq.${userId},user_id.is.null`);
      }

      const { data: dbNotifs } = await notifQuery;
      if (dbNotifs) {
        dbNotifs.forEach((n) => {
          results.push({
            id: n.id,
            userId: n.user_id,
            title: n.title,
            message: n.message,
            type: n.type || 'general',
            priority: n.priority || 'medium',
            isRead: n.is_read || readIds.has(n.id),
            createdAt: n.created_at,
            actionUrl: n.action_url || null,
            metadata: n.metadata || {},
          });
        });
      }

      // 2. Fetch from public.support_notifications
      if (userId) {
        const { data: supportNotifs } = await supabase
          .from('support_notifications')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(20);

        if (supportNotifs) {
          supportNotifs.forEach((s) => {
            // Avoid duplicate if already in notifications
            if (!results.some((r) => r.id === s.id)) {
              results.push({
                id: s.id,
                userId: s.user_id,
                title: s.title || 'Support Ticket Resolved',
                message: s.message,
                type: 'support_resolved',
                priority: 'high',
                isRead: s.is_read || readIds.has(s.id),
                createdAt: s.created_at,
                actionUrl: '/help',
              });
            }
          });
        }
      }

      // 3. Fetch active platform announcements
      const nowIso = new Date().toISOString();
      const { data: announcements } = await supabase
        .from('platform_announcements')
        .select('*')
        .eq('status', 'Active')
        .order('created_at', { ascending: false })
        .limit(10);

      if (announcements) {
        announcements.forEach((a) => {
          // Check start/expiration timestamps
          const isStarted = !a.starts_at || new Date(a.starts_at) <= new Date();
          const isNotExpired = !a.expires_at || new Date(a.expires_at) > new Date();

          if (isStarted && isNotExpired) {
            const notifId = `announcement_${a.id}`;
            if (!results.some((r) => r.id === notifId || r.id === a.id)) {
              results.push({
                id: notifId,
                title: a.title,
                message: a.message,
                type: 'announcement',
                priority: a.priority || 'medium',
                isRead: readIds.has(notifId) || readIds.has(a.id),
                createdAt: a.created_at || nowIso,
                actionUrl: a.cta_url || null,
              });
            }
          }
        });
      }
    } catch (err) {
      console.warn('Error fetching unified notifications:', err);
    }

    // Sort combined stream by created_at DESC
    return results.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  /**
   * Marks a notification as read in database and local storage.
   */
  async markAsRead(id: string, userId?: string): Promise<boolean> {
    storeReadId(id);

    if (!id.startsWith('announcement_')) {
      Promise.allSettled([
        supabase.from('notifications').update({ is_read: true }).eq('id', id),
        supabase.from('support_notifications').update({ is_read: true }).eq('id', id),
      ]).catch(() => {});
    }

    return true;
  },

  /**
   * Marks all notifications as read.
   */
  async markAllAsRead(notifications: UnifiedNotification[], userId?: string): Promise<boolean> {
    notifications.forEach((n) => storeReadId(n.id));

    if (userId) {
      Promise.allSettled([
        supabase.from('notifications').update({ is_read: true }).eq('user_id', userId),
        supabase.from('support_notifications').update({ is_read: true }).eq('user_id', userId),
      ]).catch(() => {});
    }

    return true;
  },

  /**
   * Subscribes to Supabase Realtime updates on notifications, support_notifications,
   * and platform_announcements tables.
   */
  subscribeToNotifications(userId: string | undefined, onChange: () => void) {
    const channel = supabase
      .channel(`public:unified_notifications:${userId || 'global'}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notifications' },
        () => onChange()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'support_notifications' },
        () => onChange()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'platform_announcements' },
        () => onChange()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },
};
