import { supabase } from '../lib/supabase';

export interface PermissionItem {
  id: string;
  name: string;
  category: string;
  enabled: boolean;
}

export const permissionsService = {
  /**
   * Sources system permissions from database schema. Returns clean empty state if unmigrated.
   */
  async getPermissions(): Promise<PermissionItem[]> {
    try {
      const { data, error } = await supabase.from('permissions').select('*');
      if (!error && data && data.length > 0) {
        return data.map((p) => ({
          id: p.id,
          name: p.name,
          category: p.category || 'General',
          enabled: p.enabled ?? true,
        }));
      }
    } catch {
      // Unmigrated schema handler
    }
    return [];
  },
};
