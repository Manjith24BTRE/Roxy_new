import React from 'react';
import { Search, FolderOpen, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

export function ProjectsPage() {
  return (
    <div className="px-4 md:px-6 xl:px-8 py-8 w-full max-w-6xl mx-auto flex flex-col h-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-[32px] font-display font-bold text-[#1D2B64]">Projects</h1>
          <p className="text-[#1D2B64]/60 text-sm mt-1">Manage all your saved video editing projects.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1D2B64]/40" />
            <input 
              type="text" 
              placeholder="Search projects..." 
              className="pl-9 pr-4 py-2 bg-white border border-[#1D2B64]/10 rounded-xl text-sm w-full md:w-64 focus:outline-none focus:border-[#3B6CE7]/40 focus:ring-1 focus:ring-[#3B6CE7]/40 transition-shadow"
            />
          </div>
          <Link to="/upload" className="flex items-center gap-2 bg-[#3B6CE7] text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-[#2555CC] transition-colors shadow-sm whitespace-nowrap">
            <Plus size={16} /> New Project
          </Link>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-[#1D2B64]/10 rounded-2xl bg-white/50 p-8 text-center min-h-[300px]">
        <div className="w-16 h-16 rounded-full bg-[#E6F2F8] flex items-center justify-center text-[#3B6CE7] mb-4">
          <FolderOpen size={24} />
        </div>
        <h3 className="text-lg font-semibold text-[#1D2B64] mb-2">No projects yet</h3>
        <p className="text-[#1D2B64]/60 max-w-sm mb-6">Your saved editing projects will appear here once you create them.</p>
        <Link to="/upload" className="flex items-center gap-2 bg-white border border-[#1D2B64]/10 text-[#1D2B64] px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#F8FBFD] transition-colors shadow-sm">
          <Plus size={16} /> Create New Project
        </Link>
      </div>
    </div>
  );
}
