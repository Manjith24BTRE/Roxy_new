import { RendererParams } from './Renderer.types';
import { getIntensityFactor } from './Renderer.utils';

export function overlayEffectRenderer({ effect, localTime, duration, props, state }: RendererParams): void {
  const int = getIntensityFactor(effect.intensity);

  state.overlays.push({
    id: `overlay-${effect.id}`,
    style: {
      position: 'absolute',
      inset: 0,
      pointerEvents: 'none',
      backgroundColor: `rgba(255,255,255,${0.05 * int})`,
      mixBlendMode: 'overlay'
    }
  });
}
