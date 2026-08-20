import React from 'react';
import { Shield, Lock, EyeOff, CheckCircle } from 'lucide-react';
import { SectionTitle } from './SectionTitle';

export function SecurityPrivacy() {
  const cards = [
    { title: "Encrypted Sessions", desc: "Your login and workspace access are verified through secure keys.", icon: Lock },
    { title: "Secure Authentication", desc: "Integrates with Supabase logic for robust data boundaries.", icon: Shield },
    { title: "Private Projects", desc: "All drafts are kept locally in sandbox memory directories.", icon: EyeOff },
    { title: "No Tracking Overlays", desc: "We compile standard features without selling user logs.", icon: CheckCircle }
  ];

  return (
    <section className="relative py-12 z-10">
      <SectionTitle title="Security & Privacy" badge="Privacy" center={true} />
      
      <div className="grid md:grid-cols-4 gap-4 max-w-4xl mx-auto mt-8">
        {cards.map((c, i) => (
          <div key={i} className="p-6 rounded-[24px] bg-white border border-[#1D2B64]/5 shadow-[0_8px_30px_rgba(29,43,100,0.01)] text-left group hover:border-[#3B6CE7]/20 transition-all duration-300">
            <div className="w-8 h-8 rounded-lg bg-[#E6F2F8] text-[#3B6CE7] flex items-center justify-center mb-4 group-hover:bg-[#3B6CE7] group-hover:text-white transition-all duration-300">
              <c.icon size={15} />
            </div>
            <h3 className="text-xs font-bold text-[#1D2B64] mb-1">{c.title}</h3>
            <p className="text-[10px] text-[#1D2B64]/50 leading-relaxed font-semibold">{c.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
export default SecurityPrivacy;
