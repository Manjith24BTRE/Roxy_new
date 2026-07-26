import React from 'react';
import { Play } from 'lucide-react';

export function TemplatesShowcase() {
  const templates = [
    { category: "SHORT FILM", title: "Nocturne", duration: "04:12", ratio: "16:9", hue: "from-[#1D2B64] to-[#3B6CE7]" },
    { category: "MUSIC VIDEO", title: "Vantablack", duration: "03:47", ratio: "16:9", hue: "from-[#3B6CE7] to-[#8CC8E8]" },
    { category: "AD SPOT", title: "Halcyon Coffee", duration: "00:30", ratio: "9:16", hue: "from-[#8CC8E8] to-[#1D2B64]" },
    { category: "DOCUMENTARY", title: "Analog Youth", duration: "12:03", ratio: "16:9", hue: "from-[#E6F2F8] to-[#3B6CE7]", textDark: true },
  ];

  return (
    <section className="py-24 bg-background-subtle border-t border-border">
      <div className="mx-auto max-w-7xl px-6">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div>
            <h2 className="text-4xl md:text-5xl font-display font-bold tracking-tight text-foreground">
              Start with a cut.<br />
              <span className="text-muted-foreground">Make it yours.</span>
            </h2>
          </div>
          <a href="/templates" className="text-primary hover:text-primary-hover font-medium text-sm flex items-center gap-1 transition-colors">
            View all templates <span>→</span>
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {templates.map((tpl, i) => (
            <div key={i} className="group relative rounded-2xl overflow-hidden hover:-translate-y-1 transition-transform duration-300 shadow-sm hover:shadow-md cursor-pointer border border-border">
              
              {/* Aspect Ratio Container */}
              <div className={`w-full ${tpl.ratio === '9:16' ? 'aspect-[9/16]' : 'aspect-video lg:aspect-[4/5]'} relative`}>
                
                {/* CSS Background Graphic */}
                <div className={`absolute inset-0 bg-gradient-to-br ${tpl.hue} opacity-90`} />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.2),transparent)] mix-blend-overlay" />
                <div className="absolute inset-0 opacity-10 bg-[linear-gradient(45deg,transparent_49%,white_49%,white_51%,transparent_51%)] bg-[length:10px_10px]" />
                
                {/* Content */}
                <div className="absolute inset-0 p-5 flex flex-col justify-between">
                  
                  <div className="flex justify-between items-start">
                    <span className={`text-[10px] font-mono font-bold px-2 py-1 rounded bg-black/20 ${tpl.textDark ? 'text-slate-800' : 'text-white'} backdrop-blur-md`}>
                      {tpl.category}
                    </span>
                    <div className="w-8 h-8 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:scale-110">
                      <Play size={14} className={tpl.textDark ? 'text-slate-900 fill-current' : 'text-white fill-current'} />
                    </div>
                  </div>

                  <div>
                    <h3 className={`font-display font-bold text-xl ${tpl.textDark ? 'text-slate-900' : 'text-white'} mb-1`}>{tpl.title}</h3>
                    <div className={`flex gap-2 text-xs font-mono ${tpl.textDark ? 'text-slate-800' : 'text-white/80'}`}>
                      <span>{tpl.duration}</span>
                      <span>·</span>
                      <span>{tpl.ratio}</span>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
