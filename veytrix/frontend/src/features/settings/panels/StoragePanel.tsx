import React, { useState, useEffect } from 'react';
import { Database, Trash2, ShieldAlert, Loader2 } from 'lucide-react';
import { supabase, supabaseAdmin } from '../../../lib/supabase';
import { useAuth } from '../../../context/AuthContext';
import { syncService } from '../../../services/sync.service';

export function StoragePanel() {
  const { user, updateUserProfile } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    projectsCount: 0,
    avatarSizeKb: 0,
    totalUsedBytes: 0,
    totalUsedMb: '0.00 MB',
    percent: 0,
  });

  const STORAGE_LIMIT_BYTES = 50 * 1024 * 1024; // 50MB standard allocation

  const getLocalDraftCount = (): number => {
    let count = 0;
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (
          key &&
          (key.startsWith('veytrix_project_backup_') ||
            key.startsWith('veytrix_recent_') ||
            key.startsWith('veytrix_draft_') ||
            key.startsWith('veytrix_favorite_') ||
            key.startsWith('veytrix_gallery_'))
        ) {
          count++;
        }
      }
    } catch {}
    return count;
  };

  const fetchStorageStats = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // 1. Count actual local draft backup cache entries
      const localDraftCount = getLocalDraftCount();
      const remoteProjects = await syncService.fetchRemoteProjects().catch(() => []);
      const totalProjects = Math.max(localDraftCount, remoteProjects.length);

      // 2. Fetch user's avatar size in avatars/{user.id}/
      let avatarBytes = 0;
      try {
        const { data: avatarFiles } = await supabaseAdmin.storage
          .from('avatars')
          .list(user.id);
        
        if (avatarFiles && avatarFiles.length > 0) {
          avatarFiles.forEach((file) => {
            avatarBytes += (file.metadata as any)?.size || 0;
          });
        }
      } catch (e) {
        console.warn('Could not query avatars storage size:', e);
      }

      // 3. Fetch sizes across all user storage buckets (exports, images, videos, audio, thumbnails, assets)
      let otherBucketsBytes = 0;
      const bucketNames = ['exports', 'images', 'videos', 'audio', 'thumbnails', 'assets'];

      await Promise.all(
        bucketNames.map(async (bucket) => {
          try {
            const { data: files } = await supabaseAdmin.storage.from(bucket).list(user.id);
            if (files && files.length > 0) {
              files.forEach((file) => {
                otherBucketsBytes += (file.metadata as any)?.size || 0;
              });
            }
          } catch {}
        })
      );

      // Total used bytes calculation from real objects
      const totalBytes = avatarBytes + otherBucketsBytes;
      const totalMb = (totalBytes / (1024 * 1024)).toFixed(2);
      const calculatedPercent = Math.min(100, Math.max(0, Math.round((totalBytes / STORAGE_LIMIT_BYTES) * 100)));

      setStats({
        projectsCount: totalProjects,
        avatarSizeKb: Math.round(avatarBytes / 1024),
        totalUsedBytes: totalBytes,
        totalUsedMb: `${totalMb} MB`,
        percent: calculatedPercent,
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
      if (window.confirm('This will clear all your local cached project backups. Database records remain safe. Continue?')) {
        try {
          const keysToRemove: string[] = [];
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (
              key &&
              (key.startsWith('veytrix_project_backup_') ||
                key.startsWith('veytrix_recent_') ||
                key.startsWith('veytrix_draft_') ||
                key.startsWith('veytrix_favorite_') ||
                key.startsWith('veytrix_gallery_'))
            ) {
              keysToRemove.push(key);
            }
          }
          keysToRemove.forEach((k) => localStorage.removeItem(k));
        } catch (e) {
          console.warn('Error clearing local project cache:', e);
        }
        await fetchStorageStats();
      }
    } else if (type === 'avatars') {
      if (window.confirm('Delete all cached profile image backups in storage?')) {
        try {
          const { data: fileList } = await supabaseAdmin.storage.from('avatars').list(user.id);
          if (fileList && fileList.length > 0) {
            const paths = fileList.map((f) => `${user.id}/${f.name}`);
            await supabaseAdmin.storage.from('avatars').remove(paths);
          }
          await updateUserProfile({ avatar_url: null });
        } catch (e) {
          console.warn('Error purging avatars storage cache:', e);
        }
        await fetchStorageStats();
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
