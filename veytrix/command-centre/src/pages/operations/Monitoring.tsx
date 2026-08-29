import React, { useState, useEffect } from 'react';
import { ChartCard } from '../../components/ui/ChartCard';
import { StatCard } from '../../components/ui/StatCard';
import { Activity, ServerCrash, Cpu, RefreshCw, AlertCircle } from 'lucide-react';
import { monitoringService, MonitoringTelemetry } from '../../services/monitoringService';

export const Monitoring = () => {
  const [telemetry, setTelemetry] = useState<MonitoringTelemetry | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadTelemetry = async () => {
    setIsLoading(true);
    const data = await monitoringService.getMonitoringData();
    setTelemetry(data);
    setIsLoading(false);
  };

  useEffect(() => {
    loadTelemetry();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-[#1D2B64]">System Monitoring</h1>
          <p className="text-sm text-[#64748B] mt-1">Live performance metrics derived from Supabase database ping latency and export error events.</p>
        </div>
        <button
          onClick={loadTelemetry}
          className="flex items-center gap-2 border border-[#E2E8F0] px-3 py-1.5 rounded-lg text-xs font-semibold text-[#64748B] hover:bg-white transition cursor-pointer"
        >
          <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
          Refresh Metrics
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          title="DB Ping Latency" 
          value={`${telemetry?.avgDbLatencyMs || 0}ms`} 
          icon={Activity} 
        />
        <StatCard 
          title="Export Error Rate (24h)" 
          value={telemetry?.errorRate24h || '0.00%'} 
          icon={ServerCrash} 
        />
        <StatCard 
          title="CPU Utilization" 
          value="Telemetry Not Configured" 
          icon={Cpu} 
        />
      </div>

      {telemetry?.errorTimeseries && telemetry.errorTimeseries.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard 
            title="Database Ping Latency (ms)" 
            data={telemetry.dbLatencyTimeseries} 
            dataKey="name" 
            category="Latency" 
          />
          <ChartCard 
            title="Recorded Export Errors (24h)" 
            data={telemetry.errorTimeseries} 
            dataKey="name" 
            category="Errors" 
            colors={['#EF4444', '#B91C1C']} 
          />
        </div>
      ) : (
        <div className="bg-white p-8 rounded-2xl border border-[#E2E8F0] shadow-sm flex items-start gap-4">
          <AlertCircle className="text-[#3B6CE7] shrink-0 mt-1" size={24} />
          <div>
            <h3 className="font-bold text-[#1D2B64] text-base">Prometheus / Server Telemetry Integration Pending</h3>
            <p className="text-xs text-[#64748B] mt-1 leading-relaxed">
              Historical hourly APM timeseries charts are currently unconfigured. Live single-point database ping latency is <strong>{telemetry?.avgDbLatencyMs || 0}ms</strong>. No fake telemetry graphs are rendered.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
