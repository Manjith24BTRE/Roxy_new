// src/components/editor-main-screen/tools/filters/engines/cinematic/BaseFilterEngine.ts
import { VERTEX_SHADER_SOURCE } from './CinematicFilterModules';

export class BaseFilterEngine {
  protected canvas: HTMLCanvasElement | null = null;
  protected gl: WebGLRenderingContext | null = null;
  protected programMap: Map<string, WebGLProgram> = new Map();
  protected texture: WebGLTexture | null = null;
  protected positionBuffer: WebGLBuffer | null = null;
  protected texCoordBuffer: WebGLBuffer | null = null;
  protected isInitialized = false;
  protected startTime = Date.now();

  protected initGL(): boolean {
    if (this.isInitialized) return true;
    if (typeof document === 'undefined') return false;

    try {
      this.canvas = document.createElement('canvas');
      this.gl = this.canvas.getContext('webgl', { preserveDrawingBuffer: true, alpha: true });
      if (!this.gl) return false;

      const gl = this.gl;

      // Position Quad Buffer
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

      // TexCoord Buffer
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

      this.isInitialized = true;
      return true;
    } catch (e) {
      console.error('[BaseFilterEngine] Initialization error:', e);
      return false;
    }
  }

  protected compileProgram(key: string, fragmentShaderSource: string): WebGLProgram | null {
    if (!this.gl) return null;
    if (this.programMap.has(key)) return this.programMap.get(key)!;

    const gl = this.gl;
    const vertShader = this.compileShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER_SOURCE);
    const fragShader = this.compileShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
    if (!vertShader || !fragShader) return null;

    const program = gl.createProgram();
    if (!program) return null;

    gl.attachShader(program, vertShader);
    gl.attachShader(program, fragShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error(`[BaseFilterEngine] Link error for ${key}:`, gl.getProgramInfoLog(program));
      return null;
    }

    this.programMap.set(key, program);
    return program;
  }

  private compileShader(gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null {
    const shader = gl.createShader(type);
    if (!shader) return null;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error('[BaseFilterEngine] Shader compile error:', gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  }

  /**
   * Helper to compute animated frame time in seconds
   */
  protected getFrameTime(): float {
    return (Date.now() - this.startTime) / 1000.0;
  }
}
export type float = number;
