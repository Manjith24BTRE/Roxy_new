// src/components/editor-main-screen/tools/transitions/engines/spin/SpinTransitionEngine.ts
import { assetRegistry } from '../../../../../../services/AssetRegistry';
import {
  SPIN_TRANSITION_PRESETS,
  SpinTransitionDefinition,
} from './spinTransitionPresets';
import {
  clampProgress,
  easedProgress,
  computeSpinTransform,
  compute3DFlipTransform,
  computePageFlipTransform,
  computeCylinderRotateTransform,
  computePortalSpinTransform,
  SpinTransitionState,
} from './spinTransitionUtils';

export class SpinTransitionEngine {
  private static instance: SpinTransitionEngine;

  private constructor() {}

  public static getInstance(): SpinTransitionEngine {
    if (!SpinTransitionEngine.instance) {
      SpinTransitionEngine.instance = new SpinTransitionEngine();
    }
    return SpinTransitionEngine.instance;
  }

  /**
   * Resolves a SpinTransitionDefinition from an asset ID, exact name, or direct object.
   */
  public getDefinition(identifier: string | number | SpinTransitionDefinition): SpinTransitionDefinition | undefined {
    if (typeof identifier === 'object' && identifier !== null && 'mode' in identifier) {
      return identifier as SpinTransitionDefinition;
    }

    if (typeof identifier === 'number') {
      const asset = assetRegistry.getAssetById('Transitions', identifier);
      if (asset && SPIN_TRANSITION_PRESETS[asset.name]) {
        return SPIN_TRANSITION_PRESETS[asset.name];
      }
    }

    if (typeof identifier === 'string') {
      // 1. Exact preset name match
      if (SPIN_TRANSITION_PRESETS[identifier]) {
        return SPIN_TRANSITION_PRESETS[identifier];
      }

      // 2. Case-insensitive / trimmed name match
      const assetByName = assetRegistry.getAssetByName(identifier);
      if (assetByName && SPIN_TRANSITION_PRESETS[assetByName.name]) {
        return SPIN_TRANSITION_PRESETS[assetByName.name];
      }

      // 3. Match preset by loose string
      const matchedKey = Object.keys(SPIN_TRANSITION_PRESETS).find(
        (key) => key.trim().toLowerCase() === identifier.trim().toLowerCase()
      );
      if (matchedKey) {
        return SPIN_TRANSITION_PRESETS[matchedKey];
      }
    }

    // Default fallback
    return SPIN_TRANSITION_PRESETS['Spin Left'];
  }

  /**
   * Evaluates spin transition state per frame from normalized progress [0.0, 1.0].
   * Deterministic calculation guarantees zero transform accumulation during seeking.
   */
  public evaluateTransition(
    identifier: string | number | SpinTransitionDefinition,
    rawProgress: number
  ): SpinTransitionState {
    const def = this.getDefinition(identifier) || SPIN_TRANSITION_PRESETS['Spin Left'];
    const p = clampProgress(rawProgress);
    const pEased = easedProgress(p, def.easing);

    let outgoingOpacity = 1 - pEased;
    let incomingOpacity = pEased;
    let outgoingFilter = '';
    let incomingFilter = '';
    let outgoingTransform = '';
    let incomingTransform = '';
    let outgoingTransformOrigin = def.transformOrigin || 'center center';
    let incomingTransformOrigin = def.transformOrigin || 'center center';

    if (def.blurAmount && def.blurAmount > 0) {
      const blurPx = (Math.sin(p * Math.PI) * def.blurAmount).toFixed(1);
      if (parseFloat(blurPx) > 0.1) {
        outgoingFilter = `blur(${blurPx}px)`;
        incomingFilter = `blur(${blurPx}px)`;
      }
    }

    switch (def.mode) {
      case '3d-flip': {
        const outState = compute3DFlipTransform(pEased, false, def.perspectivePx || 800);
        const inState = compute3DFlipTransform(pEased, true, def.perspectivePx || 800);
        outgoingTransform = outState.transform;
        outgoingOpacity = outState.opacity;
        incomingTransform = inState.transform;
        incomingOpacity = inState.opacity;
        break;
      }

      case 'page-flip': {
        const outState = computePageFlipTransform(pEased, false, def.perspectivePx || 1000);
        const inState = computePageFlipTransform(pEased, true, def.perspectivePx || 1000);
        outgoingTransform = outState.transform;
        outgoingOpacity = outState.opacity;
        outgoingTransformOrigin = outState.origin;
        incomingTransform = inState.transform;
        incomingOpacity = inState.opacity;
        incomingTransformOrigin = inState.origin;
        break;
      }

      case 'cylinder-rotate': {
        const outState = computeCylinderRotateTransform(pEased, false, def.perspectivePx || 1200);
        const inState = computeCylinderRotateTransform(pEased, true, def.perspectivePx || 1200);
        outgoingTransform = outState.transform;
        outgoingOpacity = outState.opacity;
        incomingTransform = inState.transform;
        incomingOpacity = inState.opacity;
        break;
      }

      case 'portal-spin': {
        const outState = computePortalSpinTransform(pEased, false, def.perspectivePx || 600);
        const inState = computePortalSpinTransform(pEased, true, def.perspectivePx || 600);
        outgoingTransform = outState.transform;
        outgoingOpacity = outState.opacity;
        incomingTransform = inState.transform;
        incomingOpacity = inState.opacity;
        break;
      }

      case 'spin-left':
      case 'spin-right':
      case '360-rotate':
      case 'barrel-roll':
      case 'twist-rotate':
      case 'helix-spin':
      default: {
        outgoingTransform = computeSpinTransform(def, pEased, false);
        incomingTransform = computeSpinTransform(def, pEased, true);
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
      outgoingTransformOrigin,
      incomingTransformOrigin,
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
    identifier: string | number | SpinTransitionDefinition
  ): HTMLCanvasElement {
    const def = this.getDefinition(identifier) || SPIN_TRANSITION_PRESETS['Spin Left'];
    const p = clampProgress(rawProgress);
    const width = outgoingCanvas.width;
    const height = outgoingCanvas.height;

    const outputCanvas = document.createElement('canvas');
    outputCanvas.width = width;
    outputCanvas.height = height;
    const ctx = outputCanvas.getContext('2d');
    if (!ctx) return outgoingCanvas;

    const evalResult = this.evaluateTransition(def, p);

    // Clear target canvas
    ctx.clearRect(0, 0, width, height);

    // Draw outgoing frame
    if (evalResult.outgoingOpacity > 0.001) {
      ctx.save();
      ctx.globalAlpha = evalResult.outgoingOpacity;
      if (evalResult.outgoingFilter) ctx.filter = evalResult.outgoingFilter;
      ctx.drawImage(outgoingCanvas, 0, 0);
      ctx.restore();
    }

    // Draw incoming frame
    if (evalResult.incomingOpacity > 0.001) {
      ctx.save();
      ctx.globalAlpha = evalResult.incomingOpacity;
      if (evalResult.incomingFilter) ctx.filter = evalResult.incomingFilter;
      ctx.drawImage(incomingCanvas, 0, 0);
      ctx.restore();
    }

    return outputCanvas;
  }
}

export const spinTransitionEngine = SpinTransitionEngine.getInstance();
