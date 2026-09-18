// src/components/editor-main-screen/tools/transitions/engines/blur/BlurTransitionEngine.ts
import { assetRegistry } from '../../../../../../services/AssetRegistry';
import {
  BLUR_TRANSITION_PRESETS,
  BlurTransitionDefinition,
} from './blurTransitionPresets';
import {
  clampProgress,
  computeBlurState,
  BlurTransitionState,
} from './blurTransitionUtils';

export class BlurTransitionEngine {
  private static instance: BlurTransitionEngine;

  private constructor() {}

  public static getInstance(): BlurTransitionEngine {
    if (!BlurTransitionEngine.instance) {
      BlurTransitionEngine.instance = new BlurTransitionEngine();
    }
    return BlurTransitionEngine.instance;
  }

  /**
   * Resolves a BlurTransitionDefinition from an asset ID, exact name, or direct object.
   */
  public getDefinition(identifier: string | number | BlurTransitionDefinition): BlurTransitionDefinition | undefined {
    if (typeof identifier === 'object' && identifier !== null && 'mode' in identifier) {
      return identifier as BlurTransitionDefinition;
    }

    if (typeof identifier === 'number') {
      const asset = assetRegistry.getAssetById('Transitions', identifier);
      if (asset && BLUR_TRANSITION_PRESETS[asset.name]) {
        return BLUR_TRANSITION_PRESETS[asset.name];
      }
    }

    if (typeof identifier === 'string') {
      // 1. Exact preset name match
      if (BLUR_TRANSITION_PRESETS[identifier]) {
        return BLUR_TRANSITION_PRESETS[identifier];
      }

      // 2. Case-insensitive / trimmed name match
      const assetByName = assetRegistry.getAssetByName(identifier);
      if (assetByName && BLUR_TRANSITION_PRESETS[assetByName.name]) {
        return BLUR_TRANSITION_PRESETS[assetByName.name];
      }

      // 3. Match preset by loose string
      const matchedKey = Object.keys(BLUR_TRANSITION_PRESETS).find(
        (key) => key.trim().toLowerCase() === identifier.trim().toLowerCase()
      );
      if (matchedKey) {
        return BLUR_TRANSITION_PRESETS[matchedKey];
      }
    }

    // Default fallback
    return BLUR_TRANSITION_PRESETS['Motion Blur'];
  }

  /**
   * Evaluates blur transition state per frame from normalized progress [0.0, 1.0].
   * Deterministic calculation guarantees zero cumulative blur during playback or seeking.
   */
  public evaluateTransition(
    identifier: string | number | BlurTransitionDefinition,
    rawProgress: number,
    intensity: number = 1.0
  ): BlurTransitionState {
    const def = this.getDefinition(identifier) || BLUR_TRANSITION_PRESETS['Motion Blur'];
    const p = clampProgress(rawProgress);
    return computeBlurState(def, p, intensity);
  }

  /**
   * Performs frame composite rendering for Canvas / WebGL export parity.
   */
  public renderFrameComposite(
    outgoingCanvas: HTMLCanvasElement,
    incomingCanvas: HTMLCanvasElement,
    rawProgress: number,
    identifier: string | number | BlurTransitionDefinition,
    intensity: number = 1.0
  ): HTMLCanvasElement {
    const def = this.getDefinition(identifier) || BLUR_TRANSITION_PRESETS['Motion Blur'];
    const p = clampProgress(rawProgress);
    const width = outgoingCanvas.width;
    const height = outgoingCanvas.height;

    const outputCanvas = document.createElement('canvas');
    outputCanvas.width = width;
    outputCanvas.height = height;
    const ctx = outputCanvas.getContext('2d');
    if (!ctx) return outgoingCanvas;

    const evalResult = this.evaluateTransition(def, p, intensity);

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

    // Draw optional flash / bloom overlay
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

export const blurTransitionEngine = BlurTransitionEngine.getInstance();
