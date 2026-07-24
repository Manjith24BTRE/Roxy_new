import React from 'react';
import { Check } from 'lucide-react';

export interface BlurEffect {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export const BLUR_EFFECTS: BlurEffect[] = [
  { id: 'gaussian-blur', name: 'Gaussian Blur', description: 'Standard mathematical blur spreading pixel values evenly.', icon: '🌫️' },
  { id: 'motion-blur', name: 'Motion Blur', description: 'Directional smearing matching camera travel travel speed.', icon: '🏃' },
  { id: 'radial-blur', name: 'Radial Blur', description: 'Circular rotational blur spinning from pivot centers.', icon: '🌀' },
  { id: 'directional-blur', name: 'Directional Blur', description: 'Smears details along specific angle boundaries.', icon: '↗️' },
  { id: 'zoom-blur', name: 'Zoom Blur', description: 'Burst blur expanding outward from center screen coordinates.', icon: '🔎' },
  { id: 'lens-blur', name: 'Lens Blur', description: 'Defocused camera lens simulation with custom iris shapes.', icon: '👓' },
  { id: 'soft-blur', name: 'Soft Blur', description: 'Subtle dreaming blur preserving edge values.', icon: '🌸' },
  { id: 'dream-blur', name: 'Dream Blur', description: 'Diffused bright glow layers overlaid on blurry scenes.', icon: '💭' },
  { id: 'background-blur', name: 'Background Blur', description: 'Blurs everything except the key foreground subject.', icon: '👤' },
  { id: 'tilt-shift', name: 'Tilt Shift', description: 'Linear selective focus blur giving miniature landscape scales.', icon: '🚃' },
  { id: 'edge-blur', name: 'Edge Blur', description: 'Blurs only the outer borders of the frame.', icon: '🖼️' },
  { id: 'focus-blur', name: 'Focus Blur', description: 'Fades from fully blurry to sharp focus coordinates.', icon: '🎯' },
  { id: 'glow-blur', name: 'Glow Blur', description: 'Luminous highlights smeared with high-radius gaussian blends.', icon: '✨' },
  { id: 'speed-blur', name: 'Speed Blur', description: 'Dynamic directional travel smear for chase sequences.', icon: '⚡' },
  { id: 'bokeh-blur', name: 'Bokeh Blur', description: 'Renders circle-of-confusion light shapes on dark areas.', icon: '⭐' },
  { id: 'pixel-blur', name: 'Pixel Blur', description: 'Mosaic-like pixelated blur dividing clips into blocks.', icon: '👾' },
  { id: 'smart-blur', name: 'Smart Blur', description: 'Blur that actively preserves outline borders and faces.', icon: '🧠' },
  { id: 'iris-blur', name: 'Iris Blur', description: 'Radial focus blur masking oval shapes.', icon: '👁️' },
  { id: 'smooth-blur', name: 'Smooth Blur', description: 'Bilateral texture blur reducing video noise.', icon: '🛁' },
  { id: 'blur-fade', name: 'Blur Fade', description: 'Soft crossfade transition moving from blur to clear.', icon: '🕯️' }
];

interface BlurEffectsProps {
  activeEffectId: string | null;
  onSelectEffect: (id: string | null) => void;
  searchQuery: string;
}

export function BlurEffects({ activeEffectId, onSelectEffect, searchQuery }: BlurEffectsProps) {
  const filtered = BLUR_EFFECTS.filter((e) =>
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
export default BlurEffects;
