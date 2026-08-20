import React from 'react';
import { Link } from 'react-router-dom';
import { Play, Wand2 } from 'lucide-react';

export function ManualEditCard() {
  return (
    <div className="h-full flex flex-col relative rounded-[20px] bg-gradient-to-br from-white to-[#E6F2F8] dark:from-[#121E3A] dark:to-[#101A35] border border-[#1D2B64]/[0.08] dark:border-border shadow-[0_6px_24px_rgba(29,43,100,0.05)] overflow-hidden">
      
      {/* Decorative Editor UI Background */}
      <div className="absolute inset-x-0 bottom-0 top-1/2 opacity-30 pointer-events-none overflow-hidden">
        <div className="absolute top-10 left-0 right-0 h-px bg-[#1D2B64]/20 dark:bg-border" />
        <div className="absolute top-10 left-[30%] bottom-0 w-px bg-[#3B6CE7]" />
        
        {/* Playhead indicator */}
        <div className="absolute top-8 left-[30%] -translate-x-1/2 text-[8px] font-mono font-bold text-[#3B6CE7] dark:text-[#93C5FD] bg-[#E6F2F8] dark:bg-[#101A35] px-1 rounded">
          PLAYHEAD
        </div>

        {/* Tracks */}
        <div className="absolute top-16 left-[5%] right-[5%] h-6 bg-[#3B6CE7]/20 rounded-sm border border-[#3B6CE7]/30" />
        <div className="absolute top-24 left-[20%] right-[15%] h-6 bg-[#8CC8E8]/30 rounded-sm border border-[#8CC8E8]/40" />
      </div>

      <div className="relative z-10 flex flex-col h-full p-6 lg:p-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-white dark:bg-[#121E3A] border border-[#1D2B64]/10 dark:border-border flex items-center justify-center text-[#3B6CE7] dark:text-[#93C5FD] shadow-sm">
            <Wand2 size={20} />
          </div>
          <h2 className="font-display text-2xl font-bold text-[#1D2B64] dark:text-white tracking-tight">AI Manual Edit</h2>
        </div>
        
        <p className="text-[#1D2B64]/70 dark:text-slate-300 text-sm md:text-base leading-relaxed max-w-sm mb-auto">
          Upload your videos and begin editing in Veytrix's professional editing workspace with AI-assisted tools designed for creators.
        </p>

        <Link
          to="/upload"
          className="mt-8 self-start inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#3B6CE7] to-[#8CC8E8] px-6 py-3 text-sm font-semibold text-white shadow-sm hover:-translate-y-px transition-transform duration-200"
        >
          <Play className="h-4 w-4 fill-current" /> Start Editing
        </Link>
      </div>

    </div>
  );
}
