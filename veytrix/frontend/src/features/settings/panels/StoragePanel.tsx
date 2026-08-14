import React, { useState, useEffect } from 'react';
import { Database, Trash2, ShieldAlert, Loader2 } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../context/AuthContext';
import { syncService } from '../../../services/sync.service';

export function StoragePanel() {
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    projectsCount: 0,
    avatarSizeKb: 0,
    totalUsedBytes: 0,
    totalUsedMb: '0.00 MB',
    percent: 0,
  });

  const STORAGE_LIMIT_BYTES = 50 * 1024 * 1024; // 50MB for free tier, custom limit

  const fetchStorageStats = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // 1. Fetch remote projects count
      const projects = await syncService.fetchRemoteProjects();
      const pCount = projects.length;

      // 2. Fetch avatar size in avatars/{user.id}/
      let avatarBytes = 0;
      const { data: fileList } = await supabase.storage
        .from('avatars')
        .list(user.id);
      
      if (fileList && fileList.length > 0) {
        fileList.forEach(file => {
          avatarBytes += file.metadata?.size || 0;
        });
      }

      // Sum everything
      // Note: timeline_json size is small, but we can estimate 5KB per project
      const estimatedProjectsBytes = pCount * 5 * 1024;
      const totalBytes = avatarBytes + estimatedProjectsBytes;
      const totalMb = (totalBytes / (1024 * 1024)).toFixed(2);
      const calculatedPercent = Math.min(100, Math.max(1, Math.round((totalBytes / STORAGE_LIMIT_BYTES) * 100)));

      setStats({
        projectsCount: pCount,
        avatarSizeKb: Math.round(avatarBytes / 1024),
        totalUsedBytes: totalBytes,
        totalUsedMb: `${totalMb} MB`,
        percent: calculatedPercent
      });
    } catch (err) {
      console.warn('Could not load storage stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStorageStats();
  }, [user]);

  const handleClearCache = async (type: 'projects' | 'avatars') => {
    if (!user) return;
    if (type === 'projects') {
      if (window.confirm('This will delete all your local cached draft projects. Remote database projects will remain safe. Continue?')) {
        // Clear local storage keys
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith('veytrix_project_backup_')) {
            localStorage.removeItem(key);
          }
        }
        alert('Local project cache cleared.');
        fetchStorageStats();
      }
    } else if (type === 'avatars') {
      if (window.confirm('Delete all cached profile image backups in storage?')) {
        const { data: fileList } = await supabase.storage.from('avatars').list(user.id);
        if (fileList && fileList.length > 0) {
          const paths = fileList.map(f => `${user.id}/${f.name}`);
          await supabase.storage.from('avatars').remove(paths);
        }
        alert('Avatar cache deleted from cloud storage.');
        fetchStorageStats();
      }
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-left-4 duration-200">
      <div>
        <h2 className="text-lg font-display font-bold text-[#1D2B64]">Storage & Cache Management</h2>
        <p className="text-xs text-[#1D2B64]/50 font-medium">Monitor your usage, clear active media caches, and purge temporary file exports.</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="animate-spin text-[#1D2B64]/50" size={24} />
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {/* Storage Bar Indicator */}
          <div className="p-4 bg-[#FAFAFC] border border-[#1D2B64]/5 rounded-2xl flex flex-col gap-2">
            <div className="flex justify-between items-center text-xs font-bold text-[#1D2B64]">
              <span className="flex items-center gap-1.5"><Database size={14} /> Cloud Storage Allocation</span>
              <span>{stats.totalUsedMb} / 50.00 MB ({stats.percent}%)</span>
            </div>
            
            <div className="w-full bg-[#1D2B64]/5 rounded-full h-2.5 overflow-hidden">
              <div className="bg-[#3B6CE7] h-full rounded-full" style={{ width: `${stats.percent}%` }} />
            </div>
            
            <span className="text-[9px] text-[#1D2B64]/40 font-medium">Upgrade to Premium to get up to 100 GB cloud space.</span>
          </div>

          {/* Cache items list */}
          <div className="flex flex-col gap-2 mt-2">
            <h4 className="text-xs font-bold text-[#1D2B64] border-b border-[#1D2B64]/5 pb-1 font-bold">Temporary Caches & Logs</h4>

            <div className="flex flex-col gap-2 mt-1">
              <div className="flex justify-between items-center p-3 bg-[#FAFAFC] border border-[#1D2B64]/5 rounded-xl text-xs text-[#1D2B64] font-medium">
                <div className="flex flex-col gap-0.5">
                  <span>Profile Image Storage</span>
                  <span className="text-[9px] text-[#1D2B64]/40">Active profile and avatar pictures in bucket</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-[#1D2B64]/70">{stats.avatarSizeKb} KB</span>
                  <button
                    type="button"
                    onClick={() => handleClearCache('avatars')}
                    className="text-red-500 hover:text-red-700 transition cursor-pointer"
                    title="Purge Avatar Storage"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <div className="flex justify-between items-center p-3 bg-[#FAFAFC] border border-[#1D2B64]/5 rounded-xl text-xs text-[#1D2B64] font-medium">
                <div className="flex flex-col gap-0.5">
                  <span>Local Draft Backup Cache</span>
                  <span className="text-[9px] text-[#1D2B64]/40">Cached project timeline edits</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-[#1D2B64]/70">{stats.projectsCount} saved projects</span>
                  <button
                    type="button"
                    onClick={() => handleClearCache('projects')}
                    className="text-red-500 hover:text-red-700 transition cursor-pointer"
                    title="Purge Local Projects Cache"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Warning info */}
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-xl flex gap-2 items-start text-[10px] text-yellow-800 leading-relaxed font-semibold">
            <ShieldAlert size={16} className="text-yellow-600 shrink-0" />
            <span>Purging temporary file caches is safe. Your main database records and projects remain untouched.</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default StoragePanel;
