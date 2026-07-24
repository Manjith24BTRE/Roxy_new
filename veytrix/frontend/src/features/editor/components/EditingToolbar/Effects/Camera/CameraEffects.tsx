import React from 'react';
import { Check } from 'lucide-react';

export interface CameraEffect {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export const CAMERA_EFFECTS: CameraEffect[] = [
  { id: 'handheld-camera', name: 'Handheld Camera', description: 'Simulates organic human hand tremors and soft drift sway.', icon: '🤳' },
  { id: 'camera-shake', name: 'Camera Shake', description: 'High frequency shake representing impacts, steps, or rumble.', icon: '📳' },
  { id: 'camera-jitter', name: 'Camera Jitter', description: 'Irregular position jumps for fast action sequences.', icon: '🗯️' },
  { id: 'crash-zoom', name: 'Crash Zoom', description: 'Rapid focal length magnification for quick visual punch-ins.', icon: '💥' },
  { id: 'dolly-zoom', name: 'Dolly Zoom', description: 'Vertigo effect warping focal length while tracking reverse coordinates.', icon: '🌀' },
  { id: 'push-in', name: 'Push In', description: 'Steady slow forward push movement toward active subjects.', icon: '🔎' },
  { id: 'pull-out', name: 'Pull Out', description: 'Steady slow backward zoom pulling focus back from subjects.', icon: '🔍' },
  { id: 'camera-pan-left', name: 'Camera Pan Left', description: 'Rotational panning sweep moving viewport focus left.', icon: '⬅️' },
  { id: 'camera-pan-right', name: 'Camera Pan Right', description: 'Rotational panning sweep moving viewport focus right.', icon: '➡️' },
  { id: 'camera-tilt-up', name: 'Camera Tilt Up', description: 'Vertical pivot rotation looking upward.', icon: '⬆️' },
  { id: 'camera-tilt-down', name: 'Camera Tilt Down', description: 'Vertical pivot rotation looking downward.', icon: '⬇️' },
  { id: 'orbit-camera', name: 'Orbit Camera', description: 'Circular orbital track path around center focus points.', icon: '🔄' },
  { id: 'follow-camera', name: 'Follow Camera', description: 'Locks viewport movement offsets relative to subjects.', icon: '🏃' },
  { id: 'tracking-camera', name: 'Tracking Camera', description: 'Smooth sideways trucking pans to follow action.', icon: '🚶' },
  { id: 'cinematic-zoom', name: 'Cinematic Zoom', description: 'Slow dramatic zoom in matching widescreen films.', icon: '📽️' },
  { id: 'rack-focus', name: 'Rack Focus', description: 'Focal depth shift from foreground to background.', icon: '👓' },
  { id: 'lens-focus', name: 'Lens Focus', description: 'Simulates lens autofocus hunting and correction.', icon: '👁️' },
  { id: 'camera-roll', name: 'Camera Roll', description: 'Tilts the camera landscape angle left/right.', icon: '📐' },
  { id: 'camera-spin', name: 'Camera Spin', description: 'Quick rotational spin transitions on the Z-axis.', icon: '💫' },
  { id: 'dynamic-camera', name: 'Dynamic Camera', description: 'Combines hand movements and zooms automatically.', icon: '🎢' }
];

interface CameraEffectsProps {
  activeEffectId: string | null;
  onSelectEffect: (id: string | null) => void;
  searchQuery: string;
}

export function CameraEffects({ activeEffectId, onSelectEffect, searchQuery }: CameraEffectsProps) {
  const filtered = CAMERA_EFFECTS.filter((e) =>
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
export default CameraEffects;
