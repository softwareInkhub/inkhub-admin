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
    <div className="flex flex-row items-center w-full gap-2 px-2 py-1">
      {/* All tab/button - No edit functionality */}
      <button
        className={`px-4 py-2.5 rounded-lg border font-medium text-sm transition-all duration-200 ${
          !activeFilterId 
            ? 'bg-blue-600 text-white border-blue-600 shadow-sm' 
            : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100 hover:border-gray-300'
        }`}
        onClick={() => onSelect?.(null)}
      >
        All
      </button>
      
      {/* Filter tabs with edit functionality */}
      {savedFilters.map((filter) => (
        <div key={filter.id} className="relative group">
          <button
            className={`px-4 py-2.5 rounded-lg border font-medium text-sm transition-all duration-200 flex items-center gap-2 ${
              activeFilterId === filter.id 
                ? 'bg-blue-600 text-white border-blue-600 shadow-sm' 
                : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100 hover:border-gray-300'
            }`}
            onClick={() => onSelect?.(filter)}
          >
            <span className="font-medium">{filter.filterName || 'Unnamed'}</span>
            {/* Edit button - appears on hover */}
            <button
              className={`ml-1 p-1 rounded-md transition-all duration-200 ${
                activeFilterId === filter.id 
                  ? 'text-white hover:bg-blue-700' 
                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-200'
              } opacity-0 group-hover:opacity-100`}
              onClick={(e) => {
                e.stopPropagation(); // Prevent triggering the parent button
                onEdit?.(filter);
              }}
              title="Edit filter"
            >
              <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </button>
        </div>
      ))}
    </div>
  );
} 