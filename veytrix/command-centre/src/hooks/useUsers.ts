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
      });

      setUsers(res.users);
      setTotalCount(res.totalCount);
    } catch (err: any) {
      console.error('Failed to fetch users:', err);
      setError(err.message || 'Failed to fetch platform users');
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, page, limit]);

  // Debounced search effect
  useEffect(() => {
    const handler = setTimeout(() => {
      fetchUsers();
    }, 300);

    return () => clearTimeout(handler);
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
      setPage(1); // Reset to first page on search
    },
    page,
    setPage,
    limit,
    setLimit,
    statusFilter,
    setStatusFilter,
    planFilter,
    setPlanFilter,
    refresh: fetchUsers,
  };
}

