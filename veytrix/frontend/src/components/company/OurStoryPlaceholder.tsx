import React from 'react';
import { SectionTitle } from './SectionTitle';

export function OurStoryPlaceholder() {
  return (
    <section className="relative py-12 z-10 max-w-2xl mx-auto">
      <SectionTitle title="Our Story" badge="History" center={true} />
      
      <div className="p-12 rounded-[24px] bg-[#E6F2F8]/30 border border-[#1D2B64]/5 shadow-[0_8px_30px_rgba(29,43,100,0.01)] text-center flex flex-col items-center">
        <h3 className="text-base font-bold text-[#1D2B64] mb-1">Our Story</h3>
        <p className="text-[10px] font-mono uppercase tracking-widest text-[#3B6CE7] font-bold">Coming Soon</p>
      </div>
    </section>
  );
}
export default OurStoryPlaceholder;
