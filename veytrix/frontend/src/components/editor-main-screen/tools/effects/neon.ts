import { EffectPreset } from './effectsPreset';

const list: EffectPreset[] = [
  {
    id: 'neon-light',
    name: 'Neon Light',
    category: 'Neon',
    description: 'Create a realistic neon lighting effect that surrounds bright areas and outlines with smooth glowing illumination.',
    cssFilter: 'saturate(1.4) brightness(1.15)',
    defaultIntensity: 50,
    defaultOpacity: 100,
    defaultSpeed: 0,
    defaultAngle: 0,
    defaultDirection: 'horizontal',
    defaultBlendMode: 'screen'
  }
];

for (let i = 1; i <= 49; i++) {
  list.push({
    id: `neon-preset-${i}`,
    name: `Neon Glow ${i}`,
    category: 'Neon',
    description: `Futuristic electric neon color glow preset variant #${i}.`,
    cssFilter: `saturate(${1.4 + i / 120}) brightness(${1.1 + i / 350})`,
    defaultIntensity: 60,
    defaultOpacity: 100,
    defaultSpeed: 0,
    defaultAngle: 0,
    defaultDirection: 'horizontal',
    defaultBlendMode: 'screen'
  });
}

export const NEON_EFFECTS = list;
