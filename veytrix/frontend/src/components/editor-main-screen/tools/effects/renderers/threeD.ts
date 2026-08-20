import { RendererParams } from './Renderer.types';
import { getSpeedFactor, getIntensityFactor, generateRGBSplitFilter } from './Renderer.utils';

export function threeDEffectRenderer({ effect, localTime, duration, props, state }: RendererParams): void {
  const speed = getSpeedFactor(effect.speed);
  const int = getIntensityFactor(effect.intensity);

  const angle = Math.sin(localTime * 2 * speed) * 8 * int;
  state.skewX += angle;
  state.scale *= (1 + 0.05 * int);
  state.cssFilters.push(generateRGBSplitFilter(6 * int, 0.6));
}
