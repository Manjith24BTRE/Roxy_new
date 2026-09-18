import { supabase, supabaseAdmin } from '../lib/supabase';
import { Announcement } from '../types';

const API_BASE_URL = 'http://localhost:8000/api/v1/admin/announcements';

export const announcementsService = {
  /**
   * Fetches platform announcements directly from public.platform_announcements.
   */
  async getAnnouncements(statusFilter: string = 'All'): Promise<Announcement[]> {
    console.log(`[ANNOUNCEMENT DIAGNOSTIC] Fetching announcements with statusFilter='${statusFilter}'`);
    const db = supabaseAdmin || supabase;
    try {
      let query = db.from('platform_announcements').select('*');

      if (statusFilter && statusFilter !== 'All') {
        query = query.or(`status.eq.${statusFilter},type.eq.${statusFilter}`);
      }

      query = query.order('created_at', { ascending: false });

      const { data: rows, error } = await query;

      if (error) {
        console.warn(`[ANNOUNCEMENT DIAGNOSTIC] Supabase Query Error (Code: ${error.code}):`, error.message, error);
        if (error.code === 'PGRST204' || error.message.includes('schema cache') || error.message.includes('platform_announcements')) {
          console.log('[ANNOUNCEMENT DIAGNOSTIC] PostgREST schema cache mismatch. Routing through FastAPI backend...');
          return await this.fetchFromBackend(statusFilter);
        }
        return [];
      }

      if (!rows || rows.length === 0) {
        console.log('[ANNOUNCEMENT DIAGNOSTIC] Query returned 0 rows from public.platform_announcements');
        return [];
      }

      // Fetch analytics metrics
      const ids = rows.map((r) => r.id);
      const analyticsMap = new Map<string, { views: number; clicks: number; dismissals: number }>();

      if (ids.length > 0) {
        try {
          const { data: analyticsRows } = await db
            .from('announcement_analytics')
            .select('announcement_id, action')
            .in('announcement_id', ids);

          if (analyticsRows) {
            analyticsRows.forEach((r) => {
              const entry = analyticsMap.get(r.announcement_id) || { views: 0, clicks: 0, dismissals: 0 };
              if (r.action === 'viewed') entry.views += 1;
              if (r.action === 'clicked') entry.clicks += 1;
              if (r.action === 'dismissed') entry.dismissals += 1;
              analyticsMap.set(r.announcement_id, entry);
            });
          }
        } catch (analyticsErr) {
          console.warn('[ANNOUNCEMENT DIAGNOSTIC] Analytics query notice:', analyticsErr);
        }
      }

      return rows.map((r) => {
        const stats = analyticsMap.get(r.id) || { views: 0, clicks: 0, dismissals: 0 };
        const contentText = r.content || r.message || '';
        const activeStatus = r.is_active === false ? 'Archived' : (r.status || 'Active');

        return {
          id: r.id,
          title: r.title,
          message: contentText,
          announcementType: (r.announcement_type || r.type || 'General') as any,
          priority: r.priority || 'Medium',
          status: activeStatus as any,
          targetAudience: r.target_audience || 'All Users',
          ctaText: r.cta_text,
          ctaUrl: r.cta_url,
          bannerColor: r.banner_style || r.banner_color || 'blue',
          icon: r.icon || 'bell',
          startsAt: r.starts_at || r.start_date,
          expiresAt: r.expires_at || r.end_date,
          createdBy: r.created_by,
          createdAt: r.created_at || new Date().toISOString(),
          updatedAt: r.updated_at || new Date().toISOString(),
          viewsCount: stats.views,
          clicksCount: stats.clicks,
          dismissalsCount: stats.dismissals,
        };
      });
    } catch (e: any) {
      console.error('[ANNOUNCEMENT DIAGNOSTIC] Exception during getAnnouncements:', e);
      return await this.fetchFromBackend(statusFilter);
    }
  },

  /**
   * Fallback fetch via backend API.
   */
  async fetchFromBackend(statusFilter: string): Promise<Announcement[]> {
    try {
      const res = await fetch(`${API_BASE_URL}?status=${encodeURIComponent(statusFilter)}`);
      if (!res.ok) return [];
      const data = await res.json();
      return (data || []).map((r: any) => ({
        id: r.id,
        title: r.title,
        message: r.content || r.message || '',
        announcementType: r.announcement_type || r.type || 'General',
        priority: r.priority || 'Medium',
        status: r.is_active === false ? 'Archived' : (r.status || 'Active'),
        targetAudience: r.target_audience || 'All Users',
        ctaText: r.cta_text,
        ctaUrl: r.cta_url,
        bannerColor: r.banner_color || 'blue',
        icon: r.icon || 'bell',
        startsAt: r.starts_at || r.start_date,
        expiresAt: r.expires_at || r.end_date,
        createdAt: r.created_at || new Date().toISOString(),
        updatedAt: r.updated_at || new Date().toISOString(),
        viewsCount: 0,
        clicksCount: 0,
        dismissalsCount: 0,
      }));
    } catch (err) {
      console.warn('[ANNOUNCEMENT DIAGNOSTIC] Backend API fetch error:', err);
      return [];
    }
  },

  /**
   * Inserts row into public.platform_announcements AND public.notifications.
   */
  async createAnnouncement(payload: Partial<Announcement>): Promise<Announcement> {
    console.log('[ANNOUNCEMENT DIAGNOSTIC] Executing Insert into public.platform_announcements:', payload);

    if (!payload.title || !payload.title.trim()) throw new Error('Title is required.');
    if (!payload.message || !payload.message.trim()) throw new Error('Message content is required.');

    const titleStr = payload.title.trim();
    const contentStr = payload.message.trim();
    const isAct = payload.status !== 'Draft' && payload.status !== 'Archived';
    const nowIso = new Date().toISOString();

    const db = supabaseAdmin || supabase;

    const record = {
      title: titleStr,
      content: contentStr,
      message: contentStr,
      type: payload.announcementType || 'General',
      announcement_type: payload.announcementType || 'General',
      priority: payload.priority || 'Medium',
      status: payload.status || 'Active',
      target_audience: payload.targetAudience || 'All Users',
      banner_style: payload.bannerColor || 'blue',
      banner_color: payload.bannerColor || 'blue',
      icon: payload.icon || 'bell',
      cta_text: payload.ctaText || null,
      cta_url: payload.ctaUrl || null,
      start_date: payload.startsAt || null,
      starts_at: payload.startsAt || null,
      end_date: payload.expiresAt || null,
      expires_at: payload.expiresAt || null,
      is_active: isAct,
      created_at: nowIso,
      updated_at: nowIso,
    };

    const { data, error } = await db
      .from('platform_announcements')
      .insert([record])
      .select()
      .single();

    if (error) {
      console.error('[ANNOUNCEMENT DIAGNOSTIC] Supabase Insert Error Payload:', error);

      try {
        console.log('[ANNOUNCEMENT DIAGNOSTIC] Executing API fallback endpoint POST /api/v1/admin/announcements...');
        const res = await fetch(API_BASE_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: titleStr,
            message: contentStr,
            announcement_type: payload.announcementType || 'General',
            priority: payload.priority || 'Medium',
            status: payload.status || 'Active',
            target_audience: payload.targetAudience || 'All Users',
            cta_text: payload.ctaText || null,
            cta_url: payload.ctaUrl || null,
            banner_color: payload.bannerColor || 'blue',
            starts_at: payload.startsAt || null,
            expires_at: payload.expiresAt || null,
          }),
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.detail || 'Backend creation API error');
        }

        const created = await res.json();

        // Also push notification entry into public.notifications
        try {
          await db.from('notifications').insert([{
            title: titleStr,
            message: contentStr,
            type: 'announcement',
            priority: payload.priority || 'Medium',
            action_url: payload.ctaUrl || null,
            is_read: false,
            created_at: nowIso,
            metadata: { reference_id: created.id },
          }]);
        } catch (nErr) {
          console.warn('[ANNOUNCEMENT DIAGNOSTIC] Notification mirror notice:', nErr);
        }

        return {
          id: created.id,
          title: created.title,
          message: created.message || created.content || contentStr,
          announcementType: created.announcement_type || created.type || 'General',
          priority: created.priority || 'Medium',
          status: created.status || 'Active',
          targetAudience: created.target_audience || 'All Users',
          ctaText: created.cta_text,
          ctaUrl: created.cta_url,
          bannerColor: created.banner_color || 'blue',
          createdAt: created.created_at,
          updatedAt: created.updated_at,
        };
      } catch (backendErr: any) {
        throw new Error(error.message || backendErr.message || 'Failed to insert announcement into database');
      }
    }

    console.log(`[ANNOUNCEMENT DIAGNOSTIC] Inserted successfully row ID='${data.id}'`);

    // Insert mirror into public.notifications
    try {
      await db.from('notifications').insert([{
        title: titleStr,
        message: contentStr,
        type: 'announcement',
        priority: payload.priority || 'Medium',
        action_url: payload.ctaUrl || null,
        is_read: false,
        created_at: nowIso,
        metadata: { reference_id: data.id },
      }]);
    } catch (nErr) {
      console.warn('[ANNOUNCEMENT DIAGNOSTIC] Notification mirror notice:', nErr);
    }

    return {
      id: data.id,
      title: data.title,
      message: data.content || data.message || contentStr,
      announcementType: data.announcement_type || data.type || 'General',
      priority: data.priority || 'Medium',
      status: data.status || 'Active',
      targetAudience: data.target_audience || 'All Users',
      ctaText: data.cta_text,
      ctaUrl: data.cta_url,
      bannerColor: data.banner_color || data.banner_style || 'blue',
      startsAt: data.starts_at || data.start_date,
      expiresAt: data.expires_at || data.end_date,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  },

  /**
   * Updates an existing announcement record.
   */
  async updateAnnouncement(id: string, payload: Partial<Announcement>): Promise<boolean> {
    console.log(`[ANNOUNCEMENT DIAGNOSTIC] Update Request ID='${id}'`, payload);
    const db = supabaseAdmin || supabase;
    const updates: any = {
      updated_at: new Date().toISOString(),
    };
    if (payload.title !== undefined) updates.title = payload.title;
    if (payload.message !== undefined) {
      updates.content = payload.message;
      updates.message = payload.message;
    }
    if (payload.announcementType !== undefined) {
      updates.type = payload.announcementType;
      updates.announcement_type = payload.announcementType;
    }
    if (payload.priority !== undefined) updates.priority = payload.priority;
    if (payload.status !== undefined) {
      updates.status = payload.status;
      updates.is_active = payload.status !== 'Draft' && payload.status !== 'Archived';
    }
    if (payload.targetAudience !== undefined) updates.target_audience = payload.targetAudience;
    if (payload.ctaText !== undefined) updates.cta_text = payload.ctaText;
    if (payload.ctaUrl !== undefined) updates.cta_url = payload.ctaUrl;
    if (payload.bannerColor !== undefined) {
      updates.banner_style = payload.bannerColor;
      updates.banner_color = payload.bannerColor;
    }
    if (payload.startsAt !== undefined) {
      updates.start_date = payload.startsAt;
      updates.starts_at = payload.startsAt;
    }
    if (payload.expiresAt !== undefined) {
      updates.end_date = payload.expiresAt;
      updates.expires_at = payload.expiresAt;
    }

    const { error } = await db.from('platform_announcements').update(updates).eq('id', id);
    if (error) {
      console.error(`[ANNOUNCEMENT DIAGNOSTIC] Supabase Update Error (ID='${id}'):`, error);
      throw new Error(error.message);
    }
    return true;
  },

  /**
   * Deletes an announcement record.
   */
  async deleteAnnouncement(id: string): Promise<boolean> {
    console.log(`[ANNOUNCEMENT DIAGNOSTIC] Delete Request ID='${id}'`);
    const db = supabaseAdmin || supabase;
    const { error } = await db.from('platform_announcements').delete().eq('id', id);
    if (error) {
      console.error(`[ANNOUNCEMENT DIAGNOSTIC] Supabase Delete Error (ID='${id}'):`, error);
      throw new Error(error.message);
    }
    return true;
  },

  /**
   * Real-time subscription to platform_announcements updates.
   */
  subscribeToAnnouncements(onUpdate: () => void) {
    console.log('[ANNOUNCEMENT DIAGNOSTIC] Subscribing to Supabase Realtime channel...');
    const db = supabaseAdmin || supabase;
    const channel = db
      .channel('platform_announcements_realtime_stream')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'platform_announcements' }, (payload) => {
        console.log('[ANNOUNCEMENT DIAGNOSTIC] Realtime Event Received:', payload);
        onUpdate();
      })
      .subscribe();

    return () => {
      db.removeChannel(channel);
    };
  },
};
