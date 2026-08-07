import React from 'react';
import { Search } from 'lucide-react';

interface HelpSearchProps {
  value: string;
  onChange: (val: string) => void;
}

export function HelpSearch({ value, onChange }: HelpSearchProps) {
  return (
    <div className="relative max-w-lg mx-auto">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#1D2B64]/40 pointer-events-none" />
      <input
        type="text"
        placeholder="Search for articles, guides, or troubleshooting..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-12 pr-4 py-4 bg-white border border-[#1D2B64]/10 rounded-2xl text-base w-full focus:outline-none focus:border-[#3B6CE7]/40 focus:ring-4 focus:ring-[#3B6CE7]/10 transition-all shadow-sm"
      />
    </div>
  );
}

export default HelpSearch;
