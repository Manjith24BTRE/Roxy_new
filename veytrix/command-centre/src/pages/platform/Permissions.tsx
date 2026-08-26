import React from 'react';
import { ShieldCheck, ToggleRight } from 'lucide-react';

const permissionMatrix = [
  { module: 'User Management', Controller: true, Admin: true, Support: true, Developer: false },
  { module: 'Billing & Plans', Controller: true, Admin: true, Support: false, Developer: false },
  { module: 'AI Operations', Controller: true, Admin: false, Support: false, Developer: true },
  { module: 'System Health', Controller: true, Admin: true, Support: false, Developer: true },
  { module: 'Audit Logs', Controller: true, Admin: false, Support: false, Developer: false },
  { module: 'Platform Settings', Controller: true, Admin: true, Support: false, Developer: false },
];

export const Permissions = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-[#1D2B64]">Permissions Matrix</h1>
        <p className="text-sm text-[#64748B] mt-1">Configure module-level access control for administrative roles.</p>
      </div>

      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E2E8F0] bg-gray-50/50">
                <th className="px-5 py-4 text-xs font-bold text-[#1D2B64] uppercase tracking-wider">Module</th>
                <th className="px-5 py-4 text-xs font-bold text-[#64748B] uppercase tracking-wider text-center">Controller</th>
                <th className="px-5 py-4 text-xs font-bold text-[#64748B] uppercase tracking-wider text-center">Admin</th>
                <th className="px-5 py-4 text-xs font-bold text-[#64748B] uppercase tracking-wider text-center">Support</th>
                <th className="px-5 py-4 text-xs font-bold text-[#64748B] uppercase tracking-wider text-center">Developer</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {permissionMatrix.map((row) => (
                <tr key={row.module} className="hover:bg-[#F8FAFC] transition-colors">
                  <td className="px-5 py-4 text-sm font-semibold text-[#1D2B64]">{row.module}</td>
                  
                  {['Controller', 'Admin', 'Support', 'Developer'].map(role => (
                    <td key={role} className="px-5 py-4 text-center">
                      <button className={`p-1 rounded-md transition-colors ${
                        row[role as keyof typeof row] 
                          ? 'text-[#3B6CE7] hover:bg-[#3B6CE7]/10' 
                          : 'text-[#CBD5E1] hover:bg-gray-100'
                      }`}>
                        {row[role as keyof typeof row] ? <ShieldCheck size={20} /> : <ToggleRight size={20} />}
                      </button>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
