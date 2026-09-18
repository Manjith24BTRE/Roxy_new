// src/components/editor-main-screen/tools/filters/engines/monochrome/monochromeShader.ts

export const MONO_VERTEX_SHADER_SOURCE = `
attribute vec2 a_position;
attribute vec2 a_texCoord;
varying vec2 v_texCoord;

void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
    // Invert Y for webgl texture orientation
    v_texCoord = vec2(a_texCoord.x, 1.0 - a_texCoord.y);
}
`;

export const MONO_FRAGMENT_SHADER_SOURCE = `
precision mediump float;

varying vec2 v_texCoord;
uniform sampler2D u_image;
uniform float u_intensity; // 0.0 (original) to 1.0 (100% monochrome engine)

// Monochrome Uniforms
uniform float u_redChannelWeight;
uniform float u_greenChannelWeight;
uniform float u_blueChannelWeight;
uniform float u_contrast;
uniform float u_brightness;
uniform float u_blackPoint;
uniform float u_whitePoint;
uniform float u_gamma;
uniform float u_highlights;
uniform float u_shadows;
uniform float u_fade;
uniform float u_grain;
uniform float u_vignette;
uniform float u_warmth;
uniform vec3  u_highlightTint;
uniform vec3  u_shadowTint;
uniform float u_time;

// Pseudo-random noise helper
float rand(vec2 co) {
    return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
}

void main() {
    vec2 uv = v_texCoord;
    vec3 origRgb = texture2D(u_image, uv).rgb;
    vec3 rgb = origRgb;

    // 1. Channel-Weighted Luminance Conversion
    vec3 weights = vec3(u_redChannelWeight, u_greenChannelWeight, u_blueChannelWeight);
    float weightSum = weights.r + weights.g + weights.b;
    if (weightSum > 0.0) {
        weights /= weightSum;
    } else {
        weights = vec3(0.2126, 0.7152, 0.0722);
    }
    float monoLuma = dot(rgb, weights);
    vec3 monoColor = vec3(monoLuma);

    // 2. Brightness Adjustment
    monoColor += vec3(u_brightness);

    // 3. Contrast Adjustment
    monoColor = (monoColor - 0.5) * (1.0 + u_contrast) + 0.5;

    // 4. Gamma Correction
    if (u_gamma > 0.0 && u_gamma != 1.0) {
        monoColor = pow(clamp(monoColor, 0.0, 1.0), vec3(1.0 / u_gamma));
    }

    // 5. Highlights, Shadows, Black Point & White Point
    float luma = dot(monoColor, vec3(0.3333));
    float shadowMask = clamp(1.0 - luma * 2.0, 0.0, 1.0);
    float highlightMask = clamp((luma - 0.5) * 2.0, 0.0, 1.0);

    monoColor += vec3(u_shadows * shadowMask * 0.3);
    monoColor += vec3(u_highlights * highlightMask * 0.3);

    // Black Point lift/clipping
    if (u_blackPoint > 0.0) {
        monoColor = max(monoColor, vec3(u_blackPoint * 0.25));
    }

    // White Point compression
    if (u_whitePoint > 0.0) {
        monoColor = min(monoColor, vec3(1.0 - u_whitePoint * 0.2));
    }

    // 6. Matte Film Fade
    if (u_fade > 0.0) {
        monoColor = mix(monoColor, vec3(0.14), u_fade * (1.0 - luma));
    }

    // 7. Warmth & Split Tinting (Platinum / Selenium / Sepia)
    if (u_warmth != 0.0) {
        vec3 tintFactor = vec3(1.0 + u_warmth * 0.15, 1.0 + u_warmth * 0.05, 1.0 - u_warmth * 0.15);
        monoColor *= tintFactor;
    }

    if (length(u_highlightTint) > 0.0) {
        monoColor = mix(monoColor, monoColor * u_highlightTint, highlightMask * 0.35);
    }

    if (length(u_shadowTint) > 0.0) {
        monoColor = mix(monoColor, monoColor * u_shadowTint, shadowMask * 0.35);
    }

    // 8. Procedural Film Grain
    if (u_grain > 0.0) {
        float noise = (rand(uv * 120.0 + vec2(u_time * 0.01)) - 0.5) * u_grain * 0.18;
        monoColor += vec3(noise);
    }

    // 9. Radial Vignette Darkening
    if (u_vignette > 0.0) {
        vec2 centerDist = uv - vec2(0.5);
        float len = length(centerDist);
        float vigFactor = smoothstep(0.4, 0.85, len) * u_vignette;
        monoColor = mix(monoColor, monoColor * 0.15, vigFactor);
    }

    // Clamp final monochrome output
    monoColor = clamp(monoColor, 0.0, 1.0);

    // Interpolate according to engine intensity (0.0 = base image, 1.0 = full monochrome)
    gl_FragColor = vec4(mix(origRgb, monoColor, u_intensity), texture2D(u_image, uv).a);
}
`;
