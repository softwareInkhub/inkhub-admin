import React from 'react';

type SavedFilter = {
  id: string;
  filterName?: string;
  [key: string]: any;
};

type ViewsBarProps = {
  savedFilters?: SavedFilter[];
  onSelect?: (filter: SavedFilter) => void;
  activeFilterId?: string;
};

export default function ViewsBar({ savedFilters = [], onSelect, activeFilterId }: ViewsBarProps) {
  if (!savedFilters.length) return null;
  
  return (
    <div className="flex flex-row items-center w-full mb-2 gap-2">
      {savedFilters.map((filter) => (
        <button
          key={filter.id}
          className={`px-4 py-2 rounded border font-semibold ${activeFilterId === filter.id ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
          onClick={() => onSelect?.(filter)}
        >
          {filter.filterName || 'Unnamed'}
        </button>
      ))}
    </div>
  );
} 