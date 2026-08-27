import React from 'react';
import { useAuditLogs } from '../../hooks/useAuditLogs';
import { DataTable } from '../../components/ui/DataTable';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { RefreshCw } from 'lucide-react';

export const AuditLogs = () => {
  const { 
    logs, 
    isLoading, 
    error, 
    setSearchTerm, 
    refresh 
  } = useAuditLogs();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-[#1D2B64]">Security Audit Logs</h1>
          <p className="text-sm text-[#64748B] mt-1">Immutable ledger of all administrative actions taken in the Control Centre.</p>
        </div>
        <button 
          onClick={refresh}
          className="p-2 border border-[#E2E8F0] rounded-xl text-[#64748B] hover:bg-white hover:text-[#1D2B64] transition-colors flex items-center gap-2 text-xs font-semibold"
          title="Refresh Data"
        >
          <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex justify-between items-center">
          <span>Failed to load audit logs: {error}</span>
          <button onClick={refresh} className="font-bold underline">Retry</button>
        </div>
      )}

      <DataTable 
        data={logs}
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

