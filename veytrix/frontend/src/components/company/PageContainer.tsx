import React from 'react';

interface PageContainerProps {
  children: React.ReactNode;
}

export function PageContainer({ children }: PageContainerProps) {
  return (
    <div className="relative min-h-screen w-full bg-white text-[#1D2B64] font-sans overflow-hidden py-24 z-10">
      <div className="max-w-6xl mx-auto px-6 relative z-10">
        {children}
      </div>
    </div>
  );
}
