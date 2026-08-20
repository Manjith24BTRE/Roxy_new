import React, { Suspense } from 'react';
import { 
  LandingLayout, 
  Hero, 
  ProductValueStrip, 
  LandingCTA 
} from '../../../components/landing';

// Lazy load below-the-fold components for performance optimization
const FeatureBento = React.lazy(() => import('../../../components/landing/FeatureBento').then(module => ({ default: module.FeatureBento })));
const WorkflowSection = React.lazy(() => import('../../../components/landing/WorkflowSection').then(module => ({ default: module.WorkflowSection })));
const AISection = React.lazy(() => import('../../../components/landing/AISection').then(module => ({ default: module.AISection })));
const WhyVeytrix = React.lazy(() => import('../../../components/landing/WhyVeytrix').then(module => ({ default: module.WhyVeytrix })));
const ShortcutsSection = React.lazy(() => import('../../../components/landing/ShortcutsSection').then(module => ({ default: module.ShortcutsSection })));
const FAQ = React.lazy(() => import('../../../components/landing/FAQ').then(module => ({ default: module.FAQ })));

function SectionLoader() {
  return (
    <div className="w-full py-8 flex items-center justify-center">
      <div className="h-5 w-5 rounded-full border-2 border-[#3B6CE7]/20 border-t-[#3B6CE7] animate-spin" />
    </div>
  );
}

export function LandingPage() {
  return (
    <LandingLayout>
      <main className="relative flex flex-col min-h-screen bg-background">
        {/* Hero with interactive workspace preview included */}
        <Hero />
        
        {/* Features trust strip */}
        <ProductValueStrip />
        
        {/* Below the fold content loaded lazily with Suspense to maximize Lighthouse score */}
        <div className="space-y-4">
          <Suspense fallback={<SectionLoader />}>
            <FeatureBento />
          </Suspense>
          
          <Suspense fallback={<SectionLoader />}>
            <WorkflowSection />
          </Suspense>
          
          <Suspense fallback={<SectionLoader />}>
            <AISection />
          </Suspense>
          
          <Suspense fallback={<SectionLoader />}>
            <WhyVeytrix />
          </Suspense>
          
          <Suspense fallback={<SectionLoader />}>
            <ShortcutsSection />
          </Suspense>
          
          <Suspense fallback={<SectionLoader />}>
            <FAQ />
          </Suspense>
        </div>
        
        {/* Kept exactly as is per CTA preservation requirement */}
        <LandingCTA />
      </main>
    </LandingLayout>
  );
}
