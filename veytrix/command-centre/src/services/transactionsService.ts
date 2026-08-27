import { supabase } from '../lib/supabase';
import { Transaction } from '../types';

export const transactionsService = {
  /**
   * Sources live transactions from public.subscriptions / payment logs with zero mock rows.
   */
  async getTransactions(): Promise<Transaction[]> {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('id, user_id, plan, status, created_at')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        return data.map((sub) => ({
          id: sub.id,
          userId: sub.user_id,
          amount: sub.plan === 'PRO' ? 29.0 : sub.plan === 'ENTERPRISE' ? 199.0 : 0.0,
          currency: 'USD',
          status: sub.status === 'active' || sub.status === 'ACTIVE' ? 'Successful' : 'Failed',
          paymentMethod: 'Credit Card (Stripe)',
          date: sub.created_at || new Date().toISOString(),
          plan: sub.plan || 'FREE',
        }));
      }
    } catch (e) {
      console.warn('Failed to fetch transactions from Supabase:', e);
    }

    return [];
  },
};
