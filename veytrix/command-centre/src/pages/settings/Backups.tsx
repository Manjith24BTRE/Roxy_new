import React, { useState, useEffect } from 'react';
import { backupsService } from '../../services/backupsService';
import { Backup } from '../../types';
import { Database, RefreshCw } from 'lucide-react';

export const Backups = () => {
  const [backups, setBackups] = useState<Backup[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadBackups = async () => {
    setIsLoading(true);
    const { backups: data } = await backupsService.getBackups();
    setBackups(data);
    setIsLoading(false);
  };

  useEffect(() => {
    loadBackups();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-[#1D2B64]">Database Backups</h1>
          <p className="text-sm text-[#64748B] mt-1">System automated database snapshots and point-in-time recovery logs.</p>
        </div>
        <button
          onClick={loadBackups}
          className="flex items-center gap-2 border border-[#E2E8F0] px-3 py-1.5 rounded-lg text-xs font-semibold text-[#64748B] hover:bg-white transition cursor-pointer"
        >
          <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
          Refresh Backups
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-48 text-[#64748B] font-semibold text-xs gap-2">
          <RefreshCw className="animate-spin" size={16} />
          <span>Loading Backup History...</span>
        </div>
      ) : backups.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-[#E2E8F0] text-center max-w-lg mx-auto my-12">
          <Database className="mx-auto text-[#64748B] mb-3" size={36} />
          <h3 className="font-bold text-[#1D2B64] text-lg">Backup System Managed by Supabase</h3>
          <p className="text-sm text-[#64748B] mt-1">
            Automated daily point-in-time physical backups are managed directly by Supabase Cloud Infrastructure.
          </p>
        </div>
      ) : (
        <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-sm">
          <div className="space-y-4">
            {backups.map((b) => (
              <div key={b.id} className="p-4 border border-[#E2E8F0] rounded-xl flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-[#1D2B64]">{b.name}</h4>
                  <p className="text-xs text-[#64748B]">{new Date(b.createdAt).toLocaleString()}</p>
                </div>
                <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-bold uppercase">
                  {b.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
