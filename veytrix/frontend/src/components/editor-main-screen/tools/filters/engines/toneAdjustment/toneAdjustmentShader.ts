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

vec3 rgb2hsv(vec3 c) {
    vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
    vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
    vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));

    float d = q.x - min(q.w, q.y);
    float e = 1.0e-10;
    return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
}

vec3 hsv2rgb(vec3 c) {
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

void main() {
    vec4 color = texture2D(u_image, v_texCoord);
    vec3 origRgb = color.rgb;
    vec3 rgb = color.rgb;

    // 1. Exposure & Brightness Module
    rgb *= pow(2.0, u_exposure);
    rgb += vec3(u_brightness);

    // 2. Temperature & Tint
    vec3 tempColor = vec3(1.0 + u_temperature * 0.25, 1.0 - u_tint * 0.15, 1.0 - u_temperature * 0.25);
    rgb *= tempColor;

    // 3. S-Curve Contrast & Midtone Preservation
    float luma = dot(rgb, vec3(0.2126, 0.7152, 0.0722));
    float midtoneProtect = 1.0 - smoothstep(0.25, 0.45, luma) * (1.0 - smoothstep(0.55, 0.75, luma)) * 0.35;
    rgb = (rgb - 0.5) * (1.0 + u_contrast * midtoneProtect) + 0.5;

    // 4. Shadow Depth & Highlight Control Modules (Prevent shadow clipping & highlight blowout)
    luma = dot(rgb, vec3(0.2126, 0.7152, 0.0722));
    float shadowMask = clamp((0.5 - luma) * 2.0, 0.0, 1.0);
    float highlightMask = clamp((luma - 0.5) * 2.0, 0.0, 1.0);

    // Apply shadow depth (-12%) with toe protection to prevent crushed black detail
    float shadowToe = smoothstep(0.02, 0.18, luma);
    rgb += vec3(u_shadows * shadowMask * shadowToe * 0.35);

    // Apply highlight recovery (-6%) to protect windows, skies, and reflections
    rgb += vec3(u_highlights * highlightMask * 0.35);

    // 5. Selective Color Luminance & Social Media Boost Engine
    vec3 hsv = rgb2hsv(clamp(rgb, 0.0, 1.0));
    float hueDeg = hsv.x * 360.0;

    // Detect Sky Blues (190° - 240°), Green Foliage (80° - 150°), Cyan (160° - 190°), Orange (20° - 45°)
    float isBlue = smoothstep(180.0, 200.0, hueDeg) * (1.0 - smoothstep(235.0, 250.0, hueDeg));
    float isGreen = smoothstep(75.0, 95.0, hueDeg) * (1.0 - smoothstep(145.0, 160.0, hueDeg));
    float isCyan = smoothstep(155.0, 165.0, hueDeg) * (1.0 - smoothstep(185.0, 195.0, hueDeg));
    float isOrange = smoothstep(15.0, 25.0, hueDeg) * (1.0 - smoothstep(45.0, 55.0, hueDeg));

    // Selective Luminance Boost
    hsv.z += (isBlue * 0.08 + isGreen * 0.07 + isCyan * 0.06 + isOrange * 0.04) * clamp(u_intensity, 0.0, 1.0);

    // 6. Skin Protection Module (Shield skin range 15° to 50° from excessive contrast / discoloration)
    float isSkin = smoothstep(10.0, 20.0, hueDeg) * (1.0 - smoothstep(48.0, 58.0, hueDeg)) * smoothstep(0.15, 0.4, hsv.y);
    float satBoost = u_saturation * (1.0 - isSkin * 0.75);
    float vibranceBoost = u_vibrance * (1.0 - isSkin * 0.65);

    hsv.y = clamp(hsv.y * (1.0 + satBoost), 0.0, 1.0);
    if (vibranceBoost > 0.0) {
        float satFactor = (1.0 - hsv.y) * vibranceBoost;
        hsv.y = clamp(hsv.y + satFactor * 0.5, 0.0, 1.0);
    }
    rgb = hsv2rgb(hsv);

    // 7. White Cleanup (Clean walls, shirts, products for social/tone content)
    luma = dot(rgb, vec3(0.2126, 0.7152, 0.0722));
    float isWhite = smoothstep(0.7, 0.95, luma) * (1.0 - smoothstep(0.0, 0.25, hsv.y));
    rgb += vec3(isWhite * 0.02);

    rgb = clamp(rgb, 0.0, 1.0);

    // 8. Intensity Blend
    vec3 finalRgb = mix(origRgb, rgb, clamp(u_intensity, 0.0, 1.0));

    gl_FragColor = vec4(finalRgb, color.a);
}
`;
