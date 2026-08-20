import { RendererParams } from './Renderer.types';
import { getSpeedFactor, getIntensityFactor } from './Renderer.utils';

export function blurEffectRenderer({ effect, localTime, duration, props, state }: RendererParams): void {
  const p = effect.presetId;
  const speed = getSpeedFactor(effect.speed);
  const int = getIntensityFactor(effect.intensity);

  let blurRad = 0;

  if (p === 'blur-motion' || p === 'blur-radial' || p === 'blur-directional') {
    blurRad = 12 * int;
  } else if (p === 'blur-zoom' || p === 'blur-spin-zoom') {
    blurRad = 14 * int;
  } else if (p === 'blur-lens' || p === 'blur-cinema' || p === 'blur-pro-lens') {
    blurRad = 16 * int;
  } else if (p === 'blur-bokeh' || p === 'blur-crystal' || p === 'blur-pixel' || p === 'blur-edge') {
    blurRad = 18 * int;
  } else if (p === 'blur-background' || p === 'blur-center' || p === 'blur-mirror' || p === 'blur-trail' || p === 'blur-echo') {
    blurRad = 15 * int;
  } else if (p === 'blur-foreground' || p === 'blur-portrait') {
    blurRad = 12 * int;
  } else if (p === 'blur-depth') {
    blurRad = 16 * int;
  } else if (p === 'blur-tilt-shift') {
    blurRad = 14 * int;
  } else if (p === 'blur-soft-focus') {
    blurRad = 8 * int;
    state.brightness *= 1.08;
    state.saturation *= 1.1;
  } else if (p === 'blur-dream') {
    blurRad = 10 * int;
    state.brightness *= 1.1;
    state.saturation *= 1.15;
    state.hueRotate += 5;
  } else if (p === 'blur-glow' || p === 'blur-light') {
    blurRad = 9 * int;
    state.brightness *= 1.15;
  } else if (p === 'blur-fog') {
    blurRad = 12 * int;
    state.contrast *= 0.9;
    state.opacity *= 0.85;
  } else if (p === 'blur-heat') {
    blurRad = 6 * int + Math.abs(Math.sin(localTime * 15 * speed)) * 4;
  } else if (p === 'blur-ripple') {
    blurRad = 5 * int + Math.abs(Math.sin(localTime * 8 * speed)) * 4;
  } else if (p === 'blur-focus') {
    blurRad = Math.max(0, 15 - localTime * 5 * speed) * int;
  } else if (p === 'blur-pulse') {
    blurRad = Math.abs(Math.sin(localTime * Math.PI * speed)) * 20 * int;
  } else if (p === 'blur-fade') {
    blurRad = Math.max(0, 1 - localTime / (duration * 0.5)) * 25 * int;
  } else if (p === 'blur-sweep') {
    const sweep = (localTime * speed) % 2;
    blurRad = Math.abs(Math.sin(sweep * Math.PI)) * 18 * int;
  } else if (p === 'blur-spin' || p === 'blur-whirl') {
    blurRad = 15 * int;
  } else if (p === 'blur-wave') {
    blurRad = 14 * int;
  } else if (p === 'blur-glass') {
    blurRad = 16 * int;
    state.saturation *= 0.95;
    state.contrast *= 1.05;
  } else if (p === 'blur-smooth' || p === 'blur-smart') {
    blurRad = 10 * int;
  } else if (p === 'blur-night') {
    blurRad = 16 * int;
    state.contrast *= 0.9;
    state.brightness *= 0.92;
  } else if (p === 'blur-ghost' || p === 'blur-liquid') {
    blurRad = 8 * int + Math.abs(Math.sin(localTime * 4 * speed)) * 4;
  } else if (p === 'blur-bloom') {
    blurRad = 14 * int;
    state.brightness *= 1.15;
    state.contrast *= 1.08;
  } else if (p === 'blur-stretch' || p === 'blur-speed' || p === 'blur-action' || p === 'blur-velocity') {
    blurRad = 15 * int;
  } else if (p === 'blur-extreme') {
    blurRad = 35 * int;
  } else {
    blurRad = Math.max(2, (effect.intensity || 50) / 10);
  }

  if (blurRad > 0) {
    state.blur += blurRad;
  }
}
