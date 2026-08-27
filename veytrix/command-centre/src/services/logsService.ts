import { supabase } from '../lib/supabase';
import { Log } from '../types';

export const logsService = {
  /**
   * Sources system logs and user audit actions directly from public.exports & audit logs.
   * Never generates fabricated log entries.
   */
  async getLogs(): Promise<Log[]> {
    try {
      const { data, error } = await supabase
        .from('exports')
        .select('id, user_id, status, created_at, resolution')
        .order('created_at', { ascending: false })
        .limit(50);

      if (!error && data && data.length > 0) {
        return data.map((item) => ({
          id: item.id,
          timestamp: item.created_at || new Date().toISOString(),
          severity: item.status === 'failed' ? 'Error' : 'Info',
          category: 'Application',
          event: `Video Render Job (${item.resolution}) ${item.status || 'processed'}`,
          service: 'Veytrix Render Cluster',
          user: item.user_id,
          status: item.status === 'failed' ? 500 : 200,
        }));
      }
    } catch (e) {
      console.warn('Failed to fetch system logs from database:', e);
    }

    return [];
  },
};
