import React, { useState } from 'react';
import { mockAIJobs } from '../../data/mockData';
import { DataTable } from '../../components/ui/DataTable';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Eye, RotateCcw } from 'lucide-react';

export const Jobs = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredJobs = mockAIJobs.filter(job => 
    job.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-[#1D2B64]">AI Jobs & Executions</h1>
        <p className="text-sm text-[#64748B] mt-1">Monitor the queue and status of AI model inference jobs.</p>
      </div>

      <DataTable 
        data={filteredJobs}
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
