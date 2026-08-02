import React from 'react';
import { WelcomeHeader } from '../../../components/homepage/WelcomeHeader';
import { ManualEditCard } from '../../../components/homepage/ManualEditCard';
import { QuickActions } from '../../../components/homepage/QuickActions';
import { CapabilityCards } from '../../../components/homepage/CapabilityCards';
import { RecentProjects } from '../../../components/homepage/RecentProjects';

export function Homepage() {
  return (
    <div className="px-4 md:px-6 xl:px-8 relative w-full h-full flex flex-col">
      {/* Extremely subtle static background depth */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(59,108,231,0.03),transparent_50%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(140,200,232,0.03),transparent_50%)] pointer-events-none" />
      
      <div className="relative mx-auto w-full max-w-6xl h-full flex flex-col">
        <WelcomeHeader />
        
        {/* Main Workspace (Grid on Desktop, Stack on Mobile) */}
        <div className="grid grid-cols-1 md:grid-cols-[1.15fr_0.85fr] gap-4 md:gap-5 min-h-[280px] md:min-h-[300px] flex-shrink-0">
          <ManualEditCard />
          <QuickActions />
        </div>

        {/* Capability Strip */}
        <CapabilityCards />

        {/* Recent Projects (Takes remaining space on desktop) */}
        <RecentProjects />
      </div>
    </div>
  );
}
