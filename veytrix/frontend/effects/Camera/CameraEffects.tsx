import React from 'react';
import { EffectGrid } from '../components/EffectGrid';
import { CAMERA_EFFECTS } from './CameraEffects.data';

interface CameraEffectsProps {
  activeEffectId: string | null;
  onSelectEffect: (id: string | null) => void;
  searchQuery: string;
}

export function CameraEffects({ activeEffectId, onSelectEffect, searchQuery }: CameraEffectsProps) {
  return (
    <EffectGrid
      effects={CAMERA_EFFECTS}
      activeEffectId={activeEffectId}
      onSelectEffect={onSelectEffect}
      searchQuery={searchQuery}
      category="camera"
    />
  );
}

export default CameraEffects;
