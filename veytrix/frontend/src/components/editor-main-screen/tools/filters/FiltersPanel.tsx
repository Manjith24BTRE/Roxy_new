// src/components/editor-main-screen/tools/filters/FiltersPanel.tsx
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Sliders, Sparkles, Check, RotateCcw, Film, Zap, Eye, SlidersHorizontal, Sun, Palette, Wand2, RefreshCw } from 'lucide-react';
import { assetRegistry, AssetRecord } from '../../../../services/AssetRegistry';
import { ClipAdjustments, getDefaultClipAdjustments } from '../../../../types/assetInteraction';
import { colorGradeEngine } from './engines/colorGrade/ColorGradeEngine';
import { toneAdjustmentEngine } from './engines/toneAdjustment/ToneAdjustmentEngine';
import { portraitRetouchEngine } from './engines/portraitRetouch/PortraitRetouchEngine';
import { filmSimulationEngine } from './engines/filmSimulation/FilmSimulationEngine';
import { monochromeEngine } from './engines/monochrome/MonochromeEngine';
import { landscapeEnhanceEngine } from './engines/landscapeEnhance/LandscapeEnhanceEngine';
import { neonGradeEngine } from './engines/neonGrade/NeonGradeEngine';
import { artisticFilterEngine } from './engines/artisticFilter/ArtisticFilterEngine';

interface FiltersPanelProps {
  activeFilterId: string | number | null;
  filterIntensity: number; // 0 to 1
  adjustments?: ClipAdjustments;
  onSelectFilter: (filterId: string | number | null) => void;
  onIntensityChange: (intensity: number) => void;
  onAdjustmentChange?: (key: keyof ClipAdjustments, value: number) => void;
  onResetAdjustments?: () => void;
  onStartAdjustmentDrag?: () => void;
  onEndAdjustmentDrag?: () => void;
  previewImageSrc?: string;
}

export function FiltersPanel({
  activeFilterId,
  filterIntensity = 1.0,
  adjustments = getDefaultClipAdjustments(),
  onSelectFilter,
  onIntensityChange,
  onAdjustmentChange,
  onResetAdjustments,
  onStartAdjustmentDrag,
  onEndAdjustmentDrag,
  previewImageSrc = 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=300&q=75',
}: FiltersPanelProps) {
  const [activeSubTab, setActiveSubTab] = useState<'filters' | 'adjustments'>('filters');
  const [selectedCategory, setSelectedCategory] = useState<string>('Cinematic');
  const [categories, setCategories] = useState<string[]>([]);
  const [filterAssets, setFilterAssets] = useState<AssetRecord[]>([]);
  const [allFilterAssets, setAllFilterAssets] = useState<AssetRecord[]>([]);
  const canvasRefs = useRef<Record<string, HTMLCanvasElement | null>>({});

  useEffect(() => {
    const allFilters = assetRegistry.getAssetsByType('Filters');
    setAllFilterAssets(allFilters);
    const catList = assetRegistry.getCategories('Filters');
    setCategories(catList);
  }, []);

  useEffect(() => {
    const categoryAssets = assetRegistry.getAssetsByCategory('Filters', selectedCategory);
    setFilterAssets(categoryAssets);
  }, [selectedCategory]);

  // Generate thumbnail previews for visible presets
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

  const activeAsset = useMemo(() => {
    return allFilterAssets.find(
      (a) => String(a.id) === String(activeFilterId) || a.name === activeFilterId || (a as any).preset === activeFilterId
    );
  }, [allFilterAssets, activeFilterId]);

  const normIntensity = useMemo(() => {
    return filterIntensity > 1.0 ? filterIntensity / 100 : filterIntensity;
  }, [filterIntensity]);

  const handleSliderChange = useCallback((key: keyof ClipAdjustments, val: number) => {
    onAdjustmentChange?.(key, val);
  }, [onAdjustmentChange]);

  const handlePerSliderReset = useCallback((key: keyof ClipAdjustments) => {
    const defaults = getDefaultClipAdjustments();
    onAdjustmentChange?.(key, defaults[key]);
  }, [onAdjustmentChange]);

  return (
    <div className="w-80 h-full bg-surface border-r border-border flex flex-col select-none text-foreground">
      {/* Header */}
      <div className="p-3 border-b border-border flex items-center justify-between bg-surface-hover/30">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <Wand2 className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-xs font-bold tracking-wide">Filters & Adjustments</h2>
            <p className="text-[10px] text-muted-foreground">CapCut / Premiere Pro Architecture</p>
          </div>
        </div>

        {activeFilterId && activeSubTab === 'filters' && (
          <button
            type="button"
            onClick={() => onSelectFilter(null)}
            className="p-1.5 rounded-md hover:bg-surface-hover text-destructive text-xs flex items-center gap-1 transition cursor-pointer"
            title="Remove active filter preset"
          >
            <RotateCcw className="h-3 w-3" />
            <span className="text-[10px]">Remove</span>
          </button>
        )}

        {activeSubTab === 'adjustments' && onResetAdjustments && (
          <button
            type="button"
            onClick={onResetAdjustments}
            className="p-1.5 rounded-md hover:bg-surface-hover text-muted-foreground hover:text-foreground text-xs flex items-center gap-1 transition cursor-pointer"
            title="Reset all adjustments to default"
          >
            <RefreshCw className="h-3 w-3" />
            <span className="text-[10px]">Reset All</span>
          </button>
        )}
      </div>

      {/* TOP SUB-TAB NAVIGATION: [ FILTERS ] vs [ ADJUSTMENTS ] */}
      <div className="grid grid-cols-2 p-1.5 bg-background border-b border-border gap-1.5">
        <button
          type="button"
          onClick={() => setActiveSubTab('filters')}
          className={`flex items-center justify-center gap-1.5 py-1.5 text-xs font-bold rounded-md transition cursor-pointer ${
            activeSubTab === 'filters'
              ? 'bg-sky-500 text-white shadow-md'
              : 'text-muted-foreground hover:bg-surface-hover hover:text-foreground'
          }`}
        >
          <Film className="w-3.5 h-3.5" />
          <span>Filters</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('adjustments')}
          className={`flex items-center justify-center gap-1.5 py-1.5 text-xs font-bold rounded-md transition cursor-pointer ${
            activeSubTab === 'adjustments'
              ? 'bg-sky-500 text-white shadow-md'
              : 'text-muted-foreground hover:bg-surface-hover hover:text-foreground'
          }`}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Adjustments</span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* SUB-TAB 1: FILTERS TAB (Clean Browsing, Zero Overlaps) */}
      {/* ========================================================= */}
      {activeSubTab === 'filters' && (
        <div className="flex-1 flex flex-col min-h-0">
          {/* Category Navigation Pills */}
          <div className="flex border-b border-border bg-surface p-1 gap-1 overflow-x-auto flex-shrink-0 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`flex-1 py-1 px-2 text-[10px] font-semibold rounded-md transition cursor-pointer whitespace-nowrap text-center ${
                  selectedCategory.toLowerCase() === cat.toLowerCase()
                    ? 'bg-sky-500/15 text-sky-400 border border-sky-500/30 font-bold shadow-sm'
                    : 'text-muted-foreground hover:bg-surface-hover hover:text-foreground'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Filter Preset Grid (Compact 1:1 Square Thumbnail Cards - CapCut / Premiere Style) */}
          <div className="flex-1 overflow-y-auto p-3 custom-scrollbar">
            <div className="grid grid-cols-3 gap-2.5">
              {/* None / Original Square Option */}
              <div
                onClick={() => onSelectFilter(null)}
                className={`flex flex-col items-center group cursor-pointer ${
                  !activeFilterId ? 'text-sky-300 font-bold' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <div
                  className={`w-full aspect-square rounded-xl overflow-hidden relative border transition-all flex flex-col items-center justify-center ${
                    !activeFilterId
                      ? 'bg-sky-500/10 border-sky-400 shadow-lg shadow-sky-950/50 ring-2 ring-sky-400/40'
                      : 'bg-surface/50 border-border/80 group-hover:border-sky-500/50 group-hover:bg-surface-hover/60'
                  }`}
                >
                  <Eye className={`h-5 w-5 mb-1 ${!activeFilterId ? 'text-sky-400' : 'text-muted-foreground group-hover:text-foreground'}`} />
                  <span className="text-[10px] font-semibold">Normal</span>
                  {!activeFilterId && (
                    <div className="absolute top-1.5 right-1.5 bg-sky-500 text-white rounded-full p-0.5 shadow">
                      <Check className="w-3 h-3" />
                    </div>
                  )}
                </div>
                <span className="text-[10px] font-medium mt-1 truncate w-full text-center">Normal</span>
              </div>

              {/* Filter Cards Grid Items */}
              {filterAssets.map((asset) => {
                const presetKey = (asset as any).preset || asset.name.toLowerCase().replace(/[^a-z0-9]/g, '_');
                const isSelected =
                  String(activeFilterId) === String(asset.id) ||
                  activeFilterId === asset.name ||
                  activeFilterId === presetKey;

                return (
                  <div
                    key={asset.id}
                    onClick={() => onSelectFilter(asset.id)}
                    className={`flex flex-col items-center group cursor-pointer ${
                      isSelected ? 'text-sky-300 font-bold' : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <div
                      className={`w-full aspect-square rounded-xl overflow-hidden relative border transition-all ${
                        isSelected
                          ? 'bg-sky-500/10 border-sky-400 shadow-lg shadow-sky-950/50 ring-2 ring-sky-400/40'
                          : 'bg-surface/40 border-border/80 group-hover:border-sky-500/50 group-hover:bg-surface-hover/60'
                      }`}
                    >
                      <canvas
                        ref={(el) => { canvasRefs.current[asset.id] = el; }}
                        width={128}
                        height={128}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      />

                      {/* Applied Checkmark Badge */}
                      {isSelected && (
                        <div className="absolute top-1.5 right-1.5 bg-sky-500 text-white rounded-full p-0.5 shadow-md flex items-center justify-center">
                          <Check className="w-3 h-3" />
                        </div>
                      )}
                    </div>

                    <span className={`text-[10px] font-medium mt-1 truncate w-full text-center ${isSelected ? 'text-sky-300 font-semibold' : 'text-foreground/90'}`}>
                      {asset.name}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SUB-TAB 2: ADJUSTMENTS TAB (Memoized Sliders, -100 to +100) */}
      {/* ========================================================= */}
      {activeSubTab === 'adjustments' && (
        <div className="flex-1 overflow-y-auto p-3 space-y-4 custom-scrollbar">
          {/* Section 0: Active Filter Preset Intensity (Only when filter is selected) */}
          {activeFilterId && activeAsset && (
            <div className="p-3 rounded-xl border border-sky-500/30 bg-sky-950/20 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-sky-300 flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-sky-400" />
                  {activeAsset.name} Intensity
                </span>
                <span className="font-mono text-sky-400 font-bold">{Math.round(normIntensity * 100)}%</span>
              </div>
              <div className="space-y-1">
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
            </div>
          )}

          {/* Section 1: Tone Controls (-100 to +100) */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-sky-400 uppercase tracking-wider">
              <Sun className="w-3.5 h-3.5 text-sky-400" /> Tone Adjustments
            </div>

            <AdjustmentSliderRow
              paramKey="exposure"
              label="Exposure"
              value={adjustments.exposure}
              min={-100}
              max={100}
              step={1}
              defaultValue={0}
              formatValue={(v) => `${v > 0 ? '+' : ''}${v}`}
              onChange={handleSliderChange}
              onReset={handlePerSliderReset}
            />

            <AdjustmentSliderRow
              paramKey="brightness"
              label="Brightness"
              value={adjustments.brightness}
              min={-100}
              max={100}
              step={1}
              defaultValue={0}
              formatValue={(v) => `${v > 0 ? '+' : ''}${v}`}
              onChange={handleSliderChange}
              onReset={handlePerSliderReset}
            />

            <AdjustmentSliderRow
              paramKey="contrast"
              label="Contrast"
              value={adjustments.contrast}
              min={-100}
              max={100}
              step={1}
              defaultValue={0}
              formatValue={(v) => `${v > 0 ? '+' : ''}${v}`}
              onChange={handleSliderChange}
              onReset={handlePerSliderReset}
            />

            <AdjustmentSliderRow
              paramKey="highlights"
              label="Highlights"
              value={adjustments.highlights}
              min={-100}
              max={100}
              step={1}
              defaultValue={0}
              formatValue={(v) => `${v > 0 ? '+' : ''}${v}`}
              onChange={handleSliderChange}
              onReset={handlePerSliderReset}
            />

            <AdjustmentSliderRow
              paramKey="shadows"
              label="Shadows"
              value={adjustments.shadows}
              min={-100}
              max={100}
              step={1}
              defaultValue={0}
              formatValue={(v) => `${v > 0 ? '+' : ''}${v}`}
              onChange={handleSliderChange}
              onReset={handlePerSliderReset}
            />
          </div>

          {/* Section 2: Color Controls (-100 to +100) */}
          <div className="space-y-2.5 border-t border-border pt-3">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
              <Palette className="w-3.5 h-3.5 text-emerald-400" /> Color Adjustments
            </div>

            <AdjustmentSliderRow
              paramKey="saturation"
              label="Saturation"
              value={adjustments.saturation}
              min={-100}
              max={100}
              step={1}
              defaultValue={0}
              formatValue={(v) => `${v > 0 ? '+' : ''}${v}`}
              onChange={handleSliderChange}
              onReset={handlePerSliderReset}
            />

            <AdjustmentSliderRow
              paramKey="vibrance"
              label="Vibrance"
              value={adjustments.vibrance}
              min={-100}
              max={100}
              step={1}
              defaultValue={0}
              formatValue={(v) => `${v > 0 ? '+' : ''}${v}`}
              onChange={handleSliderChange}
              onReset={handlePerSliderReset}
            />

            <AdjustmentSliderRow
              paramKey="temperature"
              label="Temperature"
              value={adjustments.temperature}
              min={-100}
              max={100}
              step={1}
              defaultValue={0}
              formatValue={(v) => `${v > 0 ? '+' : ''}${v}`}
              onChange={handleSliderChange}
              onReset={handlePerSliderReset}
            />

            <AdjustmentSliderRow
              paramKey="tint"
              label="Tint"
              value={adjustments.tint}
              min={-100}
              max={100}
              step={1}
              defaultValue={0}
              formatValue={(v) => `${v > 0 ? '+' : ''}${v}`}
              onChange={handleSliderChange}
              onReset={handlePerSliderReset}
            />
          </div>

          {/* Section 3: Detail & Effects (0 to 100) */}
          <div className="space-y-2.5 border-t border-border pt-3">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-amber-400 uppercase tracking-wider">
              <Sliders className="w-3.5 h-3.5 text-amber-400" /> Detail & Effects
            </div>

            <AdjustmentSliderRow
              paramKey="sharpen"
              label="Sharpness"
              value={adjustments.sharpen}
              min={0}
              max={100}
              step={1}
              defaultValue={0}
              formatValue={(v) => `${v}`}
              onChange={handleSliderChange}
              onReset={handlePerSliderReset}
            />

            <AdjustmentSliderRow
              paramKey="fade"
              label="Fade"
              value={adjustments.fade}
              min={0}
              max={100}
              step={1}
              defaultValue={0}
              formatValue={(v) => `${v}`}
              onChange={handleSliderChange}
              onReset={handlePerSliderReset}
            />

            <AdjustmentSliderRow
              paramKey="vignette"
              label="Vignette"
              value={adjustments.vignette}
              min={0}
              max={100}
              step={1}
              defaultValue={0}
              formatValue={(v) => `${v}`}
              onChange={handleSliderChange}
              onReset={handlePerSliderReset}
            />

            <AdjustmentSliderRow
              paramKey="grain"
              label="Grain"
              value={adjustments.grain}
              min={0}
              max={100}
              step={1}
              defaultValue={0}
              formatValue={(v) => `${v}`}
              onChange={handleSliderChange}
              onReset={handlePerSliderReset}
            />
          </div>
        </div>
      )}
    </div>
  );
}

interface AdjustmentSliderRowProps {
  paramKey: keyof ClipAdjustments;
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  defaultValue: number;
  formatValue: (val: number) => string;
  onChange: (key: keyof ClipAdjustments, value: number) => void;
  onReset: (key: keyof ClipAdjustments) => void;
}

/** Memoized single slider component for 60fps responsiveness */
const AdjustmentSliderRow = React.memo(function AdjustmentSliderRow({
  paramKey,
  label,
  value,
  min,
  max,
  step,
  defaultValue,
  formatValue,
  onChange,
  onReset,
}: AdjustmentSliderRowProps) {
  const isChanged = value !== defaultValue;

  return (
    <div className="space-y-1 group">
      <div className="flex items-center justify-between text-[10px] font-mono">
        <span className="font-sans font-medium text-foreground/90">{label}</span>
        <div className="flex items-center gap-1.5">
          <span className={`font-bold font-mono ${isChanged ? 'text-sky-400' : 'text-muted-foreground'}`}>
            {formatValue(value)}
          </span>
          {isChanged && (
            <button
              type="button"
              onClick={() => onReset(paramKey)}
              className="p-0.5 rounded hover:bg-surface-hover text-muted-foreground hover:text-foreground transition"
              title={`Reset ${label}`}
            >
              <RotateCcw className="w-2.5 h-2.5" />
            </button>
          )}
        </div>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(paramKey, parseFloat(e.target.value))}
        className="w-full h-1.5 bg-surface-hover rounded-lg appearance-none cursor-pointer accent-sky-400"
      />
    </div>
  );
});
