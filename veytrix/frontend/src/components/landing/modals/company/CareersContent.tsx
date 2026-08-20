import React from 'react';
import { ModalHeader } from '../ModalHeader';

interface Props {
  onClose: () => void;
  onSwitchToContact: () => void;
}

export default function CareersContent({ onClose, onSwitchToContact }: Props) {
  return (
    <>
      <ModalHeader title="Careers" onClose={onClose} />
      <div className="p-6 overflow-y-auto custom-scrollbar">
        <div className="space-y-8 text-[#1D2B64]">
          <section>
            <h3 className="text-lg font-semibold text-[#1D2B64] mb-2">Help build the next generation of creative software.</h3>
            <p className="text-[15px] leading-relaxed text-[#1D2B64]/80">
              VEYTRIX is focused on creating fast, intuitive tools for modern video workflows.
            </p>
          </section>

          <section className="bg-[#FAFAFC] border border-[rgba(29,43,100,0.10)] rounded-xl p-5">
            <h3 className="text-xs font-mono uppercase tracking-widest text-[#8CC8E8] mb-2">Current Opportunities</h3>
            <p className="text-[15px] text-[#1D2B64]/80">
              We don't have public openings listed here right now.
            </p>
          </section>

          <section>
            <h3 className="text-xs font-mono uppercase tracking-widest text-[#8CC8E8] mb-3">Interested in VEYTRIX?</h3>
            <p className="text-[15px] leading-relaxed text-[#1D2B64]/80 mb-4">
              For career and collaboration enquiries, contact our team.
            </p>
            <button 
              onClick={onSwitchToContact}
              className="px-5 py-2.5 bg-[#3B6CE7] hover:bg-[#2555CC] text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
            >
              Contact Us
            </button>
          </section>
        </div>
      </div>
    </>
  );
}
