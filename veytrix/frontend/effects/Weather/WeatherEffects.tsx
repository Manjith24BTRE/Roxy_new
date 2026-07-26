import React from 'react';
import { EffectGrid, EffectItem } from '../components/EffectGrid';

export const WEATHER_EFFECTS: EffectItem[] = [
  { id: 'aurora', name: 'Aurora', description: 'Volumetric green/purple northern light curtains moving slowly.', icon: '🌌' },
  { id: 'blizzard', name: 'Blizzard', description: 'Intense snow storm with high wind drift and whiteout fog.', icon: '❄️' },
  { id: 'cherry-blossom', name: 'Cherry Blossom', description: 'Slow falling pink sakura blossom leaves rotating down.', icon: '🌸' },
  { id: 'cloud-overlay', name: 'Cloud Overlay', description: 'Rolling time-lapse sky cloud shadows overlay.', icon: '☁️' },
  { id: 'dust-storm', name: 'Dust Storm', description: 'Dry orange/brown dirt gusts reducing scene exposure.', icon: '🌪' },
  { id: 'falling-leaves', name: 'Falling Leaves', description: 'Autumn brown/orange leaves spinning and drifting.', icon: '🍁' },
  { id: 'hail-storm', name: 'Hail Storm', description: 'Fast vertical bounce particles simulating hail ice stones.', icon: '🌨️' },
  { id: 'heavy-rain', name: 'Heavy Rain', description: 'Dense falling rain streaks with water splashes at bottom.', icon: '🌧️' },
  { id: 'lightning-flash', name: 'Lightning Flash', description: 'Sudden high exposure blue-white flashes mimicking storm lightning.', icon: '⚡' },
  { id: 'meteor-shower', name: 'Meteor Shower', description: 'Rapid falling star fire streaks cutting diagonally.', icon: '🌠' },
  { id: 'moonlight', name: 'Moonlight', description: 'Cool dark blue exposure grading with soft white light rays.', icon: '🌙' },
  { id: 'rain', name: 'Rain', description: 'Gentle vertical falling water streaks overlay.', icon: '🌧️' },
  { id: 'rainbow', name: 'Rainbow', description: 'Soft spectral color arc bending across the top viewport.', icon: '🌈' },
  { id: 'sandstorm', name: 'Sandstorm', description: 'Dense dry sand sweeps blowing across desert coordinates.', icon: '🏜️' },
  { id: 'snow', name: 'Snow', description: 'Gentle slow falling white flakes drifting randomly.', icon: '❄️' },
  { id: 'starry-night', name: 'Starry Night', description: 'Glinting white star dots rotating slowly in background.', icon: '⭐' },
  { id: 'storm-rain', name: 'Storm Rain', description: 'Heavy angled rain with dark cloud vignettes.', icon: '⛈️' },
  { id: 'sunshine-rays', name: 'Sunshine Rays', description: 'Warm golden sunshafts radiating from corner coordinates.', icon: '☀️' },
  { id: 'thunder-flash', name: 'Thunder Flash', description: 'Quick whiteout flashes synced with screen vibrations.', icon: '⚡' },
  { id: 'wind-effect', name: 'Wind Effect', description: 'Drifting speed lines and horizontal pixel refractions.', icon: '💨' }
];

interface WeatherEffectsProps {
  activeEffectId: string | null;
  onSelectEffect: (id: string | null) => void;
  searchQuery: string;
}

export function WeatherEffects({
  activeEffectId,
  onSelectEffect,
  searchQuery
}: WeatherEffectsProps) {
  return (
    <EffectGrid
      effects={WEATHER_EFFECTS}
      activeEffectId={activeEffectId}
      onSelectEffect={onSelectEffect}
      searchQuery={searchQuery}
      category="weather"
    />
  );
}

export default WeatherEffects;
