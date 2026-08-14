import React, { useState, useRef, useEffect } from 'react';
import { Search, Star, Sliders, LayoutGrid, List, RotateCcw, Clock, Move, Eye, Sparkles } from 'lucide-react';
import { TransitionItem } from './Transitions.types';
import { SAMPLE_TRANSITIONS_NEW } from './Transitions.data';
import { TransitionThumbnail } from './TransitionThumbnail';
import { TransitionGalleryModal } from './TransitionGalleryModal';

interface TransitionsProps {
  activeTransitionId: string | null;
  onSelectTransition: (id: string | null) => void;
  searchQuery?: string;
  showBeforeOnly?: boolean;
  onShowBeforeOnlyChange?: (showBefore: boolean) => void;
}

const CATEGORIES = [
  { id: 'all', name: '⚡ All', icon: '⚡' },
  { id: 'favorites', name: '⭐ Favorites', icon: '⭐' },
  { id: 'basic', name: '🌫️ Basic', icon: '🌫️' },
  { id: 'camera', name: '📷 Camera', icon: '📷' },
  { id: 'zoom', name: '🔍 Zoom', icon: '🔍' },
  { id: 'slide', name: '➡️ Slide', icon: '➡️' },
  { id: 'spin', name: '🔄 Spin', icon: '🔄' },
  { id: 'blur', name: '🌫️ Blur', icon: '🌫️' },
  { id: 'glitch', name: '⚡ Glitch', icon: '⚡' },
  { id: 'light', name: '✨ Cinematic', icon: '✨' }
];

export function Transitions({
  activeTransitionId,
  onSelectTransition,
  searchQuery = '',
  showBeforeOnly = false,
  onShowBeforeOnlyChange
}: TransitionsProps) {
  // UI states
  const [internalQuery, setInternalQuery] = useState(searchQuery);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isGridView, setIsGridView] = useState<boolean>(true);
  const [isGalleryOpen, setIsGalleryOpen] = useState<boolean>(false);
  
  // Storage states
  const [favorites, setFavorites] = useState<string[]>([]);
  const [recentTransitions, setRecentTransitions] = useState<string[]>([]);

  // Selected parameters panel state
  const [duration, setDuration] = useState<number>(0.8);
  const [speed, setSpeed] = useState<number>(1.0);
  const [intensity, setIntensity] = useState<number>(50);
  const [direction, setDirection] = useState<'left' | 'right' | 'up' | 'down' | 'cw' | 'ccw' | 'center' | 'none'>('none');
  const [easing, setEasing] = useState<'linear' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'elastic' | 'bounce'>('ease-in-out');
  const [motionBlur, setMotionBlur] = useState<boolean>(true);

  // Scroll Container Ref for virtualization
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState<number>(0);
  const [containerHeight, setContainerHeight] = useState<number>(360);

  // Load storage configurations on mount
  useEffect(() => {
    try {
      const savedFavorites = localStorage.getItem('veytrix_favorite_transitions');
      if (savedFavorites) setFavorites(JSON.parse(savedFavorites));

      const savedRecents = localStorage.getItem('veytrix_recent_transitions');
      if (savedRecents) setRecentTransitions(JSON.parse(savedRecents));
    } catch (e) {
      console.error('Failed to load transition storage metadata', e);
    }
  }, []);

  // Update active transition details when selection changes
  useEffect(() => {
    if (activeTransitionId) {
      const activeItem = SAMPLE_TRANSITIONS_NEW.find(t => t.id === activeTransitionId);
      if (activeItem) {
        setDuration(activeItem.defaultDuration);
        setSpeed(activeItem.speed ?? 1.0);
        setIntensity(activeItem.intensity ?? 50);
        setDirection(activeItem.direction ?? 'none');
        setEasing(activeItem.easing ?? 'ease-in-out');
        setMotionBlur(activeItem.motionBlur ?? true);

        // Update recently used transitions list (keep up to 5 items)
        setRecentTransitions(prev => {
          const filtered = prev.filter(id => id !== activeTransitionId);
          const updated = [activeTransitionId, ...filtered].slice(0, 5);
          localStorage.setItem('veytrix_recent_transitions', JSON.stringify(updated));
          return updated;
        });
      }
    }
  }, [activeTransitionId]);

  // Handle Favorite Toggle
  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites(prev => {
      const updated = prev.includes(id) ? prev.filter(fId => fId !== id) : [...prev, id];
      localStorage.setItem('veytrix_favorite_transitions', JSON.stringify(updated));
      return updated;
    });
  };

  // Drag and Drop support
  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('text/plain', id);
    e.dataTransfer.setData('type', 'transition');
    e.dataTransfer.effectAllowed = 'copyMove';
  };

  // Filtering Logic
  const filtered = SAMPLE_TRANSITIONS_NEW.filter(t => {
    // Category match
    if (selectedCategory === 'favorites') {
      if (!favorites.includes(t.id)) return false;
    } else if (selectedCategory !== 'all') {
      if (t.category !== selectedCategory) return false;
    }

    // Search query match
    const activeSearch = internalQuery || searchQuery;
    if (activeSearch.trim() !== '') {
      const q = activeSearch.toLowerCase();
      return (
        t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.keywords.some(k => k.toLowerCase().includes(q))
      );
    }

    return true;
  });

  // Track scroll container size and position for custom virtual list rendering
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  };

  useEffect(() => {
    if (containerRef.current) {
      setContainerHeight(containerRef.current.clientHeight || 360);
    }
  }, [selectedCategory, searchQuery, isGridView]);

  // Virtual Scroll Parameters
  const itemsPerRow = isGridView ? 2 : 1;
  const rowHeight = isGridView ? 140 : 80;
  const bufferRows = 3;

  const totalRows = Math.ceil(filtered.length / itemsPerRow);
  const startRow = Math.max(0, Math.floor(scrollTop / rowHeight) - bufferRows);
  const endRow = Math.min(totalRows, Math.ceil((scrollTop + containerHeight) / rowHeight) + bufferRows);

  const topPadding = startRow * rowHeight;
  const bottomPadding = Math.max(0, (totalRows - endRow) * rowHeight);

  const visibleRows = [];
  for (let r = startRow; r < endRow; r++) {
    const rowItems = [];
    for (let c = 0; c < itemsPerRow; c++) {
      const index = r * itemsPerRow + c;
      if (index < filtered.length) {
        rowItems.push(filtered[index]);
      }
    }
    visibleRows.push({ rowIndex: r, items: rowItems });
  }

  // Preview overlay animation styles per transition ID, direction, & category
  const getPreviewStyles = (item: TransitionItem) => {
    const id = item.id.toLowerCase();
    const cat = item.category.toLowerCase();
    const dir = (item.direction || '').toLowerCase();

    // 1. Directional Slide / Push / Whip
    if (id.includes('right') || dir === 'right') {
      return {
        clipA: 'group-hover:translate-x-full transition-transform duration-500 ease-in-out',
        clipB: '-translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-in-out',
      };
    }
    if (id.includes('left') || dir === 'left') {
      return {
        clipA: 'group-hover:-translate-x-full transition-transform duration-500 ease-in-out',
        clipB: 'translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-in-out',
      };
    }
    if (id.includes('up') || dir === 'up') {
      return {
        clipA: 'group-hover:-translate-y-full transition-transform duration-500 ease-in-out',
        clipB: 'translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-in-out',
      };
    }
    if (id.includes('down') || dir === 'down') {
      return {
        clipA: 'group-hover:translate-y-full transition-transform duration-500 ease-in-out',
        clipB: '-translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-in-out',
      };
    }

    // 2. Zoom / Scale Variations
    if (id.includes('zoom-out') || id.includes('shrink')) {
      return {
        clipA: 'group-hover:scale-50 group-hover:opacity-0 transition-all duration-600 ease-in-out',
        clipB: 'scale-150 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-600 ease-in-out',
      };
    }
    if (id.includes('zoom-in') || id.includes('grow') || cat === 'zoom') {
      return {
        clipA: 'group-hover:scale-150 group-hover:opacity-0 transition-all duration-600 ease-in-out',
        clipB: 'scale-50 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-600 ease-in-out',
      };
    }

    // 3. Spin Variations
    if (id.includes('ccw') || id.includes('counter')) {
      return {
        clipA: 'group-hover:-rotate-180 group-hover:scale-0 group-hover:opacity-0 transition-all duration-600 ease-in-out',
        clipB: 'rotate-180 scale-0 opacity-0 group-hover:rotate-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-600 ease-in-out',
      };
    }
    if (id.includes('cw') || id.includes('spin') || cat === 'spin') {
      return {
        clipA: 'group-hover:rotate-180 group-hover:scale-0 group-hover:opacity-0 transition-all duration-600 ease-in-out',
        clipB: '-rotate-180 scale-0 opacity-0 group-hover:rotate-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-600 ease-in-out',
      };
    }

    // 4. Glitch / RGB Split
    if (id.includes('glitch') || id.includes('rgb') || cat === 'glitch') {
      return {
        clipA: 'group-hover:skew-x-12 group-hover:scale-95 group-hover:opacity-0 transition-all duration-300 ease-out',
        clipB: 'skew-x-[-12deg] scale-105 opacity-0 group-hover:skew-x-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-300 ease-out',
      };
    }

    // 5. Light / Flash / Burn
    if (id.includes('flash') || id.includes('burn') || id.includes('light') || cat === 'light') {
      return {
        clipA: 'group-hover:brightness-[3] group-hover:opacity-0 transition-all duration-500 ease-in-out',
        clipB: 'brightness-[0.2] opacity-0 group-hover:brightness-100 group-hover:opacity-100 transition-all duration-500 ease-in-out',
      };
    }

    // 6. Blur / Motion Blur
    if (id.includes('blur') || cat === 'blur') {
      return {
        clipA: 'group-hover:blur-md group-hover:opacity-0 transition-all duration-500 ease-in-out',
        clipB: 'blur-md opacity-0 group-hover:blur-0 group-hover:opacity-100 transition-all duration-500 ease-in-out',
      };
    }

    // 7. Camera / Shutter
    if (cat === 'camera' || id.includes('camera') || id.includes('shutter')) {
      return {
        clipA: 'group-hover:translate-y-2 group-hover:scale-90 group-hover:opacity-0 transition-all duration-500 ease-in-out',
        clipB: '-translate-y-2 scale-110 opacity-0 group-hover:translate-y-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-500 ease-in-out',
      };
    }

    // Default basic / cross dissolve
    return {
      clipA: 'group-hover:opacity-0 transition-opacity duration-500 ease-in-out',
      clipB: 'opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-in-out',
    };
  };

  return (
    <div className="space-y-3 text-slate-200 w-full flex flex-col min-h-0">
      
      {/* Top Search & Compare Header Bar */}
      <div className="p-3 bg-[#0c101d] border-b border-white/10 flex items-center justify-between gap-2 rounded-xl flex-shrink-0">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
          <input
            type="text"
            placeholder={`Search ${SAMPLE_TRANSITIONS_NEW.length} premium transitions...`}
            value={internalQuery}
            onChange={(e) => setInternalQuery(e.target.value)}
            className="w-full bg-[#060910] border border-white/10 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500/50 transition-colors"
          />
        </div>


        {/* Compare Bypass Toggle */}
        <button
          type="button"
          onClick={() => onShowBeforeOnlyChange?.(!showBeforeOnly)}
          onMouseDown={() => onShowBeforeOnlyChange?.(true)}
          onMouseUp={() => onShowBeforeOnlyChange?.(false)}
          onMouseLeave={() => onShowBeforeOnlyChange?.(false)}
          className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition cursor-pointer flex items-center gap-1.5 flex-shrink-0 select-none ${
            showBeforeOnly
              ? 'bg-amber-500 border-amber-400 text-slate-950 shadow-[0_0_12px_rgba(245,158,11,0.6)] animate-pulse'
              : 'bg-slate-900 border-white/10 text-slate-300 hover:bg-slate-800'
          }`}
          title={showBeforeOnly ? 'Showing original video without transition' : 'Click or hold to compare video before transition'}
        >
          <Eye className="h-3 w-3" />
          <span>{showBeforeOnly ? 'Original (Before)' : 'Compare'}</span>
        </button>
      </div>

      {/* Compare Mode Banner Notification */}
      {showBeforeOnly && (
        <div className="bg-amber-500/15 border-b border-amber-500/30 px-3.5 py-1.5 text-[9.5px] font-semibold text-amber-300 flex items-center justify-between rounded-lg flex-shrink-0 animate-fade-in">
          <div className="flex items-center gap-1.5">
            <Eye className="h-3.5 w-3.5 text-amber-400" />
            <span>Comparing: Showing original video without transition</span>
          </div>
          <button
            type="button"
            onClick={() => onShowBeforeOnlyChange?.(false)}
            className="text-amber-400 hover:text-amber-200 underline font-bold cursor-pointer"
          >
            Restore
          </button>
        </div>
      )}

      {/* Category Row and Controls */}
      <div className="flex items-center justify-between gap-2 border-b border-white/5 pb-2 flex-shrink-0">
        <div className="flex-1 flex gap-1 overflow-x-auto scrollbar-none py-1">
          {CATEGORIES.map(c => {
            const isSelected = selectedCategory === c.id;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelectedCategory(c.id)}
                className={`px-3 py-1 rounded text-[10px] font-bold cursor-pointer transition whitespace-nowrap ${
                  isSelected 
                    ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>{c.name}</span>
              </button>
            );
          })}
          {recentTransitions.length > 0 && (
            <button
              type="button"
              onClick={() => setSelectedCategory('recents')}
              className={`px-3 py-1 rounded text-[10px] font-bold cursor-pointer transition whitespace-nowrap flex items-center gap-1 ${
                selectedCategory === 'recents'
                  ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Clock className="h-2.5 w-2.5" />
              <span>Recents</span>
            </button>
          )}
        </div>
        <div className="flex bg-[#060910] border border-white/10 rounded-lg p-0.5 flex-shrink-0">
          <button
            type="button"
            onClick={() => setIsGridView(true)}
            className={`p-1.5 rounded-md cursor-pointer transition ${isGridView ? 'bg-sky-500/20 text-sky-400' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <LayoutGrid className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setIsGridView(false)}
            className={`p-1.5 rounded-md cursor-pointer transition ${!isGridView ? 'bg-sky-500/20 text-sky-400' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <List className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Transition Browser Grid */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#060910]">
        
        <div
          ref={containerRef}
          onScroll={handleScroll}
          className="max-h-[360px] overflow-y-auto p-3 scrollbar-thin scrollbar-track-slate-900 scrollbar-thumb-white/10"
        >
          <div style={{ paddingTop: topPadding, paddingBottom: bottomPadding }}>
            {filtered.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs italic select-none">
                No transitions found matching query
              </div>
            ) : (
              <div className={isGridView ? "grid grid-cols-2 gap-2.5" : "flex flex-col gap-2"}>
                {visibleRows.map(row => (
                  <React.Fragment key={row.rowIndex}>
                    {row.items.map(t => {
                      const isSelected = t.id === activeTransitionId;
                      const isFav = favorites.includes(t.id);
                      const animation = getPreviewStyles(t);

                      return (
                        <div
                          key={t.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, t.id)}
                          onClick={() => onSelectTransition(isSelected ? null : t.id)}
                          className={`rounded-xl border flex flex-col justify-start transition-all duration-200 bg-[#0b101c]/60 cursor-pointer group relative overflow-hidden ${
                            isGridView ? 'p-2 min-h-[135px] gap-1.5' : 'p-2.5 flex-row items-center gap-3 h-[76px]'
                          } ${
                            isSelected
                              ? 'border-sky-500/50 shadow-[0_0_12px_rgba(14,165,233,0.15)] bg-sky-500/[0.04]'
                              : 'border-white/5 hover:border-white/15'
                          }`}
                        >
                          {/* 16:9 Pure Animated Video Preview (No icons, text, or shapes inside) */}
                          <div className={`relative aspect-video rounded-lg overflow-hidden bg-slate-950 flex-shrink-0 ${
                            isGridView ? 'w-full' : 'w-24 h-full'
                          }`}>
                            <TransitionThumbnail transition={t} showDetailsBelow={false} />

                            {/* Subtle Favorite star button */}
                            <button
                              type="button"
                              onClick={(e) => toggleFavorite(t.id, e)}
                              className="absolute top-1 left-1 p-0.5 rounded bg-slate-950/70 hover:bg-slate-950 border border-white/10 text-slate-400 hover:text-yellow-400 cursor-pointer transition z-20"
                            >
                              <Star className={`h-2.5 w-2.5 ${isFav ? 'fill-yellow-400 text-yellow-400' : 'text-slate-400'}`} />
                            </button>
                          </div>

                          {/* Metadata Text OUTSIDE / BELOW Preview Only */}
                          <div className="min-w-0 flex-1 flex flex-col justify-center px-0.5">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-semibold text-slate-100 block truncate leading-tight group-hover:text-sky-300 transition">{t.name}</span>
                              {!isGridView && (
                                <span className="text-[7px] px-1 bg-slate-800 text-slate-400 font-mono rounded select-none uppercase">{t.category}</span>
                              )}
                            </div>
                            <p className="text-[8.5px] text-slate-400 line-clamp-1 mt-0.5 leading-normal">{t.description}</p>
                          </div>

                        </div>
                      );
                    })}
                  </React.Fragment>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Selection settings Property panel */}
      {activeTransitionId && (
        <div className="rounded-xl border border-sky-500/20 bg-sky-500/5 p-3 space-y-3.5 mt-2">
          
          {/* Header title */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-[10px] font-bold text-sky-400 uppercase tracking-widest">
              <Sliders className="h-3.5 w-3.5" />
              <span>Configure Transition Parameters</span>
            </div>
            <button
              type="button"
              onClick={() => {
                const activeItem = SAMPLE_TRANSITIONS_NEW.find(t => t.id === activeTransitionId);
                if (activeItem) {
                  setDuration(activeItem.defaultDuration);
                  setSpeed(activeItem.speed ?? 1.0);
                  setIntensity(activeItem.intensity ?? 50);
                  setDirection(activeItem.direction ?? 'none');
                  setEasing(activeItem.easing ?? 'ease-in-out');
                  setMotionBlur(activeItem.motionBlur ?? true);
                }
              }}
              className="text-slate-500 hover:text-slate-300 transition flex items-center gap-0.5 text-[8px] uppercase font-bold cursor-pointer"
            >
              <RotateCcw className="h-2.5 w-2.5" /> Reset
            </button>
          </div>

          {/* Slider grid */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-2">
            
            {/* Duration */}
            <div className="space-y-1">
              <div className="flex justify-between text-[9px] text-slate-400">
                <span>Duration</span>
                <span className="font-mono text-sky-400">{duration.toFixed(1)}s</span>
              </div>
              <input
                type="range"
                min="0.2"
                max="3.0"
                step="0.1"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>

            {/* Speed */}
            <div className="space-y-1">
              <div className="flex justify-between text-[9px] text-slate-400">
                <span>Speed Rate</span>
                <span className="font-mono text-sky-400">{speed.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="2.0"
                step="0.1"
                value={speed}
                onChange={(e) => setSpeed(Number(e.target.value))}
                className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>

            {/* Intensity */}
            <div className="space-y-1">
              <div className="flex justify-between text-[9px] text-slate-400">
                <span>Transition Intensity</span>
                <span className="font-mono text-sky-400">{intensity}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={intensity}
                onChange={(e) => setIntensity(Number(e.target.value))}
                className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>

            {/* Easing selector */}
            <div className="space-y-0.5">
              <span className="text-[9px] text-slate-400 block">Easing Curve</span>
              <select
                value={easing}
                onChange={(e: any) => setEasing(e.target.value)}
                className="w-full bg-[#060910] border border-white/10 rounded px-1.5 py-0.5 text-[9px] text-slate-300 focus:outline-none focus:border-sky-500/50"
              >
                <option value="linear">Linear</option>
                <option value="ease-in">Ease In</option>
                <option value="ease-out">Ease Out</option>
                <option value="ease-in-out">Ease In Out</option>
                <option value="elastic">Elastic Spring</option>
                <option value="bounce">Fluid Bounce</option>
              </select>
            </div>

            {/* Direction Selector */}
            <div className="space-y-0.5">
              <span className="text-[9px] text-slate-400 block">Direction</span>
              <select
                value={direction}
                onChange={(e: any) => setDirection(e.target.value)}
                className="w-full bg-[#060910] border border-white/10 rounded px-1.5 py-0.5 text-[9px] text-slate-300 focus:outline-none focus:border-sky-500/50"
              >
                <option value="none">None</option>
                <option value="left">Left</option>
                <option value="right">Right</option>
                <option value="up">Up</option>
                <option value="down">Down</option>
                <option value="cw">Clockwise</option>
                <option value="ccw">Counter-Clockwise</option>
                <option value="center">Center Zoom</option>
              </select>
            </div>

            {/* Motion Blur Option */}
            <div className="flex items-center justify-between pt-3">
              <span className="text-[9px] text-slate-400">GPU Motion Blur</span>
              <input
                type="checkbox"
                checked={motionBlur}
                onChange={(e) => setMotionBlur(e.target.checked)}
                className="rounded border-white/15 bg-slate-950 accent-sky-400 cursor-pointer h-3.5 w-3.5"
              />
            </div>

          </div>

        </div>
      )}



    </div>
  );
}

export default Transitions;
