import { supabase } from '../lib/supabase';
import { SupportTicket, TicketStatus } from '../types';
import { emailNotificationService } from '../../../frontend/src/services/emailNotificationService';

export const ticketsService = {
  /**
   * Sources support tickets cleanly from public.support_tickets.
   * Falls back to public.tickets if support_tickets does not exist.
   */
  async getTickets(): Promise<SupportTicket[]> {
    try {
      const { data, error } = await supabase
        .from('support_tickets')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        return data.map((t) => ({
          id: t.id,
          userId: t.user_id || 'Guest / Anonymous',
          subject: t.title || t.subject || 'Support Inquiry',
          description: t.description || '',
          email: t.email || 'N/A',
          category: t.category || 'General',
          priority: t.priority || 'Medium',
          status: (t.status ? (t.status.charAt(0).toUpperCase() + t.status.slice(1)) : 'Open') as TicketStatus,
          attachmentUrl: t.attachment_url || null,
          attachmentName: t.attachment_name || null,
          createdAt: t.created_at || new Date().toISOString(),
          updatedAt: t.updated_at || new Date().toISOString(),
        }));
      }

      // Legacy fallback
      const { data: legacyData } = await supabase
        .from('tickets')
        .select('*')
        .order('created_at', { ascending: false });

      if (legacyData) {
        return legacyData.map((t) => ({
          id: t.id,
          userId: t.user_id || 'Guest',
          subject: t.subject || 'Support Inquiry',
          description: t.description || '',
          email: t.email || 'N/A',
          category: t.category || 'General',
          priority: t.priority || 'Medium',
          status: (t.status || 'Open') as TicketStatus,
          attachmentUrl: t.attachment_url || null,
          attachmentName: t.attachment_name || null,
          createdAt: t.created_at || new Date().toISOString(),
          updatedAt: t.updated_at || new Date().toISOString(),
        }));
      }
    } catch (err) {
      console.warn('Error fetching support tickets:', err);
    }
    return [];
  },

  /**
   * Updates ticket status (e.g., 'Open', 'Resolved', 'Closed').
   * Automatically creates a notification record in `support_notifications`
   * and dispatches email notification when marked as 'resolved'.
   */
  async updateTicketStatus(ticketId: string, status: string): Promise<boolean> {
    try {
      const dbStatus = status.toLowerCase();
      const nowIso = new Date().toISOString();

      const updatePayload: Record<string, any> = {
        status: dbStatus,
        updated_at: nowIso,
      };

      if (dbStatus === 'resolved') {
        updatePayload.resolved_at = nowIso;
      }

      const { error, data } = await supabase
        .from('support_tickets')
        .update(updatePayload)
        .eq('id', ticketId)
        .select()
        .single();

      if (!error) {
        // If status was updated to resolved, send notification & email
        if (dbStatus === 'resolved') {
          await this.triggerResolutionNotification(data || { id: ticketId });
        }
        return true;
      }

      // Fallback update
      const { error: legacyError, data: legacyData } = await supabase
        .from('tickets')
        .update({ status, updated_at: nowIso })
        .eq('id', ticketId)
        .select()
        .single();

      if (!legacyError && dbStatus === 'resolved') {
        await this.triggerResolutionNotification(legacyData || { id: ticketId });
      }

      return !legacyError;
    } catch (err) {
      console.error('Failed to update ticket status:', err);
      return false;
    }
  },

  /**
   * Helper function that creates a support_notifications row
   * and sends a resolution email to the ticket owner.
   */
  async triggerResolutionNotification(ticket: any) {
    try {
      const ticketId = ticket.id;
      const ticketTitle = ticket.title || ticket.subject || 'Support Request';
      const userId = ticket.user_id;
      const email = ticket.email;

      // 1. Create support_notifications row if userId is present
      if (userId) {
        await supabase.from('support_notifications').insert([
          {
            user_id: userId,
            ticket_id: ticketId,
            title: 'Support Ticket Resolved',
            message: `Your support request "${ticketTitle}" has been reviewed and marked as resolved by our support team.`,
            type: 'support_resolved',
            is_read: false,
            created_at: new Date().toISOString(),
          },
        ]);

        await supabase.from('notifications').insert([
          {
            user_id: userId,
            title: 'Support Ticket Resolved',
            message: `Your support request "${ticketTitle}" has been reviewed and marked as resolved by our support team.`,
            type: 'support_resolved',
            priority: 'high',
            is_read: false,
            action_url: '/help',
            created_at: new Date().toISOString(),
          },
        ]);
      }

      // 2. Dispatch Resolution Email to ticket owner
      if (email && email.includes('@')) {
        await emailNotificationService.sendTicketResolvedEmail({
          toEmail: email,
          ticketTitle: ticketTitle,
          ticketId: ticketId,
        });
      }
    } catch (err) {
      console.warn('Failed to trigger resolution notification or email:', err);
    }
  },

  /**
   * Deletes a support ticket.
   */
  async deleteTicket(ticketId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('support_tickets')
        .delete()
        .eq('id', ticketId);

      if (!error) return true;

      const { error: legacyError } = await supabase
        .from('tickets')
        .delete()
        .eq('id', ticketId);

      return !legacyError;
    } catch (err) {
      console.error('Failed to delete ticket:', err);
      return false;
    }
  },

  /**
   * Subscribes to Supabase Realtime changes on support_tickets table.
   */
  subscribeToTickets(onChange: () => void) {
    const channel = supabase
      .channel('public:support_tickets_realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'support_tickets' },
        () => {
          onChange();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },
};
