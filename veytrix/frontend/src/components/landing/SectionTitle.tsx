import React from 'react';

interface SectionTitleProps {
  title: string;
  subtitle?: string;
  badge?: string;
  center?: boolean;
}

export function SectionTitle({ title, subtitle, badge, center = true }: SectionTitleProps) {
  return (
    <div className={`flex flex-col ${center ? 'items-center text-center' : 'items-start text-left'} mb-16 max-w-3xl mx-auto`}>
      {badge && (
        <span className="font-mono text-xs font-bold text-[#3B6CE7] tracking-widest uppercase mb-4">
          {badge}
        </span>
      )}
      <h2 className="text-3xl md:text-5xl font-display font-bold tracking-tight text-[#1D2B64] leading-tight">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-4 text-[#1D2B64]/70 text-lg leading-relaxed max-w-2xl">
          {subtitle}
        </p>
      )}
    </div>
  );
}
