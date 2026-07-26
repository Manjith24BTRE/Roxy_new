import React from 'react';
import { EffectGrid } from '../components/EffectGrid';
import { RETRO_VHS_EFFECTS } from './RetroVHSEffects.data';

interface RetroVHSEffectsProps {
  activeEffectId: string | null;
  onSelectEffect: (id: string | null) => void;
  searchQuery: string;
}

export function RetroVHSEffects({
  activeEffectId,
  onSelectEffect,
  searchQuery
}: RetroVHSEffectsProps) {
  return (
    <EffectGrid
      effects={RETRO_VHS_EFFECTS}
      activeEffectId={activeEffectId}
      onSelectEffect={onSelectEffect}
      searchQuery={searchQuery}
      category="retro-vhs"
    />
  );
}

export default RetroVHSEffects;
