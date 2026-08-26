import React from 'react';
import { cn } from '../layout/Sidebar';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

interface ChartCardProps {
  title: string;
  data: any[];
  dataKey: string;
  category: string;
  colors?: [string, string];
  className?: string;
}

export const ChartCard = ({ title, data, dataKey, category, colors = ['#3B6CE7', '#8E54E9'], className }: ChartCardProps) => {
  return (
    <div className={cn("bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-sm", className)}>
      <h3 className="text-sm font-bold text-[#1D2B64] mb-6">{title}</h3>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id={`color-${category}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={colors[0]} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={colors[0]} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10, fill: '#64748B' }} 
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10, fill: '#64748B' }} 
            />
            <Tooltip 
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)', fontSize: '12px', fontWeight: 'bold' }}
            />
            <Area 
              type="monotone" 
              dataKey={category} 
              stroke={colors[0]} 
              strokeWidth={3}
              fillOpacity={1} 
              fill={`url(#color-${category})`} 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
