import { RendererParams } from './Renderer.types';
import { getSpeedFactor, getIntensityFactor, generateRGBSplitFilter } from './Renderer.utils';

export function distortionEffectRenderer({ effect, localTime, duration, props, state }: RendererParams): void {
  const p = effect.presetId;
  const speed = getSpeedFactor(effect.speed);
  const int = getIntensityFactor(effect.intensity);

  if (p === 'dist-wave' || p === 'dist-water' || p === 'dist-heat' || p === 'dist-wobble' || p === 'dist-organic' || p === 'dist-fluid' || p === 'dist-morph' || p === 'dist-chaos') {
    state.translateX += Math.sin(localTime * 8 * speed) * 15 * int;
    state.translateY += Math.cos(localTime * 6 * speed) * 10 * int;
  } else if (p === 'dist-jelly' || p === 'dist-rubber' || p === 'dist-elastic' || p === 'dist-elastic-bounce') {
    const jellyScaleX = 1 + Math.sin(localTime * 10 * speed) * 0.08 * int;
    const jellyScaleY = 1 + Math.cos(localTime * 10 * speed) * 0.08 * int;
    state.scaleX *= jellyScaleX;
    state.scaleY *= jellyScaleY;
  } else if (p === 'dist-swirl' || p === 'dist-twist' || p === 'dist-spiral' || p === 'dist-vortex' || p === 'dist-tornado') {
    state.rotation += Math.sin(localTime * 3 * speed) * 12 * int;
    state.scale *= (1 + 0.05 * int);
  } else if (p === 'dist-stretch' || p === 'dist-pinch' || p === 'dist-bulge' || p === 'dist-warp' || p === 'dist-extreme' || p === 'dist-master') {
    state.scaleX *= (1 + 0.15 * int);
    state.scaleY *= (1 + 0.15 * int);
  } else if (p === 'dist-kaleidoscope') {
    state.rotation += Math.sin(localTime * speed) * 5;
    state.scale *= 1.15;
  }

  if (p === 'dist-prism' || p === 'dist-refraction' || p === 'dist-glass' || p === 'dist-liquid-glass' || p === 'dist-crystal') {
    const split = 4 * int;
    state.cssFilters.push(generateRGBSplitFilter(split, 0.4));
  }
}
