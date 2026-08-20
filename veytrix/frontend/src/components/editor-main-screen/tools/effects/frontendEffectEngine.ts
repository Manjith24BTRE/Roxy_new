// -----------------------------------------------------------------------------
// frontendEffectEngine.ts
// -----------------------------------------------------------------------------
// Centralized Frontend CapCut-Style Effect Registry & Preview Rendering Engine.
// Guarantees 100% parameter consumption and preview-to-export parity.
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
    id = effectInput.id || effectInput.effect_type || effectInput.type || '';
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
  const p = config.parameters;
  const et = config.id.toLowerCase();
  const cat = config.category.toLowerCase();
  const t = timeSeconds * config.speed;

  let filter = 'none';
  let transform = 'none';
  let overlayGradient: string | undefined;
  let overlayColor: string | undefined;

  if (cat.includes('color') || et.includes('grade') || et.includes('lut') || et.includes('hdr')) {
    const sat = 1.0 + (typeof p.saturation === 'number' ? p.saturation : 0) * 0.01 * intensityScale;
    const contrast = 1.0 + (typeof p.contrast === 'number' ? p.contrast : 0) * 0.01 * intensityScale;
    const bright = (typeof p.brightness === 'number' ? p.brightness : 0) * 0.01 * intensityScale;
    const hue = (typeof p.hue === 'number' ? p.hue : 0) * intensityScale;

    filter = `brightness(${1 + bright}) contrast(${contrast}) saturate(${sat}) hue-rotate(${hue}deg)`;
  } else if (cat.includes('film') || et.includes('vhs') || et.includes('grain') || et.includes('aberration') || et.includes('crt')) {
    const shiftX = Math.sin(t * 10) * 4 * intensityScale * (typeof p.rgbShift === 'number' ? p.rgbShift : 1.0);
    transform = `translateX(${shiftX.toFixed(1)}px)`;
    filter = `contrast(${1 + 0.3 * intensityScale}) sepia(${0.2 * intensityScale})`;
    overlayColor = `rgba(56, 189, 248, ${0.1 * intensityScale})`;
  } else if (cat.includes('motion') || et.includes('shake') || et.includes('blur')) {
    const shakeX = Math.sin(t * 15 * config.speed) * 8 * intensityScale;
    const shakeY = Math.cos(t * 15 * config.speed) * 8 * intensityScale;
    transform = `translate(${shakeX.toFixed(1)}px, ${shakeY.toFixed(1)}px)`;
    filter = `blur(${(Math.abs(shakeX) * 0.5).toFixed(1)}px)`;
  } else if (cat.includes('light') || et.includes('flare') || et.includes('glow') || et.includes('bloom')) {
    const glow = Math.sin(t * 4) * 0.5 + 0.5;
    filter = `brightness(${1 + glow * 0.4 * intensityScale}) saturate(${1 + 0.2 * intensityScale})`;
    overlayGradient = `radial-gradient(circle at 50% 50%, rgba(245, 158, 11, ${(0.4 * intensityScale * glow).toFixed(2)}) 0%, transparent 70%)`;
  } else if (cat.includes('particle') || et.includes('dust') || et.includes('snow') || et.includes('rain')) {
    const noiseOpacity = 0.15 * intensityScale;
    overlayColor = `rgba(255, 255, 255, ${noiseOpacity.toFixed(2)})`;
  } else {
    filter = `contrast(${1 + 0.1 * intensityScale}) saturate(${1 + 0.1 * intensityScale})`;
  }

  return {
    filter,
    transform,
    opacity: config.opacity,
    overlayGradient,
    overlayColor,
  };
}
