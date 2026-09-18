// src/components/editor-main-screen/tools/filters/FiltersPanel.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Sliders, Sparkles, Check, RotateCcw, Film, Cpu, Zap, Eye, Sun } from 'lucide-react';
import { assetRegistry, AssetRecord } from '../../../../services/AssetRegistry';
import { COLOR_GRADE_PRESETS, getColorGradePreset } from './engines/colorGrade/colorGradePresets';
import { colorGradeEngine } from './engines/colorGrade/ColorGradeEngine';
import { TONE_ADJUSTMENT_PRESETS, getToneAdjustmentPreset } from './engines/toneAdjustment/toneAdjustmentPresets';
import { toneAdjustmentEngine } from './engines/toneAdjustment/ToneAdjustmentEngine';
import { PORTRAIT_RETOUCH_PRESETS, getPortraitRetouchPreset } from './engines/portraitRetouch/portraitRetouchPresets';
import { portraitRetouchEngine } from './engines/portraitRetouch/PortraitRetouchEngine';
import { FILM_SIMULATION_PRESETS, getFilmSimulationPreset } from './engines/filmSimulation/filmSimulationPresets';
import { filmSimulationEngine } from './engines/filmSimulation/FilmSimulationEngine';
import { MONOCHROME_PRESETS, getMonochromePreset } from './engines/monochrome/monochromePresets';
import { monochromeEngine } from './engines/monochrome/MonochromeEngine';
import { LANDSCAPE_ENHANCE_PRESETS, getLandscapeEnhancePreset } from './engines/landscapeEnhance/landscapeEnhancePresets';
import { landscapeEnhanceEngine } from './engines/landscapeEnhance/LandscapeEnhanceEngine';
import { NEON_GRADE_PRESETS, getNeonGradePreset } from './engines/neonGrade/neonGradePresets';
import { neonGradeEngine } from './engines/neonGrade/NeonGradeEngine';
import { ARTISTIC_FILTER_PRESETS, getArtisticFilterPreset } from './engines/artisticFilter/artisticFilterPresets';
import { artisticFilterEngine } from './engines/artisticFilter/ArtisticFilterEngine';






interface FiltersPanelProps {
  activeFilterId: string | number | null;
  filterIntensity: number; // 0 to 1
  onSelectFilter: (filterId: string | number | null) => void;
  onIntensityChange: (intensity: number) => void;
  previewImageSrc?: string;
}

export function FiltersPanel({
  activeFilterId,
  filterIntensity = 1.0,
  onSelectFilter,
  onIntensityChange,
  previewImageSrc = 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=300&q=75',
}: FiltersPanelProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('Cinematic');
  const [categories, setCategories] = useState<string[]>([]);
  const [filterAssets, setFilterAssets] = useState<AssetRecord[]>([]);
  const [allFilterAssets, setAllFilterAssets] = useState<AssetRecord[]>([]);
  const canvasRefs = useRef<Record<string, HTMLCanvasElement | null>>({});

  useEffect(() => {
    // Get all available filter categories from AssetRegistry
    const allFilters = assetRegistry.getAssetsByType('Filters');
    setAllFilterAssets(allFilters);
    const catList = assetRegistry.getCategories('Filters');
    setCategories(catList);
  }, []);

  useEffect(() => {
    // Query exact filters for the selected category
    const categoryAssets = assetRegistry.getAssetsByCategory('Filters', selectedCategory);
    setFilterAssets(categoryAssets);
  }, [selectedCategory]);

  // Generate thumbnail previews for visible presets using their respective engine
  useEffect(() => {
    if (filterAssets.length === 0) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = previewImageSrc;
    img.onload = () => {
      filterAssets.forEach((asset) => {
        const presetKey = (asset as any).preset || asset.name.toLowerCase().replace(/[^a-z0-9]/g, '_');
        const canvas = canvasRefs.current[asset.id];
        if (canvas) {
          if (asset.engineKey === 'ArtisticFilterEngine') {
            artisticFilterEngine.renderFrame(img, presetKey, 1.0, canvas);
          } else if (asset.engineKey === 'NeonGradeEngine') {
            neonGradeEngine.renderFrame(img, presetKey, 1.0, canvas);
          } else if (asset.engineKey === 'LandscapeEnhanceEngine') {
            landscapeEnhanceEngine.renderFrame(img, presetKey, 1.0, canvas);
          } else if (asset.engineKey === 'MonochromeEngine') {
            monochromeEngine.renderFrame(img, presetKey, 1.0, canvas);
          } else if (asset.engineKey === 'FilmSimulationEngine') {
            filmSimulationEngine.renderFrame(img, presetKey, 1.0, canvas);
          } else if (asset.engineKey === 'PortraitRetouchEngine') {
            portraitRetouchEngine.renderFrame(img, presetKey, 1.0, canvas);
          } else if (asset.engineKey === 'ToneAdjustmentEngine') {
            toneAdjustmentEngine.renderFrame(img, presetKey, 1.0, canvas);
          } else {
            colorGradeEngine.renderFrame(img, presetKey, 1.0, canvas);
          }
        }
      });
    };
  }, [filterAssets, previewImageSrc]);

  const activeAsset = allFilterAssets.find(
    (a) => String(a.id) === String(activeFilterId) || a.name === activeFilterId || (a as any).preset === activeFilterId
  );

  const activePreset = activeAsset
    ? (activeAsset.engineKey === 'ArtisticFilterEngine'
        ? getArtisticFilterPreset((activeAsset as any).preset || activeAsset.name)
        : activeAsset.engineKey === 'NeonGradeEngine'
        ? getNeonGradePreset((activeAsset as any).preset || activeAsset.name)
        : activeAsset.engineKey === 'LandscapeEnhanceEngine'
        ? getLandscapeEnhancePreset((activeAsset as any).preset || activeAsset.name)
        : activeAsset.engineKey === 'MonochromeEngine'
        ? getMonochromePreset((activeAsset as any).preset || activeAsset.name)
        : activeAsset.engineKey === 'FilmSimulationEngine'
        ? getFilmSimulationPreset((activeAsset as any).preset || activeAsset.name)
        : activeAsset.engineKey === 'PortraitRetouchEngine'
        ? getPortraitRetouchPreset((activeAsset as any).preset || activeAsset.name)
        : activeAsset.engineKey === 'ToneAdjustmentEngine'
        ? getToneAdjustmentPreset((activeAsset as any).preset || activeAsset.name)
        : getColorGradePreset((activeAsset as any).preset || activeAsset.name))
    : activeFilterId
    ? (getArtisticFilterPreset(activeFilterId) || getNeonGradePreset(activeFilterId) || getLandscapeEnhancePreset(activeFilterId) || getMonochromePreset(activeFilterId) || getFilmSimulationPreset(activeFilterId) || getPortraitRetouchPreset(activeFilterId) || getToneAdjustmentPreset(activeFilterId) || getColorGradePreset(activeFilterId))
    : null;






  return (
    <div className="w-80 h-full bg-surface border-r border-border flex flex-col select-none text-foreground">
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between bg-surface-hover/30">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <Film className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold tracking-wide">Veytrix Filters</h2>
            <p className="text-[10px] text-muted-foreground">Excel Asset Catalog Integration</p>
          </div>
        </div>

        {activeFilterId && (
          <button
            type="button"
            onClick={() => onSelectFilter(null)}
            className="p-1.5 rounded-md hover:bg-surface-hover text-muted-foreground hover:text-foreground text-xs flex items-center gap-1 transition"
            title="Reset active filter"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span className="text-[10px]">Reset</span>
          </button>
        )}
      </div>

      {/* Category Navigation Tabs */}
      <div className="flex border-b border-border bg-surface p-1 gap-1 overflow-x-auto flex-shrink-0 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setSelectedCategory(cat)}
            className={`flex-1 py-1.5 px-2 text-[10px] font-semibold rounded-md transition cursor-pointer whitespace-nowrap text-center ${
              selectedCategory.toLowerCase() === cat.toLowerCase()
                ? 'bg-sky-500/15 text-sky-400 border border-sky-500/30 font-bold shadow-sm'
                : 'text-muted-foreground hover:bg-surface-hover hover:text-foreground'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Selected Filter Intensity Controller */}
      {activeFilterId && activePreset && (() => {
        const normIntensity = filterIntensity > 1.0 ? filterIntensity / 100 : filterIntensity;
        return (
          <div className="p-4 border-b border-border bg-sky-950/20 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-sky-300 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-sky-400 fill-sky-400/20" />
                {activeAsset?.name || activePreset.name}
              </span>
              <span className="font-mono text-sky-400 font-bold">{Math.round(normIntensity * 100)}%</span>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                <span>Intensity</span>
                <span>0% - 100% Blend</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={normIntensity}
                onChange={(e) => onIntensityChange(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-surface-hover rounded-lg appearance-none cursor-pointer accent-sky-400"
              />
            </div>

            {/* Engine & Preset details */}
            <div className="pt-2 flex flex-wrap gap-1.5 text-[9px] font-mono">
              <span className="px-2 py-0.5 rounded bg-sky-500/10 text-sky-300 border border-sky-500/20">
                engineKey: {activeAsset?.engineKey || activePreset.engineKey}
              </span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                GPU WebGL Single-Pass
              </span>
            </div>
          </div>
        );
      })()}

      {/* Preset Cards List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
        {/* None / Original option */}
        <div
          onClick={() => onSelectFilter(null)}
          className={`p-3 rounded-xl border transition cursor-pointer flex items-center gap-3 ${
            !activeFilterId
              ? 'bg-sky-500/10 border-sky-400 text-foreground font-semibold shadow-lg shadow-sky-950/40'
              : 'bg-surface/50 border-border hover:border-border-strong hover:bg-surface-hover/50 text-muted-foreground hover:text-foreground'
          }`}
        >
          <div className="w-14 h-14 rounded-lg bg-black/40 border border-border flex items-center justify-center shrink-0">
            <Eye className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold">Normal (Original)</h3>
              {!activeFilterId && <Check className="h-4 w-4 text-sky-400" />}
            </div>
            <p className="text-[10px] text-muted-foreground truncate">No tone adjustment applied</p>
          </div>
        </div>

        {/* Category Filters Catalog */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
              {selectedCategory} Presets ({filterAssets.length})
            </span>
            <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
              <Zap className="h-3 w-3" /> Shared Shader Engine
            </span>
          </div>

          {filterAssets.map((asset) => {
            const presetKey = (asset as any).preset || asset.name.toLowerCase().replace(/[^a-z0-9]/g, '_');
            const isSelected =
              String(activeFilterId) === String(asset.id) ||
              activeFilterId === asset.name ||
              activeFilterId === presetKey;

            const presetDesc = asset.engineKey === 'ArtisticFilterEngine'
              ? ARTISTIC_FILTER_PRESETS[presetKey]?.description
              : asset.engineKey === 'NeonGradeEngine'
              ? NEON_GRADE_PRESETS[presetKey]?.description
              : asset.engineKey === 'LandscapeEnhanceEngine'
              ? LANDSCAPE_ENHANCE_PRESETS[presetKey]?.description
              : asset.engineKey === 'MonochromeEngine'
              ? MONOCHROME_PRESETS[presetKey]?.description
              : asset.engineKey === 'FilmSimulationEngine'
              ? FILM_SIMULATION_PRESETS[presetKey]?.description
              : asset.engineKey === 'PortraitRetouchEngine'
              ? PORTRAIT_RETOUCH_PRESETS[presetKey]?.description
              : asset.engineKey === 'ToneAdjustmentEngine'
              ? TONE_ADJUSTMENT_PRESETS[presetKey]?.description
              : COLOR_GRADE_PRESETS[presetKey]?.description;






            return (
              <div
                key={asset.id}
                onClick={() => onSelectFilter(asset.id)}
                className={`p-3 rounded-xl border transition cursor-pointer flex items-center gap-3 group ${
                  isSelected
                    ? 'bg-sky-500/10 border-sky-400 text-foreground font-semibold shadow-lg shadow-sky-950/40'
                    : 'bg-surface/40 border-border/80 hover:border-sky-500/40 hover:bg-surface-hover/50 text-muted-foreground hover:text-foreground'
                }`}
              >
                {/* Thumbnail Canvas */}
                <div className="w-14 h-14 rounded-lg overflow-hidden bg-black/60 border border-border shrink-0 relative group-hover:scale-105 transition-transform">
                  <canvas
                    ref={(el) => { canvasRefs.current[asset.id] = el; }}
                    width={112}
                    height={112}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-0 inset-x-0 bg-black/70 text-[8px] font-mono text-center text-muted-foreground py-0.5">
                    ID #{asset.id}
                  </div>
                </div>

                {/* Preset Metadata */}
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between">
                    {/* Exact Master Name from Assest.xlsx */}
                    <h3 className={`text-xs font-semibold truncate ${isSelected ? 'text-sky-300' : 'text-foreground'}`}>
                      {asset.name}
                    </h3>
                    {isSelected && <Check className="h-4 w-4 text-sky-400 shrink-0" />}
                  </div>

                  <p className="text-[10px] text-muted-foreground line-clamp-2 leading-tight">
                    {presetDesc || 'Tone adjustment filter preset'}
                  </p>

                  <div className="flex items-center gap-2 pt-0.5">
                    <span className="text-[9px] px-1.5 py-0.2 bg-surface-hover border border-border rounded font-mono text-muted-foreground">
                      {asset.plan}
                    </span>
                    <span className="text-[9px] font-mono text-sky-400">
                      engine: {asset.engineKey}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
