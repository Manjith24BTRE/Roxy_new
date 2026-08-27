import React, { useState, useEffect } from 'react';
import { aiAnalyticsService, AIAnalyticsData } from '../../services/aiAnalyticsService';
import { StatCard } from '../../components/ui/StatCard';
import { ChartCard } from '../../components/ui/ChartCard';
import { BrainCircuit, CheckCircle, AlertTriangle, RefreshCw } from 'lucide-react';

export const Analytics = () => {
  const [data, setData] = useState<AIAnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadAnalytics = async () => {
    setIsLoading(true);
    const res = await aiAnalyticsService.getAIAnalytics();
    setData(res);
    setIsLoading(false);
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-[#1D2B64]">AI Cluster Analytics</h1>
          <p className="text-sm text-[#64748B] mt-1">Live performance metrics and execution success rates of rendering workloads.</p>
        </div>
        <button
          onClick={loadAnalytics}
          className="flex items-center gap-2 border border-[#E2E8F0] px-3 py-1.5 rounded-lg text-xs font-semibold text-[#64748B] hover:bg-white transition cursor-pointer"
        >
          <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
          Refresh Analytics
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard title="Total Export Jobs" value={data?.totalJobs.toLocaleString() || '0'} icon={BrainCircuit} />
        <StatCard title="Completed Jobs" value={data?.completedJobs.toLocaleString() || '0'} icon={CheckCircle} />
        <StatCard title="Failed Jobs" value={data?.failedJobs.toLocaleString() || '0'} icon={AlertTriangle} />
        <StatCard title="Execution Success Rate" value={`${data?.successRate || 100}%`} icon={CheckCircle} />
      </div>

      <div className="grid grid-cols-1 gap-6">
        <ChartCard
          title="Jobs Processed by Resolution"
          data={data?.jobsByResolution || []}
          dataKey="name"
          category="Jobs"
        />
      </div>
    </div>
  );
};
