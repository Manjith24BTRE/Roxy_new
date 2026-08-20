import React from 'react';
import { ModalHeader } from '../ModalHeader';

interface Props {
  onClose: () => void;
}

export default function AboutContent({ onClose }: Props) {
  return (
    <>
      <ModalHeader title="About VEYTRIX" onClose={onClose} />
      <div className="p-6 overflow-y-auto custom-scrollbar">
        <div className="space-y-6 text-[#1D2B64]">
          <section>
            <p className="text-[15px] leading-relaxed text-[#1D2B64]/80">
              VEYTRIX is a modern video editing platform designed to make professional editing faster, cleaner, and more accessible. It combines a focused editing workspace with AI-assisted tools to help creators move from raw footage to finished content with less friction.
            </p>
          </section>

          <section>
            <h3 className="text-xs font-mono uppercase tracking-widest text-[#8CC8E8] mb-3">Our Approach</h3>
            <p className="text-[15px] leading-relaxed text-[#1D2B64]/80">
              Editing should feel precise without becoming complicated. VEYTRIX is being built around a streamlined workflow, responsive editing tools, efficient project management, and creator-focused experiences.
            </p>
          </section>

          <section>
            <h3 className="text-xs font-mono uppercase tracking-widest text-[#8CC8E8] mb-3">Built For</h3>
            <ul className="list-disc pl-5 space-y-2 text-[15px] text-[#1D2B64]/80">
              <li>Content creators</li>
              <li>Video editors</li>
              <li>Social media teams</li>
              <li>Students and emerging creators</li>
              <li>Creative professionals</li>
            </ul>
          </section>

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
