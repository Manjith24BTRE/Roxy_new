import { supabase } from '../lib/supabase';

export interface UserGrowthPoint {
  name: string;
  Users: number;
}

export interface RevenueGrowthPoint {
  name: string;
  Revenue: number;
}

export const adminAnalyticsService = {
  /**
   * Generates live 7-day User Growth timeseries from Supabase profiles table.
   */
  async getUserGrowthAnalytics(): Promise<UserGrowthPoint[]> {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('created_at')
        .order('created_at', { ascending: true });

      if (!data || data.length === 0) return [];

      const daysMap: Record<string, number> = {};
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      
      // Initialize past 7 days
      for (let i = 6; i >= 0; i--) {
        const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
        const dayName = days[d.getDay()];
        daysMap[dayName] = 0;
      }

      data.forEach((p) => {
        if (p.created_at) {
          const dayName = days[new Date(p.created_at).getDay()];
          if (daysMap[dayName] !== undefined) {
            daysMap[dayName] += 1;
          }
        }
      });

      return Object.entries(daysMap).map(([name, Users]) => ({ name, Users }));
    } catch {
      return [];
    }
  },

  /**
   * Generates live 7-day Revenue timeseries from active user subscriptions.
   */
  async getRevenueAnalytics(): Promise<RevenueGrowthPoint[]> {
    try {
      const { data } = await supabase
        .from('subscriptions')
        .select('created_at, plan, status');

      if (!data || data.length === 0) return [];

      const daysMap: Record<string, number> = {};
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

      for (let i = 6; i >= 0; i--) {
        const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
        const dayName = days[d.getDay()];
        daysMap[dayName] = 0;
      }

      data.forEach((s) => {
        if (s.created_at && (s.status === 'active' || s.status === 'ACTIVE')) {
          const dayName = days[new Date(s.created_at).getDay()];
          const amount = s.plan === 'PRO' ? 29 : s.plan === 'ENTERPRISE' ? 199 : 0;
          if (daysMap[dayName] !== undefined) {
            daysMap[dayName] += amount;
          }
        }
      });

      return Object.entries(daysMap).map(([name, Revenue]) => ({ name, Revenue }));
    } catch {
      return [];
    }
  }
};
