import React, { useState, useEffect } from 'react';
import { permissionsService, PermissionItem } from '../../services/permissionsService';
import { ShieldCheck, RefreshCw } from 'lucide-react';

export const Permissions = () => {
  const [permissions, setPermissions] = useState<PermissionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadPermissions = async () => {
    setIsLoading(true);
    const data = await permissionsService.getPermissions();
    setPermissions(data);
    setIsLoading(false);
  };

  useEffect(() => {
    loadPermissions();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-[#1D2B64]">Permissions Matrix</h1>
          <p className="text-sm text-[#64748B] mt-1">Granular access policies for platform controllers and operational tools.</p>
        </div>
        <button
          onClick={loadPermissions}
          className="flex items-center gap-2 border border-[#E2E8F0] px-3 py-1.5 rounded-lg text-xs font-semibold text-[#64748B] hover:bg-white transition cursor-pointer"
        >
          <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
          Refresh Matrix
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-48 text-[#64748B] font-semibold text-xs gap-2">
          <RefreshCw className="animate-spin" size={16} />
          <span>Loading Permissions Matrix...</span>
        </div>
      ) : permissions.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-[#E2E8F0] text-center max-w-lg mx-auto my-12">
          <ShieldCheck className="mx-auto text-[#64748B] mb-3" size={36} />
          <h3 className="font-bold text-[#1D2B64] text-lg">Default Admin Security Gate</h3>
          <p className="text-sm text-[#64748B] mt-1">
            All system permissions are currently governed by the strict Controller Authorization Gate (official@mavrostech.in).
          </p>
        </div>
      ) : (
        <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {permissions.map((p) => (
              <div key={p.id} className="p-4 border border-[#E2E8F0] rounded-xl flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-[#1D2B64]">{p.name}</h4>
                  <p className="text-xs text-[#64748B]">{p.category}</p>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-bold ${p.enabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {p.enabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
