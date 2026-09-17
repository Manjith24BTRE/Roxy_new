import { supabase } from '../lib/supabase';
import { AIModel } from '../types';

const MEDIA_FILE_EXTENSIONS = [
  '.mp4', '.mov', '.avi', '.mkv', '.webm',
  '.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg',
  '.mp3', '.wav', '.aac', '.m4a', '.ogg', '.flac'
];

export const modelsService = {
  /**
   * Sources AI models & engines catalog exclusively from dedicated engine records.
   * Enforces strict validation to prevent media files/projects from rendering as engines.
   */
  async getModels(): Promise<AIModel[]> {
    console.log('[modelsService.getModels] Initiating fetch for AI Models & Engines catalog...');

    let rawEngines: any[] = [];
    let sourceUsed = 'ai_engines';

    try {
      // 1. Primary Source: Query dedicated ai_engines table
      const { data: enginesData, error: enginesError } = await supabase
        .from('ai_engines')
        .select('*');

      if (!enginesError && enginesData && enginesData.length > 0) {
        rawEngines = enginesData;
      } else {
        // 2. Secondary Source: Query assets table strictly for type = 'ENGINE' or 'AI_ENGINE'
        sourceUsed = 'assets (type=ENGINE)';
        const { data: assetsData, error: assetsError } = await supabase
          .from('assets')
          .select('*')
          .in('type', ['ENGINE', 'AI_ENGINE']);

        if (!assetsError && assetsData) {
          rawEngines = assetsData;
        }
      }
    } catch (err) {
      console.warn('[modelsService.getModels] Error querying engine source:', err);
    }

    // 3. Strict Validation & Filtering
    const validEngines: AIModel[] = [];
    const seenIds = new Set<string>();
    let rejectedMediaCount = 0;

    for (const item of rawEngines) {
      const id = String(item.id || item.engine_key || '').trim();
      const name = String(item.name || '').trim();
      const nameLower = name.toLowerCase();

      // Check 1: Reject media file extensions (.mp4, .mov, .jpg, .png, etc.)
      const hasMediaExtension = MEDIA_FILE_EXTENSIONS.some((ext) => nameLower.endsWith(ext) || nameLower.includes(ext));
      if (hasMediaExtension) {
        rejectedMediaCount++;
        console.warn(`[modelsService.getModels] Rejected media asset masquerading as engine: "${name}" (${id})`);
        continue;
      }

      // Check 2: Reject non-engine asset types if sourced from assets table
      const itemType = String(item.type || '').toUpperCase();
      if (['VIDEO', 'IMAGE', 'AUDIO', 'EXPORT', 'THUMBNAIL', 'EFFECT', 'FILTER', 'TRANSITION'].includes(itemType)) {
        rejectedMediaCount++;
        console.warn(`[modelsService.getModels] Rejected media type "${itemType}": "${name}" (${id})`);
        continue;
      }

      // Check 3: Deduplicate by unique ID
      if (seenIds.has(id)) {
        console.warn(`[modelsService.getModels] Duplicate engine ID ignored: "${id}"`);
        continue;
      }

      seenIds.add(id);
      validEngines.push({
        id: id || `engine_${validEngines.length + 1}`,
        name: name || 'Unnamed Engine',
        version: item.version ? (String(item.version).startsWith('v') ? String(item.version) : `v${item.version}.0`) : 'v1.0',
        status: item.enabled !== false && item.status !== 'Deprecated' ? 'Active' : 'Deprecated',
        provider: item.provider || item.engine_key || 'Veytrix Native Engine',
        usageCount: item.usage_count || 0,
        successRate: item.success_rate || 100,
        avgLatencyMs: item.avg_latency_ms || 0,
      });
    }

    console.log(`[modelsService.getModels] Source: ${sourceUsed} | Fetched: ${rawEngines.length} | Valid Engines: ${validEngines.length} | Rejected Media Files: ${rejectedMediaCount}`);

    return validEngines;
  },
};
