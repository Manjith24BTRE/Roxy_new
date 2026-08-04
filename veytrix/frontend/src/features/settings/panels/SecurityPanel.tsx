import React, { useState } from 'react';
import { Lock, ShieldAlert, Laptop, LogOut, KeyRound, RotateCcw } from 'lucide-react';

export function SecurityPanel() {
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [tfaEnabled, setTfaEnabled] = useState(false);

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    console.log("Security saved:", passwordData);
  };

  const handleReset = () => {
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setTfaEnabled(false);
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-left-4 duration-200">
      <div>
        <h2 className="text-lg font-display font-bold text-[#1D2B64]">Security & Access</h2>
        <p className="text-xs text-[#1D2B64]/50 font-medium">Modify account password, enable two-factor authentication, and monitor sessions.</p>
      </div>

      <div className="flex flex-col gap-4">
        {/* Change Password */}
        <div className="flex flex-col gap-2 p-4 bg-[#FAFAFC] border border-[#1D2B64]/5 rounded-2xl">
          <h4 className="text-xs font-bold text-[#1D2B64] flex items-center gap-1.5"><Lock size={12} /> Change Password</h4>
          
          <div className="flex flex-col gap-3 mt-1.5">
            <input
              type="password"
              name="currentPassword"
              placeholder="Current Password"
              value={passwordData.currentPassword}
              onChange={handlePasswordChange}
              className="w-full bg-white border border-[#1D2B64]/10 rounded-xl px-3 py-2 text-xs text-[#1D2B64] focus:outline-none focus:border-[#3B6CE7]"
            />
            <input
              type="password"
              name="newPassword"
              placeholder="New Password"
              value={passwordData.newPassword}
              onChange={handlePasswordChange}
              className="w-full bg-white border border-[#1D2B64]/10 rounded-xl px-3 py-2 text-xs text-[#1D2B64] focus:outline-none focus:border-[#3B6CE7]"
            />
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm New Password"
              value={passwordData.confirmPassword}
              onChange={handlePasswordChange}
              className="w-full bg-white border border-[#1D2B64]/10 rounded-xl px-3 py-2 text-xs text-[#1D2B64] focus:outline-none focus:border-[#3B6CE7]"
            />
          </div>
        </div>

        {/* 2FA Toggle */}
        <label className="flex items-center gap-3 p-4 bg-[#FAFAFC] border border-[#1D2B64]/5 rounded-2xl cursor-pointer hover:bg-[#E6F2F8]/30 transition">
          <input
            type="checkbox"
            name="tfaEnabled"
            checked={tfaEnabled}
            onChange={(e) => setTfaEnabled(e.target.checked)}
            className="rounded border-[#1D2B64]/20 text-[#3B6CE7] focus:ring-[#3B6CE7] h-4 w-4"
          />
          <div className="flex flex-col">
            <span className="text-xs font-bold text-[#1D2B64] flex items-center gap-1.5"><ShieldAlert size={12} /> Two-Factor Authentication (2FA)</span>
            <span className="text-[10px] text-[#1D2B64]/50 font-medium">Add an extra layer of protection using authenticator tokens</span>
          </div>
        </label>

        {/* Sessions list */}
        <div className="flex flex-col gap-2 mt-2">
          <div className="flex justify-between items-center border-b border-[#1D2B64]/5 pb-1">
            <h4 className="text-xs font-bold text-[#1D2B64] flex items-center gap-1.5"><Laptop size={12} /> Active Sessions</h4>
            <button 
              type="button" 
              className="text-[10px] text-red-500 font-bold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <LogOut size={10} /> Logout All Devices
            </button>
          </div>

          <div className="flex flex-col gap-2 mt-1">
            <div className="flex justify-between items-center p-2.5 bg-[#FAFAFC] border border-[#1D2B64]/5 rounded-lg text-xs text-[#1D2B64] font-medium">
              <div className="flex items-center gap-2">
                <Laptop size={14} className="text-[#3B6CE7]" />
                <div className="flex flex-col gap-0.5">
                  <span>macOS - Chrome Browser</span>
                  <span className="text-[9px] text-[#1D2B64]/40 font-bold uppercase tracking-wider">Current Session</span>
                </div>
              </div>
              <span className="text-[10px] text-[#3B6CE7] font-semibold">Active</span>
            </div>

            <div className="flex justify-between items-center p-2.5 bg-[#FAFAFC] border border-[#1D2B64]/5 rounded-lg text-xs text-[#1D2B64] font-medium">
              <div className="flex items-center gap-2">
                <KeyRound size={14} className="text-[#1D2B64]/40" />
                <div className="flex flex-col gap-0.5">
                  <span>iPhone 15 - Safari Mobile</span>
                  <span className="text-[9px] text-[#1D2B64]/40">Last active 4 hours ago</span>
                </div>
              </div>
              <button type="button" className="text-[10px] text-red-500 font-bold hover:underline cursor-pointer font-bold">Revoke</button>
            </div>
          </div>
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
export default SecurityPanel;
