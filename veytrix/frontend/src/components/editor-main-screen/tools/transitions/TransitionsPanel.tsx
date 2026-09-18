// src/components/editor-main-screen/tools/transitions/TransitionsPanel.tsx
import React, { useState, useEffect } from 'react';
import { SlidersHorizontal, Check, RotateCcw, Zap } from 'lucide-react';
import { assetRegistry, AssetRecord } from '../../../../services/AssetRegistry';
import { dissolveTransitionEngine } from './engines/dissolve/DissolveTransitionEngine';
import { cameraTransitionEngine } from './engines/camera/CameraTransitionEngine';
import { zoomTransitionEngine } from './engines/zoom/ZoomTransitionEngine';
import { slideTransitionEngine } from './engines/slide/SlideTransitionEngine';

interface TransitionsPanelProps {
  activeTransitionId: string | number | null;
  transitionDuration?: number;
  onSelectTransition: (transitionId: string | number | null) => void;
  onDurationChange?: (duration: number) => void;
  onResetTransition?: () => void;
}

export function TransitionsPanel({
  activeTransitionId,
  transitionDuration = 1.0,
  onSelectTransition,
  onDurationChange,
  onResetTransition,
}: TransitionsPanelProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('Basic');
  const [categories, setCategories] = useState<string[]>([]);
  const [transitionAssets, setTransitionAssets] = useState<AssetRecord[]>([]);
  const [allTransitionAssets, setAllTransitionAssets] = useState<AssetRecord[]>([]);

  useEffect(() => {
    const allTransitions = assetRegistry.getAssetsByType('Transitions');
    setAllTransitionAssets(allTransitions);
    const catList = assetRegistry.getCategories('Transitions');
    setCategories(catList);
    if (catList.length > 0 && !catList.includes('Basic')) {
      setSelectedCategory(catList[0]);
    }
  }, []);

  useEffect(() => {
    const categoryAssets = assetRegistry.getAssetsByCategory('Transitions', selectedCategory);
    setTransitionAssets(categoryAssets);
  }, [selectedCategory]);

  const activeAsset = allTransitionAssets.find(
    (a) =>
      String(a.id) === String(activeTransitionId) ||
      a.name === activeTransitionId ||
      a.name.trim().toLowerCase() === String(activeTransitionId).trim().toLowerCase()
  );

  const activeDef = activeAsset
    ? activeAsset.engineKey === 'CameraTransitionEngine'
      ? cameraTransitionEngine.getDefinition(activeAsset.name)
      : activeAsset.engineKey === 'ZoomTransitionEngine'
      ? zoomTransitionEngine.getDefinition(activeAsset.name)
      : activeAsset.engineKey === 'SlideTransitionEngine'
      ? slideTransitionEngine.getDefinition(activeAsset.name)
      : dissolveTransitionEngine.getDefinition(activeAsset.name)
    : undefined;




  return (
    <div className="flex flex-col h-full min-h-0 bg-background/95 text-foreground select-none p-3 overflow-hidden">
      {/* Fixed Header */}
      <div className="flex-shrink-0 flex items-center justify-between border-b border-border pb-2 mb-2">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400">
            <SlidersHorizontal className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold tracking-wide uppercase">Transitions Library</h3>
            <p className="text-[10px] text-muted-foreground">50 Seamless Video Transitions</p>
          </div>
        </div>

        {activeTransitionId && (
          <div className="flex items-center space-x-1">
            {onResetTransition && (
              <button
                type="button"
                onClick={onResetTransition}
                className="flex items-center space-x-1 px-2 py-1 text-[10px] font-medium text-muted-foreground hover:text-foreground hover:bg-surface rounded transition cursor-pointer"
                title="Reset transition parameters to default"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => onSelectTransition(null)}
              className="flex items-center space-x-1 px-2 py-1 text-[10px] font-medium text-destructive hover:bg-destructive/10 rounded transition cursor-pointer"
              title="Remove active transition"
            >
              <span>Remove</span>
            </button>
          </div>
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

      {/* Fixed Active Transition Control Bar */}
      {activeAsset && (
        <div className="flex-shrink-0 p-2.5 rounded-lg bg-surface border border-sky-500/30 space-y-2 mb-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-sky-400 flex items-center space-x-1">
              <Zap className="w-3.5 h-3.5" />
              <span>{activeAsset.name}</span>
            </span>
            <span className="text-[10px] font-mono text-muted-foreground">
              {activeDef?.engineKey || activeAsset.engineKey}
            </span>
          </div>

          {onDurationChange && (
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
                <span>Transition Duration</span>
                <span>{transitionDuration.toFixed(1)}s</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="4.0"
                step="0.1"
                value={transitionDuration}
                onChange={(e) => onDurationChange(parseFloat(e.target.value))}
                className="w-full accent-sky-500 h-1 bg-surface-hover rounded-lg appearance-none cursor-pointer"
              />
            </div>
          )}
        </div>
      )}

      {/* Scrollable Transition Grid */}
      <div className="flex-1 overflow-y-auto min-h-0 pr-1">
        <div className="grid grid-cols-2 gap-2">
          {transitionAssets.map((asset) => {
            const isSelected =
              String(activeTransitionId) === String(asset.id) ||
              activeTransitionId === asset.name ||
              String(activeTransitionId).trim().toLowerCase() === asset.name.trim().toLowerCase();

            return (
              <div
                key={asset.id}
                onClick={() => onSelectTransition(asset.name)}
                className={`group relative p-2.5 rounded-lg border transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-sky-500/10 border-sky-500 ring-1 ring-sky-500/50 shadow-glow'
                    : 'bg-surface hover:bg-surface-hover border-border hover:border-sky-500/40'
                }`}
              >
                <div className="flex items-start justify-between">
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/40 text-muted-foreground">
                    #{asset.id}
                  </span>
                  {isSelected ? (
                    <span className="p-0.5 rounded-full bg-sky-500 text-white">
                      <Check className="w-3 h-3" />
                    </span>
                  ) : asset.plan === 'Pro' ? (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                      PRO
                    </span>
                  ) : null}
                </div>

                <div className="my-2">
                  <h4 className="text-xs font-semibold tracking-tight text-foreground group-hover:text-sky-300 transition-colors truncate">
                    {asset.name}
                  </h4>
                  <p className="text-[9px] text-muted-foreground truncate mt-0.5">{asset.category}</p>
                </div>

                <div className="flex items-center justify-between text-[9px] text-muted-foreground border-t border-border/50 pt-1.5">
                  <span className="truncate">{asset.engineKey || 'DissolveEngine'}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
