import { RendererParams } from './Renderer.types';
import { getSpeedFactor, getIntensityFactor } from './Renderer.utils';

export function cameraEffectRenderer({ effect, localTime, duration, props, state }: RendererParams): void {
  const p = effect.presetId;
  const speed = getSpeedFactor(effect.speed);
  const int = getIntensityFactor(effect.intensity);

  if (p === 'camera-handheld') {
    state.cameraOffset.x += Math.sin(localTime * 1.5 * speed) * 15 * int;
    state.cameraOffset.y += Math.cos(localTime * 1.1 * speed) * 12 * int;
    state.rotation += Math.sin(localTime * 0.8 * speed) * 1.5 * int;
  } else if (p === 'camera-shake') {
    const s = localTime * 35 * speed;
    state.shakeOffset.x += Math.sin(s) * 12 * int;
    state.shakeOffset.y += Math.cos(s * 1.2) * 12 * int;
  } else if (p === 'camera-earthquake') {
    const s = localTime * 60 * speed;
    state.shakeOffset.x += Math.sin(s) * 35 * int;
    state.shakeOffset.y += Math.cos(s * 1.4) * 30 * int;
  } else if (p === 'camera-crash-zoom') {
    const pVal = Math.min(1, localTime / 0.6);
    const ease = Math.pow(pVal, 3);
    state.scale *= (1 + ease * 0.7 * int);
  } else if (p === 'camera-whip-l') {
    const pVal = Math.min(1, localTime / 0.5);
    state.translateX -= (1 - pVal) * 350 * int;
  } else if (p === 'camera-whip-r') {
    const pVal = Math.min(1, localTime / 0.5);
    state.translateX += (1 - pVal) * 350 * int;
  } else if (p === 'camera-dolly-in') {
    state.scale *= (1 + (localTime / duration) * 0.3 * int);
  } else if (p === 'camera-dolly-out') {
    state.scale *= (1 - (localTime / duration) * 0.25 * int);
  } else if (p === 'camera-truck-l') {
    state.translateX -= (localTime / duration) * 120 * int;
  } else if (p === 'camera-truck-r') {
    state.translateX += (localTime / duration) * 120 * int;
  } else if (p === 'camera-pedestal-up') {
    state.translateY -= (localTime / duration) * 120 * int;
  } else if (p === 'camera-pedestal-down') {
    state.translateY += (localTime / duration) * 120 * int;
  } else if (p === 'camera-orbit-l') {
    const angle = (localTime / duration) * Math.PI * int;
    state.translateX -= Math.sin(angle) * 80 * speed;
    state.scale *= (1 + (1 - Math.cos(angle)) * 0.08);
  } else if (p === 'camera-orbit-r') {
    const angle = (localTime / duration) * Math.PI * int;
    state.translateX += Math.sin(angle) * 80 * speed;
    state.scale *= (1 + (1 - Math.cos(angle)) * 0.08);
  } else if (p === 'camera-fpv-dive') {
    state.rotation += (localTime / duration) * 90 * speed * int;
    state.translateY += (localTime / duration) * 180 * speed * int;
    state.scale *= (1 + (localTime / duration) * 0.3 * int);
  } else if (p === 'camera-steadicam') {
    state.cameraOffset.x += Math.sin(localTime * 0.8 * speed) * 4 * int;
    state.cameraOffset.y += Math.cos(localTime * 0.6 * speed) * 3 * int;
  } else if (p === 'camera-walking-cam') {
    const walkCycle = localTime * Math.PI * 2 * 1.5 * speed;
    state.translateY -= Math.abs(Math.sin(walkCycle)) * 12 * int;
    state.translateX += Math.cos(walkCycle / 2) * 5 * int;
  } else if (p === 'camera-running-cam') {
    const runCycle = localTime * Math.PI * 2 * 3.0 * speed;
    state.translateY -= Math.abs(Math.sin(runCycle)) * 30 * int;
    state.translateX += Math.cos(runCycle / 2) * 12 * int;
    state.rotation += Math.sin(runCycle) * 2.5 * int;
  }
}
