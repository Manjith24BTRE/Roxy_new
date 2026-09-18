// src/components/editor-main-screen/tools/filters/engines/neonGrade/NeonGradeEngine.ts
import { NEON_GRADE_PRESETS, getNeonGradePreset, NeonGradeParams, NeonGradePreset } from './neonGradePresets';
import { NEON_VERTEX_SHADER_SOURCE, NEON_FRAGMENT_SHADER_SOURCE } from './neonGradeShader';

export class NeonGradeEngine {
  private static instance: NeonGradeEngine;

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

  public static getInstance(): NeonGradeEngine {
    if (!NeonGradeEngine.instance) {
      NeonGradeEngine.instance = new NeonGradeEngine();
    }
    return NeonGradeEngine.instance;
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
        console.warn('[NeonGradeEngine] WebGL context unavailable. Using Canvas2D fallback.');
        return false;
      }

      const gl = this.gl;
      const vertShader = this.compileShader(gl, gl.VERTEX_SHADER, NEON_VERTEX_SHADER_SOURCE);
      const fragShader = this.compileShader(gl, gl.FRAGMENT_SHADER, NEON_FRAGMENT_SHADER_SOURCE);

      if (!vertShader || !fragShader) return false;

      const program = gl.createProgram();
      if (!program) return false;

      gl.attachShader(program, vertShader);
      gl.attachShader(program, fragShader);
      gl.linkProgram(program);

      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error('[NeonGradeEngine] Program link error:', gl.getProgramInfoLog(program));
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
        'u_cyanElectricBoost', 'u_magentaPinkBoost', 'u_purpleVioletBoost',
        'u_highlightTint', 'u_shadowTint', 'u_neonGlowIntensity',
        'u_chromaticOffset', 'u_contrast', 'u_brightness', 'u_blackPoint',
        'u_saturation', 'u_vignette'
      ];
      uniforms.forEach((u) => {
        this.uniformLocations[u] = gl.getUniformLocation(program, u);
      });

      this.isInitialized = true;
      return true;
    } catch (e) {
      console.error('[NeonGradeEngine] Initialization error:', e);
      return false;
    }
  }

  private compileShader(gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null {
    const shader = gl.createShader(type);
    if (!shader) return null;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error('[NeonGradeEngine] Shader compile error:', gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  }

  /**
   * Main single-pass GPU rendering pipeline for NeonGradeEngine.
   */
  public renderFrame(
    imageSource: HTMLImageElement | HTMLCanvasElement | VideoFrame,
    presetIdentifier: string | number | NeonGradePreset,
    intensity: number = 1.0,
    targetCanvas?: HTMLCanvasElement
  ): HTMLCanvasElement {
    const preset = typeof presetIdentifier === 'object'
      ? presetIdentifier
      : getNeonGradePreset(presetIdentifier) || NEON_GRADE_PRESETS.neon_blue;

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
      gl.uniform1f(this.uniformLocations['u_cyanElectricBoost'], p.cyanElectricBoost || 0.0);
      gl.uniform1f(this.uniformLocations['u_magentaPinkBoost'], p.magentaPinkBoost || 0.0);
      gl.uniform1f(this.uniformLocations['u_purpleVioletBoost'], p.purpleVioletBoost || 0.0);

      const hlTint = p.highlightTint || [0, 0, 0];
      gl.uniform3f(this.uniformLocations['u_highlightTint'], hlTint[0], hlTint[1], hlTint[2]);

      const shTint = p.shadowTint || [0, 0, 0];
      gl.uniform3f(this.uniformLocations['u_shadowTint'], shTint[0], shTint[1], shTint[2]);

      gl.uniform1f(this.uniformLocations['u_neonGlowIntensity'], p.neonGlowIntensity || 0.0);
      gl.uniform1f(this.uniformLocations['u_chromaticOffset'], p.chromaticOffset || 0.0);
      gl.uniform1f(this.uniformLocations['u_contrast'], p.contrast || 0.0);
      gl.uniform1f(this.uniformLocations['u_brightness'], p.brightness || 0.0);
      gl.uniform1f(this.uniformLocations['u_blackPoint'], p.blackPoint || 0.0);
      gl.uniform1f(this.uniformLocations['u_saturation'], p.saturation || 0.0);
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
      console.warn('[NeonGradeEngine] WebGL render error. Falling back to Canvas2D:', e);
      return this.renderCanvas2DFallback(imageSource, preset, intensity, targetCanvas);
    }
  }

  private renderCanvas2DFallback(
    imageSource: any,
    preset: NeonGradePreset,
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
    const saturation = (params.saturation || 0) * intensity + (params.neonGlowIntensity || 0) * 0.4 * intensity;
    const hlTint = params.highlightTint || [1, 1, 1];

    for (let i = 0; i < data.length; i += 4) {
      let r = data[i];
      let g = data[i + 1];
      let b = data[i + 2];

      const origR = r;
      const origG = g;
      const origB = b;

      // Highlight tinting
      const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
      if (luma > 128) {
        const factor = (luma - 128) / 127;
        r = r * (1 - factor * 0.3) + r * hlTint[0] * factor * 0.3;
        g = g * (1 - factor * 0.3) + g * hlTint[1] * factor * 0.3;
        b = b * (1 - factor * 0.3) + b * hlTint[2] * factor * 0.3;
      }

      // Contrast
      r = (r - 128) * contrastFactor + 128;
      g = (g - 128) * contrastFactor + 128;
      b = (b - 128) * contrastFactor + 128;

      // Saturation
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
   * Generates a CSS filter string corresponding to a NeonGrade preset and intensity.
   */
  public getCSSFilterString(presetIdentifier: string | number | NeonGradePreset, intensity: number = 1.0): string {
    const normIntensity = intensity > 1.0 ? Math.min(1.0, intensity / 100) : Math.max(0, intensity);
    if (normIntensity <= 0) return 'none';

    const preset = typeof presetIdentifier === 'object'
      ? presetIdentifier
      : getNeonGradePreset(presetIdentifier) || NEON_GRADE_PRESETS.neon_blue;

    const p = preset.params;
    const contrastVal = 1.0 + (p.contrast || 0) * normIntensity + (p.blackPoint || 0) * 0.15 * normIntensity;
    const saturationVal = 1.0 + (p.saturation || 0) * normIntensity + (p.cyanElectricBoost || 0) * 0.35 * normIntensity + (p.magentaPinkBoost || 0) * 0.35 * normIntensity;
    const brightnessVal = 1.0 + (p.brightness || 0) * normIntensity + (p.neonGlowIntensity || 0) * 0.1 * normIntensity;
    const hueShift = (preset.presetKey === 'neon_pink' ? 50 : preset.presetKey === 'synthwave' ? -25 : preset.presetKey === 'cyberpunk' ? 20 : -10) * normIntensity;

    return `brightness(${brightnessVal.toFixed(2)}) contrast(${contrastVal.toFixed(2)}) saturate(${saturationVal.toFixed(2)}) hue-rotate(${hueShift.toFixed(1)}deg) drop-shadow(0px 0px 4px rgba(0, 220, 255, ${(p.neonGlowIntensity || 0.2) * normIntensity}))`;
  }
}

export const neonGradeEngine = NeonGradeEngine.getInstance();
