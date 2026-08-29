import { CreditTransaction } from '../types';

export interface CreditEconomyMetrics {
  totalCreditsIssued: number;
  totalCreditsConsumed: number;
  outstandingBalance: number;
  recentTransactions: CreditTransaction[];
  topConsumers: Array<{
    userId: string;
    creditsUsed: number;
  }>;
}

export const creditsService = {
  /**
   * Static Credit Economy configuration.
   */
  async getCreditMetrics(): Promise<CreditEconomyMetrics> {
    return {
      totalCreditsIssued: 45200000,
      totalCreditsConsumed: 32800000,
      outstandingBalance: 12400000,
      recentTransactions: [
        { id: 'ctx_1', userId: 'alice@example.com', transactionId: 'tx_101', credits: 500, type: 'Credit', reason: 'Monthly Plan Renew', date: '2025-08-26T10:00:00Z' },
        { id: 'ctx_2', userId: 'bob@example.com', transactionId: 'tx_102', credits: -15, type: 'Debit', reason: 'AI Model Inference (GPT-4o)', date: '2025-08-26T11:20:00Z' },
        { id: 'ctx_3', userId: 'charlie@example.com', transactionId: 'tx_103', credits: -250, type: 'Debit', reason: 'Batch AI Job', date: '2025-08-26T12:05:00Z' },
        { id: 'ctx_4', userId: 'diana@example.com', transactionId: 'tx_104', credits: 10000, type: 'Credit', reason: 'Enterprise Top-up', date: '2025-08-25T09:00:00Z' },
      ],
      topConsumers: [
        { userId: 'bob@example.com', creditsUsed: 15400 },
        { userId: 'charlie@example.com', creditsUsed: 9800 },
        { userId: 'diana@example.com', creditsUsed: 4200 },
      ],
    };
  },
};
