import { CINEMATIC_FILTERS } from './cinematic';
import { COLOR_FILTERS } from './color';
import { PORTRAIT_FILTERS } from './portrait';
import { VINTAGE_FILTERS } from './vintage';
import { BW_FILTERS } from './bw';
import { NATURE_FILTERS } from './nature';
import { NEON_FILTERS } from './neon';
import { ARTISTIC_FILTERS } from './artistic';

export interface FilterSample {
  id: string;
  name: string;
  description: string;
  cssFilter: string; // CSS standard filter rule string
  defaultIntensity: number; // 0 to 100
  thumbnailColor: string; // Tailored color representation (gradient)
  category: string;
}

export const SAMPLE_FILTERS: FilterSample[] = [
  ...CINEMATIC_FILTERS,
  ...COLOR_FILTERS,
  ...PORTRAIT_FILTERS,
  ...VINTAGE_FILTERS,
  ...BW_FILTERS,
  ...NATURE_FILTERS,
  ...NEON_FILTERS,
  ...ARTISTIC_FILTERS
];

export function getInterpolatedFilter(cssFilter: string, intensity: number): string {
  if (intensity === 0) return 'none';
  if (intensity === 100) return cssFilter;
  
  const factor = intensity / 100;
  
  // Regex to match css filter functions: name(value)
  // e.g. sepia(0.4), saturate(1.2), hue-rotate(-15deg), contrast(1.05), blur(4px)
  return cssFilter.replace(/([a-z\-]+)\(([^)]+)\)/g, (match, name, value) => {
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return match;
    
    const unit = value.replace(/[\d\.\-]+/g, ''); // get unit (e.g. deg, px, %)
    
    let interpolated = numValue;
    if (name === 'brightness' || name === 'contrast' || name === 'saturate') {
      // neutral is 1.0
      interpolated = 1 + (numValue - 1) * factor;
    } else {
      // neutral is 0.0
      interpolated = numValue * factor;
    }
    
    return `${name}(${interpolated}${unit})`;
  });
}
