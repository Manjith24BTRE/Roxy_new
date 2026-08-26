import React, { useState } from 'react';
import { mockAuditLogs } from '../../data/mockData';
import { DataTable } from '../../components/ui/DataTable';
import { StatusBadge } from '../../components/ui/StatusBadge';

export const AuditLogs = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLogs = mockAuditLogs.filter(log => 
    log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.controller.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.target.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-[#1D2B64]">Security Audit Logs</h1>
        <p className="text-sm text-[#64748B] mt-1">Immutable ledger of all administrative actions taken in the Control Centre.</p>
      </div>

      <DataTable 
        data={filteredLogs}
        onSearch={setSearchTerm}
        searchPlaceholder="Search audit logs by action, controller, or target..."
        columns={[
          { header: 'Timestamp', key: 'timestamp', render: (log) => new Date(log.timestamp).toLocaleString() },
          { header: 'Controller', key: 'controller', className: 'font-semibold' },
          { header: 'Action', key: 'action' },
          { header: 'Target', key: 'target', className: 'font-mono text-[10px]' },
          { header: 'IP Address', key: 'ip' },
          { header: 'Result', key: 'result', render: (log) => <StatusBadge status={log.result} /> },
        ]}
      />
    </div>
  );
};
