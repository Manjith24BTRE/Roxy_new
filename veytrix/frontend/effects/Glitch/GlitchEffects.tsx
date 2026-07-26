import React from 'react';
import { EffectGrid } from '../components/EffectGrid';
import { GLITCH_EFFECTS } from './GlitchEffects.data';

interface GlitchEffectsProps {
  activeEffectId: string | null;
  onSelectEffect: (id: string | null) => void;
  searchQuery: string;
}

export function GlitchEffects({ activeEffectId, onSelectEffect, searchQuery }: GlitchEffectsProps) {
  return (
    <EffectGrid
      effects={GLITCH_EFFECTS}
      activeEffectId={activeEffectId}
      onSelectEffect={onSelectEffect}
      searchQuery={searchQuery}
      category="glitch"
    />
  );
}

export default GlitchEffects;
