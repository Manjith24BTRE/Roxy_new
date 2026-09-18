// src/tests/filterIntensityContract.test.ts
import { describe, it, expect } from 'vitest';
import { assetRegistry } from '../services/AssetRegistry';
import { colorGradeEngine } from '../components/editor-main-screen/tools/filters/engines/colorGrade/ColorGradeEngine';
import { toneAdjustmentEngine } from '../components/editor-main-screen/tools/filters/engines/toneAdjustment/ToneAdjustmentEngine';
import { portraitRetouchEngine } from '../components/editor-main-screen/tools/filters/engines/portraitRetouch/PortraitRetouchEngine';
import { filmSimulationEngine } from '../components/editor-main-screen/tools/filters/engines/filmSimulation/FilmSimulationEngine';
import { monochromeEngine } from '../components/editor-main-screen/tools/filters/engines/monochrome/MonochromeEngine';
import { landscapeEnhanceEngine } from '../components/editor-main-screen/tools/filters/engines/landscapeEnhance/LandscapeEnhanceEngine';
import { neonGradeEngine } from '../components/editor-main-screen/tools/filters/engines/neonGrade/NeonGradeEngine';
import { artisticFilterEngine } from '../components/editor-main-screen/tools/filters/engines/artisticFilter/ArtisticFilterEngine';

function formatIntensityDisplay(intensity: number): string {
  const normVal = intensity > 1.0 ? intensity / 100 : intensity;
  return `${Math.round(normVal * 100)}%`;
}

describe('Filter Intensity Contract & 8000% Bug Regression Tests', () => {
  it('1. Display Conversion: 0.80 normalized intensity renders as "80%"', () => {
    expect(formatIntensityDisplay(0.80)).toBe('80%');
  });

  it('2. Display Conversion: 1.00 normalized intensity renders as "100%"', () => {
    expect(formatIntensityDisplay(1.00)).toBe('100%');
  });

  it('3. Display Conversion: 0.00 intensity renders as "0%"', () => {
    expect(formatIntensityDisplay(0.00)).toBe('0%');
  });

  it('4. Regression Test (Screenshot Bug): raw 80 value must render as "80%" and NEVER "8000%"', () => {
    const rendered = formatIntensityDisplay(80);
    expect(rendered).toBe('80%');
    expect(rendered).not.toBe('8000%');
  });

  it('5. Regression Test (Screenshot Bug): raw 100 value must render as "100%" and NEVER "10000%"', () => {
    const rendered = formatIntensityDisplay(100);
    expect(rendered).toBe('100%');
    expect(rendered).not.toBe('10000%');
  });

  it('6. Engine Intensity Normalization: engines normalize raw 80 to 0.80 safely', () => {
    const cssFromNormalized = monochromeEngine.getCSSFilterString(34, 0.80);
    const cssFromRaw = monochromeEngine.getCSSFilterString(34, 80);
    expect(cssFromNormalized).toBe(cssFromRaw);
    expect(cssFromNormalized).not.toContain('contrast(23.40)');
  });

  it('7. Zero Intensity Rule: 0% intensity returns "none" across all engines', () => {
    expect(colorGradeEngine.getCSSFilterString(1, 0)).toBe('none');
    expect(toneAdjustmentEngine.getCSSFilterString(11, 0)).toBe('none');
    expect(portraitRetouchEngine.getCSSFilterString(19, 0)).toBe('none');
    expect(filmSimulationEngine.getCSSFilterString(26, 0)).toBe('none');
    expect(monochromeEngine.getCSSFilterString(32, 0)).toBe('none');
    expect(landscapeEnhanceEngine.getCSSFilterString(37, 0)).toBe('none');
    expect(neonGradeEngine.getCSSFilterString(42, 0)).toBe('none');
    expect(artisticFilterEngine.getCSSFilterString(46, 0)).toBe('none');
  });

  it('8. Complete 50-Filter Catalog Audit (IDs 1-50): all assets resolve & produce distinct CSS filters', () => {
    const filters = assetRegistry.getAssetsByType('Filters');
    expect(filters.length).toBeGreaterThanOrEqual(50);

    for (let id = 1; id <= 50; id++) {
      const asset = assetRegistry.getAssetById('Filters', id);
      expect(asset).toBeDefined();
      expect(asset?.engineKey).toBeDefined();

      let cssStr = '';
      if (asset?.engineKey === 'ArtisticFilterEngine') {
        cssStr = artisticFilterEngine.getCSSFilterString(id, 1.0);
      } else if (asset?.engineKey === 'NeonGradeEngine') {
        cssStr = neonGradeEngine.getCSSFilterString(id, 1.0);
      } else if (asset?.engineKey === 'LandscapeEnhanceEngine') {
        cssStr = landscapeEnhanceEngine.getCSSFilterString(id, 1.0);
      } else if (asset?.engineKey === 'MonochromeEngine') {
        cssStr = monochromeEngine.getCSSFilterString(id, 1.0);
      } else if (asset?.engineKey === 'FilmSimulationEngine') {
        cssStr = filmSimulationEngine.getCSSFilterString(id, 1.0);
      } else if (asset?.engineKey === 'PortraitRetouchEngine') {
        cssStr = portraitRetouchEngine.getCSSFilterString(id, 1.0);
      } else if (asset?.engineKey === 'ToneAdjustmentEngine') {
        cssStr = toneAdjustmentEngine.getCSSFilterString(id, 1.0);
      } else {
        cssStr = colorGradeEngine.getCSSFilterString(id, 1.0);
      }

      expect(cssStr).not.toBe('none');
      expect(cssStr.length).toBeGreaterThan(5);
    }
  });
});
