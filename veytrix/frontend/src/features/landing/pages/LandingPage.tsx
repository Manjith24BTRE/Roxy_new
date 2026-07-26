import React from 'react';
import { Hero } from '../../../components/landing/Hero';
import { EditorShowcase } from '../../../components/landing/EditorShowcase';
import { ProductValueStrip } from '../../../components/landing/ProductValueStrip';
import { FeatureBento } from '../../../components/landing/FeatureBento';
import { WorkflowSection } from '../../../components/landing/WorkflowSection';
import { AISection } from '../../../components/landing/AISection';
import { WhyVeytrix } from '../../../components/landing/WhyVeytrix';
import { TemplatesShowcase } from '../../../components/landing/TemplatesShowcase';
import { ShortcutsSection } from '../../../components/landing/ShortcutsSection';
import { FAQ } from '../../../components/landing/FAQ';
import { FinalCTA } from '../../../components/landing/FinalCTA';

export function LandingPage() {
  return (
    <main className="relative flex flex-col min-h-screen bg-background">
      <Hero />
      
      {/* Editor Showcase placed immediately after Hero text content */}
      <div className="-mt-8 md:-mt-16">
        <EditorShowcase />
      </div>
      
      <ProductValueStrip />
      
      <FeatureBento />
      
      <WorkflowSection />
      
      <AISection />
      
      <WhyVeytrix />
      
      <TemplatesShowcase />
      
      <ShortcutsSection />
      
      <FAQ />
      
      <FinalCTA />
    </main>
  );
}
