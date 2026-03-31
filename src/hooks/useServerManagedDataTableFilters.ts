import { useState, useCallback } from 'react';
export function useServerManagedDataTableFilters<T extends Record<string, string>>(initial: T) {
  const [filters, setFilters] = useState<T>(initial);
  const setFilter = useCallback((key: keyof T, value: string) => setFilters(f => ({ ...f, [key]: value })), []);
  const resetFilters = useCallback(() => setFilters(initial), [initial]);
  return { filters, setFilter, resetFilters };
}
