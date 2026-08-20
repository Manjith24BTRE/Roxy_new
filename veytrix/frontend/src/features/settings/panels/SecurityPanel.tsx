import React, { useState } from 'react';
import { Lock, ShieldAlert, Laptop, LogOut, KeyRound, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../context/AuthContext';

export function SecurityPanel() {
  const { signOut } = useAuth();
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [tfaEnabled, setTfaEnabled] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoggingOutAll, setIsLoggingOutAll] = useState(false);
  const [status, setStatus] = useState<{ show: boolean; type: 'success' | 'error'; message: string }>({
    show: false,
    type: 'success',
    message: ''
  });

  const showStatus = (message: string, type: 'success' | 'error') => {
    setStatus({ show: true, type, message });
    setTimeout(() => {
      setStatus(prev => ({ ...prev, show: false }));
    }, 4000);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordData.newPassword || !passwordData.confirmPassword) {
      showStatus('Please fill in both new password fields.', 'error');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showStatus('New passwords do not match.', 'error');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      showStatus('Password must be at least 6 characters long.', 'error');
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      });

      if (error) throw error;

      showStatus('Password updated successfully!', 'success');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: any) {
      showStatus(err?.message || 'Failed to update password.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogoutAllDevices = async () => {
    if (!window.confirm('Are you sure you want to log out of all active sessions and devices?')) return;
    
    setIsLoggingOutAll(true);
    try {
      const { error } = await supabase.auth.signOut({ scope: 'global' });
      if (error) throw error;
      showStatus('Logged out of all sessions. Redirecting...', 'success');
      setTimeout(() => {
        window.location.href = '/';
      }, 1500);
    } catch (err: any) {
      showStatus(err?.message || 'Failed to log out of all devices.', 'error');
      setIsLoggingOutAll(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-left-4 duration-200">
      <div>
        <h2 className="text-lg font-display font-bold text-[#1D2B64]">Security & Access</h2>
        <p className="text-xs text-[#1D2B64]/50 font-medium">Modify account password, enable two-factor authentication, and monitor sessions.</p>
      </div>

      {status.show && (
        <div className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-200 ${
          status.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' :
          'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {status.type === 'success' && <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />}
          {status.type === 'error' && <AlertCircle size={16} className="text-red-600 shrink-0" />}
          <span>{status.message}</span>
        </div>
      )}

      <div className="flex flex-col gap-4">
        {/* Change Password */}
        <form onSubmit={handleUpdatePassword} className="flex flex-col gap-2 p-4 bg-[#FAFAFC] border border-[#1D2B64]/5 rounded-2xl">
          <h4 className="text-xs font-bold text-[#1D2B64] flex items-center gap-1.5"><Lock size={12} /> Change Password</h4>
          
          <div className="flex flex-col gap-3 mt-1.5">
            <input
              type="password"
              name="newPassword"
              placeholder="New Password"
              value={passwordData.newPassword}
              onChange={handlePasswordChange}
              className="w-full bg-white border border-[#1D2B64]/10 rounded-xl px-3 py-2.5 text-xs text-[#1D2B64] focus:outline-none focus:border-[#3B6CE7]"
            />
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm New Password"
              value={passwordData.confirmPassword}
              onChange={handlePasswordChange}
              className="w-full bg-white border border-[#1D2B64]/10 rounded-xl px-3 py-2.5 text-xs text-[#1D2B64] focus:outline-none focus:border-[#3B6CE7]"
            />
          </div>

          <div className="flex justify-end mt-2">
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#1D2B64] text-white text-[11px] font-semibold hover:bg-[#3B6CE7] transition cursor-pointer disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 size={12} className="animate-spin" /> Updating...
                </>
              ) : (
                'Update Password'
              )}
            </button>
          </div>
        </form>

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
              onClick={handleLogoutAllDevices}
              disabled={isLoggingOutAll}
              className="text-[10px] text-red-500 font-bold hover:underline flex items-center gap-1 cursor-pointer disabled:opacity-50"
            >
              {isLoggingOutAll ? <Loader2 size={10} className="animate-spin" /> : <LogOut size={10} />} Logout All Devices
            </button>
          </div>

          <div className="flex flex-col gap-2 mt-1">
            <div className="flex justify-between items-center p-2.5 bg-[#FAFAFC] border border-[#1D2B64]/5 rounded-lg text-xs text-[#1D2B64] font-medium">
              <div className="flex items-center gap-2">
                <Laptop size={14} className="text-[#3B6CE7]" />
                <div className="flex flex-col gap-0.5">
                  <span>Current Device Session</span>
                  <span className="text-[9px] text-[#1D2B64]/40 font-bold uppercase tracking-wider">Active Now</span>
                </div>
              </div>
              <span className="text-[10px] text-[#3B6CE7] font-semibold">Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SecurityPanel;
