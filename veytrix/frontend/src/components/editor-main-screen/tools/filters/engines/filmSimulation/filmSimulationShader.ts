// src/components/editor-main-screen/tools/filters/engines/filmSimulation/filmSimulationShader.ts

export const FILM_VERTEX_SHADER_SOURCE = `
attribute vec2 a_position;
attribute vec2 a_texCoord;
varying vec2 v_texCoord;

void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
    // Invert Y for webgl texture orientation
    v_texCoord = vec2(a_texCoord.x, 1.0 - a_texCoord.y);
}
`;

export const FILM_FRAGMENT_SHADER_SOURCE = `
precision mediump float;

varying vec2 v_texCoord;
uniform sampler2D u_image;
uniform float u_intensity; // 0.0 (original) to 1.0 (100% film simulation)

// Film Simulation Parameters
uniform float u_colorTemperature;
uniform float u_colorTint;
uniform float u_contrast;
uniform float u_blackLift;
uniform float u_highlightRolloff;
uniform float u_saturation;
uniform float u_fade;
uniform float u_filmGrain;
uniform float u_fineGrain;
uniform float u_vignette;
uniform vec3  u_highlightTint;
uniform vec3  u_shadowTint;
uniform float u_halationGlow;
uniform float u_sepiaMix;
uniform float u_vhsAberration;
uniform float u_filmFlicker;
uniform float u_time;

// Pseudo-random noise helper
float rand(vec2 co) {
    return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
}

void main() {
    vec2 uv = v_texCoord;
    vec3 origRgb = texture2D(u_image, uv).rgb;
    vec3 rgb = origRgb;

    // 1. VHS Chromatic Aberration & Scanline Offset
    if (u_vhsAberration > 0.0) {
        float shift = u_vhsAberration * 0.008;
        float r = texture2D(u_image, uv + vec2(shift, 0.0)).r;
        float g = texture2D(u_image, uv).g;
        float b = texture2D(u_image, uv - vec2(shift, 0.0)).b;
        rgb = vec3(r, g, b);

        // Subtle horizontal scanline artifact
        float scanline = sin(uv.y * 400.0) * 0.04 * u_vhsAberration;
        rgb -= scanline;
    }

    // 2. Color Temperature & Tint Adjustment
    vec3 tempColor = vec3(
        1.0 + u_colorTemperature * 0.22,
        1.0 - u_colorTint * 0.12,
        1.0 - u_colorTemperature * 0.22
    );
    rgb *= tempColor;

    // 3. Sepia Monochromatic Tinting
    if (u_sepiaMix > 0.0) {
        float luma = dot(rgb, vec3(0.2126, 0.7152, 0.0722));
        vec3 sepiaColor = vec3(
            luma * 1.2,
            luma * 0.95,
            luma * 0.75
        );
        rgb = mix(rgb, sepiaColor, u_sepiaMix);
    }

    // 4. Split Toning (Highlights & Shadows Tint)
    float luma = dot(rgb, vec3(0.2126, 0.7152, 0.0722));
    float shadowMask = clamp(1.0 - luma * 2.0, 0.0, 1.0);
    float highlightMask = clamp((luma - 0.5) * 2.0, 0.0, 1.0);

    if (length(u_highlightTint) > 0.0) {
        rgb = mix(rgb, rgb * u_highlightTint, highlightMask * 0.35);
    }
    if (length(u_shadowTint) > 0.0) {
        rgb = mix(rgb, rgb * u_shadowTint, shadowMask * 0.35);
    }

    // 5. Contrast & Tone Curve (Black Lift & Highlight Rolloff)
    rgb = (rgb - 0.5) * (1.0 + u_contrast) + 0.5;

    // Black Lift curve (matte film shadow lift)
    if (u_blackLift > 0.0) {
        float lift = u_blackLift * 0.20;
        rgb = max(rgb, vec3(lift * (1.0 - luma)));
    }

    // Highlight Rolloff curve (soft film highlight compression)
    if (u_highlightRolloff > 0.0) {
        rgb = mix(rgb, 1.0 - exp(-rgb * (1.0 + u_highlightRolloff * 0.5)), u_highlightRolloff * 0.4);
    }

    // 6. Matte Film Fade
    if (u_fade > 0.0) {
        rgb = mix(rgb, vec3(0.12, 0.11, 0.14), u_fade * (1.0 - luma));
    }

    // 7. Halation Glow & Bloom
    if (u_halationGlow > 0.0) {
        vec3 halationColor = mix(rgb, vec3(1.0, 0.4, 0.2), u_halationGlow * highlightMask * 0.4);
        rgb = mix(rgb, halationColor, u_halationGlow * 0.3);
    }

    // 8. Saturation
    luma = dot(rgb, vec3(0.2126, 0.7152, 0.0722));
    rgb = mix(vec3(luma), rgb, 1.0 + u_saturation);

    // 9. Film Grain & Fine Grain (Procedural Silver Halide Noise)
    float grainVal = 0.0;
    if (u_filmGrain > 0.0) {
        float grainNoise = rand(uv * 100.0 + vec2(u_time * 0.01));
        grainVal += (grainNoise - 0.5) * u_filmGrain * 0.16;
    }
    if (u_fineGrain > 0.0) {
        float fineNoise = rand(uv * 250.0 + vec2(u_time * 0.02 + 1.234));
        grainVal += (fineNoise - 0.5) * u_fineGrain * 0.08;
    }
    rgb += grainVal;

    // 10. Film Flicker (Luminance Instability)
    if (u_filmFlicker > 0.0) {
        float flicker = (rand(vec2(u_time * 0.05, 0.5)) - 0.5) * u_filmFlicker * 0.06;
        rgb += flicker;
    }

    // 11. Vignette (Lens Radial Light Falloff)
    if (u_vignette > 0.0) {
        vec2 centerDist = uv - vec2(0.5);
        float len = length(centerDist);
        float vigFactor = smoothstep(0.4, 0.85, len) * u_vignette;
        rgb = mix(rgb, rgb * 0.2, vigFactor);
    }

    // Clamp final output
    rgb = clamp(rgb, 0.0, 1.0);

    // Blend according to engine intensity (0.0 = original, 1.0 = fully simulated)
    gl_FragColor = vec4(mix(origRgb, rgb, u_intensity), color.a);
}
`;
