import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Globe, Languages, Clock, RotateCcw, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useSettings } from '../hooks/useSettings';
import { AccountSettingsData } from '../types/settings.types';

export function AccountPanel() {
  const { userProfile, isSaving, toast, saveAccount } = useSettings();

  const [formData, setFormData] = useState<AccountSettingsData>(() => ({
    displayName: userProfile?.display_name || userProfile?.full_name || 'Mavros Member',
    username: userProfile?.username || 'mavros_member',
    email: userProfile?.email || 'member@mavros.in',
    phone: userProfile?.phone || '+91 98765 43210',
    country: userProfile?.country || 'India',
    language: userProfile?.language || 'English (US)',
    timezone: userProfile?.timezone || 'UTC+5:30 (IST)',
  }));

  useEffect(() => {
    if (userProfile) {
      setFormData({
        displayName: userProfile.display_name || userProfile.full_name || 'Mavros Member',
        username: userProfile.username || 'mavros_member',
        email: userProfile.email || 'member@mavros.in',
        phone: userProfile.phone || '+91 98765 43210',
        country: userProfile.country || 'India',
        language: userProfile.language || 'English (US)',
        timezone: userProfile.timezone || 'UTC+5:30 (IST)',
      });
    }
  }, [userProfile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveAccount(formData);
  };

  const handleReset = () => {
    if (userProfile) {
      setFormData({
        displayName: userProfile.display_name || userProfile.full_name || 'Mavros Member',
        username: userProfile.username || 'mavros_member',
        email: userProfile.email || 'member@mavros.in',
        phone: userProfile.phone || '+91 98765 43210',
        country: userProfile.country || 'India',
        language: userProfile.language || 'English (US)',
        timezone: userProfile.timezone || 'UTC+5:30 (IST)',
      });
    } else {
      setFormData({
        displayName: 'Mavros Member',
        username: 'mavros_member',
        email: 'member@mavros.in',
        phone: '+91 98765 43210',
        country: 'India',
        language: 'English (US)',
        timezone: 'UTC+5:30 (IST)',
      });
    }
  };

  const getInitials = (name: string) => {
    if (!name) return 'MM';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-6 animate-in fade-in slide-in-from-left-4 duration-200">
      <div>
        <h2 className="text-lg font-display font-bold text-[#1D2B64]">Account Settings</h2>
        <p className="text-xs text-[#1D2B64]/50 font-medium">Manage your personal account information and credentials.</p>
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

      {/* Profile Picture */}
      <div className="flex items-center gap-4 p-4 bg-[#E6F2F8]/30 border border-[#1D2B64]/5 rounded-2xl">
        <div className="h-16 w-16 rounded-full bg-[#1D2B64] flex items-center justify-center text-white text-xl font-bold select-none overflow-hidden">
          {userProfile?.avatar_url ? (
            <img src={userProfile.avatar_url} alt="Profile" className="h-full w-full object-cover" />
          ) : (
            getInitials(formData.displayName)
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-bold text-[#1D2B64]">Profile Picture</span>
          <div className="flex gap-2">
            <button type="button" className="px-3 py-1.5 rounded-lg bg-[#1D2B64] text-white text-[10px] font-bold hover:bg-[#3B6CE7] transition cursor-pointer">
              Upload New
            </button>
            <button type="button" className="px-3 py-1.5 rounded-lg border border-[#1D2B64]/10 text-[#1D2B64]/60 text-[10px] font-bold hover:bg-white transition cursor-pointer">
              Remove
            </button>
          </div>
        </div>
      </div>

      {/* Form Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-bold text-[#1D2B64]/60 uppercase tracking-wider">Display Name</label>
          <div className="relative">
            <User size={14} className="absolute left-3 top-3 text-[#1D2B64]/40" />
            <input
              type="text"
              name="displayName"
              value={formData.displayName}
              onChange={handleChange}
              placeholder="e.g. Mavros Member"
              className="w-full bg-[#FAFAFC] border border-[#1D2B64]/10 rounded-xl pl-9 pr-3 py-2.5 text-xs text-[#1D2B64] focus:outline-none focus:border-[#3B6CE7]"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-bold text-[#1D2B64]/60 uppercase tracking-wider">Username</label>
          <div className="relative">
            <span className="absolute left-3 top-[11px] text-[10px] font-bold text-[#1D2B64]/40">@</span>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="username"
              className="w-full bg-[#FAFAFC] border border-[#1D2B64]/10 rounded-xl pl-7 pr-3 py-2.5 text-xs text-[#1D2B64] focus:outline-none focus:border-[#3B6CE7]"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1 md:col-span-2">
          <label className="text-[10px] font-bold text-[#1D2B64]/60 uppercase tracking-wider">Email Address</label>
          <div className="relative">
            <Mail size={14} className="absolute left-3 top-3 text-[#1D2B64]/40" />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="email@domain.com"
              className="w-full bg-[#FAFAFC] border border-[#1D2B64]/10 rounded-xl pl-9 pr-3 py-2.5 text-xs text-[#1D2B64] focus:outline-none focus:border-[#3B6CE7]"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-bold text-[#1D2B64]/60 uppercase tracking-wider">Phone Number</label>
          <div className="relative">
            <Phone size={14} className="absolute left-3 top-3 text-[#1D2B64]/40" />
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+91 98765 43210"
              className="w-full bg-[#FAFAFC] border border-[#1D2B64]/10 rounded-xl pl-9 pr-3 py-2.5 text-xs text-[#1D2B64] focus:outline-none focus:border-[#3B6CE7]"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-bold text-[#1D2B64]/60 uppercase tracking-wider">Country</label>
          <div className="relative">
            <Globe size={14} className="absolute left-3 top-[13px] text-[#1D2B64]/40" />
            <select
              name="country"
              value={formData.country}
              onChange={handleChange}
              className="w-full bg-[#FAFAFC] border border-[#1D2B64]/10 rounded-xl pl-9 pr-3 py-2.5 text-xs text-[#1D2B64] focus:outline-none focus:border-[#3B6CE7] appearance-none"
            >
              <option>India</option>
              <option>United States</option>
              <option>United Kingdom</option>
              <option>Germany</option>
              <option>Singapore</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-bold text-[#1D2B64]/60 uppercase tracking-wider">Preferred Language</label>
          <div className="relative">
            <Languages size={14} className="absolute left-3 top-[13px] text-[#1D2B64]/40" />
            <select
              name="language"
              value={formData.language}
              onChange={handleChange}
              className="w-full bg-[#FAFAFC] border border-[#1D2B64]/10 rounded-xl pl-9 pr-3 py-2.5 text-xs text-[#1D2B64] focus:outline-none focus:border-[#3B6CE7] appearance-none"
            >
              <option>English (US)</option>
              <option>Spanish</option>
              <option>Hindi</option>
              <option>French</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-bold text-[#1D2B64]/60 uppercase tracking-wider">Timezone</label>
          <div className="relative">
            <Clock size={14} className="absolute left-3 top-[13px] text-[#1D2B64]/40" />
            <select
              name="timezone"
              value={formData.timezone}
              onChange={handleChange}
              className="w-full bg-[#FAFAFC] border border-[#1D2B64]/10 rounded-xl pl-9 pr-3 py-2.5 text-xs text-[#1D2B64] focus:outline-none focus:border-[#3B6CE7] appearance-none"
            >
              <option>UTC+5:30 (IST)</option>
              <option>UTC-5:00 (EST)</option>
              <option>UTC+0:00 (GMT)</option>
              <option>UTC+8:00 (SGT)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Save / Reset panel footer */}
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

export default AccountPanel;
