import React from 'react';

export function Cursor() {
  return (
    <span 
      className="w-1.5 h-5 bg-[#3B6CE7] inline-block ml-1 align-middle animate-pulse" 
      data-testid="console-cursor"
    />
  );
}
