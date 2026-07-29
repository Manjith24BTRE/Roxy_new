import { AppliedEffect, EffectPreset, getInterpolatedEffectProps } from '../effectsPreset';
import { RenderState, EffectRendererFn } from './Renderer.types';
import { createDefaultRenderState } from './RenderState';

import { basicEffectRenderer } from './basic';
import { cameraEffectRenderer } from './camera';
import { cinematicEffectRenderer } from './cinematic';
import { blurEffectRenderer } from './blur';
import { glitchEffectRenderer } from './glitch';
import { lightEffectRenderer } from './light';
import { retroEffectRenderer } from './retro';
import { motionEffectRenderer } from './motion';
import { distortionEffectRenderer } from './distortion';
import { aiEffectRenderer } from './ai';
import { threeDEffectRenderer } from './threeD';
import { shakeEffectRenderer } from './shake';
import { zoomEffectRenderer } from './zoom';
import { overlayEffectRenderer } from './overlay';
import { particlesEffectRenderer } from './particles';

export const CATEGORY_RENDERERS: Record<string, EffectRendererFn> = {
  Basic: basicEffectRenderer,
  Camera: cameraEffectRenderer,
  Cinematic: cinematicEffectRenderer,
  Blur: blurEffectRenderer,
  Glitch: glitchEffectRenderer,
  Light: lightEffectRenderer,
  Retro: retroEffectRenderer,
  Motion: motionEffectRenderer,
  Distortion: distortionEffectRenderer,
  AI: aiEffectRenderer,
  '3D': threeDEffectRenderer,
  Shake: shakeEffectRenderer,
  Zoom: zoomEffectRenderer,
  Overlay: overlayEffectRenderer,
  Particles: particlesEffectRenderer
};

export const EFFECT_RENDERERS: Record<string, EffectRendererFn> = {
  // Specific preset registrations
  'basic-fade-in': basicEffectRenderer,
  'basic-fade-out': basicEffectRenderer,
  'basic-zoom-in': basicEffectRenderer,
  'basic-zoom-out': basicEffectRenderer,
  'basic-move-left': basicEffectRenderer,
  'basic-move-right': basicEffectRenderer,
  'basic-move-up': basicEffectRenderer,
  'basic-move-down': basicEffectRenderer,
  'basic-blink': basicEffectRenderer,
  'basic-slow-zoom': basicEffectRenderer,
  'basic-micro-shake': basicEffectRenderer,
  'basic-macro-shake': basicEffectRenderer,
  'basic-drift-l': basicEffectRenderer,
  'basic-drift-r': basicEffectRenderer,
  'basic-rotate-zoom': basicEffectRenderer,
  'basic-expand': basicEffectRenderer,
  'basic-collapse': basicEffectRenderer,

  // Camera presets
  'camera-handheld': cameraEffectRenderer,
  'camera-shake': cameraEffectRenderer,
  'camera-earthquake': cameraEffectRenderer,
  'camera-crash-zoom': cameraEffectRenderer,
  'camera-whip-l': cameraEffectRenderer,
  'camera-whip-r': cameraEffectRenderer,
  'camera-dolly-in': cameraEffectRenderer,
  'camera-dolly-out': cameraEffectRenderer,
  'camera-truck-l': cameraEffectRenderer,
  'camera-truck-r': cameraEffectRenderer,
  'camera-pedestal-up': cameraEffectRenderer,
  'camera-pedestal-down': cameraEffectRenderer,
  'camera-orbit-l': cameraEffectRenderer,
  'camera-orbit-r': cameraEffectRenderer,
  'camera-fpv-dive': cameraEffectRenderer,
  'camera-steadicam': cameraEffectRenderer,
  'camera-walking-cam': cameraEffectRenderer,
  'camera-running-cam': cameraEffectRenderer,

  // Cinematic presets
  'cine-projector': cinematicEffectRenderer,
  'cine-film-burn': cinematicEffectRenderer,
  'cine-vintage-film': cinematicEffectRenderer,
  'cine-softness': cinematicEffectRenderer,
  'cine-soft-diffusion': cinematicEffectRenderer,
  'cine-dream': cinematicEffectRenderer,
  'cine-cinema-bloom': cinematicEffectRenderer,
  'cine-letterbox': cinematicEffectRenderer,
  'cine-vignette': cinematicEffectRenderer,
  'cine-spotlight': cinematicEffectRenderer,
  'cine-film-grain': cinematicEffectRenderer,

  // Light presets
  'light-camera-flash': lightEffectRenderer,
  'light-flicker': lightEffectRenderer,
  'light-fire-glow': lightEffectRenderer,
  'light-candle': lightEffectRenderer,
  'light-pulse': lightEffectRenderer,
  'light-sun-flare': lightEffectRenderer,
  'light-sun-burst': lightEffectRenderer,
  'light-rainbow-leak': lightEffectRenderer,
  'light-color-leak': lightEffectRenderer,

  // Retro presets
  'retro-projector': retroEffectRenderer,
  'retro-flicker': retroEffectRenderer,
  'retro-super8': retroEffectRenderer,
  'retro-8mm': retroEffectRenderer,
  'retro-16mm': retroEffectRenderer,
  'retro-old-camera': retroEffectRenderer,
  'retro-analog-cam': retroEffectRenderer,
  'retro-vintage-lens': retroEffectRenderer,
  'retro-blur': retroEffectRenderer,
  'retro-soft': retroEffectRenderer,
  'retro-cam-flash': retroEffectRenderer,
  'retro-flash': retroEffectRenderer,
  'retro-color-shift': retroEffectRenderer,
  'retro-vignette': retroEffectRenderer,
  'retro-vhs-overlay': retroEffectRenderer,
  'retro-tape-wear': retroEffectRenderer
};

export function getEffectRenderer(presetId: string, category?: string): EffectRendererFn | undefined {
  if (EFFECT_RENDERERS[presetId]) {
    return EFFECT_RENDERERS[presetId];
  }

  if (category && CATEGORY_RENDERERS[category]) {
    return CATEGORY_RENDERERS[category];
  }

  if (presetId.startsWith('basic-')) return basicEffectRenderer;
  if (presetId.startsWith('camera-')) return cameraEffectRenderer;
  if (presetId.startsWith('cine-') || presetId.startsWith('cinematic-')) return cinematicEffectRenderer;
  if (presetId.startsWith('blur-')) return blurEffectRenderer;
  if (presetId.startsWith('glitch-')) return glitchEffectRenderer;
  if (presetId.startsWith('light-')) return lightEffectRenderer;
  if (presetId.startsWith('retro-') || presetId.startsWith('vhs-') || presetId.startsWith('crt-')) return retroEffectRenderer;
  if (presetId.startsWith('dist-') || presetId.startsWith('distortion-')) return distortionEffectRenderer;
  if (presetId.startsWith('ai-')) return aiEffectRenderer;
  if (presetId.startsWith('3d-') || presetId.startsWith('threed-')) return threeDEffectRenderer;
  if (presetId.startsWith('shake-')) return shakeEffectRenderer;
  if (presetId.startsWith('zoom-')) return zoomEffectRenderer;
  if (presetId.startsWith('overlay-')) return overlayEffectRenderer;
  if (presetId.startsWith('particle-')) return particlesEffectRenderer;

  return undefined;
}

export function applyEffectPipeline(
  appliedEffects: AppliedEffect[],
  localTime: number,
  duration: number,
  presetCatalog: EffectPreset[]
): RenderState {
  const state = createDefaultRenderState();

  if (!appliedEffects || appliedEffects.length === 0) {
    return state;
  }

  appliedEffects.forEach((eff) => {
    if (!eff.enabled) return;

    const props = getInterpolatedEffectProps(eff, localTime);
    const preset = presetCatalog.find((p) => p.id === eff.presetId);
    const category = preset?.category || eff.category || '';

    // 1. Stack opacity
    if (props.opacity !== undefined && props.opacity < 100) {
      state.opacity *= (props.opacity / 100);
    }

    // 2. Stack blend mode if customized
    if (eff.blendMode && eff.blendMode !== 'normal') {
      state.blendMode = eff.blendMode;
    }

    // 3. Stack generic adjustments
    if (eff.brightness !== undefined && eff.brightness !== 50) {
      state.brightness *= (eff.brightness / 50);
    }
    if (eff.contrast !== undefined && eff.contrast !== 50) {
      state.contrast *= (eff.contrast / 50);
    }
    if (eff.saturation !== undefined && eff.saturation !== 50) {
      state.saturation *= (eff.saturation / 50);
    }
    if (eff.blurAmount !== undefined && eff.blurAmount > 0 && (category === 'Blur' || eff.presetId.startsWith('blur-'))) {
      state.blur += (eff.blurAmount / 100) * 20;
    }
    if (eff.blurRadius !== undefined && eff.blurRadius > 0 && (category === 'Blur' || eff.presetId.startsWith('blur-'))) {
      state.blur += (eff.blurRadius / 100) * 25;
    }
    if (eff.glowAmount !== undefined && eff.glowAmount > 0 && (category === 'Light' || category === 'Cinematic')) {
      state.glow += (eff.glowAmount / 100) * 16;
    }
    if (eff.temperature !== undefined && eff.temperature !== 50) {
      state.sepia += Math.max(0, (eff.temperature - 50) / 100);
      state.hueRotate += (50 - eff.temperature) * 0.3;
    }
    if (eff.tint !== undefined && eff.tint !== 50) {
      state.hueRotate += (eff.tint - 50) * 0.6;
    }

    // 4. Stack preset CSS Filter if present
    if (preset?.cssFilter && preset.cssFilter !== 'none') {
      state.cssFilters.push(preset.cssFilter);
    }

    // 5. Execute registered renderer function
    const renderer = getEffectRenderer(eff.presetId, category);
    if (renderer) {
      renderer({
        effect: eff,
        preset,
        localTime,
        duration,
        props,
        state
      });
    }
  });

  return state;
}

export * from './Renderer.types';
export * from './RenderState';
export * from './Renderer.utils';
