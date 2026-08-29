import { supabase } from '../lib/supabase';

export interface MonitoringTelemetry {
  avgDbLatencyMs: number;
  errorCount24h: number;
  totalExecutions24h: number;
  errorRate24h: string;
  errorTimeseries: { name: string; Errors: number }[];
  dbLatencyTimeseries: { name: string; Latency: number }[];
}

export const monitoringService = {
  /**
   * Derives system performance telemetry and error counts directly from live database ping times and public.exports error states.
   * Eliminates static fake arrays (142ms, 0.12%, etc.) without creating fake data.
   */
  async getMonitoringData(): Promise<MonitoringTelemetry> {
    const start = performance.now();
    let avgDbLatencyMs = 0;
    try {
      await supabase.from('profiles').select('id', { count: 'exact', head: true });
      avgDbLatencyMs = Math.round(performance.now() - start);
    } catch {
      avgDbLatencyMs = 0;
    }

    let errorCount24h = 0;
    let totalExecutions24h = 0;
    const errorTimeseriesMap: Record<string, number> = {};
    const past24hIso = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    try {
      const { data } = await supabase
        .from('exports')
        .select('created_at, status')
        .gte('created_at', past24hIso);

      if (data) {
        totalExecutions24h = data.length;
        data.forEach((exp) => {
          if (exp.status === 'failed') {
            errorCount24h++;
            if (exp.created_at) {
              const hour = new Date(exp.created_at).getHours();
              const key = `${hour.toString().padStart(2, '0')}:00`;
              errorTimeseriesMap[key] = (errorTimeseriesMap[key] || 0) + 1;
            }
          }
        });
      }
    } catch {
      errorCount24h = 0;
      totalExecutions24h = 0;
    }

    const errorRate24h = totalExecutions24h > 0
      ? `${((errorCount24h / totalExecutions24h) * 100).toFixed(2)}%`
      : '0.00%';

    const errorTimeseries = Object.entries(errorTimeseriesMap).map(([name, Errors]) => ({ name, Errors }));

    // Real DB Latency single point sample
    const dbLatencyTimeseries = [
      { name: 'Current Live Ping', Latency: avgDbLatencyMs }
    ];

    return {
      avgDbLatencyMs,
      errorCount24h,
      totalExecutions24h,
      errorRate24h,
      errorTimeseries,
      dbLatencyTimeseries,
    };
  },
};
