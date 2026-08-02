import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { SectionTitle } from './SectionTitle';

const FAQS = [
  { q: "What is VEYTRIX?", a: "VEYTRIX is a next-generation AI-powered professional video editing platform built to simplify modern content creation while delivering enterprise-grade editing capabilities." },
  { q: "Who is VEYTRIX built for?", a: "It is built for design agencies, social creators, and corporate video divisions who value fast execution, privacy-first local storage, and automated timeline operations." },
  { q: "Will AI replace manual editing?", a: "No. Our tools automate tedious, repetitive tasks (like raw footage syncs or basic cuts), restoring focus to story development." },
  { q: "Can I edit manually?", a: "Yes, you have complete manual override over tracks, cuts, position, zoom, and audio parameters." },
  { q: "What is on the future roadmap?", a: "Real-time multiplayer timeline sharing, automated audio transcription editing, and developer plugin stores." },
];

export function FAQSection() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <section className="relative py-12 z-10">
      <SectionTitle title="Frequently Asked Questions" badge="FAQ" center={true} />
      
      <div className="max-w-2xl mx-auto space-y-3 mt-8">
        {FAQS.map((faq, i) => {
          const isOpen = openIdx === i;
          return (
            <div key={i} className={`rounded-[24px] border ${isOpen ? 'border-[#3B6CE7]/20 bg-[#E6F2F8]/10' : 'border-[#1D2B64]/5'} bg-white overflow-hidden transition-all duration-200`}>
              <button
                onClick={() => setOpenIdx(isOpen ? null : i)}
                className="w-full flex items-center justify-between p-5 text-left text-xs font-bold text-[#1D2B64] hover:text-[#3B6CE7] transition-colors focus:outline-none"
              >
                <span>{faq.q}</span>
                <span className={`flex h-6 w-6 items-center justify-center rounded-full bg-white border border-[#1D2B64]/5 text-[#1D2B64] transition-transform duration-200 ${isOpen ? 'rotate-45 text-[#3B6CE7]' : ''}`}>
                  <Plus size={11} />
                </span>
              </button>
              <div className={`transition-all duration-200 ease-in-out overflow-hidden ${isOpen ? 'max-h-32 border-t border-[#1D2B64]/5' : 'max-h-0'}`}>
                <p className="p-5 text-[11px] text-[#1D2B64]/60 font-semibold leading-relaxed">
                  {faq.a}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
export default FAQSection;
