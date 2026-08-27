import { supabase } from '../lib/supabase';
import { SupportTicket } from '../types';

export const ticketsService = {
  /**
   * Sources support tickets cleanly from public.tickets.
   * Returns empty array when zero tickets exist.
   */
  async getTickets(): Promise<SupportTicket[]> {
    try {
      const { data, error } = await supabase.from('tickets').select('*');
      if (!error && data && data.length > 0) {
        return data.map((t) => ({
          id: t.id,
          userId: t.user_id,
          subject: t.subject || 'Support Inquiry',
          priority: t.priority || 'Medium',
          status: t.status || 'Open',
          createdAt: t.created_at || new Date().toISOString(),
          updatedAt: t.updated_at || new Date().toISOString(),
        }));
      }
    } catch {
      // Unmigrated schema handler
    }
    return [];
  },
};
