import { RendererParams } from './Renderer.types';
import { getSpeedFactor, getIntensityFactor } from './Renderer.utils';

export function motionEffectRenderer({ effect, localTime, duration, props, state }: RendererParams): void {
  const speed = getSpeedFactor(effect.speed);
  const int = getIntensityFactor(effect.intensity);

  const t = localTime * speed;
  state.translateX += Math.sin(t * 3) * 15 * int;
  state.translateY += Math.cos(t * 2) * 10 * int;
}
