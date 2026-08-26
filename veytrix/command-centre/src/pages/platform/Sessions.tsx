import React, { useState } from 'react';
import { mockSessions } from '../../data/mockData';
import { DataTable } from '../../components/ui/DataTable';
import { StatusBadge } from '../../components/ui/StatusBadge';

export const Sessions = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredSessions = mockSessions.filter(session => 
    session.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    session.device.toLowerCase().includes(searchTerm.toLowerCase()) ||
    session.ip.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-[#1D2B64]">Active Sessions</h1>
        <p className="text-sm text-[#64748B] mt-1">Monitor and revoke user login sessions across devices.</p>
      </div>

      <DataTable 
        data={filteredSessions}
        onSearch={setSearchTerm}
        searchPlaceholder="Search sessions by user, device, or IP..."
        columns={[
          { header: 'User ID', key: 'userId', className: 'font-mono text-[10px]' },
          { header: 'Device', key: 'device', render: (s) => <span className="font-semibold">{s.device}</span> },
          { header: 'Browser & OS', key: 'os', render: (s) => <span className="text-xs">{s.browser} on {s.os}</span> },
          { header: 'Location', key: 'location', render: (s) => <span>{s.location} ({s.ip})</span> },
          { header: 'Login Time', key: 'loginTime', render: (s) => new Date(s.loginTime).toLocaleString() },
          { header: 'Last Active', key: 'lastActive', render: (s) => new Date(s.lastActive).toLocaleString() },
          { header: 'Status', key: 'status', render: (s) => <StatusBadge status={s.status} /> },
          { 
            header: 'Action', 
            key: 'id', 
            render: (s) => (
              <button 
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  s.status === 'Active' 
                    ? 'bg-red-50 text-red-600 hover:bg-red-100' 
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
                disabled={s.status !== 'Active'}
              >
                Revoke
              </button>
            ) 
          },
        ]}
      />
    </div>
  );
};
