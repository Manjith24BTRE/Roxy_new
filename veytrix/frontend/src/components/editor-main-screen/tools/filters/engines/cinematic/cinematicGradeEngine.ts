// src/components/editor-main-screen/tools/filters/engines/cinematic/cinematicGradeEngine.ts
import { CINEMATIC_PRESETS, getCinematicPreset, CinematicGradeParams, CinematicPreset } from './cinematicGradePresets';
import { VERTEX_SHADER_SOURCE, FRAGMENT_SHADER_SOURCE } from './cinematicGradeShader';

export class CinematicGradeEngine {
  private static instance: CinematicGradeEngine;

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

  public static getInstance(): CinematicGradeEngine {
    if (!CinematicGradeEngine.instance) {
      CinematicGradeEngine.instance = new CinematicGradeEngine();
    }
    return CinematicGradeEngine.instance;
  }

  /**
   * Initializes WebGL resources once for frame-compatible reuse.
   */
  private initGL(): boolean {
    if (this.isInitialized) return true;
    if (typeof document === 'undefined') return false;
    try {
      this.canvas = document.createElement('canvas');
      this.gl = this.canvas.getContext('webgl', { preserveDrawingBuffer: true, alpha: true });
      if (!this.gl) {
        console.warn('[CinematicGradeEngine] WebGL context unavailable. Falling back to Canvas2D rendering.');
        return false;
      }

      const gl = this.gl;
      const vertShader = this.compileShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER_SOURCE);
      const fragShader = this.compileShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER_SOURCE);

      if (!vertShader || !fragShader) return false;

      const program = gl.createProgram();
      if (!program) return false;

      gl.attachShader(program, vertShader);
      gl.attachShader(program, fragShader);
      gl.linkProgram(program);

      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error('[CinematicGradeEngine] Program link error:', gl.getProgramInfoLog(program));
        return false;
      }

      this.program = program;
      gl.useProgram(program);

      // Setup Quad Buffers
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

      // Cache uniform locations
      const uniforms = [
        'u_image', 'u_intensity', 'u_exposure', 'u_contrast', 'u_brightness',
        'u_saturation', 'u_temperature', 'u_tint', 'u_highlights', 'u_shadows',
        'u_blacks', 'u_whites', 'u_fade', 'u_vibrance', 'u_clarity', 'u_grain',
        'u_vignette', 'u_highlightHue', 'u_shadowHue', 'u_colorBalance', 'u_glow'
      ];
      uniforms.forEach((name) => {
        this.uniformLocations[name] = gl.getUniformLocation(program, name);
      });

      this.isInitialized = true;
      return true;
    } catch (e) {
      console.error('[CinematicGradeEngine] Initialization error:', e);
      return false;
    }
  }

  private compileShader(gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null {
    const shader = gl.createShader(type);
    if (!shader) return null;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error('[CinematicGradeEngine] Shader compile error:', gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  }

  /**
   * Main reusable cinematic grade renderer.
   * Accepts HTMLImageElement, HTMLVideoElement, or HTMLCanvasElement as source.
   * Blends graded result with original using intensity (0 = original, 1 = 100% grade).
   */
  public renderFrame(
    source: CanvasImageSource,
    presetIdentifier: string | number | CinematicPreset,
    intensity: number = 1.0,
    targetCanvas?: HTMLCanvasElement
  ): HTMLCanvasElement {
    const preset = typeof presetIdentifier === 'object' 
      ? presetIdentifier 
      : getCinematicPreset(presetIdentifier) || CINEMATIC_PRESETS.hollywood_gold;

    const srcWidth = (source as any).videoWidth || (source as any).width || 800;
    const srcHeight = (source as any).videoHeight || (source as any).height || 450;

    // Use WebGL single-pass GPU rendering if initialized
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

      // Bind positions
      const posLoc = gl.getAttribLocation(this.program, 'a_position');
      gl.enableVertexAttribArray(posLoc);
      gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
      gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

      // Bind texCoords
      const texLoc = gl.getAttribLocation(this.program, 'a_texCoord');
      gl.enableVertexAttribArray(texLoc);
      gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordBuffer);
      gl.vertexAttribPointer(texLoc, 2, gl.FLOAT, false, 0, 0);

      // Upload source frame texture
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, this.texture);
      try {
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source as any);
      } catch (e) {
        // Fallback for CORS or canvas taint
        return this.renderCanvas2DFallback(source, preset.params, intensity, targetCanvas);
      }

      gl.uniform1i(this.uniformLocations['u_image'], 0);
      gl.uniform1f(this.uniformLocations['u_intensity'], Math.max(0, Math.min(1, intensity)));

      const p = preset.params;
      gl.uniform1f(this.uniformLocations['u_exposure'], p.exposure || 0);
      gl.uniform1f(this.uniformLocations['u_contrast'], p.contrast || 0);
      gl.uniform1f(this.uniformLocations['u_brightness'], p.brightness || 0);
      gl.uniform1f(this.uniformLocations['u_saturation'], p.saturation || 0);
      gl.uniform1f(this.uniformLocations['u_temperature'], p.temperature || 0);
      gl.uniform1f(this.uniformLocations['u_tint'], p.tint || 0);
      gl.uniform1f(this.uniformLocations['u_highlights'], p.highlights || 0);
      gl.uniform1f(this.uniformLocations['u_shadows'], p.shadows || 0);
      gl.uniform1f(this.uniformLocations['u_blacks'], p.blacks || 0);
      gl.uniform1f(this.uniformLocations['u_whites'], p.whites || 0);
      gl.uniform1f(this.uniformLocations['u_fade'], p.fade || 0);
      gl.uniform1f(this.uniformLocations['u_vibrance'], p.vibrance || 0);
      gl.uniform1f(this.uniformLocations['u_clarity'], p.clarity || 0);
      gl.uniform1f(this.uniformLocations['u_grain'], p.grain || 0);
      gl.uniform1f(this.uniformLocations['u_vignette'], p.vignette || 0);
      gl.uniform1f(this.uniformLocations['u_highlightHue'], p.highlightHue || 0);
      gl.uniform1f(this.uniformLocations['u_shadowHue'], p.shadowHue || 0);
      gl.uniform1f(this.uniformLocations['u_colorBalance'], p.colorBalance || 0);
      gl.uniform1f(this.uniformLocations['u_glow'], p.glow || 0);

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
   * Lightweight Canvas2D math fallback.
   */
  private renderCanvas2DFallback(
    source: CanvasImageSource,
    params: CinematicGradeParams,
    intensity: number,
    targetCanvas?: HTMLCanvasElement
  ): HTMLCanvasElement {
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

    const exp = params.exposure || 0;
    const expFactor = Math.pow(2, exp);
    const bright = (params.brightness || 0) * 255;
    const temp = params.temperature || 0;
    const contrast = params.contrast || 0;
    const contrastFactor = (1.0 + contrast);
    const sat = params.saturation || 0;
    const fade = params.fade || 0;

    for (let i = 0; i < data.length; i += 4) {
      let r = data[i];
      let g = data[i + 1];
      let b = data[i + 2];

      const origR = r;
      const origG = g;
      const origB = b;

      // 1. Exposure & Brightness
      r = r * expFactor + bright;
      g = g * expFactor + bright;
      b = b * expFactor + bright;

      // 2. Temperature
      r *= (1 + temp * 0.25);
      b *= (1 - temp * 0.25);

      // 3. Contrast
      r = (r - 128) * contrastFactor + 128;
      g = (g - 128) * contrastFactor + 128;
      b = (b - 128) * contrastFactor + 128;

      // 4. Saturation
      const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
      r = luma + (r - luma) * (1 + sat);
      g = luma + (g - luma) * (1 + sat);
      b = luma + (b - luma) * (1 + sat);

      // 5. Film Fade
      if (fade > 0) {
        const fadeAmt = fade * (1 - luma / 255) * 30;
        r += fadeAmt;
        g += fadeAmt;
        b += fadeAmt;
      }

      // Clamp & Intensity Blend
      data[i]     = Math.min(255, Math.max(0, origR * (1 - intensity) + r * intensity));
      data[i + 1] = Math.min(255, Math.max(0, origG * (1 - intensity) + g * intensity));
      data[i + 2] = Math.min(255, Math.max(0, origB * (1 - intensity) + b * intensity));
    }

    ctx.putImageData(imgData, 0, 0);
    return canvas;
  }

  /**
   * Generates CSS filter string corresponding to a preset key and intensity.
   */
  public getCSSFilterString(presetIdentifier: string | number | CinematicPreset, intensity: number = 1.0): string {
    const preset = typeof presetIdentifier === 'object'
      ? presetIdentifier
      : getCinematicPreset(presetIdentifier) || CINEMATIC_PRESETS.hollywood_gold;

    if (intensity <= 0) return 'none';

    const p = preset.params;
    const brightnessVal = 1.0 + (p.brightness || 0) * intensity + (p.exposure || 0) * 0.5 * intensity;
    const contrastVal = 1.0 + (p.contrast || 0) * intensity;
    const saturationVal = 1.0 + (p.saturation || 0) * intensity;
    const hueShift = (p.temperature || 0) * 15 * intensity;
    const sepiaVal = (p.fade || 0) * 0.3 * intensity;

    return `brightness(${brightnessVal.toFixed(2)}) contrast(${contrastVal.toFixed(2)}) saturate(${saturationVal.toFixed(2)}) hue-rotate(${hueShift.toFixed(1)}deg) sepia(${sepiaVal.toFixed(2)})`;
  }
}

export const cinematicGradeEngine = CinematicGradeEngine.getInstance();
