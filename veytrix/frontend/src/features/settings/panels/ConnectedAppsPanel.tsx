import React, { useState } from 'react';
import { Chrome, Github, HardDrive, Cloud, Database, RotateCcw } from 'lucide-react';

interface AppItem {
  id: string;
  name: string;
  connected: boolean;
  icon: React.ReactNode;
}

export function ConnectedAppsPanel() {
  const [apps, setApps] = useState<AppItem[]>([
    { id: 'google', name: 'Google Cloud Platform', connected: true, icon: <Chrome size={18} className="text-red-500" /> },
    { id: 'github', name: 'GitHub Developer', connected: true, icon: <Github size={18} className="text-black" /> },
    { id: 'dropbox', name: 'Dropbox Storage', connected: false, icon: <Cloud size={18} className="text-blue-500" /> },
    { id: 'onedrive', name: 'Microsoft OneDrive', connected: false, icon: <Database size={18} className="text-blue-600" /> },
    { id: 'gdrive', name: 'Google Drive Sync', connected: false, icon: <HardDrive size={18} className="text-green-600" /> }
  ]);

  const handleToggleConnect = (id: string) => {
    setApps(prev => prev.map(a => a.id === id ? { ...a, connected: !a.connected } : a));
  };

  const handleSave = () => {
    console.log("Connected apps saved");
  };

  const handleReset = () => {
    setApps([
      { id: 'google', name: 'Google Cloud Platform', connected: true, icon: <Chrome size={18} className="text-red-500" /> },
      { id: 'github', name: 'GitHub Developer', connected: true, icon: <Github size={18} className="text-black" /> },
      { id: 'dropbox', name: 'Dropbox Storage', connected: false, icon: <Cloud size={18} className="text-blue-500" /> },
      { id: 'onedrive', name: 'Microsoft OneDrive', connected: false, icon: <Database size={18} className="text-blue-600" /> },
      { id: 'gdrive', name: 'Google Drive Sync', connected: false, icon: <HardDrive size={18} className="text-green-600" /> }
    ]);
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-left-4 duration-200">
      <div>
        <h2 className="text-lg font-display font-bold text-[#1D2B64]">Connected Integrations</h2>
        <p className="text-xs text-[#1D2B64]/50 font-medium">Connect third-party storage assets and cloud-sync files directly.</p>
      </div>

      <div className="flex flex-col gap-3">
        {apps.map((app) => (
          <div 
            key={app.id}
            className="flex justify-between items-center p-4 bg-[#FAFAFC] border border-[#1D2B64]/5 rounded-2xl text-xs font-semibold text-[#1D2B64] transition hover:bg-[#E6F2F8]/20"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-xl border border-[#1D2B64]/5 shadow-sm">
                {app.icon}
              </div>
              <div className="flex flex-col gap-0.5">
                <span>{app.name}</span>
                <span className="text-[9px] text-[#1D2B64]/40 font-medium">
                  {app.connected ? 'Connected and authorized' : 'Not linked to workspace'}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleToggleConnect(app.id)}
              className={`px-3 py-1.5 rounded-xl text-[10px] font-bold transition cursor-pointer ${
                app.connected 
                  ? 'border border-red-200 text-red-500 hover:bg-red-50' 
                  : 'bg-[#1D2B64] text-white hover:bg-[#3B6CE7]'
              }`}
            >
              {app.connected ? 'Disconnect' : 'Connect'}
            </button>
          </div>
        ))}
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
export default ConnectedAppsPanel;
