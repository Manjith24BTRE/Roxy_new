import React from 'react';
import { Link } from 'react-router-dom';
import { Play } from 'lucide-react';

export function LandingCTA() {
  return (
    <section className="py-24 px-6 bg-background">
      <div className="mx-auto max-w-5xl">
        <div className="relative rounded-[2rem] bg-[#E6F2F8] p-12 md:p-20 text-center overflow-hidden shadow-sm">
          
          {/* Subtle radial glow in background */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,rgba(59,108,231,0.1),transparent_60%)] pointer-events-none" />
          
          {/* Faint timeline graphics in background */}
          <div className="absolute top-10 left-10 opacity-20 pointer-events-none hidden md:block">
             <div className="w-32 h-2 bg-[#3B6CE7] rounded-full mb-2" />
             <div className="w-48 h-2 bg-[#1D2B64] rounded-full" />
          </div>
          <div className="absolute bottom-10 right-10 opacity-20 pointer-events-none hidden md:block">
             <div className="w-40 h-2 bg-[#1D2B64] rounded-full mb-2 ml-8" />
             <div className="w-24 h-2 bg-[#8CC8E8] rounded-full" />
          </div>

          <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center">
            <h2 className="text-4xl md:text-5xl font-display font-bold text-[#1D2B64] mb-6 tracking-tight">
              Your next cut<br />starts here.
            </h2>
            <p className="text-[#1D2B64]/70 text-lg mb-10">
              Open VEYTRIX and turn the first clip into something worth replaying.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 w-full sm:w-auto">
              <Link
                to="/home"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#3B6CE7] px-8 py-4 text-base font-semibold text-white shadow-[0_4px_14px_0_rgba(59,108,231,0.39)] hover:bg-[#2555CC] hover:-translate-y-0.5 transition-all duration-200"
              >
                <Play className="h-5 w-5 fill-current" /> Homepage
              </Link>
              <Link
                to="/company"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-white px-8 py-4 text-base font-medium text-[#1D2B64] border border-[#1D2B64]/10 shadow-sm hover:bg-slate-50 transition-all duration-200"
              >
                About Veytrix <span aria-hidden>→</span>
              </Link>
            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
}
