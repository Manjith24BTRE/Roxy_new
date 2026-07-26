import React from 'react';
import { Settings, Monitor, Bell, Shield } from 'lucide-react';

export function SettingsPage() {
  return (
    <div className="px-4 md:px-6 xl:px-8 py-8 w-full max-w-4xl mx-auto flex flex-col h-full">
      <h1 className="text-2xl md:text-[32px] font-display font-bold text-[#1D2B64] mb-8">Settings</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Navigation Sidebar */}
        <div className="col-span-1 flex flex-col gap-1">
          <button className="flex items-center gap-3 px-4 py-3 bg-[#F8FBFD] text-[#3B6CE7] rounded-xl font-medium text-sm text-left">
            <Settings size={18} /> Account
          </button>
          <button className="flex items-center gap-3 px-4 py-3 text-[#1D2B64]/60 hover:bg-[#FAFAFC] hover:text-[#1D2B64] rounded-xl font-medium text-sm text-left transition-colors cursor-not-allowed opacity-50">
            <Monitor size={18} /> Appearance
          </button>
          <button className="flex items-center gap-3 px-4 py-3 text-[#1D2B64]/60 hover:bg-[#FAFAFC] hover:text-[#1D2B64] rounded-xl font-medium text-sm text-left transition-colors cursor-not-allowed opacity-50">
            <Bell size={18} /> Notifications
          </button>
          <button className="flex items-center gap-3 px-4 py-3 text-[#1D2B64]/60 hover:bg-[#FAFAFC] hover:text-[#1D2B64] rounded-xl font-medium text-sm text-left transition-colors cursor-not-allowed opacity-50">
            <Shield size={18} /> Privacy
          </button>
        </div>

        {/* Content Area */}
        <div className="col-span-1 md:col-span-2 space-y-6">
          <div className="bg-white border border-[#1D2B64]/10 rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-[#1D2B64] mb-4">Account Information</h2>
            <p className="text-sm text-[#1D2B64]/60 mb-6">Manage your account settings and preferences.</p>
            
            <div className="space-y-4">
              <div className="opacity-50 pointer-events-none">
                <label className="block text-xs font-semibold text-[#1D2B64]/60 mb-1.5">Language</label>
                <select className="w-full bg-[#FAFAFC] border border-[#1D2B64]/10 rounded-lg px-3 py-2 text-sm text-[#1D2B64]">
                  <option>English (US)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
