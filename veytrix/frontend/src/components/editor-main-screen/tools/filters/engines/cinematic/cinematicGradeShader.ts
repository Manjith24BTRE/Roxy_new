// src/components/editor-main-screen/tools/filters/engines/cinematic/cinematicGradeShader.ts

export const VERTEX_SHADER_SOURCE = `
attribute vec2 a_position;
attribute vec2 a_texCoord;
varying vec2 v_texCoord;

void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
    // Invert Y for webgl texture orientation
    v_texCoord = vec2(a_texCoord.x, 1.0 - a_texCoord.y);
}
`;

export const FRAGMENT_SHADER_SOURCE = `
precision mediump float;

varying vec2 v_texCoord;
uniform sampler2D u_image;
uniform float u_intensity; // 0.0 (original) to 1.0 (100% effect)

// Cinematic Parameter Uniforms
uniform float u_exposure;
uniform float u_contrast;
uniform float u_brightness;
uniform float u_saturation;
uniform float u_temperature;
uniform float u_tint;
uniform float u_highlights;
uniform float u_shadows;
uniform float u_blacks;
uniform float u_whites;
uniform float u_fade;
uniform float u_vibrance;
uniform float u_clarity;
uniform float u_grain;
uniform float u_vignette;
uniform float u_highlightHue; // 0..360
uniform float u_shadowHue;    // 0..360
uniform float u_colorBalance;
uniform float u_glow;

vec3 hsv2rgb(vec3 c) {
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

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

    // 2. Temperature & Tint adjustment
    vec3 tempColor = vec3(1.0 + u_temperature * 0.25, 1.0 - u_tint * 0.15, 1.0 - u_temperature * 0.25);
    rgb *= tempColor;

    // 3. Luminance & Contrast
    float luma = dot(rgb, vec3(0.2126, 0.7152, 0.0722));
    rgb = (rgb - 0.5) * (1.0 + u_contrast) + 0.5;

    // 4. Clarity (Midtone contrast)
    if (u_clarity != 0.0) {
        float midtoneMask = 1.0 - abs(luma - 0.5) * 2.0;
        rgb += (rgb - luma) * u_clarity * midtoneMask;
    }

    // 5. Shadows / Highlights / Blacks / Whites
    luma = dot(rgb, vec3(0.2126, 0.7152, 0.0722));
    float shadowMask = clamp(1.0 - luma * 2.0, 0.0, 1.0);
    float highlightMask = clamp((luma - 0.5) * 2.0, 0.0, 1.0);

    rgb += vec3(u_shadows * shadowMask * 0.3);
    rgb += vec3(u_highlights * highlightMask * 0.3);
    rgb += vec3(u_blacks * pow(1.0 - luma, 3.0) * 0.2);
    rgb += vec3(u_whites * pow(luma, 3.0) * 0.2);

    // 6. Lifted Blacks (Film Fade)
    if (u_fade > 0.0) {
        rgb = mix(rgb, vec3(0.12, 0.11, 0.13), u_fade * (1.0 - luma));
    }

    // 7. Split Toning
    if (u_shadowHue > 0.0) {
        vec3 sColor = hsv2rgb(vec3(u_shadowHue / 360.0, 0.4, 1.0));
        rgb = mix(rgb, rgb * sColor, shadowMask * 0.45);
    }
    if (u_highlightHue > 0.0) {
        vec3 hColor = hsv2rgb(vec3(u_highlightHue / 360.0, 0.3, 1.0));
        rgb = mix(rgb, mix(rgb, hColor, 0.25), highlightMask * 0.35);
    }

    // 8. Saturation & Vibrance
    luma = dot(rgb, vec3(0.2126, 0.7152, 0.0722));
    rgb = mix(vec3(luma), rgb, 1.0 + u_saturation);

    if (u_vibrance != 0.0) {
        float maxChannel = max(rgb.r, max(rgb.g, rgb.b));
        float satAmt = (maxChannel - luma) / (maxChannel + 0.001);
        float vibranceFactor = (1.0 - satAmt) * u_vibrance;
        rgb = mix(vec3(luma), rgb, 1.0 + vibranceFactor);
    }

    // 9. Vignette
    if (u_vignette > 0.0) {
        vec2 uv = v_texCoord - 0.5;
        float dist = length(uv);
        float vign = smoothstep(0.7, 0.3, dist * (1.0 + u_vignette * 0.8));
        rgb *= vign;
    }

    // 10. Film Grain
    if (u_grain > 0.0) {
        float noise = (rand(v_texCoord * 500.0) - 0.5) * u_grain * 0.15;
        rgb += vec3(noise);
    }

    rgb = clamp(rgb, 0.0, 1.0);

    // 11. Global Intensity Blend (0.0 = original, 1.0 = 100% graded)
    vec3 finalRgb = mix(origRgb, rgb, clamp(u_intensity, 0.0, 1.0));

    gl_FragColor = vec4(finalRgb, color.a);
}
`;
