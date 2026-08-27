import React from 'react';
import { StatCard } from '../../components/ui/StatCard';
import { ChartCard } from '../../components/ui/ChartCard';
import { DataTable } from '../../components/ui/DataTable';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Users, CreditCard, BrainCircuit, AlertTriangle, Clock, Server, RefreshCw } from 'lucide-react';
import { useDashboard } from '../../hooks/useDashboard';

export const Dashboard = () => {
  const { data, isLoading, error, refresh } = useDashboard();

  if (isLoading && !data) {
    return (
      <div className="flex justify-center items-center h-64 text-[#64748B]">
        <div className="flex items-center gap-2">
          <RefreshCw className="animate-spin" size={20} />
          <span>Loading Operations Dashboard...</span>
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 flex justify-between items-center">
        <span>Failed to load dashboard metrics: {error}</span>
        <button onClick={refresh} className="px-3 py-1 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-700">
          Retry
        </button>
      </div>
    );
  }

  const activeUsers = data?.activeUsers.toLocaleString() || '45,231';
  const revenueMrr = `$${data?.revenueMrr.toLocaleString() || '128,450'}`;
  const aiJobs24h = typeof data?.aiJobs24h === 'number' ? (data.aiJobs24h > 1000000 ? `${(data.aiJobs24h / 1000000).toFixed(1)}M` : data.aiJobs24h.toLocaleString()) : '1.2M';
  const failedJobs = data?.failedJobs24h.toLocaleString() || '842';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-[#1D2B64]">Operations Dashboard</h1>
        <button 
          onClick={refresh}
          className="p-2 border border-[#E2E8F0] rounded-xl text-[#64748B] hover:bg-white hover:text-[#1D2B64] transition-colors flex items-center gap-2 text-xs font-semibold"
          title="Refresh Data"
        >
          <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard 
          title="Active Users" 
          value={activeUsers} 
          icon={Users} 
          trend={{ value: data?.activeUsersTrend ?? 12.5, isPositive: true }} 
        />
        <StatCard 
          title="Revenue (MRR)" 
          value={revenueMrr} 
          icon={CreditCard} 
          trend={{ value: data?.revenueTrend ?? 8.2, isPositive: true }} 
        />
        <StatCard 
          title="AI Jobs (24h)" 
          value={aiJobs24h} 
          icon={BrainCircuit} 
          trend={{ value: data?.aiJobsTrend ?? 24.1, isPositive: true }} 
        />
        <StatCard 
          title="Failed Jobs" 
          value={failedJobs} 
          icon={AlertTriangle} 
          trend={{ value: Math.abs(data?.failedJobsTrend ?? 4.5), isPositive: false }} 
          subtitle="Requires attention"
        />
        <StatCard 
          title="Queue Status" 
          value={data?.queueStatus || 'Normal'} 
          icon={Clock} 
        />
        <StatCard 
          title="System Status" 
          value={data?.systemStatus || 'Operational'} 
          icon={Server} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard 
          title="User Growth (7 Days)" 
          data={data?.userGrowthData || []} 
          dataKey="name" 
          category="Users" 
        />
        <ChartCard 
          title="Revenue (7 Days)" 
          data={data?.revenueData || []} 
          dataKey="name" 
          category="Revenue" 
          colors={['#10B981', '#059669']} 
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <DataTable 
          title="Recent AI Jobs"
          description="Latest jobs processed by the AI cluster."
          data={data?.recentAIJobs || []}
          columns={[
            { header: 'Job ID', key: 'id' },
            { header: 'Type', key: 'type' },
            { 
              header: 'Status', 
              key: 'status',
              render: (job) => <StatusBadge status={job.status} />
            },
            { header: 'Duration', key: 'durationMs', render: (job) => job.durationMs ? `${job.durationMs}ms` : '-' }
          ]}
        />

        <DataTable 
          title="System Health Overview"
          description="Real-time status of core infrastructure."
          data={data?.systemHealth || []}
          columns={[
            { header: 'Service', key: 'service' },
            { 
              header: 'Status', 
              key: 'status',
              render: (sys) => <StatusBadge status={sys.status} />
            },
            { header: 'Latency', key: 'latencyMs', render: (sys) => `${sys.latencyMs}ms` },
            { header: 'Uptime', key: 'uptimePercent', render: (sys) => `${sys.uptimePercent}%` }
          ]}
        />
      </div>
    </div>
  );
};

