import React from 'react';
import { Shield, Users as UsersIcon, Settings, Plus } from 'lucide-react';
import { DataTable } from '../../components/ui/DataTable';

const mockRoles = [
  { id: 'rol_1', name: 'Controller', usersCount: 1, desc: 'Full system access', icon: Shield, color: 'text-purple-600 bg-purple-100' },
  { id: 'rol_2', name: 'Admin', usersCount: 3, desc: 'Administrative access', icon: Settings, color: 'text-blue-600 bg-blue-100' },
  { id: 'rol_3', name: 'Support Staff', usersCount: 12, desc: 'Ticket and user management', icon: UsersIcon, color: 'text-green-600 bg-green-100' },
  { id: 'rol_4', name: 'Developer', usersCount: 8, desc: 'API and Logs access', icon: Settings, color: 'text-orange-600 bg-orange-100' },
];

export const Roles = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-[#1D2B64]">Roles</h1>
          <p className="text-sm text-[#64748B] mt-1">Manage administrative roles within the Control Centre.</p>
        </div>
        <button className="flex items-center gap-2 bg-[#3B6CE7] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#2b52b3] transition-colors">
          <Plus size={16} />
          Create Role
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-6">
        {mockRoles.map(role => (
          <div key={role.id} className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-sm hover:border-[#3B6CE7]/30 transition-all cursor-pointer">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${role.color}`}>
                <role.icon size={20} />
              </div>
              <span className="text-2xl font-black text-[#1D2B64]">{role.usersCount}</span>
            </div>
            <h3 className="font-bold text-[#1D2B64]">{role.name}</h3>
            <p className="text-xs text-[#64748B] mt-1">{role.desc}</p>
          </div>
        ))}
      </div>

      <DataTable 
        title="Role Assignments"
        data={[
          { id: 1, user: 'official@mavrostech.in', role: 'Controller', assignedAt: '2025-01-01' },
          { id: 2, user: 'admin@veytrix.com', role: 'Admin', assignedAt: '2025-02-15' },
          { id: 3, user: 'support@veytrix.com', role: 'Support Staff', assignedAt: '2025-03-10' },
        ]}
        columns={[
          { header: 'User', key: 'user', className: 'font-semibold' },
          { header: 'Role', key: 'role' },
          { header: 'Assigned At', key: 'assignedAt' },
        ]}
      />
    </div>
  );
};
