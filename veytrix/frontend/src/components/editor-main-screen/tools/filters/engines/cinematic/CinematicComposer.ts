// src/components/editor-main-screen/tools/filters/engines/cinematic/CinematicComposer.ts
import { BaseFilterEngine } from './BaseFilterEngine';
import {
  COMMON_UNIFORMS_AND_HELPERS,
  MODULE_EXPOSURE,
  MODULE_WHITE_BALANCE,
  MODULE_CONTRAST_CURVE,
  MODULE_HIGHLIGHT_ROLLOFF,
  MODULE_SHADOW_COMPRESSION,
  MODULE_SPLIT_TONE,
  MODULE_BLOOM,
  MODULE_GRAIN,
  MODULE_FILM_FADE,
  MODULE_KODAK_COLOR,
  MODULE_PASTEL_COLOR,
  MODULE_CLARITY,
  MODULE_SKIN_PROTECTION,
  MODULE_FILM_DENSITY,
  MODULE_ATMOSPHERIC_DEPTH,
  MODULE_HDR_TONE_MAPPING,
  MODULE_HDR_COLOR_SCIENCE,
} from './CinematicFilterModules';
import { ProcessedFilterParameters } from '../../../../../../services/FilterProcessor';

export class CinematicComposer extends BaseFilterEngine {
  private static instance: CinematicComposer;

  private constructor() {
    super();
  }

  public static getInstance(): CinematicComposer {
    if (!CinematicComposer.instance) {
      CinematicComposer.instance = new CinematicComposer();
    }
    return CinematicComposer.instance;
  }

  /**
   * Generates composite GLSL fragment shader for a filter based on its modular composition.
   */
  public getFragmentShaderSource(filterId: string): string {
    switch (filterId) {
      case 'warm_cinema':
        return `
${COMMON_UNIFORMS_AND_HELPERS}
${MODULE_EXPOSURE}
${MODULE_WHITE_BALANCE}
${MODULE_CONTRAST_CURVE}
${MODULE_HIGHLIGHT_ROLLOFF}
${MODULE_SKIN_PROTECTION}

void main() {
    vec4 color = texture2D(u_image, v_texCoord);
    vec3 origRgb = color.rgb;
    vec3 rgb = color.rgb;

    rgb = applyExposure(rgb, u_exposure);
    rgb = applyWhiteBalance(rgb, u_temperature, u_tint);
    rgb = applyContrastCurve(rgb, u_contrast);
    rgb = applyHighlightRolloff(rgb, u_highlights);
    rgb = applySkinProtection(origRgb, rgb);

    vec3 finalRgb = mix(origRgb, rgb, clamp(u_intensity, 0.0, 1.0));
    gl_FragColor = vec4(clamp(finalRgb, 0.0, 1.0), color.a);
}
`;

      case 'cold_cinema':
        return `
${COMMON_UNIFORMS_AND_HELPERS}
${MODULE_WHITE_BALANCE}
${MODULE_SPLIT_TONE}
${MODULE_HIGHLIGHT_ROLLOFF}
${MODULE_CLARITY}
${MODULE_SKIN_PROTECTION}

void main() {
    vec4 color = texture2D(u_image, v_texCoord);
    vec3 origRgb = color.rgb;
    vec3 rgb = color.rgb;

    rgb = applyWhiteBalance(rgb, u_temperature, u_tint);
    rgb = applySplitTone(rgb, u_shadowHue, u_highlightHue);
    rgb = applyHighlightRolloff(rgb, u_highlights);
    rgb = applyClarity(rgb, u_clarity);
    rgb = applySkinProtection(origRgb, rgb);

    vec3 finalRgb = mix(origRgb, rgb, clamp(u_intensity, 0.0, 1.0));
    gl_FragColor = vec4(clamp(finalRgb, 0.0, 1.0), color.a);
}
`;

      case 'moody_film':
        return `
${COMMON_UNIFORMS_AND_HELPERS}
${MODULE_CONTRAST_CURVE}
${MODULE_SHADOW_COMPRESSION}
${MODULE_FILM_DENSITY}
${MODULE_ATMOSPHERIC_DEPTH}
${MODULE_SKIN_PROTECTION}

void main() {
    vec4 color = texture2D(u_image, v_texCoord);
    vec3 origRgb = color.rgb;
    vec3 rgb = color.rgb;

    rgb = applyContrastCurve(rgb, u_contrast);
    rgb = applyShadowCompression(rgb, u_shadows);
    rgb = applyFilmDensity(rgb);
    rgb = applyAtmosphericDepth(rgb);
    rgb = applySkinProtection(origRgb, rgb);

    vec3 finalRgb = mix(origRgb, rgb, clamp(u_intensity, 0.0, 1.0));
    gl_FragColor = vec4(clamp(finalRgb, 0.0, 1.0), color.a);
}
`;

      case 'dream_cinema':
        return `
${COMMON_UNIFORMS_AND_HELPERS}
${MODULE_BLOOM}
${MODULE_PASTEL_COLOR}
${MODULE_HIGHLIGHT_ROLLOFF}
${MODULE_ATMOSPHERIC_DEPTH}
${MODULE_SKIN_PROTECTION}

void main() {
    vec4 color = texture2D(u_image, v_texCoord);
    vec3 origRgb = color.rgb;
    vec3 rgb = color.rgb;

    rgb = applyBloom(rgb, u_bloom);
    rgb = applyPastelColor(rgb, u_saturation);
    rgb = applyHighlightRolloff(rgb, u_highlights);
    rgb = applyAtmosphericDepth(rgb);
    rgb = applySkinProtection(origRgb, rgb);

    vec3 finalRgb = mix(origRgb, rgb, clamp(u_intensity, 0.0, 1.0));
    gl_FragColor = vec4(clamp(finalRgb, 0.0, 1.0), color.a);
}
`;

      case 'hdr_film':
        return `
${COMMON_UNIFORMS_AND_HELPERS}
${MODULE_HDR_TONE_MAPPING}
${MODULE_CLARITY}
${MODULE_CONTRAST_CURVE}
${MODULE_HDR_COLOR_SCIENCE}
${MODULE_SKIN_PROTECTION}

void main() {
    vec4 color = texture2D(u_image, v_texCoord);
    vec3 origRgb = color.rgb;
    vec3 rgb = color.rgb;

    rgb = applyHDRToneMapping(rgb, u_highlights, u_shadows);
    rgb = applyClarity(rgb, u_clarity);
    rgb = applyContrastCurve(rgb, u_contrast);
    rgb = applyHDRColorScience(rgb, u_saturation);
    rgb = applySkinProtection(origRgb, rgb);

    vec3 finalRgb = mix(origRgb, rgb, clamp(u_intensity, 0.0, 1.0));
    gl_FragColor = vec4(clamp(finalRgb, 0.0, 1.0), color.a);
}
`;

      case 'directors_cut':
        return `
${COMMON_UNIFORMS_AND_HELPERS}
${MODULE_WHITE_BALANCE}
${MODULE_CONTRAST_CURVE}
${MODULE_HIGHLIGHT_ROLLOFF}
${MODULE_SHADOW_COMPRESSION}
${MODULE_CLARITY}
${MODULE_BLOOM}
${MODULE_FILM_DENSITY}
${MODULE_ATMOSPHERIC_DEPTH}
${MODULE_SKIN_PROTECTION}

void main() {
    vec4 color = texture2D(u_image, v_texCoord);
    vec3 origRgb = color.rgb;
    vec3 rgb = color.rgb;

    rgb = applyWhiteBalance(rgb, u_temperature, u_tint);
    rgb = applyContrastCurve(rgb, u_contrast);
    rgb = applyHighlightRolloff(rgb, u_highlights);
    rgb = applyShadowCompression(rgb, u_shadows);
    rgb = applyClarity(rgb, u_clarity);
    rgb = applyBloom(rgb, u_bloom);
    rgb = applyFilmDensity(rgb);
    rgb = applyAtmosphericDepth(rgb);
    rgb = applySkinProtection(origRgb, rgb);

    vec3 finalRgb = mix(origRgb, rgb, clamp(u_intensity, 0.0, 1.0));
    gl_FragColor = vec4(clamp(finalRgb, 0.0, 1.0), color.a);
}
`;

      case 'vintage_cinema':
      default:
        return `
${COMMON_UNIFORMS_AND_HELPERS}
${MODULE_GRAIN}
${MODULE_FILM_FADE}
${MODULE_KODAK_COLOR}
${MODULE_HIGHLIGHT_ROLLOFF}
${MODULE_FILM_DENSITY}
${MODULE_SKIN_PROTECTION}

void main() {
    vec4 color = texture2D(u_image, v_texCoord);
    vec3 origRgb = color.rgb;
    vec3 rgb = color.rgb;

    rgb = applyGrain(rgb, u_grain, u_time, u_resolution);
    rgb = applyFilmFade(rgb, u_fade);
    rgb = applyKodakColor(rgb);
    rgb = applyHighlightRolloff(rgb, u_highlights);
    rgb = applyFilmDensity(rgb);
    rgb = applySkinProtection(origRgb, rgb);

    vec3 finalRgb = mix(origRgb, rgb, clamp(u_intensity, 0.0, 1.0));
    gl_FragColor = vec4(clamp(finalRgb, 0.0, 1.0), color.a);
}
`;
    }
  }

  /**
   * Primary frame rendering function using composed GLSL shaders.
   */
  public renderFrame(
    source: CanvasImageSource,
    filterId: string,
    intensity: number,
    params: ProcessedFilterParameters,
    targetCanvas?: HTMLCanvasElement
  ): HTMLCanvasElement {
    const srcWidth = (source as any).videoWidth || (source as any).width || 800;
    const srcHeight = (source as any).videoHeight || (source as any).height || 450;

    if (this.initGL() && this.gl) {
      const gl = this.gl;
      const fragShaderSource = this.getFragmentShaderSource(filterId);
      const program = this.compileProgram(filterId, fragShaderSource);

      if (program && this.canvas) {
        const canvas = targetCanvas || this.canvas;

        if (canvas.width !== srcWidth || canvas.height !== srcHeight) {
          canvas.width = srcWidth;
          canvas.height = srcHeight;
        }

        if (canvas === this.canvas) {
          gl.viewport(0, 0, srcWidth, srcHeight);
        }

        gl.useProgram(program);

        // Attributes
        const posLoc = gl.getAttribLocation(program, 'a_position');
        gl.enableVertexAttribArray(posLoc);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
        gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

        const texLoc = gl.getAttribLocation(program, 'a_texCoord');
        gl.enableVertexAttribArray(texLoc);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordBuffer);
        gl.vertexAttribPointer(texLoc, 2, gl.FLOAT, false, 0, 0);

        // Texture Upload
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        try {
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source as any);
        } catch (e) {
          return targetCanvas || this.canvas;
        }

        // Set Uniforms
        const set1f = (name: string, val: number) => {
          const loc = gl.getUniformLocation(program, name);
          if (loc) gl.uniform1f(loc, val);
        };

        const imgLoc = gl.getUniformLocation(program, 'u_image');
        if (imgLoc) gl.uniform1i(imgLoc, 0);

        set1f('u_intensity', Math.max(0, Math.min(1, intensity)));
        set1f('u_time', this.getFrameTime());

        const resLoc = gl.getUniformLocation(program, 'u_resolution');
        if (resLoc) gl.uniform2f(resLoc, srcWidth, srcHeight);

        set1f('u_exposure', params.exposure);
        set1f('u_contrast', params.contrast);
        set1f('u_highlights', params.highlights);
        set1f('u_shadows', params.shadows);
        set1f('u_temperature', params.temperature);
        set1f('u_tint', params.tint);
        set1f('u_saturation', params.saturation);
        set1f('u_fade', params.fade);
        set1f('u_grain', params.grain);
        set1f('u_bloom', params.bloom);
        set1f('u_clarity', params.clarity);
        set1f('u_shadowHue', filterId === 'cold_cinema' ? 210 : 0);
        set1f('u_highlightHue', filterId === 'warm_cinema' ? 35 : 0);

        gl.drawArrays(gl.TRIANGLES, 0, 6);

        if (targetCanvas && targetCanvas !== this.canvas) {
          const targetCtx = targetCanvas.getContext('2d');
          if (targetCtx) {
            targetCtx.drawImage(this.canvas, 0, 0);
          }
        }

        return targetCanvas || this.canvas;
      }
    }

    return (targetCanvas || this.canvas || {}) as HTMLCanvasElement;
  }
}
