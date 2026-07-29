import React from 'react';
import { Copy } from 'lucide-react';

export interface DuplicateProps {
  onDuplicate?: () => void;
  disabled?: boolean;
  className?: string;
  label?: string;
  showIcon?: boolean;
}

export function Duplicate({
  onDuplicate,
  disabled = false,
  className = '',
  label = 'Duplicate',
  showIcon = true,
}: DuplicateProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onDuplicate}
      title={label}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors ${
        disabled
          ? 'opacity-40 cursor-not-allowed text-muted-foreground'
          : 'text-foreground hover:bg-surface-hover'
      } ${className}`}
    >
      {showIcon && <Copy className="w-4 h-4" />}
      <span>{label}</span>
    </button>
  );
}
export default Duplicate;
