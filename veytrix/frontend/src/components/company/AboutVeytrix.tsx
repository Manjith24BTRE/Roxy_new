import React from 'react';
import { SectionTitle } from './SectionTitle';

export function AboutVeytrix() {
  return (
    <section className="relative py-12 z-10">
      <SectionTitle title="What is VEYTRIX" badge="Philosophy" center={true} />
      
      <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8 items-center mt-8">
        <div className="p-8 rounded-[24px] bg-white/70 backdrop-blur-md border border-[#1D2B64]/5 shadow-[0_8px_30px_rgba(29,43,100,0.01)] hover:border-[#3B6CE7]/20 transition-all duration-300">
          <h3 className="text-base font-bold text-[#1D2B64] mb-3">Our Core Philosophy</h3>
          <p className="text-xs text-[#1D2B64]/70 leading-relaxed font-semibold mb-4">
            VEYTRIX combines standard desktop non-linear editing tracks with browser-native WebAssembly compilation. We believe creators should not wait for server renders or cloud queues.
          </p>
          <p className="text-xs text-[#1D2B64]/60 leading-relaxed">
            Built for design agencies, social creators, and corporate video divisions who value fast execution, privacy-first local storage, and intelligent automated workflows.
          </p>
        </div>
        
        {/* Beautiful Side Illustration */}
        <div className="aspect-[4/3] rounded-[24px] bg-gradient-to-tr from-[#E6F2F8] to-white border border-[#1D2B64]/5 p-6 flex flex-col justify-between relative overflow-hidden group shadow-[0_8px_30px_rgba(29,43,100,0.01)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(59,108,231,0.08),transparent_60%)] pointer-events-none" />
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-mono font-bold text-[#3B6CE7] uppercase tracking-widest bg-white px-3 py-1 rounded-full border border-[#1D2B64]/5">Web Codecs</span>
            <span className="text-[10px] font-mono text-[#1D2B64]/40 font-bold">SCRUB ENGINE v1.2</span>
          </div>
          
          <div className="space-y-2 mt-auto">
            <div className="h-1.5 w-2/3 bg-[#3B6CE7]/85 rounded-full" />
            <div className="h-1.5 w-1/2 bg-[#8CC8E8]/70 rounded-full" />
          </div>
        </div>
      </div>
    </section>
  );
}
export default AboutVeytrix;
