import React from 'react';
import { EffectGrid } from '../components/EffectGrid';
import { PARTICLES_EFFECTS } from './ParticlesEffects.data';

interface ParticlesEffectsProps {
  activeEffectId: string | null;
  onSelectEffect: (id: string | null) => void;
  searchQuery: string;
}

export function ParticlesEffects({
  activeEffectId,
  onSelectEffect,
  searchQuery
}: ParticlesEffectsProps) {
  return (
    <EffectGrid
      effects={PARTICLES_EFFECTS}
      activeEffectId={activeEffectId}
      onSelectEffect={onSelectEffect}
      searchQuery={searchQuery}
      category="particles"
    />
  );
}

export default ParticlesEffects;
