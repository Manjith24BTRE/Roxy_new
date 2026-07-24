import React, { useState } from 'react';
import { Sliders, Search } from 'lucide-react';
import { SAMPLE_TRANSITIONS, TransitionSample } from './transitionSamples';
// Force IDE cache refresh for folder casing
import { Filters } from '../filters/Filters';
import { CinematicEffects, CINEMATIC_EFFECTS } from './Cinematic/CinematicEffects';
import { CameraEffects, CAMERA_EFFECTS } from './Camera/CameraEffects';
import { BlurEffects, BLUR_EFFECTS } from './Blur/BlurEffects';
import { GlitchEffects, GLITCH_EFFECTS } from './Glitch/GlitchEffects';
import { LightEffects, LIGHT_EFFECTS } from './Light/LightEffects';

interface EffectsProps {
  activeEffectId: string | null;
  onSelectEffect: (id: string | null) => void;
  activeTransitionId: string | null;
  onSelectTransition: (id: string | null) => void;
  effectStrength: number;
  onEffectStrengthChange: (strength: number) => void;
  effectSpeed: number;
  onEffectSpeedChange: (speed: number) => void;
  activeFilterId: string | null;
  onSelectFilter: (id: string | null) => void;
  filterIntensity: number;
  onFilterIntensityChange: (intensity: number) => void;
}

export function Effects({
  activeEffectId,
  onSelectEffect,
  activeTransitionId,
  onSelectTransition,
  effectStrength,
  onEffectStrengthChange,
  effectSpeed,
  onEffectSpeedChange,
  activeFilterId,
  onSelectFilter,
  filterIntensity,
  onFilterIntensityChange
}: EffectsProps) {
  const [activeSubTab, setActiveSubTab] = useState<'effects' | 'transitions' | 'filters'>('effects');
  const [activeCategoryTab, setActiveCategoryTab] = useState<'cinematic' | 'camera' | 'blur' | 'glitch' | 'light'>('cinematic');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTransitions = SAMPLE_TRANSITIONS.filter((t: TransitionSample) =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeEffect = 
    CINEMATIC_EFFECTS.find((e) => e.id === activeEffectId) ||
    CAMERA_EFFECTS.find((e) => e.id === activeEffectId) ||
    BLUR_EFFECTS.find((e) => e.id === activeEffectId) ||
    GLITCH_EFFECTS.find((e) => e.id === activeEffectId) ||
    LIGHT_EFFECTS.find((e) => e.id === activeEffectId);

  const activeTransition = SAMPLE_TRANSITIONS.find((t: TransitionSample) => t.id === activeTransitionId);

  const categories = [
    { id: 'cinematic', name: 'Cinematic' },
    { id: 'camera', name: 'Camera' },
    { id: 'blur', name: 'Blur' },
    { id: 'glitch', name: 'Glitch' },
    { id: 'light', name: 'Light' }
  ];

  return (
    <div className="flex flex-col h-full bg-[#090d16] text-slate-100 select-none">
      {/* Sub Header Navigation */}
      <div className="p-3 border-b border-white/10 bg-[#0c101d] flex-shrink-0">
        <div className="flex border border-white/10 rounded-lg bg-slate-950/60 p-0.5">
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
        </div>
      </div>

      {/* Render Sub Tabs */}
      {activeSubTab === 'filters' ? (
        <div className="flex-1 min-h-0">
          <Filters
            activeFilterId={activeFilterId}
            onSelectFilter={onSelectFilter}
            filterIntensity={filterIntensity}
            onFilterIntensityChange={onFilterIntensityChange}
          />
        </div>
      ) : (
        <>
          {/* Search Input for Effects/Transitions */}
          <div className="px-4 py-2 bg-[#090d16] flex-shrink-0 border-b border-white/5">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
              <input
                type="text"
                placeholder={activeSubTab === 'effects' ? "Search effects..." : "Search transitions..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-md bg-slate-900 border border-white/10 pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            
            {/* Category tabs inside Effects sub-tab */}
            {activeSubTab === 'effects' && (
              <div className="space-y-4">
                {/* Categories Row switcher */}
                <div className="flex gap-1 overflow-x-auto pb-1 border-b border-white/5 scrollbar-none">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setActiveCategoryTab(cat.id as any)}
                      className={`px-3 py-1 rounded text-[10px] font-bold cursor-pointer transition whitespace-nowrap ${
                        activeCategoryTab === cat.id
                          ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>

                {/* Sub-tab Effects List renders */}
                <div className="space-y-4">
                  {activeCategoryTab === 'cinematic' && (
                    <CinematicEffects
                      activeEffectId={activeEffectId}
                      onSelectEffect={onSelectEffect}
                      searchQuery={searchQuery}
                    />
                  )}

                  {activeCategoryTab === 'camera' && (
                    <CameraEffects
                      activeEffectId={activeEffectId}
                      onSelectEffect={onSelectEffect}
                      searchQuery={searchQuery}
                    />
                  )}

                  {activeCategoryTab === 'blur' && (
                    <BlurEffects
                      activeEffectId={activeEffectId}
                      onSelectEffect={onSelectEffect}
                      searchQuery={searchQuery}
                    />
                  )}

                  {activeCategoryTab === 'glitch' && (
                    <GlitchEffects
                      activeEffectId={activeEffectId}
                      onSelectEffect={onSelectEffect}
                      searchQuery={searchQuery}
                    />
                  )}

                  {activeCategoryTab === 'light' && (
                    <LightEffects
                      activeEffectId={activeEffectId}
                      onSelectEffect={onSelectEffect}
                      searchQuery={searchQuery}
                    />
                  )}
                </div>

                {/* Applied Effect Settings Sliders */}
                {activeEffect && (
                  <div className="rounded-xl border border-sky-500/20 bg-sky-500/5 p-3 space-y-3.5">
                    <div className="flex items-center gap-1 text-[10px] font-semibold text-sky-400 uppercase tracking-wider">
                      <Sliders className="h-3.5 w-3.5" />
                      <span>{activeEffect.name} Settings</span>
                    </div>

                    <div className="space-y-2.5">
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Effect Strength</span>
                          <span>{effectStrength}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={effectStrength}
                          onChange={(e) => onEffectStrengthChange(Number(e.target.value))}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Render Speed</span>
                          <span>{effectSpeed}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={effectSpeed}
                          onChange={(e) => onEffectSpeedChange(Number(e.target.value))}
                          className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>
                    </div>
                    <p className="text-[9px] text-slate-500 leading-normal italic">
                      "{activeEffect.description}"
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Transitions tab */}
            {activeSubTab === 'transitions' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => onSelectTransition(null)}
                    className={`p-3 rounded-xl border text-center transition cursor-pointer h-24 flex flex-col justify-center items-center ${
                      !activeTransitionId
                        ? 'bg-sky-500/10 border-sky-400/60 text-sky-400 font-semibold'
                        : 'bg-slate-900/30 border-white/5 hover:border-white/10 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span className="text-xl mb-1">🚫</span>
                    <span className="text-[10px]">No Transition</span>
                  </button>

                  {filteredTransitions.map((transition: TransitionSample) => {
                    const isSelected = transition.id === activeTransitionId;
                    return (
                      <button
                        key={transition.id}
                        type="button"
                        onClick={() => onSelectTransition(transition.id)}
                        className={`p-3 rounded-xl border text-left transition cursor-pointer h-24 flex flex-col justify-between ${
                          isSelected
                            ? 'bg-sky-500/10 border-sky-400/60 text-sky-400 font-semibold shadow-glow scale-102'
                            : 'bg-slate-900/30 border-white/5 hover:border-white/10 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <div className="flex justify-between w-full">
                          <span className="text-xl">{transition.icon}</span>
                          <span className="text-[8px] px-1 bg-slate-900/80 border border-white/5 rounded text-slate-500 font-mono">{transition.type}</span>
                        </div>
                        <div className="w-full truncate text-[10px] font-semibold text-slate-200">{transition.name}</div>
                      </button>
                    );
                  })}
                </div>

                {activeTransition && (
                  <div className="rounded-xl border border-sky-500/20 bg-sky-500/5 p-3 space-y-3">
                    <div className="flex items-center gap-1.5 text-[10px] font-semibold text-sky-400 uppercase tracking-wider">
                      <Sliders className="h-3.5 w-3.5" />
                      <span>Transition Timing</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Default Duration</span>
                      <span className="font-mono text-slate-200 bg-slate-900 border border-white/15 px-2 py-0.5 rounded">
                        {activeTransition.defaultDuration} seconds
                      </span>
                    </div>
                    <p className="text-[9px] text-slate-500 leading-normal italic">
                      "{activeTransition.description}"
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
export default Effects;
