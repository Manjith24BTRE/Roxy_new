import React from 'react';
import { Settings } from 'lucide-react';

export function SettingsHeader() {
  return (
    <div className="flex flex-col gap-1 border-b border-[#1D2B64]/5 pb-6 mb-6 select-none">
      <div className="flex items-center gap-2 text-[#3B6CE7]">
        <Settings size={20} className="animate-spin-slow" />
        <h1 className="text-xl md:text-2xl font-display font-bold text-[#1D2B64] tracking-tight">
          Settings Center
        </h1>
      </div>
      <p className="text-xs text-[#1D2B64]/50 font-medium">
        Configure account credentials, editor preferences, keyboard bindings, and advanced specifications.
      </p>
    </div>
  );
}
