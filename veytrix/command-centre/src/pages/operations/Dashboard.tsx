import React from 'react';
import { StatCard } from '../../components/ui/StatCard';
import { ChartCard } from '../../components/ui/ChartCard';
import { DataTable } from '../../components/ui/DataTable';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Users, CreditCard, BrainCircuit, AlertTriangle, Clock, Server } from 'lucide-react';
import { mockAIJobs, mockSystemHealth } from '../../data/mockData';

const userGrowthData = [
  { name: 'Mon', Users: 120 },
  { name: 'Tue', Users: 180 },
  { name: 'Wed', Users: 250 },
  { name: 'Thu', Users: 310 },
  { name: 'Fri', Users: 420 },
  { name: 'Sat', Users: 510 },
  { name: 'Sun', Users: 680 },
];

const revenueData = [
  { name: 'Mon', Revenue: 1500 },
  { name: 'Tue', Revenue: 2100 },
  { name: 'Wed', Revenue: 1800 },
  { name: 'Thu', Revenue: 3200 },
  { name: 'Fri', Revenue: 4500 },
  { name: 'Sat', Revenue: 3800 },
  { name: 'Sun', Revenue: 5200 },
];

export const Dashboard = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-[#1D2B64]">Operations Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard 
          title="Active Users" 
          value="45,231" 
          icon={Users} 
          trend={{ value: 12.5, isPositive: true }} 
        />
        <StatCard 
          title="Revenue (MRR)" 
          value="$128,450" 
          icon={CreditCard} 
          trend={{ value: 8.2, isPositive: true }} 
        />
        <StatCard 
          title="AI Jobs (24h)" 
          value="1.2M" 
          icon={BrainCircuit} 
          trend={{ value: 24.1, isPositive: true }} 
        />
        <StatCard 
          title="Failed Jobs" 
          value="842" 
          icon={AlertTriangle} 
          trend={{ value: 4.5, isPositive: false }} 
          subtitle="Requires attention"
        />
        <StatCard 
          title="Queue Status" 
          value="Normal" 
          icon={Clock} 
        />
        <StatCard 
          title="System Status" 
          value="Operational" 
          icon={Server} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard 
          title="User Growth (7 Days)" 
          data={userGrowthData} 
          dataKey="name" 
          category="Users" 
        />
        <ChartCard 
          title="Revenue (7 Days)" 
          data={revenueData} 
          dataKey="name" 
          category="Revenue" 
          colors={['#10B981', '#059669']} 
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <DataTable 
          title="Recent AI Jobs"
          description="Latest jobs processed by the AI cluster."
          data={mockAIJobs.slice(0, 5)}
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
          data={mockSystemHealth}
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
