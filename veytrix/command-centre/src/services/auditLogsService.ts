import { supabase } from '../lib/supabase';
import { AuditEvent } from '../types';
import { mockAuditLogs } from '../data/mockData';

export interface AuditLogsFetchOptions {
  search?: string;
  page?: number;
  limit?: number;
}

export interface AuditLogsPaginatedResponse {
  logs: AuditEvent[];
  totalCount: number;
}

export const auditLogsService = {
  /**
   * Fetches immutable security audit logs from Supabase.
   * STRICTLY READ-ONLY ACCESS. NO UPDATE OR DELETE OPERATIONS PERMITTED.
   * RBAC Security Gate Placeholder: 'audit.read'
   */
  async getLogs(options: AuditLogsFetchOptions = {}): Promise<AuditLogsPaginatedResponse> {
    const { search = '', page = 1, limit = 10 } = options;
    const offset = (page - 1) * limit;

    try {
      let query = supabase
        .from('admin_audit_logs')
        .select('*', { count: 'exact' });

      if (search) {
        query = query.or(`action.ilike.%${search}%,admin_email.ilike.%${search}%,target_id.ilike.%${search}%`);
      }

      query = query.range(offset, offset + limit - 1).order('created_at', { ascending: false });

      const { data, count, error } = await query;

      if (error) {
        console.error('Supabase admin_audit_logs query error:', error);
        throw error;
      }

      const logs: AuditEvent[] = (data || []).map((item) => ({
        id: item.id,
        timestamp: item.created_at || new Date().toISOString(),
        controller: item.admin_email || item.controller || 'system@veytrix.com',
        action: item.action,
        target: item.target_id || item.target || 'N/A',
        ip: item.ip_address || item.ip || '127.0.0.1',
        result: item.result || 'Success',
      }));

      return {
        logs,
        totalCount: count ?? logs.length,
      };
    } catch (e: any) {
      console.error('Failed to fetch admin_audit_logs from Supabase:', e);
      return {
        logs: [],
        totalCount: 0,
      };
    }
  }
};
