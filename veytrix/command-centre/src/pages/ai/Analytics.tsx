import React from 'react';
import { ChartCard } from '../../components/ui/ChartCard';
import { StatCard } from '../../components/ui/StatCard';
import { BrainCircuit, CheckCircle, AlertTriangle, Clock } from 'lucide-react';

const jobVolumeData = [
  { name: 'Mon', Jobs: 120000 },
  { name: 'Tue', Jobs: 185000 },
  { name: 'Wed', Jobs: 150000 },
  { name: 'Thu', Jobs: 220000 },
  { name: 'Fri', Jobs: 280000 },
  { name: 'Sat', Jobs: 210000 },
  { name: 'Sun', Jobs: 190000 },
];

const costData = [
  { name: 'Mon', Cost: 450 },
  { name: 'Tue', Cost: 620 },
  { name: 'Wed', Cost: 550 },
  { name: 'Thu', Cost: 800 },
  { name: 'Fri', Cost: 950 },
  { name: 'Sat', Cost: 720 },
  { name: 'Sun', Cost: 680 },
];

export const Analytics = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-[#1D2B64]">AI Analytics</h1>
        <p className="text-sm text-[#64748B] mt-1">Usage, performance, and cost analytics across all AI models.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard title="Total Jobs (7d)" value="1.35M" icon={BrainCircuit} trend={{ value: 18.5, isPositive: true }} />
        <StatCard title="Success Rate" value="98.7%" icon={CheckCircle} trend={{ value: 0.2, isPositive: true }} />
        <StatCard title="Failure Rate" value="1.3%" icon={AlertTriangle} trend={{ value: 0.2, isPositive: false }} />
        <StatCard title="Avg Latency" value="1,240ms" icon={Clock} trend={{ value: 45, isPositive: false }} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard 
          title="Job Volume (7 Days)" 
          data={jobVolumeData} 
          dataKey="name" 
          category="Jobs" 
          colors={['#8E54E9', '#3B6CE7']}
        />
        <ChartCard 
          title="Estimated Cost USD (7 Days)" 
          data={costData} 
          dataKey="name" 
          category="Cost" 
          colors={['#F59E0B', '#D97706']} 
        />
      </div>
    </div>
  );
};
