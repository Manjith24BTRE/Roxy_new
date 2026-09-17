import React, { useState, useEffect, useCallback } from 'react';
import { Database, Trash2, ShieldAlert, Loader2, HardDrive, RefreshCw } from 'lucide-react';
import { supabase, supabaseAdmin } from '../../../lib/supabase';
import { useAuth } from '../../../context/AuthContext';
import { ProjectDB } from '../../../components/editor-main-screen/tools/project-save/ProjectDB';

export function StoragePanel() {
  const { user, updateUserProfile } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  const [stats, setStats] = useState({
    projectsCount: 0,
    projectsCacheMb: '0.00 MB',
    avatarSizeKb: 0,
    avatarFileCount: 0,
    totalUsedBytes: 0,
    totalUsedMb: '0.00 MB',
    percent: 0,
  });

  const STORAGE_LIMIT_BYTES = 50 * 1024 * 1024; // 50MB standard allocation

  const showNotification = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const calculateLocalDraftStats = async (): Promise<{ count: number; bytes: number }> => {
    let count = 0;
    let bytes = 0;

    // 1. Calculate from IndexedDB ProjectDB
    try {
      const localProjects = await ProjectDB.getLocalCachedProjectsOnly();
      count = localProjects.length;
      if (localProjects.length > 0) {
        bytes += new Blob([JSON.stringify(localProjects)]).size;
      }
    } catch (e) {
      console.warn('Could not read IndexedDB projects for storage stats:', e);
    }

    // 2. Calculate from localStorage keys
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (
          key &&
          (key.startsWith('veytrix_project_backup_') ||
            key.startsWith('veytrix_recent_') ||
            key.startsWith('veytrix_draft_') ||
            key.startsWith('veytrix_favorite_') ||
            key.startsWith('veytrix_gallery_') ||
            key.startsWith('veytrix_export_cache_'))
        ) {
          const item = localStorage.getItem(key);
          if (item) {
            bytes += new Blob([key, item]).size;
          }
        }
      }
    } catch (e) {
      console.warn('Could not read localStorage for storage stats:', e);
    }

    return { count, bytes };
  };

  const fetchStorageStats = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      // 1. Fetch real local draft backup cache metrics
      const { count: draftCount, bytes: draftBytes } = await calculateLocalDraftStats();

      // 2. Fetch user's profile image storage from Supabase 'avatars' bucket
      let avatarBytes = 0;
      let avatarCount = 0;
      try {
        const { data: avatarFiles } = await supabaseAdmin.storage
          .from('avatars')
          .list(user.id);
        
        if (avatarFiles && avatarFiles.length > 0) {
          avatarFiles.forEach((file) => {
            avatarBytes += (file.metadata as any)?.size || 0;
            avatarCount++;
          });
        }
      } catch (e) {
        console.warn('Could not query avatars storage size:', e);
      }

      // 3. Fetch sizes across all user storage buckets
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

      // Total cloud & local storage metrics calculation
      const totalCloudBytes = avatarBytes + otherBucketsBytes;
      const totalMb = (totalCloudBytes / (1024 * 1024)).toFixed(2);
      const calculatedPercent = Math.min(100, Math.max(0, Math.round((totalCloudBytes / STORAGE_LIMIT_BYTES) * 100)));
      const projectsCacheMb = (draftBytes / (1024 * 1024)).toFixed(2);

      setStats({
        projectsCount: draftCount,
        projectsCacheMb: `${projectsCacheMb} MB`,
        avatarSizeKb: Math.round(avatarBytes / 1024),
        avatarFileCount: avatarCount,
        totalUsedBytes: totalCloudBytes,
        totalUsedMb: `${totalMb} MB`,
        percent: calculatedPercent,
      });
    } catch (err) {
      console.warn('Could not load storage stats:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchStorageStats();
  }, [fetchStorageStats]);

  const handleClearCache = async (type: 'projects' | 'avatars') => {
    if (!user) return;
    const previousStats = { ...stats };

    if (type === 'projects') {
      if (!window.confirm('This will purge all local project backup caches and temporary editor states. Proceed?')) {
        return;
      }

      setIsDeleting('projects');

      // Optimistic UI update: instantly update state to 0
      setStats((prev) => ({
        ...prev,
        projectsCount: 0,
        projectsCacheMb: '0.00 MB',
      }));

      try {
        await ProjectDB.clearAllCache();
        showNotification('Local project backup cache purged successfully.');
        await fetchStorageStats();
      } catch (err) {
        console.error('Failed to purge project cache:', err);
        setStats(previousStats);
        showNotification('Failed to purge local cache. Restored previous values.');
      } finally {
        setIsDeleting(null);
      }
    } else if (type === 'avatars') {
      if (!window.confirm('Delete all cached profile pictures from storage bucket?')) {
        return;
      }

      setIsDeleting('avatars');

      // Optimistic UI update: instantly set avatar size & count to 0 and recalculate percent
      setStats((prev) => {
        const newTotalCloudBytes = Math.max(0, prev.totalUsedBytes - prev.avatarSizeKb * 1024);
        const newTotalMb = (newTotalCloudBytes / (1024 * 1024)).toFixed(2);
        const newPercent = Math.min(100, Math.max(0, Math.round((newTotalCloudBytes / STORAGE_LIMIT_BYTES) * 100)));

        return {
          ...prev,
          avatarSizeKb: 0,
          avatarFileCount: 0,
          totalUsedBytes: newTotalCloudBytes,
          totalUsedMb: `${newTotalMb} MB`,
          percent: newPercent,
        };
      });

      try {
        const { data: fileList } = await supabaseAdmin.storage.from('avatars').list(user.id);
        if (fileList && fileList.length > 0) {
          const paths = fileList.map((f) => `${user.id}/${f.name}`);
          await supabaseAdmin.storage.from('avatars').remove(paths);
        }
        await updateUserProfile({ avatar_url: null });
        showNotification('Profile image storage purged successfully.');
        await fetchStorageStats();
      } catch (err) {
        console.error('Failed to purge avatar storage:', err);
        setStats(previousStats);
        showNotification('Failed to purge profile image storage. Restored state.');
      } finally {
        setIsDeleting(null);
      }
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-left-4 duration-200">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-lg font-display font-bold text-[#1D2B64]">Storage & Cache Management</h2>
          <p className="text-xs text-[#1D2B64]/50 font-medium">Monitor real-time storage metrics, purge temporary editor caches, and optimize disk usage.</p>
        </div>
        <button
          type="button"
          onClick={() => fetchStorageStats()}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#1D2B64] bg-[#FAFAFC] hover:bg-[#1D2B64]/5 border border-[#1D2B64]/10 rounded-xl transition cursor-pointer"
          title="Refresh Storage Metrics"
        >
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {toastMessage && (
        <div className="p-3 bg-sky-50 border border-sky-200 text-sky-800 rounded-xl text-xs font-semibold animate-in fade-in">
          {toastMessage}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="animate-spin text-[#3B6CE7]" size={28} />
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {/* Storage Bar Indicator */}
          <div className="p-5 bg-[#FAFAFC] border border-[#1D2B64]/10 rounded-2xl flex flex-col gap-3 shadow-sm">
            <div className="flex justify-between items-center text-xs font-bold text-[#1D2B64]">
              <span className="flex items-center gap-1.5 text-sm"><Database size={16} className="text-[#3B6CE7]" /> Cloud Storage Allocation</span>
              <span className="font-mono text-xs">{stats.totalUsedMb} / 50.00 MB ({stats.percent}%)</span>
            </div>
            
            <div className="w-full bg-[#1D2B64]/10 rounded-full h-3 overflow-hidden p-0.5">
              <div 
                className="bg-gradient-to-r from-sky-500 to-indigo-600 h-full rounded-full transition-all duration-300" 
                style={{ width: `${stats.percent}%` }} 
              />
            </div>
            
            <div className="flex justify-between items-center text-[10px] text-[#1D2B64]/50 font-medium pt-1 border-t border-[#1D2B64]/5">
              <span>Standard Free Plan</span>
              <span>Upgrade for up to 100 GB cloud space</span>
            </div>
          </div>

          {/* Cache items list */}
          <div className="flex flex-col gap-3 mt-1">
            <h4 className="text-xs font-bold text-[#1D2B64] uppercase tracking-wider text-[11px]">Storage & Active Caches</h4>

            <div className="flex flex-col gap-2.5">
              {/* Profile Image Storage */}
              <div className="flex justify-between items-center p-3.5 bg-[#FAFAFC] border border-[#1D2B64]/10 rounded-xl text-xs text-[#1D2B64] font-medium transition hover:border-[#1D2B64]/20">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-sky-500/10 text-sky-600 rounded-lg">
                    <Database size={16} />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="font-bold">Profile Image Storage</span>
                    <span className="text-[10px] text-[#1D2B64]/50">
                      {stats.avatarFileCount} file{stats.avatarFileCount !== 1 ? 's' : ''} in Supabase avatar bucket
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-[#1D2B64]">{stats.avatarSizeKb} KB</span>
                  <button
                    type="button"
                    onClick={() => handleClearCache('avatars')}
                    disabled={isDeleting === 'avatars' || stats.avatarSizeKb === 0}
                    className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-500/10 rounded-lg transition disabled:opacity-40 disabled:cursor-not-allowed"
                    title="Purge Avatar Storage"
                  >
                    {isDeleting === 'avatars' ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                  </button>
                </div>
              </div>

              {/* Local Draft Backup Cache */}
              <div className="flex justify-between items-center p-3.5 bg-[#FAFAFC] border border-[#1D2B64]/10 rounded-xl text-xs text-[#1D2B64] font-medium transition hover:border-[#1D2B64]/20">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-500/10 text-indigo-600 rounded-lg">
                    <HardDrive size={16} />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="font-bold">Local Draft Backup Cache</span>
                    <span className="text-[10px] text-[#1D2B64]/50">
                      Cached project timelines & IndexedDB backups
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex flex-col items-end text-[11px] font-mono font-bold">
                    <span className="text-[#1D2B64]">{stats.projectsCount} draft project{stats.projectsCount !== 1 ? 's' : ''}</span>
                    <span className="text-[9px] text-[#1D2B64]/40 font-normal">({stats.projectsCacheMb})</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleClearCache('projects')}
                    disabled={isDeleting === 'projects' || stats.projectsCount === 0}
                    className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-500/10 rounded-lg transition disabled:opacity-40 disabled:cursor-not-allowed"
                    title="Purge Local Projects Cache"
                  >
                    {isDeleting === 'projects' ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Warning info */}
          <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex gap-2.5 items-start text-[10.5px] text-amber-900 leading-relaxed font-semibold">
            <ShieldAlert size={16} className="text-amber-600 shrink-0 mt-0.5" />
            <span>
              Purging temporary storage & local project caches is completely safe. Your cloud project database records remain fully preserved.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default StoragePanel;

