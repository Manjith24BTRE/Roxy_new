import React from 'react';
import { useAIJobs } from '../../hooks/useAIJobs';
import { DataTable } from '../../components/ui/DataTable';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Eye, RotateCcw, RefreshCw } from 'lucide-react';

export const Jobs = () => {
  const { 
    jobs, 
    isLoading, 
    error, 
    searchTerm, 
    setSearchTerm, 
    refresh 
  } = useAIJobs();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-[#1D2B64]">AI Jobs & Executions</h1>
          <p className="text-sm text-[#64748B] mt-1">Monitor the queue and status of AI model inference jobs.</p>
        </div>
        <button 
          onClick={refresh}
          className="p-2 border border-[#E2E8F0] rounded-xl text-[#64748B] hover:bg-white hover:text-[#1D2B64] transition-colors flex items-center gap-2 text-xs font-semibold"
          title="Refresh Data"
        >
          <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
          Refresh Queue
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex justify-between items-center">
          <span>Failed to load AI jobs queue: {error}</span>
          <button onClick={refresh} className="font-bold underline">Retry</button>
        </div>
      )}

      <DataTable 
        data={jobs}
        onSearch={setSearchTerm}
        searchPlaceholder="Search jobs by ID or type..."
        columns={[
          { header: 'Job ID', key: 'id', className: 'font-mono text-[10px]' },
          { header: 'Type', key: 'type', className: 'font-semibold' },
          { header: 'User ID', key: 'userId', className: 'text-[10px]' },
          { header: 'Status', key: 'status', render: (job) => <StatusBadge status={job.status} /> },
          { header: 'Started At', key: 'startedAt', render: (job) => new Date(job.startedAt).toLocaleString() },
          { header: 'Duration', key: 'durationMs', render: (job) => job.durationMs ? `${job.durationMs}ms` : '-' },
          { 
            header: 'Actions', 
            key: 'actions', 
            render: (job) => (
              <div className="flex gap-2">
                <button className="p-1.5 text-[#64748B] hover:bg-[#F1F5F9] rounded-md transition-colors" title="View Details">
                  <Eye size={16} />
                </button>
                {job.status === 'Failed' && (
                  <button className="p-1.5 text-orange-600 hover:bg-orange-50 rounded-md transition-colors" title="Retry Job">
                    <RotateCcw size={16} />
                  </button>
                )}
              </div>
            ) 
          },
        ]}
      />
    </div>
  );
};

