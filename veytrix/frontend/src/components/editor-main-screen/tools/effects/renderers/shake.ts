import { RendererParams } from './Renderer.types';
import { getSpeedFactor, getIntensityFactor } from './Renderer.utils';

export function shakeEffectRenderer({ effect, localTime, duration, props, state }: RendererParams): void {
  const speed = getSpeedFactor(effect.speed);
  const int = getIntensityFactor(effect.intensity);

  const freq = 45 * speed;
  state.shakeOffset.x += Math.sin(localTime * freq) * 14 * int;
  state.shakeOffset.y += Math.cos(localTime * (freq * 1.2)) * 12 * int;
  state.shakeOffset.rot += Math.sin(localTime * (freq * 0.5)) * 2 * int;
}
