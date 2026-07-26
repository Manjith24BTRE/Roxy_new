import React from 'react';
import { Clock } from 'lucide-react';

export function RecentProjects() {
  return (
    <div className="flex flex-col flex-1 min-h-0 bg-white rounded-[20px] border border-[#1D2B64]/[0.08] shadow-[0_6px_24px_rgba(29,43,100,0.05)] p-4 md:p-6 mb-4">
      <div className="flex items-center gap-2 mb-4 md:mb-6">
        <Clock className="h-4 w-4 text-[#1D2B64]/50" />
        <h3 className="font-display text-base font-bold text-[#1D2B64]">Recent Projects</h3>
      </div>
      
      {/* Compact Empty State */}
      <div className="flex-1 flex flex-col items-center justify-center text-center rounded-xl border border-dashed border-[#1D2B64]/10 bg-[#FAFAFC] py-6 min-h-[100px]">
        <span className="text-sm font-semibold text-[#1D2B64]/70 mb-1">No projects yet</span>
        <span className="text-xs text-[#1D2B64]/50">Your projects will appear here.</span>
      </div>
    </div>
  );
}
