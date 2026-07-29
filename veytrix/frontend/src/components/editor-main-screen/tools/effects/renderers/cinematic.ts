import { RendererParams } from './Renderer.types';
import { getSpeedFactor, getIntensityFactor } from './Renderer.utils';

export function cinematicEffectRenderer({ effect, localTime, duration, props, state }: RendererParams): void {
  const p = effect.presetId;
  const speed = getSpeedFactor(effect.speed);
  const int = getIntensityFactor(effect.intensity);

  if (p === 'cine-projector' || p === 'cine-film-burn' || p === 'cine-vintage-film') {
    const flicker = 1 + (Math.sin(localTime * 50 * speed) > 0.8 ? (Math.random() - 0.5) * 0.08 * int : 0);
    state.brightness *= flicker;
  }

  if (p === 'cine-softness' || p === 'cine-soft-diffusion' || p === 'cine-dream' || p === 'cine-cinema-bloom') {
    state.blur += 3 * int;
  }

  if (p === 'cine-letterbox') {
    const size = ((effect.letterboxSize ?? 25) * int) * 0.8;
    state.overlays.push({
      id: `cine-letterbox-${effect.id}`,
      style: {
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        boxShadow: `inset 0 ${size}px 0 #000, inset 0 -${size}px 0 #000`,
        background: 'transparent'
      }
    });
  } else if (p === 'cine-vignette') {
    const vign = (effect.vignetteAmount ?? 50) * int;
    state.overlays.push({
      id: `cine-vignette-${effect.id}`,
      style: {
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        background: `radial-gradient(circle, transparent ${100 - vign}%, rgba(0,0,0,0.85) 150%)`
      }
    });
  } else if (p === 'cine-spotlight') {
    state.overlays.push({
      id: `cine-spotlight-${effect.id}`,
      style: {
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        background: `radial-gradient(circle at 50% 50%, transparent 20%, rgba(0,0,0,0.7) 120%)`
      }
    });
  } else if (p === 'cine-film-grain') {
    const grainShiftX = (Math.floor(localTime * 100) % 4) * 5;
    const grainShiftY = (Math.floor(localTime * 120) % 4) * 5;
    state.overlays.push({
      id: `cine-grain-${effect.id}`,
      style: {
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        background: `repeating-linear-gradient(${props.angle ?? 45}deg, rgba(255,255,255,0.06) 0px, transparent 1px, rgba(0,0,0,0.06) 2px)`,
        backgroundSize: '3px 3px',
        transform: `translate(${grainShiftX}px, ${grainShiftY}px)`
      }
    });
  }
}
