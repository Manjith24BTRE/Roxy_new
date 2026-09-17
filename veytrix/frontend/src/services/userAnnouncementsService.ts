import { supabase, supabaseAdmin } from '../lib/supabase';

export interface UserAnnouncement {
  id: string;
  title: string;
  message: string;
  announcement_type: string;
  priority: string;
  status: string;
  target_audience: string;
  cta_text?: string;
  cta_url?: string;
  banner_color?: string;
  icon?: string;
  starts_at?: string;
  expires_at?: string;
}

class UserAnnouncementsService {
  /**
   * Fetches active, valid announcements matching user filtering and date validity.
   */
  public async getActiveAnnouncements(): Promise<UserAnnouncement[]> {
    const nowTime = Date.now();
    try {
      const client = supabaseAdmin || supabase;
      if (!client) return [];

      let { data, error } = await client
        .from('platform_announcements')
        .select('*')
        .or('is_active.eq.true,status.eq.Active')
        .order('created_at', { ascending: false });

      if (error || !data) {
        console.warn('[USER ANNOUNCEMENTS] Supabase query warning:', error);
        return [];
      }

      // Filter by start and expiration times
      const filtered = data.filter((a) => {
        const startVal = a.starts_at || a.start_date;
        const endVal = a.expires_at || a.end_date;

        if (startVal && new Date(startVal).getTime() > nowTime) return false;
        if (endVal && new Date(endVal).getTime() < nowTime) return false;
        return true;
      });

      // Priority sort order: Critical -> High -> Medium -> Low
      const priorityOrder: Record<string, number> = { Critical: 4, High: 3, Medium: 2, Low: 1 };
      filtered.sort((a, b) => {
        const pA = priorityOrder[a.priority] || 2;
        const pB = priorityOrder[b.priority] || 2;
        return pB - pA;
      });

      return filtered.map((r) => ({
        id: r.id,
        title: r.title,
        message: r.content || r.message || '',
        announcement_type: r.announcement_type || r.type || 'General',
        priority: r.priority || 'Medium',
        status: r.status || 'Active',
        target_audience: r.target_audience || 'All Users',
        cta_text: r.cta_text,
        cta_url: r.cta_url,
        banner_color: r.banner_color || r.banner_style || 'blue',
        icon: r.icon || 'bell',
        starts_at: r.starts_at || r.start_date,
        expires_at: r.expires_at || r.end_date,
      }));
    } catch (e) {
      console.error('[USER ANNOUNCEMENTS] Exception during fetch:', e);
      return [];
    }
  }

  /**
   * Tracks user interaction (viewed, clicked, dismissed) in announcement_analytics.
   */
  public async trackAnalytics(announcementId: string, action: 'viewed' | 'clicked' | 'dismissed'): Promise<void> {
    try {
      const client = supabaseAdmin || supabase;
      if (!client) return;

      const { data: userRes } = await client.auth.getUser();
      await client.from('announcement_analytics').insert([
        {
          announcement_id: announcementId,
          user_id: userRes.user?.id || null,
          action,
          created_at: new Date().toISOString(),
        },
      ]);
    } catch (e) {
      console.warn('[USER ANNOUNCEMENTS] Analytics track error:', e);
    }
  }

  /**
   * Real-time subscription to active announcements.
   */
  public subscribeToAnnouncements(onUpdate: (announcements: UserAnnouncement[]) => void) {
    const client = supabaseAdmin || supabase;
    if (!client) return () => {};

    const channel = client
      .channel('user_announcements_stream')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'platform_announcements' }, async () => {
        const updated = await this.getActiveAnnouncements();
        onUpdate(updated);
      })
      .subscribe();

    return () => {
      client.removeChannel(channel);
    };
  }
}

export const userAnnouncementsService = new UserAnnouncementsService();
export default userAnnouncementsService;
