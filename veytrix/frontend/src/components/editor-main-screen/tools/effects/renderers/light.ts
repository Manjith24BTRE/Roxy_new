import { RendererParams } from './Renderer.types';
import { getSpeedFactor, getIntensityFactor } from './Renderer.utils';

export function lightEffectRenderer({ effect, localTime, duration, props, state }: RendererParams): void {
  const p = effect.presetId;
  const speed = getSpeedFactor(effect.speed);
  const int = getIntensityFactor(effect.intensity);

  if (p === 'light-camera-flash') {
    const flashVal = Math.max(0, 1 - localTime * 3 * speed) * int;
    state.brightness *= (1 + flashVal * 1.5);
  }
  if (p === 'light-flicker' || p === 'light-fire-glow' || p === 'light-candle') {
    const flicker = 1 + (Math.sin(localTime * 40 * speed) * 0.08 * int);
    state.brightness *= flicker;
  }
  if (p === 'light-pulse') {
    const pulse = 1 + (Math.sin(localTime * Math.PI * speed) * 0.12 * int);
    state.brightness *= pulse;
  }

  if (p === 'light-sun-flare' || p === 'light-sun-burst') {
    const angle = (props.angle ?? 45) + localTime * 15 * speed;
    state.overlays.push({
      id: `light-flare-${effect.id}`,
      style: {
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        background: `radial-gradient(circle at 80% 20%, rgba(251,191,36,${0.35 * int}) 0%, rgba(245,158,11,0.15) 30%, transparent 70%)`,
        mixBlendMode: 'screen'
      }
    });
  } else if (p === 'light-rainbow-leak' || p === 'light-color-leak') {
    state.overlays.push({
      id: `light-rainbow-${effect.id}`,
      style: {
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        background: `linear-gradient(${props.angle ?? 135}deg, rgba(239,68,68,${0.2 * int}), rgba(59,130,246,${0.2 * int}), rgba(16,185,129,${0.2 * int}))`,
        mixBlendMode: 'screen'
      }
    });
  }
}
