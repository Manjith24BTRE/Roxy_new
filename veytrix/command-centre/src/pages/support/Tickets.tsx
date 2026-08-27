import React, { useState, useEffect } from 'react';
import { ticketsService } from '../../services/ticketsService';
import { SupportTicket } from '../../types';
import { DataTable } from '../../components/ui/DataTable';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { LifeBuoy, RefreshCw } from 'lucide-react';

export const Tickets = () => {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const loadTickets = async () => {
    setIsLoading(true);
    const data = await ticketsService.getTickets();
    setTickets(data);
    setIsLoading(false);
  };

  useEffect(() => {
    loadTickets();
  }, []);

  const filteredTickets = tickets.filter(
    (t) =>
      t.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.userId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-[#1D2B64]">Support Tickets</h1>
          <p className="text-sm text-[#64748B] mt-1">Customer support inquiries and issue tickets.</p>
        </div>
        <button
          onClick={loadTickets}
          className="flex items-center gap-2 border border-[#E2E8F0] px-3 py-1.5 rounded-lg text-xs font-semibold text-[#64748B] hover:bg-white transition cursor-pointer"
        >
          <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-48 text-[#64748B] font-semibold text-xs gap-2">
          <RefreshCw className="animate-spin" size={16} />
          <span>Loading Support Tickets...</span>
        </div>
      ) : tickets.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-[#E2E8F0] text-center max-w-lg mx-auto my-12">
          <LifeBuoy className="mx-auto text-[#64748B] mb-3" size={36} />
          <h3 className="font-bold text-[#1D2B64] text-lg">No Active Support Tickets</h3>
          <p className="text-sm text-[#64748B] mt-1">All customer support inquiries have been resolved.</p>
        </div>
      ) : (
        <DataTable
          data={filteredTickets}
          onSearch={setSearchTerm}
          searchPlaceholder="Search tickets by subject or User ID..."
          columns={[
            { header: 'Ticket ID', key: 'id', className: 'font-mono text-xs' },
            { header: 'Subject', key: 'subject', className: 'font-bold text-[#1D2B64]' },
            { header: 'User ID', key: 'userId', className: 'font-mono text-xs' },
            { header: 'Priority', key: 'priority', className: 'font-semibold text-xs' },
            { header: 'Created', key: 'createdAt', render: (t) => new Date(t.createdAt).toLocaleString() },
            { header: 'Status', key: 'status', render: (t) => <StatusBadge status={t.status} /> },
          ]}
        />
      )}
    </div>
  );
};
