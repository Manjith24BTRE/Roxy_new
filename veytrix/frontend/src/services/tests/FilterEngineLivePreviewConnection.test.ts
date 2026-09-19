// src/services/tests/FilterEngineLivePreviewConnection.test.ts
import { describe, it, expect } from 'vitest';
import { filterProcessor } from '../FilterProcessor';

describe('Filter Engine Live Preview Connection', () => {
  it('should compute non-zero filter parameters for Hollywood Gold', () => {
    const params = filterProcessor.process('hollywood_gold', 1.0);
    expect(params).toBeDefined();
    expect(params.contrast).toBe(12);
    expect(params.exposure).toBe(3);
    expect(params.temperature).toBe(10);
    expect(params.saturation).toBeCloseTo(4.25);
  });

  it('should generate immediate visible CSS filter string for live video preview', () => {
    const params = filterProcessor.process('hollywood_gold', 1.0);
    const cssFilter = filterProcessor.toCSSFilterString(params);

    expect(cssFilter).not.toBe('none');
    expect(cssFilter).toContain('brightness(');
    expect(cssFilter).toContain('contrast(');
    expect(cssFilter).toContain('sepia(');
  });

  it('should react linearly when filter intensity changes', () => {
    const params50 = filterProcessor.process('hollywood_gold', 0.5);
    const cssFilter50 = filterProcessor.toCSSFilterString(params50);

    expect(params50.contrast).toBe(6);
    expect(cssFilter50).not.toBe('none');
  });
});
