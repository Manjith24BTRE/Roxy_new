// src/components/editor-main-screen/tools/filters/engines/artisticFilter/artisticFilterShader.ts

export const ARTISTIC_VERTEX_SHADER_SOURCE = `
attribute vec2 a_position;
attribute vec2 a_texCoord;
varying vec2 v_texCoord;

void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
    // Invert Y for webgl texture orientation
    v_texCoord = vec2(a_texCoord.x, 1.0 - a_texCoord.y);
}
`;

export const ARTISTIC_FRAGMENT_SHADER_SOURCE = `
precision mediump float;

varying vec2 v_texCoord;
uniform sampler2D u_image;
uniform float u_intensity; // 0.0 (original) to 1.0 (100% artistic engine)

// Artistic Filter Uniforms
uniform float u_posterizeLevels;
uniform float u_edgeStrength;
uniform float u_smoothingBilateral;
uniform float u_watercolorDiffusion;
uniform float u_pixelateResolution;
uniform float u_doubleExposureBlend;
uniform float u_contrast;
uniform float u_brightness;
uniform float u_saturation;
uniform float u_vignette;
uniform vec2  u_resolution;

void main() {
    vec2 uv = v_texCoord;
    vec2 res = max(u_resolution, vec2(1.0, 1.0));

    // 1. Pixel Art UV Grid Quantization
    if (u_pixelateResolution > 0.0) {
        float pixelSize = 4.0 + u_pixelateResolution * 28.0;
        uv = floor(uv * res / pixelSize) * pixelSize / res;
    }

    vec3 origRgb = texture2D(u_image, v_texCoord).rgb;
    vec3 rgb = texture2D(u_image, uv).rgb;

    // 2. Painterly Smoothing & Watercolor Diffusion (Blur approximation)
    if (u_smoothingBilateral > 0.0 || u_watercolorDiffusion > 0.0) {
        float blurRadius = (u_smoothingBilateral + u_watercolorDiffusion) * 0.003;
        vec3 avg = vec3(0.0);
        avg += texture2D(u_image, uv + vec2(-blurRadius, -blurRadius)).rgb;
        avg += texture2D(u_image, uv + vec2( 0.0,        -blurRadius)).rgb;
        avg += texture2D(u_image, uv + vec2( blurRadius, -blurRadius)).rgb;
        avg += texture2D(u_image, uv + vec2(-blurRadius,  0.0)).rgb;
        avg += texture2D(u_image, uv).rgb;
        avg += texture2D(u_image, uv + vec2( blurRadius,  0.0)).rgb;
        avg += texture2D(u_image, uv + vec2(-blurRadius,  blurRadius)).rgb;
        avg += texture2D(u_image, uv + vec2( 0.0,         blurRadius)).rgb;
        avg += texture2D(u_image, uv + vec2( blurRadius,  blurRadius)).rgb;
        avg /= 9.0;
        rgb = mix(rgb, avg, (u_smoothingBilateral + u_watercolorDiffusion) * 0.75);
    }

    // 3. Sobel Edge Extraction (Comic book & Watercolor outlines)
    if (u_edgeStrength > 0.0) {
        vec2 texel = 1.0 / res;
        float gX = 0.0;
        float gY = 0.0;

        float t00 = dot(texture2D(u_image, uv + vec2(-texel.x, -texel.y)).rgb, vec3(0.3333));
        float t10 = dot(texture2D(u_image, uv + vec2( 0.0,     -texel.y)).rgb, vec3(0.3333));
        float t20 = dot(texture2D(u_image, uv + vec2( texel.x, -texel.y)).rgb, vec3(0.3333));
        float t01 = dot(texture2D(u_image, uv + vec2(-texel.x,  0.0)).rgb, vec3(0.3333));
        float t21 = dot(texture2D(u_image, uv + vec2( texel.x,  0.0)).rgb, vec3(0.3333));
        float t02 = dot(texture2D(u_image, uv + vec2(-texel.x,  texel.y)).rgb, vec3(0.3333));
        float t12 = dot(texture2D(u_image, uv + vec2( 0.0,      texel.y)).rgb, vec3(0.3333));
        float t22 = dot(texture2D(u_image, uv + vec2( texel.x,  texel.y)).rgb, vec3(0.3333));

        gX = -t00 - 2.0 * t01 - t02 + t20 + 2.0 * t21 + t22;
        gY = -t00 - 2.0 * t10 - t20 + t02 + 2.0 * t12 + t22;

        float edgeMag = sqrt(gX * gX + gY * gY);
        float inkEdge = smoothstep(0.12, 0.35, edgeMag) * u_edgeStrength;
        rgb = mix(rgb, vec3(0.0), inkEdge * 0.85);
    }

    // 4. Color Quantization / Posterization (Oil Painting & Comic book)
    if (u_posterizeLevels > 0.0) {
        float levels = mix(256.0, 5.0, u_posterizeLevels);
        rgb = floor(rgb * levels + 0.5) / levels;
    }

    // 5. Double Exposure Luminance Ghost Inversion
    if (u_doubleExposureBlend > 0.0) {
        vec3 invertedGhost = vec3(1.0) - texture2D(u_image, vec2(1.0 - uv.x, uv.y)).rgb;
        float lumaGhost = dot(invertedGhost, vec3(0.2126, 0.7152, 0.0722));
        rgb = mix(rgb, mix(rgb, invertedGhost, lumaGhost * 0.6), u_doubleExposureBlend * 0.75);
    }

    // 6. Contrast & Brightness Adjustment
    rgb += vec3(u_brightness);
    rgb = (rgb - 0.5) * (1.0 + u_contrast) + 0.5;

    // 7. Saturation Adjustment
    float luma = dot(rgb, vec3(0.2126, 0.7152, 0.0722));
    rgb = mix(vec3(luma), rgb, 1.0 + u_saturation);

    // 8. Vignette (Lens Radial Light Falloff)
    if (u_vignette > 0.0) {
        vec2 centerDist = uv - vec2(0.5);
        float len = length(centerDist);
        float vigFactor = smoothstep(0.4, 0.85, len) * u_vignette;
        rgb = mix(rgb, rgb * 0.15, vigFactor);
    }

    // Clamp final color output
    rgb = clamp(rgb, 0.0, 1.0);

    // Blend according to engine intensity (0.0 = original, 1.0 = full artistic engine)
    gl_FragColor = vec4(mix(origRgb, rgb, u_intensity), texture2D(u_image, uv).a);
}
`;
