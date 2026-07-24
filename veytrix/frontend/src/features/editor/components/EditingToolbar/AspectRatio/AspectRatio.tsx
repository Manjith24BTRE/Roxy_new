import React from 'react';
import { Smartphone, Monitor, Square, Film, Tv, Maximize } from 'lucide-react';

export interface AspectRatioPreset {
  id: string;
  name: string;
  ratio: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  previewClass: string; // Tailored styling for the small preset preview box
}

export const ASPECT_RATIOS: AspectRatioPreset[] = [
  {
    id: 'original',
    name: 'Original (Fit)',
    ratio: 'fit',
    label: 'Source Aspect Ratio',
    description: 'Keep the original source dimensions and frame resolution.',
    icon: Maximize,
    previewClass: 'w-8 h-6'
  },
  {
    id: '16-9',
    name: '16:9 Landscape',
    ratio: '16/9',
    label: 'YouTube, TV, Presentations',
    description: 'The standard widescreen aspect ratio for landscape video content.',
    icon: Monitor,
    previewClass: 'w-9 h-5'
  },
  {
    id: '9-16',
    name: '9:16 Portrait',
    ratio: '9/16',
    label: 'TikTok, Reels, Shorts',
    description: 'Optimized for mobile-first viewing and vertical social media feeds.',
    icon: Smartphone,
    previewClass: 'w-4 h-7'
  },
  {
    id: '1-1',
    name: '1:1 Square',
    ratio: '1/1',
    label: 'Instagram Feed, Carousel',
    description: 'Perfect square format popular on social media grids and profiles.',
    icon: Square,
    previewClass: 'w-6 h-6'
  },
  {
    id: '4-5',
    name: '4:5 Vertical',
    ratio: '4/5',
    label: 'Instagram Portrait Post',
    description: 'Slightly taller vertical format optimized for Instagram posts.',
    icon: Tv,
    previewClass: 'w-5 h-6.5'
  },
  {
    id: '21-9',
    name: '21:9 Widescreen',
    ratio: '21/9',
    label: 'Cinematic, Ultra-wide',
    description: 'Ultra-wide cinematic aspect ratio for theatrical and epic feeling edits.',
    icon: Film,
    previewClass: 'w-9.5 h-4'
  }
];

interface AspectRatioProps {
  currentRatio: string;
  onRatioChange: (ratio: string) => void;
}

export function AspectRatio({ currentRatio, onRatioChange }: AspectRatioProps) {
  return (
    <div className="flex flex-col h-full bg-[#090d16] text-slate-100 select-none">
      <div className="p-4 border-b border-white/10 bg-[#0c101d] flex-shrink-0">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">Aspect Ratio</h3>
        <p className="text-[10px] text-slate-500 mt-1">Select the frame dimensions for your project export.</p>
      </div>

      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        <div className="grid grid-cols-1 gap-2.5">
          {ASPECT_RATIOS.map((item) => {
            const Icon = item.icon;
            const isSelected = currentRatio === item.ratio;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onRatioChange(item.ratio)}
                className={`flex items-center gap-4 p-3 rounded-xl border text-left transition duration-200 cursor-pointer ${
                  isSelected
                    ? 'bg-sky-500/10 border-sky-400/60 shadow-glow text-white'
                    : 'bg-slate-900/50 border-white/5 hover:border-white/15 text-slate-400 hover:text-slate-200 hover:bg-slate-900/80'
                }`}
              >
                {/* Visual shape representation */}
                <div className="w-14 h-14 rounded-lg bg-black/40 border border-white/10 flex items-center justify-center flex-shrink-0">
                  <div className={`rounded bg-sky-500/20 border-2 ${isSelected ? 'border-sky-400 bg-sky-500/30' : 'border-slate-500/40'} ${item.previewClass} transition-all duration-300`} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <Icon className={`h-3.5 w-3.5 ${isSelected ? 'text-sky-400' : 'text-slate-500'}`} />
                    <span className="text-xs font-semibold truncate">{item.name}</span>
                  </div>
                  <p className={`text-[10px] truncate mt-0.5 ${isSelected ? 'text-sky-300/80' : 'text-slate-500'}`}>
                    {item.label}
                  </p>
                  <p className="text-[9px] text-slate-400/60 leading-relaxed mt-1 line-clamp-2">
                    {item.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Informative Tip */}
        <div className="rounded-xl bg-slate-950/40 border border-white/5 p-3">
          <h4 className="text-[10px] font-semibold text-slate-400 flex items-center gap-1">
            <span>💡</span> Pro Editing Tip
          </h4>
          <p className="text-[9px] text-slate-500 leading-relaxed mt-1">
            Changing the aspect ratio will dynamically fit and crop clips on your canvas. Use the transform settings in the right inspector to fine-tune placement or scale individual clips.
          </p>
        </div>
      </div>
    </div>
  );
}
