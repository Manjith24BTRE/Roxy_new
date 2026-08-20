import React from 'react';
import { ModalHeader } from '../ModalHeader';

interface Props {
  onClose: () => void;
}

export default function ContactContent({ onClose }: Props) {
  return (
    <>
      <ModalHeader title="Contact" onClose={onClose} />
      <div className="p-6 overflow-y-auto custom-scrollbar">
        <div className="space-y-8 text-[#1D2B64]">
          <p className="text-[15px] leading-relaxed text-[#1D2B64]/80">
            Need help, have a business enquiry, or want to get in touch with the VEYTRIX team?
          </p>

          <div className="space-y-6">
            <section>
              <h3 className="text-xs font-mono uppercase tracking-widest text-[#8CC8E8] mb-2">General Enquiries</h3>
              <a href="mailto:official@mavrostech.in" className="text-[#3B6CE7] hover:underline font-medium">
                official@mavrostech.in
              </a>
            </section>

            <section>
              <h3 className="text-xs font-mono uppercase tracking-widest text-[#8CC8E8] mb-2">Support</h3>
              <p className="text-[14px] text-[#1D2B64]/80">
                Please use the <strong>Help Center</strong> or <strong>Report a Problem</strong> options in the footer for product assistance.
              </p>
            </section>

            <section>
              <h3 className="text-xs font-mono uppercase tracking-widest text-[#8CC8E8] mb-2">Business / Partnerships</h3>
              <a href="mailto:official@mavrostech.in" className="text-[#3B6CE7] hover:underline font-medium">
                official@mavrostech.in
              </a>
            </section>
          </div>

          <div className="pt-6 border-t border-[rgba(29,43,100,0.10)] mt-8">
            <p className="text-sm font-medium text-[#1D2B64]/60">
              Associated with Mavros Tech Pvt Ltd.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
