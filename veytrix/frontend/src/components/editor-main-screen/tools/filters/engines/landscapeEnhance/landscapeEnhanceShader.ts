// src/components/editor-main-screen/tools/filters/engines/landscapeEnhance/landscapeEnhanceShader.ts

export const LANDSCAPE_VERTEX_SHADER_SOURCE = `
attribute vec2 a_position;
attribute vec2 a_texCoord;
varying vec2 v_texCoord;

void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
    // Invert Y for webgl texture orientation
    v_texCoord = vec2(a_texCoord.x, 1.0 - a_texCoord.y);
}
`;

export const LANDSCAPE_FRAGMENT_SHADER_SOURCE = `
precision mediump float;

varying vec2 v_texCoord;
uniform sampler2D u_image;
uniform float u_intensity; // 0.0 (original) to 1.0 (100% landscape enhance)

// Landscape Uniforms
uniform float u_foliageGreenBoost;
uniform float u_skyBlueBoost;
uniform float u_warmth;
uniform float u_vibrance;
uniform float u_saturation;
uniform float u_contrast;
uniform float u_brightness;
uniform float u_highlights;
uniform float u_shadows;
uniform float u_clarityDehaze;
uniform float u_hdrToneMap;
uniform float u_autumnShift;
uniform float u_aquaTropicalShift;
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

    // Convert to HSV for targeted color-range isolation
    vec3 hsv = rgb2hsv(rgb);

    // 1. Autumn Leaf Hue Shift (rotate green hues 0.20..0.42 toward warm yellow/amber 0.08..0.15)
    if (u_autumnShift > 0.0) {
        float greenMask = smoothstep(0.18, 0.28, hsv.x) * (1.0 - smoothstep(0.38, 0.46, hsv.x));
        hsv.x = mix(hsv.x, 0.11, greenMask * u_autumnShift * 0.85);
        hsv.y = mix(hsv.y, min(1.0, hsv.y * 1.3), greenMask * u_autumnShift * 0.4);
    }

    // 2. Tropical Aqua/Cyan Shift (rotate blue hues 0.55..0.68 toward turquoise 0.48..0.52)
    if (u_aquaTropicalShift > 0.0) {
        float blueMask = smoothstep(0.50, 0.58, hsv.x) * (1.0 - smoothstep(0.68, 0.75, hsv.x));
        hsv.x = mix(hsv.x, 0.50, blueMask * u_aquaTropicalShift * 0.7);
        hsv.y = mix(hsv.y, min(1.0, hsv.y * 1.25), blueMask * u_aquaTropicalShift * 0.5);
    }

    // 3. Foliage Green Boost (selective saturation & luminance for green channel range 0.22..0.42)
    if (u_foliageGreenBoost > 0.0) {
        float foliageMask = smoothstep(0.20, 0.28, hsv.x) * (1.0 - smoothstep(0.40, 0.46, hsv.x));
        hsv.y = mix(hsv.y, min(1.0, hsv.y * (1.0 + u_foliageGreenBoost * 0.6)), foliageMask);
        hsv.z = mix(hsv.z, hsv.z * (1.0 + u_foliageGreenBoost * 0.15), foliageMask);
    }

    // 4. Sky & Ocean Blue Boost (selective saturation for sky/water range 0.50..0.72)
    if (u_skyBlueBoost > 0.0) {
        float skyMask = smoothstep(0.48, 0.56, hsv.x) * (1.0 - smoothstep(0.70, 0.78, hsv.x));
        hsv.y = mix(hsv.y, min(1.0, hsv.y * (1.0 + u_skyBlueBoost * 0.65)), skyMask);
    }

    rgb = hsv2rgb(hsv);

    // 5. Temperature / Warmth Adjustment
    vec3 tempColor = vec3(1.0 + u_warmth * 0.22, 1.0 + u_warmth * 0.05, 1.0 - u_warmth * 0.22);
    rgb *= tempColor;

    // 6. Atmospheric Dehaze / Midtone Clarity
    float luma = dot(rgb, vec3(0.2126, 0.7152, 0.0722));
    if (u_clarityDehaze > 0.0) {
        float midtoneMask = 1.0 - abs(luma - 0.5) * 2.0;
        rgb = mix(rgb, (rgb - 0.5) * (1.0 + u_clarityDehaze * 0.35) + 0.5, midtoneMask * 0.5);
    }

    // 7. Outdoor Dynamic Range HDR Tone Mapping
    if (u_hdrToneMap > 0.0) {
        float shadowMask = clamp(1.0 - luma * 2.0, 0.0, 1.0);
        float highlightMask = clamp((luma - 0.5) * 2.0, 0.0, 1.0);
        rgb += vec3(shadowMask * u_hdrToneMap * 0.30);
        rgb -= vec3(highlightMask * u_hdrToneMap * 0.20);
    }

    // 8. Exposure / Brightness / Contrast / Shadows / Highlights
    rgb += vec3(u_brightness);
    rgb = (rgb - 0.5) * (1.0 + u_contrast) + 0.5;

    luma = dot(rgb, vec3(0.2126, 0.7152, 0.0722));
    float sMask = clamp(1.0 - luma * 2.0, 0.0, 1.0);
    float hMask = clamp((luma - 0.5) * 2.0, 0.0, 1.0);

    rgb += vec3(u_shadows * sMask * 0.3);
    rgb += vec3(u_highlights * hMask * 0.3);

    // 9. Saturation & Selective Vibrance
    luma = dot(rgb, vec3(0.2126, 0.7152, 0.0722));
    rgb = mix(vec3(luma), rgb, 1.0 + u_saturation);

    if (u_vibrance != 0.0) {
        float maxC = max(rgb.r, max(rgb.g, rgb.b));
        float satAmt = (maxC - luma) / (maxC + 0.001);
        float vibranceFactor = (1.0 - satAmt) * u_vibrance;
        rgb = mix(vec3(luma), rgb, 1.0 + vibranceFactor);
    }

    // 10. Vignette (Lens Radial Light Falloff)
    if (u_vignette > 0.0) {
        vec2 centerDist = uv - vec2(0.5);
        float len = length(centerDist);
        float vigFactor = smoothstep(0.4, 0.85, len) * u_vignette;
        rgb = mix(rgb, rgb * 0.15, vigFactor);
    }

    // Clamp final color output
    rgb = clamp(rgb, 0.0, 1.0);

    // Blend according to engine intensity (0.0 = original, 1.0 = full landscape engine)
    gl_FragColor = vec4(mix(origRgb, rgb, u_intensity), texture2D(u_image, uv).a);
}
`;
