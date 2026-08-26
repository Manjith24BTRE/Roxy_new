import React, { useState } from 'react';
import { Save, AlertCircle } from 'lucide-react';

export const PlatformSettings = () => {
  const [activeTab, setActiveTab] = useState('general');

  const tabs = [
    { id: 'general', label: 'General' },
    { id: 'system', label: 'System' },
    { id: 'ai', label: 'AI Configuration' },
    { id: 'email', label: 'Email & SMTP' },
    { id: 'payments', label: 'Payments (Stripe)' },
    { id: 'security', label: 'Security' },
  ];

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-[#1D2B64]">Platform Settings</h1>
          <p className="text-sm text-[#64748B] mt-1">Manage global configuration for the Veytrix application.</p>
        </div>
        <button className="flex items-center gap-2 bg-[#3B6CE7] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#2b52b3] transition-colors shadow-sm">
          <Save size={16} />
          Save Changes
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Tabs sidebar */}
        <div className="w-full md:w-64 shrink-0 space-y-1">
          {tabs.map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                activeTab === tab.id 
                  ? 'bg-[#1D2B64] text-white' 
                  : 'text-[#64748B] hover:bg-white hover:text-[#1D2B64]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content area */}
        <div className="flex-1 bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-sm">
          <div className="mb-6 pb-4 border-b border-[#E2E8F0]">
            <h3 className="font-bold text-lg text-[#1D2B64] capitalize">{activeTab} Settings</h3>
            <p className="text-xs text-[#64748B]">Update {activeTab} configuration values.</p>
          </div>
          
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-[#1D2B64] mb-1.5 uppercase tracking-wider">Platform Name</label>
              <input type="text" defaultValue="Veytrix" className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#3B6CE7] text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#1D2B64] mb-1.5 uppercase tracking-wider">Support Email</label>
              <input type="email" defaultValue="support@veytrix.com" className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#3B6CE7] text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#1D2B64] mb-1.5 uppercase tracking-wider">Maintenance Mode</label>
              <div className="flex items-center gap-3 mt-2">
                <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200">
                  <span className="inline-block h-4 w-4 transform rounded-full bg-white transition translate-x-1" />
                </button>
                <span className="text-sm text-[#64748B]">Disable user access and show maintenance page</span>
              </div>
            </div>
            
            <div className="mt-8 p-4 bg-orange-50 border border-orange-200 rounded-lg flex gap-3">
              <AlertCircle className="text-orange-600 shrink-0 mt-0.5" size={20} />
              <div>
                <h4 className="text-sm font-bold text-orange-800">Mock Settings</h4>
                <p className="text-xs text-orange-700 mt-1">Settings changed here are not persisted to a database because this is a frontend-only implementation.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
