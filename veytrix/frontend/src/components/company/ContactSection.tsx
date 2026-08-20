import React from 'react';
import { Mail, Clock, MessageSquare, Flame } from 'lucide-react';
import { SectionTitle } from './SectionTitle';

export function ContactSection() {
  return (
    <section className="relative py-12 z-10 max-w-3xl mx-auto">
      <SectionTitle title="Get in Touch" badge="Contact" center={true} />
      
      <div className="p-8 rounded-[24px] bg-white border border-[#1D2B64]/5 shadow-[0_8px_30px_rgba(29,43,100,0.02)] text-left grid md:grid-cols-2 gap-8 items-center mt-8">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#E6F2F8] text-[#3B6CE7] flex items-center justify-center">
              <Mail size={15} />
            </div>
            <div>
              <div className="text-[9px] font-mono font-bold text-[#1D2B64]/40 uppercase tracking-widest">Business Email</div>
              <a href="mailto:official@mavrostech.in" className="text-xs font-bold text-[#1D2B64] hover:text-[#3B6CE7] transition-colors">
                official@mavrostech.in
              </a>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#E6F2F8] text-[#3B6CE7] flex items-center justify-center">
              <Clock size={15} />
            </div>
            <div>
              <div className="text-[9px] font-mono font-bold text-[#1D2B64]/40 uppercase tracking-widest">Response Window</div>
              <div className="text-xs font-semibold text-[#1D2B64]/70">Within 24 Hours</div>
            </div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#E6F2F8]/30 border border-[#3B6CE7]/10 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-xs font-bold text-[#3B6CE7]">
            <Flame size={14} className="animate-pulse" />
            <span>Mavros Tech Pvt Ltd</span>
          </div>
          <p className="text-[10px] text-[#1D2B64]/50 leading-relaxed font-semibold">
            Contact us for technical support, partnership queries, integrations, or reporting security vulnerabilities.
          </p>
        </div>
      </div>
    </section>
  );
}
export default ContactSection;
