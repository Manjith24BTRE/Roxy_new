// src/components/editor-main-screen/tools/filters/engines/portraitRetouch/portraitRetouchShader.ts

export const PORTRAIT_VERTEX_SHADER_SOURCE = `
attribute vec2 a_position;
attribute vec2 a_texCoord;
varying vec2 v_texCoord;

void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
    // Invert Y for webgl texture orientation
    v_texCoord = vec2(a_texCoord.x, 1.0 - a_texCoord.y);
}
`;

export const PORTRAIT_FRAGMENT_SHADER_SOURCE = `
precision mediump float;

varying vec2 v_texCoord;
uniform sampler2D u_image;
uniform float u_intensity; // 0.0 (original) to 1.0 (100% portrait retouch)

// Portrait Retouch Uniforms
uniform float u_smooth;
uniform float u_skinToneWarmth;
uniform float u_skinToneRosy;
uniform float u_skinBrightness;
uniform float u_eyeClarity;
uniform float u_softFocus;
uniform float u_contrast;
uniform float u_highlights;
uniform float u_shadows;
uniform float u_vibrance;
uniform float u_saturation;
uniform float u_glow;
uniform float u_vignette;

// Helper to calculate skin tone likelihood mask
float getSkinMask(vec3 rgb) {
    float r = rgb.r;
    float g = rgb.g;
    float b = rgb.b;
    float maxC = max(r, max(g, b));
    float minC = min(r, min(g, b));

    // Skin color range heuristics in RGB space
    bool cond1 = (r > 0.35) && (g > 0.20) && (b > 0.15);
    bool cond2 = (r > g) && (g > b);
    bool cond3 = ((r - minC) > 0.08);

    if (cond1 && cond2 && cond3) {
        return smoothstep(0.05, 0.25, r - g);
    }
    return 0.0;
}

void main() {
    vec4 color = texture2D(u_image, v_texCoord);
    vec3 origRgb = color.rgb;
    vec3 rgb = color.rgb;

    float skinMask = getSkinMask(rgb);

    // 1. Skin Smoothing (smart blur on skin areas)
    if (u_smooth > 0.0) {
        vec2 texel = vec2(0.002, 0.002);
        vec3 avg = vec3(0.0);
        avg += texture2D(u_image, v_texCoord + vec2(-texel.x, -texel.y)).rgb;
        avg += texture2D(u_image, v_texCoord + vec2( 0.0,     -texel.y)).rgb;
        avg += texture2D(u_image, v_texCoord + vec2( texel.x, -texel.y)).rgb;
        avg += texture2D(u_image, v_texCoord + vec2(-texel.x,  0.0)).rgb;
        avg += texture2D(u_image, v_texCoord + v_texCoord * 0.0).rgb;
        avg += texture2D(u_image, v_texCoord + vec2( texel.x,  0.0)).rgb;
        avg += texture2D(u_image, v_texCoord + vec2(-texel.x,  texel.y)).rgb;
        avg += texture2D(u_image, v_texCoord + vec2( 0.0,      texel.y)).rgb;
        avg += texture2D(u_image, v_texCoord + vec2( texel.x,  texel.y)).rgb;
        avg /= 9.0;

        float smoothFactor = skinMask * u_smooth * 0.6;
        rgb = mix(rgb, avg, smoothFactor);
    }

    // 2. Skin Tone Warmth & Rosy Tinting
    if (skinMask > 0.0) {
        vec3 skinTint = vec3(1.0 + u_skinToneWarmth * 0.2, 1.0 + u_skinToneRosy * 0.1, 1.0 - u_skinToneWarmth * 0.15);
        rgb = mix(rgb, rgb * skinTint, skinMask * 0.7);
        rgb += vec3(u_skinBrightness * skinMask * 0.2);
    }

    // 3. Eye / Feature Clarity Sharpening
    if (u_eyeClarity != 0.0) {
        float nonSkinMask = 1.0 - skinMask;
        float luma = dot(rgb, vec3(0.2126, 0.7152, 0.0722));
        float midtoneMask = 1.0 - abs(luma - 0.5) * 2.0;
        rgb += (rgb - luma) * u_eyeClarity * nonSkinMask * midtoneMask * 0.4;
    }

    // 4. Soft Focus & Glamour Glow Diffusion
    if (u_softFocus > 0.0 || u_glow > 0.0) {
        float glowAmt = max(u_softFocus, u_glow);
        float luma = dot(rgb, vec3(0.2126, 0.7152, 0.0722));
        vec3 glowColor = mix(rgb, vec3(1.0, 0.95, 0.88), glowAmt * pow(luma, 1.5));
        rgb = mix(rgb, glowColor, glowAmt * 0.35);
    }

    // 5. Contrast & Luminance Curves
    float luma = dot(rgb, vec3(0.2126, 0.7152, 0.0722));
    rgb = (rgb - 0.5) * (1.0 + u_contrast) + 0.5;

    float shadowMask = clamp(1.0 - luma * 2.0, 0.0, 1.0);
    float highlightMask = clamp((luma - 0.5) * 2.0, 0.0, 1.0);

    rgb += vec3(u_shadows * shadowMask * 0.3);
    rgb += vec3(u_highlights * highlightMask * 0.3);

    // 6. Saturation & Vibrance
    luma = dot(rgb, vec3(0.2126, 0.7152, 0.0722));
    rgb = mix(vec3(luma), rgb, 1.0 + u_saturation);

    if (u_vibrance != 0.0) {
        float maxChannel = max(rgb.r, max(rgb.g, rgb.b));
        float satAmt = (maxChannel - luma) / (maxChannel + 0.001);
        float vibranceFactor = (1.0 - satAmt) * u_vibrance;
        rgb = mix(vec3(luma), rgb, 1.0 + vibranceFactor);
    }

    // 7. Vignette Framing
    if (u_vignette > 0.0) {
        vec2 uv = v_texCoord - 0.5;
        float dist = length(uv);
        float vign = smoothstep(0.7, 0.3, dist * (1.0 + u_vignette * 0.8));
        rgb *= vign;
    }

    rgb = clamp(rgb, 0.0, 1.0);

    // 8. Intensity Lerp Blend (0.0 = original, 1.0 = 100% portrait retouch)
    vec3 finalRgb = mix(origRgb, rgb, clamp(u_intensity, 0.0, 1.0));

    gl_FragColor = vec4(finalRgb, color.a);
}
`;
