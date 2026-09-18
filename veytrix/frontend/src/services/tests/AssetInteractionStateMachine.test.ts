// src/services/tests/AssetInteractionStateMachine.test.ts
import { describe, it, expect } from 'vitest';
import { AssetInteractionState, calculateEffectLocalProgress, FilterInstanceParameters, EffectInstanceParameters, TransitionInstanceParameters } from '../../types/assetInteraction';
import { assetRegistry } from '../AssetRegistry';

describe('3-Click Asset Interaction State Machine', () => {
  it('should initialize asset registry and load assets correctly', () => {
    const filters = assetRegistry.getAssetsByType('Filters');
    const effects = assetRegistry.getAssetsByType('Effects');
    const transitions = assetRegistry.getAssetsByType('Transitions');

    expect(filters.length).toBeGreaterThan(0);
    expect(effects.length).toBeGreaterThan(0);
    expect(transitions.length).toBeGreaterThan(0);
  });

  it('should execute 3-click cycle deterministically for Filters', () => {
    let activeFilterId: string | null = null;
    let interactionState: AssetInteractionState = 'not-applied';

    // Helper simulating asset click handler
    const handleClick = (assetId: string) => {
      if (activeFilterId !== assetId) {
        // CLICK 1: APPLY / SELECT
        activeFilterId = assetId;
        interactionState = 'applied-selected';
      } else {
        if (interactionState === 'applied-selected') {
          // CLICK 2: OPEN SETTINGS
          interactionState = 'settings-open';
        } else if (interactionState === 'settings-open') {
          // CLICK 3: REMOVE FILTER
          activeFilterId = null;
          interactionState = 'not-applied';
        }
      }
    };

    const testAssetId = 'Cinematic_101';

    // Click 1 -> Apply
    handleClick(testAssetId);
    expect(activeFilterId).toBe(testAssetId);
    expect(interactionState).toBe('applied-selected');

    // Click 2 -> Open Settings
    handleClick(testAssetId);
    expect(activeFilterId).toBe(testAssetId);
    expect(interactionState).toBe('settings-open');

    // Click 3 -> Remove & Reset
    handleClick(testAssetId);
    expect(activeFilterId).toBeNull();
    expect(interactionState).toBe('not-applied');

    // Subsequent Click 1 -> Re-apply
    handleClick(testAssetId);
    expect(activeFilterId).toBe(testAssetId);
    expect(interactionState).toBe('applied-selected');
  });

  it('should execute 3-click cycle deterministically for Effects', () => {
    let activeEffectId: string | null = null;
    let interactionState: AssetInteractionState = 'not-applied';

    const handleClick = (effectId: string) => {
      if (activeEffectId !== effectId) {
        activeEffectId = effectId;
        interactionState = 'applied-selected';
      } else {
        if (interactionState === 'applied-selected') {
          interactionState = 'settings-open';
        } else if (interactionState === 'settings-open') {
          activeEffectId = null;
          interactionState = 'not-applied';
        }
      }
    };

    const testEffectId = 'Glitch_01';

    handleClick(testEffectId);
    expect(interactionState).toBe('applied-selected');

    handleClick(testEffectId);
    expect(interactionState).toBe('settings-open');

    handleClick(testEffectId);
    expect(activeEffectId).toBeNull();
    expect(interactionState).toBe('not-applied');
  });

  it('should execute 3-click cycle deterministically for Transitions', () => {
    let activeTransitionId: string | null = null;
    let interactionState: AssetInteractionState = 'not-applied';

    const handleClick = (transId: string) => {
      if (activeTransitionId !== transId) {
        activeTransitionId = transId;
        interactionState = 'applied-selected';
      } else {
        if (interactionState === 'applied-selected') {
          interactionState = 'settings-open';
        } else if (interactionState === 'settings-open') {
          activeTransitionId = null;
          interactionState = 'not-applied';
        }
      }
    };

    const testTransId = 'Cross_Dissolve';

    handleClick(testTransId);
    expect(interactionState).toBe('applied-selected');

    handleClick(testTransId);
    expect(interactionState).toBe('settings-open');

    handleClick(testTransId);
    expect(activeTransitionId).toBeNull();
    expect(interactionState).toBe('not-applied');
  });

  it('should calculate bounded effect local progress correctly', () => {
    // Before start time
    expect(calculateEffectLocalProgress(1.0, 2.0, 6.0)).toBe(0.0);
    // Mid point
    expect(calculateEffectLocalProgress(4.0, 2.0, 6.0)).toBe(0.5);
    // After end time
    expect(calculateEffectLocalProgress(7.0, 2.0, 6.0)).toBe(1.0);
  });
});
