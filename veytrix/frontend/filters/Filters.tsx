import React, { useState } from 'react';
import { Sliders, Search } from 'lucide-react';
// Force IDE cache refresh for folder casing
import { SAMPLE_FILTERS, FilterSample } from './samples';

interface FiltersProps {
  activeFilterId: string | null;
  onSelectFilter: (id: string | null) => void;
  filterIntensity: number;
  onFilterIntensityChange: (intensity: number) => void;
}

export function Filters({
  activeFilterId,
  onSelectFilter,
  filterIntensity,
  onFilterIntensityChange
}: FiltersProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFilters = SAMPLE_FILTERS.filter((f: FilterSample) =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeFilter = SAMPLE_FILTERS.find((f: FilterSample) => f.id === activeFilterId);

  return (
    <div className="flex flex-col h-full bg-[#090d16] text-slate-100 select-none">
      {/* Header */}
      <div className="p-4 border-b border-white/10 bg-[#0c101d] flex-shrink-0">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">Cinematic Filters</h3>
        <p className="text-[10px] text-slate-500 mt-1">Grade your video track with high-fidelity color presets.</p>
      </div>

      {/* Search Input */}
      <div className="px-4 py-2 bg-[#090d16] flex-shrink-0 border-b border-white/5">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search filters..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-md bg-slate-900 border border-white/10 pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none"
          />
        </div>
      </div>

      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        <div className="grid grid-cols-2 gap-2.5">
          {/* None Option */}
          <button
            type="button"
            onClick={() => onSelectFilter(null)}
            className={`p-3 rounded-xl border text-center transition cursor-pointer h-24 flex flex-col justify-center items-center ${
              !activeFilterId
                ? 'bg-sky-500/10 border-sky-400/60 text-sky-400 font-semibold'
                : 'bg-slate-900/30 border-white/5 hover:border-white/10 text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="text-xl mb-1">🚫</span>
            <span className="text-[10px] font-semibold">No Filter</span>
          </button>

          {/* List of Filters */}
          {filteredFilters.map((filter: FilterSample) => {
            const isSelected = filter.id === activeFilterId;
            return (
              <button
                key={filter.id}
                type="button"
                onClick={() => {
                  onSelectFilter(filter.id);
                  onFilterIntensityChange(filter.defaultIntensity);
                }}
                className={`rounded-xl border text-left overflow-hidden transition cursor-pointer h-24 flex flex-col justify-between group ${
                  isSelected
                    ? 'bg-sky-500/10 border-sky-400/60 text-sky-400 font-semibold shadow-glow scale-102'
                    : 'bg-slate-900/30 border-white/5 hover:border-white/10 text-slate-400 hover:text-slate-200'
                }`}
              >
                {/* Visual colored header */}
                <div className={`h-8 w-full bg-gradient-to-r ${filter.thumbnailColor} opacity-75 group-hover:opacity-90 transition-opacity`} />
                
                <div className="p-2 w-full truncate text-[10px] font-semibold text-slate-200">
                  {filter.name}
                </div>
              </button>
            );
          })}
        </div>

        {/* Adjustments Panel */}
        {activeFilter && (
          <div className="rounded-xl border border-sky-500/20 bg-sky-500/5 p-3 space-y-3.5">
            <div className="flex items-center gap-1.5 text-[10px] font-semibold text-sky-400 uppercase tracking-wider">
              <Sliders className="h-3.5 w-3.5" />
              <span>{activeFilter.name} Intensity</span>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[9px] text-slate-400">
                <span>Filter Strength</span>
                <span>{filterIntensity}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                value={filterIntensity}
                onChange={(e) => onFilterIntensityChange(Number(e.target.value))}
                className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>
            <p className="text-[9px] text-slate-500 leading-normal italic">
              "{activeFilter.description}"
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
