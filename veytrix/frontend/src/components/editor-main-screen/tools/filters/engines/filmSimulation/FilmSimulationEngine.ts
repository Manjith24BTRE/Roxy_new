// src/components/editor-main-screen/tools/filters/engines/filmSimulation/FilmSimulationEngine.ts
import { FILM_SIMULATION_PRESETS, getFilmSimulationPreset, FilmSimulationParams, FilmSimulationPreset } from './filmSimulationPresets';
import { FILM_VERTEX_SHADER_SOURCE, FILM_FRAGMENT_SHADER_SOURCE } from './filmSimulationShader';

export class FilmSimulationEngine {
  private static instance: FilmSimulationEngine;

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

  public static getInstance(): FilmSimulationEngine {
    if (!FilmSimulationEngine.instance) {
      FilmSimulationEngine.instance = new FilmSimulationEngine();
    }
    return FilmSimulationEngine.instance;
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
        console.warn('[FilmSimulationEngine] WebGL context unavailable. Using Canvas2D fallback.');
        return false;
      }

      const gl = this.gl;
      const vertShader = this.compileShader(gl, gl.VERTEX_SHADER, FILM_VERTEX_SHADER_SOURCE);
      const fragShader = this.compileShader(gl, gl.FRAGMENT_SHADER, FILM_FRAGMENT_SHADER_SOURCE);

      if (!vertShader || !fragShader) return false;

      const program = gl.createProgram();
      if (!program) return false;

      gl.attachShader(program, vertShader);
      gl.attachShader(program, fragShader);
      gl.linkProgram(program);

      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error('[FilmSimulationEngine] Program link error:', gl.getProgramInfoLog(program));
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
        'u_colorTemperature', 'u_colorTint', 'u_contrast', 'u_blackLift',
        'u_highlightRolloff', 'u_saturation', 'u_fade', 'u_filmGrain',
        'u_fineGrain', 'u_vignette', 'u_highlightTint', 'u_shadowTint',
        'u_halationGlow', 'u_sepiaMix', 'u_vhsAberration', 'u_filmFlicker', 'u_time'
      ];
      uniforms.forEach((u) => {
        this.uniformLocations[u] = gl.getUniformLocation(program, u);
      });

      this.isInitialized = true;
      return true;
    } catch (e) {
      console.error('[FilmSimulationEngine] Initialization error:', e);
      return false;
    }
  }

  private compileShader(gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null {
    const shader = gl.createShader(type);
    if (!shader) return null;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error('[FilmSimulationEngine] Shader compile error:', gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  }

  /**
   * Main single-pass GPU rendering pipeline for FilmSimulationEngine.
   */
  public renderFrame(
    imageSource: HTMLImageElement | HTMLCanvasElement | VideoFrame,
    presetIdentifier: string | number | FilmSimulationPreset,
    intensity: number = 1.0,
    targetCanvas?: HTMLCanvasElement
  ): HTMLCanvasElement {
    const preset = typeof presetIdentifier === 'object'
      ? presetIdentifier
      : getFilmSimulationPreset(presetIdentifier) || FILM_SIMULATION_PRESETS.film_grain;

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
      gl.uniform1f(this.uniformLocations['u_colorTemperature'], p.colorTemperature || 0.0);
      gl.uniform1f(this.uniformLocations['u_colorTint'], p.colorTint || 0.0);
      gl.uniform1f(this.uniformLocations['u_contrast'], p.contrast || 0.0);
      gl.uniform1f(this.uniformLocations['u_blackLift'], p.blackLift || 0.0);
      gl.uniform1f(this.uniformLocations['u_highlightRolloff'], p.highlightRolloff || 0.0);
      gl.uniform1f(this.uniformLocations['u_saturation'], p.saturation || 0.0);
      gl.uniform1f(this.uniformLocations['u_fade'], p.fade || 0.0);
      gl.uniform1f(this.uniformLocations['u_filmGrain'], p.filmGrain || 0.0);
      gl.uniform1f(this.uniformLocations['u_fineGrain'], p.fineGrain || 0.0);
      gl.uniform1f(this.uniformLocations['u_vignette'], p.vignette || 0.0);

      const hlTint = p.highlightTint || [0, 0, 0];
      gl.uniform3f(this.uniformLocations['u_highlightTint'], hlTint[0], hlTint[1], hlTint[2]);

      const shTint = p.shadowTint || [0, 0, 0];
      gl.uniform3f(this.uniformLocations['u_shadowTint'], shTint[0], shTint[1], shTint[2]);

      gl.uniform1f(this.uniformLocations['u_halationGlow'], p.halationGlow || 0.0);
      gl.uniform1f(this.uniformLocations['u_sepiaMix'], p.sepiaMix || 0.0);
      gl.uniform1f(this.uniformLocations['u_vhsAberration'], p.vhsAberration || 0.0);
      gl.uniform1f(this.uniformLocations['u_filmFlicker'], p.filmFlicker || 0.0);
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
      console.warn('[FilmSimulationEngine] WebGL render error. Falling back to Canvas2D:', e);
      return this.renderCanvas2DFallback(imageSource, preset, intensity, targetCanvas);
    }
  }

  private renderCanvas2DFallback(
    imageSource: any,
    preset: FilmSimulationPreset,
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

    const temp = (params.colorTemperature || 0) * intensity;
    const sepiaMix = (params.sepiaMix || 0) * intensity;
    const contrast = (params.contrast || 0) * intensity;
    const contrastFactor = 1.0 + contrast;
    const saturation = (params.saturation || 0) * intensity;
    const blackLift = (params.blackLift || 0) * intensity * 25;

    for (let i = 0; i < data.length; i += 4) {
      let r = data[i];
      let g = data[i + 1];
      let b = data[i + 2];

      const origR = r;
      const origG = g;
      const origB = b;

      // Sepia mix
      if (sepiaMix > 0) {
        const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
        const sr = luma * 1.2;
        const sg = luma * 0.95;
        const sb = luma * 0.75;
        r = r * (1 - sepiaMix) + sr * sepiaMix;
        g = g * (1 - sepiaMix) + sg * sepiaMix;
        b = b * (1 - sepiaMix) + sb * sepiaMix;
      }

      // Color Temperature
      r *= (1 + temp * 0.22);
      b *= (1 - temp * 0.22);

      // Contrast
      r = (r - 128) * contrastFactor + 128;
      g = (g - 128) * contrastFactor + 128;
      b = (b - 128) * contrastFactor + 128;

      // Saturation
      const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
      r = luma + (r - luma) * (1 + saturation);
      g = luma + (g - luma) * (1 + saturation);
      b = luma + (b - luma) * (1 + saturation);

      // Black Lift
      if (blackLift > 0) {
        r = Math.max(r, blackLift);
        g = Math.max(g, blackLift);
        b = Math.max(b, blackLift);
      }

      data[i]     = Math.min(255, Math.max(0, origR * (1 - intensity) + r * intensity));
      data[i + 1] = Math.min(255, Math.max(0, origG * (1 - intensity) + g * intensity));
      data[i + 2] = Math.min(255, Math.max(0, origB * (1 - intensity) + b * intensity));
    }

    ctx.putImageData(imgData, 0, 0);
    return canvas;
  }

  /**
   * Generates a CSS filter string corresponding to a FilmSimulation preset and intensity.
   */
  public getCSSFilterString(presetIdentifier: string | number | FilmSimulationPreset, intensity: number = 1.0): string {
    const normIntensity = intensity > 1.0 ? Math.min(1.0, intensity / 100) : Math.max(0, intensity);
    if (normIntensity <= 0) return 'none';

    const preset = typeof presetIdentifier === 'object'
      ? presetIdentifier
      : getFilmSimulationPreset(presetIdentifier) || FILM_SIMULATION_PRESETS.film_grain;

    const p = preset.params;
    const contrastVal = 1.0 + (p.contrast || 0) * normIntensity;
    const saturationVal = 1.0 + (p.saturation || 0) * normIntensity;
    const hueShift = (p.colorTemperature || 0) * 12 * normIntensity;
    const sepiaVal = ((p.sepiaMix || 0) + (p.fade || 0) * 0.25) * normIntensity;
    const brightnessVal = 1.0 + (p.blackLift || 0) * 0.15 * normIntensity;

    return `brightness(${brightnessVal.toFixed(2)}) contrast(${contrastVal.toFixed(2)}) saturate(${saturationVal.toFixed(2)}) hue-rotate(${hueShift.toFixed(1)}deg) sepia(${sepiaVal.toFixed(2)})`;
  }
}

export const filmSimulationEngine = FilmSimulationEngine.getInstance();
