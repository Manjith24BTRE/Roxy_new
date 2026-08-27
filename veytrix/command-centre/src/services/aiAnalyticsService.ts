import { supabase } from '../lib/supabase';

export interface AIAnalyticsData {
  totalJobs: number;
  completedJobs: number;
  failedJobs: number;
  successRate: number;
  jobsByResolution: { name: string; Jobs: number }[];
}

export const aiAnalyticsService = {
  /**
   * Computes live AI job execution analytics from public.exports table.
   * Generates dynamic charts without static GPU or job arrays.
   */
  async getAIAnalytics(): Promise<AIAnalyticsData> {
    try {
      const { data, error } = await supabase.from('exports').select('status, resolution');

      if (!error && data && data.length > 0) {
        let completed = 0;
        let failed = 0;
        const resMap: Record<string, number> = {};

        data.forEach((j) => {
          if (j.status === 'failed') failed++;
          else completed++;

          const r = j.resolution || '1080p';
          resMap[r] = (resMap[r] || 0) + 1;
        });

        const total = data.length;
        const successRate = total > 0 ? Math.round((completed / total) * 100) : 100;
        const jobsByResolution = Object.entries(resMap).map(([name, Jobs]) => ({ name, Jobs }));

        return {
          totalJobs: total,
          completedJobs: completed,
          failedJobs: failed,
          successRate,
          jobsByResolution,
        };
      }
    } catch {
      // Unmigrated table fallback
    }

    return {
      totalJobs: 0,
      completedJobs: 0,
      failedJobs: 0,
      successRate: 100,
      jobsByResolution: [],
    };
  },
};
