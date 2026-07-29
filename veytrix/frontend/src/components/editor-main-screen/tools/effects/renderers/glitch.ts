import { RendererParams } from './Renderer.types';
import { getSpeedFactor, getIntensityFactor, generateRGBSplitFilter } from './Renderer.utils';

export function glitchEffectRenderer({ effect, localTime, duration, props, state }: RendererParams): void {
  const p = effect.presetId;
  const speed = getSpeedFactor(effect.speed);
  const int = getIntensityFactor(effect.intensity);

  const glitchFreq = 30 * speed;
  const isGlitchFrame = Math.sin(localTime * glitchFreq) > (0.85 - int * 0.25);

  if (isGlitchFrame) {
    const noiseX = Math.sin(localTime * 100) * 20 * int;
    const noiseY = Math.cos(localTime * 120) * 12 * int;
    state.shakeOffset.x += noiseX;
    state.shakeOffset.y += noiseY;

    if (p === 'glitch-screen-tear' || p === 'glitch-slice' || p === 'glitch-block-shift' || p === 'glitch-mirror') {
      state.scaleX *= (1 + Math.sin(localTime * 200) * 0.08 * int);
      state.translateX += Math.sin(localTime * 150) * 35 * int;
    }
    if (p === 'glitch-digital' || p === 'glitch-corruption' || p === 'glitch-cyber' || p === 'glitch-quantum' || p === 'glitch-master') {
      state.rotation += Math.sin(localTime * 90) * 4 * int;
    }
  }

  if (p === 'glitch-rgb-split' || p === 'glitch-rgb-shift' || p === 'glitch-color-offset' || p === 'glitch-rgb-flicker' || p === 'glitch-neon' || p === 'glitch-cyber-flash') {
    const split = Math.sin(localTime * 35 * speed) * 8 * int;
    state.cssFilters.push(generateRGBSplitFilter(split, 0.7));
  }
  if (p === 'glitch-tv-static' || p === 'glitch-digital-noise' || p === 'glitch-static-flash' || p === 'glitch-noise-pulse' || p === 'glitch-data-explosion' || p === 'glitch-ultra') {
    const noiseBright = 1 + (Math.sin(localTime * 60 * speed) > 0.7 ? (Math.random() - 0.5) * 0.25 * int : 0);
    state.brightness *= noiseBright;
    state.contrast *= (2 - noiseBright);
  }
  if (p === 'glitch-crt-flicker' || p === 'glitch-signal-loss' || p === 'glitch-broken-signal' || p === 'glitch-system-crash') {
    const flicker = Math.sin(localTime * 50 * speed) > 0.85 ? 1.3 * int : 1.0;
    state.brightness *= flicker;
  }
}
