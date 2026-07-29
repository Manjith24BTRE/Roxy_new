import React, { useState, useEffect } from 'react';
import { Search, Star, Trash2, Copy, RotateCcw, Eye, EyeOff, Clock, Sparkles, Check, ArrowUp, ArrowDown, Plus, Key, Sliders } from 'lucide-react';
import { Filters } from '../filters/Filters';
import { Transitions } from '../transitions/Transitions';
import { SAMPLE_TRANSITIONS_NEW } from '../transitions/Transitions.data';
import { EFFECT_PRESETS, EffectPreset, AppliedEffect, EffectKeyframe } from './effectsPreset';

interface EffectsProps {
  timelineClips: any[];
  currentTime: number;
  activeTransitionId: string | null;
  onSelectTransition: (id: string | null) => void;
  activeFilterId: string | null;
  onSelectFilter: (id: string | null) => void;
  filterIntensity: number;
  onFilterIntensityChange: (intensity: number) => void;
  filterOpacity?: number;
  onFilterOpacityChange?: (opacity: number) => void;
  filterBlendMode?: string;
  onFilterBlendModeChange?: (blendMode: string) => void;
  filterEnabled?: boolean;
  onFilterEnabledChange?: (enabled: boolean) => void;
  showBeforeOnly?: boolean;
  onShowBeforeOnlyChange?: (showBefore: boolean) => void;
  onHoverFilter?: (id: string | null) => void;

  effectsSubTab?: 'transitions' | 'filters' | 'effects';
  onSubTabChange?: (tab: 'transitions' | 'filters' | 'effects') => void;

  // Effects Engine Props
  activeAppliedEffectId: string | null;
  onSetActiveAppliedEffectId: (id: string | null) => void;
  onAddAppliedEffect: (presetId: string) => void;
  onDeleteAppliedEffect: (clipId: string, effectId: string) => void;
  onToggleAppliedEffect: (clipId: string, effectId: string) => void;
  onUpdateAppliedEffect: (clipId: string, effectId: string, updates: Partial<AppliedEffect>) => void;
  onDuplicateAppliedEffect: (clipId: string, effectId: string) => void;
  onReorderAppliedEffects: (clipId: string, startIndex: number, endIndex: number) => void;
  onAddEffectKeyframe?: (clipId: string, effectId: string, time: number, properties: any) => void;
  onDeleteEffectKeyframe?: (clipId: string, effectId: string, keyframeId: string) => void;
}

const CATEGORIES = [
  { id: 'all', name: '✨ All' },
  { id: 'favorites', name: '⭐ Favorites' },
  { id: 'recents', name: '🕒 Recents' },
  { id: 'Trending', name: '🔥 Trending' },
  { id: 'Basic', name: '⚙️ Basic' },
  { id: 'Camera', name: '📹 Camera' },
  { id: 'Blur', name: '💧 Blur' },
  { id: 'Glitch', name: '⚡ Glitch' },
  { id: 'Cinematic', name: '🎬 Cine' },
  { id: 'Light', name: '💡 Light' },
  { id: 'Retro', name: '📻 Retro' },
  { id: '3D', name: '👓 3D' },
  { id: 'AI', name: '🧠 AI' }
];

const BLEND_MODES = [
  { value: 'normal', label: 'Normal' },
  { value: 'screen', label: 'Screen' },
  { value: 'overlay', label: 'Overlay' },
  { value: 'multiply', label: 'Multiply' },
  { value: 'soft-light', label: 'Soft Light' },
  { value: 'hard-light', label: 'Hard Light' },
  { value: 'difference', label: 'Difference' },
  { value: 'color-dodge', label: 'Color Dodge' },
  { value: 'color-burn', label: 'Color Burn' }
];

export function Effects({
  timelineClips,
  currentTime,
  activeTransitionId,
  onSelectTransition,
  activeFilterId,
  onSelectFilter,
  filterIntensity,
  onFilterIntensityChange,
  filterOpacity = 100,
  onFilterOpacityChange,
  filterBlendMode = 'normal',
  onFilterBlendModeChange,
  filterEnabled = true,
  onFilterEnabledChange,
  showBeforeOnly = false,
  onShowBeforeOnlyChange,
  onHoverFilter,

  effectsSubTab,
  onSubTabChange,

  // Effects Engine Destructure
  activeAppliedEffectId,
  onSetActiveAppliedEffectId,
  onAddAppliedEffect,
  onDeleteAppliedEffect,
  onToggleAppliedEffect,
  onUpdateAppliedEffect,
  onDuplicateAppliedEffect,
  onReorderAppliedEffects,
  onAddEffectKeyframe,
  onDeleteEffectKeyframe
}: EffectsProps) {
  const [activeSubTab, setActiveSubTab] = useState<'transitions' | 'filters' | 'effects'>(effectsSubTab || 'effects');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    if (effectsSubTab) {
      setActiveSubTab(effectsSubTab);
    }
  }, [effectsSubTab]);

  // Favorites & Recents Persistent Storage
  const [favorites, setFavorites] = useState<string[]>([]);
  const [recents, setRecents] = useState<string[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load storage configurations on mount
  useEffect(() => {
    try {
      const savedFavorites = localStorage.getItem('veytrix_favorite_effects');
      if (savedFavorites) setFavorites(JSON.parse(savedFavorites));

      const savedRecents = localStorage.getItem('veytrix_recent_effects');
      if (savedRecents) setRecents(JSON.parse(savedRecents));
    } catch (e) {
      console.error('Failed to load effects config storage', e);
    }
  }, []);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2000);
  };

  const handleApplyPreset = (preset: EffectPreset) => {
    onAddAppliedEffect(preset.id);
    
    // Add to Recents list (limit to 10 entries)
    setRecents((prev) => {
      const filtered = prev.filter((id) => id !== preset.id);
      const updated = [preset.id, ...filtered].slice(0, 10);
      localStorage.setItem('veytrix_recent_effects', JSON.stringify(updated));
      return updated;
    });
  };

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites((prev) => {
      const updated = prev.includes(id) ? prev.filter((fId) => fId !== id) : [...prev, id];
      localStorage.setItem('veytrix_favorite_effects', JSON.stringify(updated));
      triggerToast(prev.includes(id) ? 'Removed from Favorites' : 'Added to Favorites');
      return updated;
    });
  };

  // Find active clip at playhead
  const totalDur = timelineClips.reduce((acc, c) => acc + c.duration, 0) || 5;
  const activeClip = timelineClips.find(c => currentTime >= c.timelineStart && currentTime < c.timelineStart + c.duration) || 
                     (currentTime >= totalDur ? timelineClips[timelineClips.length - 1] : timelineClips[0]);

  // Find currently selected applied effect inside the active clip
  const activeAppliedEffect = activeClip?.appliedEffects?.find((e: AppliedEffect) => e.id === activeAppliedEffectId);

  // Filter presets catalog
  const filteredPresets = EFFECT_PRESETS.filter((preset) => {
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      if (!preset.name.toLowerCase().includes(q) && !preset.description.toLowerCase().includes(q)) {
        return false;
      }
    }
    if (selectedCategory === 'favorites') {
      return favorites.includes(preset.id);
    }
    if (selectedCategory === 'recents') {
      return recents.includes(preset.id);
    }
    if (selectedCategory !== 'all') {
      return preset.category === selectedCategory;
    }
    return true;
  });

  return (
    <div className="flex flex-col h-full bg-[#090d16] text-slate-100 select-none">
      
      {/* HUD Alert alerts */}
      {toastMessage && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-sky-500 text-slate-950 px-3 py-1.5 rounded-lg text-[10px] font-bold z-50 shadow-md animate-fade-in flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 fill-current" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Sub Header Navigation */}
      <div className="p-3 border-b border-white/10 bg-[#0c101d] flex-shrink-0">
        <div className="flex border border-white/10 rounded-lg bg-slate-950/60 p-0.5">
          <button
            type="button"
            onClick={() => {
              setActiveSubTab('transitions');
              setSearchQuery('');
            }}
            className={`flex-1 py-1.5 text-[10px] font-semibold rounded-md transition cursor-pointer ${
              activeSubTab === 'transitions' ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20 shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Transitions
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveSubTab('filters');
              setSearchQuery('');
            }}
            className={`flex-1 py-1.5 text-[10px] font-semibold rounded-md transition cursor-pointer ${
              activeSubTab === 'filters' ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20 shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Filters
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveSubTab('effects');
              setSearchQuery('');
            }}
            className={`flex-1 py-1.5 text-[10px] font-semibold rounded-md transition cursor-pointer ${
              activeSubTab === 'effects' ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20 shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Effects
          </button>
        </div>
      </div>

      {/* Render Sub Tabs */}
      {activeSubTab === 'filters' && (
        <div className="flex-1 min-h-0">
          <Filters
            activeFilterId={activeFilterId}
            onSelectFilter={onSelectFilter}
            filterIntensity={filterIntensity}
            onFilterIntensityChange={onFilterIntensityChange}
            filterOpacity={filterOpacity}
            onFilterOpacityChange={onFilterOpacityChange}
            filterBlendMode={filterBlendMode}
            onFilterBlendModeChange={onFilterBlendModeChange}
            filterEnabled={filterEnabled}
            onFilterEnabledChange={onFilterEnabledChange}
            showBeforeOnly={showBeforeOnly}
            onShowBeforeOnlyChange={onShowBeforeOnlyChange}
            onHoverFilter={onHoverFilter}
          />
        </div>
      )}

      {activeSubTab === 'transitions' && (
        <div className="flex-1 min-h-0 flex flex-col">
          <div className="px-4 py-2 bg-[#090d16] flex-shrink-0 border-b border-white/5">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
              <input
                type="text"
                placeholder="Search transitions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-md bg-slate-900 border border-white/10 pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            <Transitions
              activeTransitionId={activeTransitionId}
              onSelectTransition={onSelectTransition}
              searchQuery={searchQuery}
            />
          </div>
        </div>
      )}

      {activeSubTab === 'effects' && (
        <div className="flex-1 flex flex-col min-h-0">
          
          {/* Header search bar */}
          <div className="p-3 bg-[#0c101d] border-b border-white/10 flex items-center justify-between flex-shrink-0 gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
              <input
                type="text"
                placeholder={`Search ${EFFECT_PRESETS.length} effects...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#060910] border border-white/10 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500/50 transition-colors"
              />
            </div>
            
            {/* Compare Bypass Toggle */}
            <button
              type="button"
              onMouseDown={() => onShowBeforeOnlyChange?.(true)}
              onMouseUp={() => onShowBeforeOnlyChange?.(false)}
              onMouseLeave={() => onShowBeforeOnlyChange?.(false)}
              onTouchStart={() => onShowBeforeOnlyChange?.(true)}
              onTouchEnd={() => onShowBeforeOnlyChange?.(false)}
              className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold border transition cursor-pointer flex items-center gap-1.5 flex-shrink-0 ${
                showBeforeOnly 
                  ? 'bg-amber-500 border-amber-600 text-slate-950'
                  : 'bg-slate-900 border-white/10 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <span>Compare</span>
            </button>
          </div>

          {/* Horizontal Categories switcher */}
          <div className="flex gap-1 overflow-x-auto px-3 py-2 bg-[#0a0f1b] border-b border-white/5 scrollbar-none flex-shrink-0">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1 rounded-md text-[10px] font-bold transition whitespace-nowrap cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Main Content Areas inside scroll area */}
          <div className="flex-1 overflow-y-auto p-3 space-y-4 scrollbar-thin">
            
            {/* 1. Stacking list - applied effects on active clip */}
            {activeClip && (
              <div className="space-y-2">
                <h4 className="text-[10px] uppercase font-mono tracking-wider text-slate-400 flex items-center justify-between">
                  <span>Clip FX Stack ({activeClip.appliedEffects?.length || 0})</span>
                  <span className="text-[9px] text-slate-500 normal-case">{activeClip.name}</span>
                </h4>
                
                {activeClip.appliedEffects && activeClip.appliedEffects.length > 0 ? (
                  <div className="space-y-1.5">
                    {activeClip.appliedEffects.map((eff: AppliedEffect, idx: number) => {
                      const isSelected = eff.id === activeAppliedEffectId;
                      return (
                        <div
                          key={eff.id}
                          onClick={() => onSetActiveAppliedEffectId(eff.id)}
                          className={`rounded-xl border p-2 flex items-center justify-between gap-2.5 transition cursor-pointer ${
                            isSelected 
                              ? 'bg-sky-500/10 border-sky-500/40 shadow-sm'
                              : 'bg-slate-900/40 border-white/5 hover:border-white/10'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            {/* Enable/Disable Toggle */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onToggleAppliedEffect(activeClip.id, eff.id);
                              }}
                              className="text-slate-500 hover:text-slate-300 transition p-0.5 cursor-pointer"
                            >
                              {eff.enabled ? <Eye className="h-3.5 w-3.5 text-sky-400" /> : <EyeOff className="h-3.5 w-3.5" />}
                            </button>
                            
                            <div className="truncate">
                              <span className="text-[10px] font-bold text-slate-200 block truncate">{eff.name}</span>
                              <span className="text-[8px] text-slate-500 block truncate uppercase">{eff.category}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            {/* Reorder Up */}
                            <button
                              type="button"
                              disabled={idx === 0}
                              onClick={(e) => {
                                e.stopPropagation();
                                onReorderAppliedEffects(activeClip.id, idx, idx - 1);
                              }}
                              className="text-slate-600 hover:text-slate-400 disabled:opacity-20 cursor-pointer p-0.5"
                            >
                              <ArrowUp className="h-3 w-3" />
                            </button>
                            
                            {/* Reorder Down */}
                            <button
                              type="button"
                              disabled={idx === activeClip.appliedEffects.length - 1}
                              onClick={(e) => {
                                e.stopPropagation();
                                onReorderAppliedEffects(activeClip.id, idx, idx + 1);
                              }}
                              className="text-slate-600 hover:text-slate-400 disabled:opacity-20 cursor-pointer p-0.5"
                            >
                              <ArrowDown className="h-3 w-3" />
                            </button>

                            {/* Duplicate */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onDuplicateAppliedEffect(activeClip.id, eff.id);
                              }}
                              className="text-slate-500 hover:text-slate-300 cursor-pointer p-0.5"
                              title="Duplicate effect layer"
                            >
                              <Copy className="h-3 w-3" />
                            </button>

                            {/* Trash Delete */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteAppliedEffect(activeClip.id, eff.id);
                              }}
                              className="text-slate-500 hover:text-red-400 cursor-pointer p-0.5"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="border border-dashed border-white/5 rounded-xl p-4 text-center text-[10px] text-slate-500 italic">
                    No effects applied to this clip. Select a preset below.
                  </div>
                )}
              </div>
            )}

            {/* 2. Adjustments and Keyframes Panel for Selected FX */}
            {activeClip && activeAppliedEffect && (
              <div className="rounded-xl border border-sky-500/20 bg-sky-500/[0.03] p-3 space-y-3.5">
                
                {/* Header Menu controls */}
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-sky-400 uppercase tracking-wide">
                    <Sliders className="h-3.5 w-3.5" />
                    <span>{activeAppliedEffect.name} Adjust</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, {
                        intensity: 60,
                        opacity: 100,
                        speed: 50,
                        angle: 0,
                        blendMode: 'normal'
                      });
                      triggerToast('Effect settings reset');
                    }}
                    className="text-slate-500 hover:text-slate-300 transition flex items-center gap-0.5 text-[8.5px] uppercase font-black cursor-pointer"
                  >
                    <RotateCcw className="h-2.5 w-2.5" /> Reset
                  </button>
                </div>

                {/* Adjustments Options Sliders */}
                <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
                  
                  {/* Intensity */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] text-slate-400">
                      <span>Intensity</span>
                      <span className="font-mono text-sky-400">{activeAppliedEffect.intensity}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={activeAppliedEffect.intensity}
                      onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { intensity: Number(e.target.value) })}
                      className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                    />
                  </div>

                  {/* Opacity */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] text-slate-400">
                      <span>Opacity</span>
                      <span className="font-mono text-sky-400">{activeAppliedEffect.opacity}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={activeAppliedEffect.opacity}
                      onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { opacity: Number(e.target.value) })}
                      className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                    />
                  </div>

                  {/* Speed */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] text-slate-400">
                      <span>Speed</span>
                      <span className="font-mono text-sky-400">{activeAppliedEffect.speed}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={activeAppliedEffect.speed}
                      onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { speed: Number(e.target.value) })}
                      className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                    />
                  </div>

                  {/* Angle */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] text-slate-400">
                      <span>Angle</span>
                      <span className="font-mono text-sky-400">{activeAppliedEffect.angle}°</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="360"
                      value={activeAppliedEffect.angle}
                      onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { angle: Number(e.target.value) })}
                      className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                    />
                  </div>

                  {/* Camera Category specific settings */}
                  {activeAppliedEffect.category === 'Camera' && (
                    <>
                      {/* Distance */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Distance</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.distance ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.distance ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { distance: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Smoothness */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Smoothness</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.smoothness ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.smoothness ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { smoothness: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Motion Strength */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Motion Strength</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.motionStrength ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.motionStrength ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { motionStrength: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Zoom Amount */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Zoom Amount</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.zoomAmount ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.zoomAmount ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { zoomAmount: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Blur Amount */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Blur Amount</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.blurAmount ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.blurAmount ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { blurAmount: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Rotation */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Rotation</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.rotation ?? 0)}°</span>
                        </div>
                        <input
                          type="range"
                          min="-180"
                          max="180"
                          value={activeAppliedEffect.rotation ?? 0}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { rotation: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>
                    </>
                  )}

                  {/* Blur Category specific settings */}
                  {activeAppliedEffect.category === 'Blur' && (
                    <>
                      {/* Blur Radius */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Blur Radius</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.blurRadius ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.blurRadius ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { blurRadius: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Feather */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Feather</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.feather ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.feather ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { feather: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Focus Distance */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Focus Distance</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.focusDistance ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.focusDistance ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { focusDistance: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Focus Size */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Focus Size</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.focusSize ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.focusSize ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { focusSize: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>
                    </>
                  )}

                  {/* Glitch Category specific settings */}
                  {activeAppliedEffect.category === 'Glitch' && (
                    <>
                      {/* RGB Offset */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>RGB Offset</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.rgbOffset ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.rgbOffset ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { rgbOffset: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Distortion Amount */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Distortion Amount</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.distortionAmount ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.distortionAmount ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { distortionAmount: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Noise Amount */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Noise Amount</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.noiseAmount ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.noiseAmount ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { noiseAmount: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Flicker Speed */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Flicker Speed</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.flickerSpeed ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.flickerSpeed ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { flickerSpeed: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Scan Line Density */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Scan Line Density</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.scanlineDensity ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.scanlineDensity ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { scanlineDensity: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Block Size */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Block Size</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.blockSize ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.blockSize ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { blockSize: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Pixel Size */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Pixel Size</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.pixelSize ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.pixelSize ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { pixelSize: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Color Shift */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Color Shift</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.colorShift ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.colorShift ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { colorShift: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Glitch Frequency */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Glitch Frequency</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.glitchFrequency ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.glitchFrequency ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { glitchFrequency: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>
                    </>
                  )}

                  {/* Cinematic Category specific settings */}
                  {activeAppliedEffect.category === 'Cinematic' && (
                    <>
                      {/* Brightness */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Brightness</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.brightness ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.brightness ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { brightness: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Contrast */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Contrast</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.contrast ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.contrast ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { contrast: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Saturation */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Saturation</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.saturation ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.saturation ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { saturation: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Temperature */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Temperature</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.temperature ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.temperature ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { temperature: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Tint */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Tint</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.tint ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.tint ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { tint: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Glow Amount */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Glow Amount</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.glowAmount ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.glowAmount ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { glowAmount: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Grain Amount */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Grain Amount</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.grainAmount ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.grainAmount ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { grainAmount: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Flare Size */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Flare Size</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.flareSize ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.flareSize ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { flareSize: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Flare Position */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Flare Position</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.flarePosition ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.flarePosition ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { flarePosition: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Vignette Amount */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Vignette Amount</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.vignetteAmount ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.vignetteAmount ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { vignetteAmount: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Letterbox Size */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Letterbox Size</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.letterboxSize ?? 25)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.letterboxSize ?? 25}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { letterboxSize: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>
                    </>
                  )}

                  {/* Lens Category specific settings */}
                  {activeAppliedEffect.category === 'Lens' && (
                    <>
                      {/* Distortion Amount */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Distortion Amount</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.distortionAmount ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.distortionAmount ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { distortionAmount: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Zoom Amount */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Zoom Amount</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.zoomAmount ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.zoomAmount ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { zoomAmount: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Focus Distance */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Focus Distance</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.focusDistance ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.focusDistance ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { focusDistance: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Focus Radius */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Focus Radius</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.focusRadius ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.focusRadius ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { focusRadius: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Blur Radius */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Blur Radius</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.blurRadius ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.blurRadius ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { blurRadius: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Refraction Strength */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Refraction Strength</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.refractionStrength ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.refractionStrength ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { refractionStrength: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Reflection Strength */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Reflection Strength</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.reflectionStrength ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.reflectionStrength ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { reflectionStrength: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Glow Amount */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Glow Amount</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.glowAmount ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.glowAmount ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { glowAmount: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Chromatic Offset */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Chromatic Offset</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.chromaticOffset ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.chromaticOffset ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { chromaticOffset: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Lens Radius */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Lens Radius</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.lensRadius ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.lensRadius ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { lensRadius: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Vignette Amount */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Vignette Amount</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.vignetteAmount ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.vignetteAmount ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { vignetteAmount: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>
                    </>
                  )}

                  {/* Light Category specific settings */}
                  {activeAppliedEffect.category === 'Light' && (
                    <>
                      {/* Brightness */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Brightness</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.brightness ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.brightness ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { brightness: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Glow Amount */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Glow Amount</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.glowAmount ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.glowAmount ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { glowAmount: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Bloom Radius */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Bloom Radius</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.bloomRadius ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.bloomRadius ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { bloomRadius: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Bloom Threshold */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Bloom Threshold</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.bloomThreshold ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.bloomThreshold ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { bloomThreshold: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Exposure */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Exposure</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.exposure ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.exposure ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { exposure: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Temperature */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Temperature</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.temperature ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.temperature ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { temperature: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Tint */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Tint</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.tint ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.tint ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { tint: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Saturation */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Saturation</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.saturation ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.saturation ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { saturation: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Contrast */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Contrast</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.contrast ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.contrast ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { contrast: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Light Radius */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Light Radius</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.lightRadius ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.lightRadius ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { lightRadius: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Light Position */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Light Position</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.lightPosition ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.lightPosition ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { lightPosition: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Light Angle */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Light Angle</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.lightAngle ?? 50)}°</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="360"
                          value={activeAppliedEffect.lightAngle ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { lightAngle: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Falloff */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Falloff</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.falloff ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.falloff ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { falloff: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Light Color */}
                      <div className="space-y-0.5 col-span-2">
                        <span className="text-[9px] text-slate-400 block">Light Color</span>
                        <input
                          type="color"
                          value={activeAppliedEffect.lightColor ?? '#ffffff'}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { lightColor: e.target.value })}
                          className="w-full bg-[#060910] border border-white/10 rounded h-6 px-1 py-0.5 cursor-pointer"
                        />
                      </div>
                    </>
                  )}

                  {/* Distortion Category specific settings */}
                  {activeAppliedEffect.category === 'Distortion' && (
                    <>
                      {/* Distortion Strength */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Distortion Strength</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.distortionStrength ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.distortionStrength ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { distortionStrength: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Wave Size */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Wave Size</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.waveSize ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.waveSize ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { waveSize: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Wave Speed */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Wave Speed</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.waveSpeed ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.waveSpeed ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { waveSpeed: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Ripple Radius */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Ripple Radius</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.rippleRadius ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.rippleRadius ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { rippleRadius: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Ripple Speed */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Ripple Speed</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.rippleSpeed ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.rippleSpeed ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { rippleSpeed: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Frequency */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Frequency</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.frequency ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.frequency ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { frequency: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Amplitude */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Amplitude</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.amplitude ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.amplitude ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { amplitude: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Radius */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Radius</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.radius ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.radius ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { radius: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Refraction Amount */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Refraction Amount</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.refractionAmount ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.refractionAmount ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { refractionAmount: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Stretch Amount */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Stretch Amount</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.stretchAmount ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.stretchAmount ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { stretchAmount: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Twist Amount */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Twist Amount</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.twistAmount ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.twistAmount ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { twistAmount: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Flow Direction */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Flow Direction</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.flowDirection ?? 50)}°</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="360"
                          value={activeAppliedEffect.flowDirection ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { flowDirection: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>
                    </>
                  )}

                  {/* Retro Category specific settings */}
                  {activeAppliedEffect.category === 'Retro' && (
                    <>
                      {/* Grain Amount */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Grain Amount</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.grainAmount ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.grainAmount ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { grainAmount: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Dust Amount */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Dust Amount</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.dustAmount ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.dustAmount ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { dustAmount: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Scratch Amount */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Scratch Amount</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.scratchAmount ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.scratchAmount ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { scratchAmount: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Brightness */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Brightness</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.brightness ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.brightness ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { brightness: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Contrast */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Contrast</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.contrast ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.contrast ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { contrast: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Saturation */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Saturation</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.saturation ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.saturation ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { saturation: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Warmth */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Warmth</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.warmth ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.warmth ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { warmth: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Fade */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Fade</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.fade ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.fade ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { fade: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Vignette */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Vignette</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.vignetteAmount ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.vignetteAmount ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { vignetteAmount: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Flicker Speed */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Flicker Speed</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.flickerSpeed ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.flickerSpeed ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { flickerSpeed: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Noise Amount */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Noise Amount</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.noiseAmount ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.noiseAmount ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { noiseAmount: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Blur */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Blur</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.blurRadius ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.blurRadius ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { blurRadius: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>
                    </>
                  )}

                  {/* VHS Category specific settings */}
                  {activeAppliedEffect.category === 'VHS' && (
                    <>
                      {/* Noise Amount */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Noise Amount</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.noiseAmount ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.noiseAmount ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { noiseAmount: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Grain Amount */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Grain Amount</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.grainAmount ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.grainAmount ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { grainAmount: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Tracking Amount */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Tracking Amount</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.trackingAmount ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.trackingAmount ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { trackingAmount: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* RGB Offset */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>RGB Offset</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.rgbOffset ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.rgbOffset ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { rgbOffset: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Horizontal Shift */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Horizontal Shift</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.horizontalShift ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.horizontalShift ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { horizontalShift: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Vertical Shift */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Vertical Shift</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.verticalShift ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.verticalShift ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { verticalShift: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Blur Amount */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Blur Amount</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.blurRadius ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.blurRadius ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { blurRadius: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Flicker Amount */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Flicker Amount</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.flickerSpeed ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.flickerSpeed ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { flickerSpeed: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Distortion Strength */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Distortion Strength</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.distortionStrength ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.distortionStrength ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { distortionStrength: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Tape Damage */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Tape Damage</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.tapeDamage ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.tapeDamage ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { tapeDamage: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Static Density */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Static Density</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.staticDensity ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.staticDensity ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { staticDensity: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Wave Strength */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Wave Strength</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.waveStrength ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.waveStrength ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { waveStrength: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Saturation */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Saturation</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.saturation ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.saturation ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { saturation: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Brightness */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Brightness</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.brightness ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.brightness ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { brightness: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Contrast */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Contrast</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.contrast ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.contrast ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { contrast: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>
                    </>
                  )}

                  {/* CRT Category specific settings */}
                  {activeAppliedEffect.category === 'CRT' && (
                    <>
                      {/* Curvature */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Curvature</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.curvature ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.curvature ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { curvature: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Scanline Density */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Scanline Density</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.scanlineDensity ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.scanlineDensity ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { scanlineDensity: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Scanline Thickness */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Scanline Thickness</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.scanlineThickness ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.scanlineThickness ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { scanlineThickness: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* RGB Offset */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>RGB Offset</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.rgbOffset ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.rgbOffset ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { rgbOffset: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Noise Amount */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Noise Amount</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.noiseAmount ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.noiseAmount ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { noiseAmount: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Bloom Amount */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Bloom Amount</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.bloomAmount ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.bloomAmount ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { bloomAmount: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Glow Amount */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Glow Amount</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.glowAmount ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.glowAmount ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { glowAmount: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Distortion Strength */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Distortion Strength</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.distortionStrength ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.distortionStrength ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { distortionStrength: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Flicker Speed */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Flicker Speed</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.flickerSpeed ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.flickerSpeed ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { flickerSpeed: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Reflection Strength */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Reflection Strength</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.reflectionStrength ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.reflectionStrength ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { reflectionStrength: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Brightness */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Brightness</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.brightness ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.brightness ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { brightness: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Contrast */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Contrast</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.contrast ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.contrast ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { contrast: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Saturation */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Saturation</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.saturation ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.saturation ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { saturation: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Glass Opacity */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Glass Opacity</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.glassOpacity ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.glassOpacity ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { glassOpacity: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>
                    </>
                  )}

                  {/* Neon Category specific settings */}
                  {activeAppliedEffect.category === 'Neon' && (
                    <>
                      {/* Glow Color Preset Grid & Picker */}
                      <div className="space-y-1 col-span-2">
                        <span className="text-[9px] text-slate-400 block font-semibold">Neon Glow Color</span>
                        <div className="grid grid-cols-4 gap-1">
                          {[
                            { name: 'Cyan', hex: '#00f2fe' },
                            { name: 'Blue', hex: '#0070f3' },
                            { name: 'Purple', hex: '#7928ca' },
                            { name: 'Pink', hex: '#ff007f' },
                            { name: 'Magenta', hex: '#ff0080' },
                            { name: 'Red', hex: '#ff0000' },
                            { name: 'Orange', hex: '#ff7a00' },
                            { name: 'Yellow', hex: '#ffea00' },
                            { name: 'Lime', hex: '#a6ff00' },
                            { name: 'Green', hex: '#00ff66' },
                            { name: 'Emerald', hex: '#10b981' },
                            { name: 'Aqua', hex: '#00ffff' },
                            { name: 'White', hex: '#ffffff' },
                            { name: 'Rainbow', hex: 'rainbow' }
                          ].map((c) => (
                            <button
                              type="button"
                              key={c.name}
                              onClick={() => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { glowColor: c.hex })}
                              className={`text-[8px] py-0.5 px-1 rounded border transition font-medium truncate ${
                                activeAppliedEffect.glowColor === c.hex
                                  ? 'border-sky-500 bg-sky-500/20 text-white font-bold'
                                  : 'border-white/5 bg-slate-900/60 text-slate-400 hover:border-white/10'
                              }`}
                              title={c.name}
                            >
                              <span 
                                className="inline-block w-1.5 h-1.5 rounded-full mr-1"
                                style={c.hex !== 'rainbow' ? { backgroundColor: c.hex } : { backgroundImage: 'linear-gradient(90deg, red, yellow, green, cyan, blue, magenta)' }}
                              />
                              {c.name}
                            </button>
                          ))}
                          {/* Custom Color Input */}
                          <div className="flex items-center gap-1 border border-white/5 bg-slate-900/60 rounded px-1 py-0.5 col-span-2">
                            <input
                              type="color"
                              value={activeAppliedEffect.glowColor && activeAppliedEffect.glowColor !== 'rainbow' ? activeAppliedEffect.glowColor : '#00f2fe'}
                              onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { glowColor: e.target.value })}
                              className="w-3.5 h-3.5 border-0 bg-transparent cursor-pointer p-0"
                            />
                            <span className="text-[7.5px] text-slate-400 font-mono">Custom Picker</span>
                          </div>
                        </div>
                      </div>

                      {/* Intensity */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Intensity</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.intensity ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.intensity ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { intensity: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Glow Strength */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Glow Strength</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.glowStrength ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.glowStrength ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { glowStrength: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Glow Radius */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Glow Radius</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.glowRadius ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.glowRadius ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { glowRadius: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Bloom Radius */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Bloom Radius</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.bloomRadius ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.bloomRadius ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { bloomRadius: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Glow Softness */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Glow Softness</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.glowSoftness ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.glowSoftness ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { glowSoftness: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Glow Threshold */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Glow Threshold</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.glowThreshold ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.glowThreshold ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { glowThreshold: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Edge Glow */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Edge Glow</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.edgeGlow ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.edgeGlow ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { edgeGlow: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Saturation */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Saturation</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.saturation ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.saturation ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { saturation: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Brightness */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Brightness</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.brightness ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.brightness ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { brightness: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Contrast */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Contrast</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.contrast ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.contrast ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { contrast: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Exposure */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Exposure</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.exposure ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.exposure ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { exposure: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Color Temperature */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Color Temperature</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.temperature ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.temperature ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { temperature: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Hue */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Hue Shift</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.hue ?? 0)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.hue ?? 0}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { hue: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Opacity */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Opacity</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.opacity ?? 100)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.opacity ?? 100}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { opacity: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Blend Amount */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Blend Amount</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.blendAmount ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.blendAmount ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { blendAmount: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>
                    </>
                  )}

                  {/* Fire Category specific settings */}
                  {activeAppliedEffect.category === 'Fire' && (
                    <>
                      {/* Fire Color Picker */}
                      <div className="space-y-1 col-span-2">
                        <span className="text-[9px] text-slate-400 block font-semibold">Fire Color</span>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={activeAppliedEffect.fireColor || '#ff5500'}
                            onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { fireColor: e.target.value })}
                            className="w-6 h-6 border border-white/10 bg-transparent cursor-pointer rounded"
                          />
                          <span className="text-[8px] text-slate-400 font-mono">Custom Flame Color</span>
                        </div>
                      </div>

                      {/* Intensity */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Intensity</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.intensity ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.intensity ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { intensity: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Flame Height */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Flame Height</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.flameHeight ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.flameHeight ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { flameHeight: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Flame Width */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Flame Width</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.flameWidth ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.flameWidth ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { flameWidth: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Flame Speed */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Flame Speed</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.flameSpeed ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.flameSpeed ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { flameSpeed: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Flicker Speed */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Flicker Speed</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.flickerSpeed ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.flickerSpeed ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { flickerSpeed: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Heat Distortion */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Heat Distortion</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.heatDistortion ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.heatDistortion ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { heatDistortion: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Glow Strength */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Glow Strength</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.glowStrength ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.glowStrength ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { glowStrength: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Ember Density */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Ember Density</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.emberDensity ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.emberDensity ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { emberDensity: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Spark Amount */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Spark Amount</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.sparkAmount ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.sparkAmount ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { sparkAmount: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Smoke Density */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Smoke Density</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.smokeDensity ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.smokeDensity ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { smokeDensity: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Brightness */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Brightness</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.brightness ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.brightness ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { brightness: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Contrast */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Contrast</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.contrast ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.contrast ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { contrast: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Saturation */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Saturation</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.saturation ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.saturation ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { saturation: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Temperature */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Temperature</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.temperature ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.temperature ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { temperature: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Opacity */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Opacity</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.opacity ?? 100)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.opacity ?? 100}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { opacity: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Wind Strength */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Wind Strength</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.windStrength ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.windStrength ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { windStrength: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Flame Direction Selection */}
                      <div className="space-y-0.5">
                        <span className="text-[9px] text-slate-400 block">Flame Direction</span>
                        <select
                          value={activeAppliedEffect.flameDirection || 'up'}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { flameDirection: e.target.value })}
                          className="w-full bg-[#060910] border border-white/10 rounded px-1.5 py-0.5 text-[9px] text-slate-300 focus:outline-none focus:border-sky-500/50"
                        >
                          <option value="up">Upward</option>
                          <option value="down">Downward</option>
                          <option value="left">Leftward</option>
                          <option value="right">Rightward</option>
                        </select>
                      </div>

                      {/* Turbulence */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Turbulence</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.turbulence ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.turbulence ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { turbulence: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Spread */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Spread</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.spread ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.spread ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { spread: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Feather */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Feather</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.feather ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.feather ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { feather: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Softness */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Softness</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.softness ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.softness ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { softness: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Blend Amount */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Blend Amount</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.blendAmount ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.blendAmount ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { blendAmount: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>
                    </>
                  )}

                  {/* Smoke Category specific settings */}
                  {activeAppliedEffect.category === 'Smoke' && (
                    <>
                      {/* Smoke Color Picker */}
                      <div className="space-y-1 col-span-2">
                        <span className="text-[9px] text-slate-400 block font-semibold">Smoke Color</span>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={activeAppliedEffect.smokeColor || '#ffffff'}
                            onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { smokeColor: e.target.value })}
                            className="w-6 h-6 border border-white/10 bg-transparent cursor-pointer rounded"
                          />
                          <span className="text-[8px] text-slate-400 font-mono">Custom Smoke Color</span>
                        </div>
                      </div>

                      {/* Intensity */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Intensity</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.intensity ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.intensity ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { intensity: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Smoke Density */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Smoke Density</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.smokeDensity ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.smokeDensity ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { smokeDensity: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Opacity */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Opacity</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.opacity ?? 80)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.opacity ?? 80}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { opacity: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Flow Speed */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Flow Speed</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.flowSpeed ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.flowSpeed ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { flowSpeed: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Turbulence */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Turbulence</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.turbulence ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.turbulence ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { turbulence: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Swirl Amount */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Swirl Amount</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.swirlAmount ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.swirlAmount ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { swirlAmount: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Spread */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Spread</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.spread ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.spread ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { spread: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Size */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Size</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.size ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.size ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { size: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Feather */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Feather</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.feather ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.feather ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { feather: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Softness */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Softness</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.softness ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.softness ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { softness: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Brightness */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Brightness</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.brightness ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.brightness ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { brightness: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Contrast */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Contrast</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.contrast ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.contrast ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { contrast: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Saturation */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Saturation</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.saturation ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.saturation ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { saturation: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Wind Strength */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Wind Strength</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.windStrength ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.windStrength ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { windStrength: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Fade In */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Fade In</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.fadeIn ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.fadeIn ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { fadeIn: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Fade Out */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Fade Out</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.fadeOut ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.fadeOut ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { fadeOut: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Layer Amount */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Layer Amount</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.layerAmount ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.layerAmount ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { layerAmount: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Animation Speed */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Animation Speed</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.animationSpeed ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.animationSpeed ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { animationSpeed: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>
                    </>
                  )}

                  {/* Weather Category specific settings */}
                  {activeAppliedEffect.category === 'Weather' && (
                    <>
                      {/* Weather Color Tint Picker */}
                      <div className="space-y-1 col-span-2">
                        <span className="text-[9px] text-slate-400 block font-semibold">Color Tint</span>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={activeAppliedEffect.colorTint || '#ffffff'}
                            onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { colorTint: e.target.value })}
                            className="w-6 h-6 border border-white/10 bg-transparent cursor-pointer rounded"
                          />
                          <span className="text-[8px] text-slate-400 font-mono">Environment Tint</span>
                        </div>
                      </div>

                      {/* Intensity */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Intensity</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.intensity ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.intensity ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { intensity: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Particle Density */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Particle Density</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.particleDensity ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.particleDensity ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { particleDensity: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Wind Speed */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Wind Speed</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.windSpeed ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.windSpeed ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { windSpeed: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Wind Direction (degrees) */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Wind Direction</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.windDirection ?? 90)}°</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="360"
                          value={activeAppliedEffect.windDirection ?? 90}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { windDirection: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Particle Size */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Particle Size</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.particleSize ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.particleSize ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { particleSize: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Particle Speed */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Particle Speed</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.particleSpeed ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.particleSpeed ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { particleSpeed: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Opacity */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Opacity</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.opacity ?? 100)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.opacity ?? 100}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { opacity: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Environment Light */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Environment Light</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.environmentLight ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.environmentLight ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { environmentLight: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Atmospheric Depth */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Atmospheric Depth</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.atmosphericDepth ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.atmosphericDepth ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { atmosphericDepth: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Fog Density (mapped to smokeDensity) */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Fog Density</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.smokeDensity ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.smokeDensity ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { smokeDensity: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Rain Amount */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Rain Amount</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.rainAmount ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.rainAmount ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { rainAmount: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Snow Amount */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Snow Amount</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.snowAmount ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.snowAmount ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { snowAmount: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Lightning Frequency */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Lightning Frequency</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.lightningFrequency ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.lightningFrequency ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { lightningFrequency: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Cloud Coverage */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Cloud Coverage</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.cloudCoverage ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.cloudCoverage ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { cloudCoverage: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Shadow Strength */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Shadow Strength</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.shadowStrength ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.shadowStrength ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { shadowStrength: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Motion Blur */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Motion Blur</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.motionBlur ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.motionBlur ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { motionBlur: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Blend Amount */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Blend Amount</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.blendAmount ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.blendAmount ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { blendAmount: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>
                    </>
                  )}

                  {/* Particles Category specific settings */}
                  {activeAppliedEffect.category === 'Particles' && (
                    <>
                      {/* Particles Color Picker */}
                      <div className="space-y-1 col-span-2">
                        <span className="text-[9px] text-slate-400 block font-semibold">Particle Color</span>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={activeAppliedEffect.particlesColor || '#ffffff'}
                            onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { particlesColor: e.target.value })}
                            className="w-6 h-6 border border-white/10 bg-transparent cursor-pointer rounded"
                          />
                          <span className="text-[8px] text-slate-400 font-mono">Custom Particles Color</span>
                        </div>
                      </div>

                      {/* Intensity */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Intensity</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.intensity ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.intensity ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { intensity: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Particle Count */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Particle Count</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.particleCount ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.particleCount ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { particleCount: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Particle Size */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Particle Size</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.particleSize ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.particleSize ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { particleSize: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Size Variation */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Size Variation</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.sizeVariation ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.sizeVariation ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { sizeVariation: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Particle Speed */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Particle Speed</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.particleSpeed ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.particleSpeed ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { particleSpeed: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Gravity */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Gravity</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.gravity ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.gravity ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { gravity: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Wind Strength */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Wind Strength</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.windStrength ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.windStrength ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { windStrength: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Turbulence */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Turbulence</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.turbulence ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.turbulence ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { turbulence: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Lifetime */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Lifetime</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.lifetime ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.lifetime ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { lifetime: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Spawn Rate */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Spawn Rate</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.spawnRate ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.spawnRate ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { spawnRate: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Opacity */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Opacity</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.opacity ?? 100)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.opacity ?? 100}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { opacity: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Glow Strength */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Glow Strength</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.glowStrength ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.glowStrength ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { glowStrength: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Motion Blur */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Motion Blur</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.motionBlur ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.motionBlur ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { motionBlur: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Rotation Speed */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Rotation Speed</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.rotationSpeed ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.rotationSpeed ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { rotationSpeed: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Spread */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Spread</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.spread ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.spread ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { spread: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Randomness */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Randomness</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.randomness ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.randomness ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { randomness: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Color Variation */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Color Variation</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.colorVariation ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.colorVariation ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { colorVariation: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Blend Amount */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Blend Amount</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.blendAmount ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.blendAmount ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { blendAmount: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>
                    </>
                  )}

                  {/* Nature Category specific settings */}
                  {activeAppliedEffect.category === 'Nature' && (
                    <>
                      {/* Nature Color Tint Picker */}
                      <div className="space-y-1 col-span-2">
                        <span className="text-[9px] text-slate-400 block font-semibold">Environment Color Tint</span>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={activeAppliedEffect.natureColorTint || '#ffffff'}
                            onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { natureColorTint: e.target.value })}
                            className="w-6 h-6 border border-white/10 bg-transparent cursor-pointer rounded"
                          />
                          <span className="text-[8px] text-slate-400 font-mono">Ecosystem Tint</span>
                        </div>
                      </div>

                      {/* Intensity */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Intensity</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.intensity ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.intensity ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { intensity: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Environment Density */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Environment Density</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.environmentDensity ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.environmentDensity ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { environmentDensity: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Wind Speed */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Wind Speed</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.windSpeed ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.windSpeed ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { windSpeed: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Wind Direction (degrees) */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Wind Direction</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.windDirection ?? 90)}°</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="360"
                          value={activeAppliedEffect.windDirection ?? 90}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { windDirection: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Leaf Density */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Leaf Density</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.leafDensity ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.leafDensity ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { leafDensity: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Leaf Size */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Leaf Size</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.leafSize ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.leafSize ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { leafSize: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Bird Count */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Bird Count</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.birdCount ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.birdCount ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { birdCount: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Butterfly Count */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Butterfly Count</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.butterflyCount ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.butterflyCount ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { butterflyCount: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Firefly Count */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Firefly Count</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.fireflyCount ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.fireflyCount ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { fireflyCount: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Flower Density */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Flower Density</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.flowerDensity ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.flowerDensity ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { flowerDensity: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Grass Movement */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Grass Movement</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.grassMovement ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.grassMovement ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { grassMovement: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Water Speed */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Water Speed</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.waterSpeed ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.waterSpeed ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { waterSpeed: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Water Strength */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Water Strength</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.waterStrength ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.waterStrength ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { waterStrength: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Cloud Density */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Cloud Density</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.cloudDensity ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.cloudDensity ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { cloudDensity: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Cloud Speed */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Cloud Speed</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.cloudSpeed ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.cloudSpeed ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { cloudSpeed: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Fog Density (mapped to smokeDensity) */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Fog Density</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.smokeDensity ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.smokeDensity ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { smokeDensity: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Sunlight Intensity */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Sunlight Intensity</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.sunlightIntensity ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.sunlightIntensity ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { sunlightIntensity: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Light Rays */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Light Rays</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.lightRays ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.lightRays ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { lightRays: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Bloom */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Bloom</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.bloom ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.bloom ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { bloom: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Brightness */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Brightness</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.brightness ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.brightness ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { brightness: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Contrast */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Contrast</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.contrast ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.contrast ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { contrast: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Saturation */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Saturation</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.saturation ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.saturation ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { saturation: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Temperature */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Temperature</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.temperature ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.temperature ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { temperature: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Hue */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Hue</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.hue ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.hue ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { hue: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Shadow Strength */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Shadow Strength</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.shadowStrength ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.shadowStrength ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { shadowStrength: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Depth (mapped to atmosphericDepth) */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Depth</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.atmosphericDepth ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.atmosphericDepth ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { atmosphericDepth: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Blur */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Blur</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.blur ?? 0)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.blur ?? 0}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { blur: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Opacity */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Opacity</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.opacity ?? 100)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.opacity ?? 100}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { opacity: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Blend Amount */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Blend Amount</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.blendAmount ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.blendAmount ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { blendAmount: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>
                    </>
                  )}

                  {/* Dream Category specific settings */}
                  {activeAppliedEffect.category === 'Dream' && (
                    <>
                      {/* Dream Color Tint Picker */}
                      <div className="space-y-1 col-span-2">
                        <span className="text-[9px] text-slate-400 block font-semibold">Dream Color Tint</span>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={activeAppliedEffect.dreamColorTint || '#ffffff'}
                            onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { dreamColorTint: e.target.value })}
                            className="w-6 h-6 border border-white/10 bg-transparent cursor-pointer rounded"
                          />
                          <span className="text-[8px] text-slate-400 font-mono">Surreal Glow Tint</span>
                        </div>
                      </div>

                      {/* Intensity */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Intensity</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.intensity ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.intensity ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { intensity: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Glow Strength */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Glow Strength</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.glowStrength ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.glowStrength ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { glowStrength: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Bloom Radius */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Bloom Radius</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.bloomRadius ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.bloomRadius ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { bloomRadius: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Soft Focus */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Soft Focus</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.softFocus ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.softFocus ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { softFocus: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Blur Amount */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Blur Amount</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.blur ?? 0)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.blur ?? 0}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { blur: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Haze Density */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Haze Density</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.hazeDensity ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.hazeDensity ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { hazeDensity: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Fog Density (mapped to smokeDensity) */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Fog Density</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.smokeDensity ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.smokeDensity ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { smokeDensity: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Particle Density */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Particle Density</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.particleDensity ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.particleDensity ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { particleDensity: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Sparkle Amount (mapped to sparkleAmount) */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Sparkle Amount</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.sparkleAmount ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.sparkleAmount ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { sparkleAmount: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Bokeh Size */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Bokeh Size</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.bokehSize ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.bokehSize ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { bokehSize: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Light Rays */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Light Rays</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.lightRays ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.lightRays ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { lightRays: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Brightness */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Brightness</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.brightness ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.brightness ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { brightness: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Contrast */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Contrast</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.contrast ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.contrast ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { contrast: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Saturation */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Saturation</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.saturation ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.saturation ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { saturation: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Temperature */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Temperature</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.temperature ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.temperature ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { temperature: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Hue */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Hue</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.hue ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.hue ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { hue: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Exposure */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Exposure</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.exposure ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.exposure ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { exposure: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Shadow Softness (mapped to softness) */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Shadow Softness</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.softness ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.softness ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { softness: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Highlight Strength */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Highlight Strength</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.highlightStrength ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.highlightStrength ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { highlightStrength: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Opacity */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Opacity</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.opacity ?? 100)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.opacity ?? 100}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { opacity: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Blend Amount */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Blend Amount</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.blendAmount ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.blendAmount ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { blendAmount: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>
                    </>
                  )}

                  {/* Horror Category specific settings */}
                  {activeAppliedEffect.category === 'Horror' && (
                    <>
                      {/* Horror Color Tint Picker */}
                      <div className="space-y-1 col-span-2">
                        <span className="text-[9px] text-slate-400 block font-semibold">Horror Color Tint</span>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={activeAppliedEffect.horrorColorTint || '#00ff88'}
                            onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { horrorColorTint: e.target.value })}
                            className="w-6 h-6 border border-white/10 bg-transparent cursor-pointer rounded"
                          />
                          <span className="text-[8px] text-slate-400 font-mono">Eerie Tint</span>
                        </div>
                      </div>

                      {/* Intensity */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Intensity</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.intensity ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.intensity ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { intensity: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Darkness */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Darkness</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.darkness ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.darkness ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { darkness: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Shadow Strength */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Shadow Strength</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.shadowStrength ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.shadowStrength ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { shadowStrength: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Fog Density (mapped to smokeDensity) */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Fog Density</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.smokeDensity ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.smokeDensity ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { smokeDensity: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Smoke Density */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Smoke Density</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.smokeDensity ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.smokeDensity ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { smokeDensity: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Flicker Speed */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Flicker Speed</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.flickerSpeed ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.flickerSpeed ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { flickerSpeed: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Glow Strength */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Glow Strength</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.glowStrength ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.glowStrength ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { glowStrength: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Vignette Amount */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Vignette Amount</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.vignetteAmount ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.vignetteAmount ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { vignetteAmount: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Film Grain */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Film Grain</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.filmGrain ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.filmGrain ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { filmGrain: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Noise */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Noise</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.noiseAmount ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.noiseAmount ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { noiseAmount: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Camera Shake */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Camera Shake</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.cameraShake ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.cameraShake ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { cameraShake: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Blur Amount */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Blur Amount</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.blur ?? 0)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.blur ?? 0}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { blur: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Lens Distortion */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Lens Distortion</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.distortionAmount ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.distortionAmount ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { distortionAmount: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Contrast */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Contrast</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.contrast ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.contrast ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { contrast: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Brightness */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Brightness</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.brightness ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.brightness ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { brightness: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Saturation */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Saturation</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.saturation ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.saturation ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { saturation: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Temperature */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Temperature</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.temperature ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.temperature ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { temperature: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Tint */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Tint</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.tint ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.tint ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { tint: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Particle Density */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Particle Density</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.particleDensity ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.particleDensity ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { particleDensity: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Opacity */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Opacity</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.opacity ?? 100)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.opacity ?? 100}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { opacity: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Blend Amount */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Blend Amount</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.blendAmount ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.blendAmount ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { blendAmount: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>
                    </>
                  )}

                  {/* Sci-Fi Category specific settings */}
                  {activeAppliedEffect.category === 'Sci-Fi' && (
                    <>
                      {/* Sci-Fi Color Tint Picker */}
                      <div className="space-y-1 col-span-2">
                        <span className="text-[9px] text-slate-400 block font-semibold">Sci-Fi Color Tint</span>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={activeAppliedEffect.scifiColorTint || '#00e1ff'}
                            onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { scifiColorTint: e.target.value })}
                            className="w-6 h-6 border border-white/10 bg-transparent cursor-pointer rounded"
                          />
                          <span className="text-[8px] text-slate-400 font-mono">Futuristic Laser/HUD Tint</span>
                        </div>
                      </div>

                      {/* Intensity */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Intensity</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.intensity ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.intensity ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { intensity: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Neon Glow */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Neon Glow</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.neonGlow ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.neonGlow ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { neonGlow: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Hologram Opacity */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Hologram Opacity</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.hologramOpacity ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.hologramOpacity ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { hologramOpacity: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Bloom Radius */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Bloom Radius</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.bloomRadius ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.bloomRadius ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { bloomRadius: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Energy Strength */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Energy Strength</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.energyStrength ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.energyStrength ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { energyStrength: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Plasma Amount */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Plasma Amount</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.plasmaAmount ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.plasmaAmount ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { plasmaAmount: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Electric Arc Density */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Electric Arc Density</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.electricArcDensity ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.electricArcDensity ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { electricArcDensity: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Laser Brightness */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Laser Brightness</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.laserBrightness ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.laserBrightness ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { laserBrightness: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Particle Density */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Particle Density</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.particleDensity ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.particleDensity ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { particleDensity: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Motion Trails */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Motion Trails</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.motionTrails ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.motionTrails ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { motionTrails: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* HUD Opacity */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>HUD Opacity</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.hudOpacity ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.hudOpacity ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { hudOpacity: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Scanline Strength */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Scanline Strength</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.scanlineStrength ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.scanlineStrength ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { scanlineStrength: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* RGB Shift */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>RGB Shift</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.rgbShift ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.rgbShift ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { rgbShift: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Glitch Amount */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Glitch Amount</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.glitchAmount ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.glitchAmount ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { glitchAmount: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Lens Flare */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Lens Flare</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.lensFlare ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.lensFlare ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { lensFlare: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Brightness */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Brightness</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.brightness ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.brightness ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { brightness: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Contrast */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Contrast</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.contrast ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.contrast ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { contrast: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Saturation */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Saturation</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.saturation ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.saturation ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { saturation: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Exposure */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Exposure</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.exposure ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.exposure ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { exposure: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Temperature */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Temperature</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.temperature ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.temperature ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { temperature: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Hue */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Hue</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.hue ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.hue ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { hue: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Depth (mapped to atmosphericDepth) */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Depth</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.atmosphericDepth ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.atmosphericDepth ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { atmosphericDepth: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Opacity */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Opacity</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.opacity ?? 100)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.opacity ?? 100}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { opacity: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Blend Amount */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Blend Amount</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.blendAmount ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.blendAmount ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { blendAmount: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>
                    </>
                  )}

                  {/* Gaming Category specific settings */}
                  {activeAppliedEffect.category === 'Gaming' && (
                    <>
                      {/* Gaming Color Tint Picker */}
                      <div className="space-y-1 col-span-2">
                        <span className="text-[9px] text-slate-400 block font-semibold">Gaming HUD Tint</span>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={activeAppliedEffect.gamingColorTint || '#ff0055'}
                            onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { gamingColorTint: e.target.value })}
                            className="w-6 h-6 border border-white/10 bg-transparent cursor-pointer rounded"
                          />
                          <span className="text-[8px] text-slate-400 font-mono">RGB / HUD Aura Tint</span>
                        </div>
                      </div>

                      {/* Intensity */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Intensity</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.intensity ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.intensity ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { intensity: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* RGB Strength */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>RGB Strength</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.rgbStrength ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.rgbStrength ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { rgbStrength: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Neon Glow */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Neon Glow</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.neonGlow ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.neonGlow ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { neonGlow: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Bloom Radius */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Bloom Radius</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.bloomRadius ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.bloomRadius ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { bloomRadius: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* HUD Opacity */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>HUD Opacity</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.hudOpacity ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.hudOpacity ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { hudOpacity: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Crosshair Size */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Crosshair Size</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.crosshairSize ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.crosshairSize ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { crosshairSize: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Motion Blur */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Motion Blur</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.motionBlur ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.motionBlur ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { motionBlur: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Speed Lines */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Speed Lines</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.speedLines ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.speedLines ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { speedLines: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Energy Strength */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Energy Strength</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.energyStrength ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.energyStrength ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { energyStrength: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Electric Arc Density */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Electric Arc Density</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.electricArcDensity ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.electricArcDensity ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { electricArcDensity: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Spark Density */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Spark Density</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.sparkDensity ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.sparkDensity ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { sparkDensity: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Particle Count */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Particle Count</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.particleCount ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.particleCount ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { particleCount: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Lens Flare */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Lens Flare</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.lensFlare ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.lensFlare ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { lensFlare: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Camera Shake */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Camera Shake</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.cameraShake ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.cameraShake ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { cameraShake: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Flash Intensity */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Flash Intensity</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.flashIntensity ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.flashIntensity ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { flashIntensity: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Brightness */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Brightness</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.brightness ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.brightness ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { brightness: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Contrast */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Contrast</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.contrast ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.contrast ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { contrast: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Saturation */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Saturation</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.saturation ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.saturation ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { saturation: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Exposure */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Exposure</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.exposure ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.exposure ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { exposure: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Temperature */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Temperature</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.temperature ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.temperature ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { temperature: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Hue */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Hue</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.hue ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.hue ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { hue: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Opacity */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Opacity</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.opacity ?? 100)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.opacity ?? 100}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { opacity: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Blend Amount */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Blend Amount</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.blendAmount ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.blendAmount ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { blendAmount: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>
                    </>
                  )}

                  {/* Cosmic Category specific settings */}
                  {activeAppliedEffect.category === 'Cosmic' && (
                    <>
                      {/* Cosmic Nebula Color Picker */}
                      <div className="space-y-1 col-span-2">
                        <span className="text-[9px] text-slate-400 block font-semibold">Nebula Cloud Color</span>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={activeAppliedEffect.nebulaColor || '#8a2be2'}
                            onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { nebulaColor: e.target.value })}
                            className="w-6 h-6 border border-white/10 bg-transparent cursor-pointer rounded"
                          />
                          <span className="text-[8px] text-slate-400 font-mono">Vibrant Cosmic Nebulae Tint</span>
                        </div>
                      </div>

                      {/* Intensity */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Intensity</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.intensity ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.intensity ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { intensity: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Galaxy Density */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Galaxy Density</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.galaxyDensity ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.galaxyDensity ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { galaxyDensity: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Star Count */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Star Count</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.starCount ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.starCount ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { starCount: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Star Brightness */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Star Brightness</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.starBrightness ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.starBrightness ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { starBrightness: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Nebula Density */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Nebula Density</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.nebulaDensity ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.nebulaDensity ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { nebulaDensity: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Cosmic Dust */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Cosmic Dust</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.cosmicDust ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.cosmicDust ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { cosmicDust: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Particle Count */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Particle Count</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.particleCount ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.particleCount ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { particleCount: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Planet Size */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Planet Size</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.planetSize ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.planetSize ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { planetSize: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Glow Strength */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Glow Strength</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.glowStrength ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.glowStrength ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { glowStrength: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Bloom Radius */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Bloom Radius</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.bloomRadius ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.bloomRadius ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { bloomRadius: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Aurora Strength */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Aurora Strength</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.auroraStrength ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.auroraStrength ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { auroraStrength: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Energy Waves */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Energy Waves</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.energyWaves ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.energyWaves ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { energyWaves: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Gravity Distortion */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Gravity Distortion</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.gravityDistortion ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.gravityDistortion ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { gravityDistortion: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Black Hole Strength */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Black Hole Strength</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.blackHoleStrength ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.blackHoleStrength ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { blackHoleStrength: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Wormhole Rotation */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Wormhole Rotation</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.wormholeRotation ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.wormholeRotation ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { wormholeRotation: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Meteor Speed */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Meteor Speed</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.meteorSpeed ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.meteorSpeed ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { meteorSpeed: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Motion Blur */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Motion Blur</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.motionBlur ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.motionBlur ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { motionBlur: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Brightness */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Brightness</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.brightness ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.brightness ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { brightness: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Contrast */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Contrast</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.contrast ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.contrast ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { contrast: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Saturation */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Saturation</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.saturation ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.saturation ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { saturation: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Exposure */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Exposure</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.exposure ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.exposure ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { exposure: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Temperature */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Temperature</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.temperature ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.temperature ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { temperature: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Hue */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Hue</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.hue ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.hue ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { hue: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Opacity */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Opacity</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.opacity ?? 100)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.opacity ?? 100}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { opacity: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Blend Amount */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Blend Amount</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.blendAmount ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.blendAmount ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { blendAmount: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>
                    </>
                  )}

                  {/* 3D Category specific settings */}
                  {activeAppliedEffect.category === '3D' && (
                    <>
                      {/* 3D Ambient Color Tint Picker */}
                      <div className="space-y-1 col-span-2">
                        <span className="text-[9px] text-slate-400 block font-semibold">3D Ambient Shadow Tint</span>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={activeAppliedEffect.threeDColorTint || '#000000'}
                            onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { threeDColorTint: e.target.value })}
                            className="w-6 h-6 border border-white/10 bg-transparent cursor-pointer rounded"
                          />
                          <span className="text-[8px] text-slate-400 font-mono">Volumetric Shadow Color</span>
                        </div>
                      </div>

                      {/* Intensity */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Intensity</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.intensity ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.intensity ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { intensity: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Depth Amount */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Depth Amount</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.depthAmount ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.depthAmount ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { depthAmount: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Perspective */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Perspective</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.perspective ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="10"
                          max="100"
                          value={activeAppliedEffect.perspective ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { perspective: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Parallax Strength */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Parallax Strength</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.parallaxStrength ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.parallaxStrength ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { parallaxStrength: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Camera Distance */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Camera Distance</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.cameraDistance ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="10"
                          max="100"
                          value={activeAppliedEffect.cameraDistance ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { cameraDistance: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Camera Orbit */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Camera Orbit</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.cameraOrbit ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.cameraOrbit ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { cameraOrbit: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Camera Tilt */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Camera Tilt</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.cameraTilt ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.cameraTilt ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { cameraTilt: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Camera Roll */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Camera Roll</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.cameraRoll ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.cameraRoll ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { cameraRoll: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* X Rotation */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>X Rotation</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.threeDrotationX ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.threeDrotationX ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { threeDrotationX: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Y Rotation */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Y Rotation</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.threeDrotationY ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.threeDrotationY ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { threeDrotationY: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Z Rotation */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Z Rotation</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.threeDrotationZ ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.threeDrotationZ ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { threeDrotationZ: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Zoom */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Zoom</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.zoom ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="10"
                          max="100"
                          value={activeAppliedEffect.zoom ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { zoom: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* FOV */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Field of View (FOV)</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.fov ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="10"
                          max="100"
                          value={activeAppliedEffect.fov ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { fov: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Focus Distance */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Focus Distance</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.focusDistance ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.focusDistance ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { focusDistance: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Shadow Strength */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Shadow Strength</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.shadowStrength ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.shadowStrength ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { shadowStrength: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Reflection Strength */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Reflection Strength</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.reflectionStrength ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.reflectionStrength ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { reflectionStrength: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Ambient Light */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Ambient Light</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.ambientLight ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.ambientLight ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { ambientLight: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Directional Light */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Directional Light</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.directionalLight ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.directionalLight ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { directionalLight: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Bloom Radius */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Bloom Radius</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.bloomRadius ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.bloomRadius ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { bloomRadius: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Glow Strength */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Glow Strength</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.glowStrength ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.glowStrength ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { glowStrength: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Brightness */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Brightness</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.brightness ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.brightness ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { brightness: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Contrast */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Contrast</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.contrast ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.contrast ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { contrast: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Saturation */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Saturation</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.saturation ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.saturation ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { saturation: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Exposure */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Exposure</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.exposure ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.exposure ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { exposure: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Opacity */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Opacity</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.opacity ?? 100)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.opacity ?? 100}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { opacity: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Blend Amount */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Blend Amount</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.blendAmount ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.blendAmount ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { blendAmount: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>
                    </>
                  )}

                  {/* Artistic Category specific settings */}
                  {activeAppliedEffect.category === 'Artistic' && (
                    <>
                      {/* Intensity */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Intensity</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.intensity ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.intensity ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { intensity: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Brush Size */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Brush Size</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.brushSize ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.brushSize ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { brushSize: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Brush Detail */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Brush Detail</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.brushDetail ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.brushDetail ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { brushDetail: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Stroke Strength */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Stroke Strength</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.strokeStrength ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.strokeStrength ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { strokeStrength: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Texture Amount */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Texture Amount</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.textureAmount ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.textureAmount ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { textureAmount: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Paint Thickness */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Paint Thickness</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.paintThickness ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.paintThickness ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { paintThickness: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Edge Detail */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Edge Detail</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.edgeDetail ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.edgeDetail ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { edgeDetail: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Outline Strength */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Outline Strength</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.outlineStrength ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.outlineStrength ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { outlineStrength: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Blur Amount */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Blur Amount</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.blur ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.blur ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { blur: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Color Vibrance */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Color Vibrance</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.colorVibrance ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.colorVibrance ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { colorVibrance: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Saturation */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Saturation</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.saturation ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.saturation ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { saturation: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Brightness */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Brightness</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.brightness ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.brightness ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { brightness: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Contrast */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Contrast</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.contrast ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.contrast ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { contrast: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Exposure */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Exposure</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.exposure ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.exposure ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { exposure: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Hue */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Hue</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.hue ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.hue ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { hue: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Canvas Texture */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Canvas Texture</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.canvasTexture ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.canvasTexture ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { canvasTexture: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Paper Texture */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Paper Texture</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.paperTexture ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.paperTexture ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { paperTexture: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Glow Strength */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Glow Strength</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.glowStrength ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.glowStrength ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { glowStrength: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Opacity */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Opacity</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.opacity ?? 100)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.opacity ?? 100}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { opacity: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Blend Amount */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Blend Amount</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.blendAmount ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.blendAmount ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { blendAmount: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>
                    </>
                  )}

                  {/* AI Category specific settings */}
                  {activeAppliedEffect.category === 'AI' && (
                    <>
                      {/* AI Scan Color Tint Picker */}
                      <div className="space-y-1 col-span-2">
                        <span className="text-[9px] text-slate-400 block font-semibold">AI Scan HUD Color Tint</span>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={activeAppliedEffect.aiColorTint || '#00ff88'}
                            onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { aiColorTint: e.target.value })}
                            className="w-6 h-6 border border-white/10 bg-transparent cursor-pointer rounded"
                          />
                          <span className="text-[8px] text-slate-400 font-mono">Neural Interface Glow Color</span>
                        </div>
                      </div>

                      {/* Intensity */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Intensity</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.intensity ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.intensity ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { intensity: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* AI Scan Speed */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>AI Scan Speed</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.aiScanSpeed ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.aiScanSpeed ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { aiScanSpeed: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* HUD Opacity */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>HUD Opacity</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.hudOpacity ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.hudOpacity ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { hudOpacity: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Detection Box Size */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Detection Box Size</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.detectionBoxSize ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="5"
                          max="100"
                          value={activeAppliedEffect.detectionBoxSize ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { detectionBoxSize: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Neural Line Density */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Neural Line Density</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.neuralLineDensity ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.neuralLineDensity ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { neuralLineDensity: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Particle Count */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Particle Count</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.particleCount ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.particleCount ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { particleCount: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Particle Speed */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Particle Speed</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.particleSpeed ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.particleSpeed ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { particleSpeed: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Glow Strength */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Glow Strength</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.glowStrength ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.glowStrength ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { glowStrength: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Bloom Radius */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Bloom Radius</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.bloomRadius ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.bloomRadius ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { bloomRadius: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Circuit Opacity */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Circuit Opacity</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.circuitOpacity ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.circuitOpacity ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { circuitOpacity: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* RGB Strength */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>RGB Strength</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.rgbStrength ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.rgbStrength ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { rgbStrength: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Scanline Intensity */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Scanline Intensity</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.scanlineIntensity ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.scanlineIntensity ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { scanlineIntensity: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Hologram Strength */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Hologram Strength</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.hologramStrength ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.hologramStrength ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { hologramStrength: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Motion Trails */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Motion Trails</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.motionTrails ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.motionTrails ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { motionTrails: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Noise Reduction */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Noise Reduction</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.noiseReduction ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.noiseReduction ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { noiseReduction: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Brightness */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Brightness</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.brightness ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.brightness ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { brightness: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Contrast */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Contrast</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.contrast ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.contrast ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { contrast: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Saturation */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Saturation</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.saturation ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.saturation ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { saturation: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Exposure */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Exposure</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.exposure ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.exposure ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { exposure: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Opacity */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Opacity</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.opacity ?? 100)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.opacity ?? 100}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { opacity: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Blend Amount */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Blend Amount</span>
                          <span className="font-mono text-sky-400">{(activeAppliedEffect.blendAmount ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeAppliedEffect.blendAmount ?? 50}
                          onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { blendAmount: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>
                    </>
                  )}

                  {/* Blend Mode Selection */}
                  <div className="space-y-0.5 col-span-2">
                    <span className="text-[9px] text-slate-400 block">Blend Mode Overlay</span>
                    <select
                      value={activeAppliedEffect.blendMode}
                      onChange={(e) => onUpdateAppliedEffect(activeClip.id, activeAppliedEffect.id, { blendMode: e.target.value })}
                      className="w-full bg-[#060910] border border-white/10 rounded px-1.5 py-0.5 text-[9px] text-slate-300 focus:outline-none focus:border-sky-500/50"
                    >
                      {BLEND_MODES.map((mode) => (
                        <option key={mode.value} value={mode.value}>{mode.label}</option>
                      ))}
                    </select>
                  </div>

                </div>

                {/* 3. KEYFRAMES MANAGER FOR SELECTED EFFECT */}
                <div className="border-t border-white/5 pt-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[9.5px] uppercase font-mono tracking-wider text-slate-400 flex items-center gap-1">
                      <Key className="h-3 w-3 text-amber-400" />
                      Effect Keyframes ({activeAppliedEffect.keyframes?.length || 0})
                    </span>
                    
                    <button
                      type="button"
                      onClick={() => {
                        const relativePlayhead = currentTime - activeClip.timelineStart;
                        onAddEffectKeyframe?.(activeClip.id, activeAppliedEffect.id, relativePlayhead, {
                          intensity: activeAppliedEffect.intensity,
                          opacity: activeAppliedEffect.opacity,
                          speed: activeAppliedEffect.speed,
                          angle: activeAppliedEffect.angle,
                          distance: activeAppliedEffect.distance,
                          smoothness: activeAppliedEffect.smoothness,
                          motionStrength: activeAppliedEffect.motionStrength,
                          zoomAmount: activeAppliedEffect.zoomAmount,
                          blurAmount: activeAppliedEffect.blurAmount,
                          rotation: activeAppliedEffect.rotation,
                          blurRadius: activeAppliedEffect.blurRadius,
                          feather: activeAppliedEffect.feather,
                          focusDistance: activeAppliedEffect.focusDistance,
                          focusSize: activeAppliedEffect.focusSize,
                          rgbOffset: activeAppliedEffect.rgbOffset,
                          distortionAmount: activeAppliedEffect.distortionAmount,
                          noiseAmount: activeAppliedEffect.noiseAmount,
                          flickerSpeed: activeAppliedEffect.flickerSpeed,
                          scanlineDensity: activeAppliedEffect.scanlineDensity,
                          blockSize: activeAppliedEffect.blockSize,
                          pixelSize: activeAppliedEffect.pixelSize,
                          colorShift: activeAppliedEffect.colorShift,
                          glitchFrequency: activeAppliedEffect.glitchFrequency,
                          brightness: activeAppliedEffect.brightness,
                          contrast: activeAppliedEffect.contrast,
                          saturation: activeAppliedEffect.saturation,
                          temperature: activeAppliedEffect.temperature,
                          tint: activeAppliedEffect.tint,
                          glowAmount: activeAppliedEffect.glowAmount,
                          grainAmount: activeAppliedEffect.grainAmount,
                          flareSize: activeAppliedEffect.flareSize,
                          flarePosition: activeAppliedEffect.flarePosition,
                          vignetteAmount: activeAppliedEffect.vignetteAmount,
                          letterboxSize: activeAppliedEffect.letterboxSize,
                          focusRadius: activeAppliedEffect.focusRadius,
                          refractionStrength: activeAppliedEffect.refractionStrength,
                          reflectionStrength: activeAppliedEffect.reflectionStrength,
                          chromaticOffset: activeAppliedEffect.chromaticOffset,
                          lensRadius: activeAppliedEffect.lensRadius,
                          bloomRadius: activeAppliedEffect.bloomRadius,
                          bloomThreshold: activeAppliedEffect.bloomThreshold,
                          exposure: activeAppliedEffect.exposure,
                          lightRadius: activeAppliedEffect.lightRadius,
                          lightPosition: activeAppliedEffect.lightPosition,
                          lightAngle: activeAppliedEffect.lightAngle,
                          falloff: activeAppliedEffect.falloff,
                          distortionStrength: activeAppliedEffect.distortionStrength,
                          waveSize: activeAppliedEffect.waveSize,
                          waveSpeed: activeAppliedEffect.waveSpeed,
                          rippleRadius: activeAppliedEffect.rippleRadius,
                          rippleSpeed: activeAppliedEffect.rippleSpeed,
                          frequency: activeAppliedEffect.frequency,
                          amplitude: activeAppliedEffect.amplitude,
                          radius: activeAppliedEffect.radius,
                          refractionAmount: activeAppliedEffect.refractionAmount,
                          stretchAmount: activeAppliedEffect.stretchAmount,
                          twistAmount: activeAppliedEffect.twistAmount,
                          flowDirection: activeAppliedEffect.flowDirection,
                          dustAmount: activeAppliedEffect.dustAmount,
                          scratchAmount: activeAppliedEffect.scratchAmount,
                          warmth: activeAppliedEffect.warmth,
                          fade: activeAppliedEffect.fade,
                          trackingAmount: activeAppliedEffect.trackingAmount,
                          horizontalShift: activeAppliedEffect.horizontalShift,
                          verticalShift: activeAppliedEffect.verticalShift,
                          tapeDamage: activeAppliedEffect.tapeDamage,
                          staticDensity: activeAppliedEffect.staticDensity,
                          waveStrength: activeAppliedEffect.waveStrength,
                          curvature: activeAppliedEffect.curvature,
                          scanlineThickness: activeAppliedEffect.scanlineThickness,
                          bloomAmount: activeAppliedEffect.bloomAmount,
                          glassOpacity: activeAppliedEffect.glassOpacity,
                          glowStrength: activeAppliedEffect.glowStrength,
                          glowSoftness: activeAppliedEffect.glowSoftness,
                          glowThreshold: activeAppliedEffect.glowThreshold,
                          edgeGlow: activeAppliedEffect.edgeGlow,
                          hue: activeAppliedEffect.hue,
                          blendAmount: activeAppliedEffect.blendAmount,
                          glowColor: activeAppliedEffect.glowColor,
                          glowRadius: activeAppliedEffect.glowRadius,
                          flameHeight: activeAppliedEffect.flameHeight,
                          flameWidth: activeAppliedEffect.flameWidth,
                          flameSpeed: activeAppliedEffect.flameSpeed,
                          heatDistortion: activeAppliedEffect.heatDistortion,
                          emberDensity: activeAppliedEffect.emberDensity,
                          sparkAmount: activeAppliedEffect.sparkAmount,
                          smokeDensity: activeAppliedEffect.smokeDensity,
                          windStrength: activeAppliedEffect.windStrength,
                          turbulence: activeAppliedEffect.turbulence,
                          spread: activeAppliedEffect.spread,
                          softness: activeAppliedEffect.softness,
                          flowSpeed: activeAppliedEffect.flowSpeed,
                          swirlAmount: activeAppliedEffect.swirlAmount,
                          size: activeAppliedEffect.size,
                          fadeIn: activeAppliedEffect.fadeIn,
                          fadeOut: activeAppliedEffect.fadeOut,
                          layerAmount: activeAppliedEffect.layerAmount,
                          animationSpeed: activeAppliedEffect.animationSpeed,
                          particleDensity: activeAppliedEffect.particleDensity,
                          windSpeed: activeAppliedEffect.windSpeed,
                          windDirection: activeAppliedEffect.windDirection,
                          particleSize: activeAppliedEffect.particleSize,
                          particleSpeed: activeAppliedEffect.particleSpeed,
                          environmentLight: activeAppliedEffect.environmentLight,
                          atmosphericDepth: activeAppliedEffect.atmosphericDepth,
                          rainAmount: activeAppliedEffect.rainAmount,
                          snowAmount: activeAppliedEffect.snowAmount,
                          lightningFrequency: activeAppliedEffect.lightningFrequency,
                          cloudCoverage: activeAppliedEffect.cloudCoverage,
                          shadowStrength: activeAppliedEffect.shadowStrength,
                          motionBlur: activeAppliedEffect.motionBlur,
                          particleCount: activeAppliedEffect.particleCount,
                          sizeVariation: activeAppliedEffect.sizeVariation,
                          gravity: activeAppliedEffect.gravity,
                          lifetime: activeAppliedEffect.lifetime,
                          spawnRate: activeAppliedEffect.spawnRate,
                          rotationSpeed: activeAppliedEffect.rotationSpeed,
                          randomness: activeAppliedEffect.randomness,
                          colorVariation: activeAppliedEffect.colorVariation,
                          environmentDensity: activeAppliedEffect.environmentDensity,
                          leafDensity: activeAppliedEffect.leafDensity,
                          leafSize: activeAppliedEffect.leafSize,
                          birdCount: activeAppliedEffect.birdCount,
                          butterflyCount: activeAppliedEffect.butterflyCount,
                          fireflyCount: activeAppliedEffect.fireflyCount,
                          flowerDensity: activeAppliedEffect.flowerDensity,
                          grassMovement: activeAppliedEffect.grassMovement,
                          waterSpeed: activeAppliedEffect.waterSpeed,
                          waterStrength: activeAppliedEffect.waterStrength,
                          cloudDensity: activeAppliedEffect.cloudDensity,
                          cloudSpeed: activeAppliedEffect.cloudSpeed,
                          sunlightIntensity: activeAppliedEffect.sunlightIntensity,
                          lightRays: activeAppliedEffect.lightRays,
                          bloom: activeAppliedEffect.bloom,
                          softFocus: activeAppliedEffect.softFocus,
                          hazeDensity: activeAppliedEffect.hazeDensity,
                          sparkleAmount: activeAppliedEffect.sparkleAmount,
                          bokehSize: activeAppliedEffect.bokehSize,
                          highlightStrength: activeAppliedEffect.highlightStrength,
                          darkness: activeAppliedEffect.darkness,
                          cameraShake: activeAppliedEffect.cameraShake,
                          filmGrain: activeAppliedEffect.filmGrain,
                          hologramOpacity: activeAppliedEffect.hologramOpacity,
                          energyStrength: activeAppliedEffect.energyStrength,
                          laserBrightness: activeAppliedEffect.laserBrightness,
                          electricArcDensity: activeAppliedEffect.electricArcDensity,
                          hudOpacity: activeAppliedEffect.hudOpacity,
                          rgbShift: activeAppliedEffect.rgbShift,
                          glitchAmount: activeAppliedEffect.glitchAmount,
                          rgbStrength: activeAppliedEffect.rgbStrength,
                          crosshairSize: activeAppliedEffect.crosshairSize,
                          speedLines: activeAppliedEffect.speedLines,
                          sparkDensity: activeAppliedEffect.sparkDensity,
                          flashIntensity: activeAppliedEffect.flashIntensity,
                          galaxyDensity: activeAppliedEffect.galaxyDensity,
                          starCount: activeAppliedEffect.starCount,
                          starBrightness: activeAppliedEffect.starBrightness,
                          nebulaDensity: activeAppliedEffect.nebulaDensity,
                          cosmicDust: activeAppliedEffect.cosmicDust,
                          planetSize: activeAppliedEffect.planetSize,
                          auroraStrength: activeAppliedEffect.auroraStrength,
                          energyWaves: activeAppliedEffect.energyWaves,
                          gravityDistortion: activeAppliedEffect.gravityDistortion,
                          blackHoleStrength: activeAppliedEffect.blackHoleStrength,
                          wormholeRotation: activeAppliedEffect.wormholeRotation,
                          meteorSpeed: activeAppliedEffect.meteorSpeed,
                          depthAmount: activeAppliedEffect.depthAmount,
                          perspective: activeAppliedEffect.perspective,
                          parallaxStrength: activeAppliedEffect.parallaxStrength,
                          cameraDistance: activeAppliedEffect.cameraDistance,
                          cameraOrbit: activeAppliedEffect.cameraOrbit,
                          cameraTilt: activeAppliedEffect.cameraTilt,
                          cameraRoll: activeAppliedEffect.cameraRoll,
                          threeDrotationX: activeAppliedEffect.threeDrotationX,
                          threeDrotationY: activeAppliedEffect.threeDrotationY,
                          threeDrotationZ: activeAppliedEffect.threeDrotationZ,
                          zoom: activeAppliedEffect.zoom,
                          fov: activeAppliedEffect.fov,
                          ambientLight: activeAppliedEffect.ambientLight,
                          directionalLight: activeAppliedEffect.directionalLight,
                          brushSize: activeAppliedEffect.brushSize,
                          brushDetail: activeAppliedEffect.brushDetail,
                          strokeStrength: activeAppliedEffect.strokeStrength,
                          textureAmount: activeAppliedEffect.textureAmount,
                          paintThickness: activeAppliedEffect.paintThickness,
                          edgeDetail: activeAppliedEffect.edgeDetail,
                          outlineStrength: activeAppliedEffect.outlineStrength,
                          canvasTexture: activeAppliedEffect.canvasTexture,
                          paperTexture: activeAppliedEffect.paperTexture,
                          colorVibrance: activeAppliedEffect.colorVibrance,
                          aiScanSpeed: activeAppliedEffect.aiScanSpeed,
                          detectionBoxSize: activeAppliedEffect.detectionBoxSize,
                          neuralLineDensity: activeAppliedEffect.neuralLineDensity,
                          circuitOpacity: activeAppliedEffect.circuitOpacity,
                          scanlineIntensity: activeAppliedEffect.scanlineIntensity,
                          hologramStrength: activeAppliedEffect.hologramStrength,
                          noiseReduction: activeAppliedEffect.noiseReduction
                        });
                        triggerToast('Keyframe added at playhead');
                      }}
                      className="px-2 py-0.5 rounded bg-amber-500 hover:bg-amber-600 text-slate-950 text-[8.5px] font-bold cursor-pointer transition flex items-center gap-0.5"
                    >
                      <Plus className="h-2.5 w-2.5 stroke-[3px]" /> Add Keyframe
                    </button>
                  </div>

                  {activeAppliedEffect.keyframes && activeAppliedEffect.keyframes.length > 0 ? (
                    <div className="max-h-[80px] overflow-y-auto space-y-1">
                      {activeAppliedEffect.keyframes.map((kf: EffectKeyframe) => (
                        <div
                          key={kf.id}
                          className="flex items-center justify-between bg-slate-950/50 border border-white/5 rounded px-2 py-1 text-[8.5px] text-slate-400 font-mono"
                        >
                          <span>Playhead: {kf.time.toFixed(2)}s</span>
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                onDeleteEffectKeyframe?.(activeClip.id, activeAppliedEffect.id, kf.id);
                                triggerToast('Keyframe removed');
                              }}
                              className="text-slate-500 hover:text-red-400 cursor-pointer"
                            >
                              <Trash2 className="h-2.5 w-2.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[8.5px] text-slate-500 italic text-center">
                      No keyframes added. Dynamic animations will follow slider presets.
                    </p>
                  )}
                </div>

              </div>
            )}

            {/* 4. Presets catalog section */}
            <div className="space-y-2">
              <h4 className="text-[10px] uppercase font-mono tracking-wider text-slate-400">
                Preset Catalog ({filteredPresets.length})
              </h4>
              
              <div className="grid grid-cols-2 gap-2">
                {filteredPresets.map((preset) => {
                  const isFav = favorites.includes(preset.id);
                  const isApplied = activeClip?.appliedEffects?.some(
                    (e: AppliedEffect) => e.presetId === preset.id || e.name === preset.name
                  );

                  return (
                    <div
                      key={preset.id}
                      onClick={() => handleApplyPreset(preset)}
                      className={`rounded-xl border p-2 flex flex-col justify-between overflow-hidden cursor-pointer group relative h-[92px] transition ${
                        isApplied 
                          ? 'border-sky-500/40 bg-sky-500/10' 
                          : 'border-white/5 hover:border-white/10 bg-[#0b101c]/60'
                      }`}
                    >
                      {/* CSS Preview Visualizer card */}
                      <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-slate-950 border border-white/10 mb-1 flex-shrink-0">
                        <img
                          src="https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=150&q=50"
                          alt=""
                          className="w-full h-full object-cover select-none pointer-events-none group-hover:scale-105 transition-all duration-300"
                          style={{ filter: preset.cssFilter }}
                          loading="lazy"
                        />
                        
                        {/* Overlay representation (Light gradient fallback overlay) */}
                        {preset.overlayStyle && (
                          <div
                            className="absolute inset-0 pointer-events-none opacity-40"
                            style={preset.overlayStyle}
                          />
                        )}

                        {/* Applied badge */}
                        {isApplied && (
                          <span className="absolute top-0.5 left-0.5 z-20 bg-sky-500 text-slate-950 text-[7px] font-black uppercase px-1 py-0.5 rounded flex items-center gap-0.5 shadow-sm">
                            <Check className="h-2 w-2 stroke-[3]" /> Applied
                          </span>
                        )}

                        {/* Favorite button toggle */}
                        <button
                          type="button"
                          onClick={(e) => toggleFavorite(preset.id, e)}
                          className="absolute top-0.5 right-0.5 p-0.5 rounded bg-slate-950/60 hover:bg-slate-950 border border-white/5 text-slate-400 hover:text-yellow-400 cursor-pointer transition z-20"
                        >
                          <Star className={`h-2.5 w-2.5 ${isFav ? 'fill-yellow-400 text-yellow-400' : 'text-slate-500'}`} />
                        </button>
                      </div>

                      <div className="min-w-0 flex-1 flex flex-col justify-center">
                        <span className="text-[9px] font-bold text-slate-200 block truncate leading-tight">
                          {preset.name}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {filteredPresets.length === 0 && (
                <div className="text-center py-8 text-slate-600 text-xs italic">
                  No effects presets found matching selection.
                </div>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
export default Effects;
