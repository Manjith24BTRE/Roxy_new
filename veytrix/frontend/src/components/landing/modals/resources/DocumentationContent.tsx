import React, { useState } from 'react';
import { ModalHeader } from '../ModalHeader';

interface Props {
  onClose: () => void;
}

const sections = [
  { id: 'started', title: 'Getting Started' },
  { id: 'projects', title: 'Projects' },
  { id: 'media', title: 'Media' },
  { id: 'timeline', title: 'Timeline' },
  { id: 'editing', title: 'Editing Tools' },
  { id: 'audio', title: 'Audio' },
  { id: 'effects', title: 'Effects' },
  { id: 'templates', title: 'Templates' },
  { id: 'export', title: 'Export' },
  { id: 'shortcuts', title: 'Keyboard Shortcuts' },
  { id: 'troubleshooting', title: 'Troubleshooting' }
];

export default function DocumentationContent({ onClose }: Props) {
  const [activeSection, setActiveSection] = useState(sections[0].id);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <ModalHeader title="Documentation" onClose={onClose} />
      <div className="flex flex-1 overflow-hidden flex-col md:flex-row">
        
        {/* Sidebar / Topnav */}
        <div className="md:w-56 shrink-0 border-b md:border-b-0 md:border-r border-[rgba(29,43,100,0.10)] overflow-x-auto md:overflow-y-auto custom-scrollbar bg-[#FAFAFC]">
          <nav className="flex md:flex-col p-4 md:p-3 space-x-2 md:space-x-0 md:space-y-1">
            {sections.map(section => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`text-left px-3 py-2 text-[14px] rounded-lg whitespace-nowrap transition-colors ${
                  activeSection === section.id 
                    ? "bg-[#E6F2F8] text-[#3B6CE7] font-semibold" 
                    : "text-[#1D2B64]/70 hover:bg-[#E6F2F8]/50 hover:text-[#1D2B64]"
                }`}
              >
                {section.title}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
          <h2 className="text-xl font-bold text-[#1D2B64] mb-4">
            {sections.find(s => s.id === activeSection)?.title}
          </h2>
          <div className="text-[15px] leading-relaxed text-[#1D2B64]/80">
            <p className="mb-4">
              Documentation for {sections.find(s => s.id === activeSection)?.title.toLowerCase()} is being finalized for the production release. 
            </p>
            <p>
              Please refer to the Help Center or Tutorials section for current guidance on using VEYTRIX features.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
