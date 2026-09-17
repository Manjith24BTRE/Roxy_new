import React, { useState, useEffect } from 'react';
import { logsService, FrontendLog, BackendLog } from '../../services/logsService';
import { DataTable } from '../../components/ui/DataTable';
import { RefreshCw, Terminal, Activity, Monitor, Server } from 'lucide-react';

export const Logs = () => {
  const [activeTab, setActiveTab] = useState<'frontend' | 'backend'>('frontend');
  const [frontendLogs, setFrontendLogs] = useState<FrontendLog[]>([]);
  const [backendLogs, setBackendLogs] = useState<BackendLog[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState<'All' | 'info' | 'warning' | 'error'>('All');
  const [isLoading, setIsLoading] = useState(true);

  const loadAllLogs = async () => {
    setIsLoading(true);
    const [feData, beData] = await Promise.all([
      logsService.getFrontendLogs(),
      logsService.getBackendLogs(),
    ]);
    setFrontendLogs(feData);
    setBackendLogs(beData);
    setIsLoading(false);
  };

  useEffect(() => {
    loadAllLogs();

    // Subscribe to frontend real-time logs
    const unsubFrontend = logsService.subscribeToFrontendLogs((newLog) => {
      setFrontendLogs((prev) => [newLog, ...prev]);
    });

    // Subscribe to backend real-time logs
    const unsubBackend = logsService.subscribeToBackendLogs((newLog) => {
      setBackendLogs((prev) => [newLog, ...prev]);
    });

    return () => {
      unsubFrontend();
      unsubBackend();
    };
  }, []);

  const filteredFrontendLogs = frontendLogs.filter((log) => {
    const matchesSearch =
      log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.metadata && JSON.stringify(log.metadata).toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesLevel = levelFilter === 'All' || log.level === levelFilter;

    return matchesSearch && matchesLevel;
  });

  const filteredBackendLogs = backendLogs.filter((log) => {
    const matchesSearch =
      log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.metadata && JSON.stringify(log.metadata).toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesLevel = levelFilter === 'All' || log.level === levelFilter;

    return matchesSearch && matchesLevel;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-[#1D2B64]">System Execution Logs</h1>
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 animate-pulse">
              <Activity size={12} /> REALTIME STREAM ACTIVE
            </span>
          </div>
          <p className="text-sm text-[#64748B] mt-1">Live telemetry, editor actions, and backend API service logs.</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Level Filter Buttons */}
          <div className="flex items-center bg-[#F1F5F9] p-1 rounded-xl gap-1 text-xs font-semibold">
            {(['All', 'info', 'warning', 'error'] as const).map((lvl) => (
              <button
                key={lvl}
                type="button"
                onClick={() => setLevelFilter(lvl)}
                className={`px-3 py-1 rounded-lg transition capitalize cursor-pointer ${
                  levelFilter === lvl
                    ? 'bg-white text-[#1D2B64] shadow-sm font-bold'
                    : 'text-[#64748B] hover:text-[#1D2B64]'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>

          <button
            onClick={loadAllLogs}
            className="flex items-center gap-2 border border-[#E2E8F0] px-3 py-1.5 rounded-xl text-xs font-semibold text-[#64748B] hover:bg-white transition cursor-pointer"
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* Primary Tabs: Frontend Logs vs Backend Logs */}
      <div className="flex border-b border-[#E2E8F0] gap-6">
        <button
          type="button"
          onClick={() => setActiveTab('frontend')}
          className={`flex items-center gap-2 pb-3 text-sm font-bold border-b-2 transition cursor-pointer ${
            activeTab === 'frontend'
              ? 'border-[#3B6CE7] text-[#3B6CE7]'
              : 'border-transparent text-[#64748B] hover:text-[#1D2B64]'
          }`}
        >
          <Monitor size={16} />
          <span>Frontend Logs</span>
          <span className="px-2 py-0.5 text-[10px] rounded-full bg-[#E2E8F0] text-[#1D2B64] font-mono">
            {filteredFrontendLogs.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('backend')}
          className={`flex items-center gap-2 pb-3 text-sm font-bold border-b-2 transition cursor-pointer ${
            activeTab === 'backend'
              ? 'border-[#3B6CE7] text-[#3B6CE7]'
              : 'border-transparent text-[#64748B] hover:text-[#1D2B64]'
          }`}
        >
          <Server size={16} />
          <span>Backend Logs</span>
          <span className="px-2 py-0.5 text-[10px] rounded-full bg-[#E2E8F0] text-[#1D2B64] font-mono">
            {filteredBackendLogs.length}
          </span>
        </button>
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <div className="flex justify-center items-center h-48 text-[#64748B] font-semibold text-xs gap-2">
          <RefreshCw className="animate-spin" size={16} />
          <span>Querying {activeTab === 'frontend' ? 'Frontend' : 'Backend'} Logs...</span>
        </div>
      ) : activeTab === 'frontend' ? (
        filteredFrontendLogs.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-[#E2E8F0] text-center max-w-lg mx-auto my-8">
            <Terminal className="mx-auto text-[#64748B] mb-3" size={36} />
            <h3 className="font-bold text-[#1D2B64] text-lg">No logs generated yet</h3>
            <p className="text-sm text-[#64748B] mt-1">Frontend editor user actions and browser errors will stream here in real-time.</p>
          </div>
        ) : (
          <DataTable
            data={filteredFrontendLogs}
            onSearch={setSearchTerm}
            searchPlaceholder="Search frontend logs by message or category..."
            columns={[
              { header: 'Timestamp', key: 'created_at', render: (l) => new Date(l.created_at).toLocaleString() },
              {
                header: 'Level',
                key: 'level',
                render: (l) => (
                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                      l.level === 'error'
                        ? 'bg-red-100 text-red-700 border border-red-200'
                        : l.level === 'warning'
                        ? 'bg-amber-100 text-amber-700 border border-amber-200'
                        : 'bg-blue-100 text-blue-700 border border-blue-200'
                    }`}
                  >
                    {l.level}
                  </span>
                ),
              },
              { header: 'Category', key: 'category', className: 'font-bold text-xs text-[#1D2B64]' },
              { header: 'Message', key: 'message', className: 'text-xs text-[#1D2B64] font-medium' },
              {
                header: 'Metadata',
                key: 'metadata',
                className: 'font-mono text-[11px] text-[#64748B] max-w-xs truncate',
                render: (l) => (l.metadata && Object.keys(l.metadata).length > 0 ? JSON.stringify(l.metadata) : '—'),
              },
            ]}
          />
        )
      ) : filteredBackendLogs.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-[#E2E8F0] text-center max-w-lg mx-auto my-8">
          <Server className="mx-auto text-[#64748B] mb-3" size={36} />
          <h3 className="font-bold text-[#1D2B64] text-lg">No logs generated yet</h3>
          <p className="text-sm text-[#64748B] mt-1">Backend execution events, API services, and auth logs will stream here in real-time.</p>
        </div>
      ) : (
        <DataTable
          data={filteredBackendLogs}
          onSearch={setSearchTerm}
          searchPlaceholder="Search backend logs by message or service..."
          columns={[
            { header: 'Timestamp', key: 'created_at', render: (l) => new Date(l.created_at).toLocaleString() },
            {
              header: 'Level',
              key: 'level',
              render: (l) => (
                <span
                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                    l.level === 'error'
                      ? 'bg-red-100 text-red-700 border border-red-200'
                      : l.level === 'warning'
                      ? 'bg-amber-100 text-amber-700 border border-amber-200'
                      : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                  }`}
                >
                  {l.level}
                </span>
              ),
            },
            { header: 'Service', key: 'service', className: 'font-bold text-xs text-[#1D2B64]' },
            { header: 'Message', key: 'message', className: 'text-xs text-[#1D2B64] font-medium' },
            {
              header: 'Metadata',
              key: 'metadata',
              className: 'font-mono text-[11px] text-[#64748B] max-w-xs truncate',
              render: (l) => (l.metadata && Object.keys(l.metadata).length > 0 ? JSON.stringify(l.metadata) : '—'),
            },
          ]}
        />
      )}
    </div>
  );
};

export default Logs;
