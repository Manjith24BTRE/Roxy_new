import React, { useState } from 'react';
import { mockTransactions } from '../../data/mockData';
import { DataTable } from '../../components/ui/DataTable';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { FileText } from 'lucide-react';

export const Transactions = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTransactions = mockTransactions.filter(tx => 
    tx.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tx.userId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-[#1D2B64]">Transactions</h1>
        <p className="text-sm text-[#64748B] mt-1">View and manage customer payments and refunds.</p>
      </div>

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
            ) 
          },
        ]}
      />
    </div>
  );
};
