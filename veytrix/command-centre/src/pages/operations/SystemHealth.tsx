import React, { useState, useEffect } from 'react';
import { healthService } from '../../services/healthService';
import { SystemHealth as SystemHealthType } from '../../types';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { RefreshCw, Server, Activity, Database, Key, HardDrive } from 'lucide-react';
import { cn } from '../../components/layout/Sidebar';

const serviceIcons: Record<string, React.ElementType> = {
  'Database Cluster (Supabase Postgres)': Database,
  'Supabase Auth Gateway': Key,
  'Object Storage Cluster': HardDrive,
};

export const SystemHealth = () => {
  const [services, setServices] = useState<SystemHealthType[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadHealth = async () => {
    setIsRefreshing(true);
    const { services: data } = await healthService.getSystemHealth();
    setServices(data);
    setIsRefreshing(false);
  };

  useEffect(() => {
    loadHealth();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#1D2B64]">System Health</h1>
          <p className="text-sm text-[#64748B] mt-1">Real-time ping latency and operational status of core infrastructure.</p>
        </div>
        <button
          onClick={loadHealth}
          className="flex items-center gap-2 bg-white border border-[#E2E8F0] px-4 py-2 rounded-lg text-sm font-semibold text-[#1D2B64] hover:bg-[#F8FAFC] transition-colors shadow-sm w-fit cursor-pointer"
        >
          <RefreshCw size={16} className={cn(isRefreshing && 'animate-spin')} />
          Refresh Status
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {services.map((sys) => {
          const Icon = serviceIcons[sys.service] || Server;
          return (
            <div key={sys.service} className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-sm flex flex-col group hover:border-[#3B6CE7]/30 transition-colors">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-[#F1F5F9] rounded-xl text-[#3B6CE7] group-hover:bg-[#3B6CE7] group-hover:text-white transition-colors">
                    <Icon size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#1D2B64]">{sys.service}</h3>
                    <p className="text-[10px] text-[#64748B]">Last checked: {new Date(sys.lastChecked).toLocaleTimeString()}</p>
                  </div>
                </div>
                <StatusBadge status={sys.status} />
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-[#F1F5F9]">
                <div>
                  <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider mb-1">Ping Latency</p>
                  <p className="text-lg font-black text-[#1D2B64]">{sys.latencyMs}ms</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider mb-1">Uptime</p>
                  <p className="text-lg font-black text-[#1D2B64]">{sys.uptimePercent}%</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
