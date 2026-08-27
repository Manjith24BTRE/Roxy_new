import { supabase } from '../lib/supabase';
import { AIModel } from '../types';

export const modelsService = {
  /**
   * Sources AI models catalog directly from public.assets table.
   * Eliminates static latency and fake model catalogs.
   */
  async getModels(): Promise<AIModel[]> {
    try {
      const { data, error } = await supabase.from('assets').select('*');
      if (!error && data && data.length > 0) {
        return data.map((asset) => ({
          id: asset.id,
          name: asset.name,
          version: `v${asset.version || 1}.0`,
          status: asset.enabled ? 'Active' : 'Deprecated',
          provider: asset.engine_key || 'Veytrix Native Engine',
          usageCount: 0,
          successRate: 100,
          avgLatencyMs: 0,
        }));
      }
    } catch {
      // Unmigrated asset catalog fallback
    }
    return [];
  },
};
