import { useState, useEffect, useCallback } from 'react';
export function useServerManagedDataTableSearch(delay = 400) {
  const [input, setInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(input), delay);
    return () => clearTimeout(t);
  }, [input, delay]);
  const handleSearch = useCallback((val: string) => setInput(val), []);
  const clearSearch = useCallback(() => { setInput(''); setDebouncedSearch(''); }, []);
  return { input, debouncedSearch, handleSearch, clearSearch };
}
