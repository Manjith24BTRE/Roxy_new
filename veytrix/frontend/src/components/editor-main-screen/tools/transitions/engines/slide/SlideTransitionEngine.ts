// src/components/editor-main-screen/tools/transitions/engines/slide/SlideTransitionEngine.ts
import { assetRegistry } from '../../../../../../services/AssetRegistry';
import {
  SLIDE_TRANSITION_PRESETS,
  SlideTransitionDefinition,
  SlideMode,
} from './slideTransitionPresets';
import {
  clampProgress,
  easedProgress,
  computeSlideTransform,
  computePushTransform,
  computePerspectivePushTransform,
  SlideTransitionState,
} from './slideTransitionUtils';

export class SlideTransitionEngine {
  private static instance: SlideTransitionEngine;

  private constructor() {}

  public static getInstance(): SlideTransitionEngine {
    if (!SlideTransitionEngine.instance) {
      SlideTransitionEngine.instance = new SlideTransitionEngine();
    }
    return SlideTransitionEngine.instance;
  }

  /**
   * Resolves a SlideTransitionDefinition from an asset ID, exact name, or direct object.
   */
  public getDefinition(identifier: string | number | SlideTransitionDefinition): SlideTransitionDefinition | undefined {
    if (typeof identifier === 'object' && identifier !== null && 'mode' in identifier) {
      return identifier as SlideTransitionDefinition;
    }

    if (typeof identifier === 'number') {
      const asset = assetRegistry.getAssetById('Transitions', identifier);
      if (asset && SLIDE_TRANSITION_PRESETS[asset.name]) {
        return SLIDE_TRANSITION_PRESETS[asset.name];
      }
    }

    if (typeof identifier === 'string') {
      // 1. Exact preset name match
      if (SLIDE_TRANSITION_PRESETS[identifier]) {
        return SLIDE_TRANSITION_PRESETS[identifier];
      }

      // 2. Case-insensitive / trimmed name match
      const assetByName = assetRegistry.getAssetByName(identifier);
      if (assetByName && SLIDE_TRANSITION_PRESETS[assetByName.name]) {
        return SLIDE_TRANSITION_PRESETS[assetByName.name];
      }

      // 3. Match preset by loose string
      const matchedKey = Object.keys(SLIDE_TRANSITION_PRESETS).find(
        (key) => key.trim().toLowerCase() === identifier.trim().toLowerCase()
      );
      if (matchedKey) {
        return SLIDE_TRANSITION_PRESETS[matchedKey];
      }
    }

    // Default fallback
    return SLIDE_TRANSITION_PRESETS['Slide Left'];
  }

  /**
   * Evaluates slide transition state per frame from normalized progress [0.0, 1.0].
   * Deterministic calculation guarantees zero transform accumulation during seeking.
   */
  public evaluateTransition(
    identifier: string | number | SlideTransitionDefinition,
    rawProgress: number
  ): SlideTransitionState {
    const def = this.getDefinition(identifier) || SLIDE_TRANSITION_PRESETS['Slide Left'];
    const p = clampProgress(rawProgress);
    const pEased = easedProgress(p, def.easing);

    let outgoingOpacity = 1;
    let incomingOpacity = 1; // Slide/Push keep both clips fully opaque while sliding
    let outgoingFilter = '';
    let incomingFilter = '';
    let outgoingTransform = '';
    let incomingTransform = '';

    const dir = def.directionVector || { x: -1.0, y: 0.0 };
    const distPct = def.distancePercent || 100.0;

    if (def.blurAmount && def.blurAmount > 0) {
      const blurPx = (Math.sin(p * Math.PI) * def.blurAmount).toFixed(1);
      if (parseFloat(blurPx) > 0.1) {
        outgoingFilter = `blur(${blurPx}px)`;
        incomingFilter = `blur(${blurPx}px)`;
      }
    }

    switch (def.mode) {
      case 'slide-left':
      case 'slide-right':
      case 'slide-up':
      case 'slide-down': {
        outgoingTransform = computeSlideTransform(dir.x, dir.y, pEased, false, distPct);
        incomingTransform = computeSlideTransform(dir.x, dir.y, pEased, true, distPct);
        break;
      }

      case 'push-left':
      case 'push-right':
      case 'push-up':
      case 'push-down': {
        // Push maintains 100% opacity on both clips for contiguous block movement
        outgoingOpacity = 1;
        incomingOpacity = 1;
        outgoingTransform = computePushTransform(dir.x, dir.y, pEased, false, distPct);
        incomingTransform = computePushTransform(dir.x, dir.y, pEased, true, distPct);
        break;
      }

      case 'diagonal-slide': {
        outgoingTransform = computeSlideTransform(dir.x, dir.y, pEased, false, distPct);
        incomingTransform = computeSlideTransform(dir.x, dir.y, pEased, true, distPct);
        break;
      }

      case 'perspective-push': {
        outgoingOpacity = 1;
        incomingOpacity = 1;
        outgoingTransform = computePerspectivePushTransform(pEased, false, def.perspectivePx || 800);
        incomingTransform = computePerspectivePushTransform(pEased, true, def.perspectivePx || 800);
        break;
      }

      default: {
        outgoingTransform = computeSlideTransform(dir.x, dir.y, pEased, false, distPct);
        incomingTransform = computeSlideTransform(dir.x, dir.y, pEased, true, distPct);
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
    identifier: string | number | SlideTransitionDefinition
  ): HTMLCanvasElement {
    const def = this.getDefinition(identifier) || SLIDE_TRANSITION_PRESETS['Slide Left'];
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

export const slideTransitionEngine = SlideTransitionEngine.getInstance();
