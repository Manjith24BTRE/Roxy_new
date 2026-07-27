import React from 'react';
import { ModalHeader } from '../ModalHeader';

interface Props {
  onClose: () => void;
}

export default function TutorialsContent({ onClose }: Props) {
  const categories = [
    "Getting Started",
    "Import Your First Video",
    "Timeline Basics",
    "Trim & Split Clips",
    "Working with Audio",
    "Effects & Transitions",
    "Export Your Video"
  ];

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <ModalHeader title="Tutorials" onClose={onClose} />
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
        <p className="text-[15px] leading-relaxed text-[#1D2B64]/80 mb-6">
          Step-by-step video tutorials and walkthroughs to help you master VEYTRIX.
        </p>

        <div className="grid gap-4">
          {categories.map((cat, i) => (
            <div key={i} className="flex items-center justify-between p-4 bg-[#FAFAFC] border border-[rgba(29,43,100,0.10)] rounded-xl opacity-60">
              <span className="font-medium text-[#1D2B64]">{cat}</span>
              <span className="text-xs bg-[#E6F2F8] text-[#1D2B64] px-2 py-1 rounded font-medium">Coming Soon</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
