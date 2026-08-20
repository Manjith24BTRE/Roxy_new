import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Loader2 } from 'lucide-react';
import { ProcessingLayout } from './ProcessingLayout';
import { ProcessingHeader } from './ProcessingHeader';

const STAGES = [
  'Preparing Workspace',
  'Importing Assets',
  'Reading Metadata',
  'Creating Timeline',
  'Initializing Rendering Engine',
  'Loading AI Modules',
  'Optimizing Memory',
  'Opening Workspace'
];

export function ProcessingPage() {
  const navigate = useNavigate();
  const [stageIndex, setStageIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const totalDuration = 3500; // 3.5 seconds
    const intervalTime = 50;
    const increment = 100 / (totalDuration / intervalTime);

    const progressTimer = setInterval(() => {
      setProgress((prev) => {
        const next = prev + increment;
        if (next >= 100) {
          clearInterval(progressTimer);
          return 100;
        }
        return next;
      });
    }, intervalTime);

    const stageTimer = setInterval(() => {
      setStageIndex((prev) => {
        if (prev < STAGES.length - 1) return prev + 1;
        return prev;
      });
    }, totalDuration / STAGES.length);

    const navigateTimer = setTimeout(() => {
      navigate('/editor');
    }, totalDuration + 200);

    return () => {
      clearInterval(progressTimer);
      clearInterval(stageTimer);
      clearTimeout(navigateTimer);
    };
  }, [navigate]);

  return (
    <ProcessingLayout>
      {/* Header bar */}
      <ProcessingHeader />

      {/* Main Console card */}
      <div className="flex-1 flex flex-col justify-center w-full max-w-md mx-auto py-4 select-none">
        <div className="rounded-[28px] border border-[#1D2B64]/5 bg-white/70 backdrop-blur-md p-8 text-center flex flex-col items-center justify-center shadow-lg relative overflow-hidden">
          
          {/* Animated AI spark circle glow */}
          <div className="relative h-20 w-20 flex items-center justify-center mb-6">
            <div className="absolute inset-0 rounded-full border border-[#3B6CE7]/20 animate-ping opacity-60" />
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#3B6CE7] border-r-[#8CC8E8] animate-spin" />
            <div className="h-14 w-14 rounded-full bg-[#E6F2F8] flex items-center justify-center text-[#3B6CE7] shadow-sm">
              <Sparkles size={22} className="animate-pulse" />
            </div>
          </div>

          <h2 className="font-display text-lg font-bold text-[#1D2B64]">
            Building Workspace
          </h2>
          
          <p className="mt-1 text-[11px] text-[#3B6CE7] font-semibold h-4 tracking-wide transition-all duration-300">
            {STAGES[stageIndex]}...
          </p>

          {/* Progress loader */}
          <div className="mt-6 w-full bg-slate-100/80 rounded-full h-2 p-0.5 border border-[#1D2B64]/5 overflow-hidden">
            <div 
              className="h-full rounded-full bg-gradient-to-r from-[#3B6CE7] to-[#8CC8E8] transition-all duration-75 ease-out" 
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="mt-3.5 flex items-center justify-between text-[9px] font-mono font-bold text-[#1D2B64]/40 uppercase tracking-widest w-full">
            <span>Veytrix Sandbox</span>
            <span>{Math.round(progress)}%</span>
          </div>
        </div>

        {/* Bottom indicator */}
        <div className="mt-8 flex items-center justify-center gap-2 text-[10px] font-semibold text-[#1D2B64]/50 text-center">
          <Loader2 size={12} className="animate-spin text-[#3B6CE7]" />
          <span>Configuring client-side WebGL canvas render loops...</span>
        </div>
      </div>

      {/* Footer layout spacing filler */}
      <div className="h-4 w-full shrink-0" />
    </ProcessingLayout>
  );
}
export default ProcessingPage;
