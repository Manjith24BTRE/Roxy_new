import React, { useState, useRef, useEffect } from 'react';
import { Check, Star } from 'lucide-react';
import { EffectThumbnail } from '../EffectThumbnail';

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
                  {/* Effect Thumbnail Preview */}
                  <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-[#060910] border border-white/10 flex items-center justify-center mb-2 flex-shrink-0">
                    <EffectThumbnail preset={{ id: effect.id, name: effect.name, category: category, description: effect.description }} />

                    {/* Effect Badge (New) */}
                    {effect.isNew && (
                      <span className="absolute top-1 left-1.5 z-30 bg-sky-500 text-white text-[7px] font-black tracking-wider uppercase px-1.5 py-0.5 rounded shadow-[0_0_8px_rgba(14,165,233,0.5)] select-none">
                        New
                      </span>
                    )}

                    {/* Favorite star */}
                    <button
                      type="button"
                      onClick={(e) => toggleFavorite(effect.id, e)}
                      className="absolute top-1 right-1 p-1 rounded-md bg-slate-950/60 hover:bg-slate-950/95 border border-white/10 text-slate-400 hover:text-yellow-400 cursor-pointer transition-all z-30"
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
