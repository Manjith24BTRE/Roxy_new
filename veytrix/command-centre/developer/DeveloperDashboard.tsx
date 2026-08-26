import React from 'react';
import { StatCard } from '../src/components/ui/StatCard';
import { Code, TerminalSquare, Database, Network } from 'lucide-react';
import { DataTable } from '../src/components/ui/DataTable';

export const DeveloperDashboard = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-[#1D2B64]">Developer Portal</h1>
        <p className="text-sm text-[#64748B] mt-1">API debugging, internal metrics, and environment statuses.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard title="API Requests (24h)" value="2.4M" icon={Network} trend={{ value: 5, isPositive: true }} />
        <StatCard title="DB Queries/sec" value="4,250" icon={Database} trend={{ value: 2.1, isPositive: true }} />
        <StatCard title="Active Webhooks" value="24" icon={Code} />
        <StatCard title="System Exceptions" value="12" icon={TerminalSquare} trend={{ value: 14, isPositive: false }} />
      </div>

      <div className="grid grid-cols-1 gap-6">
        <DataTable 
          title="Active Environment Deployments"
          data={[
            { id: 'env_1', name: 'Production', version: 'v2.4.1', deployedAt: '2025-08-20T10:00:00Z', status: 'Operational', commit: 'a1b2c3d' },
            { id: 'env_2', name: 'Staging', version: 'v2.5.0-rc.1', deployedAt: '2025-08-25T14:30:00Z', status: 'Operational', commit: 'f9e8d7c' },
            { id: 'env_3', name: 'Development', version: 'main', deployedAt: '2025-08-26T09:15:00Z', status: 'Degraded', commit: 'b4a5d6e' },
          ]}
          columns={[
            { header: 'Environment', key: 'name', className: 'font-bold text-[#1D2B64]' },
            { header: 'Version', key: 'version', className: 'font-mono text-xs' },
            { header: 'Commit', key: 'commit', className: 'font-mono text-[10px] text-[#64748B]' },
            { header: 'Deployed At', key: 'deployedAt', render: (env) => new Date(env.deployedAt).toLocaleString() },
            { 
              header: 'Status', 
              key: 'status',
              render: (env) => (
                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                  env.status === 'Operational' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                }`}>{env.status}</span>
              )
            }
          ]}
        />
      </div>
    </div>
  );
};
