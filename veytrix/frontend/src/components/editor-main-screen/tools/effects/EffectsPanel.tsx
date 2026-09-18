// src/components/editor-main-screen/tools/effects/EffectsPanel.tsx
import React, { useState, useEffect } from 'react';
import { Sparkles, Check, RotateCcw, Zap } from 'lucide-react';
import { assetRegistry, AssetRecord } from '../../../../services/AssetRegistry';

interface EffectsPanelProps {
  activeEffectId: string | number | null;
  effectIntensity: number; // 0.0 to 1.0 or 0 to 100
  onSelectEffect: (effectId: string | number | null) => void;
  onIntensityChange: (intensity: number) => void;
}

export function EffectsPanel({
  activeEffectId,
  effectIntensity = 1.0,
  onSelectEffect,
  onIntensityChange,
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

  // Normalize intensity to 0..1 for UI calculation
  const normIntensity = effectIntensity > 1.0 ? Math.min(1.0, effectIntensity / 100) : Math.max(0, effectIntensity);

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
            onClick={() => onSelectEffect(null)}
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

      {/* Fixed Active Control Bar */}
      {activeAsset && (
        <div className="flex-shrink-0 p-2.5 rounded-lg bg-surface border border-sky-500/30 space-y-2 mb-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-sky-400 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5" />
              {activeAsset.name}
            </span>
            <span className="text-[10px] text-muted-foreground font-mono">
              {Math.round(normIntensity * 100)}%
            </span>
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
        </div>
      )}

      {/* Scrollable Effects List */}
      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden pr-1 scrollbar-thin">
        <div className="grid grid-cols-3 gap-2 pb-4">
          {/* None / Remove Effect Card */}
          <button
            type="button"
            onClick={() => onSelectEffect(null)}
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
                onClick={() => onSelectEffect(asset.name)}
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

                {asset.plan === 'Pro' && (
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
