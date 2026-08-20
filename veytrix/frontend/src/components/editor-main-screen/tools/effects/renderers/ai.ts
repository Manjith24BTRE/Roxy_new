import { RendererParams } from './Renderer.types';
import { getSpeedFactor, getIntensityFactor } from './Renderer.utils';

export function aiEffectRenderer({ effect, localTime, duration, props, state }: RendererParams): void {
  const speed = getSpeedFactor(effect.speed);
  const int = getIntensityFactor(effect.intensity);

  const cycle = Math.sin(localTime * 1.5 * speed);
  state.hueRotate += cycle * 25 * int;
  state.saturation *= (1 + 0.3 * int);
  state.contrast *= (1 + 0.1 * int);
}
