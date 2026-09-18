// src/components/editor-main-screen/tools/transitions/TransitionsPanel.tsx
import React, { useState, useEffect } from 'react';
import { SlidersHorizontal, Check, RotateCcw, Zap, Compass, Trash2 } from 'lucide-react';
import { assetRegistry, AssetRecord } from '../../../../services/AssetRegistry';
import { AssetInteractionState, TransitionInstanceParameters } from '../../../../types/assetInteraction';
import { dissolveTransitionEngine } from './engines/dissolve/DissolveTransitionEngine';
import { cameraTransitionEngine } from './engines/camera/CameraTransitionEngine';
import { zoomTransitionEngine } from './engines/zoom/ZoomTransitionEngine';
import { slideTransitionEngine } from './engines/slide/SlideTransitionEngine';

interface TransitionsPanelProps {
  activeTransitionId: string | number | null;
  transitionDuration?: number;
  interactionState?: AssetInteractionState;
  transitionParams?: TransitionInstanceParameters;
  onSelectTransition: (transitionId: string | number | null, nextState?: AssetInteractionState) => void;
  onDurationChange?: (duration: number) => void;
  onTransitionParamsChange?: (params: Partial<TransitionInstanceParameters>) => void;
  onResetTransition?: () => void;
}

export function TransitionsPanel({
  activeTransitionId,
  transitionDuration = 1.0,
  interactionState = activeTransitionId ? 'applied-selected' : 'not-applied',
  transitionParams = {
    id: String(activeTransitionId || ''),
    assetId: activeTransitionId || '',
    assetName: String(activeTransitionId || ''),
    engineKey: 'DissolveTransitionEngine',
    duration: transitionDuration,
    direction: 'left',
    amount: 100,
  },
  onSelectTransition,
  onDurationChange,
  onTransitionParamsChange,
  onResetTransition,
}: TransitionsPanelProps) {
  const [activeTab, setActiveTab] = useState<'transitions' | 'adjustment'>('transitions');
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

  /**
   * Deterministic 3-Click Cycle Handler for Transitions:
   * Click 1 -> Apply / Select ('applied-selected')
   * Click 2 -> Open Adjustment section ('settings-open')
   * Click 3 -> Remove transition ('not-applied')
   */
  const handleAssetClick = (asset: AssetRecord) => {
    const isThisAssetActive =
      activeTransitionId !== null &&
      (String(asset.id) === String(activeTransitionId) ||
        asset.name === activeTransitionId ||
        String(activeTransitionId).trim().toLowerCase() === asset.name.trim().toLowerCase());

    if (!isThisAssetActive) {
      // CLICK 1: APPLY / SELECT
      onSelectTransition(asset.name, 'applied-selected');
    } else {
      if (interactionState === 'applied-selected') {
        // CLICK 2: OPEN ADJUSTMENT TAB
        setActiveTab('adjustment');
        onSelectTransition(asset.name, 'settings-open');
      } else if (interactionState === 'settings-open') {
        // CLICK 3: REMOVE TRANSITION
        onSelectTransition(null, 'not-applied');
        setActiveTab('transitions');
      } else {
        // Fallback re-select
        onSelectTransition(asset.name, 'applied-selected');
      }
    }
  };

  const handleRemoveTransition = () => {
    onSelectTransition(null, 'not-applied');
    setActiveTab('transitions');
  };

  const currentDuration = transitionParams.duration ?? transitionDuration ?? 1.0;

  return (
    <div className="flex flex-col h-full min-h-0 bg-background/95 text-foreground select-none p-3 overflow-hidden">
      {/* Top Header with Tab Switcher: [ Transitions ] [ Adjustment ] */}
      <div className="flex-shrink-0 flex items-center justify-between border-b border-border pb-2 mb-2">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400">
            <SlidersHorizontal className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold tracking-wide uppercase">Transitions</h3>
            <p className="text-[10px] text-muted-foreground">
              {allTransitionAssets.length > 0 ? `${allTransitionAssets.length} Video Transitions` : 'Video Transitions'}
            </p>
          </div>
        </div>

        {/* Top-Level Tabs */}
        <div className="flex items-center bg-surface p-0.5 rounded-lg border border-border">
          <button
            type="button"
            onClick={() => setActiveTab('transitions')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
              activeTab === 'transitions'
                ? 'bg-sky-500 text-white shadow-sm font-semibold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Transitions
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

      {/* OPTION 1 — TRANSITIONS LIBRARY */}
      {activeTab === 'transitions' && (
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

          {/* Clean Scrollable Transition Grid — NO inline duration sliders */}
          <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden pr-1 scrollbar-thin pt-1">
            <div className="grid grid-cols-2 gap-2 pb-4">
              {transitionAssets.map((asset) => {
                const isSelected =
                  activeTransitionId !== null &&
                  (String(activeTransitionId) === String(asset.id) ||
                    activeTransitionId === asset.name ||
                    String(activeTransitionId).trim().toLowerCase() === asset.name.trim().toLowerCase());

                return (
                  <div
                    key={asset.id}
                    onClick={() => handleAssetClick(asset)}
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
      )}

      {/* OPTION 2 — ADJUSTMENT SECTION */}
      {activeTab === 'adjustment' && (
        <div className="flex-1 flex flex-col min-h-0 overflow-y-auto pr-1 scrollbar-thin">
          {activeTransitionId && activeAsset ? (
            <div className="space-y-4 pt-1 pb-4">
              {/* Active Transition Header Info */}
              <div className="p-3 rounded-lg bg-surface border border-sky-500/30 flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 rounded-lg bg-sky-500/20 text-sky-400 border border-sky-500/30">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-foreground">{activeAsset.name}</h4>
                    <p className="text-[10px] text-sky-400/80 font-mono">{activeAsset.category} Transition</p>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  {onResetTransition && (
                    <button
                      type="button"
                      onClick={onResetTransition}
                      className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-surface transition cursor-pointer"
                      title="Reset transition parameters to default"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleRemoveTransition}
                    className="p-1.5 rounded-md text-destructive hover:bg-destructive/10 transition cursor-pointer"
                    title="Remove transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* TRANSITION DURATION CONTROL */}
              <div className="p-3 rounded-lg bg-surface border border-border space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold text-foreground border-b border-border pb-1.5">
                  <span className="text-foreground">Transition Duration</span>
                  <span className="font-mono text-sky-400">{currentDuration.toFixed(1)}s</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="5.0"
                  step="0.1"
                  value={currentDuration}
                  onChange={(e) => {
                    const dur = parseFloat(e.target.value);
                    onDurationChange?.(dur);
                    onTransitionParamsChange?.({ duration: dur });
                  }}
                  className="w-full h-1.5 bg-surface-hover rounded-lg appearance-none cursor-pointer accent-sky-500"
                />
              </div>

              {/* Direction selector if supported */}
              {['SlideTransitionEngine', 'CameraTransitionEngine'].includes(activeAsset.engineKey || '') && (
                <div className="p-3 rounded-lg bg-surface border border-border space-y-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="flex items-center gap-1.5 text-sky-400">
                      <Compass className="w-3.5 h-3.5" /> Direction
                    </span>
                    <span className="capitalize text-foreground font-mono text-[10px]">
                      {transitionParams.direction || 'Left'}
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5 pt-1">
                    {['left', 'right', 'up', 'down'].map((dir) => (
                      <button
                        key={dir}
                        type="button"
                        onClick={() => onTransitionParamsChange?.({ direction: dir })}
                        className={`py-1 text-[10px] font-semibold rounded capitalize transition cursor-pointer ${
                          (transitionParams.direction || 'left') === dir
                            ? 'bg-sky-500 text-white font-bold shadow-sm'
                            : 'bg-surface-hover text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        {dir}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* REMOVE BUTTON */}
              <button
                type="button"
                onClick={handleRemoveTransition}
                className="w-full flex items-center justify-center space-x-2 py-2 px-3 text-xs font-semibold text-destructive hover:bg-destructive/10 border border-destructive/30 rounded-lg transition cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove Transition</span>
              </button>
            </div>
          ) : (
            /* Clean Empty State when no transition selected */
            <div className="flex-1 flex flex-col items-center justify-center py-16 px-4 text-center text-muted-foreground space-y-3">
              <div className="p-3.5 rounded-full bg-surface border border-border text-muted-foreground">
                <SlidersHorizontal className="w-6 h-6" />
              </div>
              <div className="space-y-1 max-w-[200px]">
                <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Adjustment</h4>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Select a transition to edit its duration.
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
