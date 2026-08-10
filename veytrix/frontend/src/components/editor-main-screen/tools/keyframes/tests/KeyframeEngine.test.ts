import { describe, it, expect } from 'vitest';
import { KeyframeManager } from '../KeyframeManager';
import { interpolatePropertyValue } from '../interpolator';
import { KeyframePoint } from '../keyframes.types';
import { SplitManager } from '../../split/SplitManager';
import { duplicateClipInSequence, duplicateTimelineClip } from '../../duplicate/duplicate.utils';

describe('Keyframe Engine & Manager', () => {
  const makeMockKeyframe = (overrides: Partial<KeyframePoint> = {}): KeyframePoint => ({
    id: `kf-${Math.random().toString(36).substr(2, 9)}`,
    property: 'scale',
    time: 1.0,
    value: 1.5,
    interpolation: 'linear',
    ...overrides
  });

  describe('CRUD Operations', () => {
    it('should add a keyframe to an empty list', () => {
      const result = KeyframeManager.addOrUpdateKeyframe([], 'scale', 2.0, 2.0, 'linear');
      expect(result).toHaveLength(1);
      expect(result[0].property).toBe('scale');
      expect(result[0].time).toBe(2.0);
      expect(result[0].value).toBe(2.0);
      expect(result[0].interpolation).toBe('linear');
    });

    it('should update an existing keyframe if within the time threshold', () => {
      const initial = [makeMockKeyframe({ property: 'scale', time: 2.0, value: 1.0 })];
      const result = KeyframeManager.addOrUpdateKeyframe(initial, 'scale', 2.02, 2.5, 'easeIn');
      expect(result).toHaveLength(1);
      expect(result[0].value).toBe(2.5);
      expect(result[0].interpolation).toBe('easeIn');
    });

    it('should allow multiple keyframes to coexist for the same property', () => {
      let keyframes: KeyframePoint[] = [];
      keyframes = KeyframeManager.addOrUpdateKeyframe(keyframes, 'scale', 0.0, 1.0);
      keyframes = KeyframeManager.addOrUpdateKeyframe(keyframes, 'scale', 2.0, 1.5);
      keyframes = KeyframeManager.addOrUpdateKeyframe(keyframes, 'scale', 4.0, 2.0);

      expect(keyframes).toHaveLength(3);
      expect(keyframes[0].time).toBe(0.0);
      expect(keyframes[0].value).toBe(1.0);
      expect(keyframes[1].time).toBe(2.0);
      expect(keyframes[1].value).toBe(1.5);
      expect(keyframes[2].time).toBe(4.0);
      expect(keyframes[2].value).toBe(2.0);
    });

    it('should delete a keyframe by ID', () => {
      const kf = makeMockKeyframe();
      const initial = [kf];
      const result = KeyframeManager.deleteKeyframe(initial, kf.id);
      expect(result).toHaveLength(0);
    });

    it('should move a keyframe to a new timestamp', () => {
      const kf = makeMockKeyframe({ time: 1.0 });
      const initial = [kf];
      const result = KeyframeManager.moveKeyframe(initial, kf.id, 3.5);
      expect(result[0].time).toBe(3.5);
    });
  });

  describe('Interpolation calculations', () => {
    it('should return defaultValue if there are no keyframes', () => {
      const val = interpolatePropertyValue([], 'scale', 2.0, 1.0);
      expect(val).toBe(1.0);
    });

    it('should return the single value if there is only one keyframe', () => {
      const kf = makeMockKeyframe({ time: 2.0, value: 2.5 });
      const val = interpolatePropertyValue([kf], 'scale', 1.0, 1.0);
      expect(val).toBe(2.5);
    });

    it('should compute linear interpolation correctly', () => {
      const kf1 = makeMockKeyframe({ time: 1.0, value: 1.0, interpolation: 'linear' });
      const kf2 = makeMockKeyframe({ time: 3.0, value: 3.0, interpolation: 'linear' });
      const val = interpolatePropertyValue([kf1, kf2], 'scale', 2.0, 1.0);
      expect(val).toBe(2.0);
    });

    it('should compute hold interpolation correctly', () => {
      const kf1 = makeMockKeyframe({ time: 1.0, value: 1.0, interpolation: 'hold' });
      const kf2 = makeMockKeyframe({ time: 3.0, value: 3.0, interpolation: 'hold' });
      const val = interpolatePropertyValue([kf1, kf2], 'scale', 2.9, 1.0);
      expect(val).toBe(1.0);
      const valAfter = interpolatePropertyValue([kf1, kf2], 'scale', 3.1, 1.0);
      expect(valAfter).toBe(3.0);
    });

    it('should bound playhead coordinates to first or last keyframe', () => {
      const kf1 = makeMockKeyframe({ time: 2.0, value: 1.5 });
      const kf2 = makeMockKeyframe({ time: 4.0, value: 3.5 });
      const before = interpolatePropertyValue([kf1, kf2], 'scale', 1.0, 1.0);
      expect(before).toBe(1.5);
      const after = interpolatePropertyValue([kf1, kf2], 'scale', 5.0, 1.0);
      expect(after).toBe(3.5);
    });
  });

  describe('Split Timeline Clips', () => {
    it('should partition keyframes around split playhead', () => {
      const keyframes = [
        makeMockKeyframe({ id: 'k1', time: 1.0, value: 1.0 }),
        makeMockKeyframe({ id: 'k2', time: 3.0, value: 3.0 }),
        makeMockKeyframe({ id: 'k3', time: 5.0, value: 5.0 })
      ];

      const { leftKeyframes, rightKeyframes } = KeyframeManager.splitClipKeyframes(keyframes, 4.0);

      expect(leftKeyframes).toHaveLength(2);
      expect(leftKeyframes[0].value).toBe(1.0);
      expect(leftKeyframes[0].time).toBe(1.0);
      expect(leftKeyframes[1].value).toBe(3.0);
      expect(leftKeyframes[1].time).toBe(3.0);

      expect(rightKeyframes).toHaveLength(1);
      expect(rightKeyframes[0].value).toBe(5.0);
      // Relative time shift for the right clip
      expect(rightKeyframes[0].time).toBe(1.0); // 5.0 - 4.0 = 1.0
    });
  });

  describe('Trim Timeline Clips', () => {
    it('should keep keyframes within trimmed boundaries', () => {
      const keyframes = [
        makeMockKeyframe({ time: 1.0 }),
        makeMockKeyframe({ time: 4.0 }),
        makeMockKeyframe({ time: 7.0 })
      ];

      const result = KeyframeManager.trimClipKeyframes(keyframes, 5.0);
      expect(result).toHaveLength(2);
      expect(result[0].time).toBe(1.0);
      expect(result[1].time).toBe(4.0);
    });
  });

  describe('Duplication and Cloning', () => {
    it('should clone keyframe array with fresh unique IDs', () => {
      const keyframes = [
        makeMockKeyframe({ id: 'same-id-1', value: 10 }),
        makeMockKeyframe({ id: 'same-id-2', value: 20 })
      ];

      const duplicated = KeyframeManager.duplicateClipKeyframes(keyframes);
      expect(duplicated).toHaveLength(2);
      expect(duplicated[0].id).not.toBe('same-id-1');
      expect(duplicated[1].id).not.toBe('same-id-2');
      expect(duplicated[0].value).toBe(10);
      expect(duplicated[1].value).toBe(20);
    });
  });
});
