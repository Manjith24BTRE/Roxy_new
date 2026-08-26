import React from 'react';
import { ChartCard } from '../../components/ui/ChartCard';
import { StatCard } from '../../components/ui/StatCard';
import { Activity, ServerCrash, Cpu } from 'lucide-react';

const apiLatencyData = [
  { name: '00:00', Latency: 120 },
  { name: '04:00', Latency: 110 },
  { name: '08:00', Latency: 150 },
  { name: '12:00', Latency: 280 },
  { name: '16:00', Latency: 190 },
  { name: '20:00', Latency: 140 },
  { name: '24:00', Latency: 125 },
];

const errorRateData = [
  { name: '00:00', Errors: 5 },
  { name: '04:00', Errors: 2 },
  { name: '08:00', Errors: 15 },
  { name: '12:00', Errors: 45 },
  { name: '16:00', Errors: 20 },
  { name: '20:00', Errors: 8 },
  { name: '24:00', Errors: 4 },
];

export const Monitoring = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-[#1D2B64]">System Monitoring</h1>
        <p className="text-sm text-[#64748B] mt-1">Real-time performance and error monitoring.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          title="Avg API Latency" 
          value="142ms" 
          icon={Activity} 
          trend={{ value: 5.4, isPositive: true }} 
        />
        <StatCard 
          title="Error Rate (24h)" 
          value="0.12%" 
          icon={ServerCrash} 
          trend={{ value: 1.2, isPositive: false }} 
        />
        <StatCard 
          title="CPU Utilization" 
          value="64%" 
          icon={Cpu} 
          trend={{ value: 12.0, isPositive: false }} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard 
          title="API Latency (ms) - Last 24 Hours" 
          data={apiLatencyData} 
          dataKey="name" 
          category="Latency" 
        />
        <ChartCard 
          title="Error Count - Last 24 Hours" 
          data={errorRateData} 
          dataKey="name" 
          category="Errors" 
          colors={['#EF4444', '#B91C1C']} 
        />
      </div>
    </div>
  );
};
