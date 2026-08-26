import React, { useState } from 'react';
import { mockLogs } from '../../data/mockData';
import { DataTable } from '../../components/ui/DataTable';
import { StatusBadge } from '../../components/ui/StatusBadge';

export const Logs = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLogs = mockLogs.filter(log => 
    log.event.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-[#1D2B64]">System Logs</h1>
        <p className="text-sm text-[#64748B] mt-1">Centralized log viewer for all platform events.</p>
      </div>

      <DataTable 
        data={filteredLogs}
        onSearch={setSearchTerm}
        searchPlaceholder="Search logs by event, service, or ID..."
        onFilterClick={() => {}}
        columns={[
          { header: 'Timestamp', key: 'timestamp', render: (log) => new Date(log.timestamp).toLocaleString() },
          { header: 'Severity', key: 'severity', render: (log) => <StatusBadge status={log.severity} /> },
          { header: 'Category', key: 'category' },
          { header: 'Event', key: 'event', className: 'font-semibold' },
          { header: 'Service', key: 'service' },
          { header: 'Status Code', key: 'status' },
        ]}
      />
    </div>
  );
};
