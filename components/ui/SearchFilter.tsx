'use client';

import { useState, useEffect } from 'react';
import { Search, X, Filter, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FilterOption {
  label: string;
  value: string;
}

interface SearchFilterProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  filters?: {
    [key: string]: {
      label: string;
      value: string;
      options: FilterOption[];
      onChange: (value: string) => void;
    };
  };
  onClearAll?: () => void;
  placeholder?: string;
  className?: string;
  showClearButton?: boolean;
  showFilterIndicators?: boolean;
}

export function SearchFilter({
  searchValue,
  onSearchChange,
  filters = {},
  onClearAll,
  placeholder = 'Search...',
  className,
  showClearButton = true,
  showFilterIndicators = true,
}: SearchFilterProps) {
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [activeFilters, setActiveFilters] = useState<{ [key: string]: string }>({});

  // Track active filters
  useEffect(() => {
    const active: { [key: string]: string } = {};
    Object.entries(filters).forEach(([key, filter]) => {
      if (filter.value && filter.value !== 'all') {
        active[key] = filter.value;
      }
    });
    setActiveFilters(active);
  }, [filters]);

  const activeFilterCount = Object.keys(activeFilters).length + (searchValue ? 1 : 0);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onSearchChange('');
    }
  };

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        const searchInput = document.querySelector('[data-search-input]') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
        }
      }
    };

    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => document.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  return (
    <div className={cn('space-y-4', className)}>
      {/* Search and Filters Row */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search Input */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary-400" />
          <input
            data-search-input
            type="text"
            placeholder={placeholder}
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            onKeyDown={handleKeyDown}
            className={cn(
              'w-full pl-10 pr-10 py-2 border border-secondary-200 rounded-lg',
              'focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
              'bg-white dark:bg-secondary-800 dark:border-secondary-700',
              'text-secondary-900 dark:text-secondary-100',
              'transition-all duration-200',
              isSearchFocused && 'ring-2 ring-primary-500 border-primary-500'
            )}
          />
          {showClearButton && searchValue && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-secondary-100 rounded"
            >
              <X className="h-4 w-4 text-secondary-400" />
            </button>
          )}
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap gap-2">
          {Object.entries(filters).map(([key, filter]) => (
            <div key={key} className="relative">
              <select
                value={filter.value}
                onChange={(e) => filter.onChange(e.target.value)}
                className={cn(
                  'appearance-none pl-3 pr-8 py-2 border border-secondary-200 rounded-lg',
                  'focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
                  'bg-white dark:bg-secondary-800 dark:border-secondary-700',
                  'text-secondary-900 dark:text-secondary-100',
                  'transition-all duration-200 hover-lift'
                )}
              >
                {filter.options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-secondary-400 pointer-events-none" />
            </div>
          ))}

          {/* Clear All Button */}
          {onClearAll && activeFilterCount > 0 && (
            <button
              onClick={onClearAll}
              className="px-3 py-2 text-sm text-secondary-600 hover:text-secondary-900 dark:text-secondary-400 dark:hover:text-secondary-100 transition-colors"
            >
              Clear all
            </button>
          )}
        </div>
      </div>

      {/* Filter Indicators */}
      {showFilterIndicators && activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {searchValue && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
              Search: "{searchValue}"
            </span>
          )}
          {Object.entries(activeFilters).map(([key, value]) => {
            const filter = filters[key];
            const option = filter?.options.find(opt => opt.value === value);
            return (
              <span
                key={key}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-secondary-100 text-secondary-800 dark:bg-secondary-700 dark:text-secondary-200"
              >
                {filter?.label}: {option?.label || value}
              </span>
            );
          })}
          <span className="text-sm text-secondary-600 dark:text-secondary-400">
            {activeFilterCount} filter{activeFilterCount !== 1 ? 's' : ''} active
          </span>
        </div>
      )}
    </div>
  );
}
