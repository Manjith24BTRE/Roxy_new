import React, { useState } from 'react';
import { FileText, Globe, Linkedin, Instagram, Twitter, Briefcase, Building2, RotateCcw } from 'lucide-react';

export function ProfilePanel() {
  const [formData, setFormData] = useState({
    bio: 'Video editing enthusiast & content creator.',
    website: 'https://mavros.in',
    linkedin: 'https://linkedin.com/in/mavros',
    instagram: 'https://instagram.com/mavros',
    twitter: 'https://twitter.com/mavros',
    portfolio: 'https://portfolio.mavros.in',
    occupation: 'Creative Director',
    company: 'Mavros Tech Pvt Ltd'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    console.log("Profile saved:", formData);
  };

  const handleReset = () => {
    setFormData({
      bio: 'Video editing enthusiast & content creator.',
      website: 'https://mavros.in',
      linkedin: 'https://linkedin.com/in/mavros',
      instagram: 'https://instagram.com/mavros',
      twitter: 'https://twitter.com/mavros',
      portfolio: 'https://portfolio.mavros.in',
      occupation: 'Creative Director',
      company: 'Mavros Tech Pvt Ltd'
    });
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-left-4 duration-200">
      <div>
        <h2 className="text-lg font-display font-bold text-[#1D2B64]">Public Profile</h2>
        <p className="text-xs text-[#1D2B64]/50 font-medium">Customize how your public profile appears on the platform.</p>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-bold text-[#1D2B64]/60 uppercase tracking-wider">Biography</label>
          <textarea
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            rows={3}
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
                value={formData.linkedin}
                onChange={handleChange}
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
                value={formData.instagram}
                onChange={handleChange}
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
                value={formData.twitter}
                onChange={handleChange}
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
export default ProfilePanel;
