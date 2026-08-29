import { supabase } from '../lib/supabase';
import { AIJob } from '../types';
import { mockAIJobs } from '../data/mockData';

export interface AIJobsFetchOptions {
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export interface AIJobsPaginatedResponse {
  jobs: AIJob[];
  totalCount: number;
}

export const aiJobsService = {
  /**
   * Fetches AI video rendering and inference jobs from Supabase.
   * RBAC Security Gate Placeholder: 'ai.jobs.read'
   */
  async getJobs(options: AIJobsFetchOptions = {}): Promise<AIJobsPaginatedResponse> {
    const { search = '', status, page = 1, limit = 10 } = options;
    const offset = (page - 1) * limit;

    try {
      let query = supabase
        .from('exports')
        .select('*', { count: 'exact' });

      if (search) {
        query = query.or(`id.ilike.%${search}%,resolution.ilike.%${search}%`);
      }

      if (status && status !== 'All') {
        query = query.eq('status', status.toLowerCase());
      }

      query = query.range(offset, offset + limit - 1).order('created_at', { ascending: false });

      const { data, count, error } = await query;

      if (error) {
        console.error('Supabase exports query error:', error);
        throw error;
      }

      const jobs: AIJob[] = (data || []).map((exp) => ({
        id: exp.id,
        userId: exp.user_id || '',
        modelId: 'export-engine',
        type: `Video Export (${exp.resolution || '1080p'})`,
        status: exp.status === 'completed' ? 'Completed' : exp.status === 'failed' ? 'Failed' : 'Processing',
        startedAt: exp.created_at || new Date().toISOString(),
        completedAt: exp.updated_at,
        durationMs: 0,
        error: undefined,
      }));

      return {
        jobs,
        totalCount: count ?? jobs.length,
      };
    } catch (e: any) {
      console.error('Failed to fetch exports from Supabase:', e);
      return {
        jobs: [],
        totalCount: 0,
      };
    }
  },

  /**
   * Subscribes to live Supabase Realtime changes for exports and render_jobs tables.
   * RBAC Security Gate Placeholder: 'ai.jobs.read'
   */
  subscribeToJobs(onJobChange: (payload: any) => void) {
    const channel = supabase
      .channel('public:jobs_realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'exports' },
        (payload) => {
          onJobChange(payload);
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'render_jobs' },
        (payload) => {
          onJobChange(payload);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }
};
