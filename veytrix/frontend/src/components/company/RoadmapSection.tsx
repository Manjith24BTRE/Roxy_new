import React from 'react';
import { SectionTitle } from './SectionTitle';

export function RoadmapSection() {
  const roadmap = [
    { version: "v1 (Current)", title: "Core Web Shell", desc: "Interactive timelines, local storage caches, and WASM rendering pipelines." },
    { version: "v2", title: "AI Command Engine", desc: "Non-linear text prompt alignments to build first raw cuts instantly." },
    { version: "v3", title: "Cloud Collaboration", desc: "Multiplayer workspace timeline editing with synced assets." },
    { version: "v4", title: "Marketplace Integration", desc: "Allows developers to compile custom canvas filters and shaders." },
    { version: "v5", title: "Enterprise Workspace", desc: "Advanced video team permissions and single-sign-on dashboards." }
  ];

  return (
    <section className="relative py-12 z-10">
      <SectionTitle title="Project Roadmap" badge="Roadmap" center={true} />
      
      <div className="max-w-3xl mx-auto relative border-l border-[#1D2B64]/5 pl-6 space-y-8 mt-8">
        {roadmap.map((r, i) => (
          <div key={i} className="relative group text-left">
            {/* Timeline indicator node */}
            <span className="absolute -left-[31px] top-1.5 w-2.5 h-2.5 rounded-full bg-white border-2 border-[#3B6CE7] group-hover:scale-125 transition-transform" />
            
            <span className="font-mono text-[9px] font-bold text-[#3B6CE7] uppercase tracking-wider block mb-0.5">{r.version}</span>
            <h3 className="text-sm font-bold text-[#1D2B64]">{r.title}</h3>
            <p className="text-xs text-[#1D2B64]/65 leading-relaxed font-semibold mt-1">{r.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
export default RoadmapSection;
