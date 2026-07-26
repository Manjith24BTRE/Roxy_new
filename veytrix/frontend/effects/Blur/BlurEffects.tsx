import React from 'react';
import { EffectGrid } from '../components/EffectGrid';
import { BLUR_EFFECTS } from './BlurEffects.data';

interface BlurEffectsProps {
  activeEffectId: string | null;
  onSelectEffect: (id: string | null) => void;
  searchQuery: string;
}

export function BlurEffects({ activeEffectId, onSelectEffect, searchQuery }: BlurEffectsProps) {
  return (
    <EffectGrid
      effects={BLUR_EFFECTS}
      activeEffectId={activeEffectId}
      onSelectEffect={onSelectEffect}
      searchQuery={searchQuery}
      category="blur"
    />
  );
}

export default BlurEffects;
