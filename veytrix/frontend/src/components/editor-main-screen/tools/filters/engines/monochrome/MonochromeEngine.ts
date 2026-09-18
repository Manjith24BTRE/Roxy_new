// src/components/editor-main-screen/tools/filters/engines/monochrome/MonochromeEngine.ts
import { MONOCHROME_PRESETS, getMonochromePreset, MonochromeParams, MonochromePreset } from './monochromePresets';
import { MONO_VERTEX_SHADER_SOURCE, MONO_FRAGMENT_SHADER_SOURCE } from './monochromeShader';

export class MonochromeEngine {
  private static instance: MonochromeEngine;

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

  public static getInstance(): MonochromeEngine {
    if (!MonochromeEngine.instance) {
      MonochromeEngine.instance = new MonochromeEngine();
    }
    return MonochromeEngine.instance;
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
        console.warn('[MonochromeEngine] WebGL context unavailable. Using Canvas2D fallback.');
        return false;
      }

      const gl = this.gl;
      const vertShader = this.compileShader(gl, gl.VERTEX_SHADER, MONO_VERTEX_SHADER_SOURCE);
      const fragShader = this.compileShader(gl, gl.FRAGMENT_SHADER, MONO_FRAGMENT_SHADER_SOURCE);

      if (!vertShader || !fragShader) return false;

      const program = gl.createProgram();
      if (!program) return false;

      gl.attachShader(program, vertShader);
      gl.attachShader(program, fragShader);
      gl.linkProgram(program);

      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error('[MonochromeEngine] Program link error:', gl.getProgramInfoLog(program));
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

      // Texture setup
      this.texture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, this.texture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

      // Cache Uniform Locations
      const uniforms = [
        'u_image', 'u_intensity',
        'u_redChannelWeight', 'u_greenChannelWeight', 'u_blueChannelWeight',
        'u_contrast', 'u_brightness', 'u_blackPoint', 'u_whitePoint',
        'u_gamma', 'u_highlights', 'u_shadows', 'u_fade', 'u_grain',
        'u_vignette', 'u_warmth', 'u_highlightTint', 'u_shadowTint', 'u_time'
      ];
      uniforms.forEach((u) => {
        this.uniformLocations[u] = gl.getUniformLocation(program, u);
      });

      this.isInitialized = true;
      return true;
    } catch (e) {
      console.error('[MonochromeEngine] Initialization error:', e);
      return false;
    }
  }

  private compileShader(gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null {
    const shader = gl.createShader(type);
    if (!shader) return null;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error('[MonochromeEngine] Shader compile error:', gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  }

  /**
   * Main single-pass GPU rendering pipeline for MonochromeEngine.
   */
  public renderFrame(
    imageSource: HTMLImageElement | HTMLCanvasElement | VideoFrame,
    presetIdentifier: string | number | MonochromePreset,
    intensity: number = 1.0,
    targetCanvas?: HTMLCanvasElement
  ): HTMLCanvasElement {
    const preset = typeof presetIdentifier === 'object'
      ? presetIdentifier
      : getMonochromePreset(presetIdentifier) || MONOCHROME_PRESETS.pure_mono;

    if (!this.isInitialized && !this.initGL()) {
      return this.renderCanvas2DFallback(imageSource, preset, intensity, targetCanvas);
    }

    const gl = this.gl;
    const program = this.program;
    if (!gl || !program) {
      return this.renderCanvas2DFallback(imageSource, preset, intensity, targetCanvas);
    }

    try {
      const width = (imageSource as any).videoWidth || (imageSource as any).width || 800;
      const height = (imageSource as any).videoHeight || (imageSource as any).height || 600;

      if (!this.canvas) this.canvas = document.createElement('canvas');
      this.canvas.width = width;
      this.canvas.height = height;
      gl.viewport(0, 0, width, height);

      gl.useProgram(program);

      // Bind Geometry
      const aPosition = gl.getAttribLocation(program, 'a_position');
      gl.enableVertexAttribArray(aPosition);
      gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
      gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);

      const aTexCoord = gl.getAttribLocation(program, 'a_texCoord');
      gl.enableVertexAttribArray(aTexCoord);
      gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordBuffer);
      gl.vertexAttribPointer(aTexCoord, 2, gl.FLOAT, false, 0, 0);

      // Load Image Texture
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, this.texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, imageSource as any);
      gl.uniform1i(this.uniformLocations['u_image'], 0);

      // Uniforms
      gl.uniform1f(this.uniformLocations['u_intensity'], intensity);

      const p = preset.params;
      gl.uniform1f(this.uniformLocations['u_redChannelWeight'], p.redChannelWeight ?? 0.2126);
      gl.uniform1f(this.uniformLocations['u_greenChannelWeight'], p.greenChannelWeight ?? 0.7152);
      gl.uniform1f(this.uniformLocations['u_blueChannelWeight'], p.blueChannelWeight ?? 0.0722);
      gl.uniform1f(this.uniformLocations['u_contrast'], p.contrast || 0.0);
      gl.uniform1f(this.uniformLocations['u_brightness'], p.brightness || 0.0);
      gl.uniform1f(this.uniformLocations['u_blackPoint'], p.blackPoint || 0.0);
      gl.uniform1f(this.uniformLocations['u_whitePoint'], p.whitePoint || 0.0);
      gl.uniform1f(this.uniformLocations['u_gamma'], p.gamma || 1.0);
      gl.uniform1f(this.uniformLocations['u_highlights'], p.highlights || 0.0);
      gl.uniform1f(this.uniformLocations['u_shadows'], p.shadows || 0.0);
      gl.uniform1f(this.uniformLocations['u_fade'], p.fade || 0.0);
      gl.uniform1f(this.uniformLocations['u_grain'], p.grain || 0.0);
      gl.uniform1f(this.uniformLocations['u_vignette'], p.vignette || 0.0);
      gl.uniform1f(this.uniformLocations['u_warmth'], p.warmth || 0.0);

      const hlTint = p.highlightTint || [0, 0, 0];
      gl.uniform3f(this.uniformLocations['u_highlightTint'], hlTint[0], hlTint[1], hlTint[2]);

      const shTint = p.shadowTint || [0, 0, 0];
      gl.uniform3f(this.uniformLocations['u_shadowTint'], shTint[0], shTint[1], shTint[2]);

      gl.uniform1f(this.uniformLocations['u_time'], performance.now());

      // Render
      gl.drawArrays(gl.TRIANGLES, 0, 6);

      const outCanvas = targetCanvas || document.createElement('canvas');
      outCanvas.width = width;
      outCanvas.height = height;
      const ctx = outCanvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(this.canvas, 0, 0);
      }
      return outCanvas;
    } catch (e) {
      console.warn('[MonochromeEngine] WebGL render error. Falling back to Canvas2D:', e);
      return this.renderCanvas2DFallback(imageSource, preset, intensity, targetCanvas);
    }
  }

  private renderCanvas2DFallback(
    imageSource: any,
    preset: MonochromePreset,
    intensity: number,
    targetCanvas?: HTMLCanvasElement
  ): HTMLCanvasElement {
    const width = imageSource.videoWidth || imageSource.width || 800;
    const height = imageSource.videoHeight || imageSource.height || 600;

    const canvas = targetCanvas || document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return canvas;

    ctx.drawImage(imageSource, 0, 0, width, height);
    if (intensity <= 0) return canvas;

    const imgData = ctx.getImageData(0, 0, width, height);
    const data = imgData.data;
    const params = preset.params;

    const rWeight = params.redChannelWeight ?? 0.2126;
    const gWeight = params.greenChannelWeight ?? 0.7152;
    const bWeight = params.blueChannelWeight ?? 0.0722;
    const totalWeight = rWeight + gWeight + bWeight || 1.0;

    const contrastFactor = 1.0 + (params.contrast || 0) * intensity;
    const bright = (params.brightness || 0) * 255 * intensity;
    const blackLift = (params.blackPoint || 0) * 25 * intensity;
    const warmth = (params.warmth || 0) * intensity;

    for (let i = 0; i < data.length; i += 4) {
      const origR = data[i];
      const origG = data[i + 1];
      const origB = data[i + 2];

      // Channel-weighted luminance
      const luma = (origR * rWeight + origG * gWeight + origB * bWeight) / totalWeight;

      let r = luma + bright;
      let g = luma + bright;
      let b = luma + bright;

      // Contrast
      r = (r - 128) * contrastFactor + 128;
      g = (g - 128) * contrastFactor + 128;
      b = (b - 128) * contrastFactor + 128;

      // Black Point
      if (blackLift > 0) {
        r = Math.max(r, blackLift);
        g = Math.max(g, blackLift);
        b = Math.max(b, blackLift);
      }

      // Warmth / Coolness
      if (warmth !== 0) {
        r *= (1 + warmth * 0.15);
        b *= (1 - warmth * 0.15);
      }

      data[i]     = Math.min(255, Math.max(0, origR * (1 - intensity) + r * intensity));
      data[i + 1] = Math.min(255, Math.max(0, origG * (1 - intensity) + g * intensity));
      data[i + 2] = Math.min(255, Math.max(0, origB * (1 - intensity) + b * intensity));
    }

    ctx.putImageData(imgData, 0, 0);
    return canvas;
  }

  /**
   * Generates a CSS filter string corresponding to a Monochrome preset and intensity.
   */
  public getCSSFilterString(presetIdentifier: string | number | MonochromePreset, intensity: number = 1.0): string {
    const normIntensity = intensity > 1.0 ? Math.min(1.0, intensity / 100) : Math.max(0, intensity);
    if (normIntensity <= 0) return 'none';

    const preset = typeof presetIdentifier === 'object'
      ? presetIdentifier
      : getMonochromePreset(presetIdentifier) || MONOCHROME_PRESETS.pure_mono;

    const p = preset.params;
    const grayscaleVal = 1.0 * normIntensity;
    const contrastVal = 1.0 + (p.contrast || 0) * normIntensity;
    const brightnessVal = 1.0 + (p.brightness || 0) * normIntensity + (p.blackPoint || 0) * 0.1 * normIntensity;
    const sepiaVal = (p.warmth && p.warmth > 0 ? p.warmth : (p.fade || 0) * 0.2) * normIntensity;

    return `grayscale(${(grayscaleVal * 100).toFixed(0)}%) brightness(${brightnessVal.toFixed(2)}) contrast(${contrastVal.toFixed(2)}) sepia(${sepiaVal.toFixed(2)})`;
  }
}

export const monochromeEngine = MonochromeEngine.getInstance();
