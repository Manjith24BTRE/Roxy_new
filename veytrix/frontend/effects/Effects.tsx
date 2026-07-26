import React, { useState } from 'react';
import { Sliders, Search } from 'lucide-react';
import { SAMPLE_TRANSITIONS, TransitionSample } from './transitionSamples';
// Force IDE cache refresh for folder casing
import { Filters } from '../filters/Filters';
import { CinematicEffects } from './Cinematic/CinematicEffects';
import { CINEMATIC_EFFECTS } from './Cinematic/CinematicEffects.data';
import { CameraEffects } from './Camera/CameraEffects';
import { CAMERA_EFFECTS } from './Camera/CameraEffects.data';
import { BlurEffects } from './Blur/BlurEffects';
import { BLUR_EFFECTS } from './Blur/BlurEffects.data';
import { GlitchEffects } from './Glitch/GlitchEffects';
import { GLITCH_EFFECTS } from './Glitch/GlitchEffects.data';
import { LightEffects, LIGHT_EFFECTS } from './Light/LightEffects';
import { RetroVHSEffects } from './RetroVHS/RetroVHSEffects';
import { RETRO_VHS_EFFECTS } from './RetroVHS/RetroVHSEffects.data';
import { FireEffects } from './Fire/FireEffects';
import { FIRE_EFFECTS } from './Fire/FireEffects.data';
import { SmokeEffects } from './Smoke/SmokeEffects';
import { SMOKE_EFFECTS } from './Smoke/SmokeEffects.data';
import { WeatherEffects, WEATHER_EFFECTS } from './Weather/WeatherEffects';
import { ParticlesEffects } from './Particles/ParticlesEffects';
import { PARTICLES_EFFECTS } from './Particles/ParticlesEffects.data';
import { Transitions } from '../transitions/Transitions';
import { SAMPLE_TRANSITIONS_NEW } from '../transitions/Transitions.data';

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
  const [activeCategoryTab, setActiveCategoryTab] = useState<'cinematic' | 'camera' | 'blur' | 'glitch' | 'light' | 'retro-vhs' | 'fire' | 'smoke' | 'weather' | 'particles'>('blur');
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
    LIGHT_EFFECTS.find((e) => e.id === activeEffectId) ||
    RETRO_VHS_EFFECTS.find((e) => e.id === activeEffectId) ||
    FIRE_EFFECTS.find((e) => e.id === activeEffectId) ||
    SMOKE_EFFECTS.find((e) => e.id === activeEffectId) ||
    WEATHER_EFFECTS.find((e) => e.id === activeEffectId) ||
    PARTICLES_EFFECTS.find((e) => e.id === activeEffectId);

  const activeTransition = 
    SAMPLE_TRANSITIONS_NEW.find((t) => t.id === activeTransitionId) ||
    SAMPLE_TRANSITIONS.find((t: TransitionSample) => t.id === activeTransitionId);

  const categories = [
    { id: 'blur', name: 'Blur' },
    { id: 'camera', name: 'Camera' },
    { id: 'cinematic', name: 'Cinematic' },
    { id: 'fire', name: '🔥 Fire' },
    { id: 'glitch', name: 'Glitch' },
    { id: 'light', name: 'Light' },
    { id: 'particles', name: '✨ Particles' },
    { id: 'retro-vhs', name: '📼 Retro & VHS' },
    { id: 'smoke', name: '💨 Smoke' },
    { id: 'weather', name: '🌧 Weather' }
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

                  {activeCategoryTab === 'retro-vhs' && (
                    <RetroVHSEffects
                      activeEffectId={activeEffectId}
                      onSelectEffect={onSelectEffect}
                      searchQuery={searchQuery}
                    />
                  )}

                  {activeCategoryTab === 'fire' && (
                    <FireEffects
                      activeEffectId={activeEffectId}
                      onSelectEffect={onSelectEffect}
                      searchQuery={searchQuery}
                    />
                  )}

                  {activeCategoryTab === 'smoke' && (
                    <SmokeEffects
                      activeEffectId={activeEffectId}
                      onSelectEffect={onSelectEffect}
                      searchQuery={searchQuery}
                    />
                  )}

                  {activeCategoryTab === 'weather' && (
                    <WeatherEffects
                      activeEffectId={activeEffectId}
                      onSelectEffect={onSelectEffect}
                      searchQuery={searchQuery}
                    />
                  )}

                  {activeCategoryTab === 'particles' && (
                    <ParticlesEffects
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
              <Transitions
                activeTransitionId={activeTransitionId}
                onSelectTransition={onSelectTransition}
              />
            )}
          </div>
        </>
      )}
    </div>
  );
}
export default Effects;
