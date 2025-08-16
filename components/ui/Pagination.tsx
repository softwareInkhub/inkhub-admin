'use client';

import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  itemsPerPage?: number;
  showItemsInfo?: boolean;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage,
  showItemsInfo = true,
  className,
}: PaginationProps) {
  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  const startItem = totalItems && itemsPerPage ? (currentPage - 1) * itemsPerPage + 1 : null;
  const endItem = totalItems && itemsPerPage ? Math.min(currentPage * itemsPerPage, totalItems) : null;

  return (
    <div className={cn('flex items-center justify-between', className)}>
      {/* Items Info */}
      {showItemsInfo && totalItems && (
        <div className="text-sm text-secondary-600 dark:text-secondary-400">
          Showing {startItem} to {endItem} of {totalItems} results
        </div>
      )}

      {/* Pagination Controls */}
      <div className="flex items-center space-x-1">
        {/* Previous Button */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={cn(
            'inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 hover-lift',
            'bg-white text-secondary-700 border border-secondary-300 hover:bg-secondary-50',
            'focus:ring-2 focus:ring-primary-500',
            'dark:bg-secondary-800 dark:text-secondary-200 dark:border-secondary-600 dark:hover:bg-secondary-700',
            currentPage === 1 && 'opacity-50 cursor-not-allowed'
          )}
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          Previous
        </button>

        {/* Page Numbers */}
        <div className="flex items-center space-x-1">
          {getVisiblePages().map((page, index) => (
            <div key={index}>
              {page === '...' ? (
                <span className="px-3 py-2 text-sm text-secondary-500">
                  <MoreHorizontal className="h-4 w-4" />
                </span>
              ) : (
                <button
                  onClick={() => onPageChange(page as number)}
                  className={cn(
                    'inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 hover-lift',
                    page === currentPage
                      ? 'bg-primary-600 text-white'
                      : 'bg-white text-secondary-700 border border-secondary-300 hover:bg-secondary-50 dark:bg-secondary-800 dark:text-secondary-200 dark:border-secondary-600 dark:hover:bg-secondary-700'
                  )}
                >
                  {page}
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Next Button */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={cn(
            'inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 hover-lift',
            'bg-white text-secondary-700 border border-secondary-300 hover:bg-secondary-50',
            'focus:ring-2 focus:ring-primary-500',
            'dark:bg-secondary-800 dark:text-secondary-200 dark:border-secondary-600 dark:hover:bg-secondary-700',
            currentPage === totalPages && 'opacity-50 cursor-not-allowed'
          )}
        >
          Next
          <ChevronRight className="ml-1 h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

// Simple pagination for basic use cases
interface SimplePaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function SimplePagination({
  currentPage,
  totalPages,
  onPageChange,
  className,
}: SimplePaginationProps) {
  return (
    <div className={cn('flex items-center justify-center space-x-2', className)}>
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={cn(
          'inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 hover-lift',
          'bg-white text-secondary-700 border border-secondary-300 hover:bg-secondary-50',
          'focus:ring-2 focus:ring-primary-500',
          'dark:bg-secondary-800 dark:text-secondary-200 dark:border-secondary-600 dark:hover:bg-secondary-700',
          currentPage === 1 && 'opacity-50 cursor-not-allowed'
        )}
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      <span className="px-3 py-2 text-sm text-secondary-600 dark:text-secondary-400">
        Page {currentPage} of {totalPages}
      </span>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={cn(
          'inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 hover-lift',
          'bg-white text-secondary-700 border border-secondary-300 hover:bg-secondary-50',
          'focus:ring-2 focus:ring-primary-500',
          'dark:bg-secondary-800 dark:text-secondary-200 dark:border-secondary-600 dark:hover:bg-secondary-700',
          currentPage === totalPages && 'opacity-50 cursor-not-allowed'
        )}
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}
