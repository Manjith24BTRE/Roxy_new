import React, { useState } from 'react';
import { Folder, Save, Undo, History, RotateCcw } from 'lucide-react';

export function WorkspacePanel() {
  const [formData, setFormData] = useState({
    workspaceName: 'Main Workspace',
    defaultFolder: '/users/veytrix/projects',
    autoSave: true,
    autoRecovery: true
  });

  const [recentProjects, setRecentProjects] = useState([
    { id: 1, name: 'Cinematic B-Roll Promo.vtx', modified: '2 hours ago' },
    { id: 2, name: 'Shorts Audio Cleanup.vtx', modified: '1 day ago' },
    { id: 3, name: 'Color Match Intro.vtx', modified: '3 days ago' }
  ]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const handleClearHistory = () => {
    setRecentProjects([]);
  };

  const handleSave = () => {
    console.log("Workspace saved:", formData);
  };

  const handleReset = () => {
    setFormData({
      workspaceName: 'Main Workspace',
      defaultFolder: '/users/veytrix/projects',
      autoSave: true,
      autoRecovery: true
    });
    setRecentProjects([
      { id: 1, name: 'Cinematic B-Roll Promo.vtx', modified: '2 hours ago' },
      { id: 2, name: 'Shorts Audio Cleanup.vtx', modified: '1 day ago' },
      { id: 3, name: 'Color Match Intro.vtx', modified: '3 days ago' }
    ]);
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-left-4 duration-200">
      <div>
        <h2 className="text-lg font-display font-bold text-[#1D2B64]">Workspace Settings</h2>
        <p className="text-xs text-[#1D2B64]/50 font-medium">Configure default directories, auto-save settings, and project history.</p>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-bold text-[#1D2B64]/60 uppercase tracking-wider">Workspace Name</label>
          <input
            type="text"
            name="workspaceName"
            value={formData.workspaceName}
            onChange={handleChange}
            className="w-full bg-[#FAFAFC] border border-[#1D2B64]/10 rounded-xl px-3 py-2.5 text-xs text-[#1D2B64] focus:outline-none focus:border-[#3B6CE7]"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-bold text-[#1D2B64]/60 uppercase tracking-wider">Default Project Folder</label>
          <div className="relative">
            <Folder size={14} className="absolute left-3 top-3.5 text-[#1D2B64]/40" />
            <input
              type="text"
              name="defaultFolder"
              value={formData.defaultFolder}
              onChange={handleChange}
              className="w-full bg-[#FAFAFC] border border-[#1D2B64]/10 rounded-xl pl-9 pr-3 py-2.5 text-xs text-[#1D2B64] focus:outline-none focus:border-[#3B6CE7]"
            />
          </div>
        </div>

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
            <button
              type="button"
              onClick={handleClearHistory}
              className="text-[10px] text-red-500 font-bold hover:underline cursor-pointer"
            >
              Clear History
            </button>
          </div>

          {recentProjects.length > 0 ? (
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
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#1D2B64]/10 text-xs text-[#1D2B64]/60 hover:text-[#1D2B64] hover:bg-[#FAFAFC] transition cursor-pointer font-medium"
        >
          <RotateCcw size={12} /> Reset to Default
        </button>
        <button
          type="button"
          onClick={handleSave}
          className="px-5 py-2 rounded-full bg-[#1D2B64] text-white text-xs font-semibold hover:bg-[#3B6CE7] transition shadow-[0_4px_12px_rgba(29,43,100,0.15)] cursor-pointer"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}
export default WorkspacePanel;
