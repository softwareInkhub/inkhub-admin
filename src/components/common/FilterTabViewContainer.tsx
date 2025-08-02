'use client';
import React, { useState } from 'react';
import { Grid3X3, List, LayoutGrid, Eye, Filter, Settings } from 'lucide-react';

interface FilterTab {
  id: string;
  name: string;
  type: 'filter' | 'view' | 'category';
  active?: boolean;
  count?: number;
  icon?: React.ReactNode;
}

interface FilterTabViewContainerProps {
  tabs: FilterTab[];
  activeTabId?: string;
  onTabChange?: (tabId: string) => void;
  showViewButtons?: boolean;
  viewType?: 'table' | 'grid' | 'card' | 'list';
  onViewTypeChange?: (viewType: 'table' | 'grid' | 'card' | 'list') => void;
  showFilterButton?: boolean;
  onFilterClick?: () => void;
  showSettingsButton?: boolean;
  onSettingsClick?: () => void;
  showAllButton?: boolean;
  allButtonText?: string;
  className?: string;
}

export default function FilterTabViewContainer({
  tabs,
  activeTabId,
  onTabChange,
  showViewButtons = true,
  viewType = 'table',
  onViewTypeChange,
  showFilterButton = true,
  onFilterClick,
  showSettingsButton = false,
  onSettingsClick,
  showAllButton = true,
  allButtonText = 'ALL',
  className = '',
}: FilterTabViewContainerProps) {
  const [localViewType, setLocalViewType] = useState(viewType);

  const handleViewTypeChange = (newViewType: 'table' | 'grid' | 'card' | 'list') => {
    setLocalViewType(newViewType);
    onViewTypeChange?.(newViewType);
  };

  const getViewIcon = (type: 'table' | 'grid' | 'card' | 'list') => {
    switch (type) {
      case 'table':
        return <List size={16} />;
      case 'grid':
        return <Grid3X3 size={16} />;
      case 'card':
        return <LayoutGrid size={16} />;
      case 'list':
        return <List size={16} />;
      default:
        return <List size={16} />;
    }
  };

  // Calculate total count for ALL button
  const totalCount = tabs.reduce((sum, tab) => sum + (tab.count || 0), 0);

  return (
    <div className={`modern-card ${className}`}>
      {/* Compact Filter Tabs Section */}
      <div className="px-4 py-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* ALL Button */}
          {showAllButton && (
            <button
              onClick={() => onTabChange?.('all')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg border font-medium text-sm transition-all duration-200 ${
                activeTabId === 'all' || !activeTabId
                  ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                  : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
              }`}
            >
              <span>{allButtonText}</span>
              {totalCount > 0 && (
                <span className={`px-1.5 py-0.5 text-xs rounded-full ${
                  activeTabId === 'all' || !activeTabId
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
                }`}>
                  {totalCount}
                </span>
              )}
            </button>
          )}

          {/* Filter Tabs */}
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange?.(tab.id)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg border font-medium text-sm transition-all duration-200 ${
                activeTabId === tab.id
                  ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                  : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
              }`}
            >
              {tab.icon && <span className="text-gray-500">{tab.icon}</span>}
              <span>{tab.name}</span>
              {tab.count && (
                <span className={`px-1.5 py-0.5 text-xs rounded-full ${
                  activeTabId === tab.id
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}

          {/* Action Buttons */}
          <div className="flex items-center space-x-1 ml-auto">
            {showFilterButton && (
              <button
                onClick={onFilterClick}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title="Filter Options"
              >
                <Filter size={16} />
              </button>
            )}
            
            {showSettingsButton && (
              <button
                onClick={onSettingsClick}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title="Settings"
              >
                <Settings size={16} />
              </button>
            )}
          </div>
        </div>

        {/* View Type Buttons */}
        {showViewButtons && (
          <div className="flex items-center space-x-1 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400 mr-2">
              View:
            </span>
            {(['table', 'grid', 'card', 'list'] as const).map((type) => (
              <button
                key={type}
                onClick={() => handleViewTypeChange(type)}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  localViewType === type
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                title={`${type.charAt(0).toUpperCase() + type.slice(1)} View`}
              >
                {getViewIcon(type)}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 