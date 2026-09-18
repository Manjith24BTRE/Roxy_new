// src/components/editor-main-screen/tools/transitions/engines/dissolve/DissolveTransitionEngine.ts
import { assetRegistry } from '../../../../../../services/AssetRegistry';
import {
  DISSOLVE_TRANSITION_PRESETS,
  TransitionDefinition,
  DissolveMode,
} from './dissolveTransitionPresets';
import {
  clampProgress,
  easedProgress,
  crossDissolve,
  dipToColor,
  lumaMaskBlend,
  TransitionStateResult,
} from './dissolveTransitionUtils';

export class DissolveTransitionEngine {
  private static instance: DissolveTransitionEngine;

  private constructor() {}

  public static getInstance(): DissolveTransitionEngine {
    if (!DissolveTransitionEngine.instance) {
      DissolveTransitionEngine.instance = new DissolveTransitionEngine();
    }
    return DissolveTransitionEngine.instance;
  }

  /**
   * Resolves a TransitionDefinition from an asset ID, exact name, or direct object.
   */
  public getDefinition(identifier: string | number | TransitionDefinition): TransitionDefinition | undefined {
    if (typeof identifier === 'object' && identifier !== null && 'mode' in identifier) {
      return identifier as TransitionDefinition;
    }

    if (typeof identifier === 'number') {
      const asset = assetRegistry.getAssetById('Transitions', identifier);
      if (asset && DISSOLVE_TRANSITION_PRESETS[asset.name]) {
        return DISSOLVE_TRANSITION_PRESETS[asset.name];
      }
    }

    if (typeof identifier === 'string') {
      // 1. Exact preset name match
      if (DISSOLVE_TRANSITION_PRESETS[identifier]) {
        return DISSOLVE_TRANSITION_PRESETS[identifier];
      }

      // 2. Case-insensitive / trimmed name match
      const assetByName = assetRegistry.getAssetByName(identifier);
      if (assetByName && DISSOLVE_TRANSITION_PRESETS[assetByName.name]) {
        return DISSOLVE_TRANSITION_PRESETS[assetByName.name];
      }

      // 3. Match preset by loose string
      const matchedKey = Object.keys(DISSOLVE_TRANSITION_PRESETS).find(
        (key) => key.trim().toLowerCase() === identifier.trim().toLowerCase()
      );
      if (matchedKey) {
        return DISSOLVE_TRANSITION_PRESETS[matchedKey];
      }
    }

    // Default fallback
    return DISSOLVE_TRANSITION_PRESETS['Cross Dissolve'];
  }

  /**
   * Evaluates transition state for DOM/CSS preview rendering.
   * Returns exact opacity, filters, overlays, and transforms for outgoing and incoming clips.
   */
  public evaluateTransition(
    identifier: string | number | TransitionDefinition,
    rawProgress: number
  ): TransitionStateResult {
    const def = this.getDefinition(identifier) || DISSOLVE_TRANSITION_PRESETS['Cross Dissolve'];
    const p = clampProgress(rawProgress);

    let outgoingOpacity = 1;
    let incomingOpacity = 0;
    let outgoingFilter = '';
    let incomingFilter = '';
    let outgoingTransform = '';
    let incomingTransform = '';
    let overlayColor: string | undefined;
    let overlayOpacity: number | undefined;

    switch (def.mode) {
      case 'cross': {
        const mixVal = crossDissolve(p);
        outgoingOpacity = mixVal.outgoingOpacity;
        incomingOpacity = mixVal.incomingOpacity;
        break;
      }

      case 'fade-black': {
        const dip = dipToColor('#000000', p, def.parameters?.holdTime || 0.1);
        outgoingOpacity = dip.outgoingOpacity;
        incomingOpacity = dip.incomingOpacity;
        overlayColor = 'rgba(0, 0, 0, 1)';
        overlayOpacity = dip.overlayOpacity;
        break;
      }

      case 'fade-white': {
        const dip = dipToColor('#ffffff', p, def.parameters?.whiteHold || 0.05);
        outgoingOpacity = dip.outgoingOpacity;
        incomingOpacity = dip.incomingOpacity;
        overlayColor = 'rgba(255, 255, 255, 1)';
        overlayOpacity = dip.overlayOpacity;
        break;
      }

      case 'dip-color': {
        const targetColor = def.color || '#111827';
        const dip = dipToColor(targetColor, p, def.parameters?.holdRatio || 0.1);
        outgoingOpacity = dip.outgoingOpacity;
        incomingOpacity = dip.incomingOpacity;
        overlayColor = targetColor;
        overlayOpacity = dip.overlayOpacity;
        break;
      }

      case 'instant-cut': {
        // Hard step cut function, no fade interpolation
        if (p < (def.parameters?.cutPoint ?? 0.5)) {
          outgoingOpacity = 1;
          incomingOpacity = 0;
        } else {
          outgoingOpacity = 0;
          incomingOpacity = 1;
        }
        break;
      }

      case 'smooth-fade': {
        const pEased = easedProgress(p, 'smoothstep');
        outgoingOpacity = 1 - pEased;
        incomingOpacity = pEased;
        break;
      }

      case 'flash-cut': {
        const mid = 0.5;
        const flashIntensity = def.flashIntensity || 1.5;
        const distFromMid = Math.abs(p - mid);
        const flashAmount = Math.max(0, 1 - distFromMid * 4) * flashIntensity;

        if (p < mid) {
          outgoingOpacity = 1;
          incomingOpacity = 0;
        } else {
          outgoingOpacity = 0;
          incomingOpacity = 1;
        }

        if (flashAmount > 0.01) {
          const brightnessVal = 1 + flashAmount * 1.5;
          outgoingFilter = `brightness(${brightnessVal.toFixed(2)}) contrast(${(1 + flashAmount * 0.5).toFixed(2)})`;
          incomingFilter = `brightness(${brightnessVal.toFixed(2)}) contrast(${(1 + flashAmount * 0.5).toFixed(2)})`;
          overlayColor = 'rgba(255, 255, 255, 1)';
          overlayOpacity = Math.min(1, flashAmount);
        }
        break;
      }

      case 'soft-dissolve': {
        const pSine = easedProgress(p, 'sine');
        outgoingOpacity = 1 - pSine;
        incomingOpacity = pSine;
        break;
      }

      case 'blur-dissolve': {
        const maxBlur = def.blurRadius || 16.0;

        if (p < 0.5) {
          const normP = p / 0.5; // 0 -> 1
          outgoingOpacity = 1 - normP * 0.5;
          incomingOpacity = normP * 0.5;
          const outBlur = (normP * maxBlur).toFixed(1);
          outgoingFilter = `blur(${outBlur}px)`;
        } else {
          const normP = (p - 0.5) / 0.5; // 0 -> 1
          outgoingOpacity = (1 - normP) * 0.5;
          incomingOpacity = 0.5 + normP * 0.5;
          const inBlur = ((1 - normP) * maxBlur).toFixed(1);
          incomingFilter = `blur(${inBlur}px)`;
        }
        break;
      }

      case 'luma-fade': {
        const pEased = easedProgress(p, 'linear');
        outgoingOpacity = 1 - pEased;
        incomingOpacity = pEased;
        const contrastVal = (1 + Math.sin(pEased * Math.PI) * 0.3).toFixed(2);
        outgoingFilter = `contrast(${contrastVal})`;
        incomingFilter = `contrast(${contrastVal})`;
        break;
      }

      default: {
        outgoingOpacity = 1 - p;
        incomingOpacity = p;
        break;
      }
    }

    return {
      outgoingOpacity,
      incomingOpacity,
      outgoingFilter,
      incomingFilter,
      outgoingTransform,
      incomingTransform,
      overlayColor,
      overlayOpacity,
      renderMode: def.mode,
    };
  }

  /**
   * Performs frame composite rendering for Canvas / WebGL export parity.
   */
  public renderFrameComposite(
    outgoingCanvas: HTMLCanvasElement,
    incomingCanvas: HTMLCanvasElement,
    rawProgress: number,
    identifier: string | number | TransitionDefinition
  ): HTMLCanvasElement {
    const def = this.getDefinition(identifier) || DISSOLVE_TRANSITION_PRESETS['Cross Dissolve'];
    const p = clampProgress(rawProgress);
    const width = outgoingCanvas.width;
    const height = outgoingCanvas.height;

    const outCtx = outgoingCanvas.getContext('2d');
    const inCtx = incomingCanvas.getContext('2d');

    const outputCanvas = document.createElement('canvas');
    outputCanvas.width = width;
    outputCanvas.height = height;
    const ctx = outputCanvas.getContext('2d');
    if (!ctx || !outCtx || !inCtx) return outgoingCanvas;

    const evalResult = this.evaluateTransition(def, p);

    if (def.mode === 'luma-fade') {
      const outImg = outCtx.getImageData(0, 0, width, height);
      const inImg = inCtx.getImageData(0, 0, width, height);
      const blendedImg = lumaMaskBlend(outImg, inImg, p, def.lumaSoftness || 0.15);
      ctx.putImageData(blendedImg, 0, 0);
      return outputCanvas;
    }

    // 1. Clear output canvas
    ctx.clearRect(0, 0, width, height);

    // 2. Draw outgoing frame with opacity and filter
    if (evalResult.outgoingOpacity > 0.001) {
      ctx.save();
      ctx.globalAlpha = evalResult.outgoingOpacity;
      if (evalResult.outgoingFilter) {
        ctx.filter = evalResult.outgoingFilter;
      }
      ctx.drawImage(outgoingCanvas, 0, 0);
      ctx.restore();
    }

    // 3. Draw incoming frame with opacity and filter
    if (evalResult.incomingOpacity > 0.001) {
      ctx.save();
      ctx.globalAlpha = evalResult.incomingOpacity;
      if (evalResult.incomingFilter) {
        ctx.filter = evalResult.incomingFilter;
      }
      ctx.drawImage(incomingCanvas, 0, 0);
      ctx.restore();
    }

    // 4. Draw color overlay dip if applicable
    if (evalResult.overlayColor && evalResult.overlayOpacity && evalResult.overlayOpacity > 0.001) {
      ctx.save();
      ctx.globalAlpha = evalResult.overlayOpacity;
      ctx.fillStyle = evalResult.overlayColor;
      ctx.fillRect(0, 0, width, height);
      ctx.restore();
    }

    return outputCanvas;
  }
}

export const dissolveTransitionEngine = DissolveTransitionEngine.getInstance();
