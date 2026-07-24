import React from 'react';
import { Check } from 'lucide-react';

export interface GlitchEffect {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export const GLITCH_EFFECTS: GlitchEffect[] = [
  { id: 'rgb-glitch', name: 'RGB Glitch', description: 'Splits red, green, and blue color channels with dynamic shakes.', icon: '👾' },
  { id: 'digital-glitch', name: 'Digital Glitch', description: 'Blocky digital compression artifacts and rendering errors.', icon: '🖥️' },
  { id: 'vhs-glitch', name: 'VHS Glitch', description: 'Tape distortion tracking bars, noise lines, and sync glitches.', icon: '📼' },
  { id: 'tv-glitch', name: 'TV Glitch', description: 'Cathode-ray tube screen flicker and analog signal drift.', icon: '📺' },
  { id: 'analog-glitch', name: 'Analog Glitch', description: 'Continuous wavy lines representing antenna sync errors.', icon: '📻' },
  { id: 'pixel-glitch', name: 'Pixel Glitch', description: 'Scattered rectangular pixel blocks shuffling positions.', icon: '🟩' },
  { id: 'screen-tear', name: 'Screen Tear', description: 'Splits frame lines horizontally with buffer delay mismatch.', icon: '✂️' },
  { id: 'static-noise', name: 'Static Noise', description: 'Salt-and-pepper grain static overlay mimicking dead air.', icon: '🌫️' },
  { id: 'data-corruption', name: 'Data Corruption', description: 'Raw byte blocks overlaid as random glitch art colors.', icon: '💾' },
  { id: 'signal-loss', name: 'Signal Loss', description: 'Flickering color bars indicating connection failures.', icon: '📳' },
  { id: 'rgb-split', name: 'RGB Split', description: 'Fixed offset chromatic aberration on high contrast edges.', icon: '🌈' },
  { id: 'digital-distortion', name: 'Digital Distortion', description: 'Warped vector lines bending subjects out of shape.', icon: '🌀' },
  { id: 'matrix-glitch', name: 'Matrix Glitch', description: 'Falling green code streams overlaying digital details.', icon: '🎛️' },
  { id: 'scan-lines', name: 'Scan Lines', description: 'Standard horizontal grid overlay mimicking interlace monitors.', icon: '📊' },
  { id: 'error-screen', name: 'Error Screen', description: 'Flashes system warning dialogue cards or code screens.', icon: '⚠️' },
  { id: 'tv-noise', name: 'TV Noise', description: 'Snow storm static grain balancing luminance values.', icon: '❄️' },
  { id: 'frame-skip', name: 'Frame Skip', description: 'Simulates dropped rendering frames and stuttering actions.', icon: '⏳' },
  { id: 'chromatic-shift', name: 'Chromatic Shift', description: 'Continuous color channel shifts on motion sweeps.', icon: '💫' },
  { id: 'hologram-glitch', name: 'Hologram Glitch', description: 'Sci-fi grid scans and blue flickering glow lines.', icon: '🤖' },
  { id: 'neon-glitch', name: 'Neon Glitch', description: 'High brightness color sparks discharging from edges.', icon: '🚨' }
];

interface GlitchEffectsProps {
  activeEffectId: string | null;
  onSelectEffect: (id: string | null) => void;
  searchQuery: string;
}

export function GlitchEffects({ activeEffectId, onSelectEffect, searchQuery }: GlitchEffectsProps) {
  const filtered = GLITCH_EFFECTS.filter((e) =>
    e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="grid grid-cols-2 gap-2.5 max-h-[360px] overflow-y-auto pr-1">
      {filtered.map((effect) => {
        const isActive = activeEffectId === effect.id;
        return (
          <div
            key={effect.id}
            className={`p-3 rounded-xl border flex flex-col justify-between transition-all duration-200 bg-slate-900/40 border-white/5 hover:border-white/15`}
          >
            <div className="flex gap-2">
              <div className="w-10 h-10 rounded-lg bg-[#060910] border border-white/10 flex items-center justify-center text-xl flex-shrink-0">
                {effect.icon}
              </div>
              <div className="min-w-0">
                <span className="text-xs font-semibold text-slate-200 block truncate">{effect.name}</span>
                <p className="text-[8px] text-slate-500 line-clamp-2 mt-0.5 leading-normal">{effect.description}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onSelectEffect(isActive ? null : effect.id)}
              className={`w-full py-1 mt-2.5 rounded text-[10px] font-bold flex items-center justify-center gap-1 cursor-pointer transition ${
                isActive
                  ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                  : 'bg-[#151b2e] hover:bg-[#1a233d] text-slate-300'
              }`}
            >
              {isActive ? (
                <>
                  <Check className="h-3 w-3" />
                  <span>Applied</span>
                </>
              ) : (
                <span>Apply</span>
              )}
            </button>
          </div>
        );
      })}
    </div>
  );
}
export default GlitchEffects;
