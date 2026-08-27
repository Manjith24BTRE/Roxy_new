import React, { useEffect, useState } from 'react';
import { transactionsService } from '../../services/transactionsService';
import { Transaction } from '../../types';
import { DataTable } from '../../components/ui/DataTable';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { FileText, RefreshCw } from 'lucide-react';

export const Transactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const loadTransactions = async () => {
    setIsLoading(true);
    const data = await transactionsService.getTransactions();
    setTransactions(data);
    setIsLoading(false);
  };

  useEffect(() => {
    loadTransactions();
  }, []);

  const filteredTransactions = transactions.filter(
    (tx) =>
      tx.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.userId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-[#1D2B64]">Transactions</h1>
          <p className="text-sm text-[#64748B] mt-1">View and manage live customer payments and subscription billing.</p>
        </div>
        <button
          onClick={loadTransactions}
          className="flex items-center gap-2 border border-[#E2E8F0] px-3 py-1.5 rounded-lg text-xs font-semibold text-[#64748B] hover:bg-white transition cursor-pointer"
        >
          <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-48 text-[#64748B] font-semibold text-xs gap-2">
          <RefreshCw className="animate-spin" size={16} />
          <span>Loading Transactions from Supabase...</span>
        </div>
      ) : (
        <DataTable
          data={filteredTransactions}
          onSearch={setSearchTerm}
          searchPlaceholder="Search transactions by ID or User ID..."
          columns={[
            { header: 'Transaction ID', key: 'id', className: 'font-mono text-[10px]' },
            { header: 'User ID', key: 'userId', className: 'font-mono text-[10px]' },
            { header: 'Amount', key: 'amount', render: (tx) => <span className="font-bold">${tx.amount.toFixed(2)}</span> },
            { header: 'Plan', key: 'plan', className: 'font-semibold' },
            { header: 'Payment Method', key: 'paymentMethod', className: 'text-[#64748B]' },
            { header: 'Date', key: 'date', render: (tx) => new Date(tx.date).toLocaleString() },
            { header: 'Status', key: 'status', render: (tx) => <StatusBadge status={tx.status} /> },
            {
              header: 'Receipt',
              key: 'receipt',
              render: () => (
                <button className="p-1.5 text-[#3B6CE7] hover:bg-[#F1F5F9] rounded-md transition-colors" title="View Receipt">
                  <FileText size={16} />
                </button>
              ),
            },
          ]}
        />
      )}
    </div>
  );
};
