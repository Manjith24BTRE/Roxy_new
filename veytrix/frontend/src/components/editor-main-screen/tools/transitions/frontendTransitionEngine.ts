// -----------------------------------------------------------------------------
// frontendTransitionEngine.ts
// -----------------------------------------------------------------------------
// Centralized Frontend Transition Registry & Preview Rendering Engine.
// Provides deterministic progress-driven (0 -> 1) visual states for all 200 transitions.
// STRICTLY FRONTEND ONLY.
// -----------------------------------------------------------------------------

import React from 'react';

export type TransitionRendererType =
  | 'fade'
  | 'fade-black'
  | 'fade-white'
  | 'whip-pan'
  | 'slide'
  | 'push'
  | 'zoom-in'
  | 'zoom-out'
  | 'spin'
  | 'flip-3d'
  | 'cube-3d'
  | 'glitch'
  | 'blur'
  | 'light-burn'
  | 'cut';

export interface TransitionResolvedConfig {
  id: string;
  renderer: TransitionRendererType;
  direction: 'left' | 'right' | 'up' | 'down' | 'cw' | 'ccw' | 'center' | 'none';
  duration: number;
  speed: number;
  intensity: number;
  easing: string;
  motionBlur: boolean;
  color?: string;
}

export interface FrameRenderState {
  opacity: number;
  transform: string;
  filter: string;
  zIndex: number;
}

export interface TransitionPairFrame {
  sceneA: FrameRenderState;
  sceneB: FrameRenderState;
  overlayColor?: string;
  overlayGradient?: string;
}

/**
 * Maps any transition ID (string or config object) to its stable frontend renderer config.
 */
export function resolveFrontendTransition(
  transitionInput: any,
  fallbackCategory?: string
): TransitionResolvedConfig {
  let id = '';
  let direction: any = 'none';
  let speed = 1.0;
  let intensity = 50;
  let duration = 0.8;
  let easing = 'ease-in-out';
  let motionBlur = true;
  let category = fallbackCategory || 'basic';

  if (typeof transitionInput === 'string') {
    id = transitionInput;
  } else if (transitionInput && typeof transitionInput === 'object') {
    id = transitionInput.id || transitionInput.transition_type || transitionInput.type || transitionInput.name || '';
    direction = transitionInput.direction || 'none';
    speed = typeof transitionInput.speed === 'number' ? transitionInput.speed : 1.0;
    intensity = typeof transitionInput.intensity === 'number' ? transitionInput.intensity : 50;
    duration = typeof transitionInput.duration === 'number' ? transitionInput.duration : 0.8;
    easing = transitionInput.easing || 'ease-in-out';
    motionBlur = typeof transitionInput.motionBlur === 'boolean' ? transitionInput.motionBlur : (transitionInput.motion_blur ?? true);
    category = transitionInput.category || fallbackCategory || 'basic';
  }

  const cleanId = (id || '').toLowerCase().trim();
  const cleanCat = (category || '').toLowerCase().trim();

  // Resolve direction hints from ID if not set
  if (direction === 'none' || !direction) {
    if (cleanId.includes('left')) direction = 'left';
    else if (cleanId.includes('right')) direction = 'right';
    else if (cleanId.includes('up')) direction = 'up';
    else if (cleanId.includes('down')) direction = 'down';
    else if (cleanId.includes('ccw') || cleanId.includes('counter')) direction = 'ccw';
    else if (cleanId.includes('cw')) direction = 'cw';
  }

  let renderer: TransitionRendererType = 'fade';

  // 1. Black Fade / Dip to Dark
  if (cleanId.includes('black') || cleanId.includes('dark') || cleanId.includes('dip-to-color')) {
    renderer = 'fade-black';
  }
  // 2. White Fade / Flash / Bright Cut
  else if (cleanId.includes('white') || cleanId.includes('flash') || cleanId.includes('bright') || cleanId.includes('exposure')) {
    renderer = 'fade-white';
  }
  // 3. Cut / Instant
  else if (cleanId.includes('cut') || cleanId.includes('instant')) {
    renderer = 'cut';
  }
  // 4. Whip Pan
  else if (cleanId.includes('whip') || cleanId.includes('pan')) {
    renderer = 'whip-pan';
    if (direction === 'none') direction = 'left';
  }
  // 5. Camera Shake / Jitter / Handheld
  else if (cleanId.includes('shake') || cleanId.includes('handheld') || cleanId.includes('action-cam')) {
    renderer = 'glitch';
    intensity = Math.max(intensity, 60);
  }
  // 6. Zoom Out / Pull Out / Dolly Out
  else if (cleanId.includes('out') || cleanId.includes('pull-out') || cleanId.includes('dolly-out')) {
    renderer = 'zoom-out';
  }
  // 7. Zoom In / Crash Zoom / Push In / Tunnel Zoom
  else if (
    cleanId.includes('zoom') ||
    cleanId.includes('push') ||
    cleanId.includes('crash') ||
    cleanId.includes('tunnel') ||
    cleanId.includes('warp') ||
    cleanId.includes('dolly') ||
    cleanId.includes('scale')
  ) {
    renderer = 'zoom-in';
  }
  // 8. 3D Flip / Cube / Perspective / Card Stack
  else if (cleanId.includes('flip') || cleanId.includes('cube') || cleanId.includes('3d') || cleanId.includes('card') || cleanId.includes('page')) {
    renderer = cleanId.includes('cube') ? 'cube-3d' : 'flip-3d';
  }
  // 9. Spin / Rotate / Roll / Orbit / Portal
  else if (cleanId.includes('spin') || cleanId.includes('rotate') || cleanId.includes('roll') || cleanId.includes('orbit') || cleanId.includes('portal') || cleanId.includes('helix')) {
    renderer = 'spin';
    if (direction === 'none') direction = 'cw';
  }
  // 10. Slide / Push / Move / Swipe / Cover / Drop
  else if (
    cleanCat.includes('slide') ||
    cleanId.includes('slide') ||
    cleanId.includes('push') ||
    cleanId.includes('swipe') ||
    cleanId.includes('move') ||
    cleanId.includes('cover') ||
    cleanId.includes('drop') ||
    cleanId.includes('tilt') ||
    cleanId.includes('crane')
  ) {
    renderer = 'slide';
    if (direction === 'none') direction = 'left';
  }
  // 11. Glitch / RGB Split / VHS / Static / Distortion
  else if (
    cleanCat.includes('glitch') ||
    cleanId.includes('glitch') ||
    cleanId.includes('rgb') ||
    cleanId.includes('vhs') ||
    cleanId.includes('static') ||
    cleanId.includes('pixel') ||
    cleanId.includes('corruption') ||
    cleanId.includes('tear')
  ) {
    renderer = 'glitch';
  }
  // 12. Blur / Rack Focus / Bokeh / Defocus
  else if (cleanCat.includes('blur') || cleanId.includes('blur') || cleanId.includes('focus') || cleanId.includes('soft')) {
    renderer = 'blur';
  }
  // 13. Light Leak / Film Burn / Glow / Rays / Flare
  else if (
    cleanCat.includes('light') ||
    cleanCat.includes('cine') ||
    cleanId.includes('burn') ||
    cleanId.includes('leak') ||
    cleanId.includes('flare') ||
    cleanId.includes('glow') ||
    cleanId.includes('sun') ||
    cleanId.includes('light')
  ) {
    renderer = 'light-burn';
  }
  // 14. Cross Dissolve / Fade
  else {
    renderer = 'fade';
  }

  // Development logging
  if (process.env.NODE_ENV !== 'production') {
    console.log(`[TransitionEngine] Selected transition: '${id}', Renderer: '${renderer}', Direction: '${direction}', Progress Ready`);
  }

  return {
    id: id || 'cross-dissolve-premium',
    renderer,
    direction,
    duration,
    speed,
    intensity,
    easing,
    motionBlur,
  };
}

/**
 * Computes deterministic Scene A & Scene B frame render state for progress in [0, 1].
 */
export function renderFrontendTransitionFrame(
  config: TransitionResolvedConfig,
  progressInput: number
): TransitionPairFrame {
  const p = Math.max(0.0, Math.min(1.0, progressInput));

  const stateA: FrameRenderState = { opacity: 1, transform: 'none', filter: 'none', zIndex: 10 };
  const stateB: FrameRenderState = { opacity: 0, transform: 'none', filter: 'none', zIndex: 11 };
  let overlayColor: string | undefined;
  let overlayGradient: string | undefined;

  switch (config.renderer) {
    case 'cut': {
      if (p < 0.5) {
        stateA.opacity = 1;
        stateB.opacity = 0;
      } else {
        stateA.opacity = 0;
        stateB.opacity = 1;
      }
      break;
    }

    case 'fade-black': {
      if (p <= 0.5) {
        stateA.opacity = 1 - p * 2;
        stateB.opacity = 0;
        overlayColor = `rgba(0, 0, 0, ${p * 2})`;
      } else {
        stateA.opacity = 0;
        stateB.opacity = (p - 0.5) * 2;
        overlayColor = `rgba(0, 0, 0, ${(1 - p) * 2})`;
      }
      break;
    }

    case 'fade-white': {
      const flashAlpha = Math.sin(p * Math.PI) * 0.95;
      stateA.opacity = 1 - p;
      stateB.opacity = p;
      stateA.filter = `brightness(${1 + flashAlpha * 2.5})`;
      stateB.filter = `brightness(${1 + flashAlpha * 2.5})`;
      overlayColor = `rgba(255, 255, 255, ${flashAlpha})`;
      break;
    }

    case 'whip-pan': {
      const blurPx = Math.sin(p * Math.PI) * 16;
      const isRight = config.direction === 'right';
      const isUp = config.direction === 'up';
      const isDown = config.direction === 'down';
      const factor = isRight || isDown ? 1 : -1;

      if (isUp || isDown) {
        stateA.transform = `translateY(${p * 100 * factor}%)`;
        stateB.transform = `translateY(${(1 - p) * -100 * factor}%)`;
      } else {
        stateA.transform = `translateX(${p * 100 * factor}%)`;
        stateB.transform = `translateX(${(1 - p) * -100 * factor}%)`;
      }
      stateA.filter = `blur(${blurPx}px)`;
      stateB.filter = `blur(${blurPx}px)`;
      stateA.opacity = 1 - p * 0.3;
      stateB.opacity = 0.3 + p * 0.7;
      break;
    }

    case 'slide':
    case 'push': {
      const isRight = config.direction === 'right';
      const isUp = config.direction === 'up';
      const isDown = config.direction === 'down';
      const factor = isRight || isDown ? 1 : -1;

      if (isUp || isDown) {
        stateA.transform = `translateY(${p * 100 * factor}%)`;
        stateB.transform = `translateY(${(1 - p) * -100 * factor}%)`;
      } else {
        stateA.transform = `translateX(${p * 100 * factor}%)`;
        stateB.transform = `translateX(${(1 - p) * -100 * factor}%)`;
      }
      stateA.opacity = 1;
      stateB.opacity = 1;
      break;
    }

    case 'zoom-in': {
      stateA.transform = `scale(${1 + p * 1.5})`;
      stateB.transform = `scale(${0.3 + p * 0.7})`;
      stateA.opacity = 1 - p;
      stateB.opacity = p;
      const blurPx = Math.sin(p * Math.PI) * 6;
      stateA.filter = `blur(${blurPx}px)`;
      stateB.filter = `blur(${blurPx}px)`;
      break;
    }

    case 'zoom-out': {
      stateA.transform = `scale(${1 - p * 0.6})`;
      stateB.transform = `scale(${2.0 - p * 1.0})`;
      stateA.opacity = 1 - p;
      stateB.opacity = p;
      break;
    }

    case 'spin': {
      const isCCW = config.direction === 'ccw';
      const dir = isCCW ? -1 : 1;
      const angle = p * 180 * dir;
      stateA.transform = `rotate(${angle}deg) scale(${1 - p * 0.4})`;
      stateB.transform = `rotate(${(p - 1) * 180 * dir}deg) scale(${0.6 + p * 0.4})`;
      stateA.opacity = 1 - p;
      stateB.opacity = p;
      break;
    }

    case 'flip-3d':
    case 'cube-3d': {
      const angle = p * 90;
      stateA.transform = `perspective(800px) rotateY(${angle}deg)`;
      stateB.transform = `perspective(800px) rotateY(${(1 - p) * -90}deg)`;
      stateA.opacity = 1 - p;
      stateB.opacity = p;
      break;
    }

    case 'glitch': {
      const shiftX = Math.sin(p * 45) * 20 * Math.sin(p * Math.PI);
      const hue = Math.sin(p * Math.PI) * 140;
      stateA.transform = `translateX(${shiftX}px)`;
      stateB.transform = `translateX(${-shiftX}px)`;
      stateA.filter = `hue-rotate(${hue}deg) contrast(1.4)`;
      stateB.filter = `hue-rotate(${-hue}deg) contrast(1.4)`;
      stateA.opacity = 1 - p;
      stateB.opacity = p;
      overlayColor = `rgba(56, 189, 248, ${Math.sin(p * Math.PI) * 0.3})`;
      break;
    }

    case 'blur': {
      const blurPx = Math.sin(p * Math.PI) * 24;
      stateA.filter = `blur(${blurPx}px)`;
      stateB.filter = `blur(${blurPx}px)`;
      stateA.opacity = 1 - p;
      stateB.opacity = p;
      break;
    }

    case 'light-burn': {
      const glow = Math.sin(p * Math.PI);
      stateA.opacity = 1 - p;
      stateB.opacity = p;
      stateA.filter = `brightness(${1 + glow * 0.8}) saturate(${1 + glow * 0.5})`;
      stateB.filter = `brightness(${1 + glow * 0.8}) saturate(${1 + glow * 0.5})`;
      overlayGradient = `radial-gradient(circle at 50% 50%, rgba(245, 158, 11, ${glow * 0.85}) 0%, rgba(239, 68, 68, ${glow * 0.5}) 50%, transparent 85%)`;
      break;
    }

    case 'fade':
    default: {
      stateA.opacity = 1 - p;
      stateB.opacity = p;
      break;
    }
  }

  return { sceneA: stateA, sceneB: stateB, overlayColor, overlayGradient };
}
