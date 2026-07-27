import React, { useState, useRef, useEffect } from 'react';
import { Check, Star } from 'lucide-react';

export interface EffectItem {
  id: string;
  name: string;
  description: string;
  icon: string;
  isNew?: boolean;
  colorGrading?: string;
}

interface EffectGridProps {
  effects: EffectItem[];
  activeEffectId: string | null;
  onSelectEffect: (id: string | null) => void;
  searchQuery: string;
  category: string;
}

export function EffectGrid({
  effects,
  activeEffectId,
  onSelectEffect,
  searchQuery,
  category
}: EffectGridProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('veytrix_favorite_effects') || '[]');
    } catch {
      return [];
    }
  });

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  };

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites(prev => {
      const updated = prev.includes(id) ? prev.filter(fid => fid !== id) : [...prev, id];
      localStorage.setItem('veytrix_favorite_effects', JSON.stringify(updated));
      return updated;
    });
  };

  // Filter effects based on search query
  const filtered = effects.filter((e) =>
    e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Virtual Scrolling configuration
  const rowHeight = 175; // Approx height of each grid card + gap
  const itemsPerRow = 2;
  const viewportHeight = 360;
  const totalRows = Math.ceil(filtered.length / itemsPerRow);
  const startRow = Math.max(0, Math.floor(scrollTop / rowHeight) - 1);
  const endRow = Math.min(totalRows, Math.ceil((scrollTop + viewportHeight) / rowHeight) + 1);

  const visibleItems = filtered.slice(startRow * itemsPerRow, endRow * itemsPerRow);
  const topPadding = startRow * rowHeight;
  const bottomPadding = Math.max(0, (totalRows - endRow) * rowHeight);

  // Animated overlays for preview placeholders on hover
  const getPreviewOverlay = (cat: string) => {
    switch (cat) {
      case 'retro-vhs':
        return (
          <div className="absolute inset-0 bg-slate-900 overflow-hidden flex flex-col justify-between p-1.5 pointer-events-none">
            {/* Color channels offset emulation */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/10 to-red-500/10 animate-pulse pointer-events-none" />
            {/* Scanline overlay */}
            <div className="absolute inset-0 bg-repeat bg-center opacity-[0.12] pointer-events-none"
                 style={{ backgroundImage: 'repeating-linear-gradient(0deg, #fff, #fff 1px, transparent 1px, transparent 3px)' }} />
            {/* Flickering noise */}
            <div className="absolute inset-0 bg-white/5 animate-[vhsFlicker_0.15s_infinite] pointer-events-none" />
            <div className="text-[7px] font-mono text-emerald-400 select-none flex justify-between w-full z-10">
              <span>PLAY ▶</span>
              <span>00:12:45</span>
            </div>
            <div className="text-[7px] font-mono text-emerald-400 select-none z-10">
              <span>VHS L-FI</span>
            </div>
            <style>{`
              @keyframes vhsFlicker {
                0% { opacity: 0.05; }
                50% { opacity: 0.15; }
                100% { opacity: 0.05; }
              }
            `}</style>
          </div>
        );
      case 'fire':
        return (
          <div className="absolute inset-0 bg-slate-900 overflow-hidden flex items-end justify-center pointer-events-none">
            {/* Core fire gradient glow */}
            <div className="absolute bottom-0 w-full h-1/2 bg-gradient-to-t from-red-600 via-orange-500 to-yellow-400 opacity-60 blur-md animate-pulse" />
            {/* Spark ember particles */}
            <div className="absolute inset-0 flex justify-around pointer-events-none">
              <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-[ember_1s_infinite_ease-in-out_0.1s] opacity-80" />
              <span className="w-1 h-1 bg-orange-500 rounded-full animate-[ember_1.2s_infinite_ease-in-out_0.4s] opacity-90" />
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-[ember_0.8s_infinite_ease-in-out_0.2s] opacity-70" />
              <span className="w-1 h-1 bg-yellow-300 rounded-full animate-[ember_1.5s_infinite_ease-in-out_0.6s] opacity-80" />
            </div>
            <style>{`
              @keyframes ember {
                0% { transform: translateY(50px) scale(0.6); opacity: 1; }
                100% { transform: translateY(-20px) scale(1.2); opacity: 0; }
              }
            `}</style>
          </div>
        );
      case 'smoke':
        return (
          <div className="absolute inset-0 bg-slate-900 overflow-hidden pointer-events-none">
            {/* Drifting smoke clouds */}
            <div className="absolute inset-0 bg-gradient-to-tr from-slate-600/20 via-slate-400/10 to-transparent blur-lg animate-[smokeDrift_3s_infinite_linear]" />
            <div className="absolute inset-0 bg-gradient-to-bl from-slate-500/10 via-slate-300/10 to-transparent blur-md animate-[smokeDrift_2s_infinite_linear_0.5s]" />
            <style>{`
              @keyframes smokeDrift {
                0% { transform: translate(-10%, 10%) scale(1); opacity: 0.3; }
                50% { transform: translate(10%, -10%) scale(1.2); opacity: 0.6; }
                100% { transform: translate(-10%, 10%) scale(1); opacity: 0.3; }
              }
            `}</style>
          </div>
        );
      case 'weather':
        return (
          <div className="absolute inset-0 bg-slate-900 overflow-hidden pointer-events-none">
            {/* Weather Overlay simulation (e.g. falling rain/snow) */}
            <div className="absolute inset-0 bg-sky-950/20" />
            <div className="absolute inset-0 flex justify-between px-2">
              <div className="w-[1px] h-6 bg-white/20 transform rotate-12 animate-[rainDrop_0.8s_infinite_linear_0.1s]" />
              <div className="w-[1.5px] h-8 bg-white/30 transform rotate-12 animate-[rainDrop_0.6s_infinite_linear_0.3s]" />
              <div className="w-[1px] h-5 bg-white/20 transform rotate-12 animate-[rainDrop_0.9s_infinite_linear_0.5s]" />
              <div className="w-[1.2px] h-7 bg-white/25 transform rotate-12 animate-[rainDrop_0.7s_infinite_linear_0.2s]" />
              <div className="w-[1px] h-6 bg-white/15 transform rotate-12 animate-[rainDrop_1s_infinite_linear_0.4s]" />
            </div>
            <style>{`
              @keyframes rainDrop {
                0% { transform: translateY(-30px) rotate(12deg); opacity: 0.8; }
                100% { transform: translateY(60px) rotate(12deg); opacity: 0; }
              }
            `}</style>
          </div>
        );
      case 'particles':
        return (
          <div className="absolute inset-0 bg-slate-900 overflow-hidden pointer-events-none flex justify-around items-end">
            {/* Rising glowing dust particles */}
            <span className="w-1.5 h-1.5 bg-sky-400 rounded-full shadow-[0_0_8px_#38bdf8] animate-[floatParticle_2s_infinite_ease-out_0.2s]" />
            <span className="w-2 h-2 bg-indigo-400 rounded-full shadow-[0_0_10px_#818cf8] animate-[floatParticle_2.5s_infinite_ease-out_0.8s]" />
            <span className="w-1.5 h-1.5 bg-purple-400 rounded-full shadow-[0_0_8px_#c084fc] animate-[floatParticle_1.8s_infinite_ease-out_0.4s]" />
            <span className="w-1 h-1 bg-pink-400 rounded-full shadow-[0_0_6px_#f472b6] animate-[floatParticle_3s_infinite_ease-out_1.2s]" />
            <style>{`
              @keyframes floatParticle {
                0% { transform: translateY(20px) scale(0.6); opacity: 0; }
                50% { opacity: 0.8; }
                100% { transform: translateY(-50px) scale(1.3); opacity: 0; }
              }
            `}</style>
          </div>
        );
      default:
        return (
          <div className="absolute inset-0 bg-slate-900/60 blur-xs overflow-hidden flex items-center justify-center pointer-events-none">
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Veytrix FX</span>
          </div>
        );
    }
  };

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="max-h-[360px] overflow-y-auto pr-1 scrollbar-thin scrollbar-track-slate-900 scrollbar-thumb-white/10"
    >
      <div style={{ paddingTop: topPadding, paddingBottom: bottomPadding }}>
        {filtered.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-xs italic">
            No effects found matching "{searchQuery}"
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2.5">
            {visibleItems.map((effect) => {
              const isActive = activeEffectId === effect.id;
              const isFavorite = favorites.includes(effect.id);

              return (
                <div
                  key={effect.id}
                  className={`p-2.5 rounded-xl border flex flex-col justify-between transition-all duration-200 bg-slate-900/40 border-white/5 hover:border-white/15 group relative`}
                >
                  {/* Preview Placeholder with lazy hover animations */}
                  <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-[#060910] border border-white/10 flex items-center justify-center mb-2 flex-shrink-0">
                    {/* Effect Badge (New) */}
                    {effect.isNew && (
                      <span className="absolute top-1 left-1.5 z-20 bg-sky-500 text-white text-[7px] font-black tracking-wider uppercase px-1.5 py-0.5 rounded shadow-[0_0_8px_rgba(14,165,233,0.5)] select-none">
                        New
                      </span>
                    )}

                    {/* Emoji Thumbnail */}
                    <div className="text-xl group-hover:scale-110 transition-transform duration-300 z-10 select-none">
                      {effect.icon}
                    </div>

                    {/* High-fidelity hover overlay */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                      {getPreviewOverlay(category)}
                    </div>

                    {/* Favorite star */}
                    <button
                      type="button"
                      onClick={(e) => toggleFavorite(effect.id, e)}
                      className="absolute top-1 right-1 p-1 rounded-md bg-slate-950/60 hover:bg-slate-950/95 border border-white/10 text-slate-400 hover:text-yellow-400 cursor-pointer transition-all z-20"
                    >
                      <Star
                        className={`h-3 w-3 ${isFavorite ? 'fill-yellow-400 text-yellow-400' : 'text-slate-400'}`}
                      />
                    </button>
                  </div>

                  {/* Name and Description */}
                  <div className="min-w-0 px-0.5 flex-1 mb-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold text-slate-200 truncate block">
                        {effect.name}
                      </span>
                    </div>
                    <p className="text-[8.5px] text-slate-500 line-clamp-2 mt-0.5 leading-normal">
                      {effect.description}
                    </p>
                  </div>

                  {/* Apply Button */}
                  <button
                    type="button"
                    onClick={() => onSelectEffect(isActive ? null : effect.id)}
                    className={`w-full py-1 rounded text-[10px] font-bold flex items-center justify-center gap-1 cursor-pointer transition ${
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
        )}
      </div>
    </div>
  );
}
