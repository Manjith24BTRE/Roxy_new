import React, { useState } from 'react';
import { mockAIModels } from '../../data/mockData';
import { DataTable } from '../../components/ui/DataTable';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Settings2 } from 'lucide-react';

export const Models = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredModels = mockAIModels.filter(model => 
    model.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    model.provider.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-[#1D2B64]">AI Models</h1>
        <p className="text-sm text-[#64748B] mt-1">Manage, monitor, and configure AI model endpoints and versions.</p>
      </div>

      <DataTable 
        data={filteredModels}
        onSearch={setSearchTerm}
        searchPlaceholder="Search models by name or provider..."
        columns={[
          { 
            header: 'Model Name', 
            key: 'name',
            render: (model) => <span className="font-bold text-[#1D2B64]">{model.name}</span>
          },
          { header: 'Version', key: 'version', className: 'font-mono text-[10px]' },
          { header: 'Provider', key: 'provider' },
          { header: 'Status', key: 'status', render: (model) => <StatusBadge status={model.status} /> },
          { header: 'Usage Count', key: 'usageCount', render: (model) => model.usageCount.toLocaleString() },
          { 
            header: 'Success Rate', 
            key: 'successRate', 
            render: (model) => (
              <span className={`font-semibold ${model.successRate > 98 ? 'text-green-600' : 'text-orange-600'}`}>
                {model.successRate}%
              </span>
            )
          },
          { header: 'Avg Latency', key: 'avgLatencyMs', render: (model) => `${model.avgLatencyMs}ms` },
          { 
            header: 'Configure', 
            key: 'id', 
            render: () => (
              <button className="p-2 text-[#3B6CE7] hover:bg-[#F1F5F9] rounded-lg transition-colors">
                <Settings2 size={16} />
              </button>
            ) 
          },
        ]}
      />
    </div>
  );
};
