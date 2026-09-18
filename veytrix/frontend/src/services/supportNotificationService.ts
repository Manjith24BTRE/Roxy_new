import { supabase, supabaseAdmin } from '../lib/supabase';

export interface SupportNotificationItem {
  id: string;
  userId: string;
  ticketId: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  ticketTitle?: string;
}

export const supportNotificationService = {
  /**
   * Fetches support notifications for a given user from database.
   */
  async getUserNotifications(userId?: string): Promise<SupportNotificationItem[]> {
    try {
      let targetUserId = userId;
      if (!targetUserId) {
        const { data: authData } = await supabase.auth.getUser();
        targetUserId = authData?.user?.id;
      }

      let query = supabase
        .from('support_notifications')
        .select('*')
        .order('created_at', { ascending: false });

      if (targetUserId) {
        query = query.eq('user_id', targetUserId);
      }

      const { data, error } = await query;

      if (!error && data) {
        return data.map((item) => ({
          id: item.id,
          userId: item.user_id,
          ticketId: item.ticket_id,
          title: item.title,
          message: item.message,
          type: item.type || 'support_resolved',
          isRead: item.is_read ?? false,
          createdAt: item.created_at,
        }));
      }
    } catch (err) {
      console.warn('Error loading support notifications:', err);
    }
    return [];
  },

  /**
   * Marks a support notification as read.
   */
  async markAsRead(notificationId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('support_notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (!error) return true;

      const { error: adminError } = await supabaseAdmin
        .from('support_notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      return !adminError;
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
      return false;
    }
  },

  /**
   * Marks all notifications for a user as read.
   */
  async markAllAsRead(userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('support_notifications')
        .update({ is_read: true })
        .eq('user_id', userId);

      return !error;
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
      return false;
    }
  },

  /**
   * Reopens a support ticket (status -> 'open').
   */
  async reopenTicket(ticketId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('support_tickets')
        .update({ status: 'open', updated_at: new Date().toISOString() })
        .eq('id', ticketId);

      if (!error) return true;

      const { error: adminError } = await supabaseAdmin
        .from('support_tickets')
        .update({ status: 'open', updated_at: new Date().toISOString() })
        .eq('id', ticketId);

      return !adminError;
    } catch (err) {
      console.error('Failed to reopen support ticket:', err);
      return false;
    }
  },

  /**
   * Subscribes to Realtime updates on support_notifications table.
   */
  subscribeToNotifications(userId: string, onChange: () => void) {
    const channelName = `public:support_notifications:${userId || 'all'}`;
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'support_notifications',
        },
        (payload) => {
          // If userId filter matches
          if (!userId || (payload.new as any)?.user_id === userId) {
            onChange();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },
};
