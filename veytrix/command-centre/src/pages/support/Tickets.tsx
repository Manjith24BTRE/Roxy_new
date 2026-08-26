import React, { useState } from 'react';
import { mockSupportTickets } from '../../data/mockData';
import { DataTable } from '../../components/ui/DataTable';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { MessageSquare } from 'lucide-react';

export const Tickets = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTickets = mockSupportTickets.filter(ticket => 
    ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket.userId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-[#1D2B64]">Support Tickets</h1>
        <p className="text-sm text-[#64748B] mt-1">Manage user support requests and technical issues.</p>
      </div>

      <DataTable 
        data={filteredTickets}
        onSearch={setSearchTerm}
        searchPlaceholder="Search tickets by subject or user ID..."
        columns={[
          { header: 'Ticket ID', key: 'id', className: 'font-mono text-[10px]' },
          { header: 'User ID', key: 'userId', className: 'text-[10px]' },
          { header: 'Subject', key: 'subject', className: 'font-semibold' },
          { 
            header: 'Priority', 
            key: 'priority', 
            render: (t) => (
              <span className={`text-xs font-bold ${
                t.priority === 'High' ? 'text-orange-600' : 
                t.priority === 'Urgent' ? 'text-red-600' : 'text-[#64748B]'
              }`}>{t.priority}</span>
            )
          },
          { header: 'Status', key: 'status', render: (t) => <StatusBadge status={t.status} /> },
          { header: 'Assigned', key: 'assignedStaff', render: (t) => t.assignedStaff || 'Unassigned' },
          { header: 'Created', key: 'createdAt', render: (t) => new Date(t.createdAt).toLocaleDateString() },
          { 
            header: 'View', 
            key: 'view', 
            render: () => (
              <button className="p-1.5 text-[#3B6CE7] hover:bg-[#F1F5F9] rounded-md transition-colors" title="View Ticket">
                <MessageSquare size={16} />
              </button>
            ) 
          },
        ]}
      />
    </div>
  );
};
