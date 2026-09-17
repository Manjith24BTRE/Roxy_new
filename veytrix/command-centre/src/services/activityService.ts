import { supabase } from '../lib/supabase';

export interface ActivityEvent {
  id: string;
  user_id?: string;
  user_name: string;
  user_email?: string;
  user_avatar?: string;
  event_type: string;
  event_category: 'Users' | 'Projects' | 'Billing' | 'Security' | 'System';
  event_title: string;
  event_description?: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface ActivityMetrics {
  events24h: number;
  signups24h: number;
  logins24h: number;
  securityEvents: number;
}

export const activityService = {
  /**
   * Calculates 100% real database metrics for the last 24 hours.
   */
  async getActivityMetrics(): Promise<ActivityMetrics> {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    try {
      const [eventsRes, signupsRes, loginsRes, securityRes] = await Promise.all([
        supabase.from('platform_events').select('id', { count: 'exact' }).gte('created_at', since),
        supabase.from('platform_events').select('id', { count: 'exact' }).eq('event_type', 'signup').gte('created_at', since),
        supabase.from('platform_events').select('id', { count: 'exact' }).eq('event_type', 'login').gte('created_at', since),
        supabase.from('platform_events').select('id', { count: 'exact' }).in('event_type', ['failed_login', 'permission_denied', 'account_locked']).gte('created_at', since),
      ]);

      return {
        events24h: eventsRes.count || 0,
        signups24h: signupsRes.count || 0,
        logins24h: loginsRes.count || 0,
        securityEvents: securityRes.count || 0,
      };
    } catch (e) {
      console.warn('Could not calculate real activity metrics from database:', e);
      return {
        events24h: 0,
        signups24h: 0,
        logins24h: 0,
        securityEvents: 0,
      };
    }
  },

  /**
   * Fetches the latest 100 platform activity events directly from public.platform_events joined with profiles.
   */
  async getActivityTimeline(): Promise<ActivityEvent[]> {
    try {
      const { data: events, error } = await supabase
        .from('platform_events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error || !events) {
        return [];
      }

      // Extract unique user_ids to resolve display names
      const userIds = Array.from(new Set(events.map((e) => e.user_id).filter(Boolean)));
      const profilesMap = new Map<string, { display_name?: string; avatar_url?: string }>();

      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, display_name, avatar_url')
          .in('user_id', userIds);

        if (profiles) {
          profiles.forEach((p) => {
            profilesMap.set(p.user_id, {
              display_name: p.display_name,
              avatar_url: p.avatar_url,
            });
          });
        }
      }

      return events.map((item) => {
        const profile = item.user_id ? profilesMap.get(item.user_id) : undefined;
        return {
          id: item.id,
          user_id: item.user_id,
          user_name: profile?.display_name || item.metadata?.user_name || item.metadata?.email || 'Anonymous User',
          user_avatar: profile?.avatar_url,
          event_type: item.event_type,
          event_category: item.event_category as any,
          event_title: item.event_title,
          event_description: item.event_description,
          metadata: item.metadata,
          created_at: item.created_at || new Date().toISOString(),
        };
      });
    } catch (e) {
      console.warn('Failed to fetch activity timeline from database:', e);
      return [];
    }
  },

  /**
   * Subscribes to Supabase Realtime channel for live platform_events inserts.
   */
  subscribeToActivityStream(onNewEvent: (newEvent: ActivityEvent) => void) {
    const channel = supabase
      .channel('platform_events_realtime_stream')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'platform_events',
        },
        async (payload) => {
          const item = payload.new;
          if (item) {
            let userName = 'Anonymous User';
            let userAvatar: string | undefined;

            if (item.user_id) {
              const { data: p } = await supabase
                .from('profiles')
                .select('display_name, avatar_url')
                .eq('user_id', item.user_id)
                .single();
              if (p) {
                userName = p.display_name || userName;
                userAvatar = p.avatar_url;
              }
            }

            const mapped: ActivityEvent = {
              id: item.id,
              user_id: item.user_id,
              user_name: userName,
              user_avatar: userAvatar,
              event_type: item.event_type,
              event_category: item.event_category || 'System',
              event_title: item.event_title,
              event_description: item.event_description,
              metadata: item.metadata,
              created_at: item.created_at || new Date().toISOString(),
            };
            onNewEvent(mapped);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },
};
