// src/services/FilterRenderer.ts
import { ClipFilterSpec, ClipAdjustments, getDefaultClipAdjustments } from '../types/assetInteraction';
import { assetRegistry } from './AssetRegistry';
import { filterProcessor } from './FilterProcessor';
import { colorGradeEngine } from '../components/editor-main-screen/tools/filters/engines/colorGrade/ColorGradeEngine';
import { toneAdjustmentEngine } from '../components/editor-main-screen/tools/filters/engines/toneAdjustment/ToneAdjustmentEngine';
import { portraitRetouchEngine } from '../components/editor-main-screen/tools/filters/engines/portraitRetouch/PortraitRetouchEngine';
import { filmSimulationEngine } from '../components/editor-main-screen/tools/filters/engines/filmSimulation/FilmSimulationEngine';
import { monochromeEngine } from '../components/editor-main-screen/tools/filters/engines/monochrome/MonochromeEngine';
import { landscapeEnhanceEngine } from '../components/editor-main-screen/tools/filters/engines/landscapeEnhance/LandscapeEnhanceEngine';
import { neonGradeEngine } from '../components/editor-main-screen/tools/filters/engines/neonGrade/NeonGradeEngine';
import { artisticFilterEngine } from '../components/editor-main-screen/tools/filters/engines/artisticFilter/ArtisticFilterEngine';
import { CinematicComposer } from '../components/editor-main-screen/tools/filters/engines/cinematic/CinematicComposer';
import { getCinematicFilterPreset } from '../components/editor-main-screen/tools/filters/cinematic';

export class FilterRenderer {
  private static instance: FilterRenderer;

  private constructor() {}

  public static getInstance(): FilterRenderer {
    if (!FilterRenderer.instance) {
      FilterRenderer.instance = new FilterRenderer();
    }
    return FilterRenderer.instance;
  }

  /**
   * Renders single video/image frame through the active filter engine onto target canvas.
   */
  public renderFilterFrame(
    source: HTMLVideoElement | HTMLImageElement | HTMLCanvasElement,
    filterId?: string | number | null,
    intensity: number = 1.0,
    adjustments?: ClipAdjustments,
    targetCanvas?: HTMLCanvasElement
  ): void {
    if (!targetCanvas) return;

    const intensityVal = intensity > 1.0 ? intensity / 100 : intensity;
    const isNoFilter = !filterId || filterId === 'none' || filterId === 'normal' || filterId === '0';

    if (isNoFilter && (!adjustments || this.isDefaultAdjustments(adjustments))) {
      const ctx = targetCanvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, targetCanvas.width, targetCanvas.height);
        ctx.drawImage(source, 0, 0, targetCanvas.width, targetCanvas.height);
      }
      return;
    }

    // Process parameters linearly through FilterProcessor
    const processed = filterProcessor.process(
      filterId ?? null,
      intensityVal,
      adjustments,
      targetCanvas.width,
      targetCanvas.height
    );

    const resolvedPreset = filterId ? getCinematicFilterPreset(filterId) : undefined;
    const filterStr = resolvedPreset?.id || String(filterId || '');
    if (['warm_cinema', 'cold_cinema', 'moody_film', 'dream_cinema', 'vintage_cinema', 'hdr_film', 'directors_cut'].includes(filterStr)) {
      CinematicComposer.getInstance().renderFrame(source as any, filterStr, intensityVal, processed, targetCanvas);
      return;
    }

    // Resolve engine from AssetRegistry
    const asset = filterId
      ? assetRegistry.getAssetById('Filters', Number(filterId)) || assetRegistry.getAssetByName(String(filterId))
      : null;
    const engineKey = asset?.engineKey || 'ColorGradeEngine';
    const presetKey = (asset as any)?.preset || (filterId ? String(filterId).toLowerCase().replace(/[^a-z0-9]/g, '_') : 'normal');

    // Route to appropriate WebGL shader engine
    if (engineKey === 'ArtisticFilterEngine') {
      artisticFilterEngine.renderFrame(source as any, presetKey, intensityVal, targetCanvas);
    } else if (engineKey === 'NeonGradeEngine') {
      neonGradeEngine.renderFrame(source as any, presetKey, intensityVal, targetCanvas);
    } else if (engineKey === 'LandscapeEnhanceEngine') {
      landscapeEnhanceEngine.renderFrame(source as any, presetKey, intensityVal, targetCanvas);
    } else if (engineKey === 'MonochromeEngine') {
      monochromeEngine.renderFrame(source as any, presetKey, intensityVal, targetCanvas);
    } else if (engineKey === 'FilmSimulationEngine') {
      filmSimulationEngine.renderFrame(source as any, presetKey, intensityVal, targetCanvas);
    } else if (engineKey === 'PortraitRetouchEngine') {
      portraitRetouchEngine.renderFrame(source as any, presetKey, intensityVal, targetCanvas);
    } else if (engineKey === 'ToneAdjustmentEngine') {
      toneAdjustmentEngine.renderFrame(source as any, presetKey, intensityVal, targetCanvas);
    } else {
      colorGradeEngine.renderFrame(source as any, presetKey, intensityVal, targetCanvas);
    }
  }

  /**
   * Generates identical FFmpeg filter graph string for export pipeline parity using FilterProcessor.
   */
  public getFFmpegFilterGraphString(
    filterSpec?: ClipFilterSpec | null,
    adjustments?: ClipAdjustments
  ): string {
    const filterId = filterSpec?.filterId || null;
    const rawIntensity = filterSpec?.intensity ?? 1.0;
    const intensityVal = rawIntensity > 1.0 ? rawIntensity / 100 : rawIntensity;

    const processed = filterProcessor.process(filterId, intensityVal, adjustments);
    const filters: string[] = [];

    const eqParts: string[] = [];
    if (processed.brightness !== 0) {
      eqParts.push(`brightness=${(processed.brightness / 200).toFixed(2)}`);
    }
    if (processed.contrast !== 0) {
      eqParts.push(`contrast=${(1 + processed.contrast / 100).toFixed(2)}`);
    }
    if (processed.saturation !== 0) {
      eqParts.push(`saturation=${(1 + processed.saturation / 100).toFixed(2)}`);
    }
    if (eqParts.length > 0) {
      filters.push(`eq=${eqParts.join(':')}`);
    }

    if (processed.temperature !== 0 || processed.tint !== 0 || processed.moodyGradingActive || processed.coolShadowToningActive || processed.warmHighlightToningActive) {
      const redShift = ((processed.temperature + (processed.warmHighlightToningActive ? 4 : 0)) / 200).toFixed(2);
      const blueShift = ((-processed.temperature + (processed.coolShadowToningActive ? 6 : 0) + (processed.moodyGradingActive ? 4 : 0)) / 200).toFixed(2);
      filters.push(`colorbalance=rs=${redShift}:bs=${blueShift}`);
    }

    if (processed.grain > 0) {
      filters.push(`noise=alls=${Math.min(100, Math.round(processed.grain))}:allf=t+u`);
    }

    return filters.length > 0 ? filters.join(',') : 'copy';
  }

  private isDefaultAdjustments(adj: ClipAdjustments): boolean {
    const def = getDefaultClipAdjustments();
    return (
      adj.brightness === def.brightness &&
      adj.contrast === def.contrast &&
      adj.exposure === def.exposure &&
      adj.saturation === def.saturation &&
      adj.temperature === def.temperature &&
      adj.tint === def.tint &&
      adj.vibrance === def.vibrance &&
      adj.sharpen === def.sharpen &&
      adj.fade === def.fade &&
      adj.vignette === def.vignette &&
      adj.grain === def.grain
    );
  }
}

export const filterRenderer = FilterRenderer.getInstance();
