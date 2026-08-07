import React from 'react';

type SavedFilter = {
  id: string;
  filterName?: string;
  [key: string]: any;
};

type ViewsBarProps = {
  savedFilters?: SavedFilter[];
  onSelect?: (filter: SavedFilter | null) => void;
  onEdit?: (filter: SavedFilter) => void;
  activeFilterId?: string;
};

export default function ViewsBar({ savedFilters = [], onSelect, onEdit, activeFilterId }: ViewsBarProps) {
  if (!savedFilters.length) return null;
  
  return (
    <div className="bg-[#f5f6fa] border border-[#e5e7eb] rounded-xl px-2 py-2 flex items-center w-full gap-2">
      {/* All tab/button - No edit functionality */}
      <button
        className={`px-4 py-2.5 rounded-lg border font-medium text-sm transition-all duration-200 ${
          !activeFilterId 
            ? 'bg-blue-600 text-white border-blue-600 shadow-sm' 
            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
        }`}
        onClick={() => onSelect?.(null)}
      >
        All
      </button>
      {savedFilters.map((filter) => (
          <button
          key={filter.id}
          className={`group relative px-4 py-2.5 rounded-lg border font-medium text-sm transition-all duration-200 flex items-center justify-between gap-2 ${
              activeFilterId === filter.id 
              ? 'bg-white text-gray-900 border-gray-300 shadow-sm'
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
            onClick={() => onSelect?.(filter)}
          >
          <span>{filter.filterName || `Filter ${filter.id}`}</span>
          <div
              onClick={(e) => {
              e.stopPropagation(); // Prevent button click from triggering parent button
                onEdit?.(filter);
              }}
            className={`ml-2 p-1 rounded-full transition-colors ${
              activeFilterId === filter.id
                ? 'bg-blue-100 hover:bg-blue-200 text-blue-600'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
            } cursor-pointer`}
            aria-label={`Edit filter ${filter.filterName || filter.id}`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-4 h-4"
            >
              <path d="M5.433 13.917l1.262-3.155A4 4 0 017.58 9.42l6.92-6.918a2.121 2.121 0 013 3L10.58 12.42a4 4 0 01-1.177 1.262l-3.155 1.262a.5.5 0 01-.65-.65z" />
              <path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0010 3H4.75A2.75 2.75 0 002 5.75v9.5A2.75 2.75 0 004.75 18h9.5A2.75 2.75 0 0017.25 15.25V10a.75.75 0 00-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5z" />
              </svg>
          </div>
          </button>
      ))}
    </div>
  );
} 