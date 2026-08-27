import { supabase } from '../lib/supabase';
import { Announcement } from '../types';

export const announcementsService = {
  /**
   * Sources announcements directly from public.announcements.
   * Returns clean empty state if no announcements exist.
   */
  async getAnnouncements(): Promise<Announcement[]> {
    try {
      const { data, error } = await supabase.from('announcements').select('*');
      if (!error && data && data.length > 0) {
        return data.map((a) => ({
          id: a.id,
          title: a.title,
          message: a.message || '',
          audience: a.audience || 'All Users',
          status: a.status || 'Published',
          publishedDate: a.published_date || a.created_at || new Date().toISOString(),
        }));
      }
    } catch {
      // Unmigrated schema handler
    }
    return [];
  },
};
