import React from 'react';
import {
  Plus,
  Trash2,
  Copy,
  Clipboard,
  Sliders,
  Zap,
  MoveHorizontal,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Activity
} from 'lucide-react';
import {
  KeyframeProperty,
  InterpolationType,
  KeyframePoint,
  ALL_KEYFRAME_PROPERTIES
} from './keyframes.types';
import { interpolatePropertyValue } from './interpolator';
import { KeyframeButton } from './KeyframeButton';

export interface KeyframeInspectorProps {
  clipId: string;
  clipName: string;
  clipRelativeTime: number;
  keyframes: KeyframePoint[];
  autoKeyframeEnabled: boolean;
  onToggleAutoKeyframe: () => void;
  onAddOrUpdateKeyframe: (property: KeyframeProperty, value: number, interpolation?: InterpolationType) => void;
  onDeleteKeyframe: (keyframeId: string) => void;
  onUpdateInterpolation: (keyframeId: string, interpolation: InterpolationType, controlPoints?: { x1: number; y1: number; x2: number; y2: number }) => void;
  onUpdateKeyframeValue: (keyframeId: string, value: number) => void;
  onNavigateKeyframe: (property: KeyframeProperty, direction: 'prev' | 'next') => void;
  onCopyKeyframes: () => void;
  onPasteKeyframes: () => void;
  onClearAllKeyframes: () => void;
  hasClipboardData?: boolean;
}

export const KeyframeInspector: React.FC<KeyframeInspectorProps> = ({
  clipId,
  clipName,
  clipRelativeTime,
  keyframes,
  autoKeyframeEnabled,
  onToggleAutoKeyframe,
  onAddOrUpdateKeyframe,
  onDeleteKeyframe,
  onUpdateInterpolation,
  onUpdateKeyframeValue,
  onNavigateKeyframe,
  onCopyKeyframes,
  onPasteKeyframes,
  onClearAllKeyframes,
  hasClipboardData = false
}) => {
  const [selectedProperty, setSelectedProperty] = React.useState<KeyframeProperty>('scale');

  const sortedKeyframes = React.useMemo(() => {
    return [...keyframes].sort((a, b) => a.time - b.time);
  }, [keyframes]);

  const activeKeyframeAtPlayhead = sortedKeyframes.find(
    (k) => k.property === selectedProperty && Math.abs(k.time - clipRelativeTime) < 0.04
  );

  const selectedPropConfig = ALL_KEYFRAME_PROPERTIES.find((p) => p.key === selectedProperty) || ALL_KEYFRAME_PROPERTIES[0];

  const currentValueAtPlayhead = interpolatePropertyValue(
    keyframes,
    selectedProperty,
    clipRelativeTime,
    selectedPropConfig.defaultValue
  );

  return (
    <div className="flex flex-col h-full bg-surface border-l border-border select-none text-xs text-foreground font-sans p-3 space-y-4 overflow-y-auto">
      {/* Header & Auto Keyframe Toggle */}
      <div className="flex items-center justify-between pb-2 border-b border-border">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-emerald-400" />
          <span className="font-semibold text-sm tracking-tight">Keyframes</span>
          <span className="text-[10px] font-mono text-muted-foreground">({keyframes.length})</span>
        </div>

        {/* Auto Keyframe Toggle Switch */}
        <button
          type="button"
          onClick={onToggleAutoKeyframe}
          className={`flex items-center gap-1.5 px-2 py-1 rounded border text-[10px] font-medium transition cursor-pointer ${
            autoKeyframeEnabled
              ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
              : 'bg-surface-hover border-border text-muted-foreground hover:text-foreground'
          }`}
          title="Toggle Auto Keyframe Mode"
        >
          <Zap className={`h-3 w-3 ${autoKeyframeEnabled ? 'fill-emerald-400 text-emerald-400' : ''}`} />
          <span>Auto Keyframe</span>
        </button>
      </div>

      {/* Property Selector & Add/Copy/Paste Actions */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
            Target Property
          </label>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={onCopyKeyframes}
              disabled={keyframes.length === 0}
              className="p-1 rounded hover:bg-surface-hover text-muted-foreground hover:text-foreground disabled:opacity-40"
              title="Copy All Keyframes"
            >
              <Copy className="h-3 w-3" />
            </button>
            <button
              type="button"
              onClick={onPasteKeyframes}
              disabled={!hasClipboardData}
              className="p-1 rounded hover:bg-surface-hover text-muted-foreground hover:text-foreground disabled:opacity-40"
              title="Paste Keyframes"
            >
              <Clipboard className="h-3 w-3" />
            </button>
            <button
              type="button"
              onClick={onClearAllKeyframes}
              disabled={keyframes.length === 0}
              className="p-1 rounded hover:bg-red-500/20 text-muted-foreground hover:text-red-400 disabled:opacity-40"
              title="Clear All Keyframes"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        </div>

        <select
          value={selectedProperty}
          onChange={(e) => setSelectedProperty(e.target.value as KeyframeProperty)}
          className="w-full bg-background border border-border rounded-md px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:border-sky-500"
        >
          {ALL_KEYFRAME_PROPERTIES.map((prop) => (
            <option key={prop.key} value={prop.key}>
              {prop.label} ({prop.category})
            </option>
          ))}
        </select>
      </div>

      {/* Keyframe Quick Toggle Button Row */}
      <div className="flex items-center justify-between p-2.5 bg-background rounded-lg border border-border">
        <span className="font-medium text-xs">{selectedPropConfig.label}</span>

        <KeyframeButton
          property={selectedProperty}
          clipRelativeTime={clipRelativeTime}
          keyframes={keyframes}
          onToggleKeyframe={(prop) => {
            if (activeKeyframeAtPlayhead) {
              onDeleteKeyframe(activeKeyframeAtPlayhead.id);
            } else {
              onAddOrUpdateKeyframe(prop, currentValueAtPlayhead);
            }
          }}
          onNavigateKeyframe={onNavigateKeyframe}
        />
      </div>

      {/* Selected Keyframe Fine-Tuning Inspector */}
      {activeKeyframeAtPlayhead ? (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg space-y-3">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-semibold text-emerald-300 flex items-center gap-1">
              <Sliders className="h-3.5 w-3.5" /> Keyframe Settings
            </span>
            <span className="font-mono text-[10px] text-emerald-400">
              @{activeKeyframeAtPlayhead.time.toFixed(2)}s
            </span>
          </div>

          {/* Value Slider & Numeric Input */}
          <div className="space-y-1">
            <div className="flex justify-between text-[10px] font-mono text-muted-foreground">
              <span>Value</span>
              <span>
                {activeKeyframeAtPlayhead.value.toFixed(2)}
                {selectedPropConfig.unit || ''}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min={selectedPropConfig.min}
                max={selectedPropConfig.max}
                step={selectedPropConfig.step}
                value={activeKeyframeAtPlayhead.value}
                onChange={(e) => onUpdateKeyframeValue(activeKeyframeAtPlayhead.id, Number(e.target.value))}
                className="flex-1 accent-emerald-400 h-1 bg-surface-hover rounded-lg cursor-pointer"
              />
              <input
                type="number"
                min={selectedPropConfig.min}
                max={selectedPropConfig.max}
                step={selectedPropConfig.step}
                value={activeKeyframeAtPlayhead.value}
                onChange={(e) => onUpdateKeyframeValue(activeKeyframeAtPlayhead.id, Number(e.target.value))}
                className="w-16 bg-background border border-border rounded px-1.5 py-0.5 text-right text-[10px] font-mono text-foreground focus:outline-none"
              />
            </div>
          </div>

          {/* Interpolation Type Selector */}
          <div className="space-y-1">
            <label className="text-[10px] font-mono text-muted-foreground">Interpolation Curve</label>
            <div className="grid grid-cols-3 gap-1">
              {(['linear', 'easeIn', 'easeOut', 'easeInOut', 'hold', 'bezier'] as InterpolationType[]).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => onUpdateInterpolation(activeKeyframeAtPlayhead.id, mode)}
                  className={`py-1 px-1.5 rounded border text-[10px] text-center font-mono capitalize transition cursor-pointer ${
                    activeKeyframeAtPlayhead.interpolation === mode
                      ? 'bg-emerald-400 text-black font-bold border-emerald-400'
                      : 'bg-background border-border text-muted-foreground hover:bg-surface-hover'
                  }`}
                >
                  {mode === 'easeInOut' ? 'Ease In-Out' : mode}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="p-3 bg-background border border-border rounded-lg space-y-3">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-semibold text-foreground flex items-center gap-1">
              <Sliders className="h-3.5 w-3.5 text-sky-400" /> Property Controls
            </span>
            <span className="font-mono text-[10px] text-muted-foreground">
              @{clipRelativeTime.toFixed(2)}s
            </span>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-[10px] font-mono text-muted-foreground">
              <span>{selectedPropConfig.label}</span>
              <span>
                {currentValueAtPlayhead.toFixed(2)}
                {selectedPropConfig.unit || ''}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min={selectedPropConfig.min}
                max={selectedPropConfig.max}
                step={selectedPropConfig.step}
                value={currentValueAtPlayhead}
                onChange={(e) => onAddOrUpdateKeyframe(selectedProperty, Number(e.target.value))}
                className="flex-1 accent-sky-400 h-1 bg-surface-hover rounded-lg cursor-pointer"
              />
              <input
                type="number"
                min={selectedPropConfig.min}
                max={selectedPropConfig.max}
                step={selectedPropConfig.step}
                value={currentValueAtPlayhead}
                onChange={(e) => onAddOrUpdateKeyframe(selectedProperty, Number(e.target.value))}
                className="w-16 bg-background border border-border rounded px-1.5 py-0.5 text-right text-[10px] font-mono text-foreground focus:outline-none"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={() => onAddOrUpdateKeyframe(selectedProperty, currentValueAtPlayhead)}
            className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30 text-xs font-medium transition cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5 text-emerald-400" />
            <span>Add Keyframe at {clipRelativeTime.toFixed(2)}s</span>
          </button>
        </div>
      )}

      {/* Keyframes Timeline Table List */}
      <div className="space-y-2 pt-2 border-t border-border flex-1">
        <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
          Active Keyframe List ({sortedKeyframes.length})
        </span>

        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
          {sortedKeyframes.map((kf) => {
            const propCfg = ALL_KEYFRAME_PROPERTIES.find((p) => p.key === kf.property);
            const isCurrent = Math.abs(kf.time - clipRelativeTime) < 0.04;

            return (
              <div
                key={kf.id}
                className={`flex items-center justify-between p-2 rounded border transition ${
                  isCurrent
                    ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-200'
                    : 'bg-background border-border hover:border-border-strong text-foreground'
                }`}
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="text-emerald-400 font-bold">◆</span>
                  <div className="flex flex-col min-w-0">
                    <span className="truncate text-[11px] font-medium">{propCfg?.label || kf.property}</span>
                    <span className="text-[9px] font-mono text-muted-foreground">
                      @{kf.time.toFixed(2)}s | {kf.interpolation}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="font-mono text-[10px] font-semibold">
                    {kf.value.toFixed(1)}
                    {propCfg?.unit || ''}
                  </span>
                  <button
                    type="button"
                    onClick={() => onDeleteKeyframe(kf.id)}
                    className="text-muted-foreground hover:text-red-400 p-0.5 transition"
                    title="Delete keyframe"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            );
          })}

          {sortedKeyframes.length === 0 && (
            <div className="text-center py-4 text-muted-foreground text-[11px]">
              No keyframes created yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
