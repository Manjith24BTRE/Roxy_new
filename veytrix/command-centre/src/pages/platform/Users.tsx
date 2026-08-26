import React, { useState } from 'react';
import { mockUsers } from '../../data/mockData';
import { DataTable } from '../../components/ui/DataTable';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { MoreHorizontal } from 'lucide-react';

export const Users = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredUsers = mockUsers.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-[#1D2B64]">Platform Users</h1>
        <p className="text-sm text-[#64748B] mt-1">Manage user accounts, subscriptions, and platform access.</p>
      </div>

      <DataTable 
        data={filteredUsers}
        onSearch={setSearchTerm}
        searchPlaceholder="Search users by name or email..."
        columns={[
          { 
            header: 'User', 
            key: 'name',
            render: (user) => (
              <div>
                <p className="font-bold text-[#1D2B64]">{user.name}</p>
                <p className="text-[10px] text-[#64748B]">{user.email}</p>
              </div>
            )
          },
          { header: 'Plan', key: 'plan', render: (user) => <span className="font-semibold">{user.plan}</span> },
          { header: 'Status', key: 'status', render: (user) => <StatusBadge status={user.status} /> },
          { header: 'Credits', key: 'credits', render: (user) => <span className="font-semibold text-blue-600">{user.credits.toLocaleString()}</span> },
          { header: 'Usage', key: 'usage', render: (user) => user.usage.toLocaleString() },
          { header: 'Joined', key: 'joinedAt', render: (user) => new Date(user.joinedAt).toLocaleDateString() },
          { header: 'Last Login', key: 'lastLoginAt', render: (user) => new Date(user.lastLoginAt).toLocaleString() },
          { 
            header: 'Actions', 
            key: 'id', 
            render: () => (
              <button className="p-2 hover:bg-[#F1F5F9] rounded-lg text-[#64748B] transition-colors">
                <MoreHorizontal size={16} />
              </button>
            ) 
          },
        ]}
      />
    </div>
  );
};
