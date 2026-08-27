import React, { useState, useEffect } from 'react';
import { rolesService } from '../../services/rolesService';
import { Role } from '../../types';
import { Shield, Plus, Users, RefreshCw } from 'lucide-react';

export const Roles = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadRoles = async () => {
    setIsLoading(true);
    const data = await rolesService.getRoles();
    setRoles(data);
    setIsLoading(false);
  };

  useEffect(() => {
    loadRoles();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-[#1D2B64]">Roles Management</h1>
          <p className="text-sm text-[#64748B] mt-1">Configure role-based access control and system permissions.</p>
        </div>
        <button 
          onClick={loadRoles}
          className="flex items-center gap-2 bg-[#3B6CE7] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#2b52b3] transition-colors cursor-pointer"
        >
          <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
          Refresh Roles
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-48 text-[#64748B] font-semibold text-xs gap-2">
          <RefreshCw className="animate-spin" size={16} />
          <span>Loading Roles from Supabase...</span>
        </div>
      ) : roles.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-[#E2E8F0] text-center max-w-lg mx-auto my-12">
          <Shield className="mx-auto text-[#64748B] mb-3" size={36} />
          <h3 className="font-bold text-[#1D2B64] text-lg">No Custom Roles Configured</h3>
          <p className="text-sm text-[#64748B] mt-1">The system is currently operating on default Admin RBAC policies.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {roles.map((role) => (
            <div key={role.id} className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-sm flex flex-col justify-between hover:border-[#3B6CE7]/40 transition-colors">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-[#F1F5F9] rounded-xl text-[#3B6CE7]">
                    <Shield size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#1D2B64] text-lg">{role.name}</h3>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-[#E2E8F0] flex justify-between items-center text-sm">
                <span className="flex items-center gap-1.5 text-[#64748B]">
                  <Users size={16} />
                  {role.usersCount} Members
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
