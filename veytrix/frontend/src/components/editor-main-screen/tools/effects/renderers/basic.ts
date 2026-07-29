import { RendererParams } from './Renderer.types';
import { getSpeedFactor, getIntensityFactor } from './Renderer.utils';

export function basicEffectRenderer({ effect, localTime, duration, props, state }: RendererParams): void {
  const p = effect.presetId;
  const speed = getSpeedFactor(effect.speed);
  const int = getIntensityFactor(effect.intensity);

  if (p === 'basic-fade-in') {
    const fadeDuration = 1.0 / speed;
    if (localTime <= fadeDuration) {
      const alpha = (localTime / fadeDuration) * int + (1 - int);
      state.opacity *= alpha;
    }
  } else if (p === 'basic-fade-out') {
    const fadeDuration = 1.0 / speed;
    if (duration - localTime <= fadeDuration) {
      const diff = Math.max(0, duration - localTime);
      const alpha = (diff / fadeDuration) * int + (1 - int);
      state.opacity *= alpha;
    }
  } else if (p === 'basic-zoom-in') {
    const pVal = Math.min(1, localTime / duration);
    state.scale *= (1 + pVal * 0.4 * int);
  } else if (p === 'basic-zoom-out') {
    const pVal = Math.min(1, localTime / duration);
    state.scale *= (1 + (1 - pVal) * 0.4 * int);
  } else if (p === 'basic-move-left') {
    state.translateX -= (localTime / duration) * 120 * int;
  } else if (p === 'basic-move-right') {
    state.translateX += (localTime / duration) * 120 * int;
  } else if (p === 'basic-move-up') {
    state.translateY -= (localTime / duration) * 120 * int;
  } else if (p === 'basic-move-down') {
    state.translateY += (localTime / duration) * 120 * int;
  } else if (p === 'basic-spin-1' || p === 'basic-spin-2' || p === 'basic-spin-3' || p === 'basic-spin-4') {
    state.rotation += localTime * 90 * speed * int;
  } else if (p === 'basic-blink') {
    const blinkTime = Math.floor(localTime * 8 * speed) % 2;
    if (blinkTime === 0) {
      state.opacity *= (1 - 0.7 * int);
    }
  } else if (p === 'basic-slow-zoom') {
    const pVal = localTime / duration;
    state.scale *= (1 + pVal * 0.25 * int);
  } else if (p === 'basic-micro-shake') {
    const s = localTime * 60 * speed;
    state.shakeOffset.x += Math.sin(s) * 3 * int;
    state.shakeOffset.y += Math.cos(s * 1.3) * 3 * int;
  } else if (p === 'basic-macro-shake') {
    const s = localTime * 12 * speed;
    state.shakeOffset.x += Math.sin(s) * 25 * int;
    state.shakeOffset.y += Math.cos(s * 1.3) * 25 * int;
  } else if (p === 'basic-drift-l') {
    state.translateX -= (localTime / duration) * 100 * int;
  } else if (p === 'basic-drift-r') {
    state.translateX += (localTime / duration) * 100 * int;
  } else if (p === 'basic-rotate-zoom') {
    const pVal = localTime / duration;
    state.rotation += pVal * 36 * int;
    state.scale *= (1 + pVal * 0.15 * int);
  } else if (p === 'basic-expand') {
    const pVal = Math.min(1, localTime / 1.2);
    state.scale *= (0.7 + pVal * 0.3 * int);
  } else if (p === 'basic-collapse') {
    const pVal = Math.min(1, localTime / 1.2);
    state.scale *= (1.0 - pVal * 0.3 * int);
  }
}
