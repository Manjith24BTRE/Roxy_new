import { supabase, supabaseAdmin } from '../lib/supabase';

export interface UserCreditProfile {
  id: string;
  user_id: string;
  current_balance: number;
  total_credits_issued: number;
  total_credits_consumed: number;
  last_updated: string;
}

export interface CreditTransaction {
  id: string;
  user_id: string;
  amount: number;
  transaction_type: 'credit' | 'debit';
  reason: string;
  created_at: string;
}

class UserCreditsService {
  /**
   * Fetches real credit balance for the current user.
   */
  public async getMyCredits(): Promise<UserCreditProfile | null> {
    try {
      const client = supabaseAdmin || supabase;
      if (!client) return null;

      const { data: userData } = await client.auth.getUser();
      const userId = userData.user?.id;
      if (!userId) return null;

      // 1. Check credits table primary
      const { data: primaryData } = await client
        .from('credits')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (primaryData) {
        return {
          id: primaryData.id,
          user_id: primaryData.user_id,
          current_balance: primaryData.balance ?? primaryData.current_balance ?? 100,
          total_credits_issued: primaryData.total_credits_issued ?? 100,
          total_credits_consumed: primaryData.total_credits_consumed ?? 0,
          last_updated: primaryData.last_updated || primaryData.updated_at || new Date().toISOString(),
        };
      }

      // 2. Check user_credits table fallback
      const { data: fallbackData } = await client
        .from('user_credits')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (fallbackData) return fallbackData;

      // Initialize initial 100 credits for user if record missing
      const initialRecord = {
        user_id: userId,
        balance: 100,
        current_balance: 100,
        total_credits_issued: 100,
        total_credits_consumed: 0,
        last_updated: new Date().toISOString(),
        created_at: new Date().toISOString(),
      };

      const { data: created } = await client
        .from('credits')
        .upsert(initialRecord, { onConflict: 'user_id' })
        .select()
        .single();

      if (created) {
        return {
          id: created.id,
          user_id: created.user_id,
          current_balance: created.balance ?? 100,
          total_credits_issued: created.total_credits_issued ?? 100,
          total_credits_consumed: created.total_credits_consumed ?? 0,
          last_updated: created.last_updated || new Date().toISOString(),
        };
      }

      return {
        id: userId,
        user_id: userId,
        current_balance: 100,
        total_credits_issued: 100,
        total_credits_consumed: 0,
        last_updated: new Date().toISOString(),
      };
    } catch (e) {
      console.error('[USER CREDITS] Exception getting user credits:', e);
      return null;
    }
  }

  /**
   * Consumes user credits (e.g. for AI generation, video export).
   */
  public async consumeCredits(amount: number, reason: string): Promise<boolean> {
    if (amount <= 0) return true;
    try {
      const client = supabaseAdmin || supabase;
      if (!client) return false;

      const myCredits = await this.getMyCredits();
      if (!myCredits || myCredits.current_balance < amount) {
        throw new Error(`Insufficient credits available (${myCredits?.current_balance || 0} left).`);
      }

      const newBalance = myCredits.current_balance - amount;
      const newConsumed = myCredits.total_credits_consumed + amount;
      const nowIso = new Date().toISOString();

      await client.from('credits').update({
        balance: newBalance,
        current_balance: newBalance,
        total_credits_consumed: newConsumed,
        updated_at: nowIso,
        last_updated: nowIso,
      }).eq('user_id', myCredits.user_id);

      await client.from('credit_transactions').insert([{
        user_id: myCredits.user_id,
        amount: -amount,
        transaction_type: 'debit',
        reason,
        created_at: nowIso,
      }]);

      return true;
    } catch (e) {
      console.error('[USER CREDITS] Consume error:', e);
      return false;
    }
  }

  /**
   * Subscribes to real-time credit balance changes for user.
   */
  public subscribeToMyCredits(userId: string, onUpdate: (credits: UserCreditProfile) => void) {
    const client = supabaseAdmin || supabase;
    if (!client) return () => {};

    const channel = client
      .channel(`user_credits_${userId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'credits',
        filter: `user_id=eq.${userId}`,
      }, (payload) => {
        if (payload.new) {
          const row = payload.new as any;
          onUpdate({
            id: row.id,
            user_id: row.user_id,
            current_balance: row.balance ?? row.current_balance ?? 100,
            total_credits_issued: row.total_credits_issued ?? 100,
            total_credits_consumed: row.total_credits_consumed ?? 0,
            last_updated: row.last_updated || row.updated_at || new Date().toISOString(),
          });
        }
      })
      .subscribe();

    return () => {
      client.removeChannel(channel);
    };
  }
}

export const userCreditsService = new UserCreditsService();
export default userCreditsService;
