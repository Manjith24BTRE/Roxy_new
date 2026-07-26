import React from 'react';
import { EffectGrid } from '../components/EffectGrid';
import { FIRE_EFFECTS } from './FireEffects.data';

interface FireEffectsProps {
  activeEffectId: string | null;
  onSelectEffect: (id: string | null) => void;
  searchQuery: string;
}

export function FireEffects({
  activeEffectId,
  onSelectEffect,
  searchQuery
}: FireEffectsProps) {
  return (
    <EffectGrid
      effects={FIRE_EFFECTS}
      activeEffectId={activeEffectId}
      onSelectEffect={onSelectEffect}
      searchQuery={searchQuery}
      category="fire"
    />
  );
}

export default FireEffects;
