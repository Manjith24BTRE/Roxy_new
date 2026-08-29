import React from 'react';
import { cn } from '../layout/Sidebar';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number | string;
    isPositive?: boolean;
  };
  subtitle?: string;
  className?: string;
}

export const StatCard = ({ title, value, icon: Icon, trend, subtitle, className }: StatCardProps) => {
  return (
    <div className={cn("bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-sm flex flex-col", className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-bold text-[#64748B] uppercase tracking-wider">{title}</h3>
        <div className="p-2 bg-[#F1F5F9] rounded-lg text-[#3B6CE7]">
          <Icon size={18} />
        </div>
      </div>
      <div className="flex items-baseline gap-3 flex-wrap">
        <span className="text-2xl font-black text-[#1D2B64]">{value}</span>
        {trend && (
          typeof trend.value === 'string' ? (
            <span className="text-[10px] font-semibold text-[#94A3B8] bg-[#F1F5F9] px-2 py-0.5 rounded-full">
              {trend.value}
            </span>
          ) : (
            <span className={cn(
              "text-xs font-bold px-2 py-0.5 rounded-full",
              trend.isPositive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
            )}>
              {trend.isPositive ? '+' : '-'}{Math.abs(trend.value)}%
            </span>
          )
        )}
      </div>
      {subtitle && <p className="text-[10px] text-[#94A3B8] font-semibold mt-2">{subtitle}</p>}
    </div>
  );
};
