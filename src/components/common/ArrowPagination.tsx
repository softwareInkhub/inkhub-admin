import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ArrowPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  disabled?: boolean;
}

export default function ArrowPagination({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  disabled = false 
}: ArrowPaginationProps) {
  const handlePrevious = () => {
    if (currentPage > 1 && !disabled) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages && !disabled) {
      onPageChange(currentPage + 1);
    }
  };

  const isPreviousDisabled = currentPage <= 1 || disabled;
  const isNextDisabled = currentPage >= totalPages || disabled;

  return (
    <div className="flex items-center justify-center gap-2 mt-4">
      {/* Previous Arrow */}
      <button
        onClick={handlePrevious}
        disabled={isPreviousDisabled}
        className={`p-2 rounded-lg transition-colors ${
          isPreviousDisabled 
            ? 'text-gray-300 cursor-not-allowed' 
            : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
        }`}
        title="Previous page"
      >
        <ChevronLeft size={20} />
      </button>

      {/* Current Page Indicator */}
      <span className="text-sm text-gray-600 font-medium px-3">
        {currentPage} / {totalPages}
      </span>

      {/* Next Arrow */}
      <button
        onClick={handleNext}
        disabled={isNextDisabled}
        className={`p-2 rounded-lg transition-colors ${
          isNextDisabled 
            ? 'text-gray-300 cursor-not-allowed' 
            : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
        }`}
        title="Next page"
      >
        <ChevronRight size={20} />
      </button>
    </div>
  );
} 