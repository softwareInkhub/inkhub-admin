import React from 'react';
import FilterTabViewContainer from './FilterTabViewContainer';

type SavedFilter = {
  id: string;
  filterName?: string;
  [key: string]: any;
};

type ViewsBarProps = {
  savedFilters?: SavedFilter[];
  onSelect?: (filter: SavedFilter) => void;
  activeFilterId?: string;
  showViewButtons?: boolean;
  viewType?: 'table' | 'grid' | 'card' | 'list';
  onViewTypeChange?: (viewType: 'table' | 'grid' | 'card' | 'list') => void;
  className?: string;
};

export default function ViewsBar({ 
  savedFilters = [], 
  onSelect, 
  activeFilterId,
  showViewButtons = false,
  viewType = 'table',
  onViewTypeChange,
  className = ''
}: ViewsBarProps) {
  if (!savedFilters.length && !showViewButtons) return null;
  
  // Convert saved filters to filter tabs format
  const filterTabs = savedFilters.map((filter) => ({
    id: filter.id,
    name: filter.filterName || 'Unnamed',
    type: 'filter' as const,
    active: activeFilterId === filter.id,
    count: filter.count || 0
  }));

  const handleTabChange = (tabId: string) => {
    const filter = savedFilters.find(f => f.id === tabId);
    if (filter && onSelect) {
      onSelect(filter);
    }
  };

  return (
    <FilterTabViewContainer
      tabs={filterTabs}
      activeTabId={activeFilterId}
      onTabChange={handleTabChange}
      showViewButtons={showViewButtons}
      viewType={viewType}
      onViewTypeChange={onViewTypeChange}
      showFilterButton={false}
      showSettingsButton={false}
      className={className}
    />
  );
} 