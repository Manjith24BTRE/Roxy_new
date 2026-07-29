import { AppliedEffect, EffectPreset } from '../effectsPreset';

export interface OverlayItem {
  id?: string;
  className?: string;
  style?: React.CSSProperties;
  content?: React.ReactNode;
}

export interface RenderState {
  scale: number;
  scaleX: number;
  scaleY: number;
  rotation: number;
  translateX: number;
  translateY: number;
  skewX: number;
  skewY: number;
  opacity: number;
  brightness: number;
  contrast: number;
  saturation: number;
  blur: number;
  hueRotate: number;
  grayscale: number;
  sepia: number;
  invert: number;
  glow: number;
  shadow: string | null;
  blendMode: string;
  overlays: OverlayItem[];
  cssFilters: string[];
  cssTransforms: string[];
  cameraOffset: { x: number; y: number; z: number };
  shakeOffset: { x: number; y: number; rot: number };
}

export interface RendererParams {
  effect: AppliedEffect;
  preset?: EffectPreset;
  localTime: number;
  duration: number;
  props: Record<string, any>;
  state: RenderState;
}

export type EffectRendererFn = (params: RendererParams) => void;
