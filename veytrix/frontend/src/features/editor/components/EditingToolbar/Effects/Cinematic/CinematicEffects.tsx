import React from 'react';
import { Sparkles, Check } from 'lucide-react';

export interface CinematicEffect {
  id: string;
  name: string;
  description: string;
  icon: string;
  colorGrading: string; // CSS Filter representation
}

export const CINEMATIC_EFFECTS: CinematicEffect[] = [
  { id: 'cinematic-lut', name: 'Cinematic LUT', description: 'Standard high-fidelity lookup table color profile.', icon: '🎬', colorGrading: 'contrast(1.1) saturate(1.1)' },
  { id: 'hollywood-look', name: 'Hollywood Look', description: 'Warm skin tones and cyan shadow grading.', icon: '🌟', colorGrading: 'contrast(1.15) hue-rotate(-5deg) saturate(1.05)' },
  { id: 'blockbuster', name: 'Blockbuster', description: 'High contrast action film look with cold shadow balances.', icon: '💥', colorGrading: 'contrast(1.25) saturate(1.15) brightness(0.95)' },
  { id: 'teal-orange', name: 'Teal & Orange', description: 'Perfect cinematic teal shadows and orange highlight balance.', icon: '🍊', colorGrading: 'contrast(1.2) hue-rotate(-10deg) saturate(1.2)' },
  { id: 'warm-cinema', name: 'Warm Cinema', description: 'Golden film filters for soft daylight sequences.', icon: '🔥', colorGrading: 'sepia(0.2) saturate(1.1) brightness(1.05)' },
  { id: 'cool-cinema', name: 'Cool Cinema', description: 'Cold and clinical styling for dystopian drama scenes.', icon: '❄️', colorGrading: 'hue-rotate(180deg) saturate(0.85) contrast(1.05)' },
  { id: 'golden-hour', name: 'Golden Hour', description: 'Enriched orange sunlight gradients for sunsets.', icon: '🌇', colorGrading: 'sepia(0.35) saturate(1.25) hue-rotate(-15deg)' },
  { id: 'epic-film', name: 'Epic Film', description: 'High saturation dynamic range cinematic filter.', icon: '🏆', colorGrading: 'contrast(1.1) saturate(1.3) brightness(1.02)' },
  { id: 'drama-film', name: 'Drama Film', description: 'Moody color profile with deep shadows and highlighted midtones.', icon: '🎭', colorGrading: 'contrast(1.2) saturate(0.9) brightness(0.98)' },
  { id: 'noir', name: 'Noir', description: 'Classic high contrast monochrome silver screen layout.', icon: '🕶️', colorGrading: 'grayscale(1) contrast(1.5) brightness(0.9)' },
  { id: 'moody-cinema', name: 'Moody Cinema', description: 'Desaturated tones with strong dark contrast values.', icon: '🌙', colorGrading: 'contrast(1.25) saturate(0.7) brightness(0.9)' },
  { id: 'vintage-cinema', name: 'Vintage Cinema', description: 'Retro 8mm format with sepia textures and low saturation.', icon: '📹', colorGrading: 'sepia(0.4) saturate(0.8) contrast(0.9)' },
  { id: 'film-fade', name: 'Film Fade', description: 'Lifted black coordinates for a vintage faded look.', icon: '🌫️', colorGrading: 'brightness(1.05) contrast(0.85) sepia(0.1)' },
  { id: 'dream-cinema', name: 'Dream Cinema', description: 'Soft glow color values with high brightness limits.', icon: '💭', colorGrading: 'brightness(1.1) saturate(1.15) contrast(0.95)' },
  { id: 'soft-cinema', name: 'Soft Cinema', description: 'Low contrast clean film look for romantic narratives.', icon: '🌸', colorGrading: 'contrast(0.9) saturate(1.05) brightness(1.02)' },
  { id: 'dark-cinema', name: 'Dark Cinema', description: 'Low exposure with high shadow preservation details.', icon: '⬛', colorGrading: 'brightness(0.85) contrast(1.1) saturate(0.95)' },
  { id: 'hdr-cinema', name: 'HDR Cinema', description: 'Balanced contrast ranges to maximize exposure details.', icon: '📺', colorGrading: 'contrast(1.05) saturate(1.2) brightness(1.05)' },
  { id: 'high-contrast-cinema', name: 'High Contrast Cinema', description: 'Strong black-and-white points for intense action scenes.', icon: '⚡', colorGrading: 'contrast(1.3) saturate(1.1)' },
  { id: 'low-contrast-film', name: 'Low Contrast Film', description: 'Soft desaturated style mimicking raw analog footage.', icon: '🎞️', colorGrading: 'contrast(0.8) saturate(0.9)' },
  { id: 'indie-film', name: 'Indie Film', description: 'Green-tinted cold look inspired by independent cinema.', icon: '🍀', colorGrading: 'hue-rotate(15deg) saturate(0.95) contrast(1.1)' }
];

interface CinematicEffectsProps {
  activeEffectId: string | null;
  onSelectEffect: (id: string | null) => void;
  searchQuery: string;
}

export function CinematicEffects({ activeEffectId, onSelectEffect, searchQuery }: CinematicEffectsProps) {
  const filtered = CINEMATIC_EFFECTS.filter((e) =>
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
export default CinematicEffects;
