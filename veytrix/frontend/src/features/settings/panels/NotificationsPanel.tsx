import React, { useState, useEffect } from 'react';
import { Bell, Mail, Info, CheckSquare, Sparkles, RotateCcw, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useSettings } from '../hooks/useSettings';

export function NotificationsPanel() {
  const { userProfile, isSaving, toast, saveNotifications } = useSettings();

  const [formData, setFormData] = useState({
    desktop: true,
    email: true,
    updates: true,
    completion: true,
    marketing: false
  });

  useEffect(() => {
    if (userProfile?.notification_settings) {
      setFormData({
        desktop: userProfile.notification_settings.desktop ?? true,
        email: userProfile.notification_settings.email ?? true,
        updates: userProfile.notification_settings.updates ?? true,
        completion: userProfile.notification_settings.completion ?? true,
        marketing: userProfile.notification_settings.marketing ?? false
      });
    }
  }, [userProfile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveNotifications(formData);
  };

  const handleReset = () => {
    setFormData({
      desktop: true,
      email: true,
      updates: true,
      completion: true,
      marketing: false
    });
  };

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-6 animate-in fade-in slide-in-from-left-4 duration-200">
      <div>
        <h2 className="text-lg font-display font-bold text-[#1D2B64]">Notification Preferences</h2>
        <p className="text-xs text-[#1D2B64]/50 font-medium">Configure where and how VEYTRIX updates and alerts find you.</p>
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

      <div className="flex flex-col gap-3">
        <label className="flex items-center gap-3 p-4 bg-[#FAFAFC] border border-[#1D2B64]/5 rounded-2xl cursor-pointer hover:bg-[#E6F2F8]/30 transition">
          <input
            type="checkbox"
            name="desktop"
            checked={formData.desktop}
            onChange={handleChange}
            className="rounded border-[#1D2B64]/20 text-[#3B6CE7] focus:ring-[#3B6CE7] h-4 w-4"
          />
          <div className="flex flex-col">
            <span className="text-xs font-bold text-[#1D2B64] flex items-center gap-1.5"><Bell size={12} /> Desktop Notifications</span>
            <span className="text-[10px] text-[#1D2B64]/50 font-medium">Show system notifications for quick updates</span>
          </div>
        </label>

        <label className="flex items-center gap-3 p-4 bg-[#FAFAFC] border border-[#1D2B64]/5 rounded-2xl cursor-pointer hover:bg-[#E6F2F8]/30 transition">
          <input
            type="checkbox"
            name="email"
            checked={formData.email}
            onChange={handleChange}
            className="rounded border-[#1D2B64]/20 text-[#3B6CE7] focus:ring-[#3B6CE7] h-4 w-4"
          />
          <div className="flex flex-col">
            <span className="text-xs font-bold text-[#1D2B64] flex items-center gap-1.5"><Mail size={12} /> Email Notifications</span>
            <span className="text-[10px] text-[#1D2B64]/50 font-medium">Send summary and alerts to your inbox</span>
          </div>
        </label>

        <label className="flex items-center gap-3 p-4 bg-[#FAFAFC] border border-[#1D2B64]/5 rounded-2xl cursor-pointer hover:bg-[#E6F2F8]/30 transition">
          <input
            type="checkbox"
            name="updates"
            checked={formData.updates}
            onChange={handleChange}
            className="rounded border-[#1D2B64]/20 text-[#3B6CE7] focus:ring-[#3B6CE7] h-4 w-4"
          />
          <div className="flex flex-col">
            <span className="text-xs font-bold text-[#1D2B64] flex items-center gap-1.5"><Info size={12} /> Platform Updates</span>
            <span className="text-[10px] text-[#1D2B64]/50 font-medium">Alerts for feature additions and version builds</span>
          </div>
        </label>

        <label className="flex items-center gap-3 p-4 bg-[#FAFAFC] border border-[#1D2B64]/5 rounded-2xl cursor-pointer hover:bg-[#E6F2F8]/30 transition">
          <input
            type="checkbox"
            name="completion"
            checked={formData.completion}
            onChange={handleChange}
            className="rounded border-[#1D2B64]/20 text-[#3B6CE7] focus:ring-[#3B6CE7] h-4 w-4"
          />
          <div className="flex flex-col">
            <span className="text-xs font-bold text-[#1D2B64] flex items-center gap-1.5"><CheckSquare size={12} /> Project Completion Alerts</span>
            <span className="text-[10px] text-[#1D2B64]/50 font-medium">Notify when complex rendering or exports complete</span>
          </div>
        </label>

        <label className="flex items-center gap-3 p-4 bg-[#FAFAFC] border border-[#1D2B64]/5 rounded-2xl cursor-pointer hover:bg-[#E6F2F8]/30 transition">
          <input
            type="checkbox"
            name="marketing"
            checked={formData.marketing}
            onChange={handleChange}
            className="rounded border-[#1D2B64]/20 text-[#3B6CE7] focus:ring-[#3B6CE7] h-4 w-4"
          />
          <div className="flex flex-col">
            <span className="text-xs font-bold text-[#1D2B64] flex items-center gap-1.5"><Sparkles size={12} /> Newsletters & Marketing</span>
            <span className="text-[10px] text-[#1D2B64]/50 font-medium">Keep updated with creative tips, strategies, and news</span>
          </div>
        </label>
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

export default NotificationsPanel;
