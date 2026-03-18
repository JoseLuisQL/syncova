import { useEffect, useRef, useState } from 'react';

interface UseInventorySearchOptions {
  onSearch: (value: string) => Promise<void> | void;
  onReset: () => Promise<void> | void;
  delay?: number;
}

export const useInventorySearch = ({
  onSearch,
  onReset,
  delay = 320,
}: UseInventorySearchOptions) => {
  const [searchValue, setSearchValue] = useState('');
  const firstRunRef = useRef(true);
  const searchRef = useRef(onSearch);
  const resetRef = useRef(onReset);

  useEffect(() => {
    searchRef.current = onSearch;
  }, [onSearch]);

  useEffect(() => {
    resetRef.current = onReset;
  }, [onReset]);

  useEffect(() => {
    if (firstRunRef.current) {
      firstRunRef.current = false;
      return;
    }

    const timeoutId = window.setTimeout(() => {
      const trimmed = searchValue.trim();
      if (trimmed) {
        void searchRef.current(trimmed);
        return;
      }

      void resetRef.current();
    }, delay);

    return () => window.clearTimeout(timeoutId);
  }, [delay, searchValue]);

  return {
    searchValue,
    setSearchValue,
    clearSearch: () => setSearchValue(''),
  };
};

export default useInventorySearch;
