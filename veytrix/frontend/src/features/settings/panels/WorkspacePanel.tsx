import React, { useState, useEffect } from 'react';
import { Save, Undo, History, RotateCcw, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useSettings } from '../hooks/useSettings';
import { syncService } from '../../../services/sync.service';

export function WorkspacePanel() {
  const { userProfile, isSaving, toast, saveWorkspace } = useSettings();
  
  const [formData, setFormData] = useState({
    autoSave: true,
    autoRecovery: true
  });

  const [recentProjects, setRecentProjects] = useState<any[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);

  useEffect(() => {
    if (userProfile?.workspace_settings) {
      setFormData({
        autoSave: userProfile.workspace_settings.autoSave ?? true,
        autoRecovery: userProfile.workspace_settings.autoRecovery ?? true
      });
    }
  }, [userProfile]);

  useEffect(() => {
    let isMounted = true;
    const loadProjects = async () => {
      setIsLoadingProjects(true);
      try {
        const projects = await syncService.fetchRemoteProjects();
        if (isMounted) {
          // Format modifications
          const formatted = projects.slice(0, 5).map((p: any) => {
            const timeDiff = Date.now() - (p.updatedAt || Date.now());
            let modifiedStr = 'Just now';
            if (timeDiff > 3600000 * 24) {
              modifiedStr = `${Math.floor(timeDiff / (3600000 * 24))} days ago`;
            } else if (timeDiff > 3600000) {
              modifiedStr = `${Math.floor(timeDiff / 3600000)} hours ago`;
            } else if (timeDiff > 60000) {
              modifiedStr = `${Math.floor(timeDiff / 60000)} minutes ago`;
            }
            return {
              id: p.id,
              name: p.name,
              modified: modifiedStr
            };
          });
          setRecentProjects(formatted);
        }
      } catch (err) {
        console.warn('Failed to load recent projects for settings:', err);
      } finally {
        if (isMounted) setIsLoadingProjects(false);
      }
    };

    loadProjects();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: checked 
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveWorkspace(formData);
  };

  const handleReset = () => {
    setFormData({
      autoSave: true,
      autoRecovery: true
    });
  };

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-6 animate-in fade-in slide-in-from-left-4 duration-200">
      <div>
        <h2 className="text-lg font-display font-bold text-[#1D2B64]">Workspace Settings</h2>
        <p className="text-xs text-[#1D2B64]/50 font-medium">Configure auto-save settings and view project history.</p>
      </div>

      {/* Notification Toast */}
      {toast.show && (
        <div className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-200 ${
          toast.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' :
          toast.type === 'error' ? 'bg-red-50 text-red-800 border border-red-200' :
          'bg-blue-50 text-blue-800 border border-blue-200'
        }`}>
          {toast.type === 'success' && <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />}
          {toast.type === 'error' && <AlertCircle size={16} className="text-red-600 shrink-0" />}
          <span>{toast.message}</span>
        </div>
      )}

      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
          <label className="flex items-center gap-3 p-3 bg-[#FAFAFC] border border-[#1D2B64]/5 rounded-xl cursor-pointer">
            <input
              type="checkbox"
              name="autoSave"
              checked={formData.autoSave}
              onChange={handleChange}
              className="rounded border-[#1D2B64]/20 text-[#3B6CE7] focus:ring-[#3B6CE7] h-4 w-4"
            />
            <div className="flex flex-col">
              <span className="text-xs font-bold text-[#1D2B64] flex items-center gap-1.5"><Save size={12} /> Auto Save</span>
              <span className="text-[9px] text-[#1D2B64]/50 font-medium">Save projects automatically</span>
            </div>
          </label>

          <label className="flex items-center gap-3 p-3 bg-[#FAFAFC] border border-[#1D2B64]/5 rounded-xl cursor-pointer">
            <input
              type="checkbox"
              name="autoRecovery"
              checked={formData.autoRecovery}
              onChange={handleChange}
              className="rounded border-[#1D2B64]/20 text-[#3B6CE7] focus:ring-[#3B6CE7] h-4 w-4"
            />
            <div className="flex flex-col">
              <span className="text-xs font-bold text-[#1D2B64] flex items-center gap-1.5"><Undo size={12} /> Auto Recovery</span>
              <span className="text-[9px] text-[#1D2B64]/50 font-medium">Recover backup after crash</span>
            </div>
          </label>
        </div>

        <div className="mt-4 flex flex-col gap-2">
          <div className="flex justify-between items-center border-b border-[#1D2B64]/5 pb-1">
            <h4 className="text-xs font-bold text-[#1D2B64] flex items-center gap-1.5"><History size={12} /> Recent Projects</h4>
          </div>

          {isLoadingProjects ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 size={16} className="animate-spin text-[#1D2B64]/40" />
            </div>
          ) : recentProjects.length > 0 ? (
            <div className="flex flex-col gap-2 mt-1">
              {recentProjects.map((p) => (
                <div key={p.id} className="flex justify-between items-center p-2.5 bg-[#FAFAFC] border border-[#1D2B64]/5 rounded-lg text-xs text-[#1D2B64] font-medium">
                  <span>{p.name}</span>
                  <span className="text-[10px] text-[#1D2B64]/40">{p.modified}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[11px] text-[#1D2B64]/40 text-center py-4 font-medium">No recent projects found.</p>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center border-t border-[#1D2B64]/5 pt-4 mt-4 select-none">
        <button
          type="button"
          onClick={handleReset}
          disabled={isSaving}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#1D2B64]/10 text-xs text-[#1D2B64]/60 hover:text-[#1D2B64] hover:bg-[#FAFAFC] transition cursor-pointer font-medium disabled:opacity-50"
        >
          <RotateCcw size={12} /> Reset to Default
        </button>
        <button
          type="submit"
          disabled={isSaving}
          className="flex items-center gap-1.5 px-5 py-2 rounded-full bg-[#1D2B64] text-white text-xs font-semibold hover:bg-[#3B6CE7] transition shadow-[0_4px_12px_rgba(29,43,100,0.15)] cursor-pointer disabled:opacity-50"
        >
          {isSaving ? (
            <>
              <Loader2 size={14} className="animate-spin" /> Saving...
            </>
          ) : (
            'Save Changes'
          )}
        </button>
      </div>
    </form>
  );
}

export default WorkspacePanel;
