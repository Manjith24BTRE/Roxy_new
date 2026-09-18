// src/components/editor-main-screen/tools/transitions/engines/camera/CameraTransitionEngine.ts
import { assetRegistry } from '../../../../../../services/AssetRegistry';
import {
  CAMERA_TRANSITION_PRESETS,
  CameraTransitionDefinition,
  CameraMode,
} from './cameraTransitionPresets';
import {
  clampProgress,
  easedProgress,
  deterministicHandheld,
  deterministicShake,
  composeTransform,
  CameraTransitionState,
} from './cameraTransitionUtils';

export class CameraTransitionEngine {
  private static instance: CameraTransitionEngine;

  private constructor() {}

  public static getInstance(): CameraTransitionEngine {
    if (!CameraTransitionEngine.instance) {
      CameraTransitionEngine.instance = new CameraTransitionEngine();
    }
    return CameraTransitionEngine.instance;
  }

  /**
   * Resolves a CameraTransitionDefinition from an asset ID, exact name, or direct object.
   */
  public getDefinition(identifier: string | number | CameraTransitionDefinition): CameraTransitionDefinition | undefined {
    if (typeof identifier === 'object' && identifier !== null && 'mode' in identifier) {
      return identifier as CameraTransitionDefinition;
    }

    if (typeof identifier === 'number') {
      const asset = assetRegistry.getAssetById('Transitions', identifier);
      if (asset && CAMERA_TRANSITION_PRESETS[asset.name]) {
        return CAMERA_TRANSITION_PRESETS[asset.name];
      }
    }

    if (typeof identifier === 'string') {
      // 1. Exact preset name match
      if (CAMERA_TRANSITION_PRESETS[identifier]) {
        return CAMERA_TRANSITION_PRESETS[identifier];
      }

      // 2. Case-insensitive / trimmed name match
      const assetByName = assetRegistry.getAssetByName(identifier);
      if (assetByName && CAMERA_TRANSITION_PRESETS[assetByName.name]) {
        return CAMERA_TRANSITION_PRESETS[assetByName.name];
      }

      // 3. Match preset by loose string
      const matchedKey = Object.keys(CAMERA_TRANSITION_PRESETS).find(
        (key) => key.trim().toLowerCase() === identifier.trim().toLowerCase()
      );
      if (matchedKey) {
        return CAMERA_TRANSITION_PRESETS[matchedKey];
      }
    }

    // Default fallback
    return CAMERA_TRANSITION_PRESETS['Handheld Transition'];
  }

  /**
   * Evaluates camera transition state per frame from normalized progress [0.0, 1.0].
   * Deterministic calculation guarantees zero transform accumulation during seeking.
   */
  public evaluateTransition(
    identifier: string | number | CameraTransitionDefinition,
    rawProgress: number
  ): CameraTransitionState {
    const def = this.getDefinition(identifier) || CAMERA_TRANSITION_PRESETS['Handheld Transition'];
    const p = clampProgress(rawProgress);

    let outgoingOpacity = 1;
    let incomingOpacity = 0;
    let outgoingFilter = '';
    let incomingFilter = '';
    let outgoingTransform = '';
    let incomingTransform = '';

    switch (def.mode) {
      case 'handheld': {
        const h = deterministicHandheld(p, def.amplitude || 15.0, def.frequency || 8.0);
        outgoingOpacity = 1 - p;
        incomingOpacity = p;
        outgoingTransform = composeTransform(h.dx, h.dy, 1.0 + Math.abs(h.drot) * 0.01, h.drot);
        incomingTransform = composeTransform(h.dx * 0.8, h.dy * 0.8, 1.0 + Math.abs(h.drot) * 0.008, h.drot * 0.8);
        break;
      }

      case 'shake': {
        const shake = deterministicShake(p, def.amplitude || 28.0, def.frequency || 24.0);
        const mid = 0.5;

        if (p < mid) {
          outgoingOpacity = 1;
          incomingOpacity = 0;
        } else {
          outgoingOpacity = 0;
          incomingOpacity = 1;
        }

        const blurPx = (shake.intensityPeak * (def.parameters?.motionBlur || 8.0)).toFixed(1);
        if (parseFloat(blurPx) > 0.05) {
          outgoingFilter = `blur(${blurPx}px)`;
          incomingFilter = `blur(${blurPx}px)`;
        }

        outgoingTransform = composeTransform(shake.dx, shake.dy, 1.0 + shake.intensityPeak * 0.08, shake.drot);
        incomingTransform = composeTransform(shake.dx * 0.9, shake.dy * 0.9, 1.0 + shake.intensityPeak * 0.06, shake.drot * 0.9);
        break;
      }

      case 'crash-zoom': {
        const maxScale = def.scaleEnd || 3.8;
        const maxBlur = def.blurAmount || 18.0;

        if (p < 0.5) {
          const normP = p / 0.5; // 0 -> 1
          outgoingOpacity = 1;
          incomingOpacity = 0;
          const outScale = 1.0 + (maxScale - 1.0) * normP;
          const outBlur = (maxBlur * normP).toFixed(1);
          outgoingTransform = composeTransform(0, 0, outScale, 0);
          if (parseFloat(outBlur) > 0.1) outgoingFilter = `blur(${outBlur}px)`;
        } else {
          const normP = (p - 0.5) / 0.5; // 0 -> 1
          outgoingOpacity = 0;
          incomingOpacity = 1;
          const inScale = maxScale - (maxScale - 1.0) * normP;
          const inBlur = (maxBlur * (1 - normP)).toFixed(1);
          incomingTransform = composeTransform(0, 0, inScale, 0);
          if (parseFloat(inBlur) > 0.1) incomingFilter = `blur(${inBlur}px)`;
        }
        break;
      }

      case 'snap-zoom': {
        const bounceFactor = easedProgress(p, 'bounce');
        const peakScale = def.scaleEnd || 1.85;

        if (p < 0.5) {
          outgoingOpacity = 1;
          incomingOpacity = 0;
          const outScale = 1.0 + (peakScale - 1.0) * (p / 0.5) * Math.max(1, bounceFactor);
          outgoingTransform = composeTransform(0, 0, outScale, 0);
        } else {
          outgoingOpacity = 0;
          incomingOpacity = 1;
          const normP = (p - 0.5) / 0.5;
          const inScale = peakScale - (peakScale - 1.0) * normP;
          incomingTransform = composeTransform(0, 0, inScale, 0);
        }
        break;
      }

      case 'dolly-zoom': {
        const targetScale = def.scaleEnd || 1.6;
        const pEased = easedProgress(p, 'smoothstep');

        outgoingOpacity = 1 - pEased;
        incomingOpacity = pEased;

        const outScale = 1.0 + (targetScale - 1.0) * pEased;
        const inScale = targetScale - (targetScale - 1.0) * pEased;

        outgoingTransform = composeTransform(0, 0, outScale, 0, 0, 800);
        incomingTransform = composeTransform(0, 0, inScale, 0, 0, 800);
        break;
      }

      case 'pull-in': {
        const pEased = easedProgress(p, 'smoothstep');
        const endScale = def.scaleEnd || 1.55;

        outgoingOpacity = 1 - pEased;
        incomingOpacity = pEased;

        const outScale = 1.0 + (endScale - 1.0) * pEased;
        const inScale = 0.7 + (1.0 - 0.7) * pEased;

        outgoingTransform = composeTransform(0, 0, outScale, 0);
        incomingTransform = composeTransform(0, 0, inScale, 0);
        break;
      }

      case 'pull-out': {
        const pEased = easedProgress(p, 'smoothstep');
        const minScale = def.scaleEnd || 0.65;

        outgoingOpacity = 1 - pEased;
        incomingOpacity = pEased;

        const outScale = 1.0 - (1.0 - minScale) * pEased;
        const inScale = 1.4 - (1.4 - 1.0) * pEased;

        outgoingTransform = composeTransform(0, 0, outScale, 0);
        incomingTransform = composeTransform(0, 0, inScale, 0);
        break;
      }

      case 'orbit': {
        const pSine = easedProgress(p, 'sine');
        const orbitDeg = def.rotationAmount || 25.0;

        outgoingOpacity = 1 - pSine;
        incomingOpacity = pSine;

        const outY = orbitDeg * pSine;
        const outTx = -160 * pSine;
        outgoingTransform = composeTransform(outTx, 0, 1.0 - pSine * 0.15, 0, outY, 1000);

        const inY = -orbitDeg * (1 - pSine);
        const inTx = 160 * (1 - pSine);
        incomingTransform = composeTransform(inTx, 0, 0.85 + pSine * 0.15, 0, inY, 1000);
        break;
      }

      case 'whip-pan-left': {
        const pEased = easedProgress(p, 'smoothstep');
        const blurPx = (Math.sin(p * Math.PI) * (def.blurAmount || 22.0)).toFixed(1);

        if (parseFloat(blurPx) > 0.1) {
          outgoingFilter = `blur(${blurPx}px)`;
          incomingFilter = `blur(${blurPx}px)`;
        }

        if (p < 0.5) {
          const normP = p / 0.5;
          outgoingOpacity = 1;
          incomingOpacity = 0;
          const tx = -100 * normP;
          outgoingTransform = `translate(${tx.toFixed(1)}%, 0)`;
        } else {
          const normP = (p - 0.5) / 0.5;
          outgoingOpacity = 0;
          incomingOpacity = 1;
          const tx = 100 * (1 - normP);
          incomingTransform = `translate(${tx.toFixed(1)}%, 0)`;
        }
        break;
      }

      case 'whip-pan-right': {
        const pEased = easedProgress(p, 'smoothstep');
        const blurPx = (Math.sin(p * Math.PI) * (def.blurAmount || 22.0)).toFixed(1);

        if (parseFloat(blurPx) > 0.1) {
          outgoingFilter = `blur(${blurPx}px)`;
          incomingFilter = `blur(${blurPx}px)`;
        }

        if (p < 0.5) {
          const normP = p / 0.5;
          outgoingOpacity = 1;
          incomingOpacity = 0;
          const tx = 100 * normP;
          outgoingTransform = `translate(${tx.toFixed(1)}%, 0)`;
        } else {
          const normP = (p - 0.5) / 0.5;
          outgoingOpacity = 0;
          incomingOpacity = 1;
          const tx = -100 * (1 - normP);
          incomingTransform = `translate(${tx.toFixed(1)}%, 0)`;
        }
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
    identifier: string | number | CameraTransitionDefinition
  ): HTMLCanvasElement {
    const def = this.getDefinition(identifier) || CAMERA_TRANSITION_PRESETS['Handheld Transition'];
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

export const cameraTransitionEngine = CameraTransitionEngine.getInstance();
