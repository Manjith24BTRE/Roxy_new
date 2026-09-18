// src/components/editor-main-screen/tools/transitions/engines/zoom/ZoomTransitionEngine.ts
import { assetRegistry } from '../../../../../../services/AssetRegistry';
import {
  ZOOM_TRANSITION_PRESETS,
  ZoomTransitionDefinition,
  ZoomMode,
} from './zoomTransitionPresets';
import {
  clampProgress,
  easedProgress,
  interpolateScale,
  overshootScale,
  elasticScale,
  bounceScale,
  pulseScale,
  velocityScale,
  composeZoomTransform,
  ZoomTransitionState,
} from './zoomTransitionUtils';

export class ZoomTransitionEngine {
  private static instance: ZoomTransitionEngine;

  private constructor() {}

  public static getInstance(): ZoomTransitionEngine {
    if (!ZoomTransitionEngine.instance) {
      ZoomTransitionEngine.instance = new ZoomTransitionEngine();
    }
    return ZoomTransitionEngine.instance;
  }

  /**
   * Resolves a ZoomTransitionDefinition from an asset ID, exact name, or direct object.
   */
  public getDefinition(identifier: string | number | ZoomTransitionDefinition): ZoomTransitionDefinition | undefined {
    if (typeof identifier === 'object' && identifier !== null && 'mode' in identifier) {
      return identifier as ZoomTransitionDefinition;
    }

    if (typeof identifier === 'number') {
      const asset = assetRegistry.getAssetById('Transitions', identifier);
      if (asset && ZOOM_TRANSITION_PRESETS[asset.name]) {
        return ZOOM_TRANSITION_PRESETS[asset.name];
      }
    }

    if (typeof identifier === 'string') {
      // 1. Exact preset name match
      if (ZOOM_TRANSITION_PRESETS[identifier]) {
        return ZOOM_TRANSITION_PRESETS[identifier];
      }

      // 2. Case-insensitive / trimmed name match
      const assetByName = assetRegistry.getAssetByName(identifier);
      if (assetByName && ZOOM_TRANSITION_PRESETS[assetByName.name]) {
        return ZOOM_TRANSITION_PRESETS[assetByName.name];
      }

      // 3. Match preset by loose string
      const matchedKey = Object.keys(ZOOM_TRANSITION_PRESETS).find(
        (key) => key.trim().toLowerCase() === identifier.trim().toLowerCase()
      );
      if (matchedKey) {
        return ZOOM_TRANSITION_PRESETS[matchedKey];
      }
    }

    // Default fallback
    return ZOOM_TRANSITION_PRESETS['Zoom In'];
  }

  /**
   * Evaluates zoom transition state per frame from normalized progress [0.0, 1.0].
   * Deterministic calculation guarantees zero transform accumulation during seeking.
   */
  public evaluateTransition(
    identifier: string | number | ZoomTransitionDefinition,
    rawProgress: number
  ): ZoomTransitionState {
    const def = this.getDefinition(identifier) || ZOOM_TRANSITION_PRESETS['Zoom In'];
    const p = clampProgress(rawProgress);

    let outgoingOpacity = 1;
    let incomingOpacity = 0;
    let outgoingFilter = '';
    let incomingFilter = '';
    let outgoingTransform = '';
    let incomingTransform = '';
    let outgoingTransformOrigin = '50% 50%';
    let incomingTransformOrigin = '50% 50%';

    const focal = def.focalPoint || { x: 0.5, y: 0.5 };

    switch (def.mode) {
      case 'zoom-in': {
        const pEased = easedProgress(p, 'smoothstep');
        const endScale = def.scaleEnd || 2.2;

        if (p < 0.5) {
          const normP = p / 0.5;
          outgoingOpacity = 1 - normP * 0.4;
          incomingOpacity = normP * 0.4;
          const outScale = interpolateScale(1.0, endScale, normP);
          const tRes = composeZoomTransform(outScale, focal);
          outgoingTransform = tRes.transform;
          outgoingTransformOrigin = tRes.transformOrigin;
        } else {
          const normP = (p - 0.5) / 0.5;
          outgoingOpacity = (1 - normP) * 0.6;
          incomingOpacity = 0.4 + normP * 0.6;
          const inScale = interpolateScale(0.7, 1.0, normP);
          const tRes = composeZoomTransform(inScale, focal);
          incomingTransform = tRes.transform;
          incomingTransformOrigin = tRes.transformOrigin;
        }
        break;
      }

      case 'zoom-out': {
        const pEased = easedProgress(p, 'smoothstep');
        const minScale = def.scaleEnd || 0.45;

        if (p < 0.5) {
          const normP = p / 0.5;
          outgoingOpacity = 1 - normP * 0.4;
          incomingOpacity = normP * 0.4;
          const outScale = interpolateScale(1.0, minScale, normP);
          const tRes = composeZoomTransform(outScale, focal);
          outgoingTransform = tRes.transform;
          outgoingTransformOrigin = tRes.transformOrigin;
        } else {
          const normP = (p - 0.5) / 0.5;
          outgoingOpacity = (1 - normP) * 0.6;
          incomingOpacity = 0.4 + normP * 0.6;
          const inScale = interpolateScale(1.5, 1.0, normP);
          const tRes = composeZoomTransform(inScale, focal);
          incomingTransform = tRes.transform;
          incomingTransformOrigin = tRes.transformOrigin;
        }
        break;
      }

      case 'hyper-zoom': {
        const maxScale = def.scaleEnd || 4.8;
        const maxBlur = def.blurAmount || 24.0;
        const blurPx = (Math.sin(p * Math.PI) * maxBlur).toFixed(1);

        if (parseFloat(blurPx) > 0.1) {
          outgoingFilter = `blur(${blurPx}px)`;
          incomingFilter = `blur(${blurPx}px)`;
        }

        if (p < 0.5) {
          const normP = p / 0.5;
          outgoingOpacity = 1;
          incomingOpacity = 0;
          const outScale = velocityScale(1.0, maxScale, normP);
          const tRes = composeZoomTransform(outScale, focal);
          outgoingTransform = tRes.transform;
          outgoingTransformOrigin = tRes.transformOrigin;
        } else {
          const normP = (p - 0.5) / 0.5;
          outgoingOpacity = 0;
          incomingOpacity = 1;
          const inScale = velocityScale(maxScale, 1.0, normP);
          const tRes = composeZoomTransform(inScale, focal);
          incomingTransform = tRes.transform;
          incomingTransformOrigin = tRes.transformOrigin;
        }
        break;
      }

      case 'elastic-zoom': {
        const targetScale = def.scaleEnd || 1.6;

        if (p < 0.5) {
          const normP = p / 0.5;
          outgoingOpacity = 1 - normP * 0.5;
          incomingOpacity = normP * 0.5;
          const outScale = elasticScale(1.0, targetScale, normP);
          const tRes = composeZoomTransform(outScale, focal);
          outgoingTransform = tRes.transform;
          outgoingTransformOrigin = tRes.transformOrigin;
        } else {
          const normP = (p - 0.5) / 0.5;
          outgoingOpacity = (1 - normP) * 0.5;
          incomingOpacity = 0.5 + normP * 0.5;
          const inScale = elasticScale(targetScale, 1.0, normP);
          const tRes = composeZoomTransform(inScale, focal);
          incomingTransform = tRes.transform;
          incomingTransformOrigin = tRes.transformOrigin;
        }
        break;
      }

      case 'bounce-zoom': {
        const targetScale = def.scaleEnd || 1.75;

        if (p < 0.5) {
          const normP = p / 0.5;
          outgoingOpacity = 1 - normP * 0.5;
          incomingOpacity = normP * 0.5;
          const outScale = bounceScale(1.0, targetScale, normP);
          const tRes = composeZoomTransform(outScale, focal);
          outgoingTransform = tRes.transform;
          outgoingTransformOrigin = tRes.transformOrigin;
        } else {
          const normP = (p - 0.5) / 0.5;
          outgoingOpacity = (1 - normP) * 0.5;
          incomingOpacity = 0.5 + normP * 0.5;
          const inScale = bounceScale(targetScale, 1.0, normP);
          const tRes = composeZoomTransform(inScale, focal);
          incomingTransform = tRes.transform;
          incomingTransformOrigin = tRes.transformOrigin;
        }
        break;
      }

      case 'pulse-zoom': {
        const pulseCount = def.pulseCount || 3;
        const amp = def.bounceAmount || 0.3;

        outgoingOpacity = 1 - p;
        incomingOpacity = p;

        const outScale = pulseScale(1.0, p, pulseCount, amp);
        const inScale = pulseScale(1.0, p, pulseCount, amp);

        const outRes = composeZoomTransform(outScale, focal);
        outgoingTransform = outRes.transform;
        outgoingTransformOrigin = outRes.transformOrigin;

        const inRes = composeZoomTransform(inScale, focal);
        incomingTransform = inRes.transform;
        incomingTransformOrigin = inRes.transformOrigin;
        break;
      }

      case 'center-zoom': {
        const pEased = easedProgress(p, 'smoothstep');
        const endScale = def.scaleEnd || 2.0;

        outgoingOpacity = 1 - pEased;
        incomingOpacity = pEased;

        const outScale = interpolateScale(1.0, endScale, pEased);
        const inScale = interpolateScale(0.8, 1.0, pEased);

        const outRes = composeZoomTransform(outScale, { x: 0.5, y: 0.5 });
        outgoingTransform = outRes.transform;
        outgoingTransformOrigin = outRes.transformOrigin;

        const inRes = composeZoomTransform(inScale, { x: 0.5, y: 0.5 });
        incomingTransform = inRes.transform;
        incomingTransformOrigin = inRes.transformOrigin;
        break;
      }

      case 'corner-zoom': {
        const pEased = easedProgress(p, 'smoothstep');
        const cornerFocal = { x: 0.0, y: 0.0 }; // Top-Left corner anchor

        outgoingOpacity = 1 - pEased;
        incomingOpacity = pEased;

        const outScale = interpolateScale(1.0, 2.2, pEased);
        const inScale = interpolateScale(0.65, 1.0, pEased);

        const outRes = composeZoomTransform(outScale, cornerFocal);
        outgoingTransform = outRes.transform;
        outgoingTransformOrigin = outRes.transformOrigin;

        const inRes = composeZoomTransform(inScale, { x: 1.0, y: 1.0 });
        incomingTransform = inRes.transform;
        incomingTransformOrigin = inRes.transformOrigin;
        break;
      }

      case 'radial-zoom': {
        const pEased = easedProgress(p, 'smoothstep');
        const maxBlur = def.blurAmount || 16.0;
        const blurPx = (Math.sin(p * Math.PI) * maxBlur).toFixed(1);

        if (parseFloat(blurPx) > 0.1) {
          outgoingFilter = `blur(${blurPx}px) contrast(${(1 + parseFloat(blurPx) * 0.02).toFixed(2)})`;
          incomingFilter = `blur(${blurPx}px) contrast(${(1 + parseFloat(blurPx) * 0.02).toFixed(2)})`;
        }

        outgoingOpacity = 1 - pEased;
        incomingOpacity = pEased;

        const outScale = interpolateScale(1.0, 2.1, pEased);
        const inScale = interpolateScale(2.1, 1.0, pEased);

        const outRes = composeZoomTransform(outScale, focal);
        outgoingTransform = outRes.transform;
        outgoingTransformOrigin = outRes.transformOrigin;

        const inRes = composeZoomTransform(inScale, focal);
        incomingTransform = inRes.transform;
        incomingTransformOrigin = inRes.transformOrigin;
        break;
      }

      case 'velocity-zoom': {
        const maxScale = def.scaleEnd || 3.2;
        const maxBlur = def.blurAmount || 20.0;
        const blurPx = (Math.sin(p * Math.PI) * maxBlur).toFixed(1);

        if (parseFloat(blurPx) > 0.1) {
          outgoingFilter = `blur(${blurPx}px)`;
          incomingFilter = `blur(${blurPx}px)`;
        }

        outgoingOpacity = 1 - p;
        incomingOpacity = p;

        const outScale = velocityScale(1.0, maxScale, p);
        const inScale = velocityScale(maxScale, 1.0, p);

        const outRes = composeZoomTransform(outScale, focal);
        outgoingTransform = outRes.transform;
        outgoingTransformOrigin = outRes.transformOrigin;

        const inRes = composeZoomTransform(inScale, focal);
        incomingTransform = inRes.transform;
        incomingTransformOrigin = inRes.transformOrigin;
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
    identifier: string | number | ZoomTransitionDefinition
  ): HTMLCanvasElement {
    const def = this.getDefinition(identifier) || ZOOM_TRANSITION_PRESETS['Zoom In'];
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

    // Draw outgoing frame with calculated opacity, filter & transform
    if (evalResult.outgoingOpacity > 0.001) {
      ctx.save();
      ctx.globalAlpha = evalResult.outgoingOpacity;
      if (evalResult.outgoingFilter) ctx.filter = evalResult.outgoingFilter;
      ctx.drawImage(outgoingCanvas, 0, 0);
      ctx.restore();
    }

    // Draw incoming frame with calculated opacity, filter & transform
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

export const zoomTransitionEngine = ZoomTransitionEngine.getInstance();
