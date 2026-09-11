export class BillingMiddleware {
  static async executeWithBilling(options: {
    userId: string;
    commandType: string;
    amount?: number;
    actionRunner: () => any;
  }): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const data = await options.actionRunner();
      return { success: true, data };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Execution error' };
    }
  }
}
