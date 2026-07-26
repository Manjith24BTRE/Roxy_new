import React from 'react';
import { EffectGrid, EffectItem } from '../components/EffectGrid';

export const LIGHT_EFFECTS: EffectItem[] = [
  { id: 'aurora-glow', name: 'Aurora Glow', description: 'Wavy green and purple volumetric skies.', icon: '🌌' },
  { id: 'bloom', name: 'Bloom', description: 'Feathers bright highlights to bleed over darker surroundings.', icon: '🌸' },
  { id: 'blue-glow', name: 'Blue Glow', description: 'Electric cyan highlights giving high-tech cyber feeling.', icon: '🔵' },
  { id: 'flash-light', name: 'Flash Light', description: 'Intense short bursts of complete screen whiteouts.', icon: '⚡' },
  { id: 'glow', name: 'Glow', description: 'Diffused bright light halo wrapping around subject borders.', icon: '🌟' },
  { id: 'god-rays', name: 'God Rays', description: 'Epic crepuscular shafts of light drawing drama.', icon: '⛪' },
  { id: 'golden-glow', name: 'Golden Glow', description: 'Rich amber-gold ambient highlights for warm portraits.', icon: '👑' },
  { id: 'lens-flare', name: 'Lens Flare', description: 'Classic cinematic multi-element ring flare from bright sources.', icon: '✨' },
  { id: 'light-burst', name: 'Light Burst', description: 'Luminous light beams exploding from high-contrast spots.', icon: '💥' },
  { id: 'light-leak', name: 'Light Leak', description: 'Simulates analog film stock exposure to stray light rays.', icon: '🕯️' },
  { id: 'light-reflection', name: 'Light Reflection', description: 'Specular water-like light reflections bouncing upward.', icon: '🌊' },
  { id: 'neon-glow', name: 'Neon Glow', description: 'Vibrant self-illuminating colors surrounding shapes.', icon: '🚨' },
  { id: 'orange-glow', name: 'Orange Glow', description: 'Fiery orange light wash mimicking campfire warmth.', icon: '🟠' },
  { id: 'pink-glow', name: 'Pink Glow', description: 'Warm magenta/pink soft light overlay.', icon: '🔴' },
  { id: 'prism-light', name: 'Prism Light', description: 'Rainbow chromatic dispersion edges around subjects.', icon: '💎' },
  { id: 'rainbow-light', name: 'Rainbow Light', description: 'Prismatic spectral refraction stripes crossing the frame.', icon: '🌈' },
  { id: 'soft-light', name: 'Soft Light', description: 'Gentle low-intensity ambient exposure lift.', icon: '💡' },
  { id: 'spotlight', name: 'Spotlight', description: 'Circular cone of bright focus lighting with dark vignetting.', icon: '🔦' },
  { id: 'sun-rays', name: 'Sun Rays', description: 'Beams of golden light streaming down through clouds.', icon: '☀️' },
  { id: 'volumetric-light', name: 'Volumetric Light', description: 'Dust particles caught inside thick beams of spotlights.', icon: '🌫️' }
];

interface LightEffectsProps {
  activeEffectId: string | null;
  onSelectEffect: (id: string | null) => void;
  searchQuery: string;
}

export function LightEffects({ activeEffectId, onSelectEffect, searchQuery }: LightEffectsProps) {
  return (
    <EffectGrid
      effects={LIGHT_EFFECTS}
      activeEffectId={activeEffectId}
      onSelectEffect={onSelectEffect}
      searchQuery={searchQuery}
      category="light"
    />
  );
}

export default LightEffects;
