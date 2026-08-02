import React from 'react';

interface ProcessingLayoutProps {
  children: React.ReactNode;
}

export function ProcessingLayout({ children }: ProcessingLayoutProps) {
  return (
    <div className="relative w-full h-screen bg-[#F8FAFF] text-[#1D2B64] font-sans flex flex-col justify-between overflow-hidden p-6 select-none z-10">
      {/* Mesh Glow Background */}
      <div className="absolute top-1/2 left-1/2 w-[600px] h-[600px] rounded-full blur-[140px] opacity-[0.2] bg-[radial-gradient(circle_at_center,#3b82f6_0%,transparent_70%)] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      
      {/* Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#1D2B64_1px,transparent_1px),linear-gradient(to_bottom,#1D2B64_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" 
      />

      <div className="relative w-full max-w-5xl mx-auto flex flex-col h-full justify-between z-10 gap-6">
        {children}
      </div>
    </div>
  );
}
export default ProcessingLayout;
