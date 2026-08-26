import React from 'react';
import { StatCard } from '../../components/ui/StatCard';
import { Coins, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { DataTable } from '../../components/ui/DataTable';

export const Credits = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-[#1D2B64]">Credit Economy</h1>
        <p className="text-sm text-[#64748B] mt-1">Overview of platform credit circulation and usage.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Total Credits Issued" value="45.2M" icon={Coins} trend={{ value: 5.2, isPositive: true }} />
        <StatCard title="Credits Consumed" value="32.8M" icon={ArrowDownRight} trend={{ value: 8.4, isPositive: true }} />
        <StatCard title="Outstanding Balance" value="12.4M" icon={ArrowUpRight} />
      </div>

      <DataTable 
        title="Recent Credit Transactions"
        data={[
          { id: 'ctx_1', user: 'alice@example.com', amount: 500, type: 'Credit', reason: 'Monthly Plan Renew', date: '2025-08-26T10:00:00Z' },
          { id: 'ctx_2', user: 'bob@example.com', amount: -15, type: 'Debit', reason: 'AI Model Inference (GPT-4o)', date: '2025-08-26T11:20:00Z' },
          { id: 'ctx_3', user: 'charlie@example.com', amount: -250, type: 'Debit', reason: 'Batch AI Job', date: '2025-08-26T12:05:00Z' },
          { id: 'ctx_4', user: 'diana@example.com', amount: 10000, type: 'Credit', reason: 'Enterprise Top-up', date: '2025-08-25T09:00:00Z' },
        ]}
        columns={[
          { header: 'ID', key: 'id', className: 'font-mono text-[10px]' },
          { header: 'User', key: 'user', className: 'font-semibold' },
          { 
            header: 'Amount', 
            key: 'amount', 
            render: (ctx) => (
              <span className={`font-bold ${ctx.type === 'Credit' ? 'text-green-600' : 'text-orange-600'}`}>
                {ctx.type === 'Credit' ? '+' : ''}{ctx.amount}
              </span>
            )
          },
          { header: 'Type', key: 'type' },
          { header: 'Reason', key: 'reason', className: 'text-[#64748B]' },
          { header: 'Date', key: 'date', render: (ctx) => new Date(ctx.date).toLocaleString() },
        ]}
      />
    </div>
  );
};
