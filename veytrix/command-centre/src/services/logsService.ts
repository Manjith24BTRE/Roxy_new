import { supabase } from '../lib/supabase';

export interface FrontendLog {
  id: string;
  level: 'info' | 'warning' | 'error';
  category: string;
  message: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface BackendLog {
  id: string;
  service: string;
  level: 'info' | 'warning' | 'error';
  message: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export const logsService = {
  /**
   * Sources real frontend user action and error logs directly from public.frontend_logs table.
   */
  async getFrontendLogs(): Promise<FrontendLog[]> {
    try {
      const { data, error } = await supabase
        .from('frontend_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (!error && data) {
        return data as FrontendLog[];
      }
    } catch (e) {
      console.warn('Failed to fetch frontend_logs:', e);
    }
    return [];
  },

  /**
   * Sources real backend execution & API logs directly from public.backend_logs table.
   */
  async getBackendLogs(): Promise<BackendLog[]> {
    try {
      const { data, error } = await supabase
        .from('backend_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (!error && data) {
        return data as BackendLog[];
      }
    } catch (e) {
      console.warn('Failed to fetch backend_logs:', e);
    }
    return [];
  },

  /**
   * Subscribes to real-time inserts on public.frontend_logs table.
   */
  subscribeToFrontendLogs(onNewLog: (newLog: FrontendLog) => void) {
    const channel = supabase
      .channel('frontend_logs_realtime_stream')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'frontend_logs',
        },
        (payload) => {
          if (payload.new) {
            onNewLog(payload.new as FrontendLog);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },

  /**
   * Subscribes to real-time inserts on public.backend_logs table.
   */
  subscribeToBackendLogs(onNewLog: (newLog: BackendLog) => void) {
    const channel = supabase
      .channel('backend_logs_realtime_stream')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'backend_logs',
        },
        (payload) => {
          if (payload.new) {
            onNewLog(payload.new as BackendLog);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },
};
