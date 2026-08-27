import { supabase } from '../lib/supabase';
import { Feedback } from '../types';

export const feedbackService = {
  /**
   * Sources user feedback directly from public.feedback. Returns clean empty state if empty.
   */
  async getFeedback(): Promise<Feedback[]> {
    try {
      const { data, error } = await supabase.from('feedback').select('*');
      if (!error && data && data.length > 0) {
        return data.map((f) => ({
          id: f.id,
          userId: f.user_id,
          rating: f.rating || 5,
          category: f.category || 'General',
          feedbackText: f.feedback_text || f.message || '',
          date: f.created_at || new Date().toISOString(),
          status: f.status || 'New',
        }));
      }
    } catch {
      // Unmigrated schema handler
    }
    return [];
  },
};
