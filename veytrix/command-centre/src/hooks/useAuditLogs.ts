import { useState, useEffect, useCallback } from 'react';
import { auditLogsService, AuditLogsFetchOptions } from '../services/auditLogsService';
import { AuditEvent } from '../types';

export function useAuditLogs(initialOptions: AuditLogsFetchOptions = {}) {
  const [logs, setLogs] = useState<AuditEvent[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState<string>(initialOptions.search || '');
  const [page, setPage] = useState<number>(initialOptions.page || 1);
  const [limit] = useState<number>(initialOptions.limit || 10);

  const fetchLogs = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Future RBAC Gate Placeholder: checkPermission('audit.read')
      const res = await auditLogsService.getLogs({
        search: searchTerm,
        page,
        limit,
      });
      setLogs(res.logs);
      setTotalCount(res.totalCount);
    } catch (err: any) {
      console.error('Failed to fetch audit logs:', err);
      setError(err.message || 'Failed to fetch security audit logs');
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, page, limit]);

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchLogs();
    }, 300);

    return () => clearTimeout(handler);
  }, [fetchLogs]);

  return {
    logs,
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
    refresh: fetchLogs,
  };
}
