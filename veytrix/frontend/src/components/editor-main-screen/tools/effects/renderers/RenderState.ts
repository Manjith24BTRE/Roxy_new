import { RenderState } from './Renderer.types';

export function createDefaultRenderState(): RenderState {
  return {
    scale: 1,
    scaleX: 1,
    scaleY: 1,
    rotation: 0,
    translateX: 0,
    translateY: 0,
    skewX: 0,
    skewY: 0,
    opacity: 1,
    brightness: 1,
    contrast: 1,
    saturation: 1,
    blur: 0,
    hueRotate: 0,
    grayscale: 0,
    sepia: 0,
    invert: 0,
    glow: 0,
    shadow: null,
    blendMode: 'normal',
    overlays: [],
    cssFilters: [],
    cssTransforms: [],
    cameraOffset: { x: 0, y: 0, z: 0 },
    shakeOffset: { x: 0, y: 0, rot: 0 }
  };
}

export function renderStateToCSS(state: RenderState): {
  filterStr: string;
  transformStr: string;
  opacityVal: number;
  mixBlendModeVal: string;
} {
  const filters: string[] = [];

  if (state.brightness !== 1) filters.push(`brightness(${state.brightness})`);
  if (state.contrast !== 1) filters.push(`contrast(${state.contrast})`);
  if (state.saturation !== 1) filters.push(`saturate(${state.saturation})`);
  if (state.sepia > 0) filters.push(`sepia(${state.sepia})`);
  if (state.grayscale > 0) filters.push(`grayscale(${state.grayscale})`);
  if (state.invert > 0) filters.push(`invert(${state.invert})`);
  if (state.hueRotate !== 0) filters.push(`hue-rotate(${state.hueRotate}deg)`);
  if (state.blur > 0) filters.push(`blur(${state.blur}px)`);
  if (state.glow > 0) filters.push(`drop-shadow(0 0 ${state.glow}px rgba(56,189,248,0.8))`);
  if (state.shadow) filters.push(state.shadow);

  if (state.cssFilters.length > 0) {
    filters.push(...state.cssFilters);
  }

  const totalPosX = state.translateX + state.cameraOffset.x + state.shakeOffset.x;
  const totalPosY = state.translateY + state.cameraOffset.y + state.shakeOffset.y;
  const totalRot = state.rotation + state.shakeOffset.rot;
  const finalScaleX = state.scale * state.scaleX;
  const finalScaleY = state.scale * state.scaleY;

  const transforms: string[] = [
    `translate(${totalPosX}px, ${totalPosY}px)`,
    `scale(${finalScaleX}, ${finalScaleY})`,
    `rotate(${totalRot}deg)`
  ];

  if (state.skewX !== 0 || state.skewY !== 0) {
    transforms.push(`skew(${state.skewX}deg, ${state.skewY}deg)`);
  }

  if (state.cssTransforms.length > 0) {
    transforms.push(...state.cssTransforms);
  }

  return {
    filterStr: filters.length > 0 ? filters.join(' ') : 'none',
    transformStr: transforms.join(' '),
    opacityVal: Math.max(0, Math.min(1, state.opacity)),
    mixBlendModeVal: state.blendMode || 'normal'
  };
}
