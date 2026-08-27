import { useState, useEffect, useCallback } from 'react';
import { aiJobsService, AIJobsFetchOptions } from '../services/aiJobsService';
import { AIJob } from '../types';

export function useAIJobs(initialOptions: AIJobsFetchOptions = {}) {
  const [jobs, setJobs] = useState<AIJob[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState<string>(initialOptions.search || '');
  const [page, setPage] = useState<number>(initialOptions.page || 1);
  const [limit] = useState<number>(initialOptions.limit || 10);
  const [statusFilter, setStatusFilter] = useState<string>(initialOptions.status || 'All');

  const fetchJobs = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Future RBAC Gate Placeholder: checkPermission('ai.jobs.read')
      const res = await aiJobsService.getJobs({
        search: searchTerm,
        status: statusFilter,
        page,
        limit,
      });
      setJobs(res.jobs);
      setTotalCount(res.totalCount);
    } catch (err: any) {
      console.error('Failed to fetch AI jobs:', err);
      setError(err.message || 'Failed to fetch AI jobs queue');
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, statusFilter, page, limit]);

  // Initial fetch and search effect
  useEffect(() => {
    const handler = setTimeout(() => {
      fetchJobs();
    }, 300);

    return () => clearTimeout(handler);
  }, [fetchJobs]);

  // Supabase Realtime Subscription for automatic queue updates
  useEffect(() => {
    const unsubscribe = aiJobsService.subscribeToJobs((payload) => {
      console.log('Realtime AI Job payload received:', payload);
      // Trigger instant refresh on realtime change
      fetchJobs();
    });

    return () => {
      unsubscribe();
    };
  }, [fetchJobs]);

  return {
    jobs,
    totalCount,
    isLoading,
    error,
    searchTerm,
    setSearchTerm: (term: string) => {
      setSearchTerm(term);
      setPage(1);
    },
    page,
    setPage,
    limit,
    statusFilter,
    setStatusFilter,
    refresh: fetchJobs,
  };
}
