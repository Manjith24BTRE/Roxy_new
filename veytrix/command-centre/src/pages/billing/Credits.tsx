import React, { useState, useEffect } from 'react';
import { StatCard } from '../../components/ui/StatCard';
import { Coins, ArrowUpRight, ArrowDownRight, RefreshCw, UserCheck } from 'lucide-react';
import { DataTable } from '../../components/ui/DataTable';
import { creditsService, CreditEconomyMetrics } from '../../services/creditsService';

export const Credits = () => {
  const [data, setData] = useState<CreditEconomyMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadCredits = async () => {
    setIsLoading(true);
    const res = await creditsService.getCreditMetrics();
    setData(res);
    setIsLoading(false);
  };

  useEffect(() => {
    loadCredits();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-[#1D2B64]">Credit Economy</h1>
          <p className="text-sm text-[#64748B] mt-1">Live overview of platform credit circulation, user balances, and render consumption.</p>
        </div>
        <button
          onClick={loadCredits}
          className="flex items-center gap-2 border border-[#E2E8F0] px-3 py-1.5 rounded-lg text-xs font-semibold text-[#64748B] hover:bg-white transition cursor-pointer"
        >
          <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
          Refresh Economy
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Total Credits Issued" value={data?.totalCreditsIssued.toLocaleString() || '0'} icon={Coins} />
        <StatCard title="Credits Consumed" value={data?.totalCreditsConsumed.toLocaleString() || '0'} icon={ArrowDownRight} />
        <StatCard title="Outstanding Balance" value={data?.outstandingBalance.toLocaleString() || '0'} icon={ArrowUpRight} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <DataTable 
            title="Recent Credit Transactions"
            data={data?.recentTransactions || []}
            columns={[
              { header: 'ID', key: 'id', className: 'font-mono text-[10px]' },
              { header: 'User ID', key: 'userId', className: 'font-mono text-xs' },
              { 
                header: 'Amount', 
                key: 'credits', 
                render: (ctx) => (
                  <span className={`font-bold ${ctx.type === 'Credit' ? 'text-green-600' : 'text-orange-600'}`}>
                    {ctx.credits > 0 ? `+${ctx.credits}` : ctx.credits}
                  </span>
                )
              },
              { header: 'Type', key: 'type' },
              { header: 'Reason', key: 'reason', className: 'text-[#64748B]' },
              { header: 'Date', key: 'date', render: (ctx) => new Date(ctx.date).toLocaleString() },
            ]}
          />
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-sm">
          <h3 className="text-sm font-bold text-[#1D2B64] mb-4 flex items-center gap-2">
            <UserCheck size={18} className="text-[#3B6CE7]" />
            Top Credit Consumers
          </h3>
          {data?.topConsumers && data.topConsumers.length > 0 ? (
            <div className="space-y-3">
              {data.topConsumers.map((c, i) => (
                <div key={i} className="p-3 border border-[#F1F5F9] rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <p className="font-mono text-[10px] text-[#64748B]">{c.userId.slice(0, 16)}...</p>
                  </div>
                  <span className="font-bold text-[#1D2B64]">{c.creditsUsed} Credits</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-[#94A3B8] font-semibold">
              No credit consumption recorded.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
