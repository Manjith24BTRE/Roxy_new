// src/components/editor-main-screen/tools/filters/engines/neonGrade/neonGradeShader.ts

export const NEON_VERTEX_SHADER_SOURCE = `
attribute vec2 a_position;
attribute vec2 a_texCoord;
varying vec2 v_texCoord;

void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
    // Invert Y for webgl texture orientation
    v_texCoord = vec2(a_texCoord.x, 1.0 - a_texCoord.y);
}
`;

export const NEON_FRAGMENT_SHADER_SOURCE = `
precision mediump float;

varying vec2 v_texCoord;
uniform sampler2D u_image;
uniform float u_intensity; // 0.0 (original) to 1.0 (100% neon grade)

// Neon Uniforms
uniform float u_cyanElectricBoost;
uniform float u_magentaPinkBoost;
uniform float u_purpleVioletBoost;
uniform vec3  u_highlightTint;
uniform vec3  u_shadowTint;
uniform float u_neonGlowIntensity;
uniform float u_chromaticOffset;
uniform float u_contrast;
uniform float u_brightness;
uniform float u_blackPoint;
uniform float u_saturation;
uniform float u_vignette;

// Helper: RGB to HSV
vec3 rgb2hsv(vec3 c) {
    vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
    vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
    vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));

    float d = q.x - min(q.w, q.y);
    float e = 1.0e-10;
    return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
}

// Helper: HSV to RGB
vec3 hsv2rgb(vec3 c) {
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

void main() {
    vec2 uv = v_texCoord;
    vec3 origRgb = texture2D(u_image, uv).rgb;
    vec3 rgb = origRgb;

    // 1. Chromatic Offset / Channel Separation
    if (u_chromaticOffset > 0.0) {
        float shift = u_chromaticOffset * 0.007;
        float r = texture2D(u_image, uv + vec2(shift, 0.0)).r;
        float g = texture2D(u_image, uv).g;
        float b = texture2D(u_image, uv - vec2(shift, 0.0)).b;
        rgb = vec3(r, g, b);
    }

    // 2. Selective HSV Neon Hue Boosting
    vec3 hsv = rgb2hsv(rgb);

    // Cyan/Electric Blue range (0.48..0.60)
    if (u_cyanElectricBoost > 0.0) {
        float cyanMask = smoothstep(0.44, 0.50, hsv.x) * (1.0 - smoothstep(0.60, 0.66, hsv.x));
        hsv.y = mix(hsv.y, min(1.0, hsv.y * (1.0 + u_cyanElectricBoost * 0.7)), cyanMask);
        hsv.z = mix(hsv.z, min(1.0, hsv.z * (1.0 + u_cyanElectricBoost * 0.3)), cyanMask);
    }

    // Magenta/Pink range (0.80..0.94)
    if (u_magentaPinkBoost > 0.0) {
        float magentaMask = smoothstep(0.76, 0.82, hsv.x) * (1.0 - smoothstep(0.94, 0.98, hsv.x));
        hsv.y = mix(hsv.y, min(1.0, hsv.y * (1.0 + u_magentaPinkBoost * 0.7)), magentaMask);
        hsv.z = mix(hsv.z, min(1.0, hsv.z * (1.0 + u_magentaPinkBoost * 0.3)), magentaMask);
    }

    // Purple/Violet range (0.65..0.78)
    if (u_purpleVioletBoost > 0.0) {
        float purpleMask = smoothstep(0.62, 0.68, hsv.x) * (1.0 - smoothstep(0.78, 0.84, hsv.x));
        hsv.y = mix(hsv.y, min(1.0, hsv.y * (1.0 + u_purpleVioletBoost * 0.6)), purpleMask);
    }

    rgb = hsv2rgb(hsv);

    // 3. Contrast & Brightness & Black Level
    rgb += vec3(u_brightness);
    rgb = (rgb - 0.5) * (1.0 + u_contrast) + 0.5;

    float luma = dot(rgb, vec3(0.2126, 0.7152, 0.0722));

    if (u_blackPoint > 0.0) {
        float crush = u_blackPoint * 0.20;
        rgb = max(rgb - vec3(crush * (1.0 - luma)), vec3(0.0));
    }

    // 4. Split Highlight & Shadow Tinting
    luma = dot(rgb, vec3(0.2126, 0.7152, 0.0722));
    float shadowMask = clamp(1.0 - luma * 2.0, 0.0, 1.0);
    float highlightMask = clamp((luma - 0.5) * 2.0, 0.0, 1.0);

    if (length(u_highlightTint) > 0.0) {
        rgb = mix(rgb, rgb * u_highlightTint, highlightMask * 0.45);
    }
    if (length(u_shadowTint) > 0.0) {
        rgb = mix(rgb, rgb * u_shadowTint, shadowMask * 0.45);
    }

    // 5. Luminous Neon Glow Approximation (Bright-pass diffusion)
    if (u_neonGlowIntensity > 0.0) {
        vec3 glowColor = mix(rgb, u_highlightTint + vec3(0.2), u_neonGlowIntensity * highlightMask * 0.5);
        rgb = mix(rgb, glowColor, u_neonGlowIntensity * highlightMask * 0.4);
    }

    // 6. Overall Saturation
    luma = dot(rgb, vec3(0.2126, 0.7152, 0.0722));
    rgb = mix(vec3(luma), rgb, 1.0 + u_saturation);

    // 7. Radial Vignette
    if (u_vignette > 0.0) {
        vec2 centerDist = uv - vec2(0.5);
        float len = length(centerDist);
        float vigFactor = smoothstep(0.4, 0.85, len) * u_vignette;
        rgb = mix(rgb, rgb * 0.12, vigFactor);
    }

    // Clamp final color output
    rgb = clamp(rgb, 0.0, 1.0);

    // Blend according to engine intensity (0.0 = original, 1.0 = full neon grade)
    gl_FragColor = vec4(mix(origRgb, rgb, u_intensity), texture2D(u_image, uv).a);
}
`;
