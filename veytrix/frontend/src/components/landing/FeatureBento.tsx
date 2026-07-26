import React from 'react';
import { Film, MonitorPlay, AudioWaveform, Palette, Wand2, Download } from 'lucide-react';

export function FeatureBento() {
  return (
    <section id="features" className="relative py-24 bg-background">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-4xl md:text-5xl font-display font-bold tracking-tight text-foreground">
            Everything you need.<br />
            <span className="text-primary">Nothing in your way.</span>
          </h2>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[300px]">
          
          {/* Timeline - Large horizontal */}
          <div className="md:col-span-2 rounded-2xl bg-surface border border-border overflow-hidden flex flex-col p-6 hover:border-border-strong transition-colors shadow-sm relative group">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <Film size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-foreground">Cinematic Timeline</h3>
                <span className="text-xs font-mono text-muted-foreground uppercase">Visualization</span>
              </div>
            </div>
            <p className="text-muted-foreground text-sm max-w-md z-10 relative">Multi-track editing with ripple, snap, and layer control that stays out of your way.</p>
            
            {/* Visual demo */}
            <div className="mt-auto pt-8 opacity-60 group-hover:opacity-100 transition-opacity">
              <div className="flex flex-col gap-2 relative">
                <div className="absolute top-0 bottom-0 left-[20%] w-px bg-primary z-10" />
                <div className="h-6 w-full bg-background rounded border border-border flex items-center px-1">
                   <div className="h-4 w-1/2 ml-[10%] bg-primary rounded opacity-80" />
                </div>
                <div className="h-6 w-full bg-background rounded border border-border flex items-center px-1">
                   <div className="h-4 w-[60%] ml-[30%] bg-accent rounded opacity-80" />
                </div>
              </div>
            </div>
          </div>

          {/* Live Preview */}
          <div className="rounded-2xl bg-surface border border-border overflow-hidden flex flex-col p-6 hover:border-border-strong transition-colors shadow-sm group">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <MonitorPlay size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-foreground">Live Preview</h3>
                <span className="text-xs font-mono text-muted-foreground uppercase">Canvas UI</span>
              </div>
            </div>
            
            {/* Visual demo */}
            <div className="mt-auto aspect-video bg-background border border-border rounded-lg relative overflow-hidden flex items-center justify-center">
              <div className="absolute inset-4 border border-dashed border-muted-foreground/30 rounded opacity-50 group-hover:opacity-100 transition-opacity" />
              <div className="w-12 h-12 rounded-full border-2 border-primary/20 flex items-center justify-center">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                   <div className="w-0 h-0 border-t-[5px] border-t-transparent border-l-[8px] border-l-white border-b-[5px] border-b-transparent ml-1" />
                </div>
              </div>
            </div>
          </div>

          {/* Effects */}
          <div className="rounded-2xl bg-surface border border-border overflow-hidden flex flex-col p-6 hover:border-border-strong transition-colors shadow-sm group">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <Wand2 size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-foreground">Effects</h3>
                <span className="text-xs font-mono text-muted-foreground uppercase">Shaders</span>
              </div>
            </div>
            
            {/* Visual demo */}
            <div className="mt-auto flex flex-col gap-2">
              <div className="bg-background border border-border rounded px-3 py-2 flex items-center justify-between text-xs font-mono group-hover:-translate-y-1 transition-transform">
                <span className="text-foreground">Gaussian Blur</span>
                <span className="text-primary">12px</span>
              </div>
              <div className="bg-background border border-border rounded px-3 py-2 flex items-center justify-between text-xs font-mono group-hover:translate-x-1 transition-transform delay-75">
                <span className="text-foreground">Color Grading</span>
                <span className="text-primary">Rec.709</span>
              </div>
            </div>
          </div>

          {/* Audio - Large horizontal */}
          <div className="md:col-span-2 rounded-2xl bg-surface border border-border overflow-hidden flex flex-col p-6 hover:border-border-strong transition-colors shadow-sm group">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <AudioWaveform size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-foreground">Advanced Audio</h3>
                <span className="text-xs font-mono text-muted-foreground uppercase">Waveforms</span>
              </div>
            </div>
            <p className="text-muted-foreground text-sm max-w-md">Audio scrubbing, ducking, and mixing tuned for creators, not engineers.</p>
            
            {/* Visual demo */}
            <div className="mt-auto h-20 w-full flex items-center gap-1 overflow-hidden opacity-60 group-hover:opacity-100 transition-opacity">
              {Array.from({ length: 40 }).map((_, i) => (
                <div key={i} className="flex-1 bg-primary/40 rounded-full" style={{ height: `${Math.max(20, Math.sin(i * 0.5) * 100)}%` }} />
              ))}
            </div>
          </div>

          {/* Color & Filters */}
          <div className="md:col-span-2 rounded-2xl bg-surface border border-border overflow-hidden flex flex-col p-6 hover:border-border-strong transition-colors shadow-sm group">
             <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <Palette size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-foreground">Color & Filters</h3>
                <span className="text-xs font-mono text-muted-foreground uppercase">LUTs & Curves</span>
              </div>
            </div>
            <div className="mt-auto h-24 bg-background border border-border rounded-lg relative overflow-hidden flex items-end p-2 gap-1 group-hover:bg-background-subtle transition-colors">
               {/* Abstract curves/histogram */}
               <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-primary/20 to-transparent" />
               <svg viewBox="0 0 100 50" className="w-full h-full preserve-3d" preserveAspectRatio="none">
                 <path d="M0,50 C20,40 30,10 50,25 C70,40 80,5 100,20 L100,50 L0,50 Z" className="fill-primary/10 stroke-primary stroke-[0.5]" />
               </svg>
            </div>
          </div>

          {/* Export */}
          <div className="rounded-2xl bg-surface border border-border overflow-hidden flex flex-col p-6 hover:border-border-strong transition-colors shadow-sm group">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <Download size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-foreground">Export Center</h3>
                <span className="text-xs font-mono text-muted-foreground uppercase">Rendering</span>
              </div>
            </div>
            
            {/* Visual demo */}
            <div className="mt-auto flex gap-2 flex-wrap">
              <span className="px-2 py-1 bg-background border border-border rounded text-[10px] font-mono text-foreground font-semibold group-hover:border-primary transition-colors">4K UHD</span>
              <span className="px-2 py-1 bg-background border border-border rounded text-[10px] font-mono text-foreground font-semibold group-hover:border-primary transition-colors">60 FPS</span>
              <span className="px-2 py-1 bg-background border border-border rounded text-[10px] font-mono text-foreground font-semibold group-hover:border-primary transition-colors">H.265</span>
              <span className="px-2 py-1 bg-background border border-border rounded text-[10px] font-mono text-foreground font-semibold group-hover:border-primary transition-colors">AAC 320k</span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
