import React, { useEffect, useState } from 'react';
import { Plus, Check, Edit2, RefreshCw } from 'lucide-react';
import { plansService, PlanMetricsOverview } from '../../services/plansService';

export const Plans = () => {
  const [data, setData] = useState<PlanMetricsOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMetrics = async () => {
    setIsLoading(true);
    const res = await plansService.getPlanMetrics();
    setData(res);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64 text-[#64748B]">
        <div className="flex items-center gap-2 font-semibold">
          <RefreshCw className="animate-spin" size={18} />
          <span>Loading Live Subscription Metrics...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-[#1D2B64]">Subscription Plans</h1>
          <p className="text-sm text-[#64748B] mt-1">Manage pricing tiers and live subscriber metrics for Veytrix users.</p>
        </div>
        <button 
          onClick={fetchMetrics}
          className="flex items-center gap-2 bg-[#3B6CE7] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#2b52b3] transition-colors cursor-pointer"
        >
          <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
          Refresh Metrics
        </button>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-sm">
          <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider">Active Subscribers</p>
          <p className="text-2xl font-black text-[#1D2B64] mt-1">{data?.activeCount || 0}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-sm">
          <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider">Cancelled Subscribers</p>
          <p className="text-2xl font-black text-red-600 mt-1">{data?.cancelledCount || 0}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-sm">
          <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider">Total Subscriptions</p>
          <p className="text-2xl font-black text-[#3B6CE7] mt-1">{data?.totalSubscribers || 0}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {data?.plans.map((plan, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-sm flex flex-col relative overflow-hidden group hover:border-[#3B6CE7]/50 transition-colors">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-bold text-xl text-[#1D2B64]">{plan.name}</h3>
            </div>
            <div className="mb-4">
              <span className="text-3xl font-black text-[#1D2B64]">${plan.price}</span>
              <span className="text-sm text-[#64748B]">/month</span>
            </div>
            
            <div className="bg-[#F1F5F9] rounded-lg p-3 mb-6">
              <p className="text-xs text-[#64748B] uppercase tracking-wider font-bold">Credits Included</p>
              <p className="text-lg font-black text-[#3B6CE7]">{plan.credits.toLocaleString()}</p>
            </div>

            <div className="flex-1">
              <ul className="space-y-3">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-[#1D2B64]">
                    <Check size={16} className="text-green-500 mt-0.5 shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-6 pt-4 border-t border-[#E2E8F0] flex justify-between items-center">
              <div>
                <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Active Subs</p>
                <p className="text-sm font-bold text-[#1D2B64]">{plan.activeSubscribers.toLocaleString()}</p>
              </div>
              <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-[10px] font-bold uppercase">
                {plan.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
