import { supabase } from '../lib/supabase';
import { FeatureFlag } from '../types';

export const featureFlagsService = {
  /**
   * Sources feature flags from public.feature_flags. Returns clean empty state if empty.
   */
  async getFeatureFlags(): Promise<FeatureFlag[]> {
    try {
      const { data, error } = await supabase.from('feature_flags').select('*');
      if (!error && data && data.length > 0) {
        return data.map((f) => ({
          id: f.id,
          name: f.name,
          key: f.key,
          status: f.status ?? false,
          environment: f.environment || 'Production',
          rolloutPercentage: f.rollout_percentage || 100,
          lastUpdated: f.updated_at || new Date().toISOString(),
        }));
      }
    } catch {
      // Unmigrated schema handler
    }
    return [];
  },
};
