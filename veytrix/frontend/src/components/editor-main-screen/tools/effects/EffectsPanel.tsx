// src/components/editor-main-screen/tools/effects/EffectsPanel.tsx
import React, { useState, useEffect } from 'react';
import { Sparkles, Check, RotateCcw, Zap, SlidersHorizontal, Clock, Gauge } from 'lucide-react';
import { assetRegistry, AssetRecord } from '../../../../services/AssetRegistry';
import { AssetInteractionState, EffectInstanceParameters } from '../../../../types/assetInteraction';

interface EffectsPanelProps {
  activeEffectId: string | number | null;
  effectIntensity: number; // 0.0 to 1.0 or 0 to 100
  interactionState?: AssetInteractionState;
  effectParams?: EffectInstanceParameters;
  onSelectEffect: (effectId: string | number | null, nextState?: AssetInteractionState) => void;
  onIntensityChange: (intensity: number) => void;
  onEffectParamsChange?: (params: Partial<EffectInstanceParameters>) => void;
}

export function EffectsPanel({
  activeEffectId,
  effectIntensity = 1.0,
  interactionState = activeEffectId ? 'applied-selected' : 'not-applied',
  effectParams = {
    id: String(activeEffectId || ''),
    assetId: activeEffectId || '',
    assetName: String(activeEffectId || ''),
    engineKey: 'BasicAnimationEngine',
    enabled: true,
    startTime: 0,
    endTime: 5,
    duration: 5,
    intensity: 1.0,
    speed: 1.0,
    amount: 50,
  },
  onSelectEffect,
  onIntensityChange,
  onEffectParamsChange,
}: EffectsPanelProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('Basic Effects');
  const [categories, setCategories] = useState<string[]>([]);
  const [effectAssets, setEffectAssets] = useState<AssetRecord[]>([]);
  const [allEffectAssets, setAllEffectAssets] = useState<AssetRecord[]>([]);

  useEffect(() => {
    const allEffects = assetRegistry.getAssetsByType('Effects');
    setAllEffectAssets(allEffects);
    const catList = assetRegistry.getCategories('Effects');
    setCategories(catList);
    if (catList.length > 0 && !catList.includes('Basic Effects')) {
      setSelectedCategory(catList[0]);
    }
  }, []);

  useEffect(() => {
    const categoryAssets = assetRegistry.getAssetsByCategory('Effects', selectedCategory);
    setEffectAssets(categoryAssets);
  }, [selectedCategory]);

  const activeAsset = allEffectAssets.find(
    (a) =>
      String(a.id) === String(activeEffectId) ||
      a.name === activeEffectId ||
      a.name.trim().toLowerCase() === String(activeEffectId).trim().toLowerCase()
  );

  const normIntensity = effectIntensity > 1.0 ? Math.min(1.0, effectIntensity / 100) : Math.max(0, effectIntensity);

  /**
   * Deterministic 3-Click Cycle Handler for Effects:
   * Click 1 -> Apply / Select ('applied-selected')
   * Click 2 -> Open Settings ('settings-open')
   * Click 3 -> Remove effect ('not-applied')
   */
  const handleAssetClick = (asset: AssetRecord) => {
    const isThisAssetActive =
      String(asset.id) === String(activeEffectId) ||
      asset.name === activeEffectId ||
      asset.name.trim().toLowerCase() === String(activeEffectId).trim().toLowerCase();

    if (!isThisAssetActive) {
      // CLICK 1: APPLY / SELECT
      onSelectEffect(asset.name, 'applied-selected');
    } else {
      if (interactionState === 'applied-selected') {
        // CLICK 2: OPEN SETTINGS
        onSelectEffect(asset.name, 'settings-open');
      } else if (interactionState === 'settings-open') {
        // CLICK 3: REMOVE EFFECT
        onSelectEffect(null, 'not-applied');
      } else {
        // Reset fallback
        onSelectEffect(asset.name, 'applied-selected');
      }
    }
  };

  return (
    <div className="flex flex-col h-full min-h-0 bg-background/95 text-foreground select-none p-3 overflow-hidden">
      {/* Fixed Header */}
      <div className="flex-shrink-0 flex items-center justify-between border-b border-border pb-2 mb-2">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold tracking-wide uppercase">Effects Library</h3>
            <p className="text-[10px] text-muted-foreground">100 Premium Video Effects</p>
          </div>
        </div>

        {activeEffectId && (
          <button
            type="button"
            onClick={() => onSelectEffect(null, 'not-applied')}
            className="flex items-center space-x-1 px-2 py-1 text-[10px] font-medium text-destructive hover:bg-destructive/10 rounded transition cursor-pointer"
            title="Remove active effect"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Remove</span>
          </button>
        )}
      </div>

      {/* Fixed Category Pills */}
      <div className="flex-shrink-0 flex items-center space-x-1.5 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => {
          const isSelected = selectedCategory.toLowerCase() === cat.toLowerCase();
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 text-[10px] font-medium rounded-full whitespace-nowrap transition-all cursor-pointer ${
                isSelected
                  ? 'bg-sky-500 text-white font-semibold shadow-sm'
                  : 'bg-surface hover:bg-surface-hover text-muted-foreground hover:text-foreground'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Fixed Active Control Bar & Click 2 Settings Panel */}
      {activeAsset && (
        <div className="flex-shrink-0 p-2.5 rounded-lg bg-surface border border-sky-500/30 space-y-2.5 mb-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-sky-400 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5" />
              {activeAsset.name}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-muted-foreground font-mono">
                {Math.round(normIntensity * 100)}%
              </span>
              <span className="text-[9px] px-1.5 py-0.5 rounded font-mono uppercase bg-sky-500/20 text-sky-300 border border-sky-500/30">
                {interactionState}
              </span>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>Effect Intensity</span>
              <span>0% - 100%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={Math.round(normIntensity * 100)}
              onChange={(e) => onIntensityChange(parseFloat(e.target.value) / 100)}
              className="w-full h-1.5 bg-surface-hover rounded-lg appearance-none cursor-pointer accent-sky-500"
            />
          </div>

          {/* CLICK 2 EFFECT ADJUSTMENT SETTINGS PANEL (Exposed only when interactionState === 'settings-open') */}
          {interactionState === 'settings-open' && (
            <div className="pt-2.5 border-t border-sky-500/20 space-y-2.5 animate-in fade-in duration-150">
              <div className="flex items-center justify-between text-[10px] font-bold text-sky-300 uppercase tracking-wider">
                <span className="flex items-center gap-1">
                  <SlidersHorizontal className="w-3 h-3 text-sky-400" /> Effect Timing & Controls
                </span>
                <span className="text-[9px] font-mono text-sky-400/80">Click 2 Active</span>
              </div>

              {/* Start Time & End Time Controls */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] text-muted-foreground">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Start</span>
                    <span>{(effectParams.startTime ?? 0).toFixed(1)}s</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="60"
                    step="0.5"
                    value={effectParams.startTime ?? 0}
                    onChange={(e) => {
                      const newStart = parseFloat(e.target.value);
                      const currentEnd = effectParams.endTime ?? 5;
                      const validEnd = Math.max(newStart + 0.5, currentEnd);
                      onEffectParamsChange?.({ startTime: newStart, endTime: validEnd, duration: validEnd - newStart });
                    }}
                    className="w-full h-1 bg-surface-hover rounded-lg appearance-none cursor-pointer accent-sky-400"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] text-muted-foreground">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> End</span>
                    <span>{(effectParams.endTime ?? 5).toFixed(1)}s</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="60"
                    step="0.5"
                    value={effectParams.endTime ?? 5}
                    onChange={(e) => {
                      const newEnd = parseFloat(e.target.value);
                      const currentStart = effectParams.startTime ?? 0;
                      const validStart = Math.min(newEnd - 0.5, currentStart);
                      onEffectParamsChange?.({ startTime: validStart, endTime: newEnd, duration: newEnd - validStart });
                    }}
                    className="w-full h-1 bg-surface-hover rounded-lg appearance-none cursor-pointer accent-sky-400"
                  />
                </div>
              </div>

              {/* Effect Speed Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span className="flex items-center gap-1"><Gauge className="w-3 h-3" /> Effect Speed</span>
                  <span>{(effectParams.speed ?? 1.0).toFixed(1)}x</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="3.0"
                  step="0.1"
                  value={effectParams.speed ?? 1.0}
                  onChange={(e) => onEffectParamsChange?.({ speed: parseFloat(e.target.value) })}
                  className="w-full h-1 bg-surface-hover rounded-lg appearance-none cursor-pointer accent-sky-400"
                />
              </div>

              {/* Effect Amount / Scale Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>Effect Amount</span>
                  <span>{Math.round(effectParams.amount ?? 50)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={effectParams.amount ?? 50}
                  onChange={(e) => onEffectParamsChange?.({ amount: parseFloat(e.target.value) })}
                  className="w-full h-1 bg-surface-hover rounded-lg appearance-none cursor-pointer accent-sky-400"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Scrollable Effects List */}
      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden pr-1 scrollbar-thin">
        <div className="grid grid-cols-3 gap-2 pb-4">
          {/* None / Remove Effect Card */}
          <button
            type="button"
            onClick={() => onSelectEffect(null, 'not-applied')}
            className={`flex flex-col items-center justify-center p-3 rounded-lg border text-center transition-all cursor-pointer ${
              !activeEffectId
                ? 'border-sky-500 bg-sky-500/10 text-sky-400 font-semibold'
                : 'border-border bg-surface hover:bg-surface-hover text-muted-foreground'
            }`}
          >
            <div className="w-7 h-7 rounded-full bg-background flex items-center justify-center mb-1">
              <RotateCcw className="w-3.5 h-3.5" />
            </div>
            <span className="text-[10px]">None</span>
          </button>

          {/* All Category Effect Cards */}
          {effectAssets.map((asset) => {
            const isSelected =
              String(asset.id) === String(activeEffectId) ||
              asset.name === activeEffectId ||
              asset.name.trim().toLowerCase() === String(activeEffectId).trim().toLowerCase();

            return (
              <button
                key={asset.id}
                type="button"
                onClick={() => handleAssetClick(asset)}
                className={`relative flex flex-col items-center justify-between p-2.5 rounded-lg border transition-all cursor-pointer ${
                  isSelected
                    ? 'border-sky-500 bg-sky-500/15 text-white font-semibold ring-1 ring-sky-500/50 shadow-md'
                    : 'border-border bg-surface hover:bg-surface-hover text-muted-foreground hover:text-foreground'
                }`}
              >
                {isSelected && (
                  <div className="absolute top-1 right-1 p-0.5 rounded-full bg-sky-500 text-white">
                    <Check className="w-2.5 h-2.5" />
                  </div>
                )}

                <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center mb-1.5">
                  <Sparkles className="w-4 h-4" />
                </div>

                <span className="text-[10px] text-center leading-tight line-clamp-2">
                  {asset.name}
                </span>

                {isSelected && (
                  <span className="mt-1 px-1 py-0.2 text-[8px] font-bold bg-sky-500 text-white rounded">
                    {interactionState === 'applied-selected' ? 'Click 2: Adjust' : 'Click 3: Remove'}
                  </span>
                )}
                {!isSelected && asset.plan === 'Pro' && (
                  <span className="mt-1 px-1 py-0.2 text-[8px] font-bold bg-amber-500/20 text-amber-400 rounded">
                    PRO
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
