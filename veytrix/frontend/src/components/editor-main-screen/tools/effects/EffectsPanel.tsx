// src/components/editor-main-screen/tools/effects/EffectsPanel.tsx
import React, { useState, useEffect } from 'react';
import { Sparkles, Check, RotateCcw, Zap, SlidersHorizontal, Clock, Gauge, Trash2, Sliders } from 'lucide-react';
import { assetRegistry, AssetRecord } from '../../../../services/AssetRegistry';
import { AssetInteractionState, EffectInstanceParameters } from '../../../../types/assetInteraction';

interface EffectsPanelProps {
  activeEffectId: string | number | null;
  effectIntensity: number; // 0.0 to 1.0 or 0 to 100
  interactionState?: AssetInteractionState;
  effectParams?: EffectInstanceParameters;
  currentTime?: number;
  onSelectEffect: (effectId: string | number | null, nextState?: AssetInteractionState, defaultParams?: Partial<EffectInstanceParameters>) => void;
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
    endTime: 3,
    duration: 3,
    intensity: 1.0,
    speed: 1.0,
    amount: 50,
  },
  currentTime = 0,
  onSelectEffect,
  onIntensityChange,
  onEffectParamsChange,
}: EffectsPanelProps) {
  const [activeTab, setActiveTab] = useState<'effects' | 'adjustment'>('effects');
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
   * Click 1 -> Apply / Select ('applied-selected') with EXACTLY 3.0s default duration
   * Click 2 -> Open Adjustment section ('settings-open')
   * Click 3 -> Remove effect ('not-applied')
   */
  const handleAssetClick = (asset: AssetRecord) => {
    const isThisAssetActive =
      activeEffectId !== null &&
      (String(asset.id) === String(activeEffectId) ||
        asset.name === activeEffectId ||
        asset.name.trim().toLowerCase() === String(activeEffectId).trim().toLowerCase());

    if (!isThisAssetActive) {
      // CLICK 1: APPLY / SELECT (Default duration EXACTLY 3.0s, starting at current playhead position)
      const defaultDuration = 3.0;
      const startTime = currentTime;
      const endTime = startTime + defaultDuration;

      onSelectEffect(asset.name, 'applied-selected', {
        id: `effect-${Date.now()}`,
        assetId: asset.id || asset.name,
        assetName: asset.name,
        engineKey: asset.engineKey || 'BasicAnimationEngine',
        enabled: true,
        startTime,
        endTime,
        duration: defaultDuration,
        intensity: 1.0,
        speed: 1.0,
        amount: 50,
      });
    } else {
      if (interactionState === 'applied-selected') {
        // CLICK 2: OPEN ADJUSTMENT TAB
        setActiveTab('adjustment');
        onSelectEffect(asset.name, 'settings-open');
      } else if (interactionState === 'settings-open') {
        // CLICK 3: REMOVE EFFECT
        onSelectEffect(null, 'not-applied');
        setActiveTab('effects');
      } else {
        // Fallback re-select
        onSelectEffect(asset.name, 'applied-selected');
      }
    }
  };

  const handleRemoveEffect = () => {
    onSelectEffect(null, 'not-applied');
    setActiveTab('effects');
  };

  const currentStartTime = effectParams?.startTime ?? 0;
  const currentEndTime = effectParams?.endTime ?? (currentStartTime + 3.0);
  const currentDuration = effectParams?.duration ?? Math.max(0.1, currentEndTime - currentStartTime);

  return (
    <div className="flex flex-col h-full min-h-0 bg-background/95 text-foreground select-none p-3 overflow-hidden">
      {/* Top Header with Tab Switcher: [ Effects ] [ Adjustment ] */}
      <div className="flex-shrink-0 flex items-center justify-between border-b border-border pb-2 mb-2">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold tracking-wide uppercase">Effects</h3>
            <p className="text-[10px] text-muted-foreground">
              {allEffectAssets.length > 0 ? `${allEffectAssets.length} Video Effects` : 'Premium Video Effects'}
            </p>
          </div>
        </div>

        {/* Top-Level Tabs */}
        <div className="flex items-center bg-surface p-0.5 rounded-lg border border-border">
          <button
            type="button"
            onClick={() => setActiveTab('effects')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
              activeTab === 'effects'
                ? 'bg-sky-500 text-white shadow-sm font-semibold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Effects
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('adjustment')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
              activeTab === 'adjustment'
                ? 'bg-sky-500 text-white shadow-sm font-semibold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Adjustment
          </button>
        </div>
      </div>

      {/* OPTION 1 — EFFECTS LIBRARY */}
      {activeTab === 'effects' && (
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {/* Category Pills */}
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

          {/* Clean Scrollable Effects Grid — NO inline adjustment sliders */}
          <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden pr-1 scrollbar-thin pt-1">
            <div className="grid grid-cols-3 gap-2 pb-4">
              {/* None / Remove Effect Card */}
              <button
                type="button"
                onClick={handleRemoveEffect}
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
                  activeEffectId !== null &&
                  (String(asset.id) === String(activeEffectId) ||
                    asset.name === activeEffectId ||
                    asset.name.trim().toLowerCase() === String(activeEffectId).trim().toLowerCase());

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
      )}

      {/* OPTION 2 — ADJUSTMENT SECTION */}
      {activeTab === 'adjustment' && (
        <div className="flex-1 flex flex-col min-h-0 overflow-y-auto pr-1 scrollbar-thin">
          {activeEffectId && activeAsset ? (
            <div className="space-y-4 pt-1 pb-4">
              {/* Active Effect Header Info */}
              <div className="p-3 rounded-lg bg-surface border border-sky-500/30 flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 rounded-lg bg-sky-500/20 text-sky-400 border border-sky-500/30">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-foreground">{activeAsset.name}</h4>
                    <p className="text-[10px] text-sky-400/80 font-mono">{activeAsset.category} Effect</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveEffect}
                  className="p-1.5 rounded-md text-destructive hover:bg-destructive/10 transition cursor-pointer"
                  title="Remove effect"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* TIMING CONTROL SECTION */}
              <div className="p-3 rounded-lg bg-surface border border-border space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold text-foreground border-b border-border pb-1.5">
                  <span className="flex items-center gap-1.5 text-sky-400">
                    <Clock className="w-3.5 h-3.5" /> Timing
                  </span>
                  <span className="text-[10px] font-mono text-muted-foreground">
                    {currentDuration.toFixed(2)}s Total
                  </span>
                </div>

                {/* Start Time */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] text-muted-foreground">
                    <span>Start Time</span>
                    <span className="font-mono text-foreground">{currentStartTime.toFixed(3)}s</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="60"
                    step="0.1"
                    value={currentStartTime}
                    onChange={(e) => {
                      const newStart = parseFloat(e.target.value);
                      const newEnd = newStart + currentDuration;
                      onEffectParamsChange?.({
                        startTime: newStart,
                        endTime: newEnd,
                        duration: currentDuration,
                      });
                    }}
                    className="w-full h-1.5 bg-surface-hover rounded-lg appearance-none cursor-pointer accent-sky-400"
                  />
                </div>

                {/* End Time */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] text-muted-foreground">
                    <span>End Time</span>
                    <span className="font-mono text-foreground">{currentEndTime.toFixed(3)}s</span>
                  </div>
                  <input
                    type="range"
                    min={currentStartTime + 0.1}
                    max="60"
                    step="0.1"
                    value={currentEndTime}
                    onChange={(e) => {
                      const newEnd = parseFloat(e.target.value);
                      const newDur = Math.max(0.1, newEnd - currentStartTime);
                      onEffectParamsChange?.({
                        endTime: newEnd,
                        duration: newDur,
                      });
                    }}
                    className="w-full h-1.5 bg-surface-hover rounded-lg appearance-none cursor-pointer accent-sky-400"
                  />
                </div>

                {/* Duration */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] text-muted-foreground">
                    <span>Duration</span>
                    <span className="font-mono text-foreground">{currentDuration.toFixed(2)}s</span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="30"
                    step="0.1"
                    value={currentDuration}
                    onChange={(e) => {
                      const newDur = parseFloat(e.target.value);
                      const newEnd = currentStartTime + newDur;
                      onEffectParamsChange?.({
                        duration: newDur,
                        endTime: newEnd,
                      });
                    }}
                    className="w-full h-1.5 bg-surface-hover rounded-lg appearance-none cursor-pointer accent-sky-400"
                  />
                </div>
              </div>

              {/* INTENSITY CONTROL SECTION */}
              <div className="p-3 rounded-lg bg-surface border border-border space-y-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-foreground">Effect Intensity</span>
                  <span className="font-mono text-sky-400">{Math.round(normIntensity * 100)}%</span>
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

              {/* DYNAMIC EFFECT-SPECIFIC CONTROLS SECTION */}
              <div className="p-3 rounded-lg bg-surface border border-border space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold text-foreground border-b border-border pb-1.5">
                  <span className="flex items-center gap-1.5 text-sky-400">
                    <Sliders className="w-3.5 h-3.5" /> Effect Parameters
                  </span>
                </div>

                {/* Speed Slider */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Gauge className="w-3 h-3" /> Speed
                    </span>
                    <span className="font-mono text-foreground">{(effectParams.speed ?? 1.0).toFixed(1)}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="3.0"
                    step="0.1"
                    value={effectParams.speed ?? 1.0}
                    onChange={(e) => onEffectParamsChange?.({ speed: parseFloat(e.target.value) })}
                    className="w-full h-1.5 bg-surface-hover rounded-lg appearance-none cursor-pointer accent-sky-400"
                  />
                </div>

                {/* Amount / Scale / Magnitude Slider */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] text-muted-foreground">
                    <span>Effect Amount</span>
                    <span className="font-mono text-foreground">{Math.round(effectParams.amount ?? 50)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    value={effectParams.amount ?? 50}
                    onChange={(e) => onEffectParamsChange?.({ amount: parseFloat(e.target.value) })}
                    className="w-full h-1.5 bg-surface-hover rounded-lg appearance-none cursor-pointer accent-sky-400"
                  />
                </div>

                {/* Engine specific extra parameters if applicable */}
                {(activeAsset.engineKey?.includes('Blur') || activeAsset.name.toLowerCase().includes('blur')) && (
                  <div className="space-y-1 pt-1">
                    <div className="flex justify-between text-[10px] text-muted-foreground">
                      <span>Blur Radius</span>
                      <span className="font-mono text-foreground">{Math.round(effectParams.blur ?? 20)}px</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="1"
                      value={effectParams.blur ?? 20}
                      onChange={(e) => onEffectParamsChange?.({ blur: parseFloat(e.target.value) })}
                      className="w-full h-1.5 bg-surface-hover rounded-lg appearance-none cursor-pointer accent-sky-400"
                    />
                  </div>
                )}

                {(activeAsset.engineKey?.includes('Transform') || activeAsset.name.toLowerCase().includes('zoom') || activeAsset.name.toLowerCase().includes('scale')) && (
                  <div className="space-y-1 pt-1">
                    <div className="flex justify-between text-[10px] text-muted-foreground">
                      <span>Scale Factor</span>
                      <span className="font-mono text-foreground">{((effectParams.scale ?? 1.2) * 100).toFixed(0)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0.5"
                      max="2.5"
                      step="0.05"
                      value={effectParams.scale ?? 1.2}
                      onChange={(e) => onEffectParamsChange?.({ scale: parseFloat(e.target.value) })}
                      className="w-full h-1.5 bg-surface-hover rounded-lg appearance-none cursor-pointer accent-sky-400"
                    />
                  </div>
                )}
              </div>

              {/* REMOVE BUTTON */}
              <button
                type="button"
                onClick={handleRemoveEffect}
                className="w-full flex items-center justify-center space-x-2 py-2 px-3 text-xs font-semibold text-destructive hover:bg-destructive/10 border border-destructive/30 rounded-lg transition cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove Effect</span>
              </button>
            </div>
          ) : (
            /* Clean Empty State when no effect selected */
            <div className="flex-1 flex flex-col items-center justify-center py-16 px-4 text-center text-muted-foreground space-y-3">
              <div className="p-3.5 rounded-full bg-surface border border-border text-muted-foreground">
                <SlidersHorizontal className="w-6 h-6" />
              </div>
              <div className="space-y-1 max-w-[200px]">
                <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Adjustment</h4>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Select an effect to edit its settings.
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
