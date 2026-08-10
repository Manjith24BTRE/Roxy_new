import React, { useState, useEffect } from 'react';
import { FileText, Globe, Linkedin, Instagram, Twitter, Briefcase, Building2, RotateCcw, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useSettings } from '../hooks/useSettings';
import { ProfileSettingsData } from '../types/settings.types';

export function ProfilePanel() {
  const { userProfile, isSaving, toast, saveProfile } = useSettings();

  const [formData, setFormData] = useState<ProfileSettingsData>(() => {
    const socials = userProfile?.social_links || userProfile?.socialLinks || {};
    return {
      bio: userProfile?.bio || 'Video editing enthusiast & content creator.',
      occupation: userProfile?.occupation || 'Creative Director',
      company: userProfile?.company || 'Mavros Tech Pvt Ltd',
      website: userProfile?.website || 'https://mavros.in',
      portfolio: userProfile?.portfolio || 'https://portfolio.mavros.in',
      socialLinks: {
        linkedin: socials.linkedin || 'https://linkedin.com/in/mavros',
        instagram: socials.instagram || 'https://instagram.com/mavros',
        twitter: socials.twitter || 'https://twitter.com/mavros',
      },
    };
  });

  useEffect(() => {
    if (userProfile) {
      const socials = userProfile.social_links || userProfile.socialLinks || {};
      setFormData({
        bio: userProfile.bio || 'Video editing enthusiast & content creator.',
        occupation: userProfile.occupation || 'Creative Director',
        company: userProfile.company || 'Mavros Tech Pvt Ltd',
        website: userProfile.website || 'https://mavros.in',
        portfolio: userProfile.portfolio || 'https://portfolio.mavros.in',
        socialLinks: {
          linkedin: socials.linkedin || 'https://linkedin.com/in/mavros',
          instagram: socials.instagram || 'https://instagram.com/mavros',
          twitter: socials.twitter || 'https://twitter.com/mavros',
        },
      });
    }
  }, [userProfile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (['linkedin', 'instagram', 'twitter'].includes(name)) {
      setFormData(prev => ({
        ...prev,
        socialLinks: {
          ...prev.socialLinks,
          [name]: value,
        },
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveProfile(formData);
  };

  const handleReset = () => {
    if (userProfile) {
      const socials = userProfile.social_links || userProfile.socialLinks || {};
      setFormData({
        bio: userProfile.bio || 'Video editing enthusiast & content creator.',
        occupation: userProfile.occupation || 'Creative Director',
        company: userProfile.company || 'Mavros Tech Pvt Ltd',
        website: userProfile.website || 'https://mavros.in',
        portfolio: userProfile.portfolio || 'https://portfolio.mavros.in',
        socialLinks: {
          linkedin: socials.linkedin || 'https://linkedin.com/in/mavros',
          instagram: socials.instagram || 'https://instagram.com/mavros',
          twitter: socials.twitter || 'https://twitter.com/mavros',
        },
      });
    } else {
      setFormData({
        bio: 'Video editing enthusiast & content creator.',
        occupation: 'Creative Director',
        company: 'Mavros Tech Pvt Ltd',
        website: 'https://mavros.in',
        portfolio: 'https://portfolio.mavros.in',
        socialLinks: {
          linkedin: 'https://linkedin.com/in/mavros',
          instagram: 'https://instagram.com/mavros',
          twitter: 'https://twitter.com/mavros',
        },
      });
    }
  };

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-6 animate-in fade-in slide-in-from-left-4 duration-200">
      <div>
        <h2 className="text-lg font-display font-bold text-[#1D2B64]">Public Profile</h2>
        <p className="text-xs text-[#1D2B64]/50 font-medium">Customize how your public profile appears on the platform.</p>
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
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-bold text-[#1D2B64]/60 uppercase tracking-wider">Biography</label>
          <textarea
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            rows={3}
            placeholder="Tell us about yourself..."
            className="w-full bg-[#FAFAFC] border border-[#1D2B64]/10 rounded-xl p-3 text-xs text-[#1D2B64] focus:outline-none focus:border-[#3B6CE7] resize-none"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-[#1D2B64]/60 uppercase tracking-wider">Occupation</label>
            <div className="relative">
              <Briefcase size={14} className="absolute left-3 top-3 text-[#1D2B64]/40" />
              <input
                type="text"
                name="occupation"
                value={formData.occupation}
                onChange={handleChange}
                placeholder="e.g. Creative Director"
                className="w-full bg-[#FAFAFC] border border-[#1D2B64]/10 rounded-xl pl-9 pr-3 py-2.5 text-xs text-[#1D2B64] focus:outline-none focus:border-[#3B6CE7]"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-[#1D2B64]/60 uppercase tracking-wider">Company</label>
            <div className="relative">
              <Building2 size={14} className="absolute left-3 top-3 text-[#1D2B64]/40" />
              <input
                type="text"
                name="company"
                value={formData.company}
                onChange={handleChange}
                placeholder="e.g. Mavros Tech"
                className="w-full bg-[#FAFAFC] border border-[#1D2B64]/10 rounded-xl pl-9 pr-3 py-2.5 text-xs text-[#1D2B64] focus:outline-none focus:border-[#3B6CE7]"
              />
            </div>
          </div>
        </div>

        <h4 className="text-xs font-bold text-[#1D2B64] border-b border-[#1D2B64]/5 pb-1 mt-2">Links & Social Profiles</h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-[#1D2B64]/60 uppercase tracking-wider">Website</label>
            <div className="relative">
              <Globe size={14} className="absolute left-3 top-3 text-[#1D2B64]/40" />
              <input
                type="text"
                name="website"
                value={formData.website}
                onChange={handleChange}
                placeholder="https://example.com"
                className="w-full bg-[#FAFAFC] border border-[#1D2B64]/10 rounded-xl pl-9 pr-3 py-2.5 text-xs text-[#1D2B64] focus:outline-none focus:border-[#3B6CE7]"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-[#1D2B64]/60 uppercase tracking-wider">Portfolio</label>
            <div className="relative">
              <FileText size={14} className="absolute left-3 top-3 text-[#1D2B64]/40" />
              <input
                type="text"
                name="portfolio"
                value={formData.portfolio}
                onChange={handleChange}
                placeholder="https://portfolio.example.com"
                className="w-full bg-[#FAFAFC] border border-[#1D2B64]/10 rounded-xl pl-9 pr-3 py-2.5 text-xs text-[#1D2B64] focus:outline-none focus:border-[#3B6CE7]"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-[#1D2B64]/60 uppercase tracking-wider">LinkedIn</label>
            <div className="relative">
              <Linkedin size={14} className="absolute left-3 top-3 text-[#1D2B64]/40" />
              <input
                type="text"
                name="linkedin"
                value={formData.socialLinks.linkedin}
                onChange={handleChange}
                placeholder="https://linkedin.com/in/username"
                className="w-full bg-[#FAFAFC] border border-[#1D2B64]/10 rounded-xl pl-9 pr-3 py-2.5 text-xs text-[#1D2B64] focus:outline-none focus:border-[#3B6CE7]"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-[#1D2B64]/60 uppercase tracking-wider">Instagram</label>
            <div className="relative">
              <Instagram size={14} className="absolute left-3 top-3 text-[#1D2B64]/40" />
              <input
                type="text"
                name="instagram"
                value={formData.socialLinks.instagram}
                onChange={handleChange}
                placeholder="https://instagram.com/username"
                className="w-full bg-[#FAFAFC] border border-[#1D2B64]/10 rounded-xl pl-9 pr-3 py-2.5 text-xs text-[#1D2B64] focus:outline-none focus:border-[#3B6CE7]"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1 md:col-span-2">
            <label className="text-[10px] font-bold text-[#1D2B64]/60 uppercase tracking-wider">Twitter / X</label>
            <div className="relative">
              <Twitter size={14} className="absolute left-3 top-3 text-[#1D2B64]/40" />
              <input
                type="text"
                name="twitter"
                value={formData.socialLinks.twitter}
                onChange={handleChange}
                placeholder="https://twitter.com/username"
                className="w-full bg-[#FAFAFC] border border-[#1D2B64]/10 rounded-xl pl-9 pr-3 py-2.5 text-xs text-[#1D2B64] focus:outline-none focus:border-[#3B6CE7]"
              />
            </div>
          </div>
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

export default ProfilePanel;
