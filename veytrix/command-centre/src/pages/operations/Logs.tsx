import React, { useState, useEffect } from 'react';
import { logsService } from '../../services/logsService';
import { Log } from '../../types';
import { DataTable } from '../../components/ui/DataTable';
import { RefreshCw, Terminal } from 'lucide-react';

export const Logs = () => {
  const [logs, setLogs] = useState<Log[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const loadLogs = async () => {
    setIsLoading(true);
    const data = await logsService.getLogs();
    setLogs(data);
    setIsLoading(false);
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const filteredLogs = logs.filter(
    (log) =>
      log.event.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.service.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-[#1D2B64]">System Logs</h1>
          <p className="text-sm text-[#64748B] mt-1">Real-time execution logs and system error events.</p>
        </div>
        <button
          onClick={loadLogs}
          className="flex items-center gap-2 border border-[#E2E8F0] px-3 py-1.5 rounded-lg text-xs font-semibold text-[#64748B] hover:bg-white transition cursor-pointer"
        >
          <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
          Refresh Logs
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-48 text-[#64748B] font-semibold text-xs gap-2">
          <RefreshCw className="animate-spin" size={16} />
          <span>Querying System Logs...</span>
        </div>
      ) : logs.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-[#E2E8F0] text-center max-w-lg mx-auto my-12">
          <Terminal className="mx-auto text-[#64748B] mb-3" size={36} />
          <h3 className="font-bold text-[#1D2B64] text-lg">No Log Events Recorded</h3>
          <p className="text-sm text-[#64748B] mt-1">No system errors or audit log entries have been generated yet.</p>
        </div>
      ) : (
        <DataTable
          data={filteredLogs}
          onSearch={setSearchTerm}
          searchPlaceholder="Search logs by event or service..."
          columns={[
            { header: 'Timestamp', key: 'timestamp', render: (l) => new Date(l.timestamp).toLocaleString() },
            {
              header: 'Severity',
              key: 'severity',
              render: (l) => (
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    l.severity === 'Error'
                      ? 'bg-red-100 text-red-700'
                      : l.severity === 'Warning'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}
                >
                  {l.severity}
                </span>
              ),
            },
            { header: 'Service', key: 'service', className: 'font-semibold text-xs' },
            { header: 'Event Message', key: 'event', className: 'text-xs text-[#1D2B64]' },
            { header: 'Status Code', key: 'status', className: 'font-mono text-xs' },
          ]}
        />
      )}
    </div>
  );
};
