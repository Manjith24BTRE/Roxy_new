import React, { useState } from 'react';
import { DataTable } from '../../components/ui/DataTable';
import { ToggleRight, ToggleLeft } from 'lucide-react';

const mockFlags = [
  { id: 'ff_1', name: 'New AI Dashboard UI', key: 'ui_dashboard_v2', status: true, environment: 'Production', rolloutPercentage: 100, lastUpdated: '2025-08-20' },
  { id: 'ff_2', name: 'Claude 3.5 Beta Access', key: 'ai_claude_beta', status: true, environment: 'Production', rolloutPercentage: 15, lastUpdated: '2025-08-25' },
  { id: 'ff_3', name: 'Enterprise SSO', key: 'auth_sso_saml', status: false, environment: 'Production', rolloutPercentage: 0, lastUpdated: '2025-08-10' },
  { id: 'ff_4', name: 'Advanced Billing Engine', key: 'billing_v3', status: true, environment: 'Staging', rolloutPercentage: 100, lastUpdated: '2025-08-26' },
];

export const FeatureFlags = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [flags, setFlags] = useState(mockFlags);

  const toggleFlag = (id: string) => {
    setFlags(flags.map(f => f.id === id ? { ...f, status: !f.status } : f));
  };

  const filteredFlags = flags.filter(f => 
    f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.key.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-[#1D2B64]">Feature Flags</h1>
        <p className="text-sm text-[#64748B] mt-1">Manage gradual rollouts and toggle platform features.</p>
      </div>

      <DataTable 
        data={filteredFlags}
        onSearch={setSearchTerm}
        searchPlaceholder="Search flags by name or key..."
        columns={[
          { header: 'Feature Name', key: 'name', className: 'font-bold text-[#1D2B64]' },
          { header: 'Key', key: 'key', className: 'font-mono text-[10px] text-[#64748B]' },
          { 
            header: 'Environment', 
            key: 'environment', 
            render: (f) => (
              <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                f.environment === 'Production' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
              }`}>{f.environment}</span>
            )
          },
          { header: 'Rollout', key: 'rolloutPercentage', render: (f) => `${f.rolloutPercentage}%` },
          { header: 'Last Updated', key: 'lastUpdated' },
          { 
            header: 'Status', 
            key: 'status', 
            render: (f) => (
              <button onClick={() => toggleFlag(f.id)} className={`transition-colors ${f.status ? 'text-green-500' : 'text-gray-300'}`}>
                {f.status ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
              </button>
            )
          },
        ]}
      />
    </div>
  );
};
