import React from 'react';
import { Linkedin, Instagram, Facebook, Twitter, Github, Mail } from 'lucide-react';
import { SectionTitle } from './SectionTitle';

export function SocialSection() {
  const socials = [
    { icon: Linkedin, url: "https://linkedin.com", label: "LinkedIn" },
    { icon: Instagram, url: "https://instagram.com", label: "Instagram" },
    { icon: Facebook, url: "https://facebook.com", label: "Facebook" },
    { icon: Twitter, url: "https://twitter.com", label: "Twitter" },
    { icon: Github, url: "https://github.com", label: "GitHub" },
    { icon: Mail, url: "mailto:official@mavrostech.in", label: "Email" }
  ];

  return (
    <section className="relative py-12 z-10">
      <SectionTitle title="Connect With Us" badge="Social" center={true} />
      
      <div className="flex justify-center gap-4 mt-6">
        {socials.map((s, i) => (
          <a
            key={i}
            href={s.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={s.label}
            className="w-10 h-10 rounded-full border border-[#1D2B64]/5 bg-white text-[#1D2B64]/60 hover:text-[#3B6CE7] hover:border-[#3B6CE7]/20 hover:bg-[#E6F2F8]/30 transition-all flex items-center justify-center shadow-sm"
          >
            <s.icon size={16} />
          </a>
        ))}
      </div>
    </section>
  );
}
