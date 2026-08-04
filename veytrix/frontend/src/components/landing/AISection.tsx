import React from 'react';
import { SectionTitle } from './SectionTitle';
import { AICommandConsole } from '../../features/landing/components/AICommandConsole/AICommandConsole';

export function AISection() {
  return (
    <section className="relative py-28 bg-[#FFFFFF] overflow-hidden z-10">
      {/* Background soft ambient lighting matching light theme */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(140,200,232,0.15),transparent_70%)] pointer-events-none" />

      <div className="relative mx-auto max-w-5xl px-6 flex flex-col items-center">
        
        {/* Reusable Section Title */}
        <div className="reveal-on-scroll">
          <SectionTitle 
            badge="Future Engine"
            title="Editing meets intelligence."
            subtitle="The AI Command Engine is reserved for a future release. The workspace interface is configured; we are preparing model integration."
          />
        </div>

        {/* Command UI Mockup Container */}
        <div className="reveal-on-scroll w-full flex justify-center">
          <AICommandConsole />
        </div>
      </div>
    </section>
  );
}

