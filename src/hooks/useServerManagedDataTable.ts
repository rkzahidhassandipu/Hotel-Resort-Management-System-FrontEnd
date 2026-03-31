import { useState, useCallback } from 'react';
export interface TableState { page: number; limit: number; search: string; sortBy?: string; sortDir: 'asc' | 'desc'; }
export function useServerManagedDataTable(initial?: Partial<TableState>) {
  const [state, setState] = useState<TableState>({ page: 1, limit: 10, search: '', sortDir: 'asc', ...initial });
  const setPage   = useCallback((page: number) => setState(s => ({ ...s, page })), []);
  const setSearch = useCallback((search: string) => setState(s => ({ ...s, search, page: 1 })), []);
  const setLimit  = useCallback((limit: number) => setState(s => ({ ...s, limit, page: 1 })), []);
  const setSort   = useCallback((sortBy: string) => setState(s => ({ ...s, sortBy, sortDir: s.sortBy === sortBy && s.sortDir === 'asc' ? 'desc' : 'asc' })), []);
  return { ...state, setPage, setSearch, setLimit, setSort };
}
