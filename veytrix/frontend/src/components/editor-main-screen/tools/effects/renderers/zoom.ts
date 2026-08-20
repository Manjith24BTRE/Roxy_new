import { RendererParams } from './Renderer.types';
import { getSpeedFactor, getIntensityFactor } from './Renderer.utils';

export function zoomEffectRenderer({ effect, localTime, duration, props, state }: RendererParams): void {
  const speed = getSpeedFactor(effect.speed);
  const int = getIntensityFactor(effect.intensity);

  const cycle = (localTime * speed) % 2;
  const pulse = Math.sin(cycle * Math.PI) * 0.2 * int;
  state.scale *= (1 + pulse);
}
