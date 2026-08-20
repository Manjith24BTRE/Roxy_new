import React, { useState, useEffect } from 'react';
import { Sliders, Search, Star, RotateCcw, Eye, EyeOff, Clock, Copy, Trash2, Check, Sparkles } from 'lucide-react';
import { SAMPLE_FILTERS, FilterSample, getInterpolatedFilter } from './samples';
import { CATEGORY_PREVIEW_IMAGES, FILTER_ACCENT_OVERLAYS } from './Filters.constants';

interface FiltersProps {
  activeFilterId: string | null;
  onSelectFilter: (id: string | null) => void;
  filterIntensity: number;
  onFilterIntensityChange: (intensity: number) => void;
  filterOpacity?: number;
  onFilterOpacityChange?: (opacity: number) => void;
  filterBlendMode?: string;
  onFilterBlendModeChange?: (blendMode: string) => void;
  filterEnabled?: boolean;
  onFilterEnabledChange?: (enabled: boolean) => void;
  showBeforeOnly?: boolean;
  onShowBeforeOnlyChange?: (showBefore: boolean) => void;
  onHoverFilter?: (id: string | null) => void;
}

const CATEGORIES = [
  { id: 'all', name: '✨ All' },
  { id: 'favorites', name: '⭐ Favorites' },
  { id: 'recents', name: '🕒 Recents' },
  { id: 'Cinematic', name: '🎬 Cinematic' },
  { id: 'Color', name: '🎨 Color' },
  { id: 'Portrait', name: '👤 Portrait' },
  { id: 'Vintage & Retro', name: '📼 Vintage & Retro' },
  { id: 'Black & White', name: '🎞️ B&W' },
  { id: 'Nature', name: '🍃 Nature' },
  { id: 'Neon & Cyber', name: '⚡ Neon & Cyber' },
  { id: 'Creative & Artistic', name: '🎭 Creative' }
];

const BLEND_MODES = [
  { value: 'normal', label: 'Normal' },
  { value: 'multiply', label: 'Multiply' },
  { value: 'screen', label: 'Screen' },
  { value: 'overlay', label: 'Overlay' },
  { value: 'darken', label: 'Darken' },
  { value: 'lighten', label: 'Lighten' },
  { value: 'color-dodge', label: 'Color Dodge' },
  { value: 'color-burn', label: 'Color Burn' },
  { value: 'hard-light', label: 'Hard Light' },
  { value: 'soft-light', label: 'Soft Light' },
  { value: 'difference', label: 'Difference' },
  { value: 'exclusion', label: 'Exclusion' },
  { value: 'hue', label: 'Hue' },
  { value: 'saturation', label: 'Saturation' },
  { value: 'color', label: 'Color Blend' },
  { value: 'luminosity', label: 'Luminosity' }
];

const FilterThumbnail = React.memo(({
  filter,
  isSelected,
  isFav,
  toggleFavorite,
}: {
  filter: FilterSample;
  isSelected: boolean;
  isFav: boolean;
  toggleFavorite: (id: string, e: React.MouseEvent) => void;
}) => {
  const baseImg = CATEGORY_PREVIEW_IMAGES[filter.category] || CATEGORY_PREVIEW_IMAGES.DEFAULT;
  const computedCssFilter = getInterpolatedFilter(filter.cssFilter, filter.defaultIntensity);
  const accentOverlay = FILTER_ACCENT_OVERLAYS[filter.id] || null;

  return (
    <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-slate-950 border border-white/10 mb-1 flex-shrink-0">
      <img
        src={baseImg}
        alt={filter.name}
        className="w-full h-full object-cover select-none pointer-events-none group-hover:scale-105 transition-transform duration-300"
        style={{ filter: computedCssFilter }}
        loading="lazy"
      />
      {accentOverlay && (
        <div
          className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-75"
          style={{ background: accentOverlay }}
        />
      )}
      
      {/* Category overlay badge */}
      <span className="absolute bottom-0.5 left-1 z-10 bg-black/60 px-1 py-0.5 rounded text-[6px] text-slate-400 font-bold uppercase tracking-wide select-none">
        {filter.category}
      </span>

      {/* Star Favorite toggle */}
      <button
        type="button"
        onClick={(e) => toggleFavorite(filter.id, e)}
        className="absolute top-0.5 right-0.5 p-0.5 rounded bg-slate-950/60 hover:bg-slate-950 border border-white/5 text-slate-400 hover:text-yellow-400 cursor-pointer transition z-20"
      >
        <Star className={`h-2.5 w-2.5 ${isFav ? 'fill-yellow-400 text-yellow-400' : 'text-slate-500'}`} />
      </button>

      {/* Selected check badge */}
      {isSelected && (
        <div className="absolute inset-0 bg-sky-500/10 flex items-center justify-center pointer-events-none">
          <span className="p-1 rounded-full bg-sky-500 text-slate-950 shadow-md">
            <Check className="h-2.5 w-2.5 stroke-[3px]" />
          </span>
        </div>
      )}
    </div>
  );
});

export function Filters({
  activeFilterId,
  onSelectFilter,
  filterIntensity,
  onFilterIntensityChange,
  filterOpacity = 100,
  onFilterOpacityChange,
  filterBlendMode = 'normal',
  onFilterBlendModeChange,
  filterEnabled = true,
  onFilterEnabledChange,
  showBeforeOnly = false,
  onShowBeforeOnlyChange,
  onHoverFilter
}: FiltersProps) {
  // Search & Navigation
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Favorites & Recents Persistent Storage
  const [favorites, setFavorites] = useState<string[]>([]);
  const [recents, setRecents] = useState<string[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load storage configurations on mount
  useEffect(() => {
    try {
      const savedFavorites = localStorage.getItem('veytrix_favorite_filters');
      if (savedFavorites) setFavorites(JSON.parse(savedFavorites));

      const savedRecents = localStorage.getItem('veytrix_recent_filters');
      if (savedRecents) setRecents(JSON.parse(savedRecents));
    } catch (e) {
      console.error('Failed to load filter metadata', e);
    }
  }, []);

  // Show dynamic HUD alerts
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const applyFilter = (filter: FilterSample) => {
    if (activeFilterId === filter.id) {
      onSelectFilter(null);
      onFilterEnabledChange?.(false);
      triggerToast(`Filter "${filter.name}" removed`);
      return;
    }

    onSelectFilter(filter.id);
    onFilterIntensityChange(filter.defaultIntensity);
    onFilterEnabledChange?.(true);
    triggerToast(`Filter "${filter.name}" applied`);

    // Track recently used filters (limit to last 10)
    setRecents(prev => {
      const filtered = prev.filter(id => id !== filter.id);
      const updated = [filter.id, ...filtered].slice(0, 10);
      localStorage.setItem('veytrix_recent_filters', JSON.stringify(updated));
      return updated;
    });
  };

  // Toggle Favorite
  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites(prev => {
      const updated = prev.includes(id) ? prev.filter(fId => fId !== id) : [...prev, id];
      localStorage.setItem('veytrix_favorite_filters', JSON.stringify(updated));
      triggerToast(prev.includes(id) ? 'Removed from Favorites' : 'Added to Favorites');
      return updated;
    });
  };

  // Duplicate current filter settings (clipboard copy payload)
  const handleDuplicateSettings = () => {
    if (!activeFilterId) return;
    const currentSettings = {
      id: activeFilterId,
      intensity: filterIntensity,
      opacity: filterOpacity,
      blendMode: filterBlendMode,
      enabled: filterEnabled
    };
    try {
      navigator.clipboard.writeText(JSON.stringify(currentSettings, null, 2));
      triggerToast('Filter settings copied to clipboard!');
    } catch {
      triggerToast('Failed to duplicate filter settings.');
    }
  };

  // Filter selection algorithm
  const filteredFilters = SAMPLE_FILTERS.filter((filter) => {
    // Search match
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      if (!filter.name.toLowerCase().includes(q) && !filter.description.toLowerCase().includes(q)) {
        return false;
      }
    }

    // Category match
    if (selectedCategory === 'favorites') {
      return favorites.includes(filter.id);
    }
    if (selectedCategory === 'recents') {
      return recents.includes(filter.id);
    }
    if (selectedCategory !== 'all') {
      return filter.category === selectedCategory;
    }

    return true;
  });

  const activeFilter = SAMPLE_FILTERS.find(f => f.id === activeFilterId);

  return (
    <div className="flex flex-col h-full bg-[#090d16] text-slate-100 select-none">
      
      {/* Toast Alert popup */}
      {toastMessage && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-sky-500 text-slate-950 px-3 py-1.5 rounded-lg text-[10px] font-bold z-50 shadow-[0_0_12px_rgba(14,165,233,0.3)] animate-fade-in flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 fill-current" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header controls toolbar */}
      <div className="p-3 bg-[#0c101d] border-b border-white/10 flex items-center justify-between flex-shrink-0 gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search 200 premium filters..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#060910] border border-white/10 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500/50 transition-colors"
          />
        </div>
        
        {/* Hold to Compare (Before / After) Button */}
        <button
          type="button"
          onMouseDown={() => onShowBeforeOnlyChange?.(true)}
          onMouseUp={() => onShowBeforeOnlyChange?.(false)}
          onMouseLeave={() => onShowBeforeOnlyChange?.(false)}
          onTouchStart={() => onShowBeforeOnlyChange?.(true)}
          onTouchEnd={() => onShowBeforeOnlyChange?.(false)}
          className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold border transition cursor-pointer flex items-center gap-1.5 flex-shrink-0 select-none ${
            showBeforeOnly 
              ? 'bg-amber-500 border-amber-600 text-slate-950'
              : 'bg-slate-900 border-white/10 text-slate-300 hover:bg-slate-800'
          }`}
          title="Hold to preview raw original track (Before / After)"
        >
          <Eye className="h-3.5 w-3.5" />
          <span>Compare</span>
        </button>
      </div>

      {/* Horizontal Scrollable Categories */}
      <div className="flex gap-1 overflow-x-auto px-3 py-2 bg-[#0a0f1b] border-b border-white/5 scrollbar-none flex-shrink-0">
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1 rounded-md text-[10px] font-bold transition whitespace-nowrap cursor-pointer ${
                isSelected
                  ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {cat.name}
            </button>
          );
        })}
      </div>

      {/* Main filters display */}
      <div className="flex-1 p-3 overflow-y-auto space-y-4 min-h-0 scrollbar-thin">
        <div className="grid grid-cols-2 gap-2.5">
          
          {/* None / Reset Option */}
          <button
            type="button"
            onClick={() => {
              onSelectFilter(null);
              onFilterEnabledChange?.(false);
              triggerToast('Filters cleared');
            }}
            className={`rounded-xl border flex flex-col justify-between overflow-hidden transition cursor-pointer p-2.5 h-[96px] bg-[#0b101c]/60 ${
              !activeFilterId
                ? 'border-sky-500/50 shadow-[0_0_12px_rgba(14,165,233,0.15)] bg-sky-500/[0.04]'
                : 'border-white/5 hover:border-white/15'
            }`}
          >
            <div className="w-full aspect-video rounded-lg overflow-hidden bg-slate-950 border border-white/10 flex items-center justify-center mb-1.5 flex-shrink-0">
              <span className="text-lg">🚫</span>
            </div>
            <div className="w-full text-center text-[9px] font-bold text-slate-300 leading-tight">
              No Filter
            </div>
          </button>

          {/* List of Filter cards */}
          {filteredFilters.map((filter) => {
            const isSelected = filter.id === activeFilterId;
            const isFav = favorites.includes(filter.id);

            return (
              <div
                key={filter.id}
                onClick={() => applyFilter(filter)}
                onMouseEnter={() => onHoverFilter?.(filter.id)}
                onMouseLeave={() => onHoverFilter?.(null)}
                className={`rounded-xl border flex flex-col justify-between overflow-hidden transition cursor-pointer p-2 h-[96px] bg-[#0b101c]/60 group relative ${
                  isSelected
                    ? 'border-sky-500/50 shadow-[0_0_12px_rgba(14,165,233,0.15)] bg-sky-500/[0.04]'
                    : 'border-white/5 hover:border-white/15'
                }`}
              >
                {/* Dynamic Filter Thumbnail preview */}
                <FilterThumbnail
                  filter={filter}
                  isSelected={isSelected}
                  isFav={isFav}
                  toggleFavorite={toggleFavorite}
                />

                <div className="min-w-0 flex-1 flex flex-col justify-center">
                  <span className="text-[9px] font-bold text-slate-200 block truncate leading-tight">
                    {filter.name}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty         {/* Empty Search / Empty Favorites state */}
        {filteredFilters.length === 0 && (
          <div className="text-center py-12 text-slate-500 text-xs italic select-none">
            {selectedCategory === 'favorites' ? 'No favorite filters saved yet.' :
             selectedCategory === 'recents' ? 'No recently used filters found.' :
             'No matching filters found.'}
          </div>
        )}

        {/* Adjustments Panel drawer */}
        {activeFilter && (
          <div className="rounded-xl border border-sky-500/20 bg-sky-500/5 p-3 space-y-3.5 mt-2">
            
            {/* Header configuration menu */}
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => onFilterEnabledChange?.(!filterEnabled)}
                className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest cursor-pointer select-none transition ${
                  filterEnabled ? 'text-sky-400' : 'text-slate-500 hover:text-slate-400'
                }`}
              >
                {filterEnabled ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                <span>{activeFilter.name} {filterEnabled ? 'Enabled' : 'Disabled'}</span>
              </button>

              <div className="flex items-center gap-2">
                {/* Duplicate settings configuration */}
                <button
                  type="button"
                  onClick={handleDuplicateSettings}
                  className="text-slate-500 hover:text-slate-300 transition flex items-center gap-0.5 text-[8.5px] uppercase font-black cursor-pointer"
                  title="Duplicate configuration settings to clipboard"
                >
                  <Copy className="h-2.5 w-2.5" /> Copy Config
                </button>

                {/* Reset to defaults button */}
                <button
                  type="button"
                  onClick={() => {
                    onFilterIntensityChange(activeFilter.defaultIntensity);
                    onFilterOpacityChange?.(100);
                    onFilterBlendModeChange?.('normal');
                    onFilterEnabledChange?.(true);
                    triggerToast('Filter settings reset to default');
                  }}
                  className="text-slate-500 hover:text-slate-300 transition flex items-center gap-0.5 text-[8.5px] uppercase font-black cursor-pointer"
                >
                  <RotateCcw className="h-2.5 w-2.5" /> Reset
                </button>
              </div>
            </div>

            {/* Adjustments options grid */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
              
              {/* Filter Intensity strength */}
              <div className="space-y-1">
                <div className="flex justify-between text-[9px] text-slate-400">
                  <span>Filter Intensity</span>
                  <span className="font-mono text-sky-400">{filterIntensity}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={filterIntensity}
                  disabled={!filterEnabled}
                  onChange={(e) => onFilterIntensityChange(Number(e.target.value))}
                  className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                />
              </div>

              {/* Filter Opacity strength */}
              <div className="space-y-1">
                <div className="flex justify-between text-[9px] text-slate-400">
                  <span>Opacity Level</span>
                  <span className="font-mono text-sky-400">{filterOpacity}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={filterOpacity}
                  disabled={!filterEnabled}
                  onChange={(e) => onFilterOpacityChange?.(Number(e.target.value))}
                  className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                />
              </div>

              {/* Filter Blend Mode select dropdown */}
              <div className="space-y-0.5 col-span-2">
                <span className="text-[9px] text-slate-400 block">Blend Mode Overlay</span>
                <select
                  value={filterBlendMode}
                  disabled={!filterEnabled}
                  onChange={(e) => onFilterBlendModeChange?.(e.target.value)}
                  className="w-full bg-[#060910] border border-white/10 rounded px-1.5 py-0.5 text-[9px] text-slate-300 focus:outline-none focus:border-sky-500/50 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  {BLEND_MODES.map((mode) => (
                    <option key={mode.value} value={mode.value}>{mode.label}</option>
                  ))}
                </select>
              </div>

            </div>

            {/* Description footer */}
            <p className="text-[9px] text-slate-500 leading-normal italic pt-1">
              "{activeFilter.description}"
            </p>

          </div>
        )}
      </div>

    </div>
  );
}
