import React, { useState, useEffect } from 'react';
import { Search, Star, Trash2, Copy, RotateCcw, Eye, EyeOff, Clock, Sparkles, Check, ArrowUp, ArrowDown, Plus, Key, Sliders } from 'lucide-react';
import { SAMPLE_TRANSITIONS, TransitionSample } from './transitionSamples';
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
  { id: 'Lens', name: '🔍 Lens' },
  { id: 'Light', name: '💡 Light' },
  { id: 'Distortion', name: '🌀 Distort' },
  { id: 'Retro', name: '📻 Retro' },
  { id: 'VHS', name: '📼 VHS' },
  { id: 'CRT', name: '📺 CRT' },
  { id: 'Neon', name: '🌈 Neon' },
  { id: 'Fire', name: '🔥 Fire' },
  { id: 'Smoke', name: '💨 Smoke' },
  { id: 'Weather', name: '🌧️ Weather' },
  { id: 'Particles', name: '✨ Particles' },
  { id: 'Nature', name: '🍃 Nature' },
  { id: 'Dream', name: '💭 Dream' },
  { id: 'Horror', name: '🧟 Horror' },
  { id: 'Sci-Fi', name: '🚀 Sci-Fi' },
  { id: 'Gaming', name: '🎮 Gaming' },
  { id: 'Comic', name: '💥 Comic' },
  { id: '3D', name: '👓 3D' },
  { id: 'Artistic', name: '🎭 Artistic' },
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
  const [activeSubTab, setActiveSubTab] = useState<'transitions' | 'filters' | 'effects'>('effects');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

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
                placeholder="Search 1,000+ effects..."
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
                          flowDirection: activeAppliedEffect.flowDirection
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
                  return (
                    <div
                      key={preset.id}
                      onClick={() => handleApplyPreset(preset)}
                      className="rounded-xl border border-white/5 hover:border-white/10 bg-[#0b101c]/60 p-2 flex flex-col justify-between overflow-hidden cursor-pointer group relative h-[92px] transition"
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
