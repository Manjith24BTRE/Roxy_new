// src/components/editor-main-screen/tools/filters/engines/portraitRetouch/PortraitRetouchEngine.ts
import { PORTRAIT_RETOUCH_PRESETS, getPortraitRetouchPreset, PortraitRetouchParams, PortraitRetouchPreset } from './portraitRetouchPresets';
import { PORTRAIT_VERTEX_SHADER_SOURCE, PORTRAIT_FRAGMENT_SHADER_SOURCE } from './portraitRetouchShader';

export class PortraitRetouchEngine {
  private static instance: PortraitRetouchEngine;

  private canvas: HTMLCanvasElement | null = null;
  private gl: WebGLRenderingContext | null = null;
  private program: WebGLProgram | null = null;
  private texture: WebGLTexture | null = null;
  private positionBuffer: WebGLBuffer | null = null;
  private texCoordBuffer: WebGLBuffer | null = null;
  private uniformLocations: Record<string, WebGLUniformLocation | null> = {};
  private isInitialized = false;

  private constructor() {
    this.initGL();
  }

  public static getInstance(): PortraitRetouchEngine {
    if (!PortraitRetouchEngine.instance) {
      PortraitRetouchEngine.instance = new PortraitRetouchEngine();
    }
    return PortraitRetouchEngine.instance;
  }

  /**
   * Initializes WebGL context once for frame-compatible processing.
   */
  private initGL(): boolean {
    if (this.isInitialized) return true;
    if (typeof document === 'undefined') return false;

    try {
      this.canvas = document.createElement('canvas');
      this.gl = this.canvas.getContext('webgl', { preserveDrawingBuffer: true, alpha: true });
      if (!this.gl) {
        console.warn('[PortraitRetouchEngine] WebGL context unavailable. Using Canvas2D fallback.');
        return false;
      }

      const gl = this.gl;
      const vertShader = this.compileShader(gl, gl.VERTEX_SHADER, PORTRAIT_VERTEX_SHADER_SOURCE);
      const fragShader = this.compileShader(gl, gl.FRAGMENT_SHADER, PORTRAIT_FRAGMENT_SHADER_SOURCE);

      if (!vertShader || !fragShader) return false;

      const program = gl.createProgram();
      if (!program) return false;

      gl.attachShader(program, vertShader);
      gl.attachShader(program, fragShader);
      gl.linkProgram(program);

      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error('[PortraitRetouchEngine] Program link error:', gl.getProgramInfoLog(program));
        return false;
      }

      this.program = program;
      gl.useProgram(program);

      // Geometry Buffers
      this.positionBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([
          -1.0, -1.0,
           1.0, -1.0,
          -1.0,  1.0,
          -1.0,  1.0,
           1.0, -1.0,
           1.0,  1.0,
        ]),
        gl.STATIC_DRAW
      );

      this.texCoordBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordBuffer);
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([
          0.0, 0.0,
          1.0, 0.0,
          0.0, 1.0,
          0.0, 1.0,
          1.0, 0.0,
          1.0, 1.0,
        ]),
        gl.STATIC_DRAW
      );

      // Texture
      this.texture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, this.texture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

      // Uniform Locations
      const uniforms = [
        'u_image', 'u_intensity', 'u_smooth', 'u_skinToneWarmth', 'u_skinToneRosy',
        'u_skinBrightness', 'u_eyeClarity', 'u_softFocus', 'u_contrast',
        'u_highlights', 'u_shadows', 'u_vibrance', 'u_saturation', 'u_glow', 'u_vignette'
      ];
      uniforms.forEach((name) => {
        this.uniformLocations[name] = gl.getUniformLocation(program, name);
      });

      this.isInitialized = true;
      return true;
    } catch (e) {
      console.error('[PortraitRetouchEngine] Initialization error:', e);
      return false;
    }
  }

  private compileShader(gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null {
    const shader = gl.createShader(type);
    if (!shader) return null;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error('[PortraitRetouchEngine] Shader compile error:', gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  }

  /**
   * Main single-pass GPU rendering pipeline for PortraitRetouchEngine.
   */
  public renderFrame(
    source: CanvasImageSource,
    presetIdentifier: string | number | PortraitRetouchPreset,
    intensity: number = 1.0,
    targetCanvas?: HTMLCanvasElement
  ): HTMLCanvasElement {
    const preset = typeof presetIdentifier === 'object'
      ? presetIdentifier
      : getPortraitRetouchPreset(presetIdentifier) || PORTRAIT_RETOUCH_PRESETS.natural_skin;

    const srcWidth = (source as any).videoWidth || (source as any).width || 800;
    const srcHeight = (source as any).videoHeight || (source as any).height || 450;

    if (this.initGL() && this.gl && this.program && this.canvas) {
      const gl = this.gl;
      const canvas = targetCanvas || this.canvas;

      if (canvas.width !== srcWidth || canvas.height !== srcHeight) {
        canvas.width = srcWidth;
        canvas.height = srcHeight;
      }

      if (canvas === this.canvas) {
        gl.viewport(0, 0, srcWidth, srcHeight);
      }

      gl.useProgram(this.program);

      // Attributes
      const posLoc = gl.getAttribLocation(this.program, 'a_position');
      gl.enableVertexAttribArray(posLoc);
      gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
      gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

      const texLoc = gl.getAttribLocation(this.program, 'a_texCoord');
      gl.enableVertexAttribArray(texLoc);
      gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordBuffer);
      gl.vertexAttribPointer(texLoc, 2, gl.FLOAT, false, 0, 0);

      // Texture
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, this.texture);
      try {
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source as any);
      } catch (e) {
        return this.renderCanvas2DFallback(source, preset.params, intensity, targetCanvas);
      }

      gl.uniform1i(this.uniformLocations['u_image'], 0);
      gl.uniform1f(this.uniformLocations['u_intensity'], Math.max(0, Math.min(1, intensity)));

      const p = preset.params;
      gl.uniform1f(this.uniformLocations['u_smooth'], p.smooth || 0);
      gl.uniform1f(this.uniformLocations['u_skinToneWarmth'], p.skinToneWarmth || 0);
      gl.uniform1f(this.uniformLocations['u_skinToneRosy'], p.skinToneRosy || 0);
      gl.uniform1f(this.uniformLocations['u_skinBrightness'], p.skinBrightness || 0);
      gl.uniform1f(this.uniformLocations['u_eyeClarity'], p.eyeClarity || 0);
      gl.uniform1f(this.uniformLocations['u_softFocus'], p.softFocus || 0);
      gl.uniform1f(this.uniformLocations['u_contrast'], p.contrast || 0);
      gl.uniform1f(this.uniformLocations['u_highlights'], p.highlights || 0);
      gl.uniform1f(this.uniformLocations['u_shadows'], p.shadows || 0);
      gl.uniform1f(this.uniformLocations['u_vibrance'], p.vibrance || 0);
      gl.uniform1f(this.uniformLocations['u_saturation'], p.saturation || 0);
      gl.uniform1f(this.uniformLocations['u_glow'], p.glow || 0);
      gl.uniform1f(this.uniformLocations['u_vignette'], p.vignette || 0);

      gl.drawArrays(gl.TRIANGLES, 0, 6);

      if (targetCanvas && targetCanvas !== this.canvas) {
        const targetCtx = targetCanvas.getContext('2d');
        if (targetCtx) {
          targetCtx.drawImage(this.canvas, 0, 0);
        }
      }

      return targetCanvas || this.canvas;
    }

    return this.renderCanvas2DFallback(source, preset.params, intensity, targetCanvas);
  }

  /**
   * Canvas2D fallback for tests or non-WebGL environments.
   */
  private renderCanvas2DFallback(
    source: CanvasImageSource,
    params: PortraitRetouchParams,
    intensity: number,
    targetCanvas?: HTMLCanvasElement
  ): HTMLCanvasElement {
    if (typeof document === 'undefined') return (targetCanvas || {}) as HTMLCanvasElement;

    const canvas = targetCanvas || document.createElement('canvas');
    const width = (source as any).videoWidth || (source as any).width || 800;
    const height = (source as any).videoHeight || (source as any).height || 450;
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return canvas;

    ctx.drawImage(source, 0, 0, width, height);
    if (intensity <= 0) return canvas;

    const imgData = ctx.getImageData(0, 0, width, height);
    const data = imgData.data;

    const warmth = params.skinToneWarmth || 0;
    const skinBright = (params.skinBrightness || 0) * 255;
    const contrast = params.contrast || 0;
    const contrastFactor = (1.0 + contrast);
    const sat = params.saturation || 0;

    for (let i = 0; i < data.length; i += 4) {
      let r = data[i];
      let g = data[i + 1];
      let b = data[i + 2];

      const origR = r;
      const origG = g;
      const origB = b;

      // Warmth & skin brightness
      r += skinBright + warmth * 15;
      g += skinBright * 0.8;
      b += skinBright * 0.6 - warmth * 10;

      // Contrast
      r = (r - 128) * contrastFactor + 128;
      g = (g - 128) * contrastFactor + 128;
      b = (b - 128) * contrastFactor + 128;

      // Saturation
      const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
      r = luma + (r - luma) * (1 + sat);
      g = luma + (g - luma) * (1 + sat);
      b = luma + (b - luma) * (1 + sat);

      data[i]     = Math.min(255, Math.max(0, origR * (1 - intensity) + r * intensity));
      data[i + 1] = Math.min(255, Math.max(0, origG * (1 - intensity) + g * intensity));
      data[i + 2] = Math.min(255, Math.max(0, origB * (1 - intensity) + b * intensity));
    }

    ctx.putImageData(imgData, 0, 0);
    return canvas;
  }

  public getCSSFilterString(presetIdentifier: string | number | PortraitRetouchPreset, intensity: number = 1.0): string {
    const normIntensity = intensity > 1.0 ? Math.min(1.0, intensity / 100) : Math.max(0, intensity);
    if (normIntensity <= 0) return 'none';

    const preset = typeof presetIdentifier === 'object'
      ? presetIdentifier
      : getPortraitRetouchPreset(presetIdentifier) || PORTRAIT_RETOUCH_PRESETS.natural_skin;

    const p = preset.params;
    const brightnessVal = 1.0 + ((p.skinBrightness || 0) + (p.exposure || 0)) * normIntensity;
    const contrastVal = 1.0 + (p.contrast || 0) * normIntensity;
    const saturationVal = 1.0 + (p.saturation || 0) * normIntensity + (p.vibrance || 0) * 0.5 * normIntensity + (p.redSaturation || 0) * 0.5 * normIntensity;
    const hueShift = (p.skinToneWarmth || 0) * 15 * normIntensity;
    const blurVal = (p.softFocus || 0) * 2.0 * normIntensity;

    return `brightness(${brightnessVal.toFixed(3)}) contrast(${contrastVal.toFixed(3)}) saturate(${saturationVal.toFixed(3)}) hue-rotate(${hueShift.toFixed(2)}deg) ${blurVal > 0 ? `blur(${blurVal.toFixed(1)}px)` : ''}`.trim();
  }
}

export const portraitRetouchEngine = PortraitRetouchEngine.getInstance();
