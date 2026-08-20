import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { KeyframeProperty, KeyframePoint } from './keyframes.types';

export interface KeyframeButtonProps {
  property: KeyframeProperty;
  label?: string;
  clipRelativeTime: number;
  keyframes: KeyframePoint[];
  onToggleKeyframe: (property: KeyframeProperty) => void;
  onNavigateKeyframe?: (property: KeyframeProperty, direction: 'prev' | 'next') => void;
  disabled?: boolean;
}

export const KeyframeButton: React.FC<KeyframeButtonProps> = ({
  property,
  label,
  clipRelativeTime,
  keyframes,
  onToggleKeyframe,
  onNavigateKeyframe,
  disabled = false
}) => {
  const propKeyframes = keyframes
    .filter((k) => k.property === property)
    .sort((a, b) => a.time - b.time);

  // Check if a keyframe exists at current timestamp (within 0.04s window ~ 1 frame @ 24/30/60fps)
  const hasKeyframeAtCurrentFrame = propKeyframes.some(
    (k) => Math.abs(k.time - clipRelativeTime) < 0.04
  );

  const hasPrev = propKeyframes.some((k) => k.time < clipRelativeTime - 0.04);
  const hasNext = propKeyframes.some((k) => k.time > clipRelativeTime + 0.04);

  return (
    <div className="flex items-center gap-0.5 select-none">
      {label && <span className="text-[10px] text-muted-foreground font-mono mr-1">{label}</span>}

      {/* Previous Keyframe Button */}
      <button
        type="button"
        disabled={disabled || !hasPrev}
        onClick={(e) => {
          e.stopPropagation();
          onNavigateKeyframe?.(property, 'prev');
        }}
        className={`p-0.5 rounded transition ${
          hasPrev && !disabled
            ? 'text-muted-foreground hover:text-foreground hover:bg-surface-hover cursor-pointer'
            : 'text-muted-foreground/30 cursor-not-allowed'
        }`}
        title="Go to previous keyframe"
      >
        <ChevronLeft className="h-3 w-3" />
      </button>

      {/* Main Keyframe Diamond Toggle Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={(e) => {
          e.stopPropagation();
          onToggleKeyframe(property);
        }}
        className={`p-1 rounded transition flex items-center justify-center cursor-pointer ${
          hasKeyframeAtCurrentFrame
            ? 'text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 border border-emerald-500/30'
            : 'text-muted-foreground hover:text-sky-400 hover:bg-surface-hover'
        } ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
        title={
          hasKeyframeAtCurrentFrame
            ? 'Remove keyframe at current playhead frame'
            : 'Add keyframe at current playhead frame'
        }
      >
        <svg
          viewBox="0 0 24 24"
          className="h-3.5 w-3.5 fill-current transition-transform duration-150 transform hover:scale-110"
        >
          {hasKeyframeAtCurrentFrame ? (
            /* Filled Diamond */
            <path d="M12 2L2 12l10 10 10-10L12 2z" />
          ) : (
            /* Outlined Diamond */
            <path
              d="M12 2L2 12l10 10 10-10L12 2zm0 3.83L18.17 12 12 18.17 5.83 12 12 5.83z"
              fillRule="evenodd"
            />
          )}
        </svg>
      </button>

      {/* Next Keyframe Button */}
      <button
        type="button"
        disabled={disabled || !hasNext}
        onClick={(e) => {
          e.stopPropagation();
          onNavigateKeyframe?.(property, 'next');
        }}
        className={`p-0.5 rounded transition ${
          hasNext && !disabled
            ? 'text-muted-foreground hover:text-foreground hover:bg-surface-hover cursor-pointer'
            : 'text-muted-foreground/30 cursor-not-allowed'
        }`}
        title="Go to next keyframe"
      >
        <ChevronRight className="h-3 w-3" />
      </button>
    </div>
  );
};
