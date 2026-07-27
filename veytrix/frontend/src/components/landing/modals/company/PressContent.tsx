import React from 'react';
import { ModalHeader } from '../ModalHeader';

interface Props {
  onClose: () => void;
}

export default function PressContent({ onClose }: Props) {
  return (
    <>
      <ModalHeader title="Press & Media" onClose={onClose} />
      <div className="p-6 overflow-y-auto custom-scrollbar">
        <div className="space-y-8 text-[#1D2B64]">
          <p className="text-[15px] leading-relaxed text-[#1D2B64]/80">
            For media enquiries, company information, or requests related to VEYTRIX, contact our team.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-[#FAFAFC] border border-[rgba(29,43,100,0.10)] rounded-xl p-6">
            <div>
              <h3 className="text-xs font-mono uppercase tracking-widest text-[#8CC8E8] mb-1">Product</h3>
              <p className="text-[15px] font-medium text-[#1D2B64]">VEYTRIX</p>
            </div>
            <div>
              <h3 className="text-xs font-mono uppercase tracking-widest text-[#8CC8E8] mb-1">Category</h3>
              <p className="text-[15px] text-[#1D2B64]/80">Video Editing / Creative Software</p>
            </div>
            <div>
              <h3 className="text-xs font-mono uppercase tracking-widest text-[#8CC8E8] mb-1">Associated Company</h3>
              <p className="text-[15px] text-[#1D2B64]/80">Mavros Tech Pvt Ltd.</p>
            </div>
            <div>
              <h3 className="text-xs font-mono uppercase tracking-widest text-[#8CC8E8] mb-1">Media Contact</h3>
              <a href="mailto:official@mavrostech.in" className="text-[#3B6CE7] hover:underline font-medium">
                official@mavrostech.in
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
