import React from 'react';

interface UploadLayoutProps {
  children: React.ReactNode;
}

export function UploadLayout({ children }: UploadLayoutProps) {
  return (
    <div className="relative w-full min-h-screen bg-[#F8FAFF] text-[#1D2B64] font-sans flex flex-col justify-between overflow-y-auto p-4 md:p-6 select-none z-10">
      {/* Mesh Glow Background */}
      <div className="absolute top-1/2 left-1/2 w-[600px] h-[600px] rounded-full blur-[140px] opacity-[0.2] bg-[radial-gradient(circle_at_center,#3B6CE7_0%,transparent_70%)] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      
      {/* Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#1D2B64_1px,transparent_1px),linear-gradient(to_bottom,#1D2B64_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" 
      />

      <div className="relative w-full max-w-5xl mx-auto flex flex-col min-h-[calc(100vh-2rem)] md:min-h-[calc(100vh-3rem)] justify-between z-10 gap-6">
        {children}
      </div>
    </div>
  );
}
export default UploadLayout;
