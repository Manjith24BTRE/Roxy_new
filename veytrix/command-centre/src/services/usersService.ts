import { supabase } from '../lib/supabase';
import { User } from '../types';

export interface UsersFetchOptions {
  search?: string;
  page?: number;
  limit?: number;
  statusFilter?: string;
  planFilter?: string;
}

export interface UsersPaginatedResponse {
  users: User[];
  totalCount: number;
}

export interface UserModuleMetrics {
  totalUsers: number;
  activeUsers24h: number;
  newUsersToday: number;
  paidUsers: number;
  freeUsers: number;
  suspendedUsers: number;
}

export const usersService = {
  /**
   * Fetches paginated platform users from Supabase via get_admin_platform_users RPC.
   * RBAC Security Gate: Caller validated against official@mavrostech.in
   */
  async getUsers(options: UsersFetchOptions = {}): Promise<UsersPaginatedResponse> {
    const { search = '', page = 1, limit = 50 } = options;
    const offset = (page - 1) * limit;

    try {
      // 1. Primary: Attempt RPC Execution
      const { data: rpcRes, error: rpcError } = await supabase.rpc('get_admin_platform_users', {
        p_search: search,
        p_limit: limit,
        p_offset: offset,
      });

      if (!rpcError && rpcRes) {
        const users: User[] = (rpcRes.users || []).map((u: any) => ({
          id: u.id,
          name: u.display_name || u.username || 'Anonymous User',
          email: u.email,
          plan: 'FREE',
          status: 'Active',
          credits: 100,
          usage: 0,
          joinedAt: u.created_at || new Date().toISOString(),
          lastLoginAt: u.updated_at || new Date().toISOString(),
        }));

        return {
          users,
          totalCount: rpcRes.filtered_users ?? rpcRes.total_users ?? users.length,
        };
      }
    } catch (e) {
      console.warn('RPC get_admin_platform_users unavailable, utilizing direct table fallback:', e);
    }

    // 2. Direct Fallback Query for unmigrated database environments
    try {
      let query = supabase.from('profiles').select('*', { count: 'exact' });

      if (search) {
        query = query.or(`display_name.ilike.%${search}%,username.ilike.%${search}%`);
      }

      query = query.range(offset, offset + limit - 1).order('created_at', { ascending: false });

      const { data, count, error } = await query;

      if (!error && data && data.length > 0) {
        const users: User[] = data.map((profile) => ({
          id: profile.user_id || profile.id,
          name: profile.display_name || profile.username?.split('@')[0] || 'Anonymous User',
          email: profile.username || profile.email || `${profile.display_name || 'user'}@veytrix.com`,
          plan: 'FREE',
          status: 'Active',
          credits: 100,
          usage: 0,
          joinedAt: profile.created_at || new Date().toISOString(),
          lastLoginAt: profile.updated_at || new Date().toISOString(),
          avatarUrl: profile.avatar_url,
        }));

        return {
          users,
          totalCount: count ?? users.length,
        };
      }
    } catch (e: any) {
      console.warn('Failed to fetch platform users from Supabase profiles, using fallback:', e);
    }

    // 3. Return empty array if profiles table has zero records
    return {
      users: [],
      totalCount: 0,
    };
  },

  /**
   * Fetches detailed single user profile.
   */
  async getUserById(userId: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .or(`user_id.eq.${userId},id.eq.${userId}`)
        .single();

      if (!error && data) {
        return {
          id: data.user_id || data.id,
          name: data.display_name || data.username || 'Anonymous User',
          email: data.email || `${data.username || 'user'}@veytrix.com`,
          plan: 'FREE',
          status: 'Active',
          credits: 100,
          usage: 0,
          joinedAt: data.created_at || new Date().toISOString(),
          lastLoginAt: data.updated_at || new Date().toISOString(),
          avatarUrl: data.avatar_url,
        };
      }
    } catch (e) {
      console.warn(`Supabase getUserById failed for ${userId}:`, e);
    }

    return null;
  }
};

