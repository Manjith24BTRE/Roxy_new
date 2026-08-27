import { useState, useEffect, useCallback } from 'react';
import { dashboardService, DashboardMetrics } from '../services/dashboardService';

export function useDashboard() {
  const [data, setData] = useState<DashboardMetrics | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Future RBAC Gate Placeholder: checkPermission('dashboard.read')
      const metrics = await dashboardService.getMetrics();
      setData(metrics);
    } catch (err: any) {
      console.error('Failed to load dashboard metrics:', err);
      setError(err.message || 'Failed to fetch dashboard metrics');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  return {
    data,
    isLoading,
    error,
    refresh: fetchMetrics,
  };
}
