// src/components/editor-main-screen/tools/filters/engines/toneAdjustment/toneAdjustmentShader.ts

export const TONE_VERTEX_SHADER_SOURCE = `
attribute vec2 a_position;
attribute vec2 a_texCoord;
varying vec2 v_texCoord;

void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
    // Invert Y for webgl texture orientation
    v_texCoord = vec2(a_texCoord.x, 1.0 - a_texCoord.y);
}
`;

export const TONE_FRAGMENT_SHADER_SOURCE = `
precision mediump float;

varying vec2 v_texCoord;
uniform sampler2D u_image;
uniform float u_intensity; // 0.0 (original) to 1.0 (100% tone preset)

// Tone Adjustment Uniforms
uniform float u_exposure;
uniform float u_brightness;
uniform float u_contrast;
uniform float u_highlights;
uniform float u_shadows;
uniform float u_whites;
uniform float u_blacks;
uniform float u_gamma;
uniform float u_midtones;
uniform float u_temperature;
uniform float u_tint;
uniform float u_vibrance;
uniform float u_saturation;
uniform float u_fade;
uniform float u_vignette;
uniform float u_glow;

float rand(vec2 co) {
    return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

void main() {
    vec4 color = texture2D(u_image, v_texCoord);
    vec3 origRgb = color.rgb;
    vec3 rgb = color.rgb;

    // 1. Exposure & Brightness
    rgb *= pow(2.0, u_exposure);
    rgb += vec3(u_brightness);

    // 2. Temperature & Tint
    vec3 tempColor = vec3(1.0 + u_temperature * 0.25, 1.0 - u_tint * 0.15, 1.0 - u_temperature * 0.25);
    rgb *= tempColor;

    // 3. Contrast & Midtone Gain
    float luma = dot(rgb, vec3(0.2126, 0.7152, 0.0722));
    rgb = (rgb - 0.5) * (1.0 + u_contrast) + 0.5;

    if (u_midtones != 0.0) {
        float midtoneMask = 1.0 - abs(luma - 0.5) * 2.0;
        rgb += vec3(u_midtones * midtoneMask * 0.2);
    }

    // 4. Gamma Correction
    if (u_gamma > 0.0 && u_gamma != 1.0) {
        rgb = pow(clamp(rgb, 0.0, 1.0), vec3(1.0 / u_gamma));
    }

    // 5. Highlights, Shadows, Blacks, Whites
    luma = dot(rgb, vec3(0.2126, 0.7152, 0.0722));
    float shadowMask = clamp(1.0 - luma * 2.0, 0.0, 1.0);
    float highlightMask = clamp((luma - 0.5) * 2.0, 0.0, 1.0);

    rgb += vec3(u_shadows * shadowMask * 0.35);
    rgb += vec3(u_highlights * highlightMask * 0.35);
    rgb += vec3(u_blacks * pow(1.0 - luma, 3.0) * 0.25);
    rgb += vec3(u_whites * pow(luma, 3.0) * 0.25);

    // 6. Matte / Lifted Blacks Fade
    if (u_fade > 0.0) {
        rgb = mix(rgb, vec3(0.14, 0.13, 0.15), u_fade * (1.0 - luma));
    }

    // 7. Saturation & Vibrance
    luma = dot(rgb, vec3(0.2126, 0.7152, 0.0722));
    rgb = mix(vec3(luma), rgb, 1.0 + u_saturation);

    if (u_vibrance != 0.0) {
        float maxChannel = max(rgb.r, max(rgb.g, rgb.b));
        float satAmt = (maxChannel - luma) / (maxChannel + 0.001);
        float vibranceFactor = (1.0 - satAmt) * u_vibrance;
        rgb = mix(vec3(luma), rgb, 1.0 + vibranceFactor);
    }

    // 8. Glow / Bloom Softening
    if (u_glow > 0.0) {
        vec3 glowColor = mix(rgb, vec3(1.0, 0.92, 0.8), u_glow * highlightMask);
        rgb = mix(rgb, glowColor, u_glow * 0.4);
    }

    // 9. Vignette
    if (u_vignette > 0.0) {
        vec2 uv = v_texCoord - 0.5;
        float dist = length(uv);
        float vign = smoothstep(0.7, 0.3, dist * (1.0 + u_vignette * 0.8));
        rgb *= vign;
    }

    rgb = clamp(rgb, 0.0, 1.0);

    // 10. Intensity Lerp Blend (0.0 = original, 1.0 = 100% tone preset)
    vec3 finalRgb = mix(origRgb, rgb, clamp(u_intensity, 0.0, 1.0));

    gl_FragColor = vec4(finalRgb, color.a);
}
`;
