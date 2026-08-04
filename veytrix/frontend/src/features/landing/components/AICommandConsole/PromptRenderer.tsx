import React from 'react';
import { Cursor } from './Cursor';

interface PromptRendererProps {
  command: string;
}

export function PromptRenderer({ command }: PromptRendererProps) {
  return (
    <div className="text-lg md:text-xl font-display font-medium text-[#1D2B64] leading-relaxed break-words select-none pointer-events-none">
      <span>"</span>
      <span>{command}</span>
      <span>"</span>
      <Cursor />
    </div>
  );
}
