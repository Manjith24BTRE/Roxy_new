// src/components/editor-main-screen/tools/filters/engines/landscapeEnhance/LandscapeEnhanceEngine.ts
import { LANDSCAPE_ENHANCE_PRESETS, getLandscapeEnhancePreset, LandscapeEnhanceParams, LandscapeEnhancePreset } from './landscapeEnhancePresets';
import { LANDSCAPE_VERTEX_SHADER_SOURCE, LANDSCAPE_FRAGMENT_SHADER_SOURCE } from './landscapeEnhanceShader';

export class LandscapeEnhanceEngine {
  private static instance: LandscapeEnhanceEngine;

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

  public static getInstance(): LandscapeEnhanceEngine {
    if (!LandscapeEnhanceEngine.instance) {
      LandscapeEnhanceEngine.instance = new LandscapeEnhanceEngine();
    }
    return LandscapeEnhanceEngine.instance;
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
        console.warn('[LandscapeEnhanceEngine] WebGL context unavailable. Using Canvas2D fallback.');
        return false;
      }

      const gl = this.gl;
      const vertShader = this.compileShader(gl, gl.VERTEX_SHADER, LANDSCAPE_VERTEX_SHADER_SOURCE);
      const fragShader = this.compileShader(gl, gl.FRAGMENT_SHADER, LANDSCAPE_FRAGMENT_SHADER_SOURCE);

      if (!vertShader || !fragShader) return false;

      const program = gl.createProgram();
      if (!program) return false;

      gl.attachShader(program, vertShader);
      gl.attachShader(program, fragShader);
      gl.linkProgram(program);

      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error('[LandscapeEnhanceEngine] Program link error:', gl.getProgramInfoLog(program));
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
        'u_foliageGreenBoost', 'u_skyBlueBoost', 'u_warmth', 'u_vibrance',
        'u_saturation', 'u_contrast', 'u_brightness', 'u_highlights',
        'u_shadows', 'u_clarityDehaze', 'u_hdrToneMap', 'u_autumnShift',
        'u_aquaTropicalShift', 'u_vignette'
      ];
      uniforms.forEach((u) => {
        this.uniformLocations[u] = gl.getUniformLocation(program, u);
      });

      this.isInitialized = true;
      return true;
    } catch (e) {
      console.error('[LandscapeEnhanceEngine] Initialization error:', e);
      return false;
    }
  }

  private compileShader(gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null {
    const shader = gl.createShader(type);
    if (!shader) return null;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error('[LandscapeEnhanceEngine] Shader compile error:', gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  }

  /**
   * Main single-pass GPU rendering pipeline for LandscapeEnhanceEngine.
   */
  public renderFrame(
    imageSource: HTMLImageElement | HTMLCanvasElement | VideoFrame,
    presetIdentifier: string | number | LandscapeEnhancePreset,
    intensity: number = 1.0,
    targetCanvas?: HTMLCanvasElement
  ): HTMLCanvasElement {
    const preset = typeof presetIdentifier === 'object'
      ? presetIdentifier
      : getLandscapeEnhancePreset(presetIdentifier) || LANDSCAPE_ENHANCE_PRESETS.forest_green;

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
      gl.uniform1f(this.uniformLocations['u_foliageGreenBoost'], p.foliageGreenBoost || 0.0);
      gl.uniform1f(this.uniformLocations['u_skyBlueBoost'], p.skyBlueBoost || 0.0);
      gl.uniform1f(this.uniformLocations['u_warmth'], p.warmth || 0.0);
      gl.uniform1f(this.uniformLocations['u_vibrance'], p.vibrance || 0.0);
      gl.uniform1f(this.uniformLocations['u_saturation'], p.saturation || 0.0);
      gl.uniform1f(this.uniformLocations['u_contrast'], p.contrast || 0.0);
      gl.uniform1f(this.uniformLocations['u_brightness'], p.brightness || 0.0);
      gl.uniform1f(this.uniformLocations['u_highlights'], p.highlights || 0.0);
      gl.uniform1f(this.uniformLocations['u_shadows'], p.shadows || 0.0);
      gl.uniform1f(this.uniformLocations['u_clarityDehaze'], p.clarityDehaze || 0.0);
      gl.uniform1f(this.uniformLocations['u_hdrToneMap'], p.hdrToneMap || 0.0);
      gl.uniform1f(this.uniformLocations['u_autumnShift'], p.autumnShift || 0.0);
      gl.uniform1f(this.uniformLocations['u_aquaTropicalShift'], p.aquaTropicalShift || 0.0);
      gl.uniform1f(this.uniformLocations['u_vignette'], p.vignette || 0.0);

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
      console.warn('[LandscapeEnhanceEngine] WebGL render error. Falling back to Canvas2D:', e);
      return this.renderCanvas2DFallback(imageSource, preset, intensity, targetCanvas);
    }
  }

  private renderCanvas2DFallback(
    imageSource: any,
    preset: LandscapeEnhancePreset,
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

    const contrastFactor = 1.0 + (params.contrast || 0) * intensity;
    const warmth = (params.warmth || 0) * intensity;
    const saturation = (params.saturation || 0) * intensity + (params.vibrance || 0) * 0.5 * intensity;

    for (let i = 0; i < data.length; i += 4) {
      let r = data[i];
      let g = data[i + 1];
      let b = data[i + 2];

      const origR = r;
      const origG = g;
      const origB = b;

      // Warmth
      r *= (1 + warmth * 0.22);
      b *= (1 - warmth * 0.22);

      // Contrast
      r = (r - 128) * contrastFactor + 128;
      g = (g - 128) * contrastFactor + 128;
      b = (b - 128) * contrastFactor + 128;

      // Saturation
      const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
      r = luma + (r - luma) * (1 + saturation);
      g = luma + (g - luma) * (1 + saturation);
      b = luma + (b - luma) * (1 + saturation);

      data[i]     = Math.min(255, Math.max(0, origR * (1 - intensity) + r * intensity));
      data[i + 1] = Math.min(255, Math.max(0, origG * (1 - intensity) + g * intensity));
      data[i + 2] = Math.min(255, Math.max(0, origB * (1 - intensity) + b * intensity));
    }

    ctx.putImageData(imgData, 0, 0);
    return canvas;
  }

  /**
   * Generates a CSS filter string corresponding to a LandscapeEnhance preset and intensity.
   */
  public getCSSFilterString(presetIdentifier: string | number | LandscapeEnhancePreset, intensity: number = 1.0): string {
    const normIntensity = intensity > 1.0 ? Math.min(1.0, intensity / 100) : Math.max(0, intensity);
    if (normIntensity <= 0) return 'none';

    const preset = typeof presetIdentifier === 'object'
      ? presetIdentifier
      : getLandscapeEnhancePreset(presetIdentifier) || LANDSCAPE_ENHANCE_PRESETS.forest_green;

    const p = preset.params;
    const contrastVal = 1.0 + (p.contrast || 0) * normIntensity + (p.clarityDehaze || 0) * 0.25 * normIntensity;
    const saturationVal = 1.0 + (p.saturation || 0) * normIntensity + (p.vibrance || 0) * 0.35 * normIntensity + (p.foliageGreenBoost || 0) * 0.2 * normIntensity;
    const hueShift = ((p.warmth || 0) * 12 + (p.autumnShift || 0) * 15 - (p.aquaTropicalShift || 0) * 10) * normIntensity;
    const brightnessVal = 1.0 + (p.brightness || 0) * normIntensity + (p.hdrToneMap || 0) * 0.08 * normIntensity;

    return `brightness(${brightnessVal.toFixed(2)}) contrast(${contrastVal.toFixed(2)}) saturate(${saturationVal.toFixed(2)}) hue-rotate(${hueShift.toFixed(1)}deg)`;
  }
}

export const landscapeEnhanceEngine = LandscapeEnhanceEngine.getInstance();
