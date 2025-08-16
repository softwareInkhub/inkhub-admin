import { useState, useRef, useEffect } from 'react';
import { ChevronUp, ChevronDown, Filter, X } from 'lucide-react';

interface ColumnHeaderProps {
  column: {
    key: string;
    label: string;
    sortable: boolean;
    filterable: boolean;
    filterType?: 'text' | 'select' | 'multi-select' | 'date';
    width?: string;
  };
  sortColumn: string;
  sortDirection: 'asc' | 'desc';
  onSort: (column: string) => void;
  filterValue: any;
  onFilterChange: (value: any) => void;
}

export const ColumnHeader = ({
  column,
  sortColumn,
  sortDirection,
  onSort,
  filterValue,
  onFilterChange
}: ColumnHeaderProps) => {
  const [showFilter, setShowFilter] = useState(false);
  const [localFilterValue, setLocalFilterValue] = useState(filterValue || '');
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setShowFilter(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSort = () => {
    if (column.sortable) {
      onSort(column.key);
    }
  };

  const handleFilterApply = () => {
    onFilterChange(localFilterValue);
    setShowFilter(false);
  };

  const handleFilterClear = () => {
    setLocalFilterValue('');
    onFilterChange('');
    setShowFilter(false);
  };

  const renderFilterInput = () => {
    switch (column.filterType) {
      case 'text':
        return (
          <input
            type="text"
            value={localFilterValue}
            onChange={(e) => setLocalFilterValue(e.target.value)}
            placeholder={`Filter ${column.label}...`}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleFilterApply();
              if (e.key === 'Escape') setShowFilter(false);
            }}
          />
        );
      
      case 'select':
        return (
          <select
            value={localFilterValue}
            onChange={(e) => setLocalFilterValue(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All</option>
            <option value="completed">Completed</option>
            <option value="in_progress">In Progress</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        );
      
      case 'date':
        return (
          <input
            type="date"
            value={localFilterValue}
            onChange={(e) => setLocalFilterValue(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <th className={`relative px-4 py-3 text-left text-sm font-medium text-gray-700 ${column.width || ''}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {column.sortable ? (
            <button
              onClick={handleSort}
              className="flex items-center gap-1 hover:text-gray-900 transition-colors"
            >
              <span>{column.label}</span>
              {sortColumn === column.key ? (
                sortDirection === 'asc' ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )
              ) : (
                <div className="h-4 w-4" />
              )}
            </button>
          ) : (
            <span>{column.label}</span>
          )}
        </div>
        
        {column.filterable && (
          <div className="relative" ref={filterRef}>
            <button
              onClick={() => setShowFilter(!showFilter)}
              className={`p-1 rounded transition-colors ${
                filterValue ? 'text-blue-600 bg-blue-50' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <Filter className="h-4 w-4" />
            </button>
            
            {showFilter && (
              <div 
                className="absolute top-full left-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-[9999]"
                style={{ zIndex: 9999 }}
              >
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-900">Filter {column.label}</h4>
                    <button
                      onClick={() => setShowFilter(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  
                  {renderFilterInput()}
                  
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={handleFilterApply}
                      className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
                    >
                      Apply
                    </button>
                    <button
                      onClick={handleFilterClear}
                      className="px-3 py-1 border border-gray-300 text-gray-700 rounded text-sm hover:bg-gray-50 transition-colors"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </th>
  );
};
