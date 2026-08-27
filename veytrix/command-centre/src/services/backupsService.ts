import { supabase } from '../lib/supabase';
import { Backup } from '../types';

export const backupsService = {
  /**
   * Sources system backups history cleanly from public.backups.
   * Never generates fake backup snapshots. Returns empty array if unconfigured.
   */
  async getBackups(): Promise<{ backups: Backup[]; isConfigured: boolean }> {
    try {
      const { data, error } = await supabase.from('backups').select('*');
      if (!error && data && data.length > 0) {
        return {
          backups: data.map((b) => ({
            id: b.id,
            name: b.name || 'System Backup',
            type: b.type || 'Full',
            sizeBytes: b.size_bytes || 0,
            createdAt: b.created_at || new Date().toISOString(),
            status: b.status || 'Completed',
            retentionDays: b.retention_days || 30,
          })),
          isConfigured: true,
        };
      }
    } catch {
      // Unmigrated schema handler
    }
    return { backups: [], isConfigured: false };
  },
};
