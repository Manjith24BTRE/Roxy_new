import { useState, useEffect, useCallback } from 'react';
import { usersService, UsersFetchOptions, UserModuleMetrics } from '../services/usersService';
import { User } from '../types';

export function useUsers(initialOptions: UsersFetchOptions = {}) {
  const [users, setUsers] = useState<User[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [metrics, setMetrics] = useState<UserModuleMetrics | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState<string>(initialOptions.search || '');
  const [page, setPage] = useState<number>(initialOptions.page || 1);
  const [limit, setLimit] = useState<number>(initialOptions.limit || 50);
  const [statusFilter, setStatusFilter] = useState<string>(initialOptions.statusFilter || 'All');
  const [planFilter, setPlanFilter] = useState<string>(initialOptions.planFilter || 'All');

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await usersService.getUsers({
        search: searchTerm,
        page,
        limit,
        statusFilter,
        planFilter,
      });

      setUsers(res.users);
      setTotalCount(res.totalCount);
      if (res.metrics) {
        setMetrics(res.metrics);
      }
    } catch (err: any) {
      console.error('Failed to fetch users:', err);
      setError(err.message || 'Failed to fetch platform users');
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, page, limit, statusFilter, planFilter]);

  // Debounced search and filter effect
  useEffect(() => {
    const handler = setTimeout(() => {
      fetchUsers();
    }, 300);

    return () => clearTimeout(handler);
  }, [fetchUsers]);

  // Real-time synchronization
  useEffect(() => {
    const unsubscribe = usersService.subscribeToUserChanges(() => {
      fetchUsers();
    });

    return () => {
      unsubscribe();
    };
  }, [fetchUsers]);

  return {
    users,
    totalCount,
    metrics,
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
    setLimit,
    statusFilter,
    setStatusFilter: (status: string) => {
      setStatusFilter(status);
      setPage(1);
    },
    planFilter,
    setPlanFilter: (plan: string) => {
      setPlanFilter(plan);
      setPage(1);
    },
    refresh: fetchUsers,
  };
}
