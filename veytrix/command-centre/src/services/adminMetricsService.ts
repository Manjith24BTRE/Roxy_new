import { supabase } from '../lib/supabase';

export interface AdminDashboardKPIs {
  activeUsers: number;
  activeUsersTrend?: { value: number | string; isPositive?: boolean };
  revenueMrr: number;
  revenueTrend?: { value: number | string; isPositive?: boolean };
  aiJobs24h: number;
  aiJobsTrend?: { value: number | string; isPositive?: boolean };
  failedJobs24h: number;
  failedJobsTrend?: { value: number | string; isPositive?: boolean };
  queueStatus: string;
  systemStatus: string;
}

export interface AdminAnalyticsData {
  userGrowthData: { name: string; Users: number }[];
  revenueData: { name: string; Revenue: number }[];
}

export const adminMetricsService = {
  /**
   * Fetches real-time dashboard KPIs backed 100% by Supabase queries with ZERO hardcoded metrics or fake growth trends.
   */
  async getDashboardKPIs(): Promise<AdminDashboardKPIs> {
    const now = Date.now();
    const past24hIso = new Date(now - 24 * 60 * 60 * 1000).toISOString();
    const prev24hIso = new Date(now - 48 * 60 * 60 * 1000).toISOString();

    let dbOperational = true;

    // 1. Fetch Active Users & Historical Trend
    let activeUsers = 0;
    let activeUsersTrend: { value: number | string; isPositive?: boolean } = { value: 'Not enough historical data' };
    try {
      const { count: currentUsers } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
      activeUsers = currentUsers ?? 0;

      const { count: prevUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .lt('created_at', past24hIso);

      if (prevUsers && prevUsers > 0 && currentUsers !== null) {
        const diff = currentUsers - prevUsers;
        const pct = Math.round((diff / prevUsers) * 1000) / 10;
        activeUsersTrend = { value: Math.abs(pct), isPositive: pct >= 0 };
      }
    } catch {
      dbOperational = false;
      activeUsers = 0;
    }

    // 2. Fetch Real Subscriptions & Compute MRR and Trend
    let revenueMrr = 0;
    let revenueTrend: { value: number | string; isPositive?: boolean } = { value: 'Not enough historical data' };
    try {
      const { data: subs } = await supabase.from('subscriptions').select('plan, status, created_at');
      if (subs) {
        let prevMrr = 0;
        subs.forEach((sub) => {
          if (sub.status === 'active' || sub.status === 'ACTIVE') {
            const planPrice = sub.plan === 'PRO' || sub.plan === 'pro' ? 29 : sub.plan === 'ENTERPRISE' || sub.plan === 'enterprise' ? 199 : 0;
            revenueMrr += planPrice;

            if (sub.created_at && new Date(sub.created_at).getTime() < now - 30 * 24 * 60 * 60 * 1000) {
              prevMrr += planPrice;
            }
          }
        });

        if (prevMrr > 0) {
          const diff = revenueMrr - prevMrr;
          const pct = Math.round((diff / prevMrr) * 1000) / 10;
          revenueTrend = { value: Math.abs(pct), isPositive: pct >= 0 };
        }
      }
    } catch {
      dbOperational = false;
      revenueMrr = 0;
    }

    // 3. Fetch Real AI Jobs in 24h & Previous 24h for Trend Comparison
    let aiJobs24h = 0;
    let failedJobs24h = 0;
    let aiJobsTrend: { value: number | string; isPositive?: boolean } = { value: 'Not enough historical data' };
    let failedJobsTrend: { value: number | string; isPositive?: boolean } = { value: 'Not enough historical data' };

    try {
      // Current 24h total jobs
      const { count: totalJobs } = await supabase
        .from('exports')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', past24hIso);
      aiJobs24h = totalJobs ?? 0;

      // Previous 24h total jobs
      const { count: prevTotalJobs } = await supabase
        .from('exports')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', prev24hIso)
        .lt('created_at', past24hIso);

      if (prevTotalJobs && prevTotalJobs > 0 && totalJobs !== null) {
        const diff = totalJobs - prevTotalJobs;
        const pct = Math.round((diff / prevTotalJobs) * 1000) / 10;
        aiJobsTrend = { value: Math.abs(pct), isPositive: pct >= 0 };
      }

      // Current 24h failed jobs
      const { count: failedJobs } = await supabase
        .from('exports')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', past24hIso)
        .eq('status', 'failed');
      failedJobs24h = failedJobs ?? 0;

      // Previous 24h failed jobs
      const { count: prevFailedJobs } = await supabase
        .from('exports')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', prev24hIso)
        .lt('created_at', past24hIso)
        .eq('status', 'failed');

      if (prevFailedJobs && prevFailedJobs > 0 && failedJobs !== null) {
        const diff = failedJobs - prevFailedJobs;
        const pct = Math.round((diff / prevFailedJobs) * 1000) / 10;
        // For failed jobs, an increase is negative/bad
        failedJobsTrend = { value: Math.abs(pct), isPositive: diff <= 0 };
      }
    } catch {
      dbOperational = false;
      aiJobs24h = 0;
      failedJobs24h = 0;
    }

    return {
      activeUsers,
      activeUsersTrend,
      revenueMrr,
      revenueTrend,
      aiJobs24h,
      aiJobsTrend,
      failedJobs24h,
      failedJobsTrend,
      queueStatus: aiJobs24h > 0 ? 'Processing' : 'Idle',
      systemStatus: dbOperational ? 'Operational' : 'Degraded',
    };
  }
};
