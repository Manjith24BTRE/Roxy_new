import React from 'react';

interface SettingsLayoutProps {
  sidebar: React.ReactNode;
  content: React.ReactNode;
}

export function SettingsLayout({ sidebar, content }: SettingsLayoutProps) {
  return (
    <div className="w-full max-w-[1600px] mx-auto flex flex-col md:flex-row gap-6 items-start animate-in fade-in duration-300">
      {/* Fixed Sidebar wrapper */}
      <div className="w-full md:w-[260px] shrink-0 bg-white border border-[#1D2B64]/5 rounded-2xl p-4 shadow-sm md:sticky md:top-6 select-none">
        {sidebar}
      </div>

      {/* Flexible Content Panel wrapper */}
      <div className="flex-1 w-full bg-white border border-[#1D2B64]/5 rounded-2xl p-6 md:p-8 shadow-sm min-h-[550px]">
        {content}
      </div>
    </div>
  );
}
export default SettingsLayout;
