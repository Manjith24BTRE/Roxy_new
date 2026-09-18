export interface TicketResolvedEmailPayload {
  toEmail: string;
  userName?: string;
  ticketTitle: string;
  ticketId: string;
}

export const emailNotificationService = {
  /**
   * Constructs resolution email text content.
   */
  buildResolvedEmailBody(userName: string, ticketTitle: string): { subject: string; textBody: string; htmlBody: string } {
    const displayName = userName.trim() || 'Creator';
    const subject = 'Support Ticket Resolved';
    const textBody = `Hello ${displayName},

Your support request:

"${ticketTitle}"

has been marked as resolved.

If the issue still exists, you may reopen or submit a new report.

Regards,
Veytrix Support Team`;

    const htmlBody = `
      <div style="font-family: Arial, sans-serif; color: #1D2B64; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #E2E8F0; rounded-radius: 12px;">
        <h2 style="color: #3B6CE7; margin-top: 0;">Support Ticket Resolved</h2>
        <p>Hello <strong>${displayName}</strong>,</p>
        <p>Your support request:</p>
        <blockquote style="background: #F8FAFC; border-left: 4px solid #3B6CE7; padding: 12px 16px; margin: 16px 0; font-weight: bold;">
          "${ticketTitle}"
        </blockquote>
        <p>has been marked as resolved by our support team.</p>
        <p style="color: #64748B; font-size: 14px;">If the issue still exists, you may reopen the ticket from your notification panel or submit a new report.</p>
        <hr style="border: none; border-top: 1px solid #E2E8F0; margin: 24px 0;" />
        <p style="font-size: 12px; color: #94A3B8;">Regards,<br /><strong>Veytrix Support Team</strong></p>
      </div>
    `;

    return { subject, textBody, htmlBody };
  },

  /**
   * Dispatches the ticket resolution email notification to the user's email address.
   */
  async sendTicketResolvedEmail(payload: TicketResolvedEmailPayload): Promise<{ success: boolean; message?: string }> {
    try {
      const { subject, textBody, htmlBody } = this.buildResolvedEmailBody(
        payload.userName || 'Creator',
        payload.ticketTitle
      );

      console.log(`[Email Dispatcher] Sending ticket resolution email to ${payload.toEmail}...`);
      console.log(`[Subject]: ${subject}`);
      console.log(`[Body]:\n${textBody}`);

      // Attempt endpoint / webhook call if configured
      const emailEndpoint = import.meta.env.VITE_EMAIL_DISPATCHER_URL;
      if (emailEndpoint) {
        await fetch(emailEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: payload.toEmail,
            subject,
            text: textBody,
            html: htmlBody,
            ticketId: payload.ticketId,
          }),
        });
      }

      return { success: true };
    } catch (err: any) {
      console.warn('[Email Dispatcher] Email send notice:', err);
      return { success: false, message: err.message };
    }
  },
};
