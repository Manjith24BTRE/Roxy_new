import { supabase, supabaseAdmin } from '../lib/supabase';

export type EventCategory = 'Users' | 'Projects' | 'Billing' | 'Security' | 'System';

export interface PlatformEventPayload {
  user_id?: string;
  event_type: string;
  event_category: EventCategory;
  event_title: string;
  event_description?: string;
  metadata?: Record<string, any>;
  ip_address?: string;
}

class ActivityLoggerService {
  public async trackEvent(payload: PlatformEventPayload): Promise<void> {
    const record = {
      user_id: payload.user_id || (await this.getCurrentUserId()),
      event_type: payload.event_type,
      event_category: payload.event_category,
      event_title: payload.event_title,
      event_description: payload.event_description || '',
      metadata: payload.metadata || {},
      ip_address: payload.ip_address || '',
      created_at: new Date().toISOString(),
    };

    console.log(`[ACTIVITY] [${payload.event_category}] ${payload.event_title}`, record);

    try {
      const client = supabaseAdmin || supabase;
      if (client) {
        await client.from('platform_events').insert([record]);
      }
    } catch (e) {
      console.warn('Could not persist platform activity event:', e);
    }
  }

  private async getCurrentUserId(): Promise<string | undefined> {
    try {
      const { data } = await supabase.auth.getUser();
      return data.user?.id;
    } catch {
      return undefined;
    }
  }
}

export const activityLogger = new ActivityLoggerService();
export default activityLogger;
