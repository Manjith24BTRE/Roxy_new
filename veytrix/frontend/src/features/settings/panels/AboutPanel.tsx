import React from 'react';
import { Globe, Mail, Instagram, Linkedin, Facebook, Twitter, Github } from 'lucide-react';
import { VeytrixLogo } from '../../../components/VeytrixLogo';

export function AboutPanel() {
  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-left-4 duration-200">
      <div>
        <h2 className="text-lg font-display font-bold text-[#1D2B64]">About VEYTRIX</h2>
        <p className="text-xs text-[#1D2B64]/50 font-medium">Overview of client version, build details, and developer credits.</p>
      </div>

      <div className="flex flex-col items-center text-center gap-4 py-4 select-none">
        {/* App Logo & Title */}
        <div className="p-4 bg-[#FAFAFC] border border-[#1D2B64]/5 rounded-3xl flex flex-col items-center gap-2 shadow-sm">
          <VeytrixLogo className="h-16 w-16 text-[#1D2B64]" />
          <h3 className="font-display font-bold text-lg text-[#1D2B64] tracking-tight">VEYTRIX</h3>
          <span className="px-2 py-0.5 rounded-full bg-[#E6F2F8] text-[9px] font-mono font-bold text-[#3B6CE7] uppercase tracking-wider">
            Beta Release
          </span>
        </div>

        {/* Version Table */}
        <div className="w-full bg-[#FAFAFC] border border-[#1D2B64]/5 rounded-2xl p-4 flex flex-col gap-2.5 text-xs text-[#1D2B64] font-medium">
          <div className="flex justify-between items-center border-b border-[#1D2B64]/5 pb-2">
            <span className="text-[#1D2B64]/50">Software Version</span>
            <span className="font-bold">1.0.0</span>
          </div>
          <div className="flex justify-between items-center border-b border-[#1D2B64]/5 pb-2">
            <span className="text-[#1D2B64]/50">Build Release</span>
            <span className="font-mono font-bold text-[10px]">build-2026.08.05</span>
          </div>
          <div className="flex justify-between items-center border-b border-[#1D2B64]/5 pb-2">
            <span className="text-[#1D2B64]/50">Developed By</span>
            <span className="font-bold">Mavros Tech Pvt Ltd</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[#1D2B64]/50">Copyright Status</span>
            <span className="font-bold">&copy; 2026 Mavros Tech</span>
          </div>
        </div>

        {/* Support Links */}
        <div className="flex justify-center gap-6 w-full text-xs font-bold text-[#1D2B64]/80 mt-2">
          <a href="https://www.mavrostech.in" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-[#3B6CE7] transition">
            <Globe size={14} className="text-[#3B6CE7]" /> www.mavrostech.in
          </a>
          <a href="mailto:official@mavrostech.in" className="flex items-center gap-1.5 hover:text-[#3B6CE7] transition">
            <Mail size={14} className="text-[#3B6CE7]" /> official@mavrostech.in
          </a>
        </div>

        {/* Socials */}
        <div className="flex justify-center gap-4 w-full mt-2">
          {[
            { icon: <Instagram size={16} />, href: 'https://instagram.com/mavrostech' },
            { icon: <Linkedin size={16} />, href: 'https://linkedin.com/company/mavrostech' },
            { icon: <Facebook size={16} />, href: 'https://facebook.com/mavrostech' },
            { icon: <Twitter size={16} />, href: 'https://twitter.com/mavrostech' },
            { icon: <Github size={16} />, href: 'https://github.com/mavrostech' }
          ].map((s, idx) => (
            <a 
              key={idx}
              href={s.href}
              target="_blank" 
              rel="noopener noreferrer"
              className="p-2.5 rounded-xl border border-[#1D2B64]/5 bg-[#FAFAFC] text-[#1D2B64]/60 hover:text-[#3B6CE7] hover:border-[#3B6CE7]/20 transition shadow-sm"
            >
              {s.icon}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
export default AboutPanel;
