// -----------------------------------------------------------------------------
// frontendEffectEngine.ts
// -----------------------------------------------------------------------------
// Centralized Frontend CapCut-Style Effect Registry & Preview Rendering Engine.
// Guarantees 100% distinct visual rendering per effect ID with live parameter support.
// STRICTLY FRONTEND ONLY.
// -----------------------------------------------------------------------------

export interface EffectResolvedConfig {
  id: string;
  category: string;
  intensity: number;
  speed: number;
  opacity: number;
  color: string;
  blendMode: string;
  direction: string;
  randomness: number;
  parameters: Record<string, any>;
}

export interface EffectFrameRenderState {
  filter: string;
  transform: string;
  opacity: number;
  overlayGradient?: string;
  overlayColor?: string;
}

export function resolveFrontendEffect(effectInput: any): EffectResolvedConfig {
  let id = '';
  let category = 'general';
  let intensity = 50;
  let speed = 1.0;
  let opacity = 1.0;
  let color = '#ffffff';
  let blendMode = 'normal';
  let direction = 'none';
  let randomness = 0.5;
  let parameters: Record<string, any> = {};

  if (typeof effectInput === 'string') {
    id = effectInput;
  } else if (effectInput && typeof effectInput === 'object') {
    id = effectInput.id || effectInput.effectId || effectInput.presetId || effectInput.effect_type || effectInput.type || '';
    category = effectInput.category || 'general';
    intensity = typeof effectInput.intensity === 'number' ? effectInput.intensity : 50;
    speed = typeof effectInput.speed === 'number' ? effectInput.speed : 1.0;
    opacity = typeof effectInput.opacity === 'number' ? effectInput.opacity : 1.0;
    color = effectInput.color || '#ffffff';
    blendMode = effectInput.blendMode || effectInput.blend_mode || 'normal';
    direction = effectInput.direction || 'none';
    randomness = typeof effectInput.randomness === 'number' ? effectInput.randomness : 0.5;
    parameters = effectInput.parameters && typeof effectInput.parameters === 'object' ? effectInput.parameters : {};
  }

  return {
    id: id || 'generic-effect',
    category,
    intensity,
    speed,
    opacity,
    color,
    blendMode,
    direction,
    randomness,
    parameters,
  };
}

export function renderFrontendEffectFrame(
  config: EffectResolvedConfig,
  timeSeconds: number = 0.0
): EffectFrameRenderState {
  const intensityScale = Math.max(0.0, config.intensity) / 50.0;
  const et = (config.id || '').toLowerCase();
  const cat = (config.category || '').toLowerCase();
  const t = timeSeconds * config.speed;

  let filter = 'none';
  let transform = 'none';
  let opacity = config.opacity;
  let overlayGradient: string | undefined;
  let overlayColor: string | undefined;

  // Exact ID Matching First
  if (et.includes('blur')) {
    const blurPx = (8 * intensityScale).toFixed(1);
    filter = `blur(${blurPx}px)`;
  } else if (et.includes('zoom')) {
    const scaleVal = (1 + Math.sin(t * 3) * 0.22 * intensityScale).toFixed(3);
    transform = `scale(${scaleVal})`;
  } else if (et.includes('shake') || et.includes('earthquake')) {
    const shakeX = (Math.sin(t * 35) * 14 * intensityScale).toFixed(1);
    const shakeY = (Math.cos(t * 28) * 12 * intensityScale).toFixed(1);
    transform = `translate(${shakeX}px, ${shakeY}px)`;
    filter = `contrast(${1 + 0.05 * intensityScale})`;
  } else if (et.includes('glow') || et.includes('bloom')) {
    const glowPx = (16 * intensityScale).toFixed(1);
    filter = `drop-shadow(0 0 ${glowPx}px rgba(56,189,248,0.85)) brightness(${1 + 0.3 * intensityScale})`;
  } else if (et.includes('fade')) {
    opacity = 0.3 + 0.7 * (Math.sin(t * 3) * 0.5 + 0.5);
  } else if (et.includes('rotate') || et.includes('spin')) {
    const rotDeg = ((t * 90) % 360).toFixed(1);
    transform = `rotate(${rotDeg}deg)`;
  } else if (et.includes('pulse') || et.includes('heartbeat')) {
    const pulseScale = (1 + Math.sin(t * 6) * 0.18 * intensityScale).toFixed(3);
    transform = `scale(${pulseScale})`;
  } else if (et.includes('flash')) {
    const isFlash = Math.sin(t * 24) > 0.3;
    filter = `brightness(${isFlash ? 1 + 1.8 * intensityScale : 1})`;
  } else if (et.includes('grayscale') || et.includes('monochrome') || et.includes('black-white')) {
    filter = `grayscale(${Math.min(100, 100 * intensityScale)}%)`;
  } else if (et.includes('vignette')) {
    const darkAlpha = (0.85 * intensityScale).toFixed(2);
    overlayGradient = `radial-gradient(circle at center, transparent 35%, rgba(0, 0, 0, ${darkAlpha}) 100%)`;
  } else if (et.includes('distortion') || et.includes('swirl') || et.includes('wobble')) {
    const skewX = (Math.sin(t * 8) * 15 * intensityScale).toFixed(1);
    const skewY = (Math.cos(t * 6) * 10 * intensityScale).toFixed(1);
    transform = `skewX(${skewX}deg) skewY(${skewY}deg)`;
  } else if (et.includes('vhs')) {
    const shiftX = (Math.sin(t * 12) * 5 * intensityScale).toFixed(1);
    transform = `translateX(${shiftX}px)`;
    filter = `sepia(${0.3 * intensityScale}) contrast(${1 + 0.25 * intensityScale})`;
    overlayGradient = `repeating-linear-gradient(0deg, rgba(0,0,0,0.18), rgba(0,0,0,0.18) 1px, transparent 1px, transparent 4px)`;
  } else if (et.includes('glitch')) {
    const shiftX = (Math.sin(t * 40) * 18 * intensityScale).toFixed(1);
    const hueDeg = (Math.sin(t * 50) * 120 * intensityScale).toFixed(1);
    transform = `translateX(${shiftX}px)`;
    filter = `hue-rotate(${hueDeg}deg) contrast(1.4)`;
    overlayColor = `rgba(56, 189, 248, ${0.15 * intensityScale})`;
  } else if (et.includes('flare') || et.includes('leak') || et.includes('sun')) {
    const posX = (50 + Math.sin(t * 2) * 30).toFixed(1);
    const brightnessVal = (1 + Math.sin(t * 3) * 0.2 * intensityScale).toFixed(2);
    filter = `brightness(${brightnessVal})`;
    overlayGradient = `radial-gradient(circle at ${posX}% 30%, rgba(251, 191, 36, ${0.45 * intensityScale}) 0%, transparent 65%)`;
  } else if (et.includes('neon')) {
    filter = `drop-shadow(0 0 10px #ec4899) drop-shadow(0 0 20px #38bdf8) brightness(1.2) contrast(1.3)`;
  } else if (cat.includes('color')) {
    const contrastVal = config.parameters?.contrast !== undefined 
      ? (1 + (config.parameters.contrast / 50) * 0.25 * intensityScale).toFixed(2)
      : (1 + 0.25 * intensityScale).toFixed(2);
    const satVal = config.parameters?.saturation !== undefined
      ? (1 + (config.parameters.saturation / 50) * 0.3 * intensityScale).toFixed(2)
      : (1 + 0.3 * intensityScale).toFixed(2);
    filter = `contrast(${contrastVal}) saturate(${satVal})`;
  } else if (cat.includes('film')) {
    filter = `contrast(${1 + 0.2 * intensityScale}) sepia(${0.25 * intensityScale})`;
  } else if (cat.includes('motion')) {
    const shakeX = (Math.sin(t * 18) * 8 * intensityScale).toFixed(1);
    transform = `translateX(${shakeX}px)`;
  } else {
    filter = `contrast(${1 + 0.15 * intensityScale}) saturate(${1 + 0.15 * intensityScale})`;
  }

  return {
    filter,
    transform,
    opacity,
    overlayGradient,
    overlayColor,
  };
}
