import { supabase, supabaseAdmin } from '../lib/supabase';

export interface UserCreditRecord {
  id: string;
  user_id: string;
  current_balance: number;
  total_credits_issued: number;
  total_credits_consumed: number;
  last_updated: string;
  created_at: string;
  user_email?: string;
  display_name?: string;
}

export interface CreditTransactionRecord {
  id: string;
  user_id: string;
  amount: number;
  transaction_type: 'credit' | 'debit';
  reason: string;
  created_by?: string;
  created_at: string;
  user_email?: string;
}

export interface CreditAuditLogRecord {
  id: string;
  admin_id?: string;
  admin_user?: string;
  affected_user?: string;
  user_id: string;
  old_balance: number;
  new_balance: number;
  change_amount: number;
  action_type: 'add' | 'deduct' | 'reset';
  reason: string;
  created_at: string;
  timestamp?: string;
  user_email?: string;
}

export interface CreditEconomyMetrics {
  totalCreditsIssued: number;
  totalCreditsConsumed: number;
  outstandingBalance: number;
  recentTransactions: CreditTransactionRecord[];
  topConsumers: Array<{
    user_id: string;
    user_email: string;
    display_name: string;
    creditsUsed: number;
    current_balance: number;
  }>;
  auditLogs: CreditAuditLogRecord[];
}

export const creditsService = {
  /**
   * Fetches real credit economy aggregate metrics directly from public.credits / public.user_credits and credit_transactions.
   */
  async getCreditMetrics(): Promise<CreditEconomyMetrics> {
    const db = supabaseAdmin || supabase;
    console.log('[CREDIT ECONOMY] Fetching real metrics from database...');

    try {
      // 1. Fetch user credits from credits table primary, user_credits fallback
      let creditRows: any[] = [];
      const { data: primaryRows, error: pErr } = await db.from('credits').select('*');
      if (!pErr && primaryRows && primaryRows.length > 0) {
        creditRows = primaryRows;
      } else {
        const { data: fallbackRows } = await db.from('user_credits').select('*');
        creditRows = fallbackRows || [];
      }

      let totalCreditsIssued = 0;
      let totalCreditsConsumed = 0;
      let outstandingBalance = 0;

      creditRows.forEach((r) => {
        const bal = Number(r.balance ?? r.current_balance ?? 100);
        const issued = Number(r.total_credits_issued ?? bal);
        const consumed = Number(r.total_credits_consumed ?? 0);

        totalCreditsIssued += issued;
        totalCreditsConsumed += consumed;
        outstandingBalance += bal;
      });

      // 2. Fetch profiles to map display names & emails
      const userIds = creditRows.map((r) => r.user_id).filter(Boolean);
      const userMap = new Map<string, { email: string; name: string }>();

      if (userIds.length > 0) {
        try {
          const { data: profiles } = await db
            .from('profiles')
            .select('user_id, display_name, email')
            .in('user_id', userIds);

          if (profiles) {
            profiles.forEach((p) => {
              userMap.set(p.user_id, {
                email: p.email || `${p.user_id.slice(0, 8)}@veytrix.com`,
                name: p.display_name || 'Veytrix User',
              });
            });
          }
        } catch (pErr) {
          console.warn('[CREDIT ECONOMY] Profile resolution notice:', pErr);
        }
      }

      // 3. Top credit consumers (sorted by consumed/balance)
      const sortedConsumers = [...creditRows].sort(
        (a, b) => Number(b.total_credits_consumed || b.balance || 0) - Number(a.total_credits_consumed || a.balance || 0)
      );

      const topConsumers = sortedConsumers.slice(0, 5).map((c) => {
        const info = userMap.get(c.user_id) || {
          email: `${c.user_id.slice(0, 8)}@veytrix.com`,
          name: 'Veytrix User',
        };
        return {
          user_id: c.user_id,
          user_email: info.email,
          display_name: info.name,
          creditsUsed: Number(c.total_credits_consumed || 0),
          current_balance: Number(c.balance ?? c.current_balance ?? 100),
        };
      });

      // 4. Fetch recent transactions from credit_transactions
      const { data: txRows } = await db
        .from('credit_transactions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      const recentTransactions: CreditTransactionRecord[] = (txRows || []).map((t) => {
        const info = userMap.get(t.user_id);
        return {
          id: t.id,
          user_id: t.user_id,
          amount: t.amount,
          transaction_type: t.transaction_type || (t.amount >= 0 ? 'credit' : 'debit'),
          reason: t.reason || 'Transaction',
          created_by: t.created_by || 'System',
          created_at: t.created_at || new Date().toISOString(),
          user_email: info ? info.email : `${t.user_id.slice(0, 8)}@veytrix.com`,
        };
      });

      // 5. Fetch audit logs from credit_audit_logs
      const { data: auditRows } = await db
        .from('credit_audit_logs')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(20);

      const auditLogs: CreditAuditLogRecord[] = (auditRows || []).map((a) => {
        const targetId = a.affected_user || a.user_id;
        const info = userMap.get(targetId);
        return {
          id: a.id,
          admin_id: a.admin_user || a.admin_id || 'Admin',
          admin_user: a.admin_user || a.admin_id || 'Admin',
          affected_user: targetId,
          user_id: targetId,
          old_balance: a.old_balance || 0,
          new_balance: a.new_balance || 0,
          change_amount: a.new_balance - a.old_balance,
          action_type: a.new_balance >= a.old_balance ? 'add' : 'deduct',
          reason: a.reason || 'Admin Credit Action',
          created_at: a.timestamp || a.created_at || new Date().toISOString(),
          timestamp: a.timestamp || a.created_at || new Date().toISOString(),
          user_email: info ? info.email : `${targetId?.slice(0, 8)}@veytrix.com`,
        };
      });

      return {
        totalCreditsIssued,
        totalCreditsConsumed,
        outstandingBalance,
        recentTransactions,
        topConsumers,
        auditLogs,
      };
    } catch (e) {
      console.error('[CREDIT ECONOMY] Exception loading metrics:', e);
      return {
        totalCreditsIssued: 0,
        totalCreditsConsumed: 0,
        outstandingBalance: 0,
        recentTransactions: [],
        topConsumers: [],
        auditLogs: [],
      };
    }
  },

  /**
   * Searches users by email, display name, or user_id for credit management actions.
   */
  async searchUsers(query: string): Promise<Array<{ user_id: string; display_name: string; email: string; balance: number }>> {
    const db = supabaseAdmin || supabase;
    if (!query.trim()) return [];

    try {
      const { data: profiles } = await db
        .from('profiles')
        .select('user_id, display_name, email')
        .or(`display_name.ilike.%${query}%,email.ilike.%${query}%,user_id.eq.${query}`);

      if (!profiles || profiles.length === 0) return [];

      const userIds = profiles.map((p) => p.user_id);
      const { data: creditData } = await db.from('credits').select('user_id, balance').in('user_id', userIds);
      const creditMap = new Map((creditData || []).map((c) => [c.user_id, c.balance]));

      return profiles.map((p) => ({
        user_id: p.user_id,
        display_name: p.display_name || 'Anonymous User',
        email: p.email || `${p.user_id.slice(0, 8)}@veytrix.com`,
        balance: creditMap.get(p.user_id) ?? 100,
      }));
    } catch (err) {
      console.warn('[CREDIT SERVICE] User search notice:', err);
      return [];
    }
  },

  /**
   * Fetches or initializes credit record for a specific user.
   */
  async getUserCredits(userId: string): Promise<UserCreditRecord> {
    const db = supabaseAdmin || supabase;
    const { data: existing } = await db
      .from('credits')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (existing) {
      return {
        id: existing.id,
        user_id: existing.user_id,
        current_balance: existing.balance ?? existing.current_balance ?? 100,
        total_credits_issued: existing.total_credits_issued ?? 100,
        total_credits_consumed: existing.total_credits_consumed ?? 0,
        last_updated: existing.last_updated || existing.updated_at || new Date().toISOString(),
        created_at: existing.created_at || new Date().toISOString(),
      };
    }

    // Default record
    return {
      id: userId,
      user_id: userId,
      current_balance: 100,
      total_credits_issued: 100,
      total_credits_consumed: 0,
      last_updated: new Date().toISOString(),
      created_at: new Date().toISOString(),
    };
  },

  /**
   * Admin Assign Credits (+ amount)
   */
  async assignCredits(userId: string, amount: number, reason: string, adminId: string = 'Admin'): Promise<any> {
    if (amount <= 0) throw new Error('Amount must be positive');
    const db = supabaseAdmin || supabase;

    // Call stored RPC
    const { data, error } = await db.rpc('assign_user_credits', {
      p_user_id: userId,
      p_amount: amount,
      p_reason: reason || 'Admin Credit Grant',
      p_admin_identifier: adminId,
    });

    if (error) {
      console.warn('[CREDIT SERVICE] RPC assign_user_credits error, executing manual update:', error);
      const current = await this.getUserCredits(userId);
      const newBal = current.current_balance + amount;
      await db.from('credits').upsert({ user_id: userId, balance: newBal, current_balance: newBal, updated_at: new Date().toISOString() });
      await db.from('credit_transactions').insert({ user_id: userId, amount: amount, transaction_type: 'credit', reason, created_by: adminId });
      await db.from('credit_audit_logs').insert({ admin_user: adminId, affected_user: userId, old_balance: current.current_balance, new_balance: newBal, reason });
      return { new_balance: newBal };
    }

    return data;
  },

  /**
   * Admin / System Deduct Credits (- amount)
   */
  async deductCredits(userId: string, amount: number, reason: string, adminId: string = 'Admin'): Promise<any> {
    if (amount <= 0) throw new Error('Amount must be positive');
    const db = supabaseAdmin || supabase;

    const { data, error } = await db.rpc('deduct_user_credits', {
      p_user_id: userId,
      p_amount: amount,
      p_reason: reason || 'Manual Deduction',
      p_admin_identifier: adminId,
    });

    if (error) {
      console.warn('[CREDIT SERVICE] RPC deduct_user_credits error, executing manual update:', error);
      const current = await this.getUserCredits(userId);
      if (current.current_balance < amount) throw new Error('Insufficient credit balance');
      const newBal = current.current_balance - amount;
      await db.from('credits').update({ balance: newBal, current_balance: newBal, updated_at: new Date().toISOString() }).eq('user_id', userId);
      await db.from('credit_transactions').insert({ user_id: userId, amount: -amount, transaction_type: 'debit', reason, created_by: adminId });
      await db.from('credit_audit_logs').insert({ admin_user: adminId, affected_user: userId, old_balance: current.current_balance, new_balance: newBal, reason });
      return { new_balance: newBal };
    }

    return data;
  },

  /**
   * Admin Reset Credits to specified target balance
   */
  async resetCredits(userId: string, targetBalance: number, reason: string, adminId: string = 'Admin'): Promise<any> {
    if (targetBalance < 0) throw new Error('Balance cannot be negative');
    const db = supabaseAdmin || supabase;

    const { data, error } = await db.rpc('reset_user_credits', {
      p_user_id: userId,
      p_target_balance: targetBalance,
      p_reason: reason || 'Admin Balance Reset',
      p_admin_identifier: adminId,
    });

    if (error) {
      console.warn('[CREDIT SERVICE] RPC reset_user_credits error, executing manual update:', error);
      const current = await this.getUserCredits(userId);
      await db.from('credits').upsert({ user_id: userId, balance: targetBalance, current_balance: targetBalance, updated_at: new Date().toISOString() });
      await db.from('credit_transactions').insert({ user_id: userId, amount: targetBalance - current.current_balance, transaction_type: targetBalance >= current.current_balance ? 'credit' : 'debit', reason, created_by: adminId });
      await db.from('credit_audit_logs').insert({ admin_user: adminId, affected_user: userId, old_balance: current.current_balance, new_balance: targetBalance, reason });
      return { new_balance: targetBalance };
    }

    return data;
  },

  /**
   * Real-time subscription for credit updates.
   */
  subscribeToCreditChanges(onUpdate: () => void) {
    const db = supabaseAdmin || supabase;
    console.log('[CREDIT SERVICE] Subscribing to Supabase Realtime channel...');

    const channel = db
      .channel('credit_economy_stream')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'credits' }, () => {
        onUpdate();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'credit_transactions' }, () => {
        onUpdate();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'credit_audit_logs' }, () => {
        onUpdate();
      })
      .subscribe();

    return () => {
      db.removeChannel(channel);
    };
  },
};
