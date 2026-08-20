import { RendererParams } from './Renderer.types';
import { getSpeedFactor, getIntensityFactor } from './Renderer.utils';

export function particlesEffectRenderer({ effect, localTime, duration, props, state }: RendererParams): void {
  const speed = getSpeedFactor(effect.speed);
  const int = getIntensityFactor(effect.intensity);

  const particleShift = (localTime * 20 * speed) % 100;
  state.brightness *= (1 + 0.1 * int);
  state.overlays.push({
    id: `particles-${effect.id}`,
    style: {
      position: 'absolute',
      inset: 0,
      pointerEvents: 'none',
      radialGradient: 'circle at 50% 50%, rgba(255,255,255,0.1) 0%, transparent 80%',
      transform: `translateY(-${particleShift}px)`,
      mixBlendMode: 'screen'
    } as any
  });
}
