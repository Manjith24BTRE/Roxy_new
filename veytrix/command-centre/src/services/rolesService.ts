import { supabase } from '../lib/supabase';
import { Role } from '../types';

export const rolesService = {
  /**
   * Sources user roles and member counts from database schema cleanly.
   * Returns empty state if public.roles is unmigrated.
   */
  async getRoles(): Promise<Role[]> {
    try {
      const { data, error } = await supabase.from('roles').select('*');
      if (!error && data && data.length > 0) {
        return data.map((r) => ({
          id: r.id,
          name: r.name,
          usersCount: r.users_count || 0,
        }));
      }
    } catch {
      // Unmigrated schema handler
    }
    return [];
  },
};
