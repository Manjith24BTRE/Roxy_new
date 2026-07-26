import React from 'react';
import { Link } from 'react-router-dom';
import { Play, ChevronRight } from 'lucide-react';

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-24 pb-16 md:pt-32 md:pb-20">
      {/* Background gradients for depth without heavy animations */}
      <div className="absolute inset-0 bg-background pointer-events-none" />
      <div 
        className="absolute inset-0 pointer-events-none" 
        style={{
          background: 'radial-gradient(circle at 50% 30%, rgba(59,108,231,0.08), transparent 50%), radial-gradient(circle at 50% 0%, rgba(140,200,232,0.05), transparent 40%)'
        }}
      />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8CC8E810_1px,transparent_1px),linear-gradient(to_bottom,#8CC8E810_1px,transparent_1px)] bg-[size:48px_48px] opacity-[0.15] pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-6 flex flex-col items-center text-center">
        {/* Beta Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 text-xs shadow-sm mb-8">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
          </span>
          <span className="font-medium text-foreground tracking-wide">
            VEYTRIX — PUBLIC BETA
          </span>
        </div>

        {/* Main Headline */}
        <h1 className="font-display text-5xl sm:text-6xl md:text-[88px] leading-[1.05] font-bold tracking-tight text-foreground max-w-4xl mx-auto">
          Edit at the <br className="hidden sm:block" />
          <span className="bg-gradient-to-br from-primary to-accent text-transparent bg-clip-text">SPEED OF THOUGHT.</span>
        </h1>

        {/* Supporting text */}
        <p className="mt-8 max-w-2xl text-lg md:text-xl text-muted-foreground leading-relaxed">
          A focused editing workspace built for creators who care about every frame. Precision timelines, real-time preview, and absolute control.
        </p>

        {/* CTAs */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/home"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-4 text-base font-semibold text-primary-foreground shadow-[0_4px_14px_0_rgba(59,108,231,0.39)] hover:bg-primary-hover hover:-translate-y-0.5 transition-all duration-200"
          >
            <Play className="h-5 w-5 fill-current" /> Homepage
          </Link>
          <a
            href="#features"
            className="inline-flex items-center gap-2 rounded-xl bg-surface px-8 py-4 text-base font-medium text-foreground border border-border shadow-sm hover:bg-surface-hover hover:-translate-y-0.5 transition-all duration-200"
          >
            Explore Features <ChevronRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    </section>
  );
}
