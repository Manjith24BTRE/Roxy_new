import React from 'react';
import { EffectGrid } from '../components/EffectGrid';
import { SMOKE_EFFECTS } from './SmokeEffects.data';

interface SmokeEffectsProps {
  activeEffectId: string | null;
  onSelectEffect: (id: string | null) => void;
  searchQuery: string;
}

export function SmokeEffects({
  activeEffectId,
  onSelectEffect,
  searchQuery
}: SmokeEffectsProps) {
  return (
    <EffectGrid
      effects={SMOKE_EFFECTS}
      activeEffectId={activeEffectId}
      onSelectEffect={onSelectEffect}
      searchQuery={searchQuery}
      category="smoke"
    />
  );
}

export default SmokeEffects;
