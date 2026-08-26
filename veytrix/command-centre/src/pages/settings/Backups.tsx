import React, { useState } from 'react';
import { DataTable } from '../../components/ui/DataTable';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Download, RotateCcw, Trash2, DatabaseBackup } from 'lucide-react';

const mockBackups = [
  { id: 'bk_1', name: 'production_full_20250826.tar.gz', type: 'Full', sizeBytes: 15420000000, createdAt: '2025-08-26T02:00:00Z', status: 'Completed', retentionDays: 30 },
  { id: 'bk_2', name: 'production_inc_20250825.tar.gz', type: 'Incremental', sizeBytes: 520000000, createdAt: '2025-08-25T02:00:00Z', status: 'Completed', retentionDays: 7 },
  { id: 'bk_3', name: 'config_dump_v2.json', type: 'Config', sizeBytes: 15000, createdAt: '2025-08-20T10:00:00Z', status: 'Completed', retentionDays: 365 },
  { id: 'bk_4', name: 'production_full_20250827.tar.gz', type: 'Full', sizeBytes: 0, createdAt: '2025-08-27T02:00:00Z', status: 'Failed', retentionDays: 30 },
];

const formatBytes = (bytes: number) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const Backups = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredBackups = mockBackups.filter(b => 
    b.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-[#1D2B64]">System Backups</h1>
          <p className="text-sm text-[#64748B] mt-1">Manage database, configuration, and storage snapshots.</p>
        </div>
        <button className="flex items-center gap-2 bg-[#3B6CE7] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#2b52b3] transition-colors">
          <DatabaseBackup size={16} />
          Create Backup
        </button>
      </div>

      <DataTable 
        data={filteredBackups}
        onSearch={setSearchTerm}
        searchPlaceholder="Search backups..."
        columns={[
          { header: 'Backup Name', key: 'name', className: 'font-mono text-xs font-semibold text-[#1D2B64]' },
          { header: 'Type', key: 'type' },
          { header: 'Size', key: 'sizeBytes', render: (b) => formatBytes(b.sizeBytes) },
          { header: 'Created At', key: 'createdAt', render: (b) => new Date(b.createdAt).toLocaleString() },
          { header: 'Retention', key: 'retentionDays', render: (b) => `${b.retentionDays} days` },
          { header: 'Status', key: 'status', render: (b) => <StatusBadge status={b.status} /> },
          { 
            header: 'Actions', 
            key: 'actions', 
            render: (b) => (
              <div className="flex gap-2">
                <button className="p-1.5 text-[#3B6CE7] hover:bg-[#F1F5F9] rounded-md transition-colors" title="Download">
                  <Download size={16} />
                </button>
                <button className="p-1.5 text-orange-600 hover:bg-orange-50 rounded-md transition-colors" title="Restore">
                  <RotateCcw size={16} />
                </button>
                <button className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors" title="Delete">
                  <Trash2 size={16} />
                </button>
              </div>
            ) 
          },
        ]}
      />
    </div>
  );
};
