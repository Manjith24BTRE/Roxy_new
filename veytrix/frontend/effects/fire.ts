import { EffectPreset } from './effectsPreset';

const list: EffectPreset[] = [
  {
    id: 'fire-candle',
    name: 'Candle Flame',
    category: 'Fire',
    description: 'Subtle, soft candle flame flicker and glow.',
    cssFilter: 'saturate(1.2) brightness(1.05)',
    defaultIntensity: 30,
    defaultOpacity: 80,
    defaultSpeed: 20,
    defaultAngle: 0,
    defaultDirection: 'vertical',
    defaultBlendMode: 'screen'
  },
  {
    id: 'fire-torch',
    name: 'Torch Fire',
    category: 'Fire',
    description: 'Vibrant, flickering torch flame with embers.',
    cssFilter: 'saturate(1.3) brightness(1.1) contrast(1.05)',
    defaultIntensity: 50,
    defaultOpacity: 90,
    defaultSpeed: 40,
    defaultAngle: 0,
    defaultDirection: 'vertical',
    defaultBlendMode: 'screen'
  },
  {
    id: 'fire-campfire',
    name: 'Campfire',
    category: 'Fire',
    description: 'Warm campfire with rising sparks and glow.',
    cssFilter: 'saturate(1.4) brightness(1.1) contrast(1.1)',
    defaultIntensity: 60,
    defaultOpacity: 100,
    defaultSpeed: 45,
    defaultAngle: 0,
    defaultDirection: 'vertical',
    defaultBlendMode: 'screen'
  },
  {
    id: 'fire-fireplace',
    name: 'Fireplace',
    category: 'Fire',
    description: 'Cozy fireplace embers and gentle flames.',
    cssFilter: 'saturate(1.3) brightness(1.05) contrast(1.08)',
    defaultIntensity: 50,
    defaultOpacity: 95,
    defaultSpeed: 35,
    defaultAngle: 0,
    defaultDirection: 'vertical',
    defaultBlendMode: 'screen'
  },
  {
    id: 'fire-bonfire',
    name: 'Bonfire',
    category: 'Fire',
    description: 'Large roaring bonfire with high turbulence and sparks.',
    cssFilter: 'saturate(1.5) brightness(1.15) contrast(1.12)',
    defaultIntensity: 75,
    defaultOpacity: 100,
    defaultSpeed: 55,
    defaultAngle: 0,
    defaultDirection: 'vertical',
    defaultBlendMode: 'screen'
  },
  {
    id: 'fire-gas',
    name: 'Gas Flame',
    category: 'Fire',
    description: 'Clean blue gas flame with steady heat glow.',
    cssFilter: 'saturate(1.2) hue-rotate(180deg) brightness(1.1)',
    defaultIntensity: 45,
    defaultOpacity: 90,
    defaultSpeed: 60,
    defaultAngle: 0,
    defaultDirection: 'vertical',
    defaultBlendMode: 'screen'
  },
  {
    id: 'fire-explosion',
    name: 'Explosion Fire',
    category: 'Fire',
    description: 'Intense expanding explosion fireball with heavy smoke.',
    cssFilter: 'saturate(1.6) brightness(1.25) contrast(1.15)',
    defaultIntensity: 90,
    defaultOpacity: 100,
    defaultSpeed: 70,
    defaultAngle: 0,
    defaultDirection: 'diagonal',
    defaultBlendMode: 'screen'
  },
  {
    id: 'fire-forest',
    name: 'Forest Fire',
    category: 'Fire',
    description: 'Spreading forest inferno with sparks and ash clouds.',
    cssFilter: 'saturate(1.55) brightness(1.2) contrast(1.14)',
    defaultIntensity: 85,
    defaultOpacity: 100,
    defaultSpeed: 50,
    defaultAngle: 0,
    defaultDirection: 'vertical',
    defaultBlendMode: 'screen'
  },
  {
    id: 'fire-inferno',
    name: 'Inferno',
    category: 'Fire',
    description: 'Massive screen-filling extreme inferno.',
    cssFilter: 'saturate(1.7) brightness(1.3) contrast(1.2)',
    defaultIntensity: 100,
    defaultOpacity: 100,
    defaultSpeed: 65,
    defaultAngle: 0,
    defaultDirection: 'vertical',
    defaultBlendMode: 'screen'
  },
  {
    id: 'fire-lava',
    name: 'Lava Fire',
    category: 'Fire',
    description: 'Viscous slow-moving lava flow flame textures.',
    cssFilter: 'saturate(1.4) brightness(1.08) contrast(1.1)',
    defaultIntensity: 65,
    defaultOpacity: 100,
    defaultSpeed: 25,
    defaultAngle: 0,
    defaultDirection: 'vertical',
    defaultBlendMode: 'screen'
  },
  {
    id: 'fire-blue',
    name: 'Blue Fire',
    category: 'Fire',
    description: 'Mystical hot blue chemical fire.',
    cssFilter: 'saturate(1.5) hue-rotate(190deg) brightness(1.15)',
    defaultIntensity: 55,
    defaultOpacity: 95,
    defaultSpeed: 45,
    defaultAngle: 0,
    defaultDirection: 'vertical',
    defaultBlendMode: 'screen'
  },
  {
    id: 'fire-green',
    name: 'Green Fire',
    category: 'Fire',
    description: 'Eerie green wildfire flame profile.',
    cssFilter: 'saturate(1.4) hue-rotate(110deg) brightness(1.1)',
    defaultIntensity: 50,
    defaultOpacity: 95,
    defaultSpeed: 40,
    defaultAngle: 0,
    defaultDirection: 'vertical',
    defaultBlendMode: 'screen'
  },
  {
    id: 'fire-purple',
    name: 'Purple Fire',
    category: 'Fire',
    description: 'Sinister purple magical flame styling.',
    cssFilter: 'saturate(1.45) hue-rotate(270deg) brightness(1.12)',
    defaultIntensity: 50,
    defaultOpacity: 95,
    defaultSpeed: 40,
    defaultAngle: 0,
    defaultDirection: 'vertical',
    defaultBlendMode: 'screen'
  },
  {
    id: 'fire-magic',
    name: 'Magic Fire',
    category: 'Fire',
    description: 'Sparkling supernatural color-shifting flame.',
    cssFilter: 'saturate(1.6) hue-rotate(45deg) brightness(1.15)',
    defaultIntensity: 60,
    defaultOpacity: 100,
    defaultSpeed: 50,
    defaultAngle: 0,
    defaultDirection: 'vertical',
    defaultBlendMode: 'screen'
  },
  {
    id: 'fire-phoenix',
    name: 'Phoenix Fire',
    category: 'Fire',
    description: 'Vibrant golden-orange phoenix spirit flame.',
    cssFilter: 'saturate(1.65) brightness(1.2) contrast(1.1)',
    defaultIntensity: 70,
    defaultOpacity: 100,
    defaultSpeed: 60,
    defaultAngle: 0,
    defaultDirection: 'vertical',
    defaultBlendMode: 'screen'
  },
  {
    id: 'fire-cinematic',
    name: 'Cinematic Fire',
    category: 'Fire',
    description: 'Hollywood-style cinematic action flame overlays.',
    cssFilter: 'saturate(1.4) brightness(1.1) contrast(1.08)',
    defaultIntensity: 60,
    defaultOpacity: 95,
    defaultSpeed: 40,
    defaultAngle: 0,
    defaultDirection: 'vertical',
    defaultBlendMode: 'screen'
  },
  {
    id: 'fire-custom',
    name: 'Custom Fire',
    category: 'Fire',
    description: 'User-configurable fire color and turbulence physics.',
    cssFilter: 'saturate(1.3) brightness(1.05)',
    defaultIntensity: 50,
    defaultOpacity: 100,
    defaultSpeed: 40,
    defaultAngle: 0,
    defaultDirection: 'vertical',
    defaultBlendMode: 'screen'
  }
];

// Generate remainder to have exactly 50 fire presets
for (let i = list.length + 1; i <= 50; i++) {
  list.push({
    id: `fire-preset-${i}`,
    name: `Fire Flame ${i}`,
    category: 'Fire',
    description: `Animated fire preset variant #${i} with custom embers and turbulence.`,
    cssFilter: `saturate(${1.3 + (i % 5) * 0.05}) brightness(${1.05 + (i % 3) * 0.05})`,
    defaultIntensity: 50 + (i % 6) * 5,
    defaultOpacity: 90 + (i % 3) * 3,
    defaultSpeed: 30 + (i % 7) * 5,
    defaultAngle: 0,
    defaultDirection: 'vertical',
    defaultBlendMode: 'screen'
  });
}

export const FIRE_EFFECTS = list;
