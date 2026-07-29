export interface EffectPreset {
  id: string;
  name: string;
  category: string;
  description: string;
  cssFilter: string;
  overlayClass?: string;
  overlayStyle?: Record<string, string>;
  defaultIntensity: number;
  defaultOpacity: number;
  defaultSpeed: number;
  defaultAngle: number;
  defaultDirection: 'horizontal' | 'vertical' | 'diagonal' | 'reverse';
  defaultBlendMode: string;
}

import { BASIC_EFFECTS } from './basic';
import { CAMERA_EFFECTS } from './camera';
import { BLUR_EFFECTS } from './blur';
import { GLITCH_EFFECTS } from './glitch';
import { CINEMATIC_EFFECTS } from './cinematic';
import { LIGHT_EFFECTS } from './light';
import { RETRO_EFFECTS } from './retro';
import { THREED_EFFECTS } from './threeD';
import { AI_EFFECTS } from './ai';

const CATEGORIES_INFO: Record<
  string,
  {
    baseName: string;
    filterTpl: (i: number) => string;
    descTpl: (i: number) => string;
    overlayClass?: string;
    overlayStyle?: (i: number) => Record<string, string>;
    defaultBlendMode?: string;
  }
> = {
  Basic: {
    baseName: 'Basic Polish',
    filterTpl: (i) => `brightness(${1 + i / 200}) contrast(${1 + i / 400}) saturate(${1 + i / 500})`,
    descTpl: (i) => `Essential color correction preset variant #${i} for general clips.`
  },
  Camera: {
    baseName: 'Cam Movement',
    filterTpl: (i) => `contrast(${1.0 + i / 500})`,
    descTpl: (i) => `Simulated camera motion and shake effect #${i}.`,
    overlayClass: 'animate-handheld'
  },
  Blur: {
    baseName: 'Soft Focus',
    filterTpl: (i) => `blur(${i / 5}px)`,
    descTpl: (i) => `High-quality Gaussian blur preset variant #${i}.`
  },
  Glitch: {
    baseName: 'Glitch Distortion',
    filterTpl: (i) => `hue-rotate(${i * 9}deg) saturate(${1 + i / 100})`,
    descTpl: (i) => `Digital signal interference glitch variation #${i}.`,
    overlayClass: 'animate-pulse bg-sky-500/5 mix-blend-color-dodge'
  },
  Cinematic: {
    baseName: 'Cinematic Grade',
    filterTpl: (i) => `sepia(${i / 200}) contrast(${1 + i / 200}) saturate(${1 - i / 300})`,
    descTpl: (i) => `Hollywood color grading model #${i}.`
  },
  Lens: {
    baseName: 'Lens Distortion',
    filterTpl: (i) => `contrast(${1 + i / 300})`,
    descTpl: (i) => `Simulated spherical lens bend profile #${i}.`
  },
  Light: {
    baseName: 'Light Leak',
    filterTpl: (i) => `brightness(${1 + i / 150}) saturate(${1 + i / 200})`,
    descTpl: (i) => `Beautiful vintage ambient light leak preset #${i}.`,
    defaultBlendMode: 'screen',
    overlayStyle: (i) => ({
      background: `linear-gradient(${45 + i * 8}deg, rgba(239, 68, 68, 0.15), rgba(245, 158, 11, 0.1), transparent)`
    })
  },
  Distortion: {
    baseName: 'Fisheye Distortion',
    filterTpl: (i) => `saturate(${1.0 + i / 400})`,
    descTpl: (i) => `Optical distortion effect #${i} for dynamic shots.`
  },
  Retro: {
    baseName: 'Retro Film',
    filterTpl: (i) => `sepia(${i / 150}) brightness(${0.9 + i / 500}) contrast(${1 + i / 200})`,
    descTpl: (i) => `Nostalgic analog film lookup look #${i}.`
  },
  VHS: {
    baseName: 'VHS Tape',
    filterTpl: (i) => `contrast(${0.8 + i / 300}) saturate(${1.2 + i / 200})`,
    descTpl: (i) => `Retro VHS magnetic tape wear preset #${i}.`,
    overlayClass: 'animate-pulse bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.2)_50%)] bg-[size:100%_8px]'
  },
  CRT: {
    baseName: 'CRT Monitor',
    filterTpl: (i) => `brightness(${1 + i / 300})`,
    descTpl: (i) => `Simulated scanline cathode-ray tube screen visual #${i}.`,
    overlayStyle: (i) => ({
      backgroundImage: 'linear-gradient(rgba(18,16,16,0) 50%, rgba(0,0,0,0.15) 50%)',
      backgroundSize: '100% 4px'
    })
  },
  Neon: {
    baseName: 'Neon Glow',
    filterTpl: (i) => `saturate(${1.5 + i / 100}) brightness(${1.1 + i / 300})`,
    descTpl: (i) => `Futuristic electric neon color glow #${i}.`
  },
  Fire: {
    baseName: 'Fire Flame',
    filterTpl: (i) => `hue-rotate(${-i / 2}deg) saturate(${1.2 + i / 100})`,
    descTpl: (i) => `Ember fire overlays and heat distortion variant #${i}.`,
    defaultBlendMode: 'screen',
    overlayStyle: (i) => ({
      background: `radial-gradient(circle at bottom, rgba(239, 68, 68, ${0.05 + i / 500}), rgba(249, 115, 22, 0.05), transparent)`
    })
  },
  Smoke: {
    baseName: 'Smoke Fog',
    filterTpl: (i) => `blur(${i / 10}px) contrast(${1 - i / 300}) brightness(${1.0 + i / 500})`,
    descTpl: (i) => `Atmospheric smoke drift visual simulator #${i}.`
  },
  Weather: {
    baseName: 'Weather Element',
    filterTpl: (i) => `hue-rotate(${i}deg) saturate(${1 - i / 400})`,
    descTpl: (i) => `Simulated rain, snow, or storm overlay variant #${i}.`
  },
  Particles: {
    baseName: 'Particle Sparkle',
    filterTpl: (i) => `brightness(${1 + i / 250})`,
    descTpl: (i) => `Floating glowing dust particles overlay #${i}.`
  },
  Nature: {
    baseName: 'Nature Foliage',
    filterTpl: (i) => `hue-rotate(${i / 2}deg) saturate(${1 + i / 150})`,
    descTpl: (i) => `Eco-grading and green leaf pop filter #${i}.`
  },
  Dream: {
    baseName: 'Dream Bloom',
    filterTpl: (i) => `blur(${i / 8}px) brightness(${1.0 + i / 200}) saturate(${0.9 + i / 300})`,
    descTpl: (i) => `Ethereal romantic dream bloom visual style #${i}.`
  },
  Horror: {
    baseName: 'Horror Suspense',
    filterTpl: (i) => `brightness(${0.7 - i / 500}) contrast(${1.3 + i / 200}) saturate(${0.5 - i / 400})`,
    descTpl: (i) => `Grungy suspenseful horror dark overlay #${i}.`,
    overlayStyle: (i) => ({
      backgroundColor: `rgba(0, 0, 0, ${0.1 + i / 500})`
    })
  },
  'Sci-Fi': {
    baseName: 'Sci-Fi Holo',
    filterTpl: (i) => `hue-rotate(${180 + i}deg) brightness(${1.1 + i / 300})`,
    descTpl: (i) => `Holographic cybernetic HUD overlay profile #${i}.`
  },
  Gaming: {
    baseName: 'Gaming HUD',
    filterTpl: (i) => `saturate(${1.4 + i / 200}) contrast(${1.1 + i / 300})`,
    descTpl: (i) => `Vibrant high-contrast game aesthetic profile #${i}.`
  },
  Comic: {
    baseName: 'Comic Poster',
    filterTpl: (i) => `contrast(${1.8 + i / 100}) saturate(${1.5 + i / 150})`,
    descTpl: (i) => `Retro print comic book shading styling variant #${i}.`
  },
  '3D': {
    baseName: '3D Anaglyph',
    filterTpl: (i) => `saturate(${0.8 + i / 400})`,
    descTpl: (i) => `Red-cyan split anaglyph stereoscopic depth simulator #${i}.`
  },
  Artistic: {
    baseName: 'Artistic Watercolor',
    filterTpl: (i) => `contrast(${1.2 + i / 300}) saturate(${0.7 + i / 200})`,
    descTpl: (i) => `Creative painting and sketch textures preset #${i}.`
  },
  AI: {
    baseName: 'AI Dreamwave',
    filterTpl: (i) => `hue-rotate(${i * 12}deg) saturate(${1.5 + i / 100}) contrast(${1.1 + i / 400})`,
    descTpl: (i) => `Generative neural network art styling filter #${i}.`
  },
  Trending: {
    baseName: 'Viral Look',
    filterTpl: (i) => `contrast(${1.05 + i / 300}) saturate(${1.1 + i / 250}) brightness(${1.0 + i / 400})`,
    descTpl: (i) => `Social media trending viral look preset #${i}.`
  }
};

const CATEGORIES = Object.keys(CATEGORIES_INFO);

function generatePresets(): EffectPreset[] {
  return [
    ...BASIC_EFFECTS,
    ...CAMERA_EFFECTS,
    ...BLUR_EFFECTS,
    ...GLITCH_EFFECTS,
    ...CINEMATIC_EFFECTS,
    ...LIGHT_EFFECTS,
    ...RETRO_EFFECTS,
    ...THREED_EFFECTS,
    ...AI_EFFECTS
  ];
}

export const EFFECT_PRESETS: EffectPreset[] = generatePresets();

export interface EffectKeyframe {
  id: string;
  time: number; // relative time in clip (seconds)
  properties: {
    intensity?: number;
    opacity?: number;
    scale?: number;
    rotation?: number;
    positionX?: number;
    positionY?: number;
    glow?: number;
    blur?: number;
    noise?: number;
    shakeAmount?: number;
    frequency?: number;
    speed?: number;
  };
}

export interface AppliedEffect {
  id: string; // Unique instance id
  presetId: string;
  name: string;
  category: string;
  enabled: boolean;
  intensity: number;
  opacity: number;
  speed: number;
  angle: number;
  direction: 'horizontal' | 'vertical' | 'diagonal' | 'reverse';
  blendMode: string;
  keyframes: EffectKeyframe[];
  distance?: number;
  smoothness?: number;
  motionStrength?: number;
  zoomAmount?: number;
  blurAmount?: number;
  rotation?: number;
  blurRadius?: number;
  feather?: number;
  focusDistance?: number;
  focusSize?: number;
  rgbOffset?: number;
  distortionAmount?: number;
  noiseAmount?: number;
  flickerSpeed?: number;
  scanlineDensity?: number;
  blockSize?: number;
  pixelSize?: number;
  colorShift?: number;
  glitchFrequency?: number;
  glitchAmount?: number;
  brightness?: number;
  contrast?: number;
  saturation?: number;
  temperature?: number;
  tint?: number;
  blur?: number;
  glowAmount?: number;
  grainAmount?: number;
  flareSize?: number;
  flarePosition?: number;
  vignetteAmount?: number;
  letterboxSize?: number;
  focusRadius?: number;
  refractionStrength?: number;
  reflectionStrength?: number;
  chromaticOffset?: number;
  lensRadius?: number;
  bloomRadius?: number;
  bloomThreshold?: number;
  exposure?: number;
  lightRadius?: number;
  lightPosition?: number;
  lightAngle?: number;
  lightColor?: string;
  falloff?: number;
  distortionStrength?: number;
  waveSize?: number;
  waveSpeed?: number;
  rippleRadius?: number;
  rippleSpeed?: number;
  frequency?: number;
  amplitude?: number;
  radius?: number;
  refractionAmount?: number;
  stretchAmount?: number;
  twistAmount?: number;
  flowDirection?: number;
  dustAmount?: number;
  scratchAmount?: number;
  warmth?: number;
  fade?: number;
  trackingAmount?: number;
  horizontalShift?: number;
  verticalShift?: number;
  tapeDamage?: number;
  staticDensity?: number;
  waveStrength?: number;
  curvature?: number;
  scanlineThickness?: number;
  bloomAmount?: number;
  glassOpacity?: number;
  glowStrength?: number;
  glowSoftness?: number;
  glowThreshold?: number;
  edgeGlow?: number;
  hue?: number;
  blendAmount?: number;
  glowColor?: string;
  glowRadius?: number;
  flameHeight?: number;
  flameWidth?: number;
  flameSpeed?: number;
  heatDistortion?: number;
  emberDensity?: number;
  sparkAmount?: number;
  smokeDensity?: number;
  windStrength?: number;
  flameDirection?: string;
  turbulence?: number;
  spread?: number;
  softness?: number;
  fireColor?: string;
  flowSpeed?: number;
  swirlAmount?: number;
  size?: number;
  fadeIn?: number;
  fadeOut?: number;
  layerAmount?: number;
  animationSpeed?: number;
  smokeColor?: string;
  weatherType?: string;
  particleDensity?: number;
  windSpeed?: number;
  windDirection?: number;
  particleSize?: number;
  particleSpeed?: number;
  environmentLight?: number;
  atmosphericDepth?: number;
  rainAmount?: number;
  snowAmount?: number;
  lightningFrequency?: number;
  cloudCoverage?: number;
  shadowStrength?: number;
  motionBlur?: number;
  colorTint?: string;
  particleCount?: number;
  sizeVariation?: number;
  gravity?: number;
  lifetime?: number;
  spawnRate?: number;
  rotationSpeed?: number;
  randomness?: number;
  colorVariation?: number;
  particlesColor?: string;
  environmentDensity?: number;
  leafDensity?: number;
  leafSize?: number;
  birdCount?: number;
  butterflyCount?: number;
  fireflyCount?: number;
  flowerDensity?: number;
  grassMovement?: number;
  waterSpeed?: number;
  waterStrength?: number;
  cloudDensity?: number;
  cloudSpeed?: number;
  sunlightIntensity?: number;
  lightRays?: number;
  bloom?: number;
  natureColorTint?: string;
  softFocus?: number;
  hazeDensity?: number;
  sparkleAmount?: number;
  bokehSize?: number;
  highlightStrength?: number;
  dreamColorTint?: string;
  darkness?: number;
  cameraShake?: number;
  filmGrain?: number;
  horrorColorTint?: string;
  hologramOpacity?: number;
  energyStrength?: number;
  plasmaAmount?: number;
  electricArcDensity?: number;
  laserBrightness?: number;
  hudOpacity?: number;
  scanlineStrength?: number;
  rgbShift?: number;
  neonGlow?: number;
  motionTrails?: number;
  lensFlare?: number;
  scifiColorTint?: string;
  rgbStrength?: number;
  crosshairSize?: number;
  speedLines?: number;
  sparkDensity?: number;
  flashIntensity?: number;
  gamingColorTint?: string;
  galaxyDensity?: number;
  starCount?: number;
  starBrightness?: number;
  nebulaDensity?: number;
  nebulaColor?: string;
  cosmicDust?: number;
  planetSize?: number;
  auroraStrength?: number;
  energyWaves?: number;
  gravityDistortion?: number;
  blackHoleStrength?: number;
  wormholeRotation?: number;
  meteorSpeed?: number;
  depthAmount?: number;
  perspective?: number;
  parallaxStrength?: number;
  cameraDistance?: number;
  cameraOrbit?: number;
  cameraTilt?: number;
  cameraRoll?: number;
  threeDrotationX?: number;
  threeDrotationY?: number;
  threeDrotationZ?: number;
  zoom?: number;
  fov?: number;
  ambientLight?: number;
  directionalLight?: number;
  threeDColorTint?: string;
  brushSize?: number;
  brushDetail?: number;
  strokeStrength?: number;
  textureAmount?: number;
  paintThickness?: number;
  edgeDetail?: number;
  outlineStrength?: number;
  canvasTexture?: number;
  paperTexture?: number;
  colorVibrance?: number;
  aiScanSpeed?: number;
  detectionBoxSize?: number;
  neuralLineDensity?: number;
  circuitOpacity?: number;
  scanlineIntensity?: number;
  hologramStrength?: number;
  noiseReduction?: number;
  aiColorTint?: string;
}

export function getInterpolatedEffectProps(effect: AppliedEffect, localTime: number) {
  const defaults: Record<string, number> = {
    intensity: effect.intensity,
    opacity: effect.opacity,
    speed: effect.speed,
    angle: effect.angle,
    scale: 1,
    rotation: effect.rotation ?? 0,
    positionX: 0,
    positionY: 0,
    glow: 0,
    blur: 0,
    noise: 0,
    shakeAmount: 0,
    frequency: effect.frequency ?? 50,
    distance: effect.distance ?? 50,
    smoothness: effect.smoothness ?? 50,
    motionStrength: effect.motionStrength ?? 50,
    zoomAmount: effect.zoomAmount ?? 50,
    blurAmount: effect.blurAmount ?? 50,
    blurRadius: effect.blurRadius ?? 50,
    feather: effect.feather ?? 50,
    focusDistance: effect.focusDistance ?? 50,
    focusSize: effect.focusSize ?? 50,
    rgbOffset: effect.rgbOffset ?? 50,
    distortionAmount: effect.distortionAmount ?? 50,
    noiseAmount: effect.noiseAmount ?? 50,
    flickerSpeed: effect.flickerSpeed ?? 50,
    scanlineDensity: effect.scanlineDensity ?? 50,
    blockSize: effect.blockSize ?? 50,
    pixelSize: effect.pixelSize ?? 50,
    colorShift: effect.colorShift ?? 50,
    glitchFrequency: effect.glitchFrequency ?? 50,
    brightness: effect.brightness ?? 50,
    contrast: effect.contrast ?? 50,
    saturation: effect.saturation ?? 50,
    temperature: effect.temperature ?? 50,
    tint: effect.tint ?? 50,
    glowAmount: effect.glowAmount ?? 50,
    grainAmount: effect.grainAmount ?? 50,
    flareSize: effect.flareSize ?? 50,
    flarePosition: effect.flarePosition ?? 50,
    vignetteAmount: effect.vignetteAmount ?? 50,
    letterboxSize: effect.letterboxSize ?? 25,
    focusRadius: effect.focusRadius ?? 50,
    refractionStrength: effect.refractionStrength ?? 50,
    reflectionStrength: effect.reflectionStrength ?? 50,
    chromaticOffset: effect.chromaticOffset ?? 50,
    lensRadius: effect.lensRadius ?? 50,
    bloomRadius: effect.bloomRadius ?? 50,
    bloomThreshold: effect.bloomThreshold ?? 50,
    exposure: effect.exposure ?? 50,
    lightRadius: effect.lightRadius ?? 50,
    lightPosition: effect.lightPosition ?? 50,
    lightAngle: effect.lightAngle ?? 50,
    falloff: effect.falloff ?? 50,
    distortionStrength: effect.distortionStrength ?? 50,
    waveSize: effect.waveSize ?? 50,
    waveSpeed: effect.waveSpeed ?? 50,
    rippleRadius: effect.rippleRadius ?? 50,
    rippleSpeed: effect.rippleSpeed ?? 50,
    amplitude: effect.amplitude ?? 50,
    radius: effect.radius ?? 50,
    refractionAmount: effect.refractionAmount ?? 50,
    stretchAmount: effect.stretchAmount ?? 50,
    twistAmount: effect.twistAmount ?? 50,
    flowDirection: effect.flowDirection ?? 50,
    dustAmount: effect.dustAmount ?? 50,
    scratchAmount: effect.scratchAmount ?? 50,
    warmth: effect.warmth ?? 50,
    fade: effect.fade ?? 50,
    trackingAmount: effect.trackingAmount ?? 50,
    horizontalShift: effect.horizontalShift ?? 50,
    verticalShift: effect.verticalShift ?? 50,
    tapeDamage: effect.tapeDamage ?? 50,
    staticDensity: effect.staticDensity ?? 50,
    waveStrength: effect.waveStrength ?? 50,
    curvature: effect.curvature ?? 50,
    scanlineThickness: effect.scanlineThickness ?? 50,
    bloomAmount: effect.bloomAmount ?? 50,
    glassOpacity: effect.glassOpacity ?? 50,
    glowStrength: effect.glowStrength ?? 50,
    glowSoftness: effect.glowSoftness ?? 50,
    glowThreshold: effect.glowThreshold ?? 50,
    edgeGlow: effect.edgeGlow ?? 50,
    hue: effect.hue ?? 0,
    blendAmount: effect.blendAmount ?? 50,
    glowRadius: effect.glowRadius ?? 50,
    flameHeight: effect.flameHeight ?? 50,
    flameWidth: effect.flameWidth ?? 50,
    flameSpeed: effect.flameSpeed ?? 50,
    heatDistortion: effect.heatDistortion ?? 50,
    emberDensity: effect.emberDensity ?? 50,
    sparkAmount: effect.sparkAmount ?? 50,
    smokeDensity: effect.smokeDensity ?? 50,
    windStrength: effect.windStrength ?? 50,
    turbulence: effect.turbulence ?? 50,
    spread: effect.spread ?? 50,
    softness: effect.softness ?? 50,
    flowSpeed: effect.flowSpeed ?? 50,
    swirlAmount: effect.swirlAmount ?? 50,
    size: effect.size ?? 50,
    fadeIn: effect.fadeIn ?? 50,
    fadeOut: effect.fadeOut ?? 50,
    layerAmount: effect.layerAmount ?? 50,
    animationSpeed: effect.animationSpeed ?? 50,
    particleDensity: effect.particleDensity ?? 50,
    windSpeed: effect.windSpeed ?? 50,
    windDirection: effect.windDirection ?? 50,
    particleSize: effect.particleSize ?? 50,
    particleSpeed: effect.particleSpeed ?? 50,
    environmentLight: effect.environmentLight ?? 50,
    atmosphericDepth: effect.atmosphericDepth ?? 50,
    rainAmount: effect.rainAmount ?? 50,
    snowAmount: effect.snowAmount ?? 50,
    lightningFrequency: effect.lightningFrequency ?? 50,
    cloudCoverage: effect.cloudCoverage ?? 50,
    shadowStrength: effect.shadowStrength ?? 50,
    motionBlur: effect.motionBlur ?? 50,
    particleCount: effect.particleCount ?? 50,
    sizeVariation: effect.sizeVariation ?? 50,
    gravity: effect.gravity ?? 50,
    lifetime: effect.lifetime ?? 50,
    spawnRate: effect.spawnRate ?? 50,
    rotationSpeed: effect.rotationSpeed ?? 50,
    randomness: effect.randomness ?? 50,
    colorVariation: effect.colorVariation ?? 50,
    environmentDensity: effect.environmentDensity ?? 50,
    leafDensity: effect.leafDensity ?? 50,
    leafSize: effect.leafSize ?? 50,
    birdCount: effect.birdCount ?? 50,
    butterflyCount: effect.butterflyCount ?? 50,
    fireflyCount: effect.fireflyCount ?? 50,
    flowerDensity: effect.flowerDensity ?? 50,
    grassMovement: effect.grassMovement ?? 50,
    waterSpeed: effect.waterSpeed ?? 50,
    waterStrength: effect.waterStrength ?? 50,
    cloudDensity: effect.cloudDensity ?? 50,
    cloudSpeed: effect.cloudSpeed ?? 50,
    sunlightIntensity: effect.sunlightIntensity ?? 50,
    lightRays: effect.lightRays ?? 50,
    bloom: effect.bloom ?? 50,
    softFocus: effect.softFocus ?? 50,
    hazeDensity: effect.hazeDensity ?? 50,
    sparkleAmount: effect.sparkleAmount ?? 50,
    bokehSize: effect.bokehSize ?? 50,
    highlightStrength: effect.highlightStrength ?? 50,
    darkness: effect.darkness ?? 50,
    cameraShake: effect.cameraShake ?? 50,
    filmGrain: effect.filmGrain ?? 50,
    hologramOpacity: effect.hologramOpacity ?? 50,
    energyStrength: effect.energyStrength ?? 50,
    plasmaAmount: effect.plasmaAmount ?? 50,
    electricArcDensity: effect.electricArcDensity ?? 50,
    laserBrightness: effect.laserBrightness ?? 50,
    hudOpacity: effect.hudOpacity ?? 50,
    scanlineStrength: effect.scanlineStrength ?? 50,
    rgbShift: effect.rgbShift ?? 50,
    neonGlow: effect.neonGlow ?? 50,
    motionTrails: effect.motionTrails ?? 50,
    lensFlare: effect.lensFlare ?? 50,
    glitchAmount: effect.glitchAmount ?? 50,
    rgbStrength: effect.rgbStrength ?? 50,
    crosshairSize: effect.crosshairSize ?? 50,
    speedLines: effect.speedLines ?? 50,
    sparkDensity: effect.sparkDensity ?? 50,
    flashIntensity: effect.flashIntensity ?? 50,
    galaxyDensity: effect.galaxyDensity ?? 50,
    starCount: effect.starCount ?? 50,
    starBrightness: effect.starBrightness ?? 50,
    nebulaDensity: effect.nebulaDensity ?? 50,
    cosmicDust: effect.cosmicDust ?? 50,
    planetSize: effect.planetSize ?? 50,
    auroraStrength: effect.auroraStrength ?? 50,
    energyWaves: effect.energyWaves ?? 50,
    gravityDistortion: effect.gravityDistortion ?? 50,
    blackHoleStrength: effect.blackHoleStrength ?? 50,
    wormholeRotation: effect.wormholeRotation ?? 50,
    meteorSpeed: effect.meteorSpeed ?? 50,
    depthAmount: effect.depthAmount ?? 50,
    perspective: effect.perspective ?? 50,
    parallaxStrength: effect.parallaxStrength ?? 50,
    cameraDistance: effect.cameraDistance ?? 50,
    cameraOrbit: effect.cameraOrbit ?? 50,
    cameraTilt: effect.cameraTilt ?? 50,
    cameraRoll: effect.cameraRoll ?? 50,
    threeDrotationX: effect.threeDrotationX ?? 50,
    threeDrotationY: effect.threeDrotationY ?? 50,
    threeDrotationZ: effect.threeDrotationZ ?? 50,
    zoom: effect.zoom ?? 50,
    fov: effect.fov ?? 50,
    ambientLight: effect.ambientLight ?? 50,
    directionalLight: effect.directionalLight ?? 50,
    brushSize: effect.brushSize ?? 50,
    brushDetail: effect.brushDetail ?? 50,
    strokeStrength: effect.strokeStrength ?? 50,
    textureAmount: effect.textureAmount ?? 50,
    paintThickness: effect.paintThickness ?? 50,
    edgeDetail: effect.edgeDetail ?? 50,
    outlineStrength: effect.outlineStrength ?? 50,
    canvasTexture: effect.canvasTexture ?? 50,
    paperTexture: effect.paperTexture ?? 50,
    colorVibrance: effect.colorVibrance ?? 50,
    aiScanSpeed: effect.aiScanSpeed ?? 50,
    detectionBoxSize: effect.detectionBoxSize ?? 50,
    neuralLineDensity: effect.neuralLineDensity ?? 50,
    circuitOpacity: effect.circuitOpacity ?? 50,
    scanlineIntensity: effect.scanlineIntensity ?? 50,
    hologramStrength: effect.hologramStrength ?? 50,
    noiseReduction: effect.noiseReduction ?? 50
  };

  if (!effect.keyframes || effect.keyframes.length === 0) {
    return defaults;
  }

  const sorted = [...effect.keyframes].sort((a, b) => a.time - b.time);
  
  let prevKf = sorted[0];
  let nextKf = sorted[sorted.length - 1];
  
  if (localTime <= prevKf.time) {
    return { ...defaults, ...prevKf.properties };
  }
  if (localTime >= nextKf.time) {
    return { ...defaults, ...nextKf.properties };
  }
  
  for (let i = 0; i < sorted.length - 1; i++) {
    if (localTime >= sorted[i].time && localTime <= sorted[i+1].time) {
      prevKf = sorted[i];
      nextKf = sorted[i+1];
      break;
    }
  }
  
  const progress = (localTime - prevKf.time) / (nextKf.time - prevKf.time);
  const lerp = (start: number, end: number) => start + (end - start) * progress;
  
  const interpolated: any = { ...defaults };
  const keys = new Set([...Object.keys(prevKf.properties), ...Object.keys(nextKf.properties)]);
  
  keys.forEach((key) => {
    const startVal = (prevKf.properties as any)[key] ?? defaults[key] ?? 0;
    const endVal = (nextKf.properties as any)[key] ?? defaults[key] ?? 0;
    interpolated[key] = lerp(startVal, endVal);
  });
  
  return interpolated;
}
