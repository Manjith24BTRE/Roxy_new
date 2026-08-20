import { RendererParams } from './Renderer.types';
import { getSpeedFactor, getIntensityFactor, generateRGBSplitFilter } from './Renderer.utils';

export function retroEffectRenderer({ effect, localTime, duration, props, state }: RendererParams): void {
  const p = effect.presetId;
  const speed = getSpeedFactor(effect.speed);
  const int = getIntensityFactor(effect.intensity);

  if (p === 'retro-projector' || p === 'retro-flicker' || p === 'retro-super8' || p === 'retro-8mm' || p === 'retro-16mm' || p === 'retro-old-camera' || p === 'retro-analog-cam' || p === 'retro-vintage-lens') {
    const flicker = 1 + (Math.sin(localTime * 45 * speed) > 0.85 ? (Math.random() - 0.5) * 0.08 * int : 0);
    state.brightness *= flicker;
  }
  if (p === 'retro-blur' || p === 'retro-soft') {
    state.blur += 2 * int;
  }
  if (p === 'retro-cam-flash' || p === 'retro-flash') {
    const flashVal = Math.max(0, 1 - localTime * 2.5 * speed) * int;
    state.brightness *= (1 + flashVal * 1.6);
  }
  if (p === 'retro-color-shift') {
    const split = 4 * int;
    state.cssFilters.push(generateRGBSplitFilter(split, 0.5));
  }

  if (p === 'retro-vignette') {
    state.overlays.push({
      id: `retro-vignette-${effect.id}`,
      style: {
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        background: `radial-gradient(circle, transparent 40%, rgba(67,40,24,${0.6 * int}) 140%)`
      }
    });
  } else if (p === 'retro-vhs-overlay' || p === 'retro-tape-wear') {
    state.overlays.push({
      id: `retro-vhs-overlay-${effect.id}`,
      style: {
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        backgroundImage: 'linear-gradient(rgba(18,16,16,0) 50%, rgba(0,0,0,0.25) 50%)',
        backgroundSize: '100% 8px',
        opacity: 0.6 * int
      }
    });
  }
}
