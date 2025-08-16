'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';

// Hook for managing search and filtering
export function useSearchFilter<T>(
  data: T[],
  searchFields: (keyof T)[],
  filterConfig?: {
    [key: string]: {
      field: keyof T;
      options: { label: string; value: string }[];
    };
  }
) {
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<{ [key: string]: string }>({});

  const filteredData = useMemo(() => {
    let result = [...data];

    // Apply search
    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter((item) =>
        searchFields.some((field) => {
          const value = item[field];
          return value && String(value).toLowerCase().includes(searchLower);
        })
      );
    }

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== 'all' && filterConfig?.[key]) {
        const { field } = filterConfig[key];
        result = result.filter((item) => {
          const itemValue = item[field];
          return String(itemValue) === value;
        });
      }
    });

    return result;
  }, [data, search, filters, searchFields, filterConfig]);

  const clearAll = useCallback(() => {
    setSearch('');
    setFilters({});
  }, []);

  const updateFilter = useCallback((key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  return {
    search,
    setSearch,
    filters,
    updateFilter,
    filteredData,
    clearAll,
  };
}

// Hook for managing pagination
export function usePagination<T>(data: T[], itemsPerPage: number = 10) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(data.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = data.slice(startIndex, endIndex);

  const goToPage = useCallback((page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  }, [totalPages]);

  const nextPage = useCallback(() => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  }, [currentPage, totalPages]);

  const prevPage = useCallback(() => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  }, [currentPage]);

  // Reset to first page when data changes
  useEffect(() => {
    setCurrentPage(1);
  }, [data.length]);

  return {
    currentPage,
    totalPages,
    paginatedData,
    goToPage,
    nextPage,
    prevPage,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1,
  };
}

// Hook for managing selection
export function useSelection<T>(data: T[], idField: keyof T = 'id' as keyof T) {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const toggleItem = useCallback((id: string) => {
    setSelectedItems(prev =>
      prev.includes(id)
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  }, []);

  const selectAll = useCallback(() => {
    setSelectedItems(data.map(item => String(item[idField])));
  }, [data, idField]);

  const deselectAll = useCallback(() => {
    setSelectedItems([]);
  }, []);

  const isSelected = useCallback((id: string) => {
    return selectedItems.includes(id);
  }, [selectedItems]);

  const isAllSelected = selectedItems.length === data.length && data.length > 0;
  const isIndeterminate = selectedItems.length > 0 && selectedItems.length < data.length;

  return {
    selectedItems,
    toggleItem,
    selectAll,
    deselectAll,
    isSelected,
    isAllSelected,
    isIndeterminate,
    selectedCount: selectedItems.length,
  };
}

// Hook for managing sorting
export function useSorting<T>(data: T[]) {
  const [sortField, setSortField] = useState<keyof T | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const sortedData = useMemo(() => {
    if (!sortField) return data;

    return [...data].sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];

      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      const comparison = String(aValue).localeCompare(String(bValue));
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [data, sortField, sortDirection]);

  const handleSort = useCallback((field: keyof T) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  }, [sortField]);

  return {
    sortedData,
    sortField,
    sortDirection,
    handleSort,
  };
}

// Hook for managing view modes (grid/list)
export function useViewMode() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const toggleViewMode = useCallback(() => {
    setViewMode(prev => prev === 'grid' ? 'list' : 'grid');
  }, []);

  return {
    viewMode,
    setViewMode,
    toggleViewMode,
  };
}

// Hook for managing modals
export function useModal() {
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen(prev => !prev), []);

  return {
    isOpen,
    open,
    close,
    toggle,
  };
}

// Hook for managing fullscreen
export function useFullscreen() {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(prev => !prev);
  }, []);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isFullscreen]);

  return {
    isFullscreen,
    toggleFullscreen,
  };
}

// Hook for managing loading states
export function useLoading(initialState = false) {
  const [isLoading, setIsLoading] = useState(initialState);

  const startLoading = useCallback(() => setIsLoading(true), []);
  const stopLoading = useCallback(() => setIsLoading(false), []);

  const withLoading = useCallback(async (fn: () => Promise<void>) => {
    startLoading();
    try {
      await fn();
    } finally {
      stopLoading();
    }
  }, [startLoading, stopLoading]);

  return {
    isLoading,
    setIsLoading,
    startLoading,
    stopLoading,
    withLoading,
  };
}

// Hook for managing errors
export function useError() {
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);
  const setErrorMessage = useCallback((message: string) => setError(message), []);

  return {
    error,
    setError: setErrorMessage,
    clearError,
  };
}
