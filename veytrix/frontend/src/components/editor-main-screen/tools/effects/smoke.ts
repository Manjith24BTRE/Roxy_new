import { EffectPreset } from './effectsPreset';

const list: EffectPreset[] = [
  {
    id: 'smoke-light',
    name: 'Light Smoke',
    category: 'Smoke',
    description: 'Subtle light rising smoke trails.',
    cssFilter: 'contrast(0.95) brightness(1.02)',
    defaultIntensity: 30,
    defaultOpacity: 70,
    defaultSpeed: 20,
    defaultAngle: 0,
    defaultDirection: 'vertical',
    defaultBlendMode: 'screen'
  },
  {
    id: 'smoke-heavy',
    name: 'Heavy Smoke',
    category: 'Smoke',
    description: 'Thick, dense volumetric smoke clouds.',
    cssFilter: 'contrast(0.9) brightness(1.05)',
    defaultIntensity: 75,
    defaultOpacity: 90,
    defaultSpeed: 35,
    defaultAngle: 0,
    defaultDirection: 'vertical',
    defaultBlendMode: 'screen'
  },
  {
    id: 'smoke-fog',
    name: 'Fog',
    category: 'Smoke',
    description: 'Deep, screen-wide cinematic ground fog.',
    cssFilter: 'blur(1px) contrast(0.85) brightness(1.03)',
    defaultIntensity: 60,
    defaultOpacity: 85,
    defaultSpeed: 15,
    defaultAngle: 0,
    defaultDirection: 'horizontal',
    defaultBlendMode: 'screen'
  },
  {
    id: 'smoke-mist',
    name: 'Mist',
    category: 'Smoke',
    description: 'Thin transparent atmospheric mist.',
    cssFilter: 'contrast(0.95) brightness(1.01)',
    defaultIntensity: 40,
    defaultOpacity: 65,
    defaultSpeed: 10,
    defaultAngle: 0,
    defaultDirection: 'horizontal',
    defaultBlendMode: 'screen'
  },
  {
    id: 'smoke-steam',
    name: 'Steam',
    category: 'Smoke',
    description: 'Rising hot white steam jets.',
    cssFilter: 'contrast(0.97) brightness(1.04)',
    defaultIntensity: 50,
    defaultOpacity: 80,
    defaultSpeed: 50,
    defaultAngle: 0,
    defaultDirection: 'vertical',
    defaultBlendMode: 'screen'
  },
  {
    id: 'smoke-dryice',
    name: 'Dry Ice',
    category: 'Smoke',
    description: 'Heavy creeping dry ice carbon dioxide vapors.',
    cssFilter: 'contrast(0.88) brightness(1.02)',
    defaultIntensity: 65,
    defaultOpacity: 95,
    defaultSpeed: 25,
    defaultAngle: 0,
    defaultDirection: 'horizontal',
    defaultBlendMode: 'screen'
  },
  {
    id: 'smoke-white',
    name: 'White Smoke',
    category: 'Smoke',
    description: 'Clean bright white particulate smoke.',
    cssFilter: 'contrast(0.92) brightness(1.06)',
    defaultIntensity: 50,
    defaultOpacity: 80,
    defaultSpeed: 30,
    defaultAngle: 0,
    defaultDirection: 'vertical',
    defaultBlendMode: 'screen'
  },
  {
    id: 'smoke-black',
    name: 'Black Smoke',
    category: 'Smoke',
    description: 'Dark carbonaceous oil-fire smoke plumes.',
    cssFilter: 'contrast(1.15) brightness(0.75)',
    defaultIntensity: 60,
    defaultOpacity: 90,
    defaultSpeed: 35,
    defaultAngle: 0,
    defaultDirection: 'vertical',
    defaultBlendMode: 'multiply'
  },
  {
    id: 'smoke-blue',
    name: 'Blue Smoke',
    category: 'Smoke',
    description: 'Vibrant blue chemical smoke trails.',
    cssFilter: 'hue-rotate(200deg) saturate(1.3) brightness(1.02)',
    defaultIntensity: 50,
    defaultOpacity: 80,
    defaultSpeed: 30,
    defaultAngle: 0,
    defaultDirection: 'vertical',
    defaultBlendMode: 'screen'
  },
  {
    id: 'smoke-red',
    name: 'Red Smoke',
    category: 'Smoke',
    description: 'Crimson flare smoke effect.',
    cssFilter: 'hue-rotate(340deg) saturate(1.4) brightness(1.03)',
    defaultIntensity: 50,
    defaultOpacity: 80,
    defaultSpeed: 30,
    defaultAngle: 0,
    defaultDirection: 'vertical',
    defaultBlendMode: 'screen'
  },
  {
    id: 'smoke-green',
    name: 'Green Smoke',
    category: 'Smoke',
    description: 'Toxic neon green smoke vapors.',
    cssFilter: 'hue-rotate(100deg) saturate(1.3) brightness(1.02)',
    defaultIntensity: 50,
    defaultOpacity: 80,
    defaultSpeed: 30,
    defaultAngle: 0,
    defaultDirection: 'vertical',
    defaultBlendMode: 'screen'
  },
  {
    id: 'smoke-purple',
    name: 'Purple Smoke',
    category: 'Smoke',
    description: 'Mystical violet smoke haze.',
    cssFilter: 'hue-rotate(270deg) saturate(1.35) brightness(1.04)',
    defaultIntensity: 50,
    defaultOpacity: 80,
    defaultSpeed: 30,
    defaultAngle: 0,
    defaultDirection: 'vertical',
    defaultBlendMode: 'screen'
  },
  {
    id: 'smoke-orange',
    name: 'Orange Smoke',
    category: 'Smoke',
    description: 'Industrial bright orange smoke drift.',
    cssFilter: 'hue-rotate(25deg) saturate(1.4) brightness(1.05)',
    defaultIntensity: 55,
    defaultOpacity: 85,
    defaultSpeed: 32,
    defaultAngle: 0,
    defaultDirection: 'vertical',
    defaultBlendMode: 'screen'
  },
  {
    id: 'smoke-cinematic',
    name: 'Cinematic Smoke',
    category: 'Smoke',
    description: 'Moody atmospheric volume smoke layers.',
    cssFilter: 'contrast(0.93) brightness(1.01)',
    defaultIntensity: 45,
    defaultOpacity: 75,
    defaultSpeed: 20,
    defaultAngle: 0,
    defaultDirection: 'horizontal',
    defaultBlendMode: 'screen'
  },
  {
    id: 'smoke-explosion',
    name: 'Explosion Smoke',
    category: 'Smoke',
    description: 'Rapidly billowing expansion smoke.',
    cssFilter: 'contrast(1.1) brightness(0.9)',
    defaultIntensity: 80,
    defaultOpacity: 95,
    defaultSpeed: 55,
    defaultAngle: 0,
    defaultDirection: 'diagonal',
    defaultBlendMode: 'screen'
  },
  {
    id: 'smoke-fire',
    name: 'Fire Smoke',
    category: 'Smoke',
    description: 'Sooty heat smoke emitted by roaring flames.',
    cssFilter: 'contrast(1.05) brightness(0.85) saturate(1.1)',
    defaultIntensity: 70,
    defaultOpacity: 90,
    defaultSpeed: 40,
    defaultAngle: 0,
    defaultDirection: 'vertical',
    defaultBlendMode: 'screen'
  },
  {
    id: 'smoke-custom',
    name: 'Custom Color Smoke',
    category: 'Smoke',
    description: 'Configurable colored particles and density.',
    cssFilter: 'contrast(0.95)',
    defaultIntensity: 50,
    defaultOpacity: 85,
    defaultSpeed: 30,
    defaultAngle: 0,
    defaultDirection: 'vertical',
    defaultBlendMode: 'screen'
  }
];

// Generate remainder to have exactly 50 smoke presets
for (let i = list.length + 1; i <= 50; i++) {
  list.push({
    id: `smoke-preset-${i}`,
    name: `Smoke Vapors ${i}`,
    category: 'Smoke',
    description: `Atmospheric smoke preset variant #${i} with custom turbulences.`,
    cssFilter: `contrast(${0.95 - (i % 4) * 0.02}) brightness(${1.02 + (i % 3) * 0.02})`,
    defaultIntensity: 45 + (i % 6) * 5,
    defaultOpacity: 80 + (i % 3) * 4,
    defaultSpeed: 25 + (i % 7) * 4,
    defaultAngle: 0,
    defaultDirection: 'vertical',
    defaultBlendMode: 'screen'
  });
}

export const SMOKE_EFFECTS = list;
