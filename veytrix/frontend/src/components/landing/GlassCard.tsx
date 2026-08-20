import React from 'react';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
}

export function GlassCard({ children, className = '', hoverEffect = true, ...props }: GlassCardProps) {
  return (
    <div 
      className={`
        relative rounded-2xl bg-white/70 backdrop-blur-md 
        border border-[#1D2B64]/5 shadow-[0_8px_30px_rgb(29,43,100,0.02)]
        transition-all duration-300 ease-out
        ${hoverEffect ? 'hover:shadow-[0_20px_50px_rgba(29,43,100,0.05)] hover:border-[#3B6CE7]/20 hover:-translate-y-0.5' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}
