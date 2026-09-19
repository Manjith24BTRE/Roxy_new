// src/components/editor-main-screen/tools/filters/engines/cinematic/CinematicFilterModules.ts

/**
 * GLSL Processing Modules for Modular Filter Engine
 * Each module performs a single, highly specialized color transformation step in GLSL.
 */

export const VERTEX_SHADER_SOURCE = `
attribute vec2 a_position;
attribute vec2 a_texCoord;
varying vec2 v_texCoord;

void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
    v_texCoord = vec2(a_texCoord.x, 1.0 - a_texCoord.y);
}
`;

export const COMMON_UNIFORMS_AND_HELPERS = `
precision mediump float;

varying vec2 v_texCoord;
uniform sampler2D u_image;
uniform float u_intensity; // 0.0 to 1.0
uniform float u_time;      // Animated time in seconds for dynamic frame grain
uniform vec2 u_resolution; // Viewport resolution (width, height)

// Core Parameter Uniforms
uniform float u_exposure;
uniform float u_contrast;
uniform float u_highlights;
uniform float u_shadows;
uniform float u_temperature;
uniform float u_tint;
uniform float u_saturation;
uniform float u_fade;
uniform float u_grain;
uniform float u_bloom;
uniform float u_clarity;
uniform float u_shadowHue;
uniform float u_highlightHue;

vec3 hsv2rgb(vec3 c) {
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

// Frame-Randomized Noise Generator (Time-based seed + spatial coordinate)
float rand(vec2 co, float time) {
    return fract(sin(dot(co.xy + vec2(time * 0.071, time * 0.133), vec2(12.9898, 78.233))) * 43758.5453);
}

// Skin protection band test (15° to 50° Hue range)
float isSkinHue(vec3 rgb) {
    float maxC = max(rgb.r, max(rgb.g, rgb.b));
    float minC = min(rgb.r, min(rgb.g, rgb.b));
    float delta = maxC - minC;
    if (delta < 0.05) return 0.0;
    
    float hue = 0.0;
    if (maxC == rgb.r) {
        hue = mod((rgb.g - rgb.b) / delta, 6.0);
    } else if (maxC == rgb.g) {
        hue = (rgb.b - rgb.r) / delta + 2.0;
    } else {
        hue = (rgb.r - rgb.g) / delta + 4.0;
    }
    hue *= 60.0;
    if (hue < 0.0) hue += 360.0;
    
    // Skin band: 15° to 50°
    if (hue >= 15.0 && hue <= 50.0) {
        return smoothstep(10.0, 20.0, hue) * (1.0 - smoothstep(45.0, 55.0, hue));
    }
    return 0.0;
}
`;

// 1. Exposure Module
export const MODULE_EXPOSURE = `
vec3 applyExposure(vec3 rgb, float expVal) {
    return rgb * pow(2.0, expVal * 0.04);
}
`;

// 2. White Balance Module
export const MODULE_WHITE_BALANCE = `
vec3 applyWhiteBalance(vec3 rgb, float tempVal, float tintVal) {
    vec3 tempColor = vec3(1.0 + tempVal * 0.02, 1.0 - tintVal * 0.015, 1.0 - tempVal * 0.02);
    return rgb * tempColor;
}
`;

// 3. Contrast Curve Module
export const MODULE_CONTRAST_CURVE = `
vec3 applyContrastCurve(vec3 rgb, float contrastVal) {
    float factor = 1.0 + contrastVal * 0.01;
    return (rgb - 0.5) * factor + 0.5;
}
`;

// 4. Highlight Roll-Off Module
export const MODULE_HIGHLIGHT_ROLLOFF = `
vec3 applyHighlightRolloff(vec3 rgb, float hlVal) {
    float luma = dot(rgb, vec3(0.2126, 0.7152, 0.0722));
    float hlMask = clamp((luma - 0.5) * 2.0, 0.0, 1.0);
    // Smooth cinematic rolloff
    return rgb + vec3(hlVal * 0.008 * hlMask * (1.0 - pow(luma, 2.0)));
}
`;

// 5. Shadow Compression Module
export const MODULE_SHADOW_COMPRESSION = `
vec3 applyShadowCompression(vec3 rgb, float shVal) {
    float luma = dot(rgb, vec3(0.2126, 0.7152, 0.0722));
    float shMask = clamp(1.0 - luma * 2.0, 0.0, 1.0);
    return rgb + vec3(shVal * 0.008 * shMask);
}
`;

// 6. Split Tone Module
export const MODULE_SPLIT_TONE = `
vec3 applySplitTone(vec3 rgb, float sHue, float hHue) {
    float luma = dot(rgb, vec3(0.2126, 0.7152, 0.0722));
    float shMask = clamp(1.0 - luma * 2.0, 0.0, 1.0);
    float hlMask = clamp((luma - 0.5) * 2.0, 0.0, 1.0);
    
    if (sHue > 0.0) {
        vec3 sColor = hsv2rgb(vec3(sHue / 360.0, 0.45, 1.0));
        rgb = mix(rgb, rgb * sColor, shMask * 0.35);
    }
    if (hHue > 0.0) {
        vec3 hColor = hsv2rgb(vec3(hHue / 360.0, 0.35, 1.0));
        rgb = mix(rgb, mix(rgb, hColor, 0.25), hlMask * 0.30);
    }
    return rgb;
}
`;

// 7. Bloom Module
export const MODULE_BLOOM = `
vec3 applyBloom(vec3 rgb, float bloomVal) {
    if (bloomVal <= 0.0) return rgb;
    float luma = dot(rgb, vec3(0.2126, 0.7152, 0.0722));
    if (luma > 0.75) {
        float glowFactor = (luma - 0.75) * 4.0 * (bloomVal * 0.01);
        rgb += vec3(glowFactor * 0.25, glowFactor * 0.22, glowFactor * 0.18);
    }
    return rgb;
}
`;

// 8. Grain Module (Animated u_time, Frame-Randomized Luminance & Chroma Grain, Resolution-Aware Scaling)
export const MODULE_GRAIN = `
vec3 applyGrain(vec3 rgb, float grainVal, float time, vec2 res) {
    if (grainVal <= 0.0) return rgb;
    vec2 scale = res.x > 0.0 ? vec2(res.x / 1920.0, res.y / 1080.0) : vec2(1.0);
    vec2 uv = v_texCoord * vec2(1920.0, 1080.0) * max(vec2(0.5), scale);
    
    float lumaNoise = (rand(uv, time) - 0.5) * (grainVal * 0.008);
    float chromaNoise = (rand(uv + vec2(17.1, 31.4), time) - 0.5) * (grainVal * 0.004);
    
    rgb += vec3(lumaNoise + chromaNoise, lumaNoise, lumaNoise - chromaNoise);
    return rgb;
}
`;

// 9. Film Fade Module (Analog Toe Curve & Film Fade Curve)
export const MODULE_FILM_FADE = `
vec3 applyFilmFade(vec3 rgb, float fadeVal) {
    if (fadeVal <= 0.0) return rgb;
    float luma = dot(rgb, vec3(0.2126, 0.7152, 0.0722));
    // Soft analog film toe lift
    vec3 filmMatte = vec3(0.08, 0.075, 0.07);
    return mix(rgb, max(rgb, filmMatte), (fadeVal * 0.02) * (1.0 - pow(luma, 1.5)));
}
`;

// 10. Kodak Color Module (Kodak 1970s / Super 8 Analog Color Response)
export const MODULE_KODAK_COLOR = `
vec3 applyKodakColor(vec3 rgb) {
    // Olive greens shift, cyan blues, rich muted reds
    vec3 color = rgb;
    color.r = mix(color.r, color.r * 1.05 + 0.02, 0.3);
    color.g = mix(color.g, color.g * 0.95 + color.r * 0.04, 0.25);
    color.b = mix(color.b, color.b * 0.88 + color.g * 0.05, 0.35);
    return color;
}
`;

// 11. Pastel Color Module
export const MODULE_PASTEL_COLOR = `
vec3 applyPastelColor(vec3 rgb, float satVal) {
    float luma = dot(rgb, vec3(0.2126, 0.7152, 0.0722));
    vec3 pastel = mix(vec3(luma), rgb, 1.0 + satVal * 0.01);
    // Soften primary greens and blues toward soft pastel tones
    pastel.g = mix(pastel.g, luma * 0.2 + pastel.g * 0.8, 0.15);
    pastel.b = mix(pastel.b, luma * 0.15 + pastel.b * 0.85, 0.15);
    return pastel;
}
`;

// 12. Clarity Module
export const MODULE_CLARITY = `
vec3 applyClarity(vec3 rgb, float clarityVal) {
    if (clarityVal == 0.0) return rgb;
    float luma = dot(rgb, vec3(0.2126, 0.7152, 0.0722));
    float midtoneMask = 1.0 - abs(luma - 0.5) * 2.0;
    return rgb + (rgb - luma) * (clarityVal * 0.01) * midtoneMask;
}
`;

// 13. Skin Protection Module
export const MODULE_SKIN_PROTECTION = `
vec3 applySkinProtection(vec3 originalRgb, vec3 processedRgb) {
    float skinWeight = isSkinHue(originalRgb);
    if (skinWeight > 0.0) {
        // Protect natural skin warmth and tone by blending back original color on skin
        vec3 protectedRgb = mix(originalRgb, originalRgb * vec3(1.02, 0.99, 0.96), 0.5);
        return mix(processedRgb, protectedRgb, skinWeight * 0.7);
    }
    return processedRgb;
}
`;

// 14. Film Density Module
export const MODULE_FILM_DENSITY = `
vec3 applyFilmDensity(vec3 rgb) {
    float luma = dot(rgb, vec3(0.2126, 0.7152, 0.0722));
    // Enrich dark reds, dark greens, and dark browns
    vec3 densityShift = pow(rgb, vec3(1.08, 1.05, 1.06));
    return mix(rgb, densityShift, (1.0 - luma) * 0.4);
}
`;

// 15. Atmospheric Depth Module
export const MODULE_ATMOSPHERIC_DEPTH = `
vec3 applyAtmosphericDepth(vec3 rgb) {
    float luma = dot(rgb, vec3(0.2126, 0.7152, 0.0722));
    // Soft cool background depth shift for distant shadows
    vec3 depthColor = rgb * vec3(0.96, 0.98, 1.02);
    return mix(rgb, depthColor, (1.0 - luma) * 0.25);
}
`;

// 16. HDR Tone Mapping Module (Compresses 90%-100%, lifts 10%-40%, preserves 40%-90%)
export const MODULE_HDR_TONE_MAPPING = `
vec3 applyHDRToneMapping(vec3 rgb, float hlVal, float shVal) {
    float luma = dot(rgb, vec3(0.2126, 0.7152, 0.0722));
    
    // Lift 10%-40% shadow zone
    if (luma < 0.40) {
        float shadowLift = (0.40 - luma) * (shVal * 0.012);
        rgb += vec3(shadowLift * 0.85, shadowLift * 0.90, shadowLift * 0.95);
    }
    
    // Compress 90%-100% highlight zone smoothly (prevent clipping / halos)
    if (luma > 0.90) {
        float hlCompress = (luma - 0.90) * (Math.abs(hlVal) * 0.015);
        rgb -= vec3(hlCompress);
    }
    
    return rgb;
}
`;

// 17. HDR Color Science Module (Selective luminance boost on blues, greens, cyans +5%, warm +3%)
export const MODULE_HDR_COLOR_SCIENCE = `
vec3 applyHDRColorScience(vec3 rgb, float satVal) {
    vec3 color = mix(vec3(dot(rgb, vec3(0.2126, 0.7152, 0.0722))), rgb, 1.0 + satVal * 0.01);
    
    // Selective sky (blue/cyan) & landscape (green) luminance boost
    float blueWeight = smoothstep(0.4, 0.8, color.b) * (1.0 - smoothstep(0.7, 1.0, color.r));
    float greenWeight = smoothstep(0.4, 0.8, color.g) * (1.0 - smoothstep(0.7, 1.0, color.r));
    
    color.b += blueWeight * 0.05;
    color.g += greenWeight * 0.05;
    color.r += (1.0 - blueWeight - greenWeight) * 0.03;
    
    return color;
}
`;
