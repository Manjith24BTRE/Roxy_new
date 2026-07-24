import React from 'react';
import { Check } from 'lucide-react';

export interface LightEffect {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export const LIGHT_EFFECTS: LightEffect[] = [
  { id: 'light-leak', name: 'Light Leak', description: 'Simulates analog film stock exposure to stray light rays.', icon: '🕯️' },
  { id: 'lens-flare', name: 'Lens Flare', description: 'Classic cinematic multi-element ring flare from bright sources.', icon: '✨' },
  { id: 'sun-rays', name: 'Sun Rays', description: 'Beams of golden light streaming down through clouds.', icon: '☀️' },
  { id: 'glow', name: 'Glow', description: 'Diffused bright light halo wrapping around subject borders.', icon: '🌟' },
  { id: 'bloom', name: 'Bloom', description: 'Feathers bright highlights to bleed over darker surroundings.', icon: '🌸' },
  { id: 'soft-light', name: 'Soft Light', description: 'Gentle low-intensity ambient exposure lift.', icon: '💡' },
  { id: 'neon-glow', name: 'Neon Glow', description: 'Vibrant self-illuminating colors surrounding shapes.', icon: '🚨' },
  { id: 'flash-light', name: 'Flash Light', description: 'Intense short bursts of complete screen whiteouts.', icon: '⚡' },
  { id: 'spotlight', name: 'Spotlight', description: 'Circular cone of bright focus lighting with dark vignetting.', icon: '🔦' },
  { id: 'rainbow-light', name: 'Rainbow Light', description: 'Prismatic spectral refraction stripes crossing the frame.', icon: '🌈' },
  { id: 'golden-glow', name: 'Golden Glow', description: 'Rich amber-gold ambient highlights for warm portraits.', icon: '👑' },
  { id: 'blue-glow', name: 'Blue Glow', description: 'Electric cyan highlights giving high-tech cyber feeling.', icon: '🔵' },
  { id: 'pink-glow', name: 'Pink Glow', description: 'Warm magenta/pink soft light overlay.', icon: '🔴' },
  { id: 'orange-glow', name: 'Orange Glow', description: 'Fiery orange light wash mimicking campfire warmth.', icon: '🟠' },
  { id: 'light-burst', name: 'Light Burst', description: 'Luminous light beams exploding from high-contrast spots.', icon: '💥' },
  { id: 'prism-light', name: 'Prism Light', description: 'Rainbow chromatic dispersion edges around subjects.', icon: '💎' },
  { id: 'aurora-glow', name: 'Aurora Glow', description: 'Wavy green and purple volumetric skies.', icon: '🌌' },
  { id: 'light-reflection', name: 'Light Reflection', description: 'Specular water-like light reflections bouncing upward.', icon: '🌊' },
  { id: 'volumetric-light', name: 'Volumetric Light', description: 'Dust particles caught inside thick beams of spotlights.', icon: '🌫️' },
  { id: 'god-rays', name: 'God Rays', description: 'Epic crepuscular shafts of light drawing drama.', icon: '⛪' }
];

interface LightEffectsProps {
  activeEffectId: string | null;
  onSelectEffect: (id: string | null) => void;
  searchQuery: string;
}

export function LightEffects({ activeEffectId, onSelectEffect, searchQuery }: LightEffectsProps) {
  const filtered = LIGHT_EFFECTS.filter((e) =>
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
export default LightEffects;
